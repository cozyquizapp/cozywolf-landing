# img2threejs — Adventure Compass

A procedural Three.js reconstruction of `reference.png`, built with the
[img2threejs](https://github.com/img2threejs/img2threejs) skill pipeline. Code-only: no mesh
extraction, no photogrammetry, no downloaded art.

**Self-contained on purpose.** This folder has its own `package.json` so the landing site's
dependency graph is untouched — nothing here adds `three` to the app.

```bash
cd experiments/img2threejs-compass
npm install
npm run dev          # http://localhost:5173  (?az=..&el=..&flat=1&margin=.. drive the review camera)
```

## Where it got to

The **blockout pass is complete and gated**. Passes 2–8 (structural → optimization) are not run.

| gate | result |
|---|---|
| `check_reference_admission.py` | admitted, foreground coverage 0.364, single component |
| `validate_sculpt_spec.py --strict-quality` | PASS |
| Divine Eye silhouette IoU | **0.8666** (hard gate ≥ 0.85) |
| Divine Eye scale delta | **0.0000** (hard gate ≤ 0.08) |
| Divine Eye aspect-ratio delta | 0.0038 |
| `diagnose_render.py` tier 1 | passed, bilateral symmetry error 0.0169 |
| `turntable_gate.py` (0/90/180/270) | passed with `--allow-holes` — the bow ring is a real through-hole |
| `check_part_coverage.py` | 0 errors, 3 warnings |
| recorded fidelity | **0.80** — between the grimoire's 0.75 "reads correctly, local details approximate" and 0.85 "strong procedural match" |

38 components, 4 materials, 41,528 triangles, 38 meshes.

## What the reference actually says

Every proportion below was **measured** off the 1024² reference, not eyeballed
(`evidence/measure_reference.py`). Three first-glance readings were wrong and the measurements
corrected them:

| quantity | first glance | measured |
|---|---|---|
| tick count | 16 | **12** at ~30°, r/R 0.87 |
| bezel width | 0.14 of case radius | **0.271** of case radius |
| needle axis | "about 45°" | **47.4°**, length 0.707 D, width/length 0.188 |
| dial / case diameter | ~0.72 | 0.729 |
| total height / case width | — | 1.227 |

Palette sampled from a full-resolution row scan at y=600, lit and shadowed values read
separately so highlights are never baked into albedo: gold highlight (253,183,73) / mid
(223,140,31) / terminator (196,116,27); dial (251,220,172); navy lit (79,97,120) / shadowed
(48,65,88); red lit (244,78,48) / shadowed (197,32,14).

**The gold is a dielectric, not metal.** Broad soft speculars with zero environment reflection is
not what metalness 1.0 produces. `colorMaterialRecipe.materialClass` is therefore `plastic` with
a `classNote` saying the object *depicts* gold — classified by measured response, not by what it
is meant to be. All four materials use the `textureless` declaration: the reference is a
flat-shaded icon with no grain, print or pores at 1:1, so synthesising PBR maps would have
forced albedo to white and added mottling the reference does not have.

## Three corrections this pass

1. **`transform.scale` was making the factory discard every dimension.** `scale_triple()`
   short-circuits on its presence, so every part emitted `geometry.scale(1,1,1)` — the case
   rendered at diameter 2.0 and the crown sat in the middle of the dial. Removed it, and rewrote
   the lathe profiles into unit space (radius ≤ 0.5) since dimensions now multiply them.
2. **Round cones made a blobby star.** `attachment.localStart/localEnd` silently routes
   cylinder/capsule/cone through an endpoint path that replaces the primitive with a cylinder and
   ignores dimensions, so the rose points were round spikes. Switched them to `extrude` (not an
   attachment primitive) with a centred triangle profile — flat plates lying in the dial plane,
   which is what the reference shows — and lifted the needle clear of them.
3. **The bow sat too high.** Render total-height/case-width was 1.34 against the reference's
   measured 1.227. Lowering the ring took silhouette IoU from 0.802 to 0.834 and aspect-ratio
   delta from 0.0586 to 0.0072 — the single biggest gate win of the run.

## What still does not match

Stated plainly rather than scored around:

- **The dial cream renders tan.** `tonalParity` 0.2732, `hueZoneParity` 0.0000. The look-dev
  rig's hemisphere light uses a dark ground (0x363b42) that drags the dial down; `preview.ts`
  adds the white ambient the spec's `lightingFromPhoto` actually asks for, which helps but does
  not close it. This is material/lighting-pass work.
- **The rose's cast shadow is far heavier** than the reference's soft contact shadow.
- **The bezel is a smooth donut**; the reference has a flatter front face with a distinct inner
  step.
- **Rose points read spindlier** than the reference's broader triangles (feature score 0.72).
- **Everything behind the object is invention.** The back plate, case thickness (±40%), bezel
  separability and total crown flute count are recorded in `spec.assumptions` as inferred, not
  observed. One view cannot show them.

## Layout

```
reference.png              the admitted reference
assessment.json            pre-spec assessment + quality contract
object-sculpt-spec.json    the authored spec (38 components, review history)
build_spec.py              authors the spec from measured constants — edit this, not the JSON
fill_assessment.py         fills the assessment skeleton from the image analysis
src/createCompassModel.ts  GENERATED by generate_threejs_factory.py — do not hand-edit
src/preview.ts             review harness (plain renderer, no composer, no ACES)
capture.mjs                turntable capture;  capture_flat.mjs  map-stripped blockout evidence
evidence/                  measurements, admission, PBR extraction, gate results, zone crops
renders/                   turntable views, flat blockout, comparison sheets
.img2threejs/state.json    pipeline checklist state
```

> **Known wart:** `object-sculpt-spec.json` stores `viewEvidence` paths as absolute
> `/home/user/...` paths, because `validate_sculpt_spec.py` resolves them against the process cwd.
> Re-running `build_spec.py` regenerates them for wherever the checkout lives.
>
> `evidence/pbr-mat-*.json` record the `extract_pbr_evidence.py` run (confidence 0.86 gold,
> 0.847 dial, both over the 0.7 threshold). The extracted map PNGs themselves are not committed:
> the materials are declared `textureless`, so wiring them in would have contradicted the
> declaration and baked the reference's own lighting into albedo.

## Reproducing

With the skill checked out at `$SKILL`:

```bash
python3 $SKILL/forge/stage2_spec/new_pre_spec_assessment.py "Adventure Compass" \
  --image reference.png --complexity complex --out assessment.json --force
python3 fill_assessment.py assessment.json evidence/zones
python3 $SKILL/forge/stage2_spec/new_sculpt_spec.py "Adventure Compass" \
  --image reference.png --assessment assessment.json --out object-sculpt-spec.json --force
python3 build_spec.py object-sculpt-spec.json
python3 $SKILL/forge/stage2_spec/validate_sculpt_spec.py object-sculpt-spec.json --strict-quality
python3 $SKILL/forge/stage3_build/generate_threejs_factory.py object-sculpt-spec.json \
  --out src/createCompassModel.ts --pass-id blockout --force
```
