import { AsyncResource } from "../util/async";

export class ImageLoader extends AsyncResource<ImageData> {
    width?: number;
    height?: number;
    imageData?: ImageData;
    get data() {
        return this.imageData?.data || null;
    }
    constructor(public path: string) {
        super();
    }
    load() {
        const image = new Image();
        image.src = this.path;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("2d context is not avaliable");
            this.width = canvas.width = image.width;
            this.width = canvas.height = image.height;
            ctx.drawImage(image, 0, 0, image.width, image.height);

            const imageData = ctx.getImageData(0, 0, image.width, image.height);
            this.imageData = imageData;
            this.defer.resolve(imageData);
        };
        return this.defer.promise;
    }
}
