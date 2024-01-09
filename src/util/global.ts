declare global {
    interface Window {
        gl: WebGL2RenderingContext;
    }
}

export function setGlobalGl(gl: WebGL2RenderingContext) {
    window.gl = gl;
}

export function getGlobalGl() {
    return window.gl;
}
