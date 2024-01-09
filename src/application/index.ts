import { Config } from "../config";
import { FrameBuffer } from "../framebuffer";
import { Render } from "../render/render";
import { RenderManager } from "../render/renderManager";
import { Scene } from "../scene";

export class Application {
    screen!: FrameBuffer;

    constructor(
        public config: Config,
        public scene: Scene,
        public render: Render,
        public renderManager: RenderManager
    ) {}

    draw() {
        this.render.setFrameBuffer();
        this.renderManager.renderScene();
        this.renderManager.renderTransparent();
        this.render.finishDraw();
    }

    resize() {
        this.screen = new FrameBuffer(width, height);
    }
}
