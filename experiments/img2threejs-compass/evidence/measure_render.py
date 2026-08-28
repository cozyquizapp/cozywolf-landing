import sys, math
from collections import deque
sys.path.insert(0,"/tmp/claude-0/-home-user-cozywolf-landing/5ddc3f91-9acd-5de9-8b41-c7236bf60128/scratchpad/img2threejs/forge/stage1_intake")
from pathlib import Path
from build_detail_inventory import read_png
W,H,px=read_png(Path(sys.argv[1]))
white=sys.argv[2]=="white" if len(sys.argv)>2 else False
def P(x,y): return px[y*W+x]
def opaque(p):
    r,g,b,a=p
    if white: return a>128 and not (r>245 and g>245 and b>245)
    return a>128
# object bbox
rows={}
for y in range(H):
    r=[x for x in range(W) if opaque(P(x,y))]
    if r: rows[y]=(min(r),max(r))
ys=sorted(rows)
widest=max(ys,key=lambda y:rows[y][1]-rows[y][0])
caseW=rows[widest][1]-rows[widest][0]
print("object bbox y %d..%d  widest row y=%d width=%d"%(ys[0],ys[-1],widest,caseW))
cx=(rows[widest][0]+rows[widest][1])/2
cols={}
for x in range(W):
    c=[y for y in range(H) if opaque(P(x,y))]
    if c: cols[x]=(min(c),max(c))
# case vertical extent measured on the centre column, ignoring the bow (take the lower blob)
col=cols[int(cx)]
print("centre column span", col, "height", col[1]-col[0])
# dial: flood fill the light interior from the case centre
cy=widest
def is_dial(p):
    r,g,b,a=p
    return a>128 and r>150 and g>120 and b>80 and (r-b)<130 and g>b
seed=None
for dx in range(0,200):
    for sx in (int(cx)-dx,int(cx)+dx):
        if is_dial(P(sx,cy)) : seed=(sx,cy); break
    if seed: break
if seed:
    seen={seed}; q=deque([seed]); comp=[]
    while q:
        x,y=q.popleft(); comp.append((x,y))
        for ddx,ddy in ((1,0),(-1,0),(0,1),(0,-1)):
            n=(x+ddx,y+ddy)
            if 0<=n[0]<W and 0<=n[1]<H and n not in seen and is_dial(P(*n)):
                seen.add(n); q.append(n)
    xs=[p[0] for p in comp]; yy=[p[1] for p in comp]
    dw=max(xs)-min(xs); dh=max(yy)-min(yy)
    print("dial bbox w=%d h=%d  dial/case=%.3f  bezel/caseRadius=%.3f"%(dw,dh,dw/caseW,(caseW-dw)/caseW))
