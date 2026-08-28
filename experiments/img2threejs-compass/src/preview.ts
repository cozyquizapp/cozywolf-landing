import * as THREE from 'three';
import {
  createAdventureCompassModel,
  createAdventureCompassLookDevLights,
  frameAdventureCompassCamera,
} from './createCompassModel';

// Review harness. Deliberately NOT using the presentation composer or ACES tone
// mapping: the R-POSTFX rule in the generated factory says the evaluation render
// must be a plain renderer, and this spec's lightingFromPhoto explicitly rejects
// filmic tone mapping as a measurable regression against a flat-shaded reference.

const params = new URLSearchParams(location.search);
const azimuth = Number(params.get('az') ?? 0);
const elevation = Number(params.get('el') ?? 0);
const size = Number(params.get('size') ?? 1024);

const container = document.getElementById('app')!;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(size, size, false);
renderer.setClearColor(0xffffff, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const model = createAdventureCompassModel({ castShadow: true, receiveShadow: true });
scene.add(model);
scene.add(createAdventureCompassLookDevLights('reference'));
// The factory's 'reference' rig uses a hemisphere light with a dark ground (0x363b42), which
// drags the dial's downward-facing half toward black. The spec's lightingFromPhoto asks for a
// WHITE ambient at 0.55 precisely because the reference has no black anywhere, so the shortfall
// is added here rather than by inflating the dial albedo past white to compensate.
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Blockout evidence: append_review refuses to credit the blockout pass on a lit, textured
// render, because blockout is a claim about FORM. ?flat=1 swaps every material for one neutral
// unlit-ish clay so the silhouette and volumes are judged with no colour to hide behind.
if (params.get('flat') === '1') {
  const clay = new THREE.MeshStandardMaterial({ color: 0xb8b8b8, roughness: 0.9, metalness: 0.0 });
  model.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) m.material = clay;
  });
}

const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
frameAdventureCompassCamera(camera, model, { margin: Number(params.get('margin') ?? 1.22), azimuthDeg: azimuth, elevationDeg: elevation });

renderer.render(scene, camera);
(window as any).__THREE = THREE;
(window as any).__model = model;
(window as any).__ready = true;
(window as any).__stats = (() => {
  let tris = 0, meshes = 0;
  model.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.geometry) return;
    meshes++;
    const g = m.geometry as THREE.BufferGeometry;
    const count = g.index ? g.index.count : g.attributes.position.count;
    const instances = (m as unknown as THREE.InstancedMesh).count ?? 1;
    tris += (count / 3) * ((m as unknown as THREE.InstancedMesh).isInstancedMesh ? instances : 1);
  });
  return { triangles: tris, meshes };
})();
