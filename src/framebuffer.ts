import { Texture } from "./texture/texture";
import { Float32, Int32 } from "./util/type";
import { CubeMap } from "./texture/cubemap";
import { TEXTURE_TYPE, Texture2D } from "./texture/texture2d";

export class FrameBuffer {
    fboId: WebGLFramebuffer;
    colorBuffers: Texture[];
    depthBuffer: Texture | null;
    private colorRefs: boolean[] = [];
    private depthOnly: boolean;
    private depthRef: boolean;
    private readOnly: boolean;
    private wrapMode: Int32;

    private cubeBuffer: CubeMap | null = null;
    constructor(cube: CubeMap);
    constructor(width: Float32, height: Float32);
    constructor(width: Float32, height: Float32, precision: Int32);
    constructor(
        width: Float32,
        height: Float32,
        precision: Int32,
        component: Int32,
        wrap: Int32,
        filt: Int32
    );
    constructor(
        public width: Float32 | CubeMap,
        public height?: Float32,
        precision?: Int32,
        component?: Int32,
        wrap?: Int32,
        filt?: Int32
    ) {
        const gl = window.gl;
        this.fboId = gl.createFramebuffer()!;
        this.wrapMode = wrap!;
        this.colorBuffers = [];
        this.colorBuffers = [];
        this.depthBuffer = null;

        switch (arguments.length) {
            case 1: {
                const cubemap = width as CubeMap;
                if (!cubemap.finished) {
                    throw new Error("Cubemap not loaded");
                }
                this.depthOnly = false;
                this.depthRef = false;
                this.readOnly = false;
                this.cubeBuffer = cubemap;
                this.width = this.cubeBuffer.width;
                this.height = this.cubeBuffer.height;
                break;
            }
            case 2:
                this.depthOnly = true;
                this.depthRef = false;
                this.readOnly = false;
                break;
            case 3:
                this.depthOnly = true;
                this.depthRef = false;
                this.readOnly = false;
                this.attachDepthBuffer(precision!, false);
                break;
            case 6:
                this.depthOnly = false;
                this.depthRef = false;
                this.readOnly = false;
                this.addColorBuffer(precision!, component!, filt!);
                break;
            default:
        }
    }

    addColorBuffer(precision: Int32, component: Int32, filt: Int32) {
        this.depthOnly = false;
        this.colorBuffers.push(
            new Texture2D(
                this.width as number,
                this.height!,
                false,
                TEXTURE_TYPE.COLOR,
                precision,
                component,
                filt,
                this.wrapMode
            )
        );
        this.colorRefs.push(false);
    }
    attachDepthBuffer(precision: Int32, useMip: boolean) {}
    addColorRef() {}
    setDepthBuffer() {}
    getColorBuffer(n: Int32) {}
    getDepthBuffer() {}
    use() {}
}
