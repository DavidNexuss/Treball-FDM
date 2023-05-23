var g_time = 0;
var ShaderContext = /** @class */ (function () {
    function ShaderContext(canvas, fsShader, vsShader) {
        this.gl = canvas.getContext("webgl");
        this.program = this.createProgram(fsShader, vsShader);
        this.quad = this.createQuad();
        this.canvas = canvas;
        this.uniform_resolution = this.gl.getUniformLocation(this.program, "u_resolution");
        this.uniform_time = this.gl.getUniformLocation(this.program, "u_time");
    }
    ShaderContext.prototype.createQuad = function () {
        var quad = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, quad);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            0, 0,
            1, 0,
            1, 1,
            0, 1,
            1, 1,
            0, 0
        ]), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
        return quad;
    };
    ShaderContext.prototype.createShader = function (shaderSource, t) {
        var sh = this.gl.createShader(t);
        this.gl.shaderSource(sh, shaderSource);
        this.gl.compileShader(sh);
        if (!this.gl.getShaderParameter(sh, this.gl.COMPILE_STATUS)) {
            var info = this.gl.getShaderInfoLog(sh);
            console.log(shaderSource);
            console.error("Shader ".concat(t, " compilation error ").concat(info));
        }
        return sh;
    };
    ShaderContext.prototype.createProgram = function (fsShader, vsShader) {
        var program = this.gl.createProgram();
        this.gl.attachShader(program, this.createShader(fsShader, this.gl.FRAGMENT_SHADER));
        this.gl.attachShader(program, this.createShader(vsShader, this.gl.VERTEX_SHADER));
        this.gl.bindAttribLocation(program, 0, 'aPosition');
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            var info = this.gl.getProgramInfoLog(program);
            console.error("Shader compilation error ".concat(info));
        }
        return program;
    };
    ShaderContext.prototype.render = function () {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad);
        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.uniform_resolution, this.canvas.clientWidth, this.canvas.clientHeight);
        this.gl.uniform1f(this.uniform_time, g_time);
        this.gl.enableVertexAttribArray(0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    };
    return ShaderContext;
}());
;
var renderingContexts = [];
var initialized = false;
function run() {
    for (var i = 0; i < renderingContexts.length; i++) {
        renderingContexts[i].render();
    }
    requestAnimationFrame(run);
    g_time += 0.01;
}
function initialize() {
    requestAnimationFrame(run);
}
function createShadered(shaderCode, vsShader) {
    if (!initialized) {
        initialize();
        initialized = true;
    }
    var container = document.createElement("div");
    var canvas = document.createElement("canvas");
    renderingContexts.push(new ShaderContext(canvas, shaderCode, vsShader));
    container.appendChild(canvas);
    return container;
}
