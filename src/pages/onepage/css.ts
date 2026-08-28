// Globales CSS des Rework-One-Pagers (Keyframes, Media-Queries, Basisregeln).
// 1:1 aus dem abgenommenen Entwurf "Website Rework E4" uebernommen; die
// @font-face-Bloecke fehlen bewusst, die liegen schon in src/index.css.
// Wird von OnePage.tsx als <style> gerendert und gilt nur auf dieser Seite
// (Multipage-Site: Unterseiten sind eigene Full-Page-Loads).
export const ONEPAGE_CSS = `
html{background:#0A0814;color-scheme:dark}
body{margin:0;background:#0A0814;font-family:'Bricolage Grotesque','Nunito',system-ui,sans-serif;font-optical-sizing:auto;color:#F6EFE6;-webkit-font-smoothing:antialiased}
/* Verweise ohne eigene Farbe: Creme. Wolf am 27.08. zum Orange: "es beisst
   sich mit dem logo". Ohne Farbe braucht ein Verweis im FLIESSTEXT eine andere
   Marke, sonst ist er nicht als Verweis zu erkennen, also eine Unterlinie.
   Aber nur dort: die erste Fassung hat sie global gesetzt, danach waren auch
   die Navigation, die Knoepfe und der Sprungverweis unterstrichen. Deshalb
   traegt die Linie jetzt ein eigenes Merkmal statt des Elementnamens. */
a{color:#F6EFE6;text-decoration:none}
/* Die zwei Wege in 07: der nicht gewaehlte hellt beim Zeigen auf und rueckt
   ein Stueck ein. Ohne das sah er aus wie ausgegraut, also wie "geht nicht"
   statt "waehl mich" -- Wolf am 28.08.: "ich finde es geht etwas unter, dass
   man waehlen kann links?". Die Deckkraft steht inline, deshalb !important. */
[data-wahl]:not([data-an]):hover{opacity:.9!important}
[data-wahl]:not([data-an]):hover>span:first-child{transform:translateX(6px)!important}
a[data-verweis]{text-decoration:underline;text-decoration-color:rgba(246,239,230,.4);text-underline-offset:3px;text-decoration-thickness:1px}
a[data-verweis]:hover{text-decoration-color:#F6EFE6}
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
@keyframes cwSwapIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes cwRailIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:none}}
@keyframes cwMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes cwWordA{0%{transform:translateY(102%) rotate(2deg);opacity:0}100%{transform:none;opacity:1}}
@keyframes cwWordB{0%{transform:translateY(102%) rotate(2deg);opacity:0}100%{transform:none;opacity:1}}
@keyframes cwNudge{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
/* Der Wortwechsel in der Ueberschrift, als Walze.
   Vorher stiegen die Buchstaben des NEUEN Wortes von unten herein, das alte
   verschwand im selben Moment ohne Bewegung, weil React es einfach ersetzte.
   Deshalb wirkte der Wechsel billig: es fehlte nicht die Eleganz, es fehlte
   die Haelfte. Jetzt laeuft das alte Wort nach oben hinaus, waehrend das
   neue von unten nachrueckt, Buchstabe fuer Buchstabe, wie ein Zaehlwerk.
   Ausserdem raus: die Drehung um 6 Grad je Buchstabe. Bei einer 142 px
   grossen Schrift kippt damit jeder Buchstabe einzeln, das liest sich
   unruhig. Und cwLetterB war zeichengleich zu cwLetter, der Wechsel
   zwischen beiden hat nie etwas bewirkt. */
@keyframes cwWortEin{from{transform:translateY(112%);opacity:0}60%{opacity:1}to{transform:none;opacity:1}}
/* Das ausgehende Wort haelt seine Deckkraft bis 62 Prozent der Walze. In
   diesem Fenster stehen kurz zwei Woerter gleich deutlich uebereinander, was
   Wolf am 27.08. auf einem Bildschirmfoto festgehalten hat. Es blendet jetzt
   frueher ab: ab einem Drittel wird es leichter, die Bewegung bleibt gleich. */
@keyframes cwWortAus{from{transform:none;opacity:1}34%{opacity:.7}68%{opacity:.28}to{transform:translateY(-112%);opacity:0}}
.cwWortEin{display:inline-block;animation:cwWortEin .62s cubic-bezier(.22,1,.36,1) both}
.cwWortAus{display:inline-block;animation:cwWortAus .62s cubic-bezier(.22,1,.36,1) both}
@media (prefers-reduced-motion:reduce){
  .cwWortEin,.cwWortAus{animation:none}
  .cwWortAus{display:none}
}
@keyframes cwRise{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
@keyframes cwSheen{0%{transform:translateX(-120%)}60%,100%{transform:translateX(220%)}}
@keyframes cwWeiter{from{width:0}to{width:100%}}
/* Die Welle ueber den Fugen in 04.
   Bewegt wird die MASKE, nicht die Flaeche. Der erste Anlauf verschob eine
   zweite Kopie des Musters -- dann wandern auch deren Fugen, laufen aus dem
   Takt mit den stehenden, und man sieht doppelte Linien nebeneinander. Genau
   das hat Wolf am 28.08. gesehen. So bleibt die Zeichnung stehen und nur das
   Fenster darauf laeuft, es leuchten also immer die Fugen auf, die schon da
   sind. */
@keyframes cwFugenWelle{
  from{mask-position:-90% 0%;-webkit-mask-position:-90% 0%}
  to{mask-position:190% 0%;-webkit-mask-position:190% 0%}
}
@media (prefers-reduced-motion:reduce){[data-welle]{animation:none!important;opacity:0!important}}
/* Die Punktzahl in 01: steigt auf, haelt kurz, loest sich auf. Kein Sprung am
   Anfang -- sie faengt schon leicht angehoben an, sonst zuckt sie erst nach
   unten, bevor sie steigt. */
@keyframes cwPunkt{
  0%{opacity:0;transform:translateY(6px) scale(.9)}
  18%{opacity:1;transform:translateY(0) scale(1)}
  62%{opacity:1;transform:translateY(-10px) scale(1)}
  100%{opacity:0;transform:translateY(-26px) scale(.96)}
}
/* Das Schweben der acht Fraktionswappen in 01. Klein gehalten: hoechstens
   5 px, sonst stossen zwei Wappen aneinander -- zwischen ihren Plaetzen liegen
   nach der Rechnung mindestens 31 px, und beim Zeigen kommen 10 Prozent
   Vergroesserung dazu. Zwei Kurven, damit die acht nicht im Gleichschritt
   gehen. */
@keyframes cwSchweb0{0%,100%{transform:translate(0,0)}50%{transform:translate(0,-5px)}}
@keyframes cwSchweb1{0%,100%{transform:translate(0,0)}50%{transform:translate(4px,5px)}}
@media (prefers-reduced-motion:reduce){[data-schwebt]{animation:none!important}}
@keyframes cwCardA{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
@keyframes cwCardB{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
/* Das Aufwaermen der Lampe. Wolf am 2026-08-27: "so blendet es und sieht
   nicht nice aus". Die Spitzen lagen bei .9 bis 1 auf fast weissem Grund,
   also volle Leinwandflaeche in Weiss, mehrfach. Jetzt bleibt der hoechste
   Wert bei .34 und der Ton ist warm statt weiss: man sieht die Lampe
   ankommen, ohne geblendet zu werden. */
@keyframes cwBeamOn{0%{opacity:0}6%{opacity:.3}13%{opacity:.1}20%{opacity:.34}30%{opacity:.16}40%{opacity:.3}62%{opacity:.2}82%{opacity:.08}100%{opacity:0}}
@keyframes cwPuddle{0%,100%{-webkit-mask-size:49% 33%;mask-size:49% 33%}50%{-webkit-mask-size:53% 36%;mask-size:53% 36%}}
/* Hero-Ueberschrift loest sich beim Verlassen im Grund auf (superplay.co).
   Kein Ausblenden: die Schrift waechst und nimmt die Grundfarbe an. */
@keyframes cwAufloesen{to{transform:scale(1.85);color:#0A0814;letter-spacing:-.05em}}
/* Die Objekte der Marke treiben dabei leicht auseinander, wie Sticker, die
   von der Folie rutschen. Sie bleiben sichtbar, sie weichen nur aus. */
@keyframes cwTreiben{to{transform:translate3d(var(--tx,0),var(--ty,0),0) rotate(var(--tr,0deg)) scale(.86)}}
/* Auftritt der Objektgruppe: fallen von oben ein, gestaffelt. */
@keyframes cwKachelEin{from{opacity:0;transform:translate3d(0,-38px,0) rotate(var(--r,0deg)) scale(.82)}to{opacity:1;transform:translate3d(0,0,0) rotate(var(--r,0deg)) scale(1)}}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion:no-preference){
    [data-aufloesen]{animation-name:cwAufloesen;animation-duration:auto;animation-timing-function:linear;animation-fill-mode:both;animation-timeline:view();animation-range:exit 0% exit 92%}
    [data-treiben]{animation-name:cwTreiben;animation-duration:auto;animation-timing-function:linear;animation-fill-mode:both;animation-timeline:view();animation-range:exit 0% exit 100%}
  }
}
@media (prefers-reduced-motion:no-preference){
  .cwKachel{animation:cwKachelEin .62s cubic-bezier(.22,1,.36,1) backwards var(--d,0s)}
  .cwKachel--beat{animation-duration:.7s;animation-timing-function:cubic-bezier(.34,1.56,.64,1)}
}
.cwKachel{transform:rotate(var(--r,0deg)) scale(var(--s,1));transition:transform .55s cubic-bezier(.22,1,.36,1),filter .55s cubic-bezier(.22,1,.36,1),box-shadow .55s cubic-bezier(.22,1,.36,1)}
@media (hover:hover) and (pointer:fine){
  .cwKachel:hover{transform:rotate(calc(var(--r,0deg) * .4)) translateY(-10px) scale(1.14);z-index:9}
}
:root{--cw-grundton:10,8,20}
[data-cw-grund]{position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(ellipse 120% 80% at 50% 0%,rgba(var(--cw-grundton),.14),rgba(var(--cw-grundton),.05) 45%,rgba(10,8,20,0) 78%);
  transition:background 1.1s cubic-bezier(.4,0,.2,1)}
@media (prefers-reduced-motion:reduce){[data-cw-grund]{transition:none}}
/* 2026-08-27 entfernt: die gebogene Kante zwischen den Abschnitten und der
   Folienwechsel im Handy. Beides war aus nodeck geborgt und beides hat Wolf
   abgelehnt: „die halbkreise in den sections sind so semi" und „das
   durchwechseln 1-5 wirkt so nicht so gut weil es auf dem handy hoch und
   runter schiebt, das checkt man nicht so". Der Farbschleier je Abschnitt
   ([data-cw-grund] oben) bleibt, den hat er nicht bemaengelt. */
/* Die Wechselzeile der Ueberschrift darf nach rechts ueber ihre Spalte
   hinaus, damit das laengste Wort nicht beschnitten wird. Nur ab 1200 px,
   darunter ist die Spalte breit genug und der Platz daneben fehlt. */
@media (min-width:1200px){[data-wortzeile]{width:calc(100% + 190px)}}
summary::-webkit-details-marker{display:none}
summary{list-style:none;cursor:pointer}
html{scroll-behavior:smooth;scroll-padding-top:88px}
a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #F6EFE6;outline-offset:3px;border-radius:8px}
:focus:not(:focus-visible){outline:none}
[data-m=sticky]{display:none}
.cwHovA:hover{filter:brightness(1.06)}
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
/* Station 01 in der Fassung „Leinwand": Name, Text, Objekt nebeneinander.
   Unter 1080 px wird die Namensspalte schmaler, unter 900 px stapeln die drei
   uebereinander, sonst bliebe fuer den Text weniger als 30 Zeichen. Das Objekt
   (Brett, Rangfolge) darf dann die volle Breite nehmen. */
@media (max-width:1080px){
[data-m=modereihe]{grid-template-columns:220px 1fr 300px!important;gap:32px!important}
/* Die Fahne der drei linken Wappen zeigt nach rechts, in die Luecke zwischen
   Namens- und Textspalte. Bei 290 px Spalte plus 48 px Luecke passen Name UND
   Spruch (gemessen rund 196 px). Bei 220 plus 32 passen sie nicht mehr, der
   Spruch liefe in den Fliesstext. Also steht links dann nur der Name -- die
   fuenf rechts haben weiter Platz fuer beides. */
[data-frakfeld=links] [data-frakspruch]{display:none}
}
/* Die Objekte der Anlaesse: dieselbe Bewegung wie im Hero, Heben beim
   Zeigen, sonst Ruhe. Die Ruhedrehung steht in der Klasse und nicht inline,
   sonst schlaegt sie jede Hover-Regel (das war der Fehler bei den
   Hero-Kacheln am 27.08.).
   Diese Regeln standen bis zum 27.08. abends versehentlich INNERHALB von
   @media (max-width:900px) und galten damit nur auf schmalen Fenstern. Am
   Rechner tat das Zeigen also nichts, was Wolf zurecht aufgefallen ist.
   Gemessen: transform war bei 1440 px "none". */
.cwAnlassObj{transform:rotate(var(--r,0deg));transition:transform .34s cubic-bezier(.22,1,.36,1),filter .34s cubic-bezier(.22,1,.36,1)}
@media (hover:hover) and (pointer:fine){
  /* Die Gruppe faechert auf, nicht das einzelne Objekt. Vorher zuckte immer
     nur das eine unter dem Zeiger, und die drei gehoeren zusammen. */
  .cwAnlassGruppe:hover .cwAnlassObj{
    transform:rotate(calc(var(--r,0deg) * .35)) translate(var(--dx,0),var(--dy,-6px)) scale(1.07);
    filter:drop-shadow(0 16px 22px rgba(0,0,0,.6))
  }
}
/* ── Kein Einrasten mehr ──────────────────────────────────────────────────
   Wolf am 28.08.: "das einrasten nervt, aber wir hatten ja eh davon
   gesprochen, dass das die referenzseiten nicht machen ... manche sektionen
   wirken durch das einrasten eh super leer".

   Beides stimmt und haengt zusammen. Keine der vier Referenzen benutzt
   scroll-snap; ihre Ordnung kommt aus wiederkehrenden Abstaenden. Und die
   Leere kam nicht vom Einrasten selbst, sondern von der Bedingung dafuer:
   jeder Halt musste mindestens einen Bildschirm hoch sein, damit er
   einrasten kann. Ein Anlass braucht davon 0,30, der Rest war Luft ohne
   Grund.

   Also faellt beides: scroll-snap-type und die erzwungene Bildschirmhoehe.
   Die Abstaende macht jetzt allein die Dichtewelle aus K3, 96 bis 148 px
   oben und 72 bis 108 unten, je nachdem wie dicht ein Kapitel ist. Genau
   das Verfahren, das Custo mit 110 px und Apple mit 100 bis 120 px
   benutzen.

   Der Spruch am Ende behaelt seine Bildschirmhoehe: er ist kein Halt unter
   vielen, sondern der Schlusspunkt, und seine Mitte haengt daran. */
[data-spruch]{display:flex;flex-direction:column;justify-content:center}

/* ── Der Takt: jeder Halt ungefaehr eine Browserseite ─────────────────────
   Wolf am 28.08.: "pass die sektionen noch etwas an die groessen einer
   browserseite 100% ohne vollbild".

   Nicht wieder 100 svh mit Einrasten, das war zu viel und hat leer gewirkt.
   Stattdessen ein Mindestmass je Art von Halt, unter dem Fenster und mit
   zentriertem Inhalt. Gemessen bei 1440x780 waren die Halte vorher 445, 563,
   335, 335, 349, 720, 590, 432, 712, 670 und 780 px, also von 43 bis 100
   Prozent Fensterhoehe. Das ist kein Takt, sondern Zufall.

   Die Werte kommen aus dem Inhalt und nicht aus einer runden Zahl: die
   Anlaesse tragen am wenigsten und bekommen am wenigsten, die Spielarten und
   der Ablauf tragen am meisten. In svh, damit es auf jedem Fenster gilt. */
@media (min-width:901px){
  [data-m=modereihe]{min-height:82svh;align-content:center}
  #anlaesse [data-m=modereihe]{min-height:68svh}
  #ablauf[data-halt],#johannes[data-halt]{display:flex;flex-direction:column;justify-content:center}
  #ablauf[data-halt]{min-height:86svh}
  #johannes[data-halt]{min-height:78svh}
}

/* ── Auftritt der Abschnitte, T2 und T3 ───────────────────────────────────
   Gebaut mit animation-timeline: view(), also ohne JavaScript: der
   Fortschritt kommt daraus, wie weit der Halt im Fenster steht.

   Gestaffelt wird NICHT ueber animation-delay, das greift auf einer
   Scroll-Zeitleiste nicht. Stattdessen bekommt jede Spalte einen eigenen
   animation-range: die erste ist frueher fertig als die letzte, und genau
   das ergibt das Nacheinander.

   Kurven und Dauern aus dem Bericht zu dylanbrouwer.com, der als einziger
   der vier Referenzen genau wird: Eingang cubic-bezier(.32,.72,0,1),
   bewegt werden nur transform und opacity, nie Breite oder Hoehe.

   @supports, weil Firefox die Zeitleiste bis heute nicht kennt. Dort greift
   nichts und der Inhalt steht einfach da. Das ist der richtige Rueckfall. */
@keyframes cwEinfahren{from{transform:translateY(34px);opacity:0}to{transform:none;opacity:1}}
/* Der Spruch am Ende waechst, waehrend sein Halt durchs Fenster faehrt. */
@keyframes cwHinaus{from{transform:none;opacity:1}to{transform:translateY(-16px);opacity:.45}}
@keyframes cwSpruchWaechst{from{transform:scale(.32);opacity:.35}to{transform:scale(1);opacity:1}}
@supports (animation-timeline: view()){
  @media (min-width:901px) and (prefers-reduced-motion:no-preference){
    [data-bew] [data-m=modereihe]>*,
    [data-bew] [data-halt]>[data-shell]>*{
      animation:cwEinfahren linear both;animation-timeline:view();
    }
    /* Der Bereich endet spaetestens am Ende des Eintritts, also in dem Moment,
       in dem der Halt vollstaendig im Fenster steht. Ein spaeteres Ende
       (cover 30 Prozent) sah in der Messung so aus: Spalte bei Deckkraft
       null, obwohl sie schon zur Haelfte im Bild stand. Sichtbarkeit geht
       vor Choreografie. */
    [data-bew] [data-m=modereihe]>*{animation-range:entry 0% entry 70%}
    [data-bew] [data-m=modereihe]>*:nth-child(2){animation-range:entry 8% entry 82%}
    [data-bew] [data-m=modereihe]>*:nth-child(3){animation-range:entry 16% entry 94%}
    [data-bew] [data-halt]>[data-shell]>*{animation-range:entry 0% entry 80%}
    /* Die Ueberschriften und Textbloecke selbst, damit der Effekt auch beim
       Zurueckscrollen wieder laeuft. Vorher hing er an einem
       IntersectionObserver, der nach dem ersten Mal abmeldete -- einmal je
       Seitenaufruf, danach nie wieder. Jetzt haengt er an der Scrollposition
       und laeuft in beide Richtungen.
       Die Staffelung kommt aus der Geschwisterfolge: das zweite Element faengt
       spaeter an als das erste, das dritte noch spaeter. Alles ab dem vierten
       teilt sich einen Bereich, sonst wuerde der Aufbau am Ende zaeh. */
    [data-bew] [data-reveal]{
      animation:cwEinfahren linear both;animation-timeline:view();
      animation-range:entry 0% entry 62%;
    }
    [data-bew] [data-reveal]:nth-child(2){animation-range:entry 6% entry 70%}
    [data-bew] [data-reveal]:nth-child(3){animation-range:entry 12% entry 78%}
    [data-bew] [data-reveal]:nth-child(n+4){animation-range:entry 18% entry 86%}
    /* Wolf am 28.08.: "manchmal koennte es noch ein bisschen mehr sein zb
       beim rausscrollen". Also ein zweiter, sehr viel leiserer Lauf beim
       Verlassen nach oben: der Halt sinkt ein wenig und nimmt Deckkraft ab,
       aber nur bis 0,45 und 16 px. Mehr waere eine Seite, die einem den
       gelesenen Inhalt wegnimmt, waehrend man noch hinsieht. */
    [data-bew] [data-halt]:not([data-spruch]){
      animation:cwHinaus linear both;animation-timeline:view();
      animation-range:exit 20% exit 100%;
    }
  }
  /* Wolf am 28.08.: "der effekt von stay cozy.stay curious also die motion ist
     fast nicht mehr erkennbar beim scrollen?"

     Stimmt, und es war mein Fehler von heute Morgen. view() nimmt als Subjekt
     das Element SELBST, und der Spruch ist nur rund 118 px hoch. Der ganze
     Bereich "entry" sind damit 118 px Scrollweg. Gemessen sprang die Groesse
     zwischen scrollY 8184 und 8334 von 0,32 auf 1, also praktisch in einem
     Bild. Auch mit "cover 52%" blieb das Fenster kurz, weil der Spruch
     ohnehin erst 300 px vor dem Seitenende ueberhaupt auftaucht.

     Also nicht der Spruch ist das Subjekt, sondern sein Abschnitt: der ist
     828 px hoch und faengt entsprechend frueher an einzulaufen. Dafuer traegt
     der Abschnitt einen benannten Zeitgeber, den der Spruch benutzt.

     Der Bereich ist danach noch einmal verschoben worden. Mit "entry 0% bis
     cover 50%" lief das Wachstum ueber 851 px Scrollweg -- aber die ersten
     500 davon liegt der Spruch noch unter der Kante, man sah also nur die
     letzten zwanzig Prozent. Gemessen: bei scrollY 8290 war er zum ersten Mal
     im Bild und stand schon bei 0,8.
     Jetzt beginnt der Bereich dort, wo der Spruch nach dem Layout die Kante
     kreuzt (cover 23%), und endet am Seitenende (cover 53%). Das ganze
     Wachstum von 0,32 auf 1 liegt damit im sichtbaren Bereich, und ganz unten
     steht er in voller Groesse. */
  [data-spruch]{view-timeline-name:--cwSpruch;view-timeline-axis:block}
  @media (prefers-reduced-motion:no-preference){
    [data-kinetic]{
      animation:cwSpruchWaechst linear both;animation-timeline:--cwSpruch;
      animation-range:cover 23% cover 53%;transform-origin:center center;
    }
  }
}

@media (max-width:900px){
[data-m=modereihe]{grid-template-columns:1fr!important;gap:28px!important;padding:36px 0!important}
[data-m=modeobjekt]{justify-content:flex-start!important;height:400px!important}
/* Gestapelt stehen die drei Objekte kleiner und links, nicht rechts aussen.
   Vorher fiel hier die grosse Ziffer weg, die sie ersetzt haben: die war
   Schmuck ohne Angabe. Die Objekte sagen dagegen etwas ueber den Anlass,
   also bleiben sie auch auf dem Handy. */
[data-m=anlassnr]{max-width:190px!important;margin:0!important}
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
@media (max-width:1024px){
[data-m=probe]{flex-direction:column!important;align-items:stretch!important;gap:26px!important}
[data-m=probe]>div:first-child{flex-direction:row!important;flex-wrap:wrap!important;justify-content:center!important;gap:8px!important}
[data-m=pphone]{width:100%!important;max-width:360px!important;margin:0 auto!important;height:auto!important;min-height:600px!important}
}
/* Kopfzeile zwischen 861 und 1000 px. Gemessen bei 880 px: der Knopf
   „Termin anfragen" stand 47 px ausserhalb des Fensters, weil Navigation und
   Knopf erst ab 860 px verschwinden. Erst enger setzen, dann die Navigation
   weglassen, den Knopf so lange wie moeglich behalten. */
@media (max-width:1000px){
header [data-shell]{gap:20px!important}
[data-m=nav]{gap:18px!important;font-size:14px!important}
}
@media (max-width:940px){
[data-m=nav]{display:none!important}
}
@media (max-width:860px){
[data-m=hgruppe]{display:none!important}
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
[data-m=kin]{font-size:clamp(30px,13vw,56px)!important}
[data-m=faqgrid]{grid-template-columns:1fr!important;gap:26px!important}
[data-m=formraum]{grid-template-columns:1fr!important;gap:30px!important}
[data-m=ablaufraum]{grid-template-columns:1fr!important;gap:26px!important}
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
