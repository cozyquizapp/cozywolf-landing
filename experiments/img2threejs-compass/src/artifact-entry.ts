import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  createAdventureCompassModel,
  createAdventureCompassLookDevLights,
  frameAdventureCompassCamera,
} from './createCompassModel';

type Part = { id: string; name: string; level: string; role: string; primitive: string;
  material: string; note: string; size: number[] | null };

export function mountCompassViewer(canvas: HTMLCanvasElement, opts: {
  onPick: (p: Part | null) => void;
  onBearing: (deg: number) => void;
  background: () => number;
}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const model = createAdventureCompassModel({ castShadow: true, receiveShadow: true });
  scene.add(model);
  scene.add(createAdventureCompassLookDevLights('reference'));
  // The look-dev rig's hemisphere ground is dark; the spec's lightingFromPhoto asks for a white
  // ambient because the reference has no black anywhere. Same correction as the review harness.
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
  frameAdventureCompassCamera(camera, model, { margin: 1.35 });
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 1.0;
  controls.maxDistance = 8.0;

  // Every node keeps its authored position so explode is reversible and never accumulates.
  const rest = new Map<THREE.Object3D, THREE.Vector3>();
  model.traverse((o) => { if (o !== model) rest.set(o, o.position.clone()); });

  const claySource = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const clay = new THREE.MeshStandardMaterial({ color: 0xb9bcc4, roughness: 0.9, metalness: 0 });
  const wire = new THREE.MeshBasicMaterial({ color: 0xdf8c1f, wireframe: true });
  model.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) claySource.set(m, m.material); });

  const parts: Part[] = [];
  model.traverse((o) => {
    const c = (o.userData as any).sculptComponent;
    if (!c || !(o as THREE.Mesh).isMesh) return;
    const box = new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3());
    parts.push({
      id: c.id, name: c.name, level: c.level, role: c.role, primitive: c.primitive,
      material: c.material, note: c.topologyRationale ?? '',
      size: c.dimensions?.targetWorldSize ?? [box.x, box.y, box.z],
    });
  });

  let mode: 'shaded' | 'clay' | 'wire' = 'shaded';
  function setMode(next: typeof mode) {
    mode = next;
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.material = next === 'shaded' ? claySource.get(m)! : next === 'clay' ? clay : wire;
    });
  }

  let explode = 0;
  function setExplode(v: number) {
    explode = v;
    rest.forEach((base, node) => {
      const dir = base.length() > 1e-4 ? base.clone().normalize() : new THREE.Vector3(0, 1, 0);
      node.position.copy(base).addScaledVector(dir, v * 0.55);
    });
  }

  let spin = false;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let selected: THREE.Mesh | null = null;
  const selectedEmissive = new THREE.Color(0x000000);

  function pick(clientX: number, clientY: number) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(model, true).find((h) => (h.object as THREE.Mesh).isMesh);
    if (selected) {
      const sm = selected.material as THREE.MeshStandardMaterial;
      if (sm.emissive) sm.emissive.copy(selectedEmissive);
      selected = null;
    }
    if (!hit) { opts.onPick(null); return; }
    selected = hit.object as THREE.Mesh;
    const sm = selected.material as THREE.MeshStandardMaterial;
    if (sm.emissive) { selectedEmissive.copy(sm.emissive); sm.emissive.setHex(0x332200); }
    const c = (selected.userData as any).sculptComponent;
    opts.onPick(parts.find((p) => p.id === c?.id) ?? null);
  }

  canvas.addEventListener('pointerdown', (e) => { (canvas as any)._dx = e.clientX; (canvas as any)._dy = e.clientY; });
  canvas.addEventListener('pointerup', (e) => {
    const dx = Math.abs(e.clientX - (canvas as any)._dx), dy = Math.abs(e.clientY - (canvas as any)._dy);
    if (dx < 4 && dy < 4) pick(e.clientX, e.clientY);
  });

  function resize() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(1, r.height);
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  let last = 0;
  function tick(t: number) {
    requestAnimationFrame(tick);
    if (spin) {
      const dt = last ? (t - last) / 1000 : 0;
      controls.setAzimuthalAngle(controls.getAzimuthalAngle() + dt * 0.35);
    }
    last = t;
    scene.background = new THREE.Color(opts.background());
    controls.update();
    opts.onBearing(((-controls.getAzimuthalAngle() * 180) / Math.PI + 360) % 360);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);

  return {
    parts,
    setMode,
    setExplode,
    getExplode: () => explode,
    toggleSpin: () => (spin = !spin),
    isSpinning: () => spin,
    resetView: () => { frameAdventureCompassCamera(camera, model, { margin: 1.35 }); controls.target.set(0, 0, 0); },
    resize,
  };
}
