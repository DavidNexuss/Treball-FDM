class ShaderContext {
  gl: WebGLRenderingContext
  program: WebGLProgram
  quad: WebGLBuffer

  createQuad() {
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
    return quad
  }

  createShader(shaderSource: string, t: number) {
    var sh = this.gl.createShader(t)
    this.gl.shaderSource(sh, shaderSource)
    this.gl.compileShader(sh)
    if (!this.gl.getShaderParameter(sh, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(sh);
      console.log(shaderSource)
      console.error(`Shader ${t} compilation error ${info}`)
    }
    return sh
  }

  createProgram(fsShader: string, vsShader: string): WebGLProgram {
    var program = this.gl.createProgram();

    this.gl.attachShader(program, this.createShader(fsShader, this.gl.FRAGMENT_SHADER));
    this.gl.attachShader(program, this.createShader(vsShader, this.gl.VERTEX_SHADER));
    this.gl.bindAttribLocation(program, 0, 'aPosition');

    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      console.error(`Shader compilation error ${info}`);
    }
    return program
  }
  constructor(canvas: HTMLCanvasElement, fsShader: string, vsShader: string) {
    this.gl = canvas.getContext("webgl");
    this.program = this.createProgram(fsShader, vsShader);
    this.quad = this.createQuad();
  }

  render() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad);
    this.gl.useProgram(this.program)
    this.gl.enableVertexAttribArray(0)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6)
  }
};


var renderingContexts: ShaderContext[] = [];
var initialized = false;

function run() {
  for (var i = 0; i < renderingContexts.length; i++) {
    renderingContexts[i].render();
  }
  requestAnimationFrame(run);
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
