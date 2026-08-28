# Offene Punkte

Was hier steht, ist von Wolf gemeldet und noch nicht erledigt. Reihenfolge
ist die Reihenfolge der Meldung, nicht die der Dringlichkeit.

## Offen, zur Entscheidung

### Zwei Namen heissen auf Englisch gleich

Der Joker "Risiko" heisst in der App auf Englisch "All In", und seit heute
heisst die Kategorie "10 von 10" auf Englisch ebenfalls "All In". Beides
kommt so aus der App, ich habe es deshalb nicht eigenmaechtig geaendert. Auf
der Seite stehen die beiden in verschiedenen Abschnitten, es faellt also
kaum auf. Wenn es dich stoert, muss es in der App geaendert werden, nicht
hier.

### Cookie-Banner, gemeldet am 28.08.

Geprueft und gemessen: die Seite setzt null Cookies, schreibt vor einer
Nutzerhandlung gar nichts, und danach genau einen Eintrag, die Sprachwahl.
Der faellt unter Paragraf 25 Absatz 2 Nummer 2 TDDDG (technisch
erforderlich), GoatCounter speichert nichts auf dem Geraet. Kein Banner
noetig. Zwei Angebote stehen offen, falls es wasserdicht sein soll: das
Zaehlskript selbst hosten, und die Sprachwahl auf sessionStorage umstellen.

## Handy, gemeldet am 28.08. nach dem Umbau

Reihenfolge laut Wolf: erst die drei Desktop-Punkte oben, dann diese hier.

### H1. Kopf: Farbe des Knopfes, und die Fuelle

"farbe von button 'free for test teams' sollte in farbe der schrift oben
sein (insgesamt wirkts ziemlich voll was denkst du?)"

Zu tun: der Hauptknopf traegt die Farbe des gerade stehenden Wortes statt
Creme, mit dunkler Schrift. Die fuenf Farben sind gegen dunkle Schrift alle
geprueft (Orange 7,08 zu 1, Gruen 8,71, geringster Wert Blau) -- das war die
Rechnung fuer die Fuellung auf dem Desktop und gilt hier genauso.

Zur Fuelle, meine Antwort: ja, und die ueberzaehlige Zeile ist "Lieber direkt
buchen?". Der Desktop hat im Kopf zwei Knoepfe nebeneinander und sonst nichts;
das Handy hat den Knopf, dann eine Frage, dann einen zweiten Knopf. Die Frage
ist der einzige Satz auf der Seite, der nichts sagt, sondern nur ueberleitet.
Vorschlag: raus, die zwei Knoepfe untereinander, fertig.

### H2. 01 CozyQuiz ist zu voll

"sehr voll - entweder team emoji kacheln ueber den text und grid drunter oder
grid ganz raus. falls grid drin bleibt muss es an breite angepasst werden (ich
finde es koennte raus aus der mobile) den bereich 4-8 teams mit den 4 kacheln
raus!"

Zu tun:
 * Die Zeile "4 bis 8 Teams" mit den vier ueberlappenden Kacheln faellt weg.
 * Das Brett: Wolf tendiert zu raus. Zu klaeren, bevor ich es entferne -- es
   ist das einzige Bild auf der Seite, das zeigt, wie CozyQuiz aussieht.
   Falls es bleibt, muss es die volle Spaltenbreite bekommen statt der 246 px
   aus dem alten Entwurf.
 * Die Avatarwand ueber den Text, das Brett darunter.

### H3. Die Wappen tragen den falschen Rahmen

"wappen haben runde umrandung statt bunte team kachel, bitte anpassen"

Zu tun: statt Kreis mit farbigem Rand die Kachelform der App (teammarke),
wie bei den Avataren und den Feldern auf dem Brett. Betrifft das Wappenfeld
in 01 im Handy.

### H4. 03 Ausprobieren ist zu hoch

"text oben raus, zu viel zu lesen, 'spielen' des quizzes schwierig weil
darstellung zu hoch, man bekommts nicht so richtig auf einen mobile screen"

Zu tun: den Absatz ueber der Fragetyp-Zeile kuerzen oder streichen, und die
Fragekarte so hoch bauen, dass Frage und Antworten zusammen auf einen
Bildschirm passen. Heute ist die Karte allein 470 px hoch plus Ueberschrift,
Zeile und Absatz darueber.

### H5. 02 Anlaesse: die Gegenstaende neben den Text

"symbole gerne weiter nach rechts neben den text leicht nach unten versetzt
wie aktuelle hoehenposition? das saehe glaube ich besser aus als oben drueber"

Zu tun: die drei Gegenstaende je Anlass rechts neben den Text setzen, etwas
tiefer, statt darueber. Auf 350 px heisst das eine schmale zweite Spalte
oder ein Ueberlappen; beides messen, bevor ich mich festlege.

### H6 bis H8

Wolf schickt noch die drei restlichen Abschnitte mit Bildern nach.

## Erledigt

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
