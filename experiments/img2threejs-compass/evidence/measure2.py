import sys, math
sys.path.insert(0,"/tmp/claude-0/-home-user-cozywolf-landing/5ddc3f91-9acd-5de9-8b41-c7236bf60128/scratchpad/img2threejs/forge/stage1_intake")
from pathlib import Path
from build_detail_inventory import read_png
W,H,px=read_png(Path(sys.argv[1]))
cream=[];opaque=[]
for y in range(H):
    row=y*W
    for x in range(W):
        r,g,b,a=px[row+x]
        if a<128: continue
        opaque.append((x,y))
        if b>140 and r>210 and g>190 and (r-b)<90: cream.append((x,y))
def ext(pts,axis,other,val,tol=2):
    v=[p[axis] for p in pts if abs(p[other]-val)<tol]
    return (min(v),max(v)) if v else None
cx=sum(p[0] for p in cream)/len(cream); cy=sum(p[1] for p in cream)/len(cream)
print("cream px",len(cream),"centroid %.1f %.1f"%(cx,cy))
h=ext(cream,0,1,cy); v=ext(cream,1,0,cx)
print("dial horiz",h,"width",h[1]-h[0]," vert",v,"height",v[1]-v[0])
# case: opaque pixels, exclude bow/crown by scanning rows below y=300
case=[p for p in opaque if p[1]>300]
ccx=sum(p[0] for p in case)/len(case); ccy=sum(p[1] for p in case)/len(case)
ch=ext(case,0,1,cy); cv=ext(case,1,0,cx)
print("case horiz",ch,"width",ch[1]-ch[0]," vert",cv,"height",cv[1]-cv[0])
print("bezel width L=%d R=%d T=%d B=%d"%(h[0]-ch[0], ch[1]-h[1], v[0]-cv[0], cv[1]-v[1]))
print("dial/case width ratio %.3f  height ratio %.3f"%((h[1]-h[0])/(ch[1]-ch[0]),(v[1]-v[0])/(cv[1]-cv[0])))
print("case aspect h/w %.3f -> tilt approx %.1f deg"%((cv[1]-cv[0])/(ch[1]-ch[0]), math.degrees(math.acos(min(1,(cv[1]-cv[0])/(ch[1]-ch[0]))))))
