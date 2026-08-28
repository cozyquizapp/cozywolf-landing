# Offene Punkte

Was hier steht, ist von Wolf gemeldet und noch nicht erledigt. Reihenfolge
ist die Reihenfolge der Meldung, nicht die der Dringlichkeit.

## Offen, zur Entscheidung

### Mitte September: "Termine ab Mitte September" wird falsch

Faelliger Termin, nicht von Wolf gemeldet, sondern beim Bauen aufgefallen
und von ihm am 28.08. als Aufgabe bestaetigt.

Die Zeile steht an vier Stellen auf der Seite, zweisprachig, jeweils im
Kopf und im Formular:

    Ab 350 EUR - Termine ab Mitte September
    Termine ab Mitte September.

Sobald Mitte September vorbei ist, wirbt die Seite mit einem Datum in der
Vergangenheit. Das ist genau die Sorte Angabe, an der schon das alte
Vorschaubild gestorben ist.

Zu tun ist wenig: alle acht Fundstellen ziehen aus einer einzigen
Konstante, TERMIN_AB in src/pages/onepage/texts.ts, Zeile 10. Also eine
Zeile aendern, in beiden Sprachen, und neu bauen.

Was dort dann stehen soll, ist eine Entscheidung von Wolf, nicht von mir.
Drei Moeglichkeiten, je nach Lage:
 * Ein neues Datum, wenn die ersten Termine spaeter liegen.
 * Die Zeile ganz raus, wenn ohnehin laufend Termine frei sind. Dann faellt
   die Wartungsaufgabe weg.
 * Etwas Zeitloses wie "Termine nach Absprache", falls die Verfuegbarkeit
   schwankt.

Meine Empfehlung: sobald der erste Abend gelaufen ist, ganz raus. Ein
Startdatum ist ein Argument, solange es in der Zukunft liegt, und danach
nur noch eine Stelle, an der die Seite altert.

### DNS: Vercel empfiehlt neue Adressen

Gemeldet am 28.08. mit einem Bildschirmfoto der Vercel-Domainliste:
"DNS Change Recommended" bei cozywolf.de und www.cozywolf.de.

Es ist eine Empfehlung, kein Fehler. Vercel vergroessert seinen
Adressbereich und schreibt selbst, dass die alten Eintraege weiter
funktionieren. Nachgeschaut, Stand 28.08.: beide Namen zeigen auf
76.76.21.21, also auf die alte Vercel-Adresse. Die Seite ist erreichbar,
nichts ist kaputt.

Zu tun, wenn Zeit ist: beim Domain-Anbieter (nicht bei Vercel) den
A-Record fuer @ von 76.76.21.21 auf 216.198.79.1 aendern. Fuer www den
Wert nehmen, der in der zweiten Karte der Vercel-Liste steht; auf dem
Bildschirmfoto war sie abgeschnitten, also nicht raten.

Danach cozywolf.de und www.cozywolf.de aufrufen und pruefen, dass Vercel
"Valid Configuration" zeigt. Nicht kurz vor einem Termin machen, an dem
jemand den Link bekommt: die Aenderung braucht Minuten bis Stunden.

Prioritaet: die niedrigste von allem, was offen ist.

### Bilder tragen keinen Fingerabdruck im Namen

Aufgefallen am 28.08. an den Wappen: Wolf sah auf dem Handy einen anderen
Wappensatz als auf dem Desktop, obwohl beide Fassungen dieselben Dateien
laden. Ursache war nicht der Code, sondern der Zwischenspeicher. Die
Wappen sind dreimal unter demselben Dateinamen ersetzt worden (Commits
224d4bb, c09c1f3, a887504), und vercel.json gab Bildern unter /assets eine
Woche Haltbarkeit ohne Rueckfrage. Wer die alten Bytes einmal geholt
hatte, behielt sie.

Betrifft nicht nur die Wappen: og-cover.png wurde sechsmal ersetzt,
obj-puzzle dreimal, dazu ein Dutzend weiterer. Das ist auch die zweite
Haelfte der Geschichte "vorschaubild ist veraltet".

Sofortmassnahme ist drin: Bilder unter /assets stehen jetzt auf
max-age=0, must-revalidate. Damit fragt der Browser jedes Mal nach und
bekommt bei unveraenderten Dateien ein 304. Gemessen: die Handy-Seite
laedt 38 Bilder mit zusammen 119 KB, die Rueckfragen dafuer liegen im
Bereich weniger Kilobyte.

Der saubere Weg waere, die Bilder wie JS und CSS mit einem Fingerabdruck
im Dateinamen auszuliefern, dann koennte wieder ein Jahr Haltbarkeit
gelten. Dafuer muessten sie aus public/ heraus und ueber Vite importiert
werden; die Pfade stehen heute als Zeichenketten in den Textdateien, das
sind rund 50 Fundstellen. Lohnt sich, wenn die Seite steht und die Bilder
sich nicht mehr taeglich aendern.

### GoatCounter bleibt

Wolf am 28.08.: "ok behalten wir es". Der Anhang ?ref=instagram am Link in
der Instagram-Biografie ist gesetzt.

Offen bleibt nur der Termin: Ende November pruefen, ob das Dashboard
ueberhaupt angeschaut wurde und ob je etwas aufgrund der Zahlen anders
gemacht wurde. Wenn nein, faellt GoatCounter samt Absatz in der
Datenschutzerklaerung raus.

### Cookie-Banner, gemeldet am 28.08.

Geprueft und gemessen: die Seite setzt null Cookies, schreibt vor einer
Nutzerhandlung gar nichts, und danach genau einen Eintrag, die Sprachwahl.
Der faellt unter Paragraf 25 Absatz 2 Nummer 2 TDDDG (technisch
erforderlich), GoatCounter speichert nichts auf dem Geraet. Kein Banner
noetig.

Wolf am 28.08. zu den zwei Angeboten (Zaehlskript selbst hosten,
Sprachwahl auf sessionStorage): "ne das machen wir nicht selbst kannst du
abhaken". Damit ist der Punkt zu.

## Erledigt

* **Die Kategorie heisst auf Englisch "Ten Chips".** Sie hiess "All In",
  genau wie die Fraktion "Risiko". Auf der Landing am 28.08. geaendert, in
  der App hat Wolf am selben Tag nachgezogen. Die Fraktion behaelt "All In".
* **Der Instagram-Link traegt ?ref=instagram.** Damit landen Besuche aus dem
  In-App-Browser nicht mehr unter "direkt", und die Statistik beantwortet die
  Frage, wegen der wir sie behalten haben.
* **H8 der Spruch und der Fuss.** Der Spruch steht jetzt bei 12,2vw statt
  9,4, also 48 statt 37 px bei 390, weiter zweizeilig. Die Grenze setzt die
  laengere Zeile, die ohne Umbruch steht: gemessen fuellt ihr Text jetzt 326
  von 350 px, bei 360 und 320 entsprechend, kein Ueberlauf.
  Der Fuss folgt Wolfs Vorschlag: Logo, Wortmarke und Instagram-Zeichen
  mittig in einer Zeile, Impressum und Datenschutz mittig darunter. Vorher
  standen die drei Verweise als gleich aussehende Kaesten nebeneinander, als
  waeren sie dasselbe -- das eine ist, wo man CozyWolf findet, die zwei
  anderen sind Pflichtangaben.
  Schlussmessung ueber die ganze Seite, bei 430, 390, 360 und 320 px in
  beiden Sprachen: kein waagerechter Ueberlauf, kein Bedienziel unter 44 px.

Damit ist die Handy-Liste abgearbeitet.
* **H7 das Formular springt nicht mehr und ist kuerzer.** Der Hoehensprung
  hatte zwei Ursachen. Erstens standen die zwei Fragen des Testformulars
  untereinander, die des Eventformulars nebeneinander, also hatte eines eine
  Zeile mehr (gemessen 651 gegen 565 px); jetzt stehen beide als Zweierreihe.
  Zweitens sprang der Preiskasten (111 gegen 92 bei 390, 150 und 170 bei 360
  und 320), weil die Texte unterschiedlich lang sind; der Event-Text ist um
  "Keine versteckten Posten" gekuerzt und die Mindesthoehe steht auf 131 px.
  Kuerzer wurde es durch den Aufklapper: die Nachricht liegt jetzt hinter
  "Mehr Angaben", wie auf dem Desktop, wo sichtbar nur die Pflichtangaben
  stehen.
  Gemessen, beide Fassungen gegeneinander: bei 390 und 360 px exakt gleich
  hoch (912 und 931 px Abschnitt, 483 und 502 px Formular), kein Ueberlauf.
  Bei 320 px bleiben 15 px Unterschied, weil dort die Beschriftung "Stadt /
  Region" umbricht; das ist ein Fuenftel des alten Sprungs und betrifft nur
  sehr alte Geraete.
  Der Abschnitt faellt von 1041 auf 912 px.
* **H5 die Gegenstaende, H6 der Beamer-Abschnitt, und der Kicker.**
  Die drei Gegenstaende je Anlass standen als eigener Block ueber dem Namen
  und kosteten ihre volle Hoehe. Sie stehen jetzt rechts daneben, auf Hoehe
  von Name und Reichweite und mit 10 px Versatz nach unten, der Absatz laeuft
  darunter ueber die volle Breite. Nicht umflossen: bei 350 px blieben neben
  der Gruppe rund 150 px, und Fliesstext bricht dort nach zwei Woertern.
  Gemessen bei 390 px, alter Aufbau im Browser nachgestellt: 1498 gegen
  1184 px, also 314 px weniger, von 1,77 auf 1,40 Bildschirme. Kein
  Ueberlauf bei 390, 360 und 320 px.
  In 04 sind die Preiskapsel und der Kasten "Ich bringe mit / Ihr braucht"
  raus, beides stand auf dem Desktop schon nicht mehr. Der Wolf auf der
  Begruessungsfolie ist ein Standbild statt des Videos: die WebM-Datei traegt
  ihre Transparenz in der VP9-Nebenspur, die Safari nicht liest, und Wolf am
  28.08.: "mach als standbild den wolf, ist am einfachsten". Das Bild ist
  freigestellt und liegt bei 21 KB statt 966.
  Dazu der Kicker im Kopf: "Moderiertes Live-Quiz fuer Teams in Hamburg"
  brach auf Deutsch bei 390 px auf zwei Zeilen (gemessen 26 px hoch). "Fuer
  Teams" faellt weg, in beiden Sprachen und beiden Fassungen, damit sie
  dasselbe sagen. Gemessen: eine Zeile, 13 px.
* **H4 Abschnitt 03 passt jetzt auf einen Bildschirm.** Der Absatz ueber der
  Fragetyp-Zeile ist raus, er kostete 99 px und stand dreimal woanders (die
  zwei Haken unter der Karte und die Zeile "Fuenf Fragetypen, eine Runde").
  Der Abschnitt faellt damit von 912 auf 797 px, also von 1,08 auf 0,94
  Bildschirme.
  Dazu die Bilderfrage: sie war ohne Mindesthoehe 611 px hoch, die anderen
  Karten 456 bis 507, und mit ihr reichte der Abschnitt 12 px ueber den Rand
  (Unterkante 856 bei 844 Fenster). Das Foto lag als Streifen ueber der Frage;
  es steht jetzt daneben, wie das Skelett auf der Schaetzchen-Karte. Gemessen
  bei 390 auf 844 mit der Kopfzeile von 77 px: alle fuenf Fragetypen enden
  jetzt innerhalb des Fensters, der schlechteste Fall ist die Bilderfrage mit
  837 von 844.
* **H3 die Wappen, und der Absatz in 01.** Die Wappen trugen einen Kreis mit
  farbigem Rand auf dunklem Grund, eine Form, die es sonst nirgends auf der
  Seite gibt. Sie tragen jetzt dieselbe Kachel wie die Avatare, das Brett und
  die Wappen auf dem Desktop, mit der Fraktionsfarbe als Flaeche. Dafuer gibt
  es in qqKachel.ts eine zweite Fassung der Teammarke ohne feste Kantenlaenge,
  weil die Wappen im Handy auf Prozentwerten sitzen. Gemessen: Feld 350 auf
  199 px, Wappen zwischen 63 und 91 px, Ueberschneidung 0 Quadratpixel, die
  Lage traegt die eckige Form also unveraendert.
  Dazu ist der Absatz ueber den drei Strichen raus (Wolf: "mach den absatz
  raus in 01 ueber den 3 strichen"). Abschnitt 01 steht damit bei 1675 px,
  also knapp unter dem Stand vor dem Umbau (1680) und mit dem grossen Brett
  darin.
* **H1 Kopf und H2 Abschnitt 01.** Der Hauptknopf traegt jetzt die Farbe des
  Wortes, das oben steht, mit dunkler Schrift; gemessen ueber alle fuenf
  Farben ergibt das 7,08 / 5,02 / 8,71 / 12,96 / 5,40 gegen den dunklen Grund,
  also durchweg ueber den 4,5 der Stufe AA. Die Unterzeile steht dafuer voll
  deckend statt bei 72 Prozent, bei 70 Prozent faellt Violett auf 3,50 durch.
  Die Zeile "Lieber direkt buchen?" ist raus, die zwei Wege stehen jetzt
  untereinander und gleich breit.
  In 01 steht die Avatarwand ueber dem Text und das Brett darunter, die Zeile
  "4 bis 8 Teams" mit den vier Kacheln ist weg. Das Brett hat volle
  Spaltenbreite: 330 statt 226 px, Zelle 53 statt 36, und es ist quadratisch
  (der Rasterabstand stand in Prozent, was sich beim Zeilenabstand zu null
  aufloest -- gemessen waren es 330 zu 318). Abschnitt 01 waechst dadurch von
  1680 auf 1763 px, also von 1,99 auf 2,09 Bildschirme. Wenn das zu viel ist,
  waere der naechste Kandidat der Absatz ueber den drei Strichen, nicht das
  Brett.
* **Formular 3 zu 1, Schalter, Sprachwechsel** (gemeldet am 28.08. von einem
  Bekannten von Wolf). Die Felder standen auf breiten Bildschirmen 3 zu 1
  statt 2 zu 2: die Angabe war repeat(auto-fit,minmax(220px,1fr)), also nimmt
  der Browser so viele Spalten wie passen. Jetzt steht die Zwei fest, gemessen
  am Formularkasten und nicht am Fenster. Gemessen bei 2560, 1920, 1440, 1280,
  1100 und 1000 px: ueberall 2 zu 2, und beide Fassungen des Formulars sind
  weiterhin gleich hoch (575 px). Unter 460 px Kastenbreite eine Spalte.
  Der zweite Schalter in der Kopfzeile des Formulars ist raus, gewaehlt wird
  links in der Spalte. Und beim Sprachwechsel laeuft die Buchstabenwalze nicht
  mehr, weder auf dem Desktop noch im Handy.
* **1. Das Vorschaubild im quadratischen Zuschnitt.** Messenger schneiden
  mittig auf 630 auf 630 zu; vom zweispaltigen Entwurf blieb "en / cht alles."
  uebrig. Jetzt steht alles Wichtige mittig in diesem Quadrat, die
  Gegenstaende liegen ringsum, vier in dessen Ecken und zwei weiter aussen
  fuer den breiten Zuschnitt. Breitestes Element ist die Ueberschrift mit
  378 bis 822, also 93 px Luft je Seite. Das Bauskript misst das jetzt selbst
  und bricht ab, wenn etwas herausragt.
* **Kategorienamen auf Englisch.** Gemeldet am 28.08.: "kategorien in eng
  sind noch auf deutsch", und danach dasselbe fuer das Handy. Stimmte, und es
  war sogar dreifach uneinheitlich: der Desktop nannte in der Liste die
  deutschen Namen, in der Beamer-Vorfuehrung aber schon englische, und das
  Handy hatte eine dritte, frei erfundene Reihe (Ballpark, Look Closer,
  10 of 10, Mixed Bag). Jetzt stehen ueberall die offiziellen Namen aus der
  App (shared/quarterQuizTypes.ts, QQ_CATEGORY_LABELS): Mu-Cho, Close Call,
  Lucky Bag, All In, Picture This. Gemessen: im Desktop-Abschnitt 03 stehen
  alle fuenf, im Handy-Ablauf kein einziger deutscher Rest mehr.
* **2. Der Wolf auf der Begruessungsfolie war links angeschnitten.** Er steht
  auf dem Desktop jetzt bei left:12px statt -34px, im Handy bei left:1% statt
  -3%; der Textblock daneben bekam entsprechend mehr Polster links (Desktop
  258 statt 206 px, Handy 41 statt 30 cqw), damit der Wolf nicht in die
  Schrift laeuft. Gemessen, Ueberstand nach links: Desktop -11 px, Handy
  -4 px, also beide Male vollstaendig innerhalb der Projektion (606 bzw.
  320 px breit). Kein Ueberschneiden mit dem Text.
* **3. Die vier Kapseln bei "Ueber mich" sind raus.** Samt chips aus texts.ts
  in beiden Sprachen; der Entwurf in mockups/weitere.tsx, der sie noch
  auslas, zeigt an der Stelle jetzt das Wolfsbild. Die Ausrichtung ist neu
  gesetzt: die zwei Spalten stehen oben buendig statt mittig zueinander, der
  Kicker sitzt mit 6 px Versatz auf der Hoehe des Fotorands. Gemessen bei
  1440x900: beide Spalten beginnen bei 366 px.
* **4. Der Aufbau von 03 auf dem Desktop.** Anspruch und Satz des gewaehlten
  Fragetyps stehen jetzt direkt unter der Kategorienliste, in derselben
  Spalte, statt weit darunter in einer anderen. Die zwei Haken folgen in der
  linken Spalte direkt auf den Absatz. Dazu endet die Staffelung des
  Einfahreffekts jetzt fuer alle Elemente bei cover 19 Prozent statt bis 23,5
  zu laufen: der letzte laeuft kuerzer, nicht spaeter.
* **5. Der Spruch am Seitenende steht nicht mittig.** Der Abschnitt ist jetzt
  genau so hoch wie der freie Bereich, 100svh minus gemessene Fusshoehe,
  statt 92svh mit einer Ausgleichsrechnung, die im Code gar nicht stand.
  Gemessen, Abweichung von der Fenstermitte: 0 px bei 2000x1013, 1440x900 und
  1280x800; vorher 16, 21 und 25 px.

## Ideen, die wir verworfen haben (damit sie nicht zweimal kommen)

* Pfote als Mauszeiger. Verworfen am 28.08., "die neue pfote sieht doof aus".
  Brief dazu steht in der Historie, Commit a937f0a.
