import sys, math
sys.path.insert(0,"/tmp/claude-0/-home-user-cozywolf-landing/5ddc3f91-9acd-5de9-8b41-c7236bf60128/scratchpad/img2threejs/forge/stage1_intake")
from pathlib import Path
from build_detail_inventory import read_png
W,H,px=read_png(Path(sys.argv[1]))
def P(x,y): return px[y*W+x]
DC=(502.5,580.5); R=244.5; CASE_D=671.0
red=[];navy=[]
for y in range(H):
    for x in range(W):
        r,g,b,a=P(x,y)
        if a<128: continue
        if r-g>120 and b<110: red.append((x,y))
        elif b>50 and r<110 and g<125 and b-r>20: navy.append((x,y))
def rad(q): return math.hypot(q[0]-DC[0],q[1]-DC[1])
print("red px",len(red))
xs=[q[0] for q in red];ys=[q[1] for q in red]
print("red bbox",min(xs),min(ys),max(xs),max(ys))
# tips = extreme pair
p1=max(red,key=rad)
p2=max(red,key=lambda q:(q[0]-p1[0])**2+(q[1]-p1[1])**2)
L=math.hypot(p2[0]-p1[0],p2[1]-p1[1])
ang=math.degrees(math.atan2(-(p2[1]-p1[1]),p2[0]-p1[0]))%180
ux=(p2[0]-p1[0])/L; uy=(p2[1]-p1[1])/L
hw=max(abs(-(q[0]-p1[0])*uy+(q[1]-p1[1])*ux) for q in red)
print("needle tips",p1,p2)
print("needle length %.1f px = %.3f of case D ; axis %.1f deg ; width/length %.3f"%(L,L/CASE_D,ang,2*hw/L))
print("tip radii from dial centre: %.3f R and %.3f R"%(rad(p1)/R,rad(p2)/R))
# split navy into rose (r<0.62R) vs ticks
rose=[q for q in navy if rad(q)<0.62*R]; ticks=[q for q in navy if rad(q)>=0.62*R]
print("rose px",len(rose),"max r %.3f R"%(max(rad(q) for q in rose)/R))
print("tick band px",len(ticks),"r range %.3f-%.3f R"%(min(rad(q) for q in ticks)/R,max(rad(q) for q in ticks)/R))
# cluster ticks
ptset=set(ticks); seen=set(); cl=[]
for p in ticks:
    if p in seen: continue
    st=[p]; seen.add(p); comp=[]
    while st:
        q=st.pop(); comp.append(q)
        for dx in(-2,-1,0,1,2):
            for dy in(-2,-1,0,1,2):
                n=(q[0]+dx,q[1]+dy)
                if n in ptset and n not in seen: seen.add(n); st.append(n)
    cl.append(comp)
cl=[c for c in cl if len(c)>=80]
print("tick clusters",len(cl))
for c in sorted(cl,key=lambda c: math.degrees(math.atan2(-(sum(q[1] for q in c)/len(c)-DC[1]),sum(q[0] for q in c)/len(c)-DC[0]))%360):
    cx=sum(q[0] for q in c)/len(c); cy=sum(q[1] for q in c)/len(c)
    a=math.degrees(math.atan2(-(cy-DC[1]),cx-DC[0]))%360
    xs=[q[0] for q in c]; ys=[q[1] for q in c]
    print("  ang %6.1f  r/R %.3f  px %4d  bbox %dx%d"%(a,math.hypot(cx-DC[0],cy-DC[1])/R,len(c),max(xs)-min(xs),max(ys)-min(ys)))
