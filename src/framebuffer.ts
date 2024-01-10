import { Texture } from "./texture/texture";
import { Float32, Int32 } from "./util/type";
import { CubeMap } from "./texture/cubemap";
import { TEXTURE_TYPE, Texture2D, getColorAttachment } from "./texture/texture2d";
import { NEAREST } from "./constants";

export class FrameBuffer {
    fboId: WebGLFramebuffer;
    colorBuffers: Texture[];
    depthBuffer: Texture | null;
    private colorRefs: boolean[] = [];
    private depthOnly!: boolean;
    private depthRef!: boolean;
    private readOnly!: boolean;
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

    attachDepthBuffer(precision: Int32, useMip: boolean) {
        const gl = window.gl;
        this.depthBuffer = new Texture2D(
            this.width as number,
            this.height!,
            useMip,
            TEXTURE_TYPE.DEPTH,
            precision,
            4,
            gl.NEAREST,
            gl.CLAMP_TO_EDGE, // webgl does not support CLAMP_TO_BORDER
            true
        );
        // TODO: drawBuffer/readBuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            this.depthBuffer.id,
            0
        );
    }

    setDepthBuffer(depthTex: Texture) {
        this.depthBuffer = depthTex;
        this.depthRef = true;
        const gl = window.gl;
        // TODO: drawBuffer/readBuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            this.depthBuffer.id,
            0
        );
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

    addColorRef(colorTex: Texture) {
        this.depthOnly = false;
        this.colorBuffers.push(colorTex);
        this.colorRefs.push(true);
        const gl = window.gl;
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            (gl as any)[getColorAttachment(this.colorBuffers.length - 1)],
            gl.TEXTURE_2D,
            colorTex.id,
            0
        );
        gl.drawBuffers(this.getColorAttachments(gl));
    }
    getColorBuffer(n: Int32) {
        return this.colorBuffers[n] || null;
    }
    getDepthBuffer() {
        return this.depthBuffer;
    }
    getCubeBuffer() {
        return this.cubeBuffer;
    }
    use() {
        const gl = window.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboId);

        let clearMask: number = gl.COLOR_BUFFER_BIT;
        if (this.depthOnly) {
            clearMask = gl.DEPTH_BUFFER_BIT;
        } else if (this.depthBuffer) {
            clearMask |= gl.DEPTH_BUFFER_BIT;
        }

        if (!this.readOnly) gl.clear(clearMask);
        gl.viewport(0, 0, this.width as number, this.height!);
    }

    useFbo() {
        const gl = window.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboId);
    }

    useCube(i: Int32, mip: Int32) {
        const gl = window.gl;
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
            this.cubeBuffer!.id,
            mip
        );
        if (!this.readOnly) gl.clear(gl.COLOR_BUFFER_BIT);
        let mipWidth = this.width as number;
        let mipHeight = this.height!;
        if (mip > 0) {
            mipWidth = (this.width as number) * Math.pow(0.5, mip);
            mipHeight = this.height! * Math.pow(0.5, mip);
        }
        gl.viewport(0, 0, mipWidth, mipHeight);
    }

    private getColorAttachments(gl: any) {
        return Array.from(Array(this.colorBuffers.length), (_, i) => {
            return gl[getColorAttachment(i)];
        });
    }
}
