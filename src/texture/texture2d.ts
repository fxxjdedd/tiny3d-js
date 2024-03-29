import { Int32, Uint32 } from "../util/type";
import { Texture } from "./texture";

export enum TEXTURE_TYPE {
    COLOR = 1,
    DEPTH,
    ANIME,
}

export function getColorAttachment(i: number) {
    const num = i < 10 ? "00" + i : "0" + i;
    return "COLOR_ATTACHMENT" + num;
}

export class Texture2D extends Texture {
    constructor(
        w: Uint32,
        h: Uint32,
        useMip: boolean,
        t: Int32,
        p: Int32,
        c: Int32,
        filter: Int32,
        wrapMode: Int32,
        clearWhite = true,
        initData?: ArrayBufferView
    ) {
        super(w, h, p, c);
    }
}
