import { AsyncResource } from "../util/async";
import { ImageLoader } from "./imageloader";

export class CubeMap extends AsyncResource<void> {
    xposImg: ImageLoader;
    xnegImg: ImageLoader;
    yposImg: ImageLoader;
    ynegImg: ImageLoader;
    zposImg: ImageLoader;
    znegImg: ImageLoader;
    width!: number;
    height!: number;
    useMip: boolean;
    id!: WebGLTexture;
    constructor(
        xpos: string,
        xneg: string,
        ypos: string,
        yneg: string,
        zpos: string,
        zneg: string,
        useMip: boolean
    ) {
        super();
        this.xposImg = new ImageLoader(xpos);
        this.xnegImg = new ImageLoader(xneg);
        this.yposImg = new ImageLoader(ypos);
        this.ynegImg = new ImageLoader(yneg);
        this.zposImg = new ImageLoader(zpos);
        this.znegImg = new ImageLoader(zneg);
        this.useMip = useMip;
    }

    async load() {
        const imageDatas = await Promise.all([
            this.xposImg.load(),
            this.xnegImg.load(),
            this.yposImg.load(),
            this.ynegImg.load(),
            this.zposImg.load(),
            this.znegImg.load(),
        ]);
        const gl = window.gl;
        this.id = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, id);

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        const labels = [
            "POSITIVE_X",
            "NEGATIVE_X",
            "POSITIVE_Y",
            "NEGATIVE_Y",
            "POSITIVE_Z",
            "NEGATIVE_Z",
        ];

        imageDatas.forEach((imageData, index) => {
            gl.texImage2D(
                (gl as any)[`TEXTURE_CUBE_MAP_${labels[index]}`],
                0,
                gl.SRGB8_ALPHA8, // webgl2 does not support unsized sRGBA: https://stackoverflow.com/questions/43986061/why-srgb-extension-has-lost-a-constant
                imageData.width,
                imageData.height,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                imageData.data
            );
        });

        if (this.useMip) {
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        }

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, 0);
        this.defer.resolve(void 0);
    }
}
