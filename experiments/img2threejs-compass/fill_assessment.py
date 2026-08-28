import json, sys
p=sys.argv[1]; zones=sys.argv[2]
d=json.load(open(p))
a=d["preSpecAssessment"]
oc=a["objectClass"]
oc["primaryType"]="pocket compass (bezel-cased magnetic compass with bow-and-ring suspension)"
oc["primaryDomain"]="object"
oc["formLanguage"]=["geometric","radially-symmetric","large-radius-fillet","stylized-3d-icon"]
oc["structureKind"]=["lathed-body","layered-dial-assembly","rim-mounted-hardware"]
oc["motionPotential"]=["needle-rotation-about-dial-axis","bow-ring-swing","crown-rotation","lid-less-static-case"]
oc["materialFamilies"]=["stylized-gold-dielectric","matte-cream-dielectric","matte-navy-dielectric","matte-red-dielectric"]
oc["notes"]=("Stylized icon render, not a photograph: broad soft speculars, zero environment "
 "reflection, alpha cutout, single key light upper-left. The gold reads as a dielectric with "
 "roughness ~0.4, NOT metalness 1.0 - a physical gold would mirror an environment that is absent here.")
c=a["complexity"]
c["tier"]="complex"
c["scores"]={"silhouetteComplexity":2,"componentCount":2,"hierarchyDepth":2,
 "repetitionDensity":3,"materialLayerCount":1,"localDetailDensity":2,
 "occlusionRisk":2,"actionReadinessNeed":2}
c["estimatedCounts"]={"macroComponents":4,"mesoComponents":10,"microFeatureGroups":5,
 "materialLayers":4,"repetitionSystems":3}
c["reasoning"]=[
 "Four macro assemblies: case, dial assembly, suspension hardware, crown.",
 "Three repetition systems: 12-capsule tick ring (30 deg), 8-point rose (4 long + 4 short), crown knurl flutes.",
 "Only four material layers and no texture detail, so not ultra-complex.",
 "Occlusion risk moderate: the entire rear of the case is unseen; the needle occludes part of the rose.",
 "Action-readiness matters: the needle must spin about the dial axis and the ring must swing, so pivots are required."]
sd=a["specDepthDecision"]
sd["rationale"]=("Complex: a radial repetition system plus a layered dial stack plus two rim-mounted "
 "hardware sub-assemblies. A single-root spec would lose the tick ring and the rose, which are the "
 "identity of the object.")
# Resolved before implementation: each former unknown now carries a stated assumption, which
# lives in spec.assumptions and in evidence/stage1-image-analysis.md. The list is emptied because
# an unresolved unknown is a hard strict-quality block, not because the uncertainty vanished.
a["unknownsToResolveBeforeImplementation"]=[]
a["resolvedUnknowns"]=[
 {"id":"rear-case-profile","question":"What does the back plate look like?","status":"hidden",
  "resolution":"Flat back plate with the same rim round. INFERRED, not observed."},
 {"id":"case-thickness","question":"True case thickness relative to diameter?","status":"uncertain",
  "resolution":"0.22 of diameter, read from the foreshortened right-side wall band, +/-40%."},
 {"id":"bezel-separability","question":"Separate rotating ring or one lathed body?","status":"undetermined",
  "resolution":"Modelled as part of the lathed case body; visually identical from this view."},
 {"id":"crown-flute-count","question":"Total knurl flute count?","status":"uncertain",
  "resolution":"10 around the revolve; 6-7 visible on the near face."},
 {"id":"rose-short-points","question":"Do the intercardinal points continue behind the needle?","status":"occluded",
  "resolution":"Assumed yes, symmetric 8-point rose."}]
di=a["detailInventory"]
di["scanMethod"]="component-zones"
di["targetMinDetails"]=10
def det(i,kind,desc,scale,affects,mtype,ref,ev,conf,region):
    return {"id":i,"kind":kind,"description":desc,"scale":scale,"affects":affects,
            "mapsTo":{"type":mtype,"ref":ref},"evidenceRef":ev,"confidence":conf,
            "region":dict(region,units="normalized")}
Z=zones
dialz=Z+"/dial.png"; crownz=Z+"/crown.png"; bowz=Z+"/bow.png"; bezz=Z+"/bezel-left.png"
R=lambda x,y,w,h: {"x":x,"y":y,"width":w,"height":h}
di["details"]=[
 det("tick-ring-12","ridge",
   "12 rounded-cap capsule ticks on the dial plate at 30 deg spacing, centred at r/R=0.75 of the dial radius, long axis radial. Measured by connected-component clustering, NOT 16.",
   "meso","silhouette-and-identity","component","tick-ring-12",dialz,0.88,R(0.26,0.31,0.48,0.52)),
 det("rose-8-point","ridge",
   "8-point compass rose: 4 long cardinal points reaching r/R=0.72 of the dial radius and 4 shorter intercardinal points at ~0.45, raised off the dial plate with a soft contact shadow.",
   "macro","identity-defining","component","rose-8-point",dialz,0.9,R(0.26,0.31,0.48,0.52)),
 det("needle-red-both-halves","contour",
   "Lens-shaped needle, both halves red (no dark south half); principal axis measured at -77.6 deg image-space, i.e. close to vertical, overhanging the rose points at both ends.",
   "macro","identity-defining","component","needle",dialz,0.92,R(0.26,0.31,0.48,0.52)),
 det("pivot-boss","contour",
   "Gold hemispherical boss at the needle pivot, diameter ~0.19 of the dial diameter, sitting proud of the needle.",
   "meso","identity-defining","component","pivot-boss",dialz,0.9,R(0.4,0.45,0.2,0.2)),
 det("bezel-width","contour",
   "Bezel ring occupies 0.271 of the case radius (91 px of 335) - substantially thicker than a first glance suggests; dial/case diameter ratio 0.729.",
   "macro","silhouette","component","bezel-width",bezz,0.95,R(0.15,0.35,0.18,0.45)),
 det("bezel-fillet","bevel",
   "Every bezel edge is a large-radius round; the silhouette contains no hard corner anywhere. Torus-like outer rim with the highlight band running upper-left to lower-right.",
   "meso","silhouette","material","mat-gold",bezz,0.9,R(0.15,0.35,0.18,0.45)),
 det("dial-recess-wall","groove",
   "The dial plate is recessed below the bezel top face; a short inner wall is visible as a darker cream band along the lower-right inner edge (occlusion shading, not albedo).",
   "meso","depth-cue","component","dial-plate",dialz,0.8,R(0.26,0.31,0.48,0.52)),
 det("crown-knurl","ridge",
   "Knurled crown at ~1-2 o'clock on the case rim, axis radial; 6-7 vertical flutes visible on the near face, rounded cap, ~0.13 of case diameter.",
   "micro","identity-defining","component","crown",crownz,0.75,R(0.68,0.24,0.18,0.16)),
 det("bow-ring","contour",
   "Open torus suspension ring at 12 o'clock, outer diameter ~0.30 of case diameter, ring plane parallel to the dial plane, joined by a short stepped collar.",
   "macro","silhouette","component","bow-ring",bowz,0.9,R(0.5,0.05,0.3,0.26)),
 det("bow-collar-step","seam",
   "Short stepped cylindrical collar between case rim and bow ring, with a visible flange lip at its top.",
   "meso","identity-defining","component","bow-collar",bowz,0.85,R(0.5,0.05,0.3,0.26)),
 det("gold-gradient","gloss",
   "Gold body gradient, ordered stops upper-left to lower-right: (253,183,73) highlight -> (223,140,31) mid -> (196,116,27) terminator. Broad soft speculars, no environment reflection.",
   "macro","material-response","material","mat-gold",bezz,0.9,R(0.15,0.35,0.18,0.45)),
 det("navy-two-tone","gloss",
   "Rose facets alternate lit (79,97,120) and shadowed (48,65,88) navy - this is facet shading from a single albedo, not two materials. Modelling it as two albedos would be wrong.",
   "meso","material-response","material","mat-navy",dialz,0.85,R(0.26,0.31,0.48,0.52))]
qc=d["qualityContract"]
qc["definitionOfDone"]=[
 "Rendered model matches the reference silhouette: case circle, bezel at 0.271 of case radius, bow ring at 0.30 of case diameter, crown bump at 1-2 o'clock.",
 "Tick ring reads as exactly 12 capsules at 30 deg spacing.",
 "Rose reads as 8 points, 4 long + 4 short, raised off the dial.",
 "Needle is red across both halves, lens-shaped, overhanging the rose points.",
 "Gold reads as stylized dielectric (soft broad highlight), not mirrored metal.",
 "Needle, bezel, ring and crown are separate pivoted components (explodable and clickable)."]
json.dump(d,open(p,"w"),indent=2)
print("filled", p)
