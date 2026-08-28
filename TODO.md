# Offene Punkte

Was hier steht, ist von Wolf gemeldet und noch nicht erledigt. Reihenfolge
ist die Reihenfolge der Meldung, nicht die der Dringlichkeit.

## Nach der Handy-Fassung

### 1. Das Vorschaubild taugt im quadratischen Zuschnitt nicht

Gemeldet am 28.08. mit einem Bildschirmfoto einer Link-Vorschau: WhatsApp
und aehnliche schneiden das 1200 auf 630 grosse Bild auf ein Quadrat zu, und
zwar mittig. Vom heutigen Entwurf bleibt dann "en / cht alles." uebrig, die
Wortmarke links und die Objekte rechts sind beide weg.

Zu tun: tools/og-cover.html so umbauen, dass der mittlere quadratische
Ausschnitt (630 auf 630, also x 285 bis 915) fuer sich allein funktioniert.
Also mittige Anordnung statt der zweispaltigen, Wortmarke und eine kurze
Aussage in der Mitte, Objekte darum herum. Danach beide Zuschnitte pruefen,
das ganze Bild und das Quadrat.

### 2. Der Wolf auf der Begruessungsfolie ist links angeschnitten

Gemeldet am 28.08. mit einem Bildschirmfoto: der linke Arm laeuft aus der
Projektion heraus. Er steht auf dem Desktop bei left:-34px, im Handy bei
left:-3%, beides absichtlich, damit er "auf der Kante steht" -- aber der
Anschnitt trifft den Arm und sieht nach Fehler aus, nicht nach Absicht.

Zu tun: etwas nach rechts schieben, ohne in den mittigen Text zu geraten. Der
Textblock hat auf dem Desktop 206 px Polster links, da ist Luft. Beide
Fassungen, und danach bei 1280, 1440 und 390 px nachmessen.

### 3. Die vier Kapseln bei "Ueber mich"

Gemeldet am 28.08.: "brauchen wir die noch?" Meine Antwort: nein, alle vier
stehen schon woanders, und zwar konkreter.

* "Persoenliche Moderation vor Ort" -- der Kicker im Kopf sagt "Moderiertes
  Live-Quiz", 04 sagt "Moderation bringe ich mit", und das Zitat direkt
  darueber sagt es in der ersten Person.
* "Fuer Gruppen von sechs bis 160 Personen" -- 01 sagt "Bis 40 Personen" und
  "Ab 40 Personen", und die Frage "Fuer wie viele Personen funktioniert das?"
  antwortet mit "bis zu 160 Personen".
* "Individuell auf eure Gruppe abgestimmt" -- 02 sagt "Ich stimme Fragen,
  Laenge und Spielart auf eure Runde ab", 04 sagt "die Fragen, auf eure Runde
  abgestimmt".
* "Region Hamburg und Umland" -- steht im Kicker im Kopf und in der Antwort
  "Wie weit faehrst du?".

Dazu die Form: es ist die einzige Stelle der Seite mit einer Wolke aus
Kapseln. Das Muster kommt aus Lebenslaeufen und Profilseiten, und unter einem
persoenlichen Zitat liest es sich als Faehigkeitsliste.

Zu tun: raus, samt chips aus texts.ts in beiden Sprachen. Wolf am 28.08.
dazu: "denk daran den text dann wieder richtig auszurichten ans bild" -- die
rechte Spalte steht heute mittig zur linken, weil die Kapseln sie nach unten
verlaengern. Ohne sie muss die Ausrichtung neu gesetzt werden, sonst haengt
der Text neben dem Foto in der Luft.

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
