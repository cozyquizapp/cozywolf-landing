# Stage 1 — Layered Image Analysis (agent vision)
Subject: stylized pocket compass / clip-art-style 3D icon
Reference: NOT YET ON DISK (chat attachment only) — pipeline blocked at probe_image.py

## Layer 1 — Identification & classification
- work type: pocket compass (bezel-cased magnetic compass with suspension ring)
- broad classification: hand-held navigational instrument / prop
- primaryDomain: object
- confidence: 0.93 (compass vs. stopwatch ambiguity: the crown-like knob at upper-right
  and the bow+ring read as pocket-watch hardware; the dial carries a compass rose and a
  red/dark needle pair, not hour hands -> compass)
- render style: stylized 3D icon, soft-shaded, no photographic texture; white cutout background

## Layer 2 — Overall form & silhouette
- bounding volume: a flattened cylinder (disc) + two small attachments on the upper rim
- footprint: circular; case aspect ratio approx diameter:thickness = 1 : 0.22 (inferred,
  thickness read from the visible right-side wall band)
- symmetry: radial for the case; bilateral for the case+bow assembly about the vertical axis;
  the dial contents are asymmetric (needle at ~45 deg)
- shape language: geometric, heavily filleted (every edge is a large-radius round)
- view: three-quarter, camera slightly above and to the left, object tipped back ~15-20 deg

## Layer 3 — Macro -> meso -> micro
macro:
  1. case (outer housing)
  2. dial assembly (face + rose + needle)
  3. suspension hardware (bow + ring)
  4. crown knob
meso:
  case: outer bezel ring (torus-like rounded rim), side wall, back plate (hidden)
  dial: recessed dial plate, compass rose star, needle, center cap/pivot boss, tick ring
  hardware: collar/stem (short cylinder on the rim), bow ring (torus)
  crown: short knurled cylinder + rounded cap
micro:
  knurling ridges on the crown (approx 6-7 visible vertical flutes)
  16 tick marks around the dial (rounded-cap capsules, two lengths: 4 long at cardinals? see L7)
  bevel highlight band along the upper-left of the bezel
  contact shadow of needle+rose cast onto the dial plate

## Layer 4 — Spatial relationships
- <bezel ring, flush-with, side wall> contact: continuous (one lathed body)
- <dial plate, inside, case> contact: embed (recessed below the bezel top face)
- <tick ring, on-surface-of, dial plate> contact: embed/overlay, raised slightly
- <compass rose, on-surface-of, dial plate> contact: raised, casts a soft shadow
- <needle, above, compass rose> contact: pivoted at center, sits proximal (closer to camera)
- <center cap, attached-to, needle> contact: socket at the rotation axis
- <collar, attached-to, case rim> contact: butt joint at 12 o'clock
- <bow ring, attached-to, collar> contact: socket, ring plane parallel to the dial plane
- <crown, attached-to, case rim> contact: butt joint at approx 1-2 o'clock, axis radial

## Layer 5 — Materials & surface (PBR)
- case/bow/crown/center cap: single material. Observed: saturated yellow-orange with broad
  soft highlights and no sharp environment reflections. Inference: stylized metalness ~0.0-0.2
  with roughness ~0.35-0.45 (a "toy gold" dielectric), NOT a physical gold (metalness 1.0
  would show a mirrored environment absent here).
- dial plate: pale warm cream, matte. albedo high value, low saturation; roughness ~0.8,
  metalness 0.
- compass rose + ticks: desaturated dark navy, matte, roughness ~0.75.
- needle north half: vivid red-orange, matte, same finish family as the rose.
- no translucency anywhere; all surfaces opaque.
- relief: none observable (no pitting, grain, brushing) — clean stylized surfaces only.

## Layer 6 — Color & finish
- gold body gradient, ordered stops along the bezel from upper-left to lower-right:
  0.0 light warm yellow (highlight) -> 0.5 mid saturated amber -> 1.0 deeper orange-amber (terminator)
- dial plate: near-uniform cream with a slight darkening toward the lower-right inner wall
  (inferred contact/occlusion shading from the bezel, not albedo)
- rose: two-tone — the visible star facets alternate between a lighter and a darker navy,
  reading as facet shading rather than two albedos
- needle: single red-orange albedo, south half of the needle also red (both halves red;
  the dark counter-point is the rose, not a south needle)
- finish overall: satin/matte, stylized soft-shadow shading. No anodizing, no gloss speculars.

## Layer 7 — Identity-defining features
1. eight-point compass rose star with long slender points, dark navy, raised off the dial
2. red needle crossing the rose diagonally (approx NE-SW in image space), longer than the rose points
3. central gold boss cap at the pivot
4. ring of 16 rounded tick capsules just inside the bezel
5. bow + ring suspension at 12 o'clock, ring outer diameter approx 0.30 of the case diameter
6. knurled crown at approx 1-2 o'clock, small
7. large-radius fillet on every bezel edge — the silhouette has no hard corners
8. thick bezel: the gold rim occupies approx 0.14 of the case radius

## Layer 8 — Uncertainty & single-image limits
- hidden: entire back plate, hinge (if any), back-side case profile
- hidden: the dial's south/lower-left tick spacing is partly cropped by perspective
- uncertain: exact tick count (16 assumed from visible arc spacing; needs counting on pixels)
- uncertain: whether the rose has 8 or 16 points (secondary short points may be hidden under
  the needle)
- uncertain: crown flute count
- uncertain: case thickness — read from a foreshortened side band, +/- 40%
- undetermined: whether the bezel is a separate rotating ring or one body with the case
- needs another view: rear, and a straight-on top view for tick/rose counting

---

# Measured corrections (full-resolution pass, evidence/measure3.py)

The pre-file eyeball estimates were wrong in three places. Measured values win.

| quantity | eyeballed | MEASURED | method |
|---|---|---|---|
| bezel ring width | 0.14 of case radius | **0.271 of case radius** (91 px of 335) | cream-component flood fill vs. alpha span |
| tick count | 16 | **12** (~30 deg spacing) | connected-component clustering in the annulus r/R > 0.62 |
| dial / case diameter | approx 0.72 | **0.729** | confirmed |
| case tilt | 15-20 deg back | **near face-on**, dial projects 489x497 px (aspect 1.016) | dial bbox aspect |
| gold albedo | "yellow-orange" | mid **(223,140,31)**, highlight **(253,183,73)**, terminator **(196,116,27)** | row scan y=600 |
| dial albedo | "cream" | **(251,220,172)** | row scan y=600 |
| navy albedo | "dark navy" | shadowed **(48,65,88)**, lit **(79,97,120)** | row scan y=600 |
| red albedo | "vivid red-orange" | lit **(244,78,48)**, shadowed **(197,32,14)** | row scan y=600 |

## Resolved unknowns
- rose is **8-pointed** (4 long cardinal points + 4 shorter intercardinal), confirmed on the
  dial crop; the earlier "8 or 16" ambiguity is closed.
- tick ring is **12 capsules**, not 16 — the base asset is a stopwatch/clock face reused as a
  compass. This is an identity feature: 16 ticks would read visibly wrong.
- needle: both halves are red; the dark counterpart is the rose beneath it, confirmed.
- needle principal axis measured at -77.6 deg image-space (steep, close to vertical), NOT the
  45 deg the first-glance analysis claimed.

## Still unknown after measurement (carry to unknownsToResolveBeforeImplementation)
- entire back plate and case rear profile: hidden
- case thickness: only the right-side wall band is visible; approx 0.22 of diameter, +/- 40%
- whether the bezel is a separate rotating ring or one lathed body with the case: undetermined
- crown flute count: approx 6-7 visible on the near face, total undetermined
