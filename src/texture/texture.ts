import { Uint32, Int32 } from "../util/type";

export class Texture {
    constructor(public w: Uint32, public h: Uint32, public p: Int32, public c: Int32) {}

    copyDataFrom(src: Texture) {}
    readData(bitSize: Int32) {}
    genBindless() {}
    releaseBindless() {}
}
