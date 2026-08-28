import json, math, copy, sys
p=sys.argv[1]
d=json.load(open(p))
tmpl_c=copy.deepcopy(d["componentTree"][0])
tmpl_m=copy.deepcopy(d["materials"][0])
REF=d["sourceImage"]

# ---- measured constants, in units of case diameter D = 1.0 --------------------
D=1.0
CASE_R=0.5
CASE_T=0.22                 # thickness, uncertain +/-40%
DIAL_R=0.3645               # measured dial/case = 0.729
BEZEL_W=CASE_R-DIAL_R       # 0.1355
TICK_R=0.87*DIAL_R          # 0.317
TICK_L=0.048; TICK_W=0.027; TICK_H=0.013
ROSE_LONG=0.90*DIAL_R       # 0.328
ROSE_SHORT=0.66*DIAL_R      # 0.241
ROSE_ROT=74.0               # measured azimuth of the first long point, screen deg ccw from +X
NEEDLE_L=0.707; NEEDLE_W=0.133; NEEDLE_T=0.045
NEEDLE_ANG=47.4
BOSS_D=0.139
BOW_RING_D=0.30
CROWN_ANG=57.0
FACE_Y=CASE_T*0.5           # dial-plane height in local frame (+Y is the dial normal)


def prim_extent(primitive, desc):
    """Natural bounding extent of each primitive as the factory emits it, BEFORE dimensions
    are baked in. geometry.scale() multiplies these, so a desired size must be divided by
    them -- a capsule is 0.7 x 1.4 x 0.7, not a unit cube, and a torus is 0.9*(1+tube)."""
    if primitive == "capsule": return (0.7,1.4,0.7)
    if primitive == "torus":
        t=(desc or {}).get("torusTubeRatio",0.178)
        return (0.9*(1+t),0.9*(1+t),0.9*t)
    if primitive == "extrude":
        pr=(desc or {}).get("profile2D",{})
        pts=pr.get("points",[[-0.5,-0.5],[0.5,-0.5],[0.0,0.5]])
        w=max(pt[0] for pt in pts)-min(pt[0] for pt in pts)
        h=max(pt[1] for pt in pts)-min(pt[1] for pt in pts)
        return (w,h,pr.get("depth",1.0))
    if primitive == "lathe":
        pts=(desc or {}).get("latheProfile",{}).get("points",[[0.5,-0.5],[0.5,0.5]])
        w=2*max(abs(pt[0]) for pt in pts)
        h=max(pt[1] for pt in pts)-min(pt[1] for pt in pts)
        return (w,h,w)
    return (1.0,1.0,1.0)

def fit(primitive, desired, desc=None):
    """Dimensions that make `primitive` occupy exactly `desired` world size."""
    ex=prim_extent(primitive,desc)
    return tuple(d/e for d,e in zip(desired,ex))

def psi(alpha_deg):
    """local Z-rotation that aims a +Y-axis primitive at screen azimuth alpha (ccw from +X, y up)."""
    a=math.radians(alpha_deg)
    return math.atan2(-math.cos(a), -math.sin(a))

def world_dir(alpha_deg, r):
    """local XZ position at screen azimuth alpha, radius r."""
    ps=psi(alpha_deg)
    return [-math.sin(ps)*r, 0.0, math.cos(ps)*r]

def comp(cid, name, level, role, primitive, topo, topo_why, parent, dims, pos,
         rot=(0,0,0), material="mat-gold", importance=0.6, confidence=0.8,
         fidelity="blockout", desc_extra=None, attachment=None, pivot=None,
         local_features=None, evidence=None, edge=("fillet",0.02,3)):
    c=copy.deepcopy(tmpl_c)
    c["id"]=cid; c["name"]=name; c["level"]=level; c["role"]=role
    c["primitive"]=primitive; c["topologyClass"]=topo; c["topologyRationale"]=topo_why
    c["parent"]=parent; c["importance"]=importance; c["confidence"]=confidence
    c["fidelityTier"]=fidelity
    c["material"]=material; c["materialLayers"]=[material]
    fitted=fit(primitive,dims,desc_extra)
    c["dimensions"]={"width":round(fitted[0],6),"height":round(fitted[1],6),"depth":round(fitted[2],6),
                     "units":"scale factors on the emitted primitive; target world size "
                             f"{tuple(round(v,4) for v in dims)} in units of case diameter = 1.0",
                     "targetWorldSize":[round(v,5) for v in dims],
                     "confidence":confidence}
    # NO transform.scale: scale_triple() short-circuits on its presence and would discard
    # dimensions entirely, emitting geometry.scale(1,1,1) for every part.
    c["transform"]={"position":[round(v,5) for v in pos],
                    "rotation":[round(v,5) for v in rot]}
    gd=c["geometryDescriptor"]
    gd["edgeTreatment"]={"type":edge[0],"bevelRadius":edge[1],"segments":edge[2]}
    gd["topologyIntent"]="stylized icon form: large-radius rounds, no hard corners in silhouette"
    if desc_extra: gd.update(desc_extra)
    ap=c["actionProfile"]
    ap["animationRole"]=role
    if pivot: ap["pivot"].update(pivot)
    ap["collider"]={"type":"box","offset":[0,0,0],"scale":[1,1,1],"isTrigger":False,
                    "notes":"Icon-scale prop; a box proxy is sufficient for pick/click."}
    c["attachment"]=attachment
    c["localFeatures"]=local_features or []
    c["evidenceRefs"]=evidence or ["full-object"]
    c["details"]=[]
    import copy as _c
    c["colorMaterialRecipe"]=_c.deepcopy(RECIPES[material])
    return c


RECIPES={
 "mat-gold":{"dominantAlbedo":"rgba(223, 140, 31, 1)","secondaryAlbedo":"rgba(253, 183, 73, 1)",
   "materialClass":"plastic","materialClassConfidence":0.6,
   "classNote":"DEPICTS gold, but the measured RESPONSE is dielectric: broad soft speculars and zero "
               "environment reflection. Classified by response, not by what the object is meant to be.",
   "colorGradient":{"type":"linear","angleDeg":135,"stops":[
     {"position":0.0,"color":"rgba(253, 183, 73, 1)"},
     {"position":0.5,"color":"rgba(223, 140, 31, 1)"},
     {"position":1.0,"color":"rgba(196, 116, 27, 1)"}]}},
 "mat-dial":{"dominantAlbedo":"rgba(251, 220, 172, 1)","secondaryAlbedo":"rgba(239, 203, 153, 1)",
   "materialClass":"plastic","materialClassConfidence":0.8,
   "colorGradient":{"type":"radial","stops":[
     {"position":0.0,"color":"rgba(252, 224, 180, 1)"},
     {"position":1.0,"color":"rgba(239, 203, 153, 1)"}]}},
 "mat-navy":{"dominantAlbedo":"rgba(79, 97, 120, 1)","secondaryAlbedo":"rgba(48, 65, 88, 1)",
   "materialClass":"plastic","materialClassConfidence":0.75,
   "colorGradient":{"type":"linear","angleDeg":135,"stops":[
     {"position":0.0,"color":"rgba(79, 97, 120, 1)"},
     {"position":1.0,"color":"rgba(48, 65, 88, 1)"}]}},
 "mat-red":{"dominantAlbedo":"rgba(244, 78, 48, 1)","secondaryAlbedo":"rgba(197, 32, 14, 1)",
   "materialClass":"plastic","materialClassConfidence":0.8,
   "colorGradient":{"type":"linear","angleDeg":135,"stops":[
     {"position":0.0,"color":"rgba(244, 78, 48, 1)"},
     {"position":1.0,"color":"rgba(197, 32, 14, 1)"}]}},
}

comps=[]

# ---- case body: one lathed profile, bezel + wall + back plate ------------------
# profile points [radius, y]; y from -CASE_T/2 (back) to +CASE_T/2 (bezel top face)
# unit-space profile: radius <= 0.5, y in [-0.5, 0.5]. dimensions scale it to world size.
case_profile={"points":[
    [0.000,-0.500],[0.300,-0.500],[0.420,-0.440],[0.480,-0.300],[0.500,-0.050],
    [0.495,0.230],[0.470,0.380],[0.435,0.462],[0.405,0.500],[0.3645,0.470],
    [0.3645,0.180],[0.000,0.180]],
    "segments":96}
comps.append(comp("case-body","Compass case (lathed body: back plate, side wall, bezel)",
    "macro","body","lathe","continuous-sculpt",
    "One continuous lathed profile from back plate to bezel lip. The reference silhouette has no "
    "hard corner anywhere; splitting this into box/cylinder parts would introduce seams the "
    "reference does not have. A revolved profile also gives the large-radius rim round for free.",
    None,(1.0,CASE_T,1.0),(0,0,0),(math.pi/2,0,0),"mat-gold",1.0,0.85,"blockout",
    {"latheProfile":case_profile},None,{"mode":"center","localPosition":[0,0,0],"axis":[0,1,0],"confidence":0.9},
    [{"id":"bezel-round","description":"large-radius round on the outer rim, 0.1355 D wide measured","type":"fillet"},
     {"id":"dial-recess","description":"dial plate sits recessed 0.04 D below the bezel top face","type":"recess"},
     {"id":"bezel-width","description":"bezel ring is 0.271 of the case radius, measured, not eyeballed","type":"proportion"},
     {"id":"bezel-fillet","description":"every bezel edge is a large-radius round; no hard corner in the silhouette","type":"fillet"}],
    ["full-object","zone-bezel-left"]))

# ---- dial plate --------------------------------------------------------------
comps.append(comp("dial-plate","Dial plate (cream face)","meso","surface","cylinder",
    "assembled-solid","Flat disc recessed inside the case; a cylinder is exact for a lathed flat face.",
    "case-body",(DIAL_R*2,0.03,DIAL_R*2),(0,0,0),(0,0,0),"mat-dial",0.9,0.9,"blockout",
    None,{"parentSocket":"case-inner-floor","contactType":"socket","embedDepth":0.004,"gapTolerance":0.0,
          "localStart":[0,0.078,0],"localEnd":[0,0.108,0],"baseRadius":DIAL_R,"endRadius":DIAL_R},
    {"mode":"center","localPosition":[0,0,0],"axis":[0,1,0],"confidence":0.9},
    [{"id":"recess-wall-shading","description":"darker cream band along the lower-right inner edge is occlusion, not albedo","type":"shading-note"},
     {"id":"tick-ring-12","description":"12 navy capsule ticks at 30 deg spacing, r/R 0.87 of the dial radius","type":"marking-group"},
     {"id":"rose-8-point","description":"8-point rose: 4 long points to r/R 0.90, 4 short to r/R 0.66, raised off the plate","type":"marking-group"}],
    ["zone-dial"]))

DIAL_TOP=0.030  # dial top face, in dial-plate node space (origin at its bottom face)

# ---- 12 tick capsules --------------------------------------------------------
tick_ids=[]
for i in range(12):
    alpha=26.4+i*30.0
    inner=world_dir(alpha,TICK_R-TICK_L/2); inner[1]=DIAL_TOP+0.004
    outer=world_dir(alpha,TICK_R+TICK_L/2); outer[1]=DIAL_TOP+0.004
    tick_ids.append(f"tick-{i+1:02d}")
    comps.append(comp(tick_ids[-1],f"Tick capsule {i+1} ({alpha:.0f} deg)","micro","marking","capsule",
        "assembled-solid","Rounded-cap capsule lying in the dial plane, long axis radial.",
        "dial-plate",(TICK_W,TICK_L,TICK_H),(0,0,0),(0,0,0),"mat-navy",0.45,0.85,"blockout",
        None,{"parentSocket":"dial-face","contactType":"overlap","overlap":0.006,"gapTolerance":0.0,
              "localStart":[round(v,5) for v in inner],"localEnd":[round(v,5) for v in outer],
              "baseRadius":TICK_W/2,"endRadius":TICK_W/2},
        {"mode":"center","localPosition":[0,0,0],"axis":[0,1,0],"confidence":0.8},
        None,["zone-dial"]))

# ---- 8-point rose ------------------------------------------------------------
rose_ids=[]
for i in range(4):
    alpha=ROSE_ROT+i*90.0
    base=[0.0,DIAL_TOP+0.015,0.0]
    tip=world_dir(alpha,ROSE_LONG); tip[1]=DIAL_TOP+0.015
    pos=world_dir(alpha,ROSE_LONG/2); pos[1]=DIAL_TOP+0.030
    rid=f"rose-long-{i+1}"; rose_ids.append(rid)
    comps.append(comp(rid,f"Rose long point {i+1} ({alpha:.0f} deg)","meso","marking","extrude",
        "assembled-solid","Flat faceted star point: an extruded triangle lying in the dial plane. "
        "A cone would be a round spike; the reference points are flat plates with a visible top face.",
        "dial-plate",(0.130,ROSE_LONG,0.030),pos,(math.pi/2,0,psi(alpha)),"mat-navy",0.85,0.85,"blockout",
        {"profile2D":{"points":[[-0.5,-0.5],[0.5,-0.5],[0.0,0.5]],"depth":1.0}},
        {"parentSocket":"dial-face","contactType":"overlap","overlap":0.01,"gapTolerance":0.0,
         "localStart":[round(v,5) for v in base],"localEnd":[round(v,5) for v in tip],
         "baseRadius":0.085,"endRadius":0.004},
        {"mode":"base","localPosition":[0,-ROSE_LONG/2,0],"axis":[0,1,0],"confidence":0.8},
        None,["zone-dial"]))
for i in range(4):
    alpha=ROSE_ROT+45.0+i*90.0
    base=[0.0,DIAL_TOP+0.014,0.0]
    tip=world_dir(alpha,ROSE_SHORT); tip[1]=DIAL_TOP+0.014
    pos=world_dir(alpha,ROSE_SHORT/2); pos[1]=DIAL_TOP+0.029
    rid=f"rose-short-{i+1}"; rose_ids.append(rid)
    comps.append(comp(rid,f"Rose short point {i+1} ({alpha:.0f} deg)","meso","marking","extrude",
        "assembled-solid","Shorter intercardinal star point, same flat plate treatment.",
        "dial-plate",(0.118,ROSE_SHORT,0.028),pos,(math.pi/2,0,psi(alpha)),"mat-navy",0.7,0.8,"blockout",
        {"profile2D":{"points":[[-0.5,-0.5],[0.5,-0.5],[0.0,0.5]],"depth":1.0}},
        {"parentSocket":"dial-face","contactType":"overlap","overlap":0.01,"gapTolerance":0.0,
         "localStart":[round(v,5) for v in base],"localEnd":[round(v,5) for v in tip],
         "baseRadius":0.072,"endRadius":0.004},
        {"mode":"base","localPosition":[0,-ROSE_SHORT/2,0],"axis":[0,1,0],"confidence":0.75},
        None,["zone-dial"]))
comps.append(comp("rose-hub","Rose hub disc","micro","marking","cylinder","assembled-solid",
    "Small navy disc that visually fuses the eight point bases into one star.",
    "dial-plate",(0.16,0.022,0.16),(0,0,0),(0,0,0),"mat-navy",0.5,0.8,"blockout",None,
    {"parentSocket":"dial-face","contactType":"overlap","overlap":0.01,"gapTolerance":0.0,
     "localStart":[0,DIAL_TOP-0.002,0],"localEnd":[0,DIAL_TOP+0.020,0],
     "baseRadius":0.08,"endRadius":0.08},
    {"mode":"center","localPosition":[0,0,0],"axis":[0,1,0],"confidence":0.8},
    None,["zone-dial"]))

# ---- needle ------------------------------------------------------------------
needle_profile={"points":[[0.000,-0.500],[0.150,-0.300],[0.230,-0.060],[0.250,0.040],
                          [0.200,0.220],[0.100,0.380],[0.000,0.500]],"segments":10}
comps.append(comp("needle","Compass needle (red lens spindle)","macro","indicator","lathe",
    "continuous-sculpt",
    "A revolved spindle flattened on one axis: the needle is a continuous lens form that tapers to "
    "a point at both ends. Two back-to-back cones would put a hard crease at the waist that the "
    "reference does not have.",
    "dial-plate",(NEEDLE_W,NEEDLE_L,NEEDLE_T),(0,DIAL_TOP+0.055,0),(math.pi/2,0,psi(NEEDLE_ANG)),
    "mat-red",1.0,0.9,"blockout",{"latheProfile":needle_profile},
    {"parentSocket":"dial-pivot","contactType":"socket","embedDepth":0.01,"gapTolerance":0.0,
     "localStart":[0,DIAL_TOP+0.030,0],"localEnd":[0,DIAL_TOP+0.055,0]},
    {"mode":"center","localPosition":[0,0,0],"axis":[0,0,1],"confidence":0.9},
    [{"id":"both-halves-red","description":"both halves are red; the dark counterpart is the rose beneath, not a south needle","type":"albedo-note"}],
    ["zone-dial"]))
comps.append(comp("pivot-boss","Needle pivot boss","meso","hardware","sphere","assembled-solid",
    "Gold hemispherical cap sitting proud of the needle at the rotation axis.",
    "dial-plate",(BOSS_D,BOSS_D*0.8,BOSS_D),(0,DIAL_TOP+0.080,0),(0,0,0),"mat-gold",0.7,0.85,"blockout",None,
    {"parentSocket":"dial-pivot","contactType":"socket","embedDepth":0.02,"gapTolerance":0.0,
     "localStart":[0,DIAL_TOP+0.020,0],"localEnd":[0,DIAL_TOP+0.090,0]},
    {"mode":"center","localPosition":[0,0,0],"axis":[0,1,0],"confidence":0.85},
    None,["zone-dial"]))

# ---- suspension hardware -----------------------------------------------------
UP=world_dir(90.0,1.0)   # unit local direction that reads as screen-up
def up_at(r, y=0.0):
    return [UP[0]*r, y, UP[2]*r]
comps.append(comp("bow-collar","Bow collar (stepped stem)","meso","connector","lathe",
    "continuous-sculpt","Short stepped stem with a flange lip, lathed like the case.",
    "case-body",(0.115,0.075,0.115),up_at(0.50),(math.pi/2,0,psi(90.0)),"mat-gold",0.6,0.8,"blockout",
    {"latheProfile":{"points":[[0.000,-0.50],[0.250,-0.50],[0.230,-0.10],[0.250,0.10],
                               [0.220,0.34],[0.200,0.50],[0.000,0.50]],"segments":32}},
    {"parentSocket":"case-rim-top","contactType":"butt","embedDepth":0.02,"gapTolerance":0.0,
     "localStart":[0,-0.05,0],"localEnd":[0,0.05,0]},
    {"mode":"base","localPosition":[0,-0.05,0],"axis":[0,1,0],"confidence":0.8},
    None,["zone-bow"]))
comps.append(comp("bow-ring","Suspension ring","macro","handle","torus","assembled-solid",
    "Open ring; a torus is exact. Ring plane is parallel to the dial plane in the reference.",
    "bow-collar",(BOW_RING_D,BOW_RING_D,BOW_RING_D*0.30/1.30),(0,0.077,0),(0,0,0),"mat-gold",0.8,0.85,"blockout",
    {"torusTubeRatio":0.30},
    {"parentSocket":"collar-top","contactType":"socket","embedDepth":0.03,"gapTolerance":0.0,
     "localStart":[0,-0.037,0],"localEnd":[0,0.037,0]},
    {"mode":"base","localPosition":[0,-BOW_RING_D/2,0],"axis":[1,0,0],"confidence":0.85},
    None,["zone-bow"]))

# ---- crown -------------------------------------------------------------------
comps.append(comp("crown","Knurled crown","meso","hardware","lathe","continuous-sculpt",
    "Short knurled cylinder with a rounded cap; lathed profile carries the cap round.",
    "case-body",(0.17,0.115,0.17),world_dir(CROWN_ANG,0.50),(math.pi/2,0,psi(CROWN_ANG)),"mat-gold",0.55,0.75,"blockout",
    {"latheProfile":{"points":[[0.000,-0.50],[0.220,-0.50],[0.250,-0.30],[0.250,0.28],
                               [0.210,0.46],[0.000,0.50]],"segments":32}},
    {"parentSocket":"case-rim-upper-right","contactType":"butt","embedDepth":0.02,"gapTolerance":0.0,
     "localStart":[0,-0.045,0],"localEnd":[0,0.045,0]},
    {"mode":"base","localPosition":[0,-0.045,0],"axis":[0,1,0],"confidence":0.75},
    None,["zone-crown"]))
flute_ids=[]
for i in range(10):
    ang=i*36.0
    fid=f"crown-flute-{i+1:02d}"; flute_ids.append(fid)
    comps.append(comp(fid,f"Crown flute {i+1}","micro","marking","box","assembled-solid",
        "Knurl flute: a shallow raised rib on the crown barrel.",
        "crown",(0.015,0.070,0.015),
        [math.cos(math.radians(ang))*0.081,0.0,math.sin(math.radians(ang))*0.081],
        (0,-math.radians(ang),0),"mat-gold",0.25,0.6,"blockout",None,
        {"parentSocket":"crown-barrel","contactType":"overlap","overlap":0.004,"gapTolerance":0.0,
         "localStart":[0,-0.0275,0],"localEnd":[0,0.0275,0]},
        {"mode":"center","localPosition":[0,0,0],"axis":[0,1,0],"confidence":0.6},
        None,["zone-crown"]))

d["componentTree"]=comps

# ---- materials ---------------------------------------------------------------
def mat(mid,name,base,sec,rough,metal,notes,overrides=None):
    m=copy.deepcopy(tmpl_m)
    m["id"]=mid; m["name"]=name
    m["baseColor"]=base; m["color"]=base
    m["albedo"]={"dominant":base,"secondary":sec,
                 "samplingNotes":"Sampled from a full-resolution row scan of the reference (y=600), "
                                 "lit and shadowed values read separately so highlights are not baked into albedo."}
    m["colorVariation"]={"palette":[base]+sec,"pattern":"uniform","amplitude":0.03,"heightCorrelation":0.0}
    m["roughness"]={"base":rough,"variation":0.05,"map":"uniform",
                    "localResponse":"stylized icon surface: no cavity dirt, no edge wear"}
    m["metalness"]={"base":metal,"variation":0.0}
    m["textureless"]={"declared":True,"evidence":[
        "Full-resolution row scan (evidence/measure.py, y=600) shows each region as a smooth "
        "value ramp with no high-frequency component: no grain, print, pores or wear anywhere.",
        "The reference is a flat-shaded stylized icon render, not a photograph; its identity is "
        "silhouette, proportion and the boundaries between flat colour regions.",
        "zone-dial and zone-bezel-left crops inspected at 1:1 -- no texture detail present."]}
    for _f in ("normal","bump","displacement","surfaceFrequencyBands","textureProjection",
               "textureResolution","referencePbr"):
        m.pop(_f,None)
    m["wear"]={"edgeWear":0.0,"scratches":[],"chips":[]}
    m["dirt"]={"amount":0.0,"cavityBias":0.0,"color":"#000000"}
    m["ambientOcclusion"]={"cavityStrength":0.35,"contactShadowBias":0.4,
                           "notes":"The reference's only dark values are contact shadow under the rose and needle."}
    m["localOverrides"]=overrides or []
    m["shaderNotes"]=[notes,
        "Textureless by observation: the reference is a flat-shaded stylized render with no map of any kind.",
        "Do not add procedural noise to chase 'realism' -- it would move the render AWAY from the reference."]
    return m

d["materials"]=[
 mat("mat-gold","Stylized gold body","#F7B248",["#FFD07A","#DE9026"],0.33,0.03,
     "Reads as a DIELECTRIC, not metal. Measured highlight (253,183,73), mid (223,140,31), "
     "terminator (196,116,27). Zero environment reflection in the reference, so metalness 1.0 would "
     "produce a mirrored look the reference does not have. metalness 0.15 keeps a faint metallic "
     "warmth without an environment.",
     [{"id":"bezel-highlight-band","description":"broad soft highlight band running upper-left to lower-right on the bezel",
       "channel":"roughness","value":0.32,"evidenceRef":"zone-bezel-left"}]),
 mat("mat-dial","Dial plate cream","#FFF1D4",["#FFF6E2","#F7DFB6"],0.85,0.0,
     "Matte cream dielectric, measured (251,220,172). Receives the rose and needle contact shadows."),
 mat("mat-navy","Rose and tick navy","#4F6178",["#304154","#0C131C"],0.75,0.0,
     "Single navy albedo. The two-tone look on the rose is FACET SHADING from one albedo -- "
     "authoring two albedos here would be a misread of the reference.",
     [{"id":"facet-shading","description":"lit facet (79,97,120) vs shadowed facet (48,65,88) comes from geometry, not albedo",
       "channel":"note","value":0.0,"evidenceRef":"zone-dial"}]),
 mat("mat-red","Needle red","#F04E30",["#F44E2F","#C5200E"],0.72,0.0,
     "Matte red-orange dielectric, measured lit (244,78,48) and shadowed (197,32,14)."),
]

# ---- repetition systems (documented; members are authored individually) -------
d["repetitionSystems"]=[
 {"id":"tick-ring","name":"12-capsule tick ring","level":"micro","parent":"dial-plate",
  "count":12,"primitive":"capsule","material":"mat-navy","instanceScale":[TICK_L,TICK_W,TICK_H],
  "placement":{"mode":"radial","axis":[0,1,0],"radius":TICK_R*2,"startAngleDeg":26.4},
  "elementComponentIds":tick_ids,
  "notes":"Measured by connected-component clustering: 12 at ~30 deg, r/R 0.87 of the dial radius. "
          "NOT 16 -- a 16-tick ring reads visibly wrong against this reference."},
 {"id":"rose-points","name":"8-point compass rose (4 long + 4 short)","level":"meso","parent":"dial-plate",
  "count":8,"primitive":"cone","material":"mat-navy","instanceScale":[0.075,ROSE_LONG,0.030],
  "placement":{"mode":"radial","axis":[0,1,0],"radius":ROSE_LONG,"startAngleDeg":ROSE_ROT},
  "elementComponentIds":rose_ids,
  "notes":"Two alternating lengths, so authored as eight components rather than one instanced set."},
 {"id":"crown-knurl","name":"Crown knurl flutes","level":"micro","parent":"crown",
  "count":10,"primitive":"box","material":"mat-gold","instanceScale":[0.012,0.055,0.012],
  "placement":{"mode":"radial","axis":[0,1,0],"radius":0.124,"startAngleDeg":0},
  "elementComponentIds":flute_ids,
  "notes":"6-7 flutes visible on the near face; 10 around the full revolve is the inferred total."},
]

# ---- frame, silhouette, feature targets --------------------------------------
d["coordinateFrame"]={"up":"+Y","forward":"+Z","handedness":"right",
 "units":"case diameter = 1.0",
 "notes":"Authored with the dial axis along local +Y so lathe and cylinder primitives are natural; "
         "the root carries rotation.x = +pi/2 so the dial faces world +Z at the review camera."}
d["silhouette"]={"dominantShapes":["circle (case)","small circle (bow ring)","bump (crown)"],
 "aspectRatio":{"widthToHeight":round(671/823,3),"note":"including the bow; case alone is circular"},
 "negativeSpaces":["open centre of the bow ring","gap between bow ring and case rim"],
 "keyProportions":{"dialToCaseDiameter":0.729,"bezelWidthToCaseRadius":0.271,
                   "bowRingToCaseDiameter":0.30,"needleLengthToCaseDiameter":0.707,
                   "tickRadiusToDialRadius":0.87}}
d["featureReviewTargets"]=[
 {"id":"overall-silhouette","name":"Case circle, bezel width, bow ring, crown bump","tier":"critical",
  "passIds":["blockout"],"minimumScore":0.8,"mustPass":True,
  "componentRefs":["case-body","bezel-ring","bow-ring","crown"],"evidenceRefs":["full-object"]},
 {"id":"tick-count-12","name":"Tick ring reads as exactly 12 capsules","tier":"critical",
  "passIds":["structural-pass","form-refinement"],"minimumScore":0.8,"mustPass":True,
  "componentRefs":tick_ids,"evidenceRefs":["zone-dial"]},
 {"id":"rose-8-point","name":"Rose reads as 8 points, 4 long + 4 short, raised off the dial","tier":"critical",
  "passIds":["structural-pass","form-refinement"],"minimumScore":0.8,"mustPass":True,
  "componentRefs":rose_ids,"evidenceRefs":["zone-dial"]},
 {"id":"needle-form","name":"Red lens needle at 47 deg, both halves red, overhanging the rose","tier":"critical",
  "passIds":["structural-pass","form-refinement"],"minimumScore":0.8,"mustPass":True,
  "componentRefs":["needle","pivot-boss"],"evidenceRefs":["zone-dial"]},
 {"id":"gold-is-dielectric","name":"Gold reads as stylized dielectric, not mirrored metal","tier":"critical",
  "passIds":["material-pass","surface-pass"],"minimumScore":0.75,"mustPass":True,
  "componentRefs":["case-body","bow-ring","crown","pivot-boss"],"evidenceRefs":["zone-bezel-left"]},
 {"id":"bow-assembly","name":"Stepped collar plus ring proportions at 12 o'clock","tier":"important",
  "passIds":["structural-pass"],"minimumScore":0.7,"mustPass":False,
  "componentRefs":["bow-collar","bow-ring"],"evidenceRefs":["zone-bow"]},
 {"id":"crown-knurl","name":"Knurled crown at 1-2 o'clock","tier":"important",
  "passIds":["form-refinement"],"minimumScore":0.7,"mustPass":False,
  "componentRefs":["crown"]+flute_ids,"evidenceRefs":["zone-crown"]},
]
all_ids=[c["id"] for c in comps]
for bp in d.get("buildPasses",[]):
    bp["componentRefs"]=all_ids
d["performanceBudget"].update({"targetTriangles":140000,"maxDrawCalls":40,"textureSize":0,
    "fpsTarget":60,"qualityPriority":"reference-fidelity",
    "optimizationPolicy":"Real-time browser prop. Textureless, so the budget is geometry only."})
d["assumptions"]=[
 "Case thickness 0.22 of diameter, read from the foreshortened right-side wall band (+/-40%).",
 "Back plate is flat with the same rim round; it is not visible in the single reference.",
 "Bezel is modelled as part of the lathed case body; whether the real object has a separate "
 "rotating ring is undetermined from one view.",
 "Crown flute count 10 around the revolve; only 6-7 are visible.",
 "The reference is a stylized icon render, so lighting is authored to match its single "
 "upper-left key rather than a physical environment.",
]
d["lightingFromPhoto"]=[
 "key light: directional, azimuth 135 deg, elevation 40 deg, intensity 2.6, colour #FFF6E8 -- "
 "matches the upper-left key that puts the highlight band on the bezel's upper-left rim",
 "fill light: directional, azimuth -40 deg, elevation 10 deg, intensity 0.55, colour #DCE6FF -- "
 "lifts the lower-right terminator to the measured (196,116,27) rather than to black",
 "rim light: directional, azimuth 200 deg, elevation 25 deg, intensity 0.4, colour #FFFFFF",
 "ambient: hemisphere, intensity 0.55, colour #FFFFFF -- the reference has no black anywhere",
 "environment: none. The reference shows zero environment reflection, so an HDRI would add "
 "specular structure the reference does not have",
 "contact shadow: soft shadow of the rose and needle onto the dial plate, plus ambient occlusion "
 "in the dial recess -- these are the only dark values on the face",
 "exposure and tone mapping: ACES filmic off; use linear-to-sRGB with exposure 1.0. Filmic tone "
 "mapping desaturates the reference's saturated gold and red, which is a measurable regression",
]
d["viewEvidence"]=[
 {"id":"full-object","path":REF,"viewpoint":"front-three-quarter","confidence":1.0,
  "notes":"Admitted reference, foreground coverage 0.364, single connected component."},
 {"id":"zone-dial","path":"/home/user/cozywolf-landing/experiments/img2threejs-compass/evidence/zones/dial.png","viewpoint":"front-three-quarter","confidence":0.95,
  "imageRegion":{"x":0.26,"y":0.31,"width":0.48,"height":0.52}},
 {"id":"zone-crown","path":"/home/user/cozywolf-landing/experiments/img2threejs-compass/evidence/zones/crown.png","viewpoint":"front-three-quarter","confidence":0.75,
  "imageRegion":{"x":0.68,"y":0.24,"width":0.18,"height":0.16}},
 {"id":"zone-bow","path":"/home/user/cozywolf-landing/experiments/img2threejs-compass/evidence/zones/bow.png","viewpoint":"front-three-quarter","confidence":0.9,
  "imageRegion":{"x":0.50,"y":0.05,"width":0.30,"height":0.26}},
 {"id":"zone-bezel-left","path":"/home/user/cozywolf-landing/experiments/img2threejs-compass/evidence/zones/bezel-left.png","viewpoint":"front-three-quarter","confidence":0.9,
  "imageRegion":{"x":0.15,"y":0.35,"width":0.18,"height":0.45}},
]
d["suitability"]="pass"
d["scores"]={"object_isolation":3,"silhouette_readability":3,"depth_inference":2,
 "primitive_decomposition":3,"material_procedurality":3,"occlusion_risk":1,
 "interaction_fit":3}
json.dump(d,open(p,"w"),indent=2)
print("components:",len(comps),"materials:",len(d["materials"]))
