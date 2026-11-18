import { useEffect, useRef, useState } from "react";
const vertex = `attribute vec3 position, normal;uniform vec2 angle;uniform float aspect;varying vec3 N;varying vec3 P;
mat3 rx(float a){float s=sin(a),c=cos(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}mat3 ry(float a){float s=sin(a),c=cos(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}mat3 rz(float a){float s=sin(a),c=cos(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
void main(){mat3 spin=rz(-.12)*rx(angle.y)*ry(angle.x)*rz(.2);P=spin*(position/20000.);N=spin*(normal/20000.);float k=1.0/(1.-P.z*.12);gl_Position=vec4(P.x*k*.80/aspect,P.y*k*.80,-P.z*.4,1.);}`;
const fragment = `precision mediump float;varying vec3 N;varying vec3 P;void main(){vec3 n=normalize(N);vec3 v=normalize(vec3(0.,0.,5.)-P);vec3 r=reflect(-v,n);float u=atan(r.x,r.z),h=r.y;vec3 col=mix(vec3(.13,.065,.19),vec3(.67,.56,.77),.5+.5*h);float wave=h+.17*sin(u*2.8)+.12*cos(u*4.);col=mix(col,vec3(.96,.89,1.),smoothstep(-.1,.05,wave));col=mix(col,vec3(.13,.08,.20),smoothstep(.10,.22,wave));col=mix(col,vec3(.75,.64,.88),smoothstep(.38,.68,wave));float strip=pow(max(0.,cos(2.6*u+.5+h)),14.);col=mix(col,vec3(1.,.96,1.),strip*.92);col=mix(col,vec3(.62,.32,.75),.32*pow(max(0.,sin(3.*u-h)),5.));float edge=pow(1.-abs(dot(v,n)),3.);col=mix(col,vec3(.94,.86,.97),.56*edge);col*=.90+.10*(P.y+.4);gl_FragColor=vec4(col,1.);}`;
export function Sculpture() {
  const holder = useRef(null),
    canvas = useRef(null),
    pose = useRef({ x: -0.29, y: 0.25 }),
    drag = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let dead = false,
      frame = 0,
      watch;
    const el = canvas.current;
    const gl = el.getContext("webgl", {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    if (!gl) return;
    const program = gl.createProgram(),
      buffer = gl.createBuffer(),
      index = gl.createBuffer();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    async function init() {
      const res = await fetch("assets/chrome.bin");
      if (!res.ok) throw Error("geometry");
      const bytes = await res.arrayBuffer();
      if (dead) return;
      for (const [type, code] of [
        [gl.VERTEX_SHADER, vertex],
        [gl.FRAGMENT_SHADER, fragment],
      ]) {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, code);
        gl.compileShader(sh);
        gl.attachShader(program, sh);
        gl.deleteShader(sh);
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
      gl.useProgram(program);
      const count = 240 * 48;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Int16Array(bytes, 0, count * 6),
        gl.STATIC_DRAW,
      );
      for (const [i, name] of ["position", "normal"].entries()) {
        const attr = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(attr);
        gl.vertexAttribPointer(attr, 3, gl.SHORT, false, 0, i * count * 6);
      }
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(bytes, count * 12),
        gl.STATIC_DRAW,
      );
      gl.enable(gl.DEPTH_TEST);
      const angle = gl.getUniformLocation(program, "angle"),
        aspect = gl.getUniformLocation(program, "aspect");
      let last = 0,
        clock = 0,
        cx = pose.current.x,
        cy = pose.current.y;
      function draw(now) {
        frame = requestAnimationFrame(draw);
        if (!visible || document.hidden || now - last < 32) return;
        clock += Math.min(now - last, 50) * 0.00028;
        last = now;
        const dpr = Math.min(devicePixelRatio, 1.65),
          w = Math.round(el.clientWidth * dpr),
          h = Math.round(el.clientHeight * dpr);
        if (el.width !== w || el.height !== h) {
          el.width = w;
          el.height = h;
        }
        gl.viewport(0, 0, w, h);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const motion = reduced.matches || drag.current ? 0 : 1;
        cx += (pose.current.x + motion * Math.sin(clock) * 0.16 - cx) * 0.24;
        cy +=
          (pose.current.y + motion * Math.cos(clock * 0.8) * 0.06 - cy) * 0.24;
        gl.uniform2f(angle, cx, cy);
        gl.uniform1f(aspect, w / h);
        gl.drawElements(gl.TRIANGLES, count * 6, gl.UNSIGNED_SHORT, 0);
      }
      draw(performance.now());
      watch = new IntersectionObserver(
        (entries) => (visible = entries[0].isIntersecting),
      );
      watch.observe(el);
      setReady(true);
    }
    init().catch(() => {});
    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      watch?.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteBuffer(index);
      gl.deleteProgram(program);
    };
  }, []);
  function down(e) {
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      ...{ startX: pose.current.x, startY: pose.current.y },
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e) {
    const start = drag.current;
    if (start)
      pose.current = {
        x: start.startX + (e.clientX - start.x) * 0.012,
        y: start.startY + (e.clientY - start.y) * 0.006,
      };
  }
  return (
    <div className="artstage" ref={holder}>
      <div className="orbit" />
      <div className="cross c1">✧</div>
      <div className="cross c2">✦</div>
      <div className="artshadow" />
      <div
        className="sculpt"
        tabIndex={ready ? 0 : -1}
        role="group"
        aria-label="银紫色花火雕塑，左右方向键或拖动可旋转"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={(e) => {
          if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
            pose.current.x += e.key === "ArrowLeft" ? -0.28 : 0.28;
          }
        }}
      >
        <img
          className={ready ? "fallback hidden" : "fallback"}
          alt="银紫色花火雕塑"
          src="assets/flower.webp"
        />
        <canvas ref={canvas} style={{ opacity: ready ? 1 : 0 }} />
      </div>
      <small className="gesture">
        {ready ? "↔　拖动花火，转个角度" : "✧　午夜花火"}
      </small>
    </div>
  );
}
