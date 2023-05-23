var g_time = 0;
class ShaderContext {
  gl: WebGLRenderingContext
  program: WebGLProgram
  quad: WebGLBuffer
  canvas: HTMLCanvasElement;

  uniform_resolution: WebGLUniformLocation;
  uniform_time: WebGLUniformLocation;

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
    this.canvas = canvas;


    this.uniform_resolution = this.gl.getUniformLocation(this.program, "u_resolution");
    this.uniform_time = this.gl.getUniformLocation(this.program, "u_time");

  }

  render() {
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;
    const needResize = this.canvas.width !== displayWidth ||
      this.canvas.height !== displayHeight;

    if (needResize) {
      // Make the canvas the same size
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad);
    this.gl.useProgram(this.program)
    this.gl.uniform2f(this.uniform_resolution, this.canvas.clientWidth, this.canvas.clientHeight);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.uniform1f(this.uniform_time, g_time);
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
  g_time += 0.01;
}


function initialize() {
  requestAnimationFrame(run);
}

declare function createMirror(el: HTMLElement): void;

function createShadered(shaderCode, vsShader) {
  if (!initialized) {
    initialize();
    initialized = true;
  }
  var container = document.createElement("div");
  var canvas = document.createElement("canvas");
  var editor = document.createElement("div");
  canvas.className = "glViewer";
  editor.className = "glEditor";
  editor.innerHTML = shaderCode;
  container.appendChild(canvas);
  container.appendChild(editor);

  editor.style.minHeight = "10rem";
  createMirror(editor);

  renderingContexts.push(new ShaderContext(canvas, shaderCode, vsShader));
  return container;
}
