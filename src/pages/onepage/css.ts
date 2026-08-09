// Globales CSS des Rework-One-Pagers (Keyframes, Media-Queries, Basisregeln).
// 1:1 aus dem abgenommenen Entwurf "Website Rework E4" uebernommen; die
// @font-face-Bloecke fehlen bewusst, die liegen schon in src/index.css.
// Wird von OnePage.tsx als <style> gerendert und gilt nur auf dieser Seite
// (Multipage-Site: Unterseiten sind eigene Full-Page-Loads).
export const ONEPAGE_CSS = `
html{background:#0A0814;color-scheme:dark}
body{margin:0;background:#0A0814;font-family:'Nunito',system-ui,sans-serif;color:#e2e8f0;-webkit-font-smoothing:antialiased}
a{color:#FA4BA3;text-decoration:none}a:hover{color:#FFC7E4}
@keyframes cwClaim{0%{transform:scale(.2);opacity:0}6%{transform:scale(1.12);opacity:1}11%{transform:scale(1)}82%{opacity:1;transform:scale(1)}93%{opacity:.1;transform:scale(.8)}100%{opacity:0;transform:scale(.2)}}
@keyframes cwCount{from{width:100%}to{width:0%}}
@keyframes cwPulseSoft{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
details[open] summary span:last-child{transform:rotate(45deg)}
summary span:last-child{transition:transform .25s cubic-bezier(.22,1,.36,1)}
@keyframes cwPop{0%{transform:scale(.35);opacity:.2}55%{transform:scale(1.16)}100%{transform:scale(1);opacity:1}}
@keyframes cwLand{0%{transform:scale(.3);filter:brightness(1.9)}55%{transform:scale(1.14)}72%{transform:scale(.97)}100%{transform:scale(1);filter:brightness(1)}}
@keyframes cwShock{0%{transform:scale(.55);opacity:.95}100%{transform:scale(2.1);opacity:0}}
@keyframes cwSpark{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--sx),var(--sy)) scale(0);opacity:0}}
@keyframes cwDrop{0%{transform:translateY(-160%) scale(1.5);opacity:0}60%{transform:translateY(8%) scale(.9);opacity:1}80%{transform:translateY(0) scale(1.06)}100%{transform:none;opacity:1}}
@keyframes cwDuck{0%,100%{transform:scale(1)}45%{transform:scale(.88)}}
@keyframes cwSteal{0%{transform:scale(1.22);filter:brightness(2.3)}55%{transform:scale(.96)}100%{transform:scale(1);filter:brightness(1)}}
@keyframes cwShard{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--shx),var(--shy)) rotate(var(--shr));opacity:0}}
@keyframes cwYank{0%{transform:scale(1) translateY(0) rotate(0);opacity:1}100%{transform:scale(.35) translateY(-85%) rotate(-28deg);opacity:0}}
@keyframes cwSlam{0%{transform:scale(2.3);opacity:0}60%{transform:scale(.9);opacity:1}100%{transform:none;opacity:1}}
@keyframes cwBurst{0%{transform:scale(.5);opacity:.95}100%{transform:scale(2.4);opacity:0}}
@keyframes cwIce{0%{transform:scale(1.7);opacity:0}60%{transform:scale(.95);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes cwDust{0%{transform:scale(.55);opacity:0}40%{opacity:1}100%{transform:scale(1.3);opacity:0}}
@keyframes cwShimmer{0%{background-position:190% 0}100%{background-position:-70% 0}}
@keyframes cwShake{0%{transform:translate(0,0)}20%{transform:translate(-3px,2px)}45%{transform:translate(3px,-2px)}70%{transform:translate(-2px,-1px)}100%{transform:none}}
@keyframes cwWave{0%{opacity:0;transform:scale(.7)}35%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(1.15)}}
@keyframes cwBridgeFlash{0%{opacity:.35}40%{opacity:1;filter:brightness(1.6)}100%{opacity:1;filter:brightness(1)}}
@keyframes cwGridGlow{0%,100%{box-shadow:0 0 0 1px var(--tc),0 0 46px var(--tc)}50%{box-shadow:0 0 0 1px var(--tc),0 0 84px var(--tc)}}
@keyframes cwGrow{0%{opacity:0;transform:translateX(-26px) scale(.955)}45%{opacity:1}100%{opacity:1;transform:none}}
@keyframes cwSwapIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes cwRailIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:none}}
@keyframes cwMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes cwWordA{0%{transform:translateY(102%) rotate(2deg);opacity:0}100%{transform:none;opacity:1}}
@keyframes cwWordB{0%{transform:translateY(102%) rotate(2deg);opacity:0}100%{transform:none;opacity:1}}
@keyframes cwNudge{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
@keyframes cwLetter{0%{transform:translateY(108%) rotate(6deg);opacity:0}100%{transform:none;opacity:1}}
@keyframes cwLetterB{0%{transform:translateY(108%) rotate(6deg);opacity:0}100%{transform:none;opacity:1}}
@keyframes cwFaq{0%{transform:translateY(-6px);opacity:0}100%{transform:none;opacity:1}}
@keyframes cwRise{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
@keyframes cwSheen{0%{transform:translateX(-120%)}60%,100%{transform:translateX(220%)}}
@keyframes cwCardA{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
@keyframes cwCardB{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
@keyframes cwBeamOn{0%{opacity:0}5%{opacity:.9}11%{opacity:.28}18%{opacity:.96}27%{opacity:.5}38%{opacity:1}58%{opacity:.74}78%{opacity:.3}100%{opacity:0}}
@keyframes cwPuddle{0%,100%{-webkit-mask-size:49% 33%;mask-size:49% 33%}50%{-webkit-mask-size:53% 36%;mask-size:53% 36%}}
summary::-webkit-details-marker{display:none}
summary{list-style:none;cursor:pointer}
html{scroll-behavior:smooth;scroll-padding-top:88px}
a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible{outline:2.5px solid #FFC7E4;outline-offset:3px;border-radius:8px}
[data-m=sticky]{display:none}
.cwHovA:hover{filter:brightness(1.06)}
.cwFaqCard:hover{background:rgba(250,75,163,.06)!important;border-color:rgba(250,75,163,.34)!important}
.cwSubmit:hover{filter:brightness(1.1)}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}html{scroll-behavior:auto}}
@media (min-width:1500px){
[data-shell]{max-width:1320px!important}
[data-m=hero]{padding-top:96px!important;padding-bottom:96px!important}
[data-m=two2]{grid-template-columns:1fr 660px!important;gap:56px!important}
[data-m=joh]{grid-template-columns:340px 1fr!important;gap:64px!important}
}
@media (max-width:1180px){
[data-m=hero]{grid-template-columns:1fr 440px!important;gap:36px!important}
[data-m=two2]{gap:40px!important}
[data-m=beamer]{width:100%!important}
[data-m=cats]{grid-template-columns:repeat(3,1fr)!important}
}
@media (max-width:1080px){
[data-m=modetext]{flex:0 1 290px!important;min-width:250px!important;max-width:330px!important}
}
@media (max-width:820px){
[data-m=modes]{grid-template-columns:1fr!important;min-height:0!important}
}
@media (max-width:1024px){
[data-m=beamer]{height:auto!important;min-height:320px!important}
[data-m=hpill]{margin:10px auto 0!important;align-self:center!important}
[data-m=hero]{grid-template-columns:1fr!important;gap:30px!important}
[data-m=stage]{align-items:stretch!important}
[data-m=hphone]{position:static!important;margin:14px auto 0!important}
[data-m=two2]{grid-template-columns:1fr 320px!important}
[data-m=bento]{grid-template-columns:repeat(2,1fr)!important;grid-auto-rows:auto!important}
[data-m=bento]>div{grid-column:span 1!important;grid-row:auto!important}
[data-m=cats]{grid-template-columns:repeat(2,1fr)!important}
}
@media (max-width:900px){
[data-m=screenbox]{position:static!important;width:100%!important;height:auto!important;margin-top:14px!important;border-radius:18px!important;box-shadow:none!important;border:1px solid rgba(255,255,255,.08)!important}
}
@media (max-width:860px){
section>div,header>div,footer>div{padding-left:16px!important;padding-right:16px!important}
section>div{padding-top:52px!important;padding-bottom:52px!important}
h1{font-size:34px!important;line-height:1.06!important}
h2{font-size:25px!important}
[data-m=nav]{display:none!important}
header a[href="#anfragen"]{display:none!important}
[data-m=hero]{grid-template-columns:1fr!important;gap:28px!important;padding-top:36px!important;padding-bottom:44px!important}
[data-m=stage]{align-items:stretch!important}
[data-m=hide-s]{display:none!important}
[data-m=beamer]{width:100%!important;height:auto!important;min-height:296px!important}
[data-m=hphone]{position:static!important;margin:14px auto 0!important}
[data-m=rounds]{flex-wrap:wrap!important}
[data-m=rounds]>div{flex:1 1 calc(50% - 7px)!important;min-width:calc(50% - 7px)!important}
[data-m=two],[data-m=two2],[data-m=joh]{grid-template-columns:1fr!important;gap:20px!important}
[data-m=three]{grid-template-columns:1fr!important;gap:20px!important}
[data-m=two]>div{padding:18px!important;min-width:0!important}
[data-m=pphone]{width:100%!important;max-width:340px!important;margin:0 auto!important;height:auto!important;min-height:560px!important}
[data-m=cats]{grid-template-columns:repeat(2,1fr)!important}
[data-m=bento]{grid-template-columns:1fr!important;grid-auto-rows:auto!important}
[data-m=bento]>div{grid-column:auto!important;grid-row:auto!important;padding:22px!important}
[data-m=kin]{font-size:29px!important;padding:32px 0!important}
[data-m=ctarow],[data-m=pricerow]{flex-direction:column!important}
[data-m=foot]{flex-wrap:wrap!important;justify-content:center!important;text-align:center!important;padding-bottom:92px!important}
[data-m=foot] a{margin-left:0!important}
[data-m=sticky]{display:flex!important}
}
@media (max-width:860px){
[data-m=two2]>*,[data-m=joh]>*,[data-m=two]>*,[data-m=three]>*{min-width:0!important}
[data-m=root]{overflow-x:clip!important}
[data-float]{transform:none!important;transition:none!important}
[data-m=hero]{box-sizing:border-box!important;padding-left:16px!important;padding-right:16px!important}
[data-m=probe]{flex-direction:column!important;align-items:stretch!important;gap:22px!important}
[data-m=probe]>div:first-child{flex-direction:row!important;flex-wrap:wrap!important;justify-content:center!important;gap:8px!important}
}
@media (max-width:1180px){
[data-m=herosub]{white-space:normal!important}
}
@media (max-width:860px){
[data-m=anlasscta]{padding:10px 0!important}
[data-m=foot] a,footer a{padding:8px 4px!important}
button{min-height:44px!important}
footer a,[data-m=foot] a{display:inline-block!important;padding:8px 4px!important}
}
@media (max-width:480px){
[data-m=cats]{grid-template-columns:1fr!important}
[data-m=rounds]>div{flex:1 1 100%!important;min-width:100%!important}
}
`;
