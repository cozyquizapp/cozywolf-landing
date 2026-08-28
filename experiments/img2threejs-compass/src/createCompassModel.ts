import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type ProceduralModelOptions = {
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  textureSize?: number;
  textureAnisotropy?: number;
  qualityPriority?: 'reference-fidelity' | 'balanced';
};

export type ProceduralModelRuntime = {
  nodes: Record<string, THREE.Object3D>;
  meshes: Record<string, THREE.Mesh>;
  sockets: Record<string, THREE.Object3D>;
  colliders: Record<string, unknown>;
  destructionGroups: Record<string, THREE.Object3D[]>;
};

type SculptMaterialSpec = Record<string, any>;

// THREE.CapsuleGeometry duplicates every UV-seam vertex (measured: 194 boundary
// edges on the default radius/segments below) -- same benign pattern as box/
// cylinder/sphere/torus, all of which weld cleanly to 0 given a CORRECT weld.
// (A naive vertex-only mergeVertices() reports 64 'non-manifold' edges here, but
// that is a counting artifact, not a real defect: it double-counts a handful of
// near-pole triangles that become degenerate once two of their three corners
// coincide -- confirmed by replicating subdivideCatmullClark's own degenerate-
// triangle-aware vertex identity, which finds a perfectly ordinary 2-manifold.)
// A capsule is the primary shape for skinned limbs/torso (PLAN_1.5), and skinning
// weight computation is O(vertices x bones), so fewer, guaranteed-simple vertices
// is worth having regardless -- authored as a deterministic, closed-by-
// construction mesh instead: shared pole vertices, and
// the radial index taken `% radialSegments` so the seam is never a duplicate
// vertex in the first place, rather than something to weld away afterward.
// Adapted from forge/stage5_rig/emit_rig.py's buildWatertightCapsule (verified
// there: 0 boundary edges, 0 non-manifold edges, deterministic across repeated
// runs) -- ported here rather than imported because this factory and the rig
// emitter are separate generated-output surfaces with no shared runtime module;
// see forge/tests/test_primitive_watertightness.py for the measured proof, and
// coordinate with the rig owner before changing either copy independently.
function buildWatertightCapsule(
  radius: number,
  cylLength: number,
  capSegments: number,
  radialSegments: number,
  heightSegments: number,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];
  const halfCyl = cylLength / 2;
  const totalSpan = 2 * (Math.PI / 2 * radius) + Math.max(0, cylLength);
  const vOf = (fromBottom: number) => (totalSpan > 0 ? fromBottom / totalSpan : 0);

  const bottomPoleIndex = positions.length / 3;
  positions.push(0, -halfCyl - radius, 0);
  uvs.push(0.5, vOf(0));

  const ringStarts: number[] = [];
  const ringV: number[] = [];
  for (let ring = 1; ring <= capSegments; ring += 1) {
    const phi = (Math.PI / 2) * (ring / capSegments);
    const y = -halfCyl - radius * Math.cos(phi);
    const r = radius * Math.sin(phi);
    const start = positions.length / 3;
    ringStarts.push(start);
    ringV.push(vOf(radius * phi));
    for (let radial = 0; radial < radialSegments; radial += 1) {
      const theta = (radial / radialSegments) * Math.PI * 2;
      positions.push(r * Math.cos(theta), y, r * Math.sin(theta));
      uvs.push(radial / radialSegments, vOf(radius * phi));
    }
  }

  const cylinderRingStarts: number[] = [];
  if (cylLength > 0) {
    for (let step = 1; step <= heightSegments; step += 1) {
      const y = -halfCyl + (cylLength * step) / heightSegments;
      const start = positions.length / 3;
      cylinderRingStarts.push(start);
      const v = vOf(radius * (Math.PI / 2) + halfCyl + y);
      for (let radial = 0; radial < radialSegments; radial += 1) {
        const theta = (radial / radialSegments) * Math.PI * 2;
        positions.push(radius * Math.cos(theta), y, radius * Math.sin(theta));
        uvs.push(radial / radialSegments, v);
      }
    }
  }

  const topRingStarts: number[] = [];
  for (let ring = capSegments - 1; ring >= 1; ring -= 1) {
    const phi = (Math.PI / 2) * (ring / capSegments);
    const y = halfCyl + radius * Math.cos(phi);
    const r = radius * Math.sin(phi);
    const start = positions.length / 3;
    topRingStarts.push(start);
    const v = vOf(radius * (Math.PI / 2) + Math.max(0, cylLength) + radius * (Math.PI / 2 - phi));
    for (let radial = 0; radial < radialSegments; radial += 1) {
      const theta = (radial / radialSegments) * Math.PI * 2;
      positions.push(r * Math.cos(theta), y, r * Math.sin(theta));
      uvs.push(radial / radialSegments, v);
    }
  }

  const topPoleIndex = positions.length / 3;
  positions.push(0, halfCyl + radius, 0);
  uvs.push(0.5, vOf(totalSpan));

  const firstBottomRing = ringStarts[0];
  for (let radial = 0; radial < radialSegments; radial += 1) {
    const next = (radial + 1) % radialSegments;
    indices.push(bottomPoleIndex, firstBottomRing + radial, firstBottomRing + next);
  }

  const allRings = [...ringStarts, ...cylinderRingStarts, ...topRingStarts];
  for (let i = 0; i < allRings.length - 1; i += 1) {
    const a = allRings[i];
    const b = allRings[i + 1];
    for (let radial = 0; radial < radialSegments; radial += 1) {
      const next = (radial + 1) % radialSegments;
      indices.push(a + radial, a + next, b + next);
      indices.push(a + radial, b + next, b + radial);
    }
  }

  const lastRing = allRings[allRings.length - 1];
  for (let radial = 0; radial < radialSegments; radial += 1) {
    const next = (radial + 1) % radialSegments;
    indices.push(topPoleIndex, lastRing + next, lastRing + radial);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// bevelEnabled defaults to true on THREE.ExtrudeGeometry and rounds every
// corner — sharp/pointed profiles (blades, fork tines, spikes) need
// bevelEnabled: false plus lineTo()-only path segments near the tip, since a
// curve command cannot produce a true converging point.
function buildExtrudeShape(points: [number, number][], holes?: [number, number][][]): THREE.Shape {
  const shape = new THREE.Shape();
  if (points.length > 0) {
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) {
      shape.lineTo(points[i][0], points[i][1]);
    }
  }
  // Cutouts (e.g. an oval wire-cutter hole) as THREE.Path added to shape.holes —
  // dep-free boolean subtraction via the tessellator, no CSG library needed.
  for (const loop of holes ?? []) {
    if (loop.length < 3) continue;
    const path = new THREE.Path();
    path.moveTo(loop[0][0], loop[0][1]);
    for (let i = 1; i < loop.length; i += 1) path.lineTo(loop[i][0], loop[i][1]);
    path.closePath();
    shape.holes.push(path);
  }
  return shape;
}

// Build an N-gon oval loop (for hole authoring from a compact {cx,cy,rx,ry} descriptor).
function ovalLoop(cx: number, cy: number, rx: number, ry: number, seg = 24): [number, number][] {
  const loop: [number, number][] = [];
  for (let i = 0; i < seg; i += 1) {
    const a = (i / seg) * Math.PI * 2;
    loop.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return loop;
}

function buildExtrudeGeometry(profile: { points: [number, number][]; depth: number; holes?: [number, number][][]; ovalHoles?: { cx: number; cy: number; rx: number; ry: number }[] }): THREE.ExtrudeGeometry {
  const holes = [...(profile.holes ?? []), ...((profile.ovalHoles ?? []).map((o) => ovalLoop(o.cx, o.cy, o.rx, o.ry)))];
  const shape = buildExtrudeShape(profile.points, holes);
  return new THREE.ExtrudeGeometry(shape, {
    depth: profile.depth,
    bevelEnabled: false,
    steps: 1,
  });
}

function buildLatheGeometry(profile: { points: [number, number][]; segments?: number }): THREE.LatheGeometry {
  const points = profile.points.map(([x, y]) => new THREE.Vector2(Math.max(0.0001, x), y));
  return new THREE.LatheGeometry(points, profile.segments ?? 24);
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function readLayerNumber(value: unknown, keys: string[], fallback: number): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of keys) {
      if (typeof record[key] === 'number') return record[key] as number;
    }
  }
  return fallback;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = /^#[0-9a-f]{3}$/i.test(hex)
    ? '#' + hex.slice(1).split('').map((part) => part + part).join('')
    : hex;
  const value = /^#[0-9a-f]{6}$/i.test(normalized) ? Number.parseInt(normalized.slice(1), 16) : 0x8a7a5f;
  return [clampAlbedoChannel((value >> 16) & 255), clampAlbedoChannel((value >> 8) & 255), clampAlbedoChannel(value & 255)];
}

function materialPalette(spec: SculptMaterialSpec): string[] {
  const palette = spec.colorVariation?.palette;
  if (Array.isArray(palette) && palette.length > 0) return palette.filter((value) => typeof value === 'string');
  const secondary = spec.albedo?.secondary;
  const colors = [spec.baseColor ?? spec.color ?? spec.albedo?.dominant, ...(Array.isArray(secondary) ? secondary : [])];
  return colors.filter((value): value is string => typeof value === 'string' && value.startsWith('#'));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampAlbedoChannel(value: number): number {
  return Math.max(30, Math.min(240, Math.round(value)));
}

function clampPbrF0(value: number): number {
  return Math.max(0.02, Math.min(1, value));
}

function clampPbrIor(value: number): number {
  return Math.max(1, Math.min(2.5, value));
}

function clampPbrMetalness(value: number): number {
  return value >= 0.5 ? 1 : 0;
}

function clampedAlbedoColor(spec: SculptMaterialSpec): THREE.Color {
  const source = typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F';
  // setStyle with an explicit SRGBColorSpace, NOT the numeric constructor.
  //
  // `new THREE.Color(r, g, b)` treats its arguments as LINEAR working-space components,
  // while an authored `baseColor` hex is sRGB. Feeding one to the other skipped the
  // transfer function and lifted every dark albedo: #2e2a28, authored as a near-black
  // vinyl, rendered at roughly sRGB 0.46 — a mid grey. The error is largest exactly where
  // it matters most, because the transfer curve is steepest near black.
  return new THREE.Color().setStyle(source, THREE.SRGBColorSpace);
}

function smoothCurve(value: number): number {
  return value * value * (3 - 2 * value);
}

function periodicHash(x: number, y: number, seed: number, periodX: number, periodY: number): number {
  const wrappedX = ((x % periodX) + periodX) % periodX;
  const wrappedY = ((y % periodY) + periodY) % periodY;
  let value = Math.imul(wrappedX + seed * 17, 374761393) ^ Math.imul(wrappedY + seed * 31, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function periodicValueNoise(u: number, v: number, seed: number, periodX: number, periodY: number): number {
  const x = u * periodX;
  const y = v * periodY;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothCurve(x - x0);
  const ty = smoothCurve(y - y0);
  const a = periodicHash(x0, y0, seed, periodX, periodY);
  const b = periodicHash(x0 + 1, y0, seed, periodX, periodY);
  const c = periodicHash(x0, y0 + 1, seed, periodX, periodY);
  const d = periodicHash(x0 + 1, y0 + 1, seed, periodX, periodY);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, tx), THREE.MathUtils.lerp(c, d, tx), ty);
}

type SurfaceBand = {
  frequency: number;
  amplitude: number;
  stretchX: number;
  stretchY: number;
  ridge: boolean;
};

function surfaceBands(spec: SculptMaterialSpec): SurfaceBand[] {
  const source = Array.isArray(spec.surfaceFrequencyBands) ? spec.surfaceFrequencyBands : [];
  const parsed = source.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const band = item as Record<string, unknown>;
    const frequency = typeof band.frequency === 'number' ? band.frequency : 0;
    const amplitude = typeof band.amplitude === 'number' ? band.amplitude : 0;
    if (frequency <= 0 || amplitude <= 0) return [];
    const stretch = Array.isArray(band.stretch) ? band.stretch : [1, 1];
    const description = `${String(band.pattern ?? '')} ${String(band.role ?? '')}`.toLowerCase();
    return [{
      frequency,
      amplitude,
      stretchX: typeof stretch[0] === 'number' ? Math.max(0.1, stretch[0]) : 1,
      stretchY: typeof stretch[1] === 'number' ? Math.max(0.1, stretch[1]) : 1,
      ridge: /(ridge|groove|grain|fiber|striated|crack)/.test(description),
    }];
  });
  return parsed.length > 0 ? parsed : [
    { frequency: 2, amplitude: 0.42, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 12, amplitude: 0.22, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 56, amplitude: 0.08, stretchX: 1, stretchY: 1, ridge: false },
  ];
}

function sampleSurface(u: number, v: number, bands: SurfaceBand[], seed: number): number {
  let value = 0;
  let weight = 0;
  for (let index = 0; index < bands.length; index += 1) {
    const band = bands[index];
    const periodX = Math.max(1, Math.round(band.frequency * band.stretchX));
    const periodY = Math.max(1, Math.round(band.frequency * band.stretchY));
    let sample = periodicValueNoise(u, v, seed + index * 1013, periodX, periodY);
    if (band.ridge) sample = 1 - Math.abs(sample * 2 - 1);
    value += sample * band.amplitude;
    weight += band.amplitude;
  }
  return weight > 0 ? clamp01(value / weight) : 0.5;
}

function mixPalette(colors: [number, number, number][], value: number): [number, number, number] {
  if (colors.length === 1) return colors[0];
  const scaled = clamp01(value) * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const a = colors[index];
  const b = colors[index + 1];
  return [
    Math.round(THREE.MathUtils.lerp(a[0], b[0], mix)),
    Math.round(THREE.MathUtils.lerp(a[1], b[1], mix)),
    Math.round(THREE.MathUtils.lerp(a[2], b[2], mix)),
  ];
}

type ColorGradientStop = { offset: number; color: string };
type ColorGradientSpec = {
  type: 'linear' | 'radial';
  axis: [number, number];
  stops: ColorGradientStop[];
};

function parseRgba(value: string): [number, number, number] {
  const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(value);
  if (!match) return [138, 122, 95];
  return [clampAlbedoChannel(Number(match[1])), clampAlbedoChannel(Number(match[2])), clampAlbedoChannel(Number(match[3]))];
}

// Analytical per-pixel gradient sample. The extraction schema's colorGradient carries
// exact rgba(...) stop colors (see extract_part_color_recipe.py), so this samples the
// same trend directly in JS math rather than round-tripping through a Canvas 2D
// createLinearGradient/createRadialGradient object — same visual result, and it composes
// directly with the existing noise/height-correlated colorVariation blend below.
function sampleColorGradient(gradient: ColorGradientSpec, u: number, v: number): [number, number, number] {
  const stops = gradient.stops.length >= 2 ? gradient.stops : [{ offset: 0, color: 'rgba(138,122,95,1)' }, { offset: 1, color: 'rgba(138,122,95,1)' }];
  let t: number;
  if (gradient.type === 'radial') {
    const [cx, cy] = gradient.axis;
    const dx = u - cx;
    const dy = v - cy;
    const maxRadius = Math.max(0.001, Math.hypot(Math.max(cx, 1 - cx), Math.max(cy, 1 - cy)));
    t = clamp01(Math.hypot(dx, dy) / maxRadius);
  } else {
    const [ax, ay] = gradient.axis;
    const projection = (u - 0.5) * ax + (v - 0.5) * ay;
    const maxProjection = 0.5 * (Math.abs(ax) + Math.abs(ay)) || 0.5;
    t = clamp01(projection / maxProjection + 0.5);
  }
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.max(0, Math.floor(scaled)));
  const mix = scaled - index;
  const a = parseRgba(stops[index].color);
  const b = parseRgba(stops[index + 1].color);
  return [
    THREE.MathUtils.lerp(a[0], b[0], mix),
    THREE.MathUtils.lerp(a[1], b[1], mix),
    THREE.MathUtils.lerp(a[2], b[2], mix),
  ];
}

function writePixel(data: Uint8ClampedArray, offset: number, red: number, green: number, blue: number): void {
  data[offset] = Math.max(0, Math.min(255, Math.round(red)));
  data[offset + 1] = Math.max(0, Math.min(255, Math.round(green)));
  data[offset + 2] = Math.max(0, Math.min(255, Math.round(blue)));
  data[offset + 3] = 255;
}

function makeCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function createMapTexture(
  canvas: HTMLCanvasElement,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [2, 2];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 2,
    typeof repeat[1] === 'number' ? repeat[1] : 2,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

type ProceduralTextureSet = {
  albedo: THREE.Texture;
  roughness: THREE.Texture;
  height: THREE.Texture;
  normal: THREE.Texture;
  ao: THREE.Texture;
  source: 'reference-pixel-extraction' | 'procedural';
};

function referenceMapUrl(spec: SculptMaterialSpec, channel: string): string | null {
  const reference = spec.referencePbr;
  if (!reference || typeof reference !== 'object') return null;
  if (reference.usable === false) return null;
  const confidence = typeof reference.confidence === 'number'
    ? reference.confidence
    : (typeof reference.estimatedFidelity === 'number' ? reference.estimatedFidelity : 0);
  const threshold = typeof reference.targetThreshold === 'number' ? reference.targetThreshold : 0.7;
  if (confidence < threshold) return null;
  const maps = reference.maps;
  if (!maps || typeof maps !== 'object') return null;
  const map = (maps as Record<string, unknown>)[channel];
  if (!map || typeof map !== 'object') return null;
  const record = map as Record<string, unknown>;
  const url = typeof record.url === 'string' && record.url.trim() ? record.url : record.path;
  return typeof url === 'string' && url.trim() ? url : null;
}

function createLoadedMapTexture(
  url: string,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.Texture {
  const texture = new THREE.TextureLoader().load(url);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [1, 1];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 1,
    typeof repeat[1] === 'number' ? repeat[1] : 1,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

function makeReferenceTextureSet(spec: SculptMaterialSpec, options: ProceduralModelOptions): ProceduralTextureSet | null {
  const albedo = referenceMapUrl(spec, 'albedo');
  const roughness = referenceMapUrl(spec, 'roughness');
  const height = referenceMapUrl(spec, 'height');
  const normal = referenceMapUrl(spec, 'normal');
  const ao = referenceMapUrl(spec, 'ao');
  if (!albedo || !roughness || !height || !normal || !ao) return null;
  return {
    albedo: createLoadedMapTexture(albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createLoadedMapTexture(roughness, THREE.NoColorSpace, spec, options),
    height: createLoadedMapTexture(height, THREE.NoColorSpace, spec, options),
    normal: createLoadedMapTexture(normal, THREE.NoColorSpace, spec, options),
    ao: createLoadedMapTexture(ao, THREE.NoColorSpace, spec, options),
    source: 'reference-pixel-extraction',
  };
}

function makeProceduralTextureSet(
  id: string,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): ProceduralTextureSet | null {
  if (typeof document === 'undefined') return null;
  const qualityFirst = (options.qualityPriority ?? 'reference-fidelity') === 'reference-fidelity';
  const requested = options.textureSize ?? spec.textureResolution;
  const requestedSize = typeof requested === 'number' && Number.isFinite(requested)
    ? requested
    : (qualityFirst ? 1024 : 512);
  const size = Math.max(256, Math.min(2048, 2 ** Math.round(Math.log2(requestedSize))));
  const canvases = {
    albedo: makeCanvas(size),
    roughness: makeCanvas(size),
    height: makeCanvas(size),
    normal: makeCanvas(size),
    ao: makeCanvas(size),
  };
  const contexts = {
    albedo: canvases.albedo.getContext('2d'),
    roughness: canvases.roughness.getContext('2d'),
    height: canvases.height.getContext('2d'),
    normal: canvases.normal.getContext('2d'),
    ao: canvases.ao.getContext('2d'),
  };
  if (!contexts.albedo || !contexts.roughness || !contexts.height || !contexts.normal || !contexts.ao) return null;
  const images = {
    albedo: contexts.albedo.createImageData(size, size),
    roughness: contexts.roughness.createImageData(size, size),
    height: contexts.height.createImageData(size, size),
    normal: contexts.normal.createImageData(size, size),
    ao: contexts.ao.createImageData(size, size),
  };
  const seed = hashString(id);
  const bands = surfaceBands(spec);
  const heightField = new Float32Array(size * size);
  const roughnessField = new Float32Array(size * size);
  const palette = materialPalette(spec);
  const fallback = typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F';
  const colors = (palette.length >= 2 ? palette : [fallback, '#6E614B', '#A08F70']).map(hexToRgb);
  const baseRoughness = clamp01(readLayerNumber(spec.roughness, ['base'], 0.76));
  const roughnessVariation = clamp01(readLayerNumber(spec.roughness, ['variation'], 0.18));
  const colorAmplitude = clamp01(readLayerNumber(spec.colorVariation, ['amplitude', 'variation'], 0.18));
  const heightCorrelation = clamp01(readLayerNumber(spec.colorVariation, ['heightCorrelation'], 0.3));
  const colorGradient: ColorGradientSpec | undefined = spec.colorGradient;
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const index = y * size + x;
      const height = sampleSurface(u, v, bands, seed + 101);
      const roughNoise = sampleSurface(u, v, bands, seed + 7001);
      const colorNoise = sampleSurface(u, v, bands, seed + 15013);
      heightField[index] = height;
      roughnessField[index] = clamp01(baseRoughness + (roughNoise - 0.5) * roughnessVariation * 2);
      let color: [number, number, number];
      if (colorGradient) {
        // Evidence-derived spatial gradient (Plan 1.3 Workstream C) takes priority
        // over the noise-based palette blend below — it is a measured trend, not a guess.
        color = sampleColorGradient(colorGradient, u, v);
      } else {
        const paletteValue = clamp01(
          0.5 + (colorNoise - 0.5) * colorAmplitude * 2 + (height - 0.5) * heightCorrelation
        );
        color = mixPalette(colors, paletteValue);
      }
      writePixel(images.albedo.data, index * 4, color[0], color[1], color[2]);
    }
  }
  const normalStrength = Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35));
  const aoStrength = clamp01(readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35));
  for (let y = 0; y < size; y += 1) {
    const up = ((y - 1 + size) % size) * size;
    const down = ((y + 1) % size) * size;
    for (let x = 0; x < size; x += 1) {
      const left = (x - 1 + size) % size;
      const right = (x + 1) % size;
      const index = y * size + x;
      const center = heightField[index];
      const dx = (heightField[y * size + right] - heightField[y * size + left]) * normalStrength * 6;
      const dy = (heightField[down + x] - heightField[up + x]) * normalStrength * 6;
      const inverseLength = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const normalX = -dx * inverseLength;
      const normalY = -dy * inverseLength;
      const normalZ = inverseLength;
      const neighborAverage = (
        heightField[y * size + left] + heightField[y * size + right]
        + heightField[up + x] + heightField[down + x]
      ) * 0.25;
      const cavity = Math.max(0, neighborAverage - center);
      const ao = clamp01(1 - aoStrength * (cavity * 12 + (1 - center) * 0.16));
      const offset = index * 4;
      const heightByte = center * 255;
      const roughnessByte = roughnessField[index] * 255;
      writePixel(images.height.data, offset, heightByte, heightByte, heightByte);
      writePixel(images.roughness.data, offset, roughnessByte, roughnessByte, roughnessByte);
      writePixel(
        images.normal.data, offset,
        (normalX * 0.5 + 0.5) * 255,
        (normalY * 0.5 + 0.5) * 255,
        (normalZ * 0.5 + 0.5) * 255,
      );
      writePixel(images.ao.data, offset, ao * 255, ao * 255, ao * 255);
    }
  }
  contexts.albedo.putImageData(images.albedo, 0, 0);
  contexts.roughness.putImageData(images.roughness, 0, 0);
  contexts.height.putImageData(images.height, 0, 0);
  contexts.normal.putImageData(images.normal, 0, 0);
  contexts.ao.putImageData(images.ao, 0, 0);
  return {
    albedo: createMapTexture(canvases.albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createMapTexture(canvases.roughness, THREE.NoColorSpace, spec, options),
    height: createMapTexture(canvases.height, THREE.NoColorSpace, spec, options),
    normal: createMapTexture(canvases.normal, THREE.NoColorSpace, spec, options),
    ao: createMapTexture(canvases.ao, THREE.NoColorSpace, spec, options),
    source: 'procedural',
  };
}

function createSculptMaterial(id: string, spec: SculptMaterialSpec, options: ProceduralModelOptions, denseComponent = false): THREE.MeshPhysicalMaterial {
  // A material that declares -- with evidence -- that its subject carries no texture
  // detail gets NO texture set. Synthesising one anyway is not a harmless default: the
  // branch below then forces color to white and roughness to 1 and reads both from the
  // generated maps, so the authored albedo and the reference-derived roughness are both
  // discarded, and the model gains mottling the reference does not have. Measured on the
  // tuxedo cat, whose black fur rendered as speckled grey-and-white from a palette that
  // only ever described two flat regions.
  const textureless = (spec.textureless as { declared?: boolean } | undefined)?.declared === true;
  const textures = textureless
    ? null
    : makeReferenceTextureSet(spec, options) ?? makeProceduralTextureSet(id, spec, options);
  const material = new THREE.MeshPhysicalMaterial({
    color: textures ? 0xffffff : clampedAlbedoColor(spec),
    roughness: textures ? 1 : clamp01(readLayerNumber(spec.roughness, ['base'], 0.76)),
    metalness: clampPbrMetalness(readLayerNumber(spec.metalness, ['base'], 0.0)),
    clearcoat: clamp01(readLayerNumber(spec.clearcoat, ['base', 'amount'], 0)),
    clearcoatRoughness: clamp01(readLayerNumber(spec.clearcoatRoughness, ['base'], 0.25)),
    transmission: clamp01(readLayerNumber(spec.transmission, ['base', 'amount'], 0)),
    ior: clampPbrIor(readLayerNumber(spec.ior, ['base', 'value'], 1.5)),
    thickness: Math.max(0, readLayerNumber(spec.thickness, ['base', 'amount'], 0)),
    attenuationDistance: Math.max(0.001, readLayerNumber(spec.attenuationDistance, ['base', 'value'], Infinity)),
    attenuationColor: new THREE.Color(typeof spec.attenuationColor === 'string' ? spec.attenuationColor : '#ffffff'),
    sheen: clamp01(readLayerNumber(spec.sheen, ['base', 'amount'], 0)),
    sheenColor: new THREE.Color(typeof spec.sheenColor === 'string' ? spec.sheenColor : '#ffffff'),
    sheenRoughness: clamp01(readLayerNumber(spec.sheenRoughness, ['base'], 1.0)),
    iridescence: clamp01(readLayerNumber(spec.iridescence, ['base', 'amount'], 0)),
    iridescenceIOR: clampPbrIor(readLayerNumber(spec.iridescenceIOR, ['base', 'value'], 1.3)),
    anisotropy: clamp01(readLayerNumber(spec.anisotropy, ['base', 'amount'], 0)),
    anisotropyRotation: readLayerNumber(spec.anisotropy, ['rotation'], 0),
    specularIntensity: clampPbrF0(readLayerNumber(spec.specularF0 ?? spec.f0 ?? spec.specularIntensity, ['base', 'value'], 1.0)),
    specularColor: new THREE.Color(typeof spec.specularColor === 'string' ? spec.specularColor : '#ffffff'),
    emissive: new THREE.Color(typeof spec.emissive === 'string' ? spec.emissive : '#000000'),
    emissiveIntensity: Math.max(0, readLayerNumber(spec.emissiveIntensity, ['base'], 1.0)),
    opacity: clamp01(readLayerNumber(spec.opacity, ['base'], 1)),
    transparent: readLayerNumber(spec.transmission, ['base', 'amount'], 0) > 0 || readLayerNumber(spec.opacity, ['base'], 1) < 1,
    alphaTest: Math.max(0, readLayerNumber(spec.alpha, ['cutoff', 'alphaTest'], 0)),
    wireframe: options.wireframe ?? false,
    side: spec.doubleSided === true ? THREE.DoubleSide : THREE.FrontSide,
    flatShading: spec.flatShading === true,
  });
  if (textures) {
    material.map = textures.albedo;
    material.roughnessMap = textures.roughness;
    material.normalMap = textures.normal;
    material.normalScale.setScalar(Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35)));
    material.aoMap = textures.ao;
    material.aoMap.channel = 0;
    material.aoMapIntensity = readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35);
    const denseMesh = denseComponent || spec.denseMesh === true || spec.geometryDensity === 'dense' || spec.topologyClass === 'dense';
    const bumpScale = Math.max(0, readLayerNumber(spec.bump, ['amplitude', 'strength'], 0));
    const effectiveBumpScale = denseMesh ? Math.max(0.05, bumpScale) : bumpScale;
    if (effectiveBumpScale > 0) {
      material.bumpMap = textures.height;
      material.bumpScale = effectiveBumpScale;
    }
    const displacementScale = Math.max(0, readLayerNumber(spec.displacement, ['amplitude', 'strength'], 0));
    const effectiveDisplacementScale = denseMesh ? Math.max(0.005, displacementScale) : displacementScale;
    if (effectiveDisplacementScale > 0) {
      material.displacementMap = textures.height;
      material.displacementScale = effectiveDisplacementScale;
      material.displacementBias = -effectiveDisplacementScale * 0.5;
    }
  }
  material.envMapIntensity = readLayerNumber(spec, ['envMapIntensity'], 0.8);
  material.userData.sculptMaterial = spec;
  material.userData.proceduralMapsIndependent = true;
  material.userData.pbrConstraints = { albedoRange: [30, 240], binaryMetalness: true, f0Range: [0.02, 1], iorRange: [1, 2.5] };
  material.userData.pbrTextureSource = textures?.source ?? 'flat-fallback';
  material.userData.referencePbr = spec.referencePbr ?? null;
  material.userData.referenceMaterialId = spec.referenceMaterialId ?? spec.materialReference?.profileId ?? null;
  material.userData.materialEvidence = spec.materialEvidence ?? null;
  material.userData.validationViews = spec.materialReference?.validationViews ?? [];
  material.needsUpdate = true;
  return material;
}

type AttachmentEndpoint = {
  start: THREE.Vector3;
  midpoint: THREE.Vector3;
  quaternion: THREE.Quaternion;
  length: number;
  baseRadius: number;
  endRadius: number;
};

function readVector3(value: unknown, fallback: [number, number, number]): THREE.Vector3 {
  if (Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === 'number')) {
    return new THREE.Vector3(value[0], value[1], value[2]);
  }
  return new THREE.Vector3(fallback[0], fallback[1], fallback[2]);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function makeAttachmentEndpoint(attachment: unknown): AttachmentEndpoint | null {
  if (!attachment || typeof attachment !== 'object') return null;
  const record = attachment as Record<string, unknown>;
  const start = readVector3(record.localStart, [0, 0, 0]);
  const end = readVector3(record.localEnd, [0, 1, 0]);
  const delta = end.clone().sub(start);
  const length = delta.length();
  if (length <= 0.0001) return null;
  const direction = delta.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  const baseRadius = Math.max(0.005, readNumber(record.baseRadius, 0.06));
  const endRadius = Math.max(0.003, readNumber(record.endRadius, baseRadius * 0.55));
  return {
    start,
    midpoint: delta.multiplyScalar(0.5),
    quaternion,
    length,
    baseRadius,
    endRadius,
  };
}

// Generated from ObjectSculptSpec target: Adventure Compass
// Sculpt build pass: blockout
// This factory is intentionally pass-gated. Finish browser screenshot review before unlocking deeper passes.
export function createAdventureCompassModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = "Adventure Compass";
  root.userData.reconstructionEvidence = {"itemFamily": null, "subtype": null, "componentAdapter": null, "route": null, "exactnessTier": null, "referenceCamera": {"solved": false, "fovDegrees": 40.0, "aspect": 1.0, "orientation": {"yaw": 0.0, "pitch": 0.0, "roll": 0.0}, "positionHint": [0.0, 0.0, 3.0], "note": "For likeness work, solve the reference camera (forge/stage1_intake/solve_camera_pose.py) so the review render aligns with the photo and the reference can be projected. Confirm by overlay review."}, "approximationNotes": []};
  root.userData.materialPipeline = {};
  root.userData.materialReferenceRegistry = null;

  const materialMap: Record<string, THREE.Material> = {};
  materialMap["mat-gold"] = createSculptMaterial(
    "mat-gold",
    {"id": "mat-gold", "name": "Stylized gold body", "type": "standard", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#F7B248", "color": "#F7B248", "albedo": {"dominant": "#F7B248", "secondary": ["#FFD07A", "#DE9026"], "samplingNotes": "Sampled from a full-resolution row scan of the reference (y=600), lit and shadowed values read separately so highlights are not baked into albedo."}, "colorVariation": {"palette": ["#F7B248", "#FFD07A", "#DE9026"], "pattern": "uniform", "amplitude": 0.03, "heightCorrelation": 0.0}, "roughness": {"base": 0.33, "variation": 0.05, "map": "uniform", "localResponse": "stylized icon surface: no cavity dirt, no edge wear"}, "metalness": {"base": 0.03, "variation": 0.0}, "ambientOcclusion": {"cavityStrength": 0.35, "contactShadowBias": 0.4, "notes": "The reference's only dark values are contact shadow under the rose and needle."}, "wear": {"edgeWear": 0.0, "scratches": [], "chips": []}, "dirt": {"amount": 0.0, "cavityBias": 0.0, "color": "#000000"}, "localOverrides": [{"id": "bezel-highlight-band", "description": "broad soft highlight band running upper-left to lower-right on the bezel", "channel": "roughness", "value": 0.32, "evidenceRef": "zone-bezel-left"}], "shaderNotes": ["Reads as a DIELECTRIC, not metal. Measured highlight (253,183,73), mid (223,140,31), terminator (196,116,27). Zero environment reflection in the reference, so metalness 1.0 would produce a mirrored look the reference does not have. metalness 0.15 keeps a faint metallic warmth without an environment.", "Textureless by observation: the reference is a flat-shaded stylized render with no map of any kind.", "Do not add procedural noise to chase 'realism' -- it would move the render AWAY from the reference."], "notes": "Replace with image-derived color, roughness, noise, and edge-wear notes.", "textureless": {"declared": true, "evidence": ["Full-resolution row scan (evidence/measure.py, y=600) shows each region as a smooth value ramp with no high-frequency component: no grain, print, pores or wear anywhere.", "The reference is a flat-shaded stylized icon render, not a photograph; its identity is silhouette, proportion and the boundaries between flat colour regions.", "zone-dial and zone-bezel-left crops inspected at 1:1 -- no texture detail present."]}},
    options
  );
  materialMap["mat-dial"] = createSculptMaterial(
    "mat-dial",
    {"id": "mat-dial", "name": "Dial plate cream", "type": "standard", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#FFF1D4", "color": "#FFF1D4", "albedo": {"dominant": "#FFF1D4", "secondary": ["#FFF6E2", "#F7DFB6"], "samplingNotes": "Sampled from a full-resolution row scan of the reference (y=600), lit and shadowed values read separately so highlights are not baked into albedo."}, "colorVariation": {"palette": ["#FFF1D4", "#FFF6E2", "#F7DFB6"], "pattern": "uniform", "amplitude": 0.03, "heightCorrelation": 0.0}, "roughness": {"base": 0.85, "variation": 0.05, "map": "uniform", "localResponse": "stylized icon surface: no cavity dirt, no edge wear"}, "metalness": {"base": 0.0, "variation": 0.0}, "ambientOcclusion": {"cavityStrength": 0.35, "contactShadowBias": 0.4, "notes": "The reference's only dark values are contact shadow under the rose and needle."}, "wear": {"edgeWear": 0.0, "scratches": [], "chips": []}, "dirt": {"amount": 0.0, "cavityBias": 0.0, "color": "#000000"}, "localOverrides": [], "shaderNotes": ["Matte cream dielectric, measured (251,220,172). Receives the rose and needle contact shadows.", "Textureless by observation: the reference is a flat-shaded stylized render with no map of any kind.", "Do not add procedural noise to chase 'realism' -- it would move the render AWAY from the reference."], "notes": "Replace with image-derived color, roughness, noise, and edge-wear notes.", "textureless": {"declared": true, "evidence": ["Full-resolution row scan (evidence/measure.py, y=600) shows each region as a smooth value ramp with no high-frequency component: no grain, print, pores or wear anywhere.", "The reference is a flat-shaded stylized icon render, not a photograph; its identity is silhouette, proportion and the boundaries between flat colour regions.", "zone-dial and zone-bezel-left crops inspected at 1:1 -- no texture detail present."]}},
    options
  );
  materialMap["mat-navy"] = createSculptMaterial(
    "mat-navy",
    {"id": "mat-navy", "name": "Rose and tick navy", "type": "standard", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#4F6178", "color": "#4F6178", "albedo": {"dominant": "#4F6178", "secondary": ["#304154", "#0C131C"], "samplingNotes": "Sampled from a full-resolution row scan of the reference (y=600), lit and shadowed values read separately so highlights are not baked into albedo."}, "colorVariation": {"palette": ["#4F6178", "#304154", "#0C131C"], "pattern": "uniform", "amplitude": 0.03, "heightCorrelation": 0.0}, "roughness": {"base": 0.75, "variation": 0.05, "map": "uniform", "localResponse": "stylized icon surface: no cavity dirt, no edge wear"}, "metalness": {"base": 0.0, "variation": 0.0}, "ambientOcclusion": {"cavityStrength": 0.35, "contactShadowBias": 0.4, "notes": "The reference's only dark values are contact shadow under the rose and needle."}, "wear": {"edgeWear": 0.0, "scratches": [], "chips": []}, "dirt": {"amount": 0.0, "cavityBias": 0.0, "color": "#000000"}, "localOverrides": [{"id": "facet-shading", "description": "lit facet (79,97,120) vs shadowed facet (48,65,88) comes from geometry, not albedo", "channel": "note", "value": 0.0, "evidenceRef": "zone-dial"}], "shaderNotes": ["Single navy albedo. The two-tone look on the rose is FACET SHADING from one albedo -- authoring two albedos here would be a misread of the reference.", "Textureless by observation: the reference is a flat-shaded stylized render with no map of any kind.", "Do not add procedural noise to chase 'realism' -- it would move the render AWAY from the reference."], "notes": "Replace with image-derived color, roughness, noise, and edge-wear notes.", "textureless": {"declared": true, "evidence": ["Full-resolution row scan (evidence/measure.py, y=600) shows each region as a smooth value ramp with no high-frequency component: no grain, print, pores or wear anywhere.", "The reference is a flat-shaded stylized icon render, not a photograph; its identity is silhouette, proportion and the boundaries between flat colour regions.", "zone-dial and zone-bezel-left crops inspected at 1:1 -- no texture detail present."]}},
    options
  );
  materialMap["mat-red"] = createSculptMaterial(
    "mat-red",
    {"id": "mat-red", "name": "Needle red", "type": "standard", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#F04E30", "color": "#F04E30", "albedo": {"dominant": "#F04E30", "secondary": ["#F44E2F", "#C5200E"], "samplingNotes": "Sampled from a full-resolution row scan of the reference (y=600), lit and shadowed values read separately so highlights are not baked into albedo."}, "colorVariation": {"palette": ["#F04E30", "#F44E2F", "#C5200E"], "pattern": "uniform", "amplitude": 0.03, "heightCorrelation": 0.0}, "roughness": {"base": 0.72, "variation": 0.05, "map": "uniform", "localResponse": "stylized icon surface: no cavity dirt, no edge wear"}, "metalness": {"base": 0.0, "variation": 0.0}, "ambientOcclusion": {"cavityStrength": 0.35, "contactShadowBias": 0.4, "notes": "The reference's only dark values are contact shadow under the rose and needle."}, "wear": {"edgeWear": 0.0, "scratches": [], "chips": []}, "dirt": {"amount": 0.0, "cavityBias": 0.0, "color": "#000000"}, "localOverrides": [], "shaderNotes": ["Matte red-orange dielectric, measured lit (244,78,48) and shadowed (197,32,14).", "Textureless by observation: the reference is a flat-shaded stylized render with no map of any kind.", "Do not add procedural noise to chase 'realism' -- it would move the render AWAY from the reference."], "notes": "Replace with image-derived color, roughness, noise, and edge-wear notes.", "textureless": {"declared": true, "evidence": ["Full-resolution row scan (evidence/measure.py, y=600) shows each region as a smooth value ramp with no high-frequency component: no grain, print, pores or wear anywhere.", "The reference is a flat-shaded stylized icon render, not a photograph; its identity is silhouette, proportion and the boundaries between flat colour regions.", "zone-dial and zone-bezel-left crops inspected at 1:1 -- no texture detail present."]}},
    options
  );

  const nodes: Record<string, THREE.Object3D> = { root };
  const meshes: Record<string, THREE.Mesh> = {};
  const sockets: Record<string, THREE.Object3D> = {};
  const colliders: Record<string, unknown> = {};
  const destructionGroups: Record<string, THREE.Object3D[]> = {};

  const endpoint_case_body_0 = makeAttachmentEndpoint(null);
  const node_case_body_0 = new THREE.Group();
  node_case_body_0.name = "Compass case (lathed body: back plate, side wall, bezel)__pivot";
  node_case_body_0.scale.set(1, 1, 1);
  if (endpoint_case_body_0) {
    node_case_body_0.position.copy(endpoint_case_body_0.start);
    node_case_body_0.rotation.set(1.5708, 0.0, 0.0);
  } else {
    node_case_body_0.position.set(0.0, 0.0, 0.0);
    node_case_body_0.rotation.set(1.5708, 0.0, 0.0);
  }
  node_case_body_0.userData.sculptComponent = {"id": "case-body", "name": "Compass case (lathed body: back plate, side wall, bezel)", "level": "macro", "role": "body", "importance": 1.0, "confidence": 0.85, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "One continuous lathed profile from back plate to bezel lip. The reference silhouette has no hard corner anywhere; splitting this into box/cylinder parts would introduce seams the reference does not have. A revolved profile also gives the large-radius rim round for free.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "latheProfile": {"points": [[0.0, -0.5], [0.3, -0.5], [0.42, -0.44], [0.48, -0.3], [0.5, -0.05], [0.495, 0.23], [0.47, 0.38], [0.435, 0.462], [0.405, 0.5], [0.3645, 0.47], [0.3645, 0.18], [0.0, 0.18]], "segments": 96}}, "parent": null, "attachment": null, "dimensions": {"width": 1.0, "height": 0.22, "depth": 1.0, "units": "scale factors on the emitted primitive; target world size (1.0, 0.22, 1.0) in units of case diameter = 1.0", "targetWorldSize": [1.0, 0.22, 1.0], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [1.5708, 0, 0]}, "actionProfile": {"animationRole": "body", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "bezel-round", "description": "large-radius round on the outer rim, 0.1355 D wide measured", "type": "fillet"}, {"id": "dial-recess", "description": "dial plate sits recessed 0.04 D below the bezel top face", "type": "recess"}, {"id": "bezel-width", "description": "bezel ring is 0.271 of the case radius, measured, not eyeballed", "type": "proportion"}, {"id": "bezel-fillet", "description": "every bezel edge is a large-radius round; no hard corner in the silhouette", "type": "fillet"}], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object", "zone-bezel-left"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_case_body_0.userData.actionProfile = {"animationRole": "body", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["root"] ?? root).add(node_case_body_0);
  nodes["case-body"] = node_case_body_0;
  const mesh_case_body_0Geometry = endpoint_case_body_0
    ? new THREE.CylinderGeometry(endpoint_case_body_0.endRadius, endpoint_case_body_0.baseRadius, endpoint_case_body_0.length, 32, 12)
    : buildLatheGeometry({"points": [[0.0, -0.5], [0.3, -0.5], [0.42, -0.44], [0.48, -0.3], [0.5, -0.05], [0.495, 0.23], [0.47, 0.38], [0.435, 0.462], [0.405, 0.5], [0.3645, 0.47], [0.3645, 0.18], [0.0, 0.18]], "segments": 96});
  if (!endpoint_case_body_0) {
    mesh_case_body_0Geometry.scale(1.0, 0.22, 1.0);
  }
  const mesh_case_body_0 = new THREE.Mesh(
    mesh_case_body_0Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_case_body_0.name = "Compass case (lathed body: back plate, side wall, bezel)";
  if (endpoint_case_body_0) {
    mesh_case_body_0.position.copy(endpoint_case_body_0.midpoint);
    mesh_case_body_0.quaternion.copy(endpoint_case_body_0.quaternion);
  }
  mesh_case_body_0.castShadow = options.castShadow ?? true;
  mesh_case_body_0.receiveShadow = options.receiveShadow ?? true;
  mesh_case_body_0.userData.sculptComponent = {"id": "case-body", "name": "Compass case (lathed body: back plate, side wall, bezel)", "level": "macro", "role": "body", "importance": 1.0, "confidence": 0.85, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "One continuous lathed profile from back plate to bezel lip. The reference silhouette has no hard corner anywhere; splitting this into box/cylinder parts would introduce seams the reference does not have. A revolved profile also gives the large-radius rim round for free.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "latheProfile": {"points": [[0.0, -0.5], [0.3, -0.5], [0.42, -0.44], [0.48, -0.3], [0.5, -0.05], [0.495, 0.23], [0.47, 0.38], [0.435, 0.462], [0.405, 0.5], [0.3645, 0.47], [0.3645, 0.18], [0.0, 0.18]], "segments": 96}}, "parent": null, "attachment": null, "dimensions": {"width": 1.0, "height": 0.22, "depth": 1.0, "units": "scale factors on the emitted primitive; target world size (1.0, 0.22, 1.0) in units of case diameter = 1.0", "targetWorldSize": [1.0, 0.22, 1.0], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [1.5708, 0, 0]}, "actionProfile": {"animationRole": "body", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "bezel-round", "description": "large-radius round on the outer rim, 0.1355 D wide measured", "type": "fillet"}, {"id": "dial-recess", "description": "dial plate sits recessed 0.04 D below the bezel top face", "type": "recess"}, {"id": "bezel-width", "description": "bezel ring is 0.271 of the case radius, measured, not eyeballed", "type": "proportion"}, {"id": "bezel-fillet", "description": "every bezel edge is a large-radius round; no hard corner in the silhouette", "type": "fillet"}], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object", "zone-bezel-left"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_case_body_0.add(mesh_case_body_0);
  meshes["case-body"] = mesh_case_body_0;
  colliders["case-body"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_case_body_0);

  const attachment_dial_plate_1 = {"parentSocket": "case-inner-floor", "contactType": "socket", "embedDepth": 0.004, "gapTolerance": 0.0, "localStart": [0, 0.078, 0], "localEnd": [0, 0.108, 0], "baseRadius": 0.3645, "endRadius": 0.3645};
  const endpoint_dial_plate_1 = makeAttachmentEndpoint(attachment_dial_plate_1);
  const node_dial_plate_1 = new THREE.Group();
  node_dial_plate_1.name = "Dial plate (cream face)__pivot";
  node_dial_plate_1.scale.set(1, 1, 1);
  if (endpoint_dial_plate_1) {
    node_dial_plate_1.position.copy(endpoint_dial_plate_1.start);
    node_dial_plate_1.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_dial_plate_1.position.set(0.0, 0.0, 0.0);
    node_dial_plate_1.rotation.set(0.0, 0.0, 0.0);
  }
  node_dial_plate_1.userData.sculptComponent = {"id": "dial-plate", "name": "Dial plate (cream face)", "level": "meso", "role": "surface", "importance": 0.9, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Flat disc recessed inside the case; a cylinder is exact for a lathed flat face.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "case-body", "attachment": {"parentSocket": "case-inner-floor", "contactType": "socket", "embedDepth": 0.004, "gapTolerance": 0.0, "localStart": [0, 0.078, 0], "localEnd": [0, 0.108, 0], "baseRadius": 0.3645, "endRadius": 0.3645}, "dimensions": {"width": 0.729, "height": 0.03, "depth": 0.729, "units": "scale factors on the emitted primitive; target world size (0.729, 0.03, 0.729) in units of case diameter = 1.0", "targetWorldSize": [0.729, 0.03, 0.729], "confidence": 0.9}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "surface", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-dial", "materialLayers": ["mat-dial"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "recess-wall-shading", "description": "darker cream band along the lower-right inner edge is occlusion, not albedo", "type": "shading-note"}, {"id": "tick-ring-12", "description": "12 navy capsule ticks at 30 deg spacing, r/R 0.87 of the dial radius", "type": "marking-group"}, {"id": "rose-8-point", "description": "8-point rose: 4 long points to r/R 0.90, 4 short to r/R 0.66, raised off the plate", "type": "marking-group"}], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(251, 220, 172, 1)", "secondaryAlbedo": "rgba(239, 203, 153, 1)", "materialClass": "plastic", "materialClassConfidence": 0.8, "colorGradient": {"type": "radial", "stops": [{"position": 0.0, "color": "rgba(252, 224, 180, 1)"}, {"position": 1.0, "color": "rgba(239, 203, 153, 1)"}]}}};
  node_dial_plate_1.userData.actionProfile = {"animationRole": "surface", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["case-body"] ?? root).add(node_dial_plate_1);
  nodes["dial-plate"] = node_dial_plate_1;
  const mesh_dial_plate_1Geometry = endpoint_dial_plate_1
    ? new THREE.CylinderGeometry(endpoint_dial_plate_1.endRadius, endpoint_dial_plate_1.baseRadius, endpoint_dial_plate_1.length, 32, 12)
    : new THREE.CylinderGeometry(0.5, 0.5, 1, 48, 16);
  if (!endpoint_dial_plate_1) {
    mesh_dial_plate_1Geometry.scale(0.729, 0.03, 0.729);
  }
  const mesh_dial_plate_1 = new THREE.Mesh(
    mesh_dial_plate_1Geometry,
    materialMap["mat-dial"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_dial_plate_1.name = "Dial plate (cream face)";
  if (endpoint_dial_plate_1) {
    mesh_dial_plate_1.position.copy(endpoint_dial_plate_1.midpoint);
    mesh_dial_plate_1.quaternion.copy(endpoint_dial_plate_1.quaternion);
  }
  mesh_dial_plate_1.castShadow = options.castShadow ?? true;
  mesh_dial_plate_1.receiveShadow = options.receiveShadow ?? true;
  mesh_dial_plate_1.userData.sculptComponent = {"id": "dial-plate", "name": "Dial plate (cream face)", "level": "meso", "role": "surface", "importance": 0.9, "confidence": 0.9, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Flat disc recessed inside the case; a cylinder is exact for a lathed flat face.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "case-body", "attachment": {"parentSocket": "case-inner-floor", "contactType": "socket", "embedDepth": 0.004, "gapTolerance": 0.0, "localStart": [0, 0.078, 0], "localEnd": [0, 0.108, 0], "baseRadius": 0.3645, "endRadius": 0.3645}, "dimensions": {"width": 0.729, "height": 0.03, "depth": 0.729, "units": "scale factors on the emitted primitive; target world size (0.729, 0.03, 0.729) in units of case diameter = 1.0", "targetWorldSize": [0.729, 0.03, 0.729], "confidence": 0.9}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "surface", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-dial", "materialLayers": ["mat-dial"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "recess-wall-shading", "description": "darker cream band along the lower-right inner edge is occlusion, not albedo", "type": "shading-note"}, {"id": "tick-ring-12", "description": "12 navy capsule ticks at 30 deg spacing, r/R 0.87 of the dial radius", "type": "marking-group"}, {"id": "rose-8-point", "description": "8-point rose: 4 long points to r/R 0.90, 4 short to r/R 0.66, raised off the plate", "type": "marking-group"}], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(251, 220, 172, 1)", "secondaryAlbedo": "rgba(239, 203, 153, 1)", "materialClass": "plastic", "materialClassConfidence": 0.8, "colorGradient": {"type": "radial", "stops": [{"position": 0.0, "color": "rgba(252, 224, 180, 1)"}, {"position": 1.0, "color": "rgba(239, 203, 153, 1)"}]}}};
  node_dial_plate_1.add(mesh_dial_plate_1);
  meshes["dial-plate"] = mesh_dial_plate_1;
  colliders["dial-plate"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_dial_plate_1);

  const attachment_tick_01_2 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.26255, 0.034, -0.13033], "localEnd": [0.30554, 0.034, -0.15167], "baseRadius": 0.0135, "endRadius": 0.0135};
  const endpoint_tick_01_2 = makeAttachmentEndpoint(attachment_tick_01_2);
  const node_tick_01_2 = new THREE.Group();
  node_tick_01_2.name = "Tick capsule 1 (26 deg)__pivot";
  node_tick_01_2.scale.set(1, 1, 1);
  if (endpoint_tick_01_2) {
    node_tick_01_2.position.copy(endpoint_tick_01_2.start);
    node_tick_01_2.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_tick_01_2.position.set(0.0, 0.0, 0.0);
    node_tick_01_2.rotation.set(0.0, 0.0, 0.0);
  }
  node_tick_01_2.userData.sculptComponent = {"id": "tick-01", "name": "Tick capsule 1 (26 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.26255, 0.034, -0.13033], "localEnd": [0.30554, 0.034, -0.15167], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_01_2.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_tick_01_2);
  nodes["tick-01"] = node_tick_01_2;
  const mesh_tick_01_2Geometry = endpoint_tick_01_2
    ? new THREE.CylinderGeometry(endpoint_tick_01_2.endRadius, endpoint_tick_01_2.baseRadius, endpoint_tick_01_2.length, 32, 12)
    : buildWatertightCapsule(0.35, 0.7, 16, 32, 1);
  if (!endpoint_tick_01_2) {
    mesh_tick_01_2Geometry.scale(0.038571, 0.034286, 0.018571);
  }
  const mesh_tick_01_2 = new THREE.Mesh(
    mesh_tick_01_2Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_tick_01_2.name = "Tick capsule 1 (26 deg)";
  if (endpoint_tick_01_2) {
    mesh_tick_01_2.position.copy(endpoint_tick_01_2.midpoint);
    mesh_tick_01_2.quaternion.copy(endpoint_tick_01_2.quaternion);
  }
  mesh_tick_01_2.castShadow = options.castShadow ?? true;
  mesh_tick_01_2.receiveShadow = options.receiveShadow ?? true;
  mesh_tick_01_2.userData.sculptComponent = {"id": "tick-01", "name": "Tick capsule 1 (26 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.26255, 0.034, -0.13033], "localEnd": [0.30554, 0.034, -0.15167], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_01_2.add(mesh_tick_01_2);
  meshes["tick-01"] = mesh_tick_01_2;
  colliders["tick-01"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_tick_01_2);

  const attachment_tick_02_3 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.16221, 0.034, -0.24414], "localEnd": [0.18877, 0.034, -0.28412], "baseRadius": 0.0135, "endRadius": 0.0135};
  const endpoint_tick_02_3 = makeAttachmentEndpoint(attachment_tick_02_3);
  const node_tick_02_3 = new THREE.Group();
  node_tick_02_3.name = "Tick capsule 2 (56 deg)__pivot";
  node_tick_02_3.scale.set(1, 1, 1);
  if (endpoint_tick_02_3) {
    node_tick_02_3.position.copy(endpoint_tick_02_3.start);
    node_tick_02_3.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_tick_02_3.position.set(0.0, 0.0, 0.0);
    node_tick_02_3.rotation.set(0.0, 0.0, 0.0);
  }
  node_tick_02_3.userData.sculptComponent = {"id": "tick-02", "name": "Tick capsule 2 (56 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.16221, 0.034, -0.24414], "localEnd": [0.18877, 0.034, -0.28412], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_02_3.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_tick_02_3);
  nodes["tick-02"] = node_tick_02_3;
  const mesh_tick_02_3Geometry = endpoint_tick_02_3
    ? new THREE.CylinderGeometry(endpoint_tick_02_3.endRadius, endpoint_tick_02_3.baseRadius, endpoint_tick_02_3.length, 32, 12)
    : buildWatertightCapsule(0.35, 0.7, 16, 32, 1);
  if (!endpoint_tick_02_3) {
    mesh_tick_02_3Geometry.scale(0.038571, 0.034286, 0.018571);
  }
  const mesh_tick_02_3 = new THREE.Mesh(
    mesh_tick_02_3Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_tick_02_3.name = "Tick capsule 2 (56 deg)";
  if (endpoint_tick_02_3) {
    mesh_tick_02_3.position.copy(endpoint_tick_02_3.midpoint);
    mesh_tick_02_3.quaternion.copy(endpoint_tick_02_3.quaternion);
  }
  mesh_tick_02_3.castShadow = options.castShadow ?? true;
  mesh_tick_02_3.receiveShadow = options.receiveShadow ?? true;
  mesh_tick_02_3.userData.sculptComponent = {"id": "tick-02", "name": "Tick capsule 2 (56 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.16221, 0.034, -0.24414], "localEnd": [0.18877, 0.034, -0.28412], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_02_3.add(mesh_tick_02_3);
  meshes["tick-02"] = mesh_tick_02_3;
  colliders["tick-02"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_tick_02_3);

  const attachment_tick_03_4 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.0184, 0.034, -0.29254], "localEnd": [0.02142, 0.034, -0.34044], "baseRadius": 0.0135, "endRadius": 0.0135};
  const endpoint_tick_03_4 = makeAttachmentEndpoint(attachment_tick_03_4);
  const node_tick_03_4 = new THREE.Group();
  node_tick_03_4.name = "Tick capsule 3 (86 deg)__pivot";
  node_tick_03_4.scale.set(1, 1, 1);
  if (endpoint_tick_03_4) {
    node_tick_03_4.position.copy(endpoint_tick_03_4.start);
    node_tick_03_4.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_tick_03_4.position.set(0.0, 0.0, 0.0);
    node_tick_03_4.rotation.set(0.0, 0.0, 0.0);
  }
  node_tick_03_4.userData.sculptComponent = {"id": "tick-03", "name": "Tick capsule 3 (86 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.0184, 0.034, -0.29254], "localEnd": [0.02142, 0.034, -0.34044], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_03_4.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_tick_03_4);
  nodes["tick-03"] = node_tick_03_4;
  const mesh_tick_03_4Geometry = endpoint_tick_03_4
    ? new THREE.CylinderGeometry(endpoint_tick_03_4.endRadius, endpoint_tick_03_4.baseRadius, endpoint_tick_03_4.length, 32, 12)
    : buildWatertightCapsule(0.35, 0.7, 16, 32, 1);
  if (!endpoint_tick_03_4) {
    mesh_tick_03_4Geometry.scale(0.038571, 0.034286, 0.018571);
  }
  const mesh_tick_03_4 = new THREE.Mesh(
    mesh_tick_03_4Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_tick_03_4.name = "Tick capsule 3 (86 deg)";
  if (endpoint_tick_03_4) {
    mesh_tick_03_4.position.copy(endpoint_tick_03_4.midpoint);
    mesh_tick_03_4.quaternion.copy(endpoint_tick_03_4.quaternion);
  }
  mesh_tick_03_4.castShadow = options.castShadow ?? true;
  mesh_tick_03_4.receiveShadow = options.receiveShadow ?? true;
  mesh_tick_03_4.userData.sculptComponent = {"id": "tick-03", "name": "Tick capsule 3 (86 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.0184, 0.034, -0.29254], "localEnd": [0.02142, 0.034, -0.34044], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_03_4.add(mesh_tick_03_4);
  meshes["tick-03"] = mesh_tick_03_4;
  colliders["tick-03"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_tick_03_4);

  const attachment_tick_04_5 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.13033, 0.034, -0.26255], "localEnd": [-0.15167, 0.034, -0.30554], "baseRadius": 0.0135, "endRadius": 0.0135};
  const endpoint_tick_04_5 = makeAttachmentEndpoint(attachment_tick_04_5);
  const node_tick_04_5 = new THREE.Group();
  node_tick_04_5.name = "Tick capsule 4 (116 deg)__pivot";
  node_tick_04_5.scale.set(1, 1, 1);
  if (endpoint_tick_04_5) {
    node_tick_04_5.position.copy(endpoint_tick_04_5.start);
    node_tick_04_5.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_tick_04_5.position.set(0.0, 0.0, 0.0);
    node_tick_04_5.rotation.set(0.0, 0.0, 0.0);
  }
  node_tick_04_5.userData.sculptComponent = {"id": "tick-04", "name": "Tick capsule 4 (116 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.13033, 0.034, -0.26255], "localEnd": [-0.15167, 0.034, -0.30554], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_04_5.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_tick_04_5);
  nodes["tick-04"] = node_tick_04_5;
  const mesh_tick_04_5Geometry = endpoint_tick_04_5
    ? new THREE.CylinderGeometry(endpoint_tick_04_5.endRadius, endpoint_tick_04_5.baseRadius, endpoint_tick_04_5.length, 32, 12)
    : buildWatertightCapsule(0.35, 0.7, 16, 32, 1);
  if (!endpoint_tick_04_5) {
    mesh_tick_04_5Geometry.scale(0.038571, 0.034286, 0.018571);
  }
  const mesh_tick_04_5 = new THREE.Mesh(
    mesh_tick_04_5Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_tick_04_5.name = "Tick capsule 4 (116 deg)";
  if (endpoint_tick_04_5) {
    mesh_tick_04_5.position.copy(endpoint_tick_04_5.midpoint);
    mesh_tick_04_5.quaternion.copy(endpoint_tick_04_5.quaternion);
  }
  mesh_tick_04_5.castShadow = options.castShadow ?? true;
  mesh_tick_04_5.receiveShadow = options.receiveShadow ?? true;
  mesh_tick_04_5.userData.sculptComponent = {"id": "tick-04", "name": "Tick capsule 4 (116 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.13033, 0.034, -0.26255], "localEnd": [-0.15167, 0.034, -0.30554], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_04_5.add(mesh_tick_04_5);
  meshes["tick-04"] = mesh_tick_04_5;
  colliders["tick-04"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_tick_04_5);

  const attachment_tick_05_6 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.24414, 0.034, -0.16221], "localEnd": [-0.28412, 0.034, -0.18877], "baseRadius": 0.0135, "endRadius": 0.0135};
  const endpoint_tick_05_6 = makeAttachmentEndpoint(attachment_tick_05_6);
  const node_tick_05_6 = new THREE.Group();
  node_tick_05_6.name = "Tick capsule 5 (146 deg)__pivot";
  node_tick_05_6.scale.set(1, 1, 1);
  if (endpoint_tick_05_6) {
    node_tick_05_6.position.copy(endpoint_tick_05_6.start);
    node_tick_05_6.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_tick_05_6.position.set(0.0, 0.0, 0.0);
    node_tick_05_6.rotation.set(0.0, 0.0, 0.0);
  }
  node_tick_05_6.userData.sculptComponent = {"id": "tick-05", "name": "Tick capsule 5 (146 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.24414, 0.034, -0.16221], "localEnd": [-0.28412, 0.034, -0.18877], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_05_6.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_tick_05_6);
  nodes["tick-05"] = node_tick_05_6;
  const mesh_tick_05_6Geometry = endpoint_tick_05_6
    ? new THREE.CylinderGeometry(endpoint_tick_05_6.endRadius, endpoint_tick_05_6.baseRadius, endpoint_tick_05_6.length, 32, 12)
    : buildWatertightCapsule(0.35, 0.7, 16, 32, 1);
  if (!endpoint_tick_05_6) {
    mesh_tick_05_6Geometry.scale(0.038571, 0.034286, 0.018571);
  }
  const mesh_tick_05_6 = new THREE.Mesh(
    mesh_tick_05_6Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_tick_05_6.name = "Tick capsule 5 (146 deg)";
  if (endpoint_tick_05_6) {
    mesh_tick_05_6.position.copy(endpoint_tick_05_6.midpoint);
    mesh_tick_05_6.quaternion.copy(endpoint_tick_05_6.quaternion);
  }
  mesh_tick_05_6.castShadow = options.castShadow ?? true;
  mesh_tick_05_6.receiveShadow = options.receiveShadow ?? true;
  mesh_tick_05_6.userData.sculptComponent = {"id": "tick-05", "name": "Tick capsule 5 (146 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.24414, 0.034, -0.16221], "localEnd": [-0.28412, 0.034, -0.18877], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_05_6.add(mesh_tick_05_6);
  meshes["tick-05"] = mesh_tick_05_6;
  colliders["tick-05"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_tick_05_6);

  const attachment_tick_06_7 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.29254, 0.034, -0.0184], "localEnd": [-0.34044, 0.034, -0.02142], "baseRadius": 0.0135, "endRadius": 0.0135};
  const endpoint_tick_06_7 = makeAttachmentEndpoint(attachment_tick_06_7);
  const node_tick_06_7 = new THREE.Group();
  node_tick_06_7.name = "Tick capsule 6 (176 deg)__pivot";
  node_tick_06_7.scale.set(1, 1, 1);
  if (endpoint_tick_06_7) {
    node_tick_06_7.position.copy(endpoint_tick_06_7.start);
    node_tick_06_7.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_tick_06_7.position.set(0.0, 0.0, 0.0);
    node_tick_06_7.rotation.set(0.0, 0.0, 0.0);
  }
  node_tick_06_7.userData.sculptComponent = {"id": "tick-06", "name": "Tick capsule 6 (176 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.29254, 0.034, -0.0184], "localEnd": [-0.34044, 0.034, -0.02142], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_06_7.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_tick_06_7);
  nodes["tick-06"] = node_tick_06_7;
  const mesh_tick_06_7Geometry = endpoint_tick_06_7
    ? new THREE.CylinderGeometry(endpoint_tick_06_7.endRadius, endpoint_tick_06_7.baseRadius, endpoint_tick_06_7.length, 32, 12)
    : buildWatertightCapsule(0.35, 0.7, 16, 32, 1);
  if (!endpoint_tick_06_7) {
    mesh_tick_06_7Geometry.scale(0.038571, 0.034286, 0.018571);
  }
  const mesh_tick_06_7 = new THREE.Mesh(
    mesh_tick_06_7Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_tick_06_7.name = "Tick capsule 6 (176 deg)";
  if (endpoint_tick_06_7) {
    mesh_tick_06_7.position.copy(endpoint_tick_06_7.midpoint);
    mesh_tick_06_7.quaternion.copy(endpoint_tick_06_7.quaternion);
  }
  mesh_tick_06_7.castShadow = options.castShadow ?? true;
  mesh_tick_06_7.receiveShadow = options.receiveShadow ?? true;
  mesh_tick_06_7.userData.sculptComponent = {"id": "tick-06", "name": "Tick capsule 6 (176 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.29254, 0.034, -0.0184], "localEnd": [-0.34044, 0.034, -0.02142], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_06_7.add(mesh_tick_06_7);
  meshes["tick-06"] = mesh_tick_06_7;
  colliders["tick-06"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_tick_06_7);

  const attachment_tick_07_8 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.26255, 0.034, 0.13033], "localEnd": [-0.30554, 0.034, 0.15167], "baseRadius": 0.0135, "endRadius": 0.0135};
  const endpoint_tick_07_8 = makeAttachmentEndpoint(attachment_tick_07_8);
  const node_tick_07_8 = new THREE.Group();
  node_tick_07_8.name = "Tick capsule 7 (206 deg)__pivot";
  node_tick_07_8.scale.set(1, 1, 1);
  if (endpoint_tick_07_8) {
    node_tick_07_8.position.copy(endpoint_tick_07_8.start);
    node_tick_07_8.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_tick_07_8.position.set(0.0, 0.0, 0.0);
    node_tick_07_8.rotation.set(0.0, 0.0, 0.0);
  }
  node_tick_07_8.userData.sculptComponent = {"id": "tick-07", "name": "Tick capsule 7 (206 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.26255, 0.034, 0.13033], "localEnd": [-0.30554, 0.034, 0.15167], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_07_8.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_tick_07_8);
  nodes["tick-07"] = node_tick_07_8;
  const mesh_tick_07_8Geometry = endpoint_tick_07_8
    ? new THREE.CylinderGeometry(endpoint_tick_07_8.endRadius, endpoint_tick_07_8.baseRadius, endpoint_tick_07_8.length, 32, 12)
    : buildWatertightCapsule(0.35, 0.7, 16, 32, 1);
  if (!endpoint_tick_07_8) {
    mesh_tick_07_8Geometry.scale(0.038571, 0.034286, 0.018571);
  }
  const mesh_tick_07_8 = new THREE.Mesh(
    mesh_tick_07_8Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_tick_07_8.name = "Tick capsule 7 (206 deg)";
  if (endpoint_tick_07_8) {
    mesh_tick_07_8.position.copy(endpoint_tick_07_8.midpoint);
    mesh_tick_07_8.quaternion.copy(endpoint_tick_07_8.quaternion);
  }
  mesh_tick_07_8.castShadow = options.castShadow ?? true;
  mesh_tick_07_8.receiveShadow = options.receiveShadow ?? true;
  mesh_tick_07_8.userData.sculptComponent = {"id": "tick-07", "name": "Tick capsule 7 (206 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.26255, 0.034, 0.13033], "localEnd": [-0.30554, 0.034, 0.15167], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_07_8.add(mesh_tick_07_8);
  meshes["tick-07"] = mesh_tick_07_8;
  colliders["tick-07"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_tick_07_8);

  const attachment_tick_08_9 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.16221, 0.034, 0.24414], "localEnd": [-0.18877, 0.034, 0.28412], "baseRadius": 0.0135, "endRadius": 0.0135};
  const endpoint_tick_08_9 = makeAttachmentEndpoint(attachment_tick_08_9);
  const node_tick_08_9 = new THREE.Group();
  node_tick_08_9.name = "Tick capsule 8 (236 deg)__pivot";
  node_tick_08_9.scale.set(1, 1, 1);
  if (endpoint_tick_08_9) {
    node_tick_08_9.position.copy(endpoint_tick_08_9.start);
    node_tick_08_9.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_tick_08_9.position.set(0.0, 0.0, 0.0);
    node_tick_08_9.rotation.set(0.0, 0.0, 0.0);
  }
  node_tick_08_9.userData.sculptComponent = {"id": "tick-08", "name": "Tick capsule 8 (236 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.16221, 0.034, 0.24414], "localEnd": [-0.18877, 0.034, 0.28412], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_08_9.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_tick_08_9);
  nodes["tick-08"] = node_tick_08_9;
  const mesh_tick_08_9Geometry = endpoint_tick_08_9
    ? new THREE.CylinderGeometry(endpoint_tick_08_9.endRadius, endpoint_tick_08_9.baseRadius, endpoint_tick_08_9.length, 32, 12)
    : buildWatertightCapsule(0.35, 0.7, 16, 32, 1);
  if (!endpoint_tick_08_9) {
    mesh_tick_08_9Geometry.scale(0.038571, 0.034286, 0.018571);
  }
  const mesh_tick_08_9 = new THREE.Mesh(
    mesh_tick_08_9Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_tick_08_9.name = "Tick capsule 8 (236 deg)";
  if (endpoint_tick_08_9) {
    mesh_tick_08_9.position.copy(endpoint_tick_08_9.midpoint);
    mesh_tick_08_9.quaternion.copy(endpoint_tick_08_9.quaternion);
  }
  mesh_tick_08_9.castShadow = options.castShadow ?? true;
  mesh_tick_08_9.receiveShadow = options.receiveShadow ?? true;
  mesh_tick_08_9.userData.sculptComponent = {"id": "tick-08", "name": "Tick capsule 8 (236 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.16221, 0.034, 0.24414], "localEnd": [-0.18877, 0.034, 0.28412], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_08_9.add(mesh_tick_08_9);
  meshes["tick-08"] = mesh_tick_08_9;
  colliders["tick-08"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_tick_08_9);

  const attachment_tick_09_10 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.0184, 0.034, 0.29254], "localEnd": [-0.02142, 0.034, 0.34044], "baseRadius": 0.0135, "endRadius": 0.0135};
  const endpoint_tick_09_10 = makeAttachmentEndpoint(attachment_tick_09_10);
  const node_tick_09_10 = new THREE.Group();
  node_tick_09_10.name = "Tick capsule 9 (266 deg)__pivot";
  node_tick_09_10.scale.set(1, 1, 1);
  if (endpoint_tick_09_10) {
    node_tick_09_10.position.copy(endpoint_tick_09_10.start);
    node_tick_09_10.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_tick_09_10.position.set(0.0, 0.0, 0.0);
    node_tick_09_10.rotation.set(0.0, 0.0, 0.0);
  }
  node_tick_09_10.userData.sculptComponent = {"id": "tick-09", "name": "Tick capsule 9 (266 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.0184, 0.034, 0.29254], "localEnd": [-0.02142, 0.034, 0.34044], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_09_10.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_tick_09_10);
  nodes["tick-09"] = node_tick_09_10;
  const mesh_tick_09_10Geometry = endpoint_tick_09_10
    ? new THREE.CylinderGeometry(endpoint_tick_09_10.endRadius, endpoint_tick_09_10.baseRadius, endpoint_tick_09_10.length, 32, 12)
    : buildWatertightCapsule(0.35, 0.7, 16, 32, 1);
  if (!endpoint_tick_09_10) {
    mesh_tick_09_10Geometry.scale(0.038571, 0.034286, 0.018571);
  }
  const mesh_tick_09_10 = new THREE.Mesh(
    mesh_tick_09_10Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_tick_09_10.name = "Tick capsule 9 (266 deg)";
  if (endpoint_tick_09_10) {
    mesh_tick_09_10.position.copy(endpoint_tick_09_10.midpoint);
    mesh_tick_09_10.quaternion.copy(endpoint_tick_09_10.quaternion);
  }
  mesh_tick_09_10.castShadow = options.castShadow ?? true;
  mesh_tick_09_10.receiveShadow = options.receiveShadow ?? true;
  mesh_tick_09_10.userData.sculptComponent = {"id": "tick-09", "name": "Tick capsule 9 (266 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [-0.0184, 0.034, 0.29254], "localEnd": [-0.02142, 0.034, 0.34044], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_09_10.add(mesh_tick_09_10);
  meshes["tick-09"] = mesh_tick_09_10;
  colliders["tick-09"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_tick_09_10);

  const attachment_tick_10_11 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.13033, 0.034, 0.26255], "localEnd": [0.15167, 0.034, 0.30554], "baseRadius": 0.0135, "endRadius": 0.0135};
  const endpoint_tick_10_11 = makeAttachmentEndpoint(attachment_tick_10_11);
  const node_tick_10_11 = new THREE.Group();
  node_tick_10_11.name = "Tick capsule 10 (296 deg)__pivot";
  node_tick_10_11.scale.set(1, 1, 1);
  if (endpoint_tick_10_11) {
    node_tick_10_11.position.copy(endpoint_tick_10_11.start);
    node_tick_10_11.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_tick_10_11.position.set(0.0, 0.0, 0.0);
    node_tick_10_11.rotation.set(0.0, 0.0, 0.0);
  }
  node_tick_10_11.userData.sculptComponent = {"id": "tick-10", "name": "Tick capsule 10 (296 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.13033, 0.034, 0.26255], "localEnd": [0.15167, 0.034, 0.30554], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_10_11.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_tick_10_11);
  nodes["tick-10"] = node_tick_10_11;
  const mesh_tick_10_11Geometry = endpoint_tick_10_11
    ? new THREE.CylinderGeometry(endpoint_tick_10_11.endRadius, endpoint_tick_10_11.baseRadius, endpoint_tick_10_11.length, 32, 12)
    : buildWatertightCapsule(0.35, 0.7, 16, 32, 1);
  if (!endpoint_tick_10_11) {
    mesh_tick_10_11Geometry.scale(0.038571, 0.034286, 0.018571);
  }
  const mesh_tick_10_11 = new THREE.Mesh(
    mesh_tick_10_11Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_tick_10_11.name = "Tick capsule 10 (296 deg)";
  if (endpoint_tick_10_11) {
    mesh_tick_10_11.position.copy(endpoint_tick_10_11.midpoint);
    mesh_tick_10_11.quaternion.copy(endpoint_tick_10_11.quaternion);
  }
  mesh_tick_10_11.castShadow = options.castShadow ?? true;
  mesh_tick_10_11.receiveShadow = options.receiveShadow ?? true;
  mesh_tick_10_11.userData.sculptComponent = {"id": "tick-10", "name": "Tick capsule 10 (296 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.13033, 0.034, 0.26255], "localEnd": [0.15167, 0.034, 0.30554], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_10_11.add(mesh_tick_10_11);
  meshes["tick-10"] = mesh_tick_10_11;
  colliders["tick-10"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_tick_10_11);

  const attachment_tick_11_12 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.24414, 0.034, 0.16221], "localEnd": [0.28412, 0.034, 0.18877], "baseRadius": 0.0135, "endRadius": 0.0135};
  const endpoint_tick_11_12 = makeAttachmentEndpoint(attachment_tick_11_12);
  const node_tick_11_12 = new THREE.Group();
  node_tick_11_12.name = "Tick capsule 11 (326 deg)__pivot";
  node_tick_11_12.scale.set(1, 1, 1);
  if (endpoint_tick_11_12) {
    node_tick_11_12.position.copy(endpoint_tick_11_12.start);
    node_tick_11_12.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_tick_11_12.position.set(0.0, 0.0, 0.0);
    node_tick_11_12.rotation.set(0.0, 0.0, 0.0);
  }
  node_tick_11_12.userData.sculptComponent = {"id": "tick-11", "name": "Tick capsule 11 (326 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.24414, 0.034, 0.16221], "localEnd": [0.28412, 0.034, 0.18877], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_11_12.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_tick_11_12);
  nodes["tick-11"] = node_tick_11_12;
  const mesh_tick_11_12Geometry = endpoint_tick_11_12
    ? new THREE.CylinderGeometry(endpoint_tick_11_12.endRadius, endpoint_tick_11_12.baseRadius, endpoint_tick_11_12.length, 32, 12)
    : buildWatertightCapsule(0.35, 0.7, 16, 32, 1);
  if (!endpoint_tick_11_12) {
    mesh_tick_11_12Geometry.scale(0.038571, 0.034286, 0.018571);
  }
  const mesh_tick_11_12 = new THREE.Mesh(
    mesh_tick_11_12Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_tick_11_12.name = "Tick capsule 11 (326 deg)";
  if (endpoint_tick_11_12) {
    mesh_tick_11_12.position.copy(endpoint_tick_11_12.midpoint);
    mesh_tick_11_12.quaternion.copy(endpoint_tick_11_12.quaternion);
  }
  mesh_tick_11_12.castShadow = options.castShadow ?? true;
  mesh_tick_11_12.receiveShadow = options.receiveShadow ?? true;
  mesh_tick_11_12.userData.sculptComponent = {"id": "tick-11", "name": "Tick capsule 11 (326 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.24414, 0.034, 0.16221], "localEnd": [0.28412, 0.034, 0.18877], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_11_12.add(mesh_tick_11_12);
  meshes["tick-11"] = mesh_tick_11_12;
  colliders["tick-11"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_tick_11_12);

  const attachment_tick_12_13 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.29254, 0.034, 0.0184], "localEnd": [0.34044, 0.034, 0.02142], "baseRadius": 0.0135, "endRadius": 0.0135};
  const endpoint_tick_12_13 = makeAttachmentEndpoint(attachment_tick_12_13);
  const node_tick_12_13 = new THREE.Group();
  node_tick_12_13.name = "Tick capsule 12 (356 deg)__pivot";
  node_tick_12_13.scale.set(1, 1, 1);
  if (endpoint_tick_12_13) {
    node_tick_12_13.position.copy(endpoint_tick_12_13.start);
    node_tick_12_13.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_tick_12_13.position.set(0.0, 0.0, 0.0);
    node_tick_12_13.rotation.set(0.0, 0.0, 0.0);
  }
  node_tick_12_13.userData.sculptComponent = {"id": "tick-12", "name": "Tick capsule 12 (356 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.29254, 0.034, 0.0184], "localEnd": [0.34044, 0.034, 0.02142], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_12_13.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_tick_12_13);
  nodes["tick-12"] = node_tick_12_13;
  const mesh_tick_12_13Geometry = endpoint_tick_12_13
    ? new THREE.CylinderGeometry(endpoint_tick_12_13.endRadius, endpoint_tick_12_13.baseRadius, endpoint_tick_12_13.length, 32, 12)
    : buildWatertightCapsule(0.35, 0.7, 16, 32, 1);
  if (!endpoint_tick_12_13) {
    mesh_tick_12_13Geometry.scale(0.038571, 0.034286, 0.018571);
  }
  const mesh_tick_12_13 = new THREE.Mesh(
    mesh_tick_12_13Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_tick_12_13.name = "Tick capsule 12 (356 deg)";
  if (endpoint_tick_12_13) {
    mesh_tick_12_13.position.copy(endpoint_tick_12_13.midpoint);
    mesh_tick_12_13.quaternion.copy(endpoint_tick_12_13.quaternion);
  }
  mesh_tick_12_13.castShadow = options.castShadow ?? true;
  mesh_tick_12_13.receiveShadow = options.receiveShadow ?? true;
  mesh_tick_12_13.userData.sculptComponent = {"id": "tick-12", "name": "Tick capsule 12 (356 deg)", "level": "micro", "role": "marking", "importance": 0.45, "confidence": 0.85, "primitive": "capsule", "topologyClass": "assembled-solid", "topologyRationale": "Rounded-cap capsule lying in the dial plane, long axis radial.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.006, "gapTolerance": 0.0, "localStart": [0.29254, 0.034, 0.0184], "localEnd": [0.34044, 0.034, 0.02142], "baseRadius": 0.0135, "endRadius": 0.0135}, "dimensions": {"width": 0.038571, "height": 0.034286, "depth": 0.018571, "units": "scale factors on the emitted primitive; target world size (0.027, 0.048, 0.013) in units of case diameter = 1.0", "targetWorldSize": [0.027, 0.048, 0.013], "confidence": 0.85}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_tick_12_13.add(mesh_tick_12_13);
  meshes["tick-12"] = mesh_tick_12_13;
  colliders["tick-12"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_tick_12_13);

  const endpoint_rose_long_1_14 = makeAttachmentEndpoint(null);
  const node_rose_long_1_14 = new THREE.Group();
  node_rose_long_1_14.name = "Rose long point 1 (74 deg)__pivot";
  node_rose_long_1_14.scale.set(1, 1, 1);
  if (endpoint_rose_long_1_14) {
    node_rose_long_1_14.position.copy(endpoint_rose_long_1_14.start);
    node_rose_long_1_14.rotation.set(1.5708, 0.0, -2.86234);
  } else {
    node_rose_long_1_14.position.set(0.04521, 0.06, -0.15767);
    node_rose_long_1_14.rotation.set(1.5708, 0.0, -2.86234);
  }
  node_rose_long_1_14.userData.sculptComponent = {"id": "rose-long-1", "name": "Rose long point 1 (74 deg)", "level": "meso", "role": "marking", "importance": 0.85, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Flat faceted star point: an extruded triangle lying in the dial plane. A cone would be a round spike; the reference points are flat plates with a visible top face.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.045, 0.0], "localEnd": [0.09042, 0.045, -0.31534], "baseRadius": 0.085, "endRadius": 0.004}, "dimensions": {"width": 0.13, "height": 0.32805, "depth": 0.03, "units": "scale factors on the emitted primitive; target world size (0.13, 0.3281, 0.03) in units of case diameter = 1.0", "targetWorldSize": [0.13, 0.32805, 0.03], "confidence": 0.85}, "transform": {"position": [0.04521, 0.06, -0.15767], "rotation": [1.5708, 0, -2.86234]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.164025, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_long_1_14.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.164025, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_rose_long_1_14);
  nodes["rose-long-1"] = node_rose_long_1_14;
  const mesh_rose_long_1_14Geometry = endpoint_rose_long_1_14
    ? new THREE.CylinderGeometry(endpoint_rose_long_1_14.endRadius, endpoint_rose_long_1_14.baseRadius, endpoint_rose_long_1_14.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0});
  if (!endpoint_rose_long_1_14) {
    mesh_rose_long_1_14Geometry.scale(0.13, 0.32805, 0.03);
  }
  const mesh_rose_long_1_14 = new THREE.Mesh(
    mesh_rose_long_1_14Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_rose_long_1_14.name = "Rose long point 1 (74 deg)";
  if (endpoint_rose_long_1_14) {
    mesh_rose_long_1_14.position.copy(endpoint_rose_long_1_14.midpoint);
    mesh_rose_long_1_14.quaternion.copy(endpoint_rose_long_1_14.quaternion);
  }
  mesh_rose_long_1_14.castShadow = options.castShadow ?? true;
  mesh_rose_long_1_14.receiveShadow = options.receiveShadow ?? true;
  mesh_rose_long_1_14.userData.sculptComponent = {"id": "rose-long-1", "name": "Rose long point 1 (74 deg)", "level": "meso", "role": "marking", "importance": 0.85, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Flat faceted star point: an extruded triangle lying in the dial plane. A cone would be a round spike; the reference points are flat plates with a visible top face.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.045, 0.0], "localEnd": [0.09042, 0.045, -0.31534], "baseRadius": 0.085, "endRadius": 0.004}, "dimensions": {"width": 0.13, "height": 0.32805, "depth": 0.03, "units": "scale factors on the emitted primitive; target world size (0.13, 0.3281, 0.03) in units of case diameter = 1.0", "targetWorldSize": [0.13, 0.32805, 0.03], "confidence": 0.85}, "transform": {"position": [0.04521, 0.06, -0.15767], "rotation": [1.5708, 0, -2.86234]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.164025, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_long_1_14.add(mesh_rose_long_1_14);
  meshes["rose-long-1"] = mesh_rose_long_1_14;
  colliders["rose-long-1"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_rose_long_1_14);

  const endpoint_rose_long_2_15 = makeAttachmentEndpoint(null);
  const node_rose_long_2_15 = new THREE.Group();
  node_rose_long_2_15.name = "Rose long point 2 (164 deg)__pivot";
  node_rose_long_2_15.scale.set(1, 1, 1);
  if (endpoint_rose_long_2_15) {
    node_rose_long_2_15.position.copy(endpoint_rose_long_2_15.start);
    node_rose_long_2_15.rotation.set(1.5708, 0.0, 1.85005);
  } else {
    node_rose_long_2_15.position.set(-0.15767, 0.06, -0.04521);
    node_rose_long_2_15.rotation.set(1.5708, 0.0, 1.85005);
  }
  node_rose_long_2_15.userData.sculptComponent = {"id": "rose-long-2", "name": "Rose long point 2 (164 deg)", "level": "meso", "role": "marking", "importance": 0.85, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Flat faceted star point: an extruded triangle lying in the dial plane. A cone would be a round spike; the reference points are flat plates with a visible top face.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.045, 0.0], "localEnd": [-0.31534, 0.045, -0.09042], "baseRadius": 0.085, "endRadius": 0.004}, "dimensions": {"width": 0.13, "height": 0.32805, "depth": 0.03, "units": "scale factors on the emitted primitive; target world size (0.13, 0.3281, 0.03) in units of case diameter = 1.0", "targetWorldSize": [0.13, 0.32805, 0.03], "confidence": 0.85}, "transform": {"position": [-0.15767, 0.06, -0.04521], "rotation": [1.5708, 0, 1.85005]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.164025, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_long_2_15.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.164025, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_rose_long_2_15);
  nodes["rose-long-2"] = node_rose_long_2_15;
  const mesh_rose_long_2_15Geometry = endpoint_rose_long_2_15
    ? new THREE.CylinderGeometry(endpoint_rose_long_2_15.endRadius, endpoint_rose_long_2_15.baseRadius, endpoint_rose_long_2_15.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0});
  if (!endpoint_rose_long_2_15) {
    mesh_rose_long_2_15Geometry.scale(0.13, 0.32805, 0.03);
  }
  const mesh_rose_long_2_15 = new THREE.Mesh(
    mesh_rose_long_2_15Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_rose_long_2_15.name = "Rose long point 2 (164 deg)";
  if (endpoint_rose_long_2_15) {
    mesh_rose_long_2_15.position.copy(endpoint_rose_long_2_15.midpoint);
    mesh_rose_long_2_15.quaternion.copy(endpoint_rose_long_2_15.quaternion);
  }
  mesh_rose_long_2_15.castShadow = options.castShadow ?? true;
  mesh_rose_long_2_15.receiveShadow = options.receiveShadow ?? true;
  mesh_rose_long_2_15.userData.sculptComponent = {"id": "rose-long-2", "name": "Rose long point 2 (164 deg)", "level": "meso", "role": "marking", "importance": 0.85, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Flat faceted star point: an extruded triangle lying in the dial plane. A cone would be a round spike; the reference points are flat plates with a visible top face.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.045, 0.0], "localEnd": [-0.31534, 0.045, -0.09042], "baseRadius": 0.085, "endRadius": 0.004}, "dimensions": {"width": 0.13, "height": 0.32805, "depth": 0.03, "units": "scale factors on the emitted primitive; target world size (0.13, 0.3281, 0.03) in units of case diameter = 1.0", "targetWorldSize": [0.13, 0.32805, 0.03], "confidence": 0.85}, "transform": {"position": [-0.15767, 0.06, -0.04521], "rotation": [1.5708, 0, 1.85005]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.164025, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_long_2_15.add(mesh_rose_long_2_15);
  meshes["rose-long-2"] = mesh_rose_long_2_15;
  colliders["rose-long-2"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_rose_long_2_15);

  const endpoint_rose_long_3_16 = makeAttachmentEndpoint(null);
  const node_rose_long_3_16 = new THREE.Group();
  node_rose_long_3_16.name = "Rose long point 3 (254 deg)__pivot";
  node_rose_long_3_16.scale.set(1, 1, 1);
  if (endpoint_rose_long_3_16) {
    node_rose_long_3_16.position.copy(endpoint_rose_long_3_16.start);
    node_rose_long_3_16.rotation.set(1.5708, 0.0, 0.27925);
  } else {
    node_rose_long_3_16.position.set(-0.04521, 0.06, 0.15767);
    node_rose_long_3_16.rotation.set(1.5708, 0.0, 0.27925);
  }
  node_rose_long_3_16.userData.sculptComponent = {"id": "rose-long-3", "name": "Rose long point 3 (254 deg)", "level": "meso", "role": "marking", "importance": 0.85, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Flat faceted star point: an extruded triangle lying in the dial plane. A cone would be a round spike; the reference points are flat plates with a visible top face.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.045, 0.0], "localEnd": [-0.09042, 0.045, 0.31534], "baseRadius": 0.085, "endRadius": 0.004}, "dimensions": {"width": 0.13, "height": 0.32805, "depth": 0.03, "units": "scale factors on the emitted primitive; target world size (0.13, 0.3281, 0.03) in units of case diameter = 1.0", "targetWorldSize": [0.13, 0.32805, 0.03], "confidence": 0.85}, "transform": {"position": [-0.04521, 0.06, 0.15767], "rotation": [1.5708, 0, 0.27925]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.164025, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_long_3_16.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.164025, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_rose_long_3_16);
  nodes["rose-long-3"] = node_rose_long_3_16;
  const mesh_rose_long_3_16Geometry = endpoint_rose_long_3_16
    ? new THREE.CylinderGeometry(endpoint_rose_long_3_16.endRadius, endpoint_rose_long_3_16.baseRadius, endpoint_rose_long_3_16.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0});
  if (!endpoint_rose_long_3_16) {
    mesh_rose_long_3_16Geometry.scale(0.13, 0.32805, 0.03);
  }
  const mesh_rose_long_3_16 = new THREE.Mesh(
    mesh_rose_long_3_16Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_rose_long_3_16.name = "Rose long point 3 (254 deg)";
  if (endpoint_rose_long_3_16) {
    mesh_rose_long_3_16.position.copy(endpoint_rose_long_3_16.midpoint);
    mesh_rose_long_3_16.quaternion.copy(endpoint_rose_long_3_16.quaternion);
  }
  mesh_rose_long_3_16.castShadow = options.castShadow ?? true;
  mesh_rose_long_3_16.receiveShadow = options.receiveShadow ?? true;
  mesh_rose_long_3_16.userData.sculptComponent = {"id": "rose-long-3", "name": "Rose long point 3 (254 deg)", "level": "meso", "role": "marking", "importance": 0.85, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Flat faceted star point: an extruded triangle lying in the dial plane. A cone would be a round spike; the reference points are flat plates with a visible top face.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.045, 0.0], "localEnd": [-0.09042, 0.045, 0.31534], "baseRadius": 0.085, "endRadius": 0.004}, "dimensions": {"width": 0.13, "height": 0.32805, "depth": 0.03, "units": "scale factors on the emitted primitive; target world size (0.13, 0.3281, 0.03) in units of case diameter = 1.0", "targetWorldSize": [0.13, 0.32805, 0.03], "confidence": 0.85}, "transform": {"position": [-0.04521, 0.06, 0.15767], "rotation": [1.5708, 0, 0.27925]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.164025, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_long_3_16.add(mesh_rose_long_3_16);
  meshes["rose-long-3"] = mesh_rose_long_3_16;
  colliders["rose-long-3"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_rose_long_3_16);

  const endpoint_rose_long_4_17 = makeAttachmentEndpoint(null);
  const node_rose_long_4_17 = new THREE.Group();
  node_rose_long_4_17.name = "Rose long point 4 (344 deg)__pivot";
  node_rose_long_4_17.scale.set(1, 1, 1);
  if (endpoint_rose_long_4_17) {
    node_rose_long_4_17.position.copy(endpoint_rose_long_4_17.start);
    node_rose_long_4_17.rotation.set(1.5708, 0.0, -1.29154);
  } else {
    node_rose_long_4_17.position.set(0.15767, 0.06, 0.04521);
    node_rose_long_4_17.rotation.set(1.5708, 0.0, -1.29154);
  }
  node_rose_long_4_17.userData.sculptComponent = {"id": "rose-long-4", "name": "Rose long point 4 (344 deg)", "level": "meso", "role": "marking", "importance": 0.85, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Flat faceted star point: an extruded triangle lying in the dial plane. A cone would be a round spike; the reference points are flat plates with a visible top face.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.045, 0.0], "localEnd": [0.31534, 0.045, 0.09042], "baseRadius": 0.085, "endRadius": 0.004}, "dimensions": {"width": 0.13, "height": 0.32805, "depth": 0.03, "units": "scale factors on the emitted primitive; target world size (0.13, 0.3281, 0.03) in units of case diameter = 1.0", "targetWorldSize": [0.13, 0.32805, 0.03], "confidence": 0.85}, "transform": {"position": [0.15767, 0.06, 0.04521], "rotation": [1.5708, 0, -1.29154]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.164025, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_long_4_17.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.164025, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_rose_long_4_17);
  nodes["rose-long-4"] = node_rose_long_4_17;
  const mesh_rose_long_4_17Geometry = endpoint_rose_long_4_17
    ? new THREE.CylinderGeometry(endpoint_rose_long_4_17.endRadius, endpoint_rose_long_4_17.baseRadius, endpoint_rose_long_4_17.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0});
  if (!endpoint_rose_long_4_17) {
    mesh_rose_long_4_17Geometry.scale(0.13, 0.32805, 0.03);
  }
  const mesh_rose_long_4_17 = new THREE.Mesh(
    mesh_rose_long_4_17Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_rose_long_4_17.name = "Rose long point 4 (344 deg)";
  if (endpoint_rose_long_4_17) {
    mesh_rose_long_4_17.position.copy(endpoint_rose_long_4_17.midpoint);
    mesh_rose_long_4_17.quaternion.copy(endpoint_rose_long_4_17.quaternion);
  }
  mesh_rose_long_4_17.castShadow = options.castShadow ?? true;
  mesh_rose_long_4_17.receiveShadow = options.receiveShadow ?? true;
  mesh_rose_long_4_17.userData.sculptComponent = {"id": "rose-long-4", "name": "Rose long point 4 (344 deg)", "level": "meso", "role": "marking", "importance": 0.85, "confidence": 0.85, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Flat faceted star point: an extruded triangle lying in the dial plane. A cone would be a round spike; the reference points are flat plates with a visible top face.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.045, 0.0], "localEnd": [0.31534, 0.045, 0.09042], "baseRadius": 0.085, "endRadius": 0.004}, "dimensions": {"width": 0.13, "height": 0.32805, "depth": 0.03, "units": "scale factors on the emitted primitive; target world size (0.13, 0.3281, 0.03) in units of case diameter = 1.0", "targetWorldSize": [0.13, 0.32805, 0.03], "confidence": 0.85}, "transform": {"position": [0.15767, 0.06, 0.04521], "rotation": [1.5708, 0, -1.29154]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.164025, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_long_4_17.add(mesh_rose_long_4_17);
  meshes["rose-long-4"] = mesh_rose_long_4_17;
  colliders["rose-long-4"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_rose_long_4_17);

  const endpoint_rose_short_1_18 = makeAttachmentEndpoint(null);
  const node_rose_short_1_18 = new THREE.Group();
  node_rose_short_1_18.name = "Rose short point 1 (119 deg)__pivot";
  node_rose_short_1_18.scale.set(1, 1, 1);
  if (endpoint_rose_short_1_18) {
    node_rose_short_1_18.position.copy(endpoint_rose_short_1_18.start);
    node_rose_short_1_18.rotation.set(1.5708, 0.0, 2.63545);
  } else {
    node_rose_short_1_18.position.set(-0.05832, 0.059, -0.1052);
    node_rose_short_1_18.rotation.set(1.5708, 0.0, 2.63545);
  }
  node_rose_short_1_18.userData.sculptComponent = {"id": "rose-short-1", "name": "Rose short point 1 (119 deg)", "level": "meso", "role": "marking", "importance": 0.7, "confidence": 0.8, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Shorter intercardinal star point, same flat plate treatment.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.044, 0.0], "localEnd": [-0.11663, 0.044, -0.21041], "baseRadius": 0.072, "endRadius": 0.004}, "dimensions": {"width": 0.118, "height": 0.24057, "depth": 0.028, "units": "scale factors on the emitted primitive; target world size (0.118, 0.2406, 0.028) in units of case diameter = 1.0", "targetWorldSize": [0.118, 0.24057, 0.028], "confidence": 0.8}, "transform": {"position": [-0.05832, 0.059, -0.1052], "rotation": [1.5708, 0, 2.63545]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.120285, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_short_1_18.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.120285, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_rose_short_1_18);
  nodes["rose-short-1"] = node_rose_short_1_18;
  const mesh_rose_short_1_18Geometry = endpoint_rose_short_1_18
    ? new THREE.CylinderGeometry(endpoint_rose_short_1_18.endRadius, endpoint_rose_short_1_18.baseRadius, endpoint_rose_short_1_18.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0});
  if (!endpoint_rose_short_1_18) {
    mesh_rose_short_1_18Geometry.scale(0.118, 0.24057, 0.028);
  }
  const mesh_rose_short_1_18 = new THREE.Mesh(
    mesh_rose_short_1_18Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_rose_short_1_18.name = "Rose short point 1 (119 deg)";
  if (endpoint_rose_short_1_18) {
    mesh_rose_short_1_18.position.copy(endpoint_rose_short_1_18.midpoint);
    mesh_rose_short_1_18.quaternion.copy(endpoint_rose_short_1_18.quaternion);
  }
  mesh_rose_short_1_18.castShadow = options.castShadow ?? true;
  mesh_rose_short_1_18.receiveShadow = options.receiveShadow ?? true;
  mesh_rose_short_1_18.userData.sculptComponent = {"id": "rose-short-1", "name": "Rose short point 1 (119 deg)", "level": "meso", "role": "marking", "importance": 0.7, "confidence": 0.8, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Shorter intercardinal star point, same flat plate treatment.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.044, 0.0], "localEnd": [-0.11663, 0.044, -0.21041], "baseRadius": 0.072, "endRadius": 0.004}, "dimensions": {"width": 0.118, "height": 0.24057, "depth": 0.028, "units": "scale factors on the emitted primitive; target world size (0.118, 0.2406, 0.028) in units of case diameter = 1.0", "targetWorldSize": [0.118, 0.24057, 0.028], "confidence": 0.8}, "transform": {"position": [-0.05832, 0.059, -0.1052], "rotation": [1.5708, 0, 2.63545]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.120285, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_short_1_18.add(mesh_rose_short_1_18);
  meshes["rose-short-1"] = mesh_rose_short_1_18;
  colliders["rose-short-1"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_rose_short_1_18);

  const endpoint_rose_short_2_19 = makeAttachmentEndpoint(null);
  const node_rose_short_2_19 = new THREE.Group();
  node_rose_short_2_19.name = "Rose short point 2 (209 deg)__pivot";
  node_rose_short_2_19.scale.set(1, 1, 1);
  if (endpoint_rose_short_2_19) {
    node_rose_short_2_19.position.copy(endpoint_rose_short_2_19.start);
    node_rose_short_2_19.rotation.set(1.5708, 0.0, 1.06465);
  } else {
    node_rose_short_2_19.position.set(-0.1052, 0.059, 0.05832);
    node_rose_short_2_19.rotation.set(1.5708, 0.0, 1.06465);
  }
  node_rose_short_2_19.userData.sculptComponent = {"id": "rose-short-2", "name": "Rose short point 2 (209 deg)", "level": "meso", "role": "marking", "importance": 0.7, "confidence": 0.8, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Shorter intercardinal star point, same flat plate treatment.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.044, 0.0], "localEnd": [-0.21041, 0.044, 0.11663], "baseRadius": 0.072, "endRadius": 0.004}, "dimensions": {"width": 0.118, "height": 0.24057, "depth": 0.028, "units": "scale factors on the emitted primitive; target world size (0.118, 0.2406, 0.028) in units of case diameter = 1.0", "targetWorldSize": [0.118, 0.24057, 0.028], "confidence": 0.8}, "transform": {"position": [-0.1052, 0.059, 0.05832], "rotation": [1.5708, 0, 1.06465]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.120285, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_short_2_19.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.120285, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_rose_short_2_19);
  nodes["rose-short-2"] = node_rose_short_2_19;
  const mesh_rose_short_2_19Geometry = endpoint_rose_short_2_19
    ? new THREE.CylinderGeometry(endpoint_rose_short_2_19.endRadius, endpoint_rose_short_2_19.baseRadius, endpoint_rose_short_2_19.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0});
  if (!endpoint_rose_short_2_19) {
    mesh_rose_short_2_19Geometry.scale(0.118, 0.24057, 0.028);
  }
  const mesh_rose_short_2_19 = new THREE.Mesh(
    mesh_rose_short_2_19Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_rose_short_2_19.name = "Rose short point 2 (209 deg)";
  if (endpoint_rose_short_2_19) {
    mesh_rose_short_2_19.position.copy(endpoint_rose_short_2_19.midpoint);
    mesh_rose_short_2_19.quaternion.copy(endpoint_rose_short_2_19.quaternion);
  }
  mesh_rose_short_2_19.castShadow = options.castShadow ?? true;
  mesh_rose_short_2_19.receiveShadow = options.receiveShadow ?? true;
  mesh_rose_short_2_19.userData.sculptComponent = {"id": "rose-short-2", "name": "Rose short point 2 (209 deg)", "level": "meso", "role": "marking", "importance": 0.7, "confidence": 0.8, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Shorter intercardinal star point, same flat plate treatment.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.044, 0.0], "localEnd": [-0.21041, 0.044, 0.11663], "baseRadius": 0.072, "endRadius": 0.004}, "dimensions": {"width": 0.118, "height": 0.24057, "depth": 0.028, "units": "scale factors on the emitted primitive; target world size (0.118, 0.2406, 0.028) in units of case diameter = 1.0", "targetWorldSize": [0.118, 0.24057, 0.028], "confidence": 0.8}, "transform": {"position": [-0.1052, 0.059, 0.05832], "rotation": [1.5708, 0, 1.06465]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.120285, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_short_2_19.add(mesh_rose_short_2_19);
  meshes["rose-short-2"] = mesh_rose_short_2_19;
  colliders["rose-short-2"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_rose_short_2_19);

  const endpoint_rose_short_3_20 = makeAttachmentEndpoint(null);
  const node_rose_short_3_20 = new THREE.Group();
  node_rose_short_3_20.name = "Rose short point 3 (299 deg)__pivot";
  node_rose_short_3_20.scale.set(1, 1, 1);
  if (endpoint_rose_short_3_20) {
    node_rose_short_3_20.position.copy(endpoint_rose_short_3_20.start);
    node_rose_short_3_20.rotation.set(1.5708, 0.0, -0.50615);
  } else {
    node_rose_short_3_20.position.set(0.05832, 0.059, 0.1052);
    node_rose_short_3_20.rotation.set(1.5708, 0.0, -0.50615);
  }
  node_rose_short_3_20.userData.sculptComponent = {"id": "rose-short-3", "name": "Rose short point 3 (299 deg)", "level": "meso", "role": "marking", "importance": 0.7, "confidence": 0.8, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Shorter intercardinal star point, same flat plate treatment.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.044, 0.0], "localEnd": [0.11663, 0.044, 0.21041], "baseRadius": 0.072, "endRadius": 0.004}, "dimensions": {"width": 0.118, "height": 0.24057, "depth": 0.028, "units": "scale factors on the emitted primitive; target world size (0.118, 0.2406, 0.028) in units of case diameter = 1.0", "targetWorldSize": [0.118, 0.24057, 0.028], "confidence": 0.8}, "transform": {"position": [0.05832, 0.059, 0.1052], "rotation": [1.5708, 0, -0.50615]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.120285, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_short_3_20.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.120285, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_rose_short_3_20);
  nodes["rose-short-3"] = node_rose_short_3_20;
  const mesh_rose_short_3_20Geometry = endpoint_rose_short_3_20
    ? new THREE.CylinderGeometry(endpoint_rose_short_3_20.endRadius, endpoint_rose_short_3_20.baseRadius, endpoint_rose_short_3_20.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0});
  if (!endpoint_rose_short_3_20) {
    mesh_rose_short_3_20Geometry.scale(0.118, 0.24057, 0.028);
  }
  const mesh_rose_short_3_20 = new THREE.Mesh(
    mesh_rose_short_3_20Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_rose_short_3_20.name = "Rose short point 3 (299 deg)";
  if (endpoint_rose_short_3_20) {
    mesh_rose_short_3_20.position.copy(endpoint_rose_short_3_20.midpoint);
    mesh_rose_short_3_20.quaternion.copy(endpoint_rose_short_3_20.quaternion);
  }
  mesh_rose_short_3_20.castShadow = options.castShadow ?? true;
  mesh_rose_short_3_20.receiveShadow = options.receiveShadow ?? true;
  mesh_rose_short_3_20.userData.sculptComponent = {"id": "rose-short-3", "name": "Rose short point 3 (299 deg)", "level": "meso", "role": "marking", "importance": 0.7, "confidence": 0.8, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Shorter intercardinal star point, same flat plate treatment.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.044, 0.0], "localEnd": [0.11663, 0.044, 0.21041], "baseRadius": 0.072, "endRadius": 0.004}, "dimensions": {"width": 0.118, "height": 0.24057, "depth": 0.028, "units": "scale factors on the emitted primitive; target world size (0.118, 0.2406, 0.028) in units of case diameter = 1.0", "targetWorldSize": [0.118, 0.24057, 0.028], "confidence": 0.8}, "transform": {"position": [0.05832, 0.059, 0.1052], "rotation": [1.5708, 0, -0.50615]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.120285, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_short_3_20.add(mesh_rose_short_3_20);
  meshes["rose-short-3"] = mesh_rose_short_3_20;
  colliders["rose-short-3"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_rose_short_3_20);

  const endpoint_rose_short_4_21 = makeAttachmentEndpoint(null);
  const node_rose_short_4_21 = new THREE.Group();
  node_rose_short_4_21.name = "Rose short point 4 (389 deg)__pivot";
  node_rose_short_4_21.scale.set(1, 1, 1);
  if (endpoint_rose_short_4_21) {
    node_rose_short_4_21.position.copy(endpoint_rose_short_4_21.start);
    node_rose_short_4_21.rotation.set(1.5708, 0.0, -2.07694);
  } else {
    node_rose_short_4_21.position.set(0.1052, 0.059, -0.05832);
    node_rose_short_4_21.rotation.set(1.5708, 0.0, -2.07694);
  }
  node_rose_short_4_21.userData.sculptComponent = {"id": "rose-short-4", "name": "Rose short point 4 (389 deg)", "level": "meso", "role": "marking", "importance": 0.7, "confidence": 0.8, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Shorter intercardinal star point, same flat plate treatment.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.044, 0.0], "localEnd": [0.21041, 0.044, -0.11663], "baseRadius": 0.072, "endRadius": 0.004}, "dimensions": {"width": 0.118, "height": 0.24057, "depth": 0.028, "units": "scale factors on the emitted primitive; target world size (0.118, 0.2406, 0.028) in units of case diameter = 1.0", "targetWorldSize": [0.118, 0.24057, 0.028], "confidence": 0.8}, "transform": {"position": [0.1052, 0.059, -0.05832], "rotation": [1.5708, 0, -2.07694]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.120285, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_short_4_21.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.120285, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_rose_short_4_21);
  nodes["rose-short-4"] = node_rose_short_4_21;
  const mesh_rose_short_4_21Geometry = endpoint_rose_short_4_21
    ? new THREE.CylinderGeometry(endpoint_rose_short_4_21.endRadius, endpoint_rose_short_4_21.baseRadius, endpoint_rose_short_4_21.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0});
  if (!endpoint_rose_short_4_21) {
    mesh_rose_short_4_21Geometry.scale(0.118, 0.24057, 0.028);
  }
  const mesh_rose_short_4_21 = new THREE.Mesh(
    mesh_rose_short_4_21Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_rose_short_4_21.name = "Rose short point 4 (389 deg)";
  if (endpoint_rose_short_4_21) {
    mesh_rose_short_4_21.position.copy(endpoint_rose_short_4_21.midpoint);
    mesh_rose_short_4_21.quaternion.copy(endpoint_rose_short_4_21.quaternion);
  }
  mesh_rose_short_4_21.castShadow = options.castShadow ?? true;
  mesh_rose_short_4_21.receiveShadow = options.receiveShadow ?? true;
  mesh_rose_short_4_21.userData.sculptComponent = {"id": "rose-short-4", "name": "Rose short point 4 (389 deg)", "level": "meso", "role": "marking", "importance": 0.7, "confidence": 0.8, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "Shorter intercardinal star point, same flat plate treatment.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "profile2D": {"points": [[-0.5, -0.5], [0.5, -0.5], [0.0, 0.5]], "depth": 1.0}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0.0, 0.044, 0.0], "localEnd": [0.21041, 0.044, -0.11663], "baseRadius": 0.072, "endRadius": 0.004}, "dimensions": {"width": 0.118, "height": 0.24057, "depth": 0.028, "units": "scale factors on the emitted primitive; target world size (0.118, 0.2406, 0.028) in units of case diameter = 1.0", "targetWorldSize": [0.118, 0.24057, 0.028], "confidence": 0.8}, "transform": {"position": [0.1052, 0.059, -0.05832], "rotation": [1.5708, 0, -2.07694]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "base", "localPosition": [0, -0.120285, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_short_4_21.add(mesh_rose_short_4_21);
  meshes["rose-short-4"] = mesh_rose_short_4_21;
  colliders["rose-short-4"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_rose_short_4_21);

  const attachment_rose_hub_22 = {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0, 0.027999999999999997, 0], "localEnd": [0, 0.05, 0], "baseRadius": 0.08, "endRadius": 0.08};
  const endpoint_rose_hub_22 = makeAttachmentEndpoint(attachment_rose_hub_22);
  const node_rose_hub_22 = new THREE.Group();
  node_rose_hub_22.name = "Rose hub disc__pivot";
  node_rose_hub_22.scale.set(1, 1, 1);
  if (endpoint_rose_hub_22) {
    node_rose_hub_22.position.copy(endpoint_rose_hub_22.start);
    node_rose_hub_22.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_rose_hub_22.position.set(0.0, 0.0, 0.0);
    node_rose_hub_22.rotation.set(0.0, 0.0, 0.0);
  }
  node_rose_hub_22.userData.sculptComponent = {"id": "rose-hub", "name": "Rose hub disc", "level": "micro", "role": "marking", "importance": 0.5, "confidence": 0.8, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Small navy disc that visually fuses the eight point bases into one star.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0, 0.027999999999999997, 0], "localEnd": [0, 0.05, 0], "baseRadius": 0.08, "endRadius": 0.08}, "dimensions": {"width": 0.16, "height": 0.022, "depth": 0.16, "units": "scale factors on the emitted primitive; target world size (0.16, 0.022, 0.16) in units of case diameter = 1.0", "targetWorldSize": [0.16, 0.022, 0.16], "confidence": 0.8}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_hub_22.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_rose_hub_22);
  nodes["rose-hub"] = node_rose_hub_22;
  const mesh_rose_hub_22Geometry = endpoint_rose_hub_22
    ? new THREE.CylinderGeometry(endpoint_rose_hub_22.endRadius, endpoint_rose_hub_22.baseRadius, endpoint_rose_hub_22.length, 32, 12)
    : new THREE.CylinderGeometry(0.5, 0.5, 1, 48, 16);
  if (!endpoint_rose_hub_22) {
    mesh_rose_hub_22Geometry.scale(0.16, 0.022, 0.16);
  }
  const mesh_rose_hub_22 = new THREE.Mesh(
    mesh_rose_hub_22Geometry,
    materialMap["mat-navy"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_rose_hub_22.name = "Rose hub disc";
  if (endpoint_rose_hub_22) {
    mesh_rose_hub_22.position.copy(endpoint_rose_hub_22.midpoint);
    mesh_rose_hub_22.quaternion.copy(endpoint_rose_hub_22.quaternion);
  }
  mesh_rose_hub_22.castShadow = options.castShadow ?? true;
  mesh_rose_hub_22.receiveShadow = options.receiveShadow ?? true;
  mesh_rose_hub_22.userData.sculptComponent = {"id": "rose-hub", "name": "Rose hub disc", "level": "micro", "role": "marking", "importance": 0.5, "confidence": 0.8, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Small navy disc that visually fuses the eight point bases into one star.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-face", "contactType": "overlap", "overlap": 0.01, "gapTolerance": 0.0, "localStart": [0, 0.027999999999999997, 0], "localEnd": [0, 0.05, 0], "baseRadius": 0.08, "endRadius": 0.08}, "dimensions": {"width": 0.16, "height": 0.022, "depth": 0.16, "units": "scale factors on the emitted primitive; target world size (0.16, 0.022, 0.16) in units of case diameter = 1.0", "targetWorldSize": [0.16, 0.022, 0.16], "confidence": 0.8}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-navy", "materialLayers": ["mat-navy"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(79, 97, 120, 1)", "secondaryAlbedo": "rgba(48, 65, 88, 1)", "materialClass": "plastic", "materialClassConfidence": 0.75, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(79, 97, 120, 1)"}, {"position": 1.0, "color": "rgba(48, 65, 88, 1)"}]}}};
  node_rose_hub_22.add(mesh_rose_hub_22);
  meshes["rose-hub"] = mesh_rose_hub_22;
  colliders["rose-hub"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_rose_hub_22);

  const endpoint_needle_23 = makeAttachmentEndpoint(null);
  const node_needle_23 = new THREE.Group();
  node_needle_23.name = "Compass needle (red lens spindle)__pivot";
  node_needle_23.scale.set(1, 1, 1);
  if (endpoint_needle_23) {
    node_needle_23.position.copy(endpoint_needle_23.start);
    node_needle_23.rotation.set(1.5708, 0.0, -2.39808);
  } else {
    node_needle_23.position.set(0.0, 0.085, 0.0);
    node_needle_23.rotation.set(1.5708, 0.0, -2.39808);
  }
  node_needle_23.userData.sculptComponent = {"id": "needle", "name": "Compass needle (red lens spindle)", "level": "macro", "role": "indicator", "importance": 1.0, "confidence": 0.9, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "A revolved spindle flattened on one axis: the needle is a continuous lens form that tapers to a point at both ends. Two back-to-back cones would put a hard crease at the waist that the reference does not have.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "latheProfile": {"points": [[0.0, -0.5], [0.15, -0.3], [0.23, -0.06], [0.25, 0.04], [0.2, 0.22], [0.1, 0.38], [0.0, 0.5]], "segments": 10}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-pivot", "contactType": "socket", "embedDepth": 0.01, "gapTolerance": 0.0, "localStart": [0, 0.06, 0], "localEnd": [0, 0.08499999999999999, 0]}, "dimensions": {"width": 0.266, "height": 0.707, "depth": 0.09, "units": "scale factors on the emitted primitive; target world size (0.133, 0.707, 0.045) in units of case diameter = 1.0", "targetWorldSize": [0.133, 0.707, 0.045], "confidence": 0.9}, "transform": {"position": [0, 0.085, 0], "rotation": [1.5708, 0, -2.39808]}, "actionProfile": {"animationRole": "indicator", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-red", "materialLayers": ["mat-red"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "both-halves-red", "description": "both halves are red; the dark counterpart is the rose beneath, not a south needle", "type": "albedo-note"}], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(244, 78, 48, 1)", "secondaryAlbedo": "rgba(197, 32, 14, 1)", "materialClass": "plastic", "materialClassConfidence": 0.8, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(244, 78, 48, 1)"}, {"position": 1.0, "color": "rgba(197, 32, 14, 1)"}]}}};
  node_needle_23.userData.actionProfile = {"animationRole": "indicator", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_needle_23);
  nodes["needle"] = node_needle_23;
  const mesh_needle_23Geometry = endpoint_needle_23
    ? new THREE.CylinderGeometry(endpoint_needle_23.endRadius, endpoint_needle_23.baseRadius, endpoint_needle_23.length, 32, 12)
    : buildLatheGeometry({"points": [[0.0, -0.5], [0.15, -0.3], [0.23, -0.06], [0.25, 0.04], [0.2, 0.22], [0.1, 0.38], [0.0, 0.5]], "segments": 10});
  if (!endpoint_needle_23) {
    mesh_needle_23Geometry.scale(0.266, 0.707, 0.09);
  }
  const mesh_needle_23 = new THREE.Mesh(
    mesh_needle_23Geometry,
    materialMap["mat-red"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_needle_23.name = "Compass needle (red lens spindle)";
  if (endpoint_needle_23) {
    mesh_needle_23.position.copy(endpoint_needle_23.midpoint);
    mesh_needle_23.quaternion.copy(endpoint_needle_23.quaternion);
  }
  mesh_needle_23.castShadow = options.castShadow ?? true;
  mesh_needle_23.receiveShadow = options.receiveShadow ?? true;
  mesh_needle_23.userData.sculptComponent = {"id": "needle", "name": "Compass needle (red lens spindle)", "level": "macro", "role": "indicator", "importance": 1.0, "confidence": 0.9, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "A revolved spindle flattened on one axis: the needle is a continuous lens form that tapers to a point at both ends. Two back-to-back cones would put a hard crease at the waist that the reference does not have.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "latheProfile": {"points": [[0.0, -0.5], [0.15, -0.3], [0.23, -0.06], [0.25, 0.04], [0.2, 0.22], [0.1, 0.38], [0.0, 0.5]], "segments": 10}}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-pivot", "contactType": "socket", "embedDepth": 0.01, "gapTolerance": 0.0, "localStart": [0, 0.06, 0], "localEnd": [0, 0.08499999999999999, 0]}, "dimensions": {"width": 0.266, "height": 0.707, "depth": 0.09, "units": "scale factors on the emitted primitive; target world size (0.133, 0.707, 0.045) in units of case diameter = 1.0", "targetWorldSize": [0.133, 0.707, 0.045], "confidence": 0.9}, "transform": {"position": [0, 0.085, 0], "rotation": [1.5708, 0, -2.39808]}, "actionProfile": {"animationRole": "indicator", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 0, 1], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-red", "materialLayers": ["mat-red"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "both-halves-red", "description": "both halves are red; the dark counterpart is the rose beneath, not a south needle", "type": "albedo-note"}], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(244, 78, 48, 1)", "secondaryAlbedo": "rgba(197, 32, 14, 1)", "materialClass": "plastic", "materialClassConfidence": 0.8, "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(244, 78, 48, 1)"}, {"position": 1.0, "color": "rgba(197, 32, 14, 1)"}]}}};
  node_needle_23.add(mesh_needle_23);
  meshes["needle"] = mesh_needle_23;
  colliders["needle"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_needle_23);

  const endpoint_pivot_boss_24 = makeAttachmentEndpoint(null);
  const node_pivot_boss_24 = new THREE.Group();
  node_pivot_boss_24.name = "Needle pivot boss__pivot";
  node_pivot_boss_24.scale.set(1, 1, 1);
  if (endpoint_pivot_boss_24) {
    node_pivot_boss_24.position.copy(endpoint_pivot_boss_24.start);
    node_pivot_boss_24.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_pivot_boss_24.position.set(0.0, 0.11, 0.0);
    node_pivot_boss_24.rotation.set(0.0, 0.0, 0.0);
  }
  node_pivot_boss_24.userData.sculptComponent = {"id": "pivot-boss", "name": "Needle pivot boss", "level": "meso", "role": "hardware", "importance": 0.7, "confidence": 0.85, "primitive": "sphere", "topologyClass": "assembled-solid", "topologyRationale": "Gold hemispherical cap sitting proud of the needle at the rotation axis.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-pivot", "contactType": "socket", "embedDepth": 0.02, "gapTolerance": 0.0, "localStart": [0, 0.05, 0], "localEnd": [0, 0.12, 0]}, "dimensions": {"width": 0.139, "height": 0.1112, "depth": 0.139, "units": "scale factors on the emitted primitive; target world size (0.139, 0.1112, 0.139) in units of case diameter = 1.0", "targetWorldSize": [0.139, 0.1112, 0.139], "confidence": 0.85}, "transform": {"position": [0, 0.11, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "hardware", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.85}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_pivot_boss_24.userData.actionProfile = {"animationRole": "hardware", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.85}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["dial-plate"] ?? root).add(node_pivot_boss_24);
  nodes["pivot-boss"] = node_pivot_boss_24;
  const mesh_pivot_boss_24Geometry = endpoint_pivot_boss_24
    ? new THREE.CylinderGeometry(endpoint_pivot_boss_24.endRadius, endpoint_pivot_boss_24.baseRadius, endpoint_pivot_boss_24.length, 32, 12)
    : new THREE.SphereGeometry(0.5, 64, 40);
  if (!endpoint_pivot_boss_24) {
    mesh_pivot_boss_24Geometry.scale(0.139, 0.1112, 0.139);
  }
  const mesh_pivot_boss_24 = new THREE.Mesh(
    mesh_pivot_boss_24Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_pivot_boss_24.name = "Needle pivot boss";
  if (endpoint_pivot_boss_24) {
    mesh_pivot_boss_24.position.copy(endpoint_pivot_boss_24.midpoint);
    mesh_pivot_boss_24.quaternion.copy(endpoint_pivot_boss_24.quaternion);
  }
  mesh_pivot_boss_24.castShadow = options.castShadow ?? true;
  mesh_pivot_boss_24.receiveShadow = options.receiveShadow ?? true;
  mesh_pivot_boss_24.userData.sculptComponent = {"id": "pivot-boss", "name": "Needle pivot boss", "level": "meso", "role": "hardware", "importance": 0.7, "confidence": 0.85, "primitive": "sphere", "topologyClass": "assembled-solid", "topologyRationale": "Gold hemispherical cap sitting proud of the needle at the rotation axis.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "dial-plate", "attachment": {"parentSocket": "dial-pivot", "contactType": "socket", "embedDepth": 0.02, "gapTolerance": 0.0, "localStart": [0, 0.05, 0], "localEnd": [0, 0.12, 0]}, "dimensions": {"width": 0.139, "height": 0.1112, "depth": 0.139, "units": "scale factors on the emitted primitive; target world size (0.139, 0.1112, 0.139) in units of case diameter = 1.0", "targetWorldSize": [0.139, 0.1112, 0.139], "confidence": 0.85}, "transform": {"position": [0, 0.11, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "hardware", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.85}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-dial"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_pivot_boss_24.add(mesh_pivot_boss_24);
  meshes["pivot-boss"] = mesh_pivot_boss_24;
  colliders["pivot-boss"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_pivot_boss_24);

  const endpoint_bow_collar_25 = makeAttachmentEndpoint(null);
  const node_bow_collar_25 = new THREE.Group();
  node_bow_collar_25.name = "Bow collar (stepped stem)__pivot";
  node_bow_collar_25.scale.set(1, 1, 1);
  if (endpoint_bow_collar_25) {
    node_bow_collar_25.position.copy(endpoint_bow_collar_25.start);
    node_bow_collar_25.rotation.set(1.5708, 0.0, -3.14159);
  } else {
    node_bow_collar_25.position.set(0.0, 0.0, -0.5);
    node_bow_collar_25.rotation.set(1.5708, 0.0, -3.14159);
  }
  node_bow_collar_25.userData.sculptComponent = {"id": "bow-collar", "name": "Bow collar (stepped stem)", "level": "meso", "role": "connector", "importance": 0.6, "confidence": 0.8, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Short stepped stem with a flange lip, lathed like the case.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "latheProfile": {"points": [[0.0, -0.5], [0.25, -0.5], [0.23, -0.1], [0.25, 0.1], [0.22, 0.34], [0.2, 0.5], [0.0, 0.5]], "segments": 32}}, "parent": "case-body", "attachment": {"parentSocket": "case-rim-top", "contactType": "butt", "embedDepth": 0.02, "gapTolerance": 0.0, "localStart": [0, -0.05, 0], "localEnd": [0, 0.05, 0]}, "dimensions": {"width": 0.23, "height": 0.075, "depth": 0.23, "units": "scale factors on the emitted primitive; target world size (0.115, 0.075, 0.115) in units of case diameter = 1.0", "targetWorldSize": [0.115, 0.075, 0.115], "confidence": 0.8}, "transform": {"position": [0.0, 0.0, -0.5], "rotation": [1.5708, 0, -3.14159]}, "actionProfile": {"animationRole": "connector", "pivot": {"mode": "base", "localPosition": [0, -0.05, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-bow"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_bow_collar_25.userData.actionProfile = {"animationRole": "connector", "pivot": {"mode": "base", "localPosition": [0, -0.05, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["case-body"] ?? root).add(node_bow_collar_25);
  nodes["bow-collar"] = node_bow_collar_25;
  const mesh_bow_collar_25Geometry = endpoint_bow_collar_25
    ? new THREE.CylinderGeometry(endpoint_bow_collar_25.endRadius, endpoint_bow_collar_25.baseRadius, endpoint_bow_collar_25.length, 32, 12)
    : buildLatheGeometry({"points": [[0.0, -0.5], [0.25, -0.5], [0.23, -0.1], [0.25, 0.1], [0.22, 0.34], [0.2, 0.5], [0.0, 0.5]], "segments": 32});
  if (!endpoint_bow_collar_25) {
    mesh_bow_collar_25Geometry.scale(0.23, 0.075, 0.23);
  }
  const mesh_bow_collar_25 = new THREE.Mesh(
    mesh_bow_collar_25Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_bow_collar_25.name = "Bow collar (stepped stem)";
  if (endpoint_bow_collar_25) {
    mesh_bow_collar_25.position.copy(endpoint_bow_collar_25.midpoint);
    mesh_bow_collar_25.quaternion.copy(endpoint_bow_collar_25.quaternion);
  }
  mesh_bow_collar_25.castShadow = options.castShadow ?? true;
  mesh_bow_collar_25.receiveShadow = options.receiveShadow ?? true;
  mesh_bow_collar_25.userData.sculptComponent = {"id": "bow-collar", "name": "Bow collar (stepped stem)", "level": "meso", "role": "connector", "importance": 0.6, "confidence": 0.8, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Short stepped stem with a flange lip, lathed like the case.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "latheProfile": {"points": [[0.0, -0.5], [0.25, -0.5], [0.23, -0.1], [0.25, 0.1], [0.22, 0.34], [0.2, 0.5], [0.0, 0.5]], "segments": 32}}, "parent": "case-body", "attachment": {"parentSocket": "case-rim-top", "contactType": "butt", "embedDepth": 0.02, "gapTolerance": 0.0, "localStart": [0, -0.05, 0], "localEnd": [0, 0.05, 0]}, "dimensions": {"width": 0.23, "height": 0.075, "depth": 0.23, "units": "scale factors on the emitted primitive; target world size (0.115, 0.075, 0.115) in units of case diameter = 1.0", "targetWorldSize": [0.115, 0.075, 0.115], "confidence": 0.8}, "transform": {"position": [0.0, 0.0, -0.5], "rotation": [1.5708, 0, -3.14159]}, "actionProfile": {"animationRole": "connector", "pivot": {"mode": "base", "localPosition": [0, -0.05, 0], "axis": [0, 1, 0], "confidence": 0.8}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-bow"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_bow_collar_25.add(mesh_bow_collar_25);
  meshes["bow-collar"] = mesh_bow_collar_25;
  colliders["bow-collar"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_bow_collar_25);

  const endpoint_bow_ring_26 = makeAttachmentEndpoint(null);
  const node_bow_ring_26 = new THREE.Group();
  node_bow_ring_26.name = "Suspension ring__pivot";
  node_bow_ring_26.scale.set(1, 1, 1);
  if (endpoint_bow_ring_26) {
    node_bow_ring_26.position.copy(endpoint_bow_ring_26.start);
    node_bow_ring_26.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_bow_ring_26.position.set(0.0, 0.077, 0.0);
    node_bow_ring_26.rotation.set(0.0, 0.0, 0.0);
  }
  node_bow_ring_26.userData.sculptComponent = {"id": "bow-ring", "name": "Suspension ring", "level": "macro", "role": "handle", "importance": 0.8, "confidence": 0.85, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Open ring; a torus is exact. Ring plane is parallel to the dial plane in the reference.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "torusTubeRatio": 0.3}, "parent": "bow-collar", "attachment": {"parentSocket": "collar-top", "contactType": "socket", "embedDepth": 0.03, "gapTolerance": 0.0, "localStart": [0, -0.037, 0], "localEnd": [0, 0.037, 0]}, "dimensions": {"width": 0.25641, "height": 0.25641, "depth": 0.25641, "units": "scale factors on the emitted primitive; target world size (0.3, 0.3, 0.0692) in units of case diameter = 1.0", "targetWorldSize": [0.3, 0.3, 0.06923], "confidence": 0.85}, "transform": {"position": [0, 0.077, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "handle", "pivot": {"mode": "base", "localPosition": [0, -0.15, 0], "axis": [1, 0, 0], "confidence": 0.85}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-bow"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_bow_ring_26.userData.actionProfile = {"animationRole": "handle", "pivot": {"mode": "base", "localPosition": [0, -0.15, 0], "axis": [1, 0, 0], "confidence": 0.85}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["bow-collar"] ?? root).add(node_bow_ring_26);
  nodes["bow-ring"] = node_bow_ring_26;
  const mesh_bow_ring_26Geometry = endpoint_bow_ring_26
    ? new THREE.CylinderGeometry(endpoint_bow_ring_26.endRadius, endpoint_bow_ring_26.baseRadius, endpoint_bow_ring_26.length, 32, 12)
    : new THREE.TorusGeometry(0.45, 0.135, 24, 96);
  if (!endpoint_bow_ring_26) {
    mesh_bow_ring_26Geometry.scale(0.25641, 0.25641, 0.25641);
  }
  const mesh_bow_ring_26 = new THREE.Mesh(
    mesh_bow_ring_26Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_bow_ring_26.name = "Suspension ring";
  if (endpoint_bow_ring_26) {
    mesh_bow_ring_26.position.copy(endpoint_bow_ring_26.midpoint);
    mesh_bow_ring_26.quaternion.copy(endpoint_bow_ring_26.quaternion);
  }
  mesh_bow_ring_26.castShadow = options.castShadow ?? true;
  mesh_bow_ring_26.receiveShadow = options.receiveShadow ?? true;
  mesh_bow_ring_26.userData.sculptComponent = {"id": "bow-ring", "name": "Suspension ring", "level": "macro", "role": "handle", "importance": 0.8, "confidence": 0.85, "primitive": "torus", "topologyClass": "assembled-solid", "topologyRationale": "Open ring; a torus is exact. Ring plane is parallel to the dial plane in the reference.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "torusTubeRatio": 0.3}, "parent": "bow-collar", "attachment": {"parentSocket": "collar-top", "contactType": "socket", "embedDepth": 0.03, "gapTolerance": 0.0, "localStart": [0, -0.037, 0], "localEnd": [0, 0.037, 0]}, "dimensions": {"width": 0.25641, "height": 0.25641, "depth": 0.25641, "units": "scale factors on the emitted primitive; target world size (0.3, 0.3, 0.0692) in units of case diameter = 1.0", "targetWorldSize": [0.3, 0.3, 0.06923], "confidence": 0.85}, "transform": {"position": [0, 0.077, 0], "rotation": [0, 0, 0]}, "actionProfile": {"animationRole": "handle", "pivot": {"mode": "base", "localPosition": [0, -0.15, 0], "axis": [1, 0, 0], "confidence": 0.85}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-bow"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_bow_ring_26.add(mesh_bow_ring_26);
  meshes["bow-ring"] = mesh_bow_ring_26;
  colliders["bow-ring"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_bow_ring_26);

  const endpoint_crown_27 = makeAttachmentEndpoint(null);
  const node_crown_27 = new THREE.Group();
  node_crown_27.name = "Knurled crown__pivot";
  node_crown_27.scale.set(1, 1, 1);
  if (endpoint_crown_27) {
    node_crown_27.position.copy(endpoint_crown_27.start);
    node_crown_27.rotation.set(1.5708, 0.0, -2.56563);
  } else {
    node_crown_27.position.set(0.27232, 0.0, -0.41934);
    node_crown_27.rotation.set(1.5708, 0.0, -2.56563);
  }
  node_crown_27.userData.sculptComponent = {"id": "crown", "name": "Knurled crown", "level": "meso", "role": "hardware", "importance": 0.55, "confidence": 0.75, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Short knurled cylinder with a rounded cap; lathed profile carries the cap round.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "latheProfile": {"points": [[0.0, -0.5], [0.22, -0.5], [0.25, -0.3], [0.25, 0.28], [0.21, 0.46], [0.0, 0.5]], "segments": 32}}, "parent": "case-body", "attachment": {"parentSocket": "case-rim-upper-right", "contactType": "butt", "embedDepth": 0.02, "gapTolerance": 0.0, "localStart": [0, -0.045, 0], "localEnd": [0, 0.045, 0]}, "dimensions": {"width": 0.34, "height": 0.115, "depth": 0.34, "units": "scale factors on the emitted primitive; target world size (0.17, 0.115, 0.17) in units of case diameter = 1.0", "targetWorldSize": [0.17, 0.115, 0.17], "confidence": 0.75}, "transform": {"position": [0.27232, 0.0, -0.41934], "rotation": [1.5708, 0, -2.56563]}, "actionProfile": {"animationRole": "hardware", "pivot": {"mode": "base", "localPosition": [0, -0.045, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_27.userData.actionProfile = {"animationRole": "hardware", "pivot": {"mode": "base", "localPosition": [0, -0.045, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["case-body"] ?? root).add(node_crown_27);
  nodes["crown"] = node_crown_27;
  const mesh_crown_27Geometry = endpoint_crown_27
    ? new THREE.CylinderGeometry(endpoint_crown_27.endRadius, endpoint_crown_27.baseRadius, endpoint_crown_27.length, 32, 12)
    : buildLatheGeometry({"points": [[0.0, -0.5], [0.22, -0.5], [0.25, -0.3], [0.25, 0.28], [0.21, 0.46], [0.0, 0.5]], "segments": 32});
  if (!endpoint_crown_27) {
    mesh_crown_27Geometry.scale(0.34, 0.115, 0.34);
  }
  const mesh_crown_27 = new THREE.Mesh(
    mesh_crown_27Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_crown_27.name = "Knurled crown";
  if (endpoint_crown_27) {
    mesh_crown_27.position.copy(endpoint_crown_27.midpoint);
    mesh_crown_27.quaternion.copy(endpoint_crown_27.quaternion);
  }
  mesh_crown_27.castShadow = options.castShadow ?? true;
  mesh_crown_27.receiveShadow = options.receiveShadow ?? true;
  mesh_crown_27.userData.sculptComponent = {"id": "crown", "name": "Knurled crown", "level": "meso", "role": "hardware", "importance": 0.55, "confidence": 0.75, "primitive": "lathe", "topologyClass": "continuous-sculpt", "topologyRationale": "Short knurled cylinder with a rounded cap; lathed profile carries the cap round.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry", "latheProfile": {"points": [[0.0, -0.5], [0.22, -0.5], [0.25, -0.3], [0.25, 0.28], [0.21, 0.46], [0.0, 0.5]], "segments": 32}}, "parent": "case-body", "attachment": {"parentSocket": "case-rim-upper-right", "contactType": "butt", "embedDepth": 0.02, "gapTolerance": 0.0, "localStart": [0, -0.045, 0], "localEnd": [0, 0.045, 0]}, "dimensions": {"width": 0.34, "height": 0.115, "depth": 0.34, "units": "scale factors on the emitted primitive; target world size (0.17, 0.115, 0.17) in units of case diameter = 1.0", "targetWorldSize": [0.17, 0.115, 0.17], "confidence": 0.75}, "transform": {"position": [0.27232, 0.0, -0.41934], "rotation": [1.5708, 0, -2.56563]}, "actionProfile": {"animationRole": "hardware", "pivot": {"mode": "base", "localPosition": [0, -0.045, 0], "axis": [0, 1, 0], "confidence": 0.75}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_27.add(mesh_crown_27);
  meshes["crown"] = mesh_crown_27;
  colliders["crown"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_crown_27);

  const endpoint_crown_flute_01_28 = makeAttachmentEndpoint(null);
  const node_crown_flute_01_28 = new THREE.Group();
  node_crown_flute_01_28.name = "Crown flute 1__pivot";
  node_crown_flute_01_28.scale.set(1, 1, 1);
  if (endpoint_crown_flute_01_28) {
    node_crown_flute_01_28.position.copy(endpoint_crown_flute_01_28.start);
    node_crown_flute_01_28.rotation.set(0.0, -0.0, 0.0);
  } else {
    node_crown_flute_01_28.position.set(0.081, 0.0, 0.0);
    node_crown_flute_01_28.rotation.set(0.0, -0.0, 0.0);
  }
  node_crown_flute_01_28.userData.sculptComponent = {"id": "crown-flute-01", "name": "Crown flute 1", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [0.081, 0.0, 0.0], "rotation": [0, -0.0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_01_28.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["crown"] ?? root).add(node_crown_flute_01_28);
  nodes["crown-flute-01"] = node_crown_flute_01_28;
  const mesh_crown_flute_01_28Geometry = endpoint_crown_flute_01_28
    ? new THREE.CylinderGeometry(endpoint_crown_flute_01_28.endRadius, endpoint_crown_flute_01_28.baseRadius, endpoint_crown_flute_01_28.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_crown_flute_01_28) {
    mesh_crown_flute_01_28Geometry.scale(0.015, 0.07, 0.015);
  }
  const mesh_crown_flute_01_28 = new THREE.Mesh(
    mesh_crown_flute_01_28Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_crown_flute_01_28.name = "Crown flute 1";
  if (endpoint_crown_flute_01_28) {
    mesh_crown_flute_01_28.position.copy(endpoint_crown_flute_01_28.midpoint);
    mesh_crown_flute_01_28.quaternion.copy(endpoint_crown_flute_01_28.quaternion);
  }
  mesh_crown_flute_01_28.castShadow = options.castShadow ?? true;
  mesh_crown_flute_01_28.receiveShadow = options.receiveShadow ?? true;
  mesh_crown_flute_01_28.userData.sculptComponent = {"id": "crown-flute-01", "name": "Crown flute 1", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [0.081, 0.0, 0.0], "rotation": [0, -0.0, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_01_28.add(mesh_crown_flute_01_28);
  meshes["crown-flute-01"] = mesh_crown_flute_01_28;
  colliders["crown-flute-01"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_crown_flute_01_28);

  const endpoint_crown_flute_02_29 = makeAttachmentEndpoint(null);
  const node_crown_flute_02_29 = new THREE.Group();
  node_crown_flute_02_29.name = "Crown flute 2__pivot";
  node_crown_flute_02_29.scale.set(1, 1, 1);
  if (endpoint_crown_flute_02_29) {
    node_crown_flute_02_29.position.copy(endpoint_crown_flute_02_29.start);
    node_crown_flute_02_29.rotation.set(0.0, -0.62832, 0.0);
  } else {
    node_crown_flute_02_29.position.set(0.06553, 0.0, 0.04761);
    node_crown_flute_02_29.rotation.set(0.0, -0.62832, 0.0);
  }
  node_crown_flute_02_29.userData.sculptComponent = {"id": "crown-flute-02", "name": "Crown flute 2", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [0.06553, 0.0, 0.04761], "rotation": [0, -0.62832, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_02_29.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["crown"] ?? root).add(node_crown_flute_02_29);
  nodes["crown-flute-02"] = node_crown_flute_02_29;
  const mesh_crown_flute_02_29Geometry = endpoint_crown_flute_02_29
    ? new THREE.CylinderGeometry(endpoint_crown_flute_02_29.endRadius, endpoint_crown_flute_02_29.baseRadius, endpoint_crown_flute_02_29.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_crown_flute_02_29) {
    mesh_crown_flute_02_29Geometry.scale(0.015, 0.07, 0.015);
  }
  const mesh_crown_flute_02_29 = new THREE.Mesh(
    mesh_crown_flute_02_29Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_crown_flute_02_29.name = "Crown flute 2";
  if (endpoint_crown_flute_02_29) {
    mesh_crown_flute_02_29.position.copy(endpoint_crown_flute_02_29.midpoint);
    mesh_crown_flute_02_29.quaternion.copy(endpoint_crown_flute_02_29.quaternion);
  }
  mesh_crown_flute_02_29.castShadow = options.castShadow ?? true;
  mesh_crown_flute_02_29.receiveShadow = options.receiveShadow ?? true;
  mesh_crown_flute_02_29.userData.sculptComponent = {"id": "crown-flute-02", "name": "Crown flute 2", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [0.06553, 0.0, 0.04761], "rotation": [0, -0.62832, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_02_29.add(mesh_crown_flute_02_29);
  meshes["crown-flute-02"] = mesh_crown_flute_02_29;
  colliders["crown-flute-02"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_crown_flute_02_29);

  const endpoint_crown_flute_03_30 = makeAttachmentEndpoint(null);
  const node_crown_flute_03_30 = new THREE.Group();
  node_crown_flute_03_30.name = "Crown flute 3__pivot";
  node_crown_flute_03_30.scale.set(1, 1, 1);
  if (endpoint_crown_flute_03_30) {
    node_crown_flute_03_30.position.copy(endpoint_crown_flute_03_30.start);
    node_crown_flute_03_30.rotation.set(0.0, -1.25664, 0.0);
  } else {
    node_crown_flute_03_30.position.set(0.02503, 0.0, 0.07704);
    node_crown_flute_03_30.rotation.set(0.0, -1.25664, 0.0);
  }
  node_crown_flute_03_30.userData.sculptComponent = {"id": "crown-flute-03", "name": "Crown flute 3", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [0.02503, 0.0, 0.07704], "rotation": [0, -1.25664, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_03_30.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["crown"] ?? root).add(node_crown_flute_03_30);
  nodes["crown-flute-03"] = node_crown_flute_03_30;
  const mesh_crown_flute_03_30Geometry = endpoint_crown_flute_03_30
    ? new THREE.CylinderGeometry(endpoint_crown_flute_03_30.endRadius, endpoint_crown_flute_03_30.baseRadius, endpoint_crown_flute_03_30.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_crown_flute_03_30) {
    mesh_crown_flute_03_30Geometry.scale(0.015, 0.07, 0.015);
  }
  const mesh_crown_flute_03_30 = new THREE.Mesh(
    mesh_crown_flute_03_30Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_crown_flute_03_30.name = "Crown flute 3";
  if (endpoint_crown_flute_03_30) {
    mesh_crown_flute_03_30.position.copy(endpoint_crown_flute_03_30.midpoint);
    mesh_crown_flute_03_30.quaternion.copy(endpoint_crown_flute_03_30.quaternion);
  }
  mesh_crown_flute_03_30.castShadow = options.castShadow ?? true;
  mesh_crown_flute_03_30.receiveShadow = options.receiveShadow ?? true;
  mesh_crown_flute_03_30.userData.sculptComponent = {"id": "crown-flute-03", "name": "Crown flute 3", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [0.02503, 0.0, 0.07704], "rotation": [0, -1.25664, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_03_30.add(mesh_crown_flute_03_30);
  meshes["crown-flute-03"] = mesh_crown_flute_03_30;
  colliders["crown-flute-03"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_crown_flute_03_30);

  const endpoint_crown_flute_04_31 = makeAttachmentEndpoint(null);
  const node_crown_flute_04_31 = new THREE.Group();
  node_crown_flute_04_31.name = "Crown flute 4__pivot";
  node_crown_flute_04_31.scale.set(1, 1, 1);
  if (endpoint_crown_flute_04_31) {
    node_crown_flute_04_31.position.copy(endpoint_crown_flute_04_31.start);
    node_crown_flute_04_31.rotation.set(0.0, -1.88496, 0.0);
  } else {
    node_crown_flute_04_31.position.set(-0.02503, 0.0, 0.07704);
    node_crown_flute_04_31.rotation.set(0.0, -1.88496, 0.0);
  }
  node_crown_flute_04_31.userData.sculptComponent = {"id": "crown-flute-04", "name": "Crown flute 4", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [-0.02503, 0.0, 0.07704], "rotation": [0, -1.88496, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_04_31.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["crown"] ?? root).add(node_crown_flute_04_31);
  nodes["crown-flute-04"] = node_crown_flute_04_31;
  const mesh_crown_flute_04_31Geometry = endpoint_crown_flute_04_31
    ? new THREE.CylinderGeometry(endpoint_crown_flute_04_31.endRadius, endpoint_crown_flute_04_31.baseRadius, endpoint_crown_flute_04_31.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_crown_flute_04_31) {
    mesh_crown_flute_04_31Geometry.scale(0.015, 0.07, 0.015);
  }
  const mesh_crown_flute_04_31 = new THREE.Mesh(
    mesh_crown_flute_04_31Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_crown_flute_04_31.name = "Crown flute 4";
  if (endpoint_crown_flute_04_31) {
    mesh_crown_flute_04_31.position.copy(endpoint_crown_flute_04_31.midpoint);
    mesh_crown_flute_04_31.quaternion.copy(endpoint_crown_flute_04_31.quaternion);
  }
  mesh_crown_flute_04_31.castShadow = options.castShadow ?? true;
  mesh_crown_flute_04_31.receiveShadow = options.receiveShadow ?? true;
  mesh_crown_flute_04_31.userData.sculptComponent = {"id": "crown-flute-04", "name": "Crown flute 4", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [-0.02503, 0.0, 0.07704], "rotation": [0, -1.88496, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_04_31.add(mesh_crown_flute_04_31);
  meshes["crown-flute-04"] = mesh_crown_flute_04_31;
  colliders["crown-flute-04"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_crown_flute_04_31);

  const endpoint_crown_flute_05_32 = makeAttachmentEndpoint(null);
  const node_crown_flute_05_32 = new THREE.Group();
  node_crown_flute_05_32.name = "Crown flute 5__pivot";
  node_crown_flute_05_32.scale.set(1, 1, 1);
  if (endpoint_crown_flute_05_32) {
    node_crown_flute_05_32.position.copy(endpoint_crown_flute_05_32.start);
    node_crown_flute_05_32.rotation.set(0.0, -2.51327, 0.0);
  } else {
    node_crown_flute_05_32.position.set(-0.06553, 0.0, 0.04761);
    node_crown_flute_05_32.rotation.set(0.0, -2.51327, 0.0);
  }
  node_crown_flute_05_32.userData.sculptComponent = {"id": "crown-flute-05", "name": "Crown flute 5", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [-0.06553, 0.0, 0.04761], "rotation": [0, -2.51327, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_05_32.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["crown"] ?? root).add(node_crown_flute_05_32);
  nodes["crown-flute-05"] = node_crown_flute_05_32;
  const mesh_crown_flute_05_32Geometry = endpoint_crown_flute_05_32
    ? new THREE.CylinderGeometry(endpoint_crown_flute_05_32.endRadius, endpoint_crown_flute_05_32.baseRadius, endpoint_crown_flute_05_32.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_crown_flute_05_32) {
    mesh_crown_flute_05_32Geometry.scale(0.015, 0.07, 0.015);
  }
  const mesh_crown_flute_05_32 = new THREE.Mesh(
    mesh_crown_flute_05_32Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_crown_flute_05_32.name = "Crown flute 5";
  if (endpoint_crown_flute_05_32) {
    mesh_crown_flute_05_32.position.copy(endpoint_crown_flute_05_32.midpoint);
    mesh_crown_flute_05_32.quaternion.copy(endpoint_crown_flute_05_32.quaternion);
  }
  mesh_crown_flute_05_32.castShadow = options.castShadow ?? true;
  mesh_crown_flute_05_32.receiveShadow = options.receiveShadow ?? true;
  mesh_crown_flute_05_32.userData.sculptComponent = {"id": "crown-flute-05", "name": "Crown flute 5", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [-0.06553, 0.0, 0.04761], "rotation": [0, -2.51327, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_05_32.add(mesh_crown_flute_05_32);
  meshes["crown-flute-05"] = mesh_crown_flute_05_32;
  colliders["crown-flute-05"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_crown_flute_05_32);

  const endpoint_crown_flute_06_33 = makeAttachmentEndpoint(null);
  const node_crown_flute_06_33 = new THREE.Group();
  node_crown_flute_06_33.name = "Crown flute 6__pivot";
  node_crown_flute_06_33.scale.set(1, 1, 1);
  if (endpoint_crown_flute_06_33) {
    node_crown_flute_06_33.position.copy(endpoint_crown_flute_06_33.start);
    node_crown_flute_06_33.rotation.set(0.0, -3.14159, 0.0);
  } else {
    node_crown_flute_06_33.position.set(-0.081, 0.0, 0.0);
    node_crown_flute_06_33.rotation.set(0.0, -3.14159, 0.0);
  }
  node_crown_flute_06_33.userData.sculptComponent = {"id": "crown-flute-06", "name": "Crown flute 6", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [-0.081, 0.0, 0.0], "rotation": [0, -3.14159, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_06_33.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["crown"] ?? root).add(node_crown_flute_06_33);
  nodes["crown-flute-06"] = node_crown_flute_06_33;
  const mesh_crown_flute_06_33Geometry = endpoint_crown_flute_06_33
    ? new THREE.CylinderGeometry(endpoint_crown_flute_06_33.endRadius, endpoint_crown_flute_06_33.baseRadius, endpoint_crown_flute_06_33.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_crown_flute_06_33) {
    mesh_crown_flute_06_33Geometry.scale(0.015, 0.07, 0.015);
  }
  const mesh_crown_flute_06_33 = new THREE.Mesh(
    mesh_crown_flute_06_33Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_crown_flute_06_33.name = "Crown flute 6";
  if (endpoint_crown_flute_06_33) {
    mesh_crown_flute_06_33.position.copy(endpoint_crown_flute_06_33.midpoint);
    mesh_crown_flute_06_33.quaternion.copy(endpoint_crown_flute_06_33.quaternion);
  }
  mesh_crown_flute_06_33.castShadow = options.castShadow ?? true;
  mesh_crown_flute_06_33.receiveShadow = options.receiveShadow ?? true;
  mesh_crown_flute_06_33.userData.sculptComponent = {"id": "crown-flute-06", "name": "Crown flute 6", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [-0.081, 0.0, 0.0], "rotation": [0, -3.14159, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_06_33.add(mesh_crown_flute_06_33);
  meshes["crown-flute-06"] = mesh_crown_flute_06_33;
  colliders["crown-flute-06"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_crown_flute_06_33);

  const endpoint_crown_flute_07_34 = makeAttachmentEndpoint(null);
  const node_crown_flute_07_34 = new THREE.Group();
  node_crown_flute_07_34.name = "Crown flute 7__pivot";
  node_crown_flute_07_34.scale.set(1, 1, 1);
  if (endpoint_crown_flute_07_34) {
    node_crown_flute_07_34.position.copy(endpoint_crown_flute_07_34.start);
    node_crown_flute_07_34.rotation.set(0.0, -3.76991, 0.0);
  } else {
    node_crown_flute_07_34.position.set(-0.06553, 0.0, -0.04761);
    node_crown_flute_07_34.rotation.set(0.0, -3.76991, 0.0);
  }
  node_crown_flute_07_34.userData.sculptComponent = {"id": "crown-flute-07", "name": "Crown flute 7", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [-0.06553, 0.0, -0.04761], "rotation": [0, -3.76991, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_07_34.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["crown"] ?? root).add(node_crown_flute_07_34);
  nodes["crown-flute-07"] = node_crown_flute_07_34;
  const mesh_crown_flute_07_34Geometry = endpoint_crown_flute_07_34
    ? new THREE.CylinderGeometry(endpoint_crown_flute_07_34.endRadius, endpoint_crown_flute_07_34.baseRadius, endpoint_crown_flute_07_34.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_crown_flute_07_34) {
    mesh_crown_flute_07_34Geometry.scale(0.015, 0.07, 0.015);
  }
  const mesh_crown_flute_07_34 = new THREE.Mesh(
    mesh_crown_flute_07_34Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_crown_flute_07_34.name = "Crown flute 7";
  if (endpoint_crown_flute_07_34) {
    mesh_crown_flute_07_34.position.copy(endpoint_crown_flute_07_34.midpoint);
    mesh_crown_flute_07_34.quaternion.copy(endpoint_crown_flute_07_34.quaternion);
  }
  mesh_crown_flute_07_34.castShadow = options.castShadow ?? true;
  mesh_crown_flute_07_34.receiveShadow = options.receiveShadow ?? true;
  mesh_crown_flute_07_34.userData.sculptComponent = {"id": "crown-flute-07", "name": "Crown flute 7", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [-0.06553, 0.0, -0.04761], "rotation": [0, -3.76991, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_07_34.add(mesh_crown_flute_07_34);
  meshes["crown-flute-07"] = mesh_crown_flute_07_34;
  colliders["crown-flute-07"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_crown_flute_07_34);

  const endpoint_crown_flute_08_35 = makeAttachmentEndpoint(null);
  const node_crown_flute_08_35 = new THREE.Group();
  node_crown_flute_08_35.name = "Crown flute 8__pivot";
  node_crown_flute_08_35.scale.set(1, 1, 1);
  if (endpoint_crown_flute_08_35) {
    node_crown_flute_08_35.position.copy(endpoint_crown_flute_08_35.start);
    node_crown_flute_08_35.rotation.set(0.0, -4.39823, 0.0);
  } else {
    node_crown_flute_08_35.position.set(-0.02503, 0.0, -0.07704);
    node_crown_flute_08_35.rotation.set(0.0, -4.39823, 0.0);
  }
  node_crown_flute_08_35.userData.sculptComponent = {"id": "crown-flute-08", "name": "Crown flute 8", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [-0.02503, 0.0, -0.07704], "rotation": [0, -4.39823, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_08_35.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["crown"] ?? root).add(node_crown_flute_08_35);
  nodes["crown-flute-08"] = node_crown_flute_08_35;
  const mesh_crown_flute_08_35Geometry = endpoint_crown_flute_08_35
    ? new THREE.CylinderGeometry(endpoint_crown_flute_08_35.endRadius, endpoint_crown_flute_08_35.baseRadius, endpoint_crown_flute_08_35.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_crown_flute_08_35) {
    mesh_crown_flute_08_35Geometry.scale(0.015, 0.07, 0.015);
  }
  const mesh_crown_flute_08_35 = new THREE.Mesh(
    mesh_crown_flute_08_35Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_crown_flute_08_35.name = "Crown flute 8";
  if (endpoint_crown_flute_08_35) {
    mesh_crown_flute_08_35.position.copy(endpoint_crown_flute_08_35.midpoint);
    mesh_crown_flute_08_35.quaternion.copy(endpoint_crown_flute_08_35.quaternion);
  }
  mesh_crown_flute_08_35.castShadow = options.castShadow ?? true;
  mesh_crown_flute_08_35.receiveShadow = options.receiveShadow ?? true;
  mesh_crown_flute_08_35.userData.sculptComponent = {"id": "crown-flute-08", "name": "Crown flute 8", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [-0.02503, 0.0, -0.07704], "rotation": [0, -4.39823, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_08_35.add(mesh_crown_flute_08_35);
  meshes["crown-flute-08"] = mesh_crown_flute_08_35;
  colliders["crown-flute-08"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_crown_flute_08_35);

  const endpoint_crown_flute_09_36 = makeAttachmentEndpoint(null);
  const node_crown_flute_09_36 = new THREE.Group();
  node_crown_flute_09_36.name = "Crown flute 9__pivot";
  node_crown_flute_09_36.scale.set(1, 1, 1);
  if (endpoint_crown_flute_09_36) {
    node_crown_flute_09_36.position.copy(endpoint_crown_flute_09_36.start);
    node_crown_flute_09_36.rotation.set(0.0, -5.02655, 0.0);
  } else {
    node_crown_flute_09_36.position.set(0.02503, 0.0, -0.07704);
    node_crown_flute_09_36.rotation.set(0.0, -5.02655, 0.0);
  }
  node_crown_flute_09_36.userData.sculptComponent = {"id": "crown-flute-09", "name": "Crown flute 9", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [0.02503, 0.0, -0.07704], "rotation": [0, -5.02655, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_09_36.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["crown"] ?? root).add(node_crown_flute_09_36);
  nodes["crown-flute-09"] = node_crown_flute_09_36;
  const mesh_crown_flute_09_36Geometry = endpoint_crown_flute_09_36
    ? new THREE.CylinderGeometry(endpoint_crown_flute_09_36.endRadius, endpoint_crown_flute_09_36.baseRadius, endpoint_crown_flute_09_36.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_crown_flute_09_36) {
    mesh_crown_flute_09_36Geometry.scale(0.015, 0.07, 0.015);
  }
  const mesh_crown_flute_09_36 = new THREE.Mesh(
    mesh_crown_flute_09_36Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_crown_flute_09_36.name = "Crown flute 9";
  if (endpoint_crown_flute_09_36) {
    mesh_crown_flute_09_36.position.copy(endpoint_crown_flute_09_36.midpoint);
    mesh_crown_flute_09_36.quaternion.copy(endpoint_crown_flute_09_36.quaternion);
  }
  mesh_crown_flute_09_36.castShadow = options.castShadow ?? true;
  mesh_crown_flute_09_36.receiveShadow = options.receiveShadow ?? true;
  mesh_crown_flute_09_36.userData.sculptComponent = {"id": "crown-flute-09", "name": "Crown flute 9", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [0.02503, 0.0, -0.07704], "rotation": [0, -5.02655, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_09_36.add(mesh_crown_flute_09_36);
  meshes["crown-flute-09"] = mesh_crown_flute_09_36;
  colliders["crown-flute-09"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_crown_flute_09_36);

  const endpoint_crown_flute_10_37 = makeAttachmentEndpoint(null);
  const node_crown_flute_10_37 = new THREE.Group();
  node_crown_flute_10_37.name = "Crown flute 10__pivot";
  node_crown_flute_10_37.scale.set(1, 1, 1);
  if (endpoint_crown_flute_10_37) {
    node_crown_flute_10_37.position.copy(endpoint_crown_flute_10_37.start);
    node_crown_flute_10_37.rotation.set(0.0, -5.65487, 0.0);
  } else {
    node_crown_flute_10_37.position.set(0.06553, 0.0, -0.04761);
    node_crown_flute_10_37.rotation.set(0.0, -5.65487, 0.0);
  }
  node_crown_flute_10_37.userData.sculptComponent = {"id": "crown-flute-10", "name": "Crown flute 10", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [0.06553, 0.0, -0.04761], "rotation": [0, -5.65487, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_10_37.userData.actionProfile = {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}};
  (nodes["crown"] ?? root).add(node_crown_flute_10_37);
  nodes["crown-flute-10"] = node_crown_flute_10_37;
  const mesh_crown_flute_10_37Geometry = endpoint_crown_flute_10_37
    ? new THREE.CylinderGeometry(endpoint_crown_flute_10_37.endRadius, endpoint_crown_flute_10_37.baseRadius, endpoint_crown_flute_10_37.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  if (!endpoint_crown_flute_10_37) {
    mesh_crown_flute_10_37Geometry.scale(0.015, 0.07, 0.015);
  }
  const mesh_crown_flute_10_37 = new THREE.Mesh(
    mesh_crown_flute_10_37Geometry,
    materialMap["mat-gold"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_crown_flute_10_37.name = "Crown flute 10";
  if (endpoint_crown_flute_10_37) {
    mesh_crown_flute_10_37.position.copy(endpoint_crown_flute_10_37.midpoint);
    mesh_crown_flute_10_37.quaternion.copy(endpoint_crown_flute_10_37.quaternion);
  }
  mesh_crown_flute_10_37.castShadow = options.castShadow ?? true;
  mesh_crown_flute_10_37.receiveShadow = options.receiveShadow ?? true;
  mesh_crown_flute_10_37.userData.sculptComponent = {"id": "crown-flute-10", "name": "Crown flute 10", "level": "micro", "role": "marking", "importance": 0.25, "confidence": 0.6, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Knurl flute: a shallow raised rib on the crown barrel.", "geometryDescriptor": {"topologyIntent": "stylized icon form: large-radius rounds, no hard corners in silhouette", "edgeTreatment": {"type": "fillet", "bevelRadius": 0.02, "segments": 3}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "vertex normals from generated geometry"}, "parent": "crown", "attachment": {"parentSocket": "crown-barrel", "contactType": "overlap", "overlap": 0.004, "gapTolerance": 0.0, "localStart": [0, -0.0275, 0], "localEnd": [0, 0.0275, 0]}, "dimensions": {"width": 0.015, "height": 0.07, "depth": 0.015, "units": "scale factors on the emitted primitive; target world size (0.015, 0.07, 0.015) in units of case diameter = 1.0", "targetWorldSize": [0.015, 0.07, 0.015], "confidence": 0.6}, "transform": {"position": [0.06553, 0.0, -0.04761], "rotation": [0, -5.65487, 0]}, "actionProfile": {"animationRole": "marking", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.6}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "base"}}, "material": "mat-gold", "materialLayers": ["mat-gold"], "deformations": [], "joints": [], "seams": [], "localFeatures": [], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["zone-crown"], "details": [], "fidelityTier": "blockout", "colorMaterialRecipe": {"dominantAlbedo": "rgba(223, 140, 31, 1)", "secondaryAlbedo": "rgba(253, 183, 73, 1)", "materialClass": "plastic", "materialClassConfidence": 0.6, "classNote": "DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero environment reflection. Classified by response, not by what the object is meant to be.", "colorGradient": {"type": "linear", "angleDeg": 135, "stops": [{"position": 0.0, "color": "rgba(253, 183, 73, 1)"}, {"position": 0.5, "color": "rgba(223, 140, 31, 1)"}, {"position": 1.0, "color": "rgba(196, 116, 27, 1)"}]}}};
  node_crown_flute_10_37.add(mesh_crown_flute_10_37);
  meshes["crown-flute-10"] = mesh_crown_flute_10_37;
  colliders["crown-flute-10"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Icon-scale prop; a box proxy is sufficient for pick/click."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_crown_flute_10_37);
  // repetition system "tick-ring" describes 12 parts that are already built individually; not instanced.
  // repetition system "rose-points" describes 8 parts that are already built individually; not instanced.
  // repetition system "crown-knurl" describes 10 parts that are already built individually; not instanced.

  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups } satisfies ProceduralModelRuntime;
  root.userData.lookDevTargets = {"qualityPriority": "reference-fidelity", "materialPass": {"albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": {"requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry"}, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"]}, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."]};
  root.userData.actionReadiness = {
    note: 'Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets.',
  };
  return root;
}

export function createAdventureCompassLookDevLights(
  mode: 'neutral' | 'grazing' | 'reference' = 'neutral',
): THREE.Group {
  const lights = new THREE.Group();
  lights.name = "Adventure Compass look-dev lights";
  const hemi = new THREE.HemisphereLight(
    mode === 'reference' ? 0xfff0d6 : 0xf2f4ff,
    0x363b42,
    mode === 'grazing' ? 0.28 : mode === 'reference' ? 0.72 : 0.85,
  );
  lights.add(hemi);
  const key = new THREE.DirectionalLight(
    mode === 'reference' ? 0xffcf8a : 0xfff4e8,
    mode === 'grazing' ? 4.2 : mode === 'reference' ? 2.6 : 2.15,
  );
  if (mode === 'grazing') key.position.set(7.5, 1.1, 4.0);
  else if (mode === 'reference') key.position.set(-4.5, 7.5, 5.0);
  else key.position.set(-4.0, 6.0, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.018;
  key.shadow.radius = 7;
  key.shadow.blurSamples = 24;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -2.6;
  key.shadow.camera.right = 2.6;
  key.shadow.camera.top = 2.6;
  key.shadow.camera.bottom = -2.6;
  key.shadow.camera.updateProjectionMatrix();
  lights.add(key);
  const fill = new THREE.DirectionalLight(0xa8c4ff, mode === 'grazing' ? 0.12 : 0.42);
  fill.position.set(4.0, 3.0, 3.5);
  lights.add(fill);
  const rim = new THREE.DirectionalLight(0xfff1c4, mode === 'grazing' ? 0.28 : 0.85);
  rim.position.set(0.5, 4.5, -6.0);
  lights.add(rim);
  lights.userData.reviewMode = mode;
  lights.userData.lightingFromPhoto = ["key light: directional, azimuth 135 deg, elevation 40 deg, intensity 2.6, colour #FFF6E8 -- matches the upper-left key that puts the highlight band on the bezel's upper-left rim", "fill light: directional, azimuth -40 deg, elevation 10 deg, intensity 0.55, colour #DCE6FF -- lifts the lower-right terminator to the measured (196,116,27) rather than to black", "rim light: directional, azimuth 200 deg, elevation 25 deg, intensity 0.4, colour #FFFFFF", "ambient: hemisphere, intensity 0.55, colour #FFFFFF -- the reference has no black anywhere", "environment: none. The reference shows zero environment reflection, so an HDRI would add specular structure the reference does not have", "contact shadow: soft shadow of the rose and needle onto the dial plate, plus ambient occlusion in the dial recess -- these are the only dark values on the face", "exposure and tone mapping: ACES filmic off; use linear-to-sRGB with exposure 1.0. Filmic tone mapping desaturates the reference's saturated gold and red, which is a measurable regression"];
  lights.userData.lookDevTargets = {"qualityPriority": "reference-fidelity", "materialPass": {"albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": {"requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry"}, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"]}, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."]};
  return lights;
}

// PBR materials (clearcoat/iridescence/transmission/anisotropy) need an environment
// map to visually behave as intended — call this once per renderer and assign the
// result to scene.environment before rendering. No external HDR asset required.
export function createAdventureCompassEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return texture;
}

// Plan 1.3 §3.2 — auto-framing by bounding box. The Divine Eye can only compare a
// render to the reference if the object is FRAMED consistently (an object framed
// differently scores as wrong even when its shape is right). This positions the camera
// deterministically from the object's bounding box so it fills the frame at a stable
// margin, and sets near/far to the object scale. Call after adding the model to the
// scene, and again on resize (after updating camera.aspect).
export function frameAdventureCompassCamera(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  options: { margin?: number; azimuthDeg?: number; elevationDeg?: number } = {},
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const margin = options.margin ?? 1.15;
  const maxDim = Math.max(size.x, size.y, size.z) * margin;
  const fov = (camera.fov * Math.PI) / 180;
  // distance so the largest object dimension fits vertically in the frame
  const distance = (maxDim / 2) / Math.tan(fov / 2);
  const az = ((options.azimuthDeg ?? 0) * Math.PI) / 180;
  const el = ((options.elevationDeg ?? 0) * Math.PI) / 180;
  const dir = new THREE.Vector3(
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
    Math.cos(az) * Math.cos(el),
  );
  camera.position.copy(center).addScaledVector(dir, distance);
  camera.near = Math.max(0.01, distance - maxDim);
  camera.far = distance + maxDim * 2;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

// Plan 1.3 §3.2c — PRESENTATION composer (DOF + bloom). CRITICAL (R-POSTFX): this is
// for the showcase/hero render ONLY. The Divine Eye's EVALUATION render MUST use a
// plain renderer with NO composer — bloom blows highlights and DOF blurs edges, which
// would corrupt the deterministic IoU/DCD/edge/blowout signals. Enable dof/bloom ONLY
// when the reference photo actually exhibits them (detect_reference_effects.py authorizes).
export function createAdventureCompassPresentationComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: { dof?: boolean; bloom?: boolean; bloomStrength?: number; dofFocus?: number; dofAperture?: number } = {},
): EffectComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (options.dof) {
    composer.addPass(new BokehPass(scene, camera, {
      focus: options.dofFocus ?? 10.0,
      aperture: options.dofAperture ?? 0.0002,
      maxblur: 0.01,
    }));
  }
  if (options.bloom) {
    const size = new THREE.Vector2();
    renderer.getSize(size);
    composer.addPass(new UnrealBloomPass(size, options.bloomStrength ?? 0.4, 0.4, 0.85));
  }
  return composer;
}

export function configureAdventureCompassRenderer(renderer: THREE.WebGLRenderer): void {
  // Load-bearing for view-dependent finishes (anodized / Doppler): without ACES + sRGB
  // the environment reflection reads flat/washed instead of a believable metal response.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
}

export function createAdventureCompassInspectControls(
  camera: THREE.Camera,
  domElement: HTMLElement,
): OrbitControls {
  // View-dependent finishes only read correctly once the user orbits — their color
  // comes from the environment reflection, not albedo, so free rotation matters here.
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.minDistance = 1.0;
  controls.maxDistance = 8.0;
  controls.autoRotate = false;
  return controls;
}
