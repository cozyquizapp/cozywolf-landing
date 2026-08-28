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

### GoatCounter bleibt, aber der Instagram-Link braucht einen Anhang

Wolf am 28.08.: "ok behalten wir es". Damit ist die Frage entschieden.

Offen ist noch die kleine Massnahme, die die Statistik erst nuetzlich macht:
den Link in der Instagram-Biografie um ?ref=instagram ergaenzen. Aus
In-App-Browsern kommt die Herkunft oft nicht mit, solche Besuche landen sonst
unter "direkt", und dann beantwortet die Zahl genau die Frage nicht, wegen
der wir sie behalten. Das ist nichts am Code, das macht Wolf in seinem
Profil.

Dazu ein Termin: Ende November pruefen, ob das Dashboard ueberhaupt
angeschaut wurde und ob je etwas aufgrund der Zahlen anders gemacht wurde.
Wenn nein, faellt GoatCounter samt Absatz in der Datenschutzerklaerung raus.

### Cookie-Banner, gemeldet am 28.08.

Geprueft und gemessen: die Seite setzt null Cookies, schreibt vor einer
Nutzerhandlung gar nichts, und danach genau einen Eintrag, die Sprachwahl.
Der faellt unter Paragraf 25 Absatz 2 Nummer 2 TDDDG (technisch
erforderlich), GoatCounter speichert nichts auf dem Geraet. Kein Banner
noetig. Zwei Angebote stehen offen, falls es wasserdicht sein soll: das
Zaehlskript selbst hosten, und die Sprachwahl auf sessionStorage umstellen.

## Handy, gemeldet am 28.08. nach dem Umbau

Reihenfolge laut Wolf: erst die drei Desktop-Punkte oben, dann diese hier.

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

### H6. 04 Beamer: alter Text raus, und der Wolf ist nicht freigestellt

"beamersection, hier ist viel alter text der in desktop nicht mehr [ist],
das from 350 und unten das fenster mit i bring you need rausnehmen, dann das
obvious der wolf ist nicht freigestellt auf mobile"

Zu tun:
 * Die Kapsel "ab 350 EUR" in diesem Abschnitt faellt weg. Der Preis steht in
   06 bei der Wahl zwischen Test-Team und Event, und dort gehoert er hin.
 * Der Kasten "Ich bringe mit / Ihr braucht" faellt weg. Der Desktop hat ihn
   nicht mehr; im Handy ist er stehengeblieben.
 * Der Wolf auf der Begruessungsfolie steht im Handy in einem weissen Kasten.
   Der Grund ist die Datei: wolf-willkommen.webm ist VP9 mit Alphakanal, und
   iOS-Safari zeigt VP9-Alpha nicht. Auf dem Desktop faellt es nicht auf, weil
   Chrome und Firefox es koennen. Braucht eine zweite Fassung, entweder HEVC
   mit Alpha fuer Safari oder als Rueckfall das Standbild wolf-3d.webp.
   Vorher messen, welchen Weg das Geraet tatsaechlich nimmt.

### H7. 06 Formular: zu hoch, und die Hoehe springt

"request form ist zu hoch fuer mobile und veraendert hoehe je nach auswahl,
das ist nicht so schoen, kann man das optimieren?"

Zu tun: die Hoehe zwischen den beiden Fassungen angleichen (auf dem Desktop
ist das schon so, dort stehen beide bei 575 px) und die Gesamthoehe druecken.
Zu messen, bevor ich etwas verschiebe: wie hoch ist das Formular heute je
Fassung, und welcher Teil traegt die Hoehe.

### H8. Der Spruch darf groesser, und der Fuss muss anders

"stay cozy stay curious darf groesser sein, 2 zeilig ist auf mobile gut /
footer muss anderst sein, das sieht nicht gut aus vlt logo cozywolf und insta
logo in eine zeile mittig und darunter imprint und pirvacy in eine mittig?
was denkst du?"

Zu tun:
 * Der Spruch groesser, auf zwei Zeilen gebrochen.
 * Der Fuss nach Wolfs Vorschlag: Logo, Wortmarke und Instagram-Zeichen
   mittig in einer Zeile, darunter Impressum und Datenschutz mittig in einer
   zweiten. Meine Antwort dazu: ja. Der Fuss steht heute als Reihe, die im
   Handy umbricht und dadurch linksbuendig ausfranst; zwei bewusst gesetzte
   mittige Zeilen sind das Gegenteil davon und passen zum Spruch darueber,
   der ebenfalls mittig steht.

## Erledigt

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
