import sys, math, json
sys.path.insert(0, "/tmp/claude-0/-home-user-cozywolf-landing/5ddc3f91-9acd-5de9-8b41-c7236bf60128/scratchpad/img2threejs/forge/stage1_intake")
from pathlib import Path
from build_detail_inventory import read_png
W,H,px = read_png(Path(sys.argv[1]))
def at(x,y): return px[y*W+x]
# 1. alpha silhouette bbox
xs=[];ys=[]
for y in range(H):
    row=y*W
    for x in range(W):
        if px[row+x][3]>128: xs.append(x); ys.append(y)
print("silhouette bbox", min(xs),min(ys),max(xs),max(ys), "w",max(xs)-min(xs),"h",max(ys)-min(ys))
# 2. classify pixels
def cls(p):
    r,g,b,a=p
    if a<128: return None
    if r>190 and g>170 and b>130 and abs(r-g)<60 and b>110 and not(r>200 and g>140 and b<110): return "cream"
    if r>150 and g>90 and b<110: return "gold"
    if r>150 and g<90 and b<80: return "red"
    if b>60 and r<100 and g<110: return "navy"
    return "other"
counts={}
navy=[];cream=[];gold=[];red=[]
for y in range(H):
    row=y*W
    for x in range(W):
        c=cls(px[row+x])
        if c is None: continue
        counts[c]=counts.get(c,0)+1
        if c=="navy": navy.append((x,y))
        elif c=="cream": cream.append((x,y))
        elif c=="gold": gold.append((x,y))
        elif c=="red": red.append((x,y))
print("counts",counts)
def centroid(pts): return (sum(p[0] for p in pts)/len(pts), sum(p[1] for p in pts)/len(pts))
ccx,ccy=centroid(cream)
print("dial(cream) centroid %.1f %.1f  px=%d  equiv-radius %.1f"%(ccx,ccy,len(cream),math.sqrt(len(cream)/math.pi)))
# dial extent along horizontal through centroid
row=[p[0] for p in cream if abs(p[1]-ccy)<2]
col=[p[1] for p in cream if abs(p[0]-ccx)<2]
print("dial h-extent",min(row),max(row),"w",max(row)-min(row)," v-extent",min(col),max(col),"h",max(col)-min(col))
# 3. tick clustering: navy pixels far from center
r_out = (max(row)-min(row))/2
pts=[p for p in navy if math.hypot(p[0]-ccx,p[1]-ccy) > 0.62*r_out]
seen=set(); clusters=[]
ptset=set(pts)
for p in pts:
    if p in seen: continue
    stack=[p]; comp=[]
    seen.add(p)
    while stack:
        q=stack.pop(); comp.append(q)
        for dx in range(-2,3):
            for dy in range(-2,3):
                n=(q[0]+dx,q[1]+dy)
                if n in ptset and n not in seen:
                    seen.add(n); stack.append(n)
    if len(comp)>=60: clusters.append(comp)
print("tick clusters:",len(clusters))
angs=[]
for c in clusters:
    cx,cy=centroid(c)
    a=(math.degrees(math.atan2(-(cy-ccy), cx-ccx)))%360
    angs.append((round(a,1),len(c),round(math.hypot(cx-ccx,cy-ccy)/r_out,3)))
for a in sorted(angs): print("  tick ang=%6.1f px=%4d r/R=%.3f"%a)
# 4. needle axis (red)
rcx,rcy=centroid(red)
sxx=sum((p[0]-rcx)**2 for p in red); syy=sum((p[1]-rcy)**2 for p in red); sxy=sum((p[0]-rcx)*(p[1]-rcy) for p in red)
theta=0.5*math.atan2(2*sxy, sxx-syy)
print("red centroid %.1f %.1f  principal-axis-deg(image) %.1f  px=%d"%(rcx,rcy,math.degrees(theta),len(red)))
