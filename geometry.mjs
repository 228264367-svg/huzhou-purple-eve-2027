// Inflate a single five-lobed ribbon, with creased tips and an open centre.
import { Vector3, BufferGeometry, Float32BufferAttribute } from "three";
import { writeFileSync } from "node:fs";
const length = 240,
  around = 48,
  vertices = [],
  indices = [];
function centre(t) {
  const lobe = (1 + Math.cos(5 * t)) * 0.5;
  const r = 0.57 + 0.42 * lobe;
  return new Vector3(
    r * Math.cos(t),
    r * Math.sin(t),
    0.18 * Math.sin(5 * t - 0.55) + 0.12 * Math.sin(2 * t),
  );
}
for (let i = 0; i < length; i++) {
  const t = (i * Math.PI * 2) / length,
    c = centre(t),
    tangent = centre(t + 0.001)
      .sub(centre(t - 0.001))
      .normalize();
  const outward = new Vector3(tangent.y, -tangent.x, 0).normalize(),
    top = outward.clone().cross(tangent).normalize();
  const w = 0.19 + 0.045 * Math.cos(5 * t - 0.5),
    tilt = 0.65 * Math.sin(5 * t + 0.3);
  for (let j = 0; j < around; j++) {
    const a = (j * Math.PI * 2) / around,
      v = c
        .clone()
        .addScaledVector(
          outward,
          w * Math.cos(a) * Math.cos(tilt) -
            0.24 * Math.sin(a) * Math.sin(tilt),
        )
        .addScaledVector(
          top,
          w * Math.cos(a) * Math.sin(tilt) +
            0.24 * Math.sin(a) * Math.cos(tilt),
        );
    vertices.push(v.x, v.y, v.z);
    const nextI = (i + 1) % length,
      nextJ = (j + 1) % around,
      A = i * around + j,
      B = nextI * around + j,
      C = nextI * around + nextJ,
      D = i * around + nextJ;
    indices.push(A, B, C, A, C, D);
  }
}
const geometry = new BufferGeometry();
geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
geometry.setIndex(indices);
geometry.computeVertexNormals();
const normals = geometry.getAttribute("normal").array;
const data = new Int16Array(vertices.length * 2);
vertices.forEach((v, i) => (data[i] = Math.round(v * 20000)));
normals.forEach((v, i) => (data[vertices.length + i] = Math.round(v * 20000)));
writeFileSync(
  "assets/chrome.bin",
  Buffer.concat([
    Buffer.from(data.buffer),
    Buffer.from(new Uint16Array(indices).buffer),
  ]),
);
