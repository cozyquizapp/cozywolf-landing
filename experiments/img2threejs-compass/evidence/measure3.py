import sys, math
from collections import deque
sys.path.insert(0,"/tmp/claude-0/-home-user-cozywolf-landing/5ddc3f91-9acd-5de9-8b41-c7236bf60128/scratchpad/img2threejs/forge/stage1_intake")
from pathlib import Path
from build_detail_inventory import read_png
W,H,px=read_png(Path(sys.argv[1]))
def P(x,y): return px[y*W+x]
def is_cream(p): r,g,b,a=p; return a>128 and g>190 and b>120 and r>230
def is_face(p):
    # anything inside the dial: cream, navy, red, gold boss
    return p[3]>128
# flood fill cream from a seed on the dial (pick a cream point near 300,600)
seed=None
for x in range(280,360):
    if is_cream(P(x,600)): seed=(x,600); break
seen={seed}; q=deque([seed]); comp=[]
while q:
    x,y=q.popleft(); comp.append((x,y))
    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
        n=(x+dx,y+dy)
        if 0<=n[0]<W and 0<=n[1]<H and n not in seen and is_cream(P(*n)):
            seen.add(n); q.append(n)
xs=[p[0] for p in comp]; ys=[p[1] for p in comp]
print("dial cream component px",len(comp),"bbox",min(xs),min(ys),max(xs),max(ys),"w",max(xs)-min(xs),"h",max(ys)-min(ys))
cx=(min(xs)+max(xs))/2; cy=(min(ys)+max(ys))/2
print("dial center %.1f %.1f"%(cx,cy))
# case bbox from alpha, rows below the bow (y>320) and excluding crown column
op=[(x,y) for y in range(320,H) for x in range(W) if P(x,y)[3]>128]
oxs=[p[0] for p in op]; oys=[p[1] for p in op]
print("case+crown bbox",min(oxs),min(oys),max(oxs),max(oys))
# case only: for each row, find run widths; crown is a bump on the right upper
rowspan={}
for y in range(320,H):
    r=[x for x in range(W) if P(x,y)[3]>128]
    if r: rowspan[y]=(min(r),max(r))
ys_sorted=sorted(rowspan)
widest=max(ys_sorted,key=lambda y: rowspan[y][1]-rowspan[y][0])
print("widest row y=%d span=%s width=%d"%(widest,rowspan[widest],rowspan[widest][1]-rowspan[widest][0]))
colspan={}
for x in range(W):
    c=[y for y in range(320,H) if P(x,y)[3]>128]
    if c: colspan[x]=(min(c),max(c))
tallest=max(colspan,key=lambda x: colspan[x][1]-colspan[x][0])
print("tallest col x=%d span=%s height=%d"%(tallest,colspan[tallest],colspan[tallest][1]-colspan[tallest][0]))
cw=rowspan[widest][1]-rowspan[widest][0]; chh=colspan[tallest][1]-colspan[tallest][0]
dw=max(xs)-min(xs); dh=max(ys)-min(ys)
print("case w=%d h=%d aspect=%.3f"%(cw,chh,chh/cw))
print("dial w=%d h=%d aspect=%.3f"%(dw,dh,dh/dw))
print("dial/case w=%.3f h=%.3f"%(dw/cw,dh/chh))
print("bezel ring width (case_w-dial_w)/2 = %.1f px = %.3f of case radius"%((cw-dw)/2,(cw-dw)/cw))
