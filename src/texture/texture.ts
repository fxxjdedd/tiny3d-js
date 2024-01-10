import { Uint32, Int32 } from "../util/type";

export class Texture {
    id: WebGLTexture;
    constructor(public w: Uint32, public h: Uint32, public p: Int32, public c: Int32) {
        const gl = window.gl;
        this.id = gl.createTexture()!;
    }

    copyDataFrom(src: Texture) {}
    readData(bitSize: Int32) {}
    genBindless() {}
    releaseBindless() {}
}
