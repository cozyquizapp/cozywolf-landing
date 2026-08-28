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

Zu tun: raus, samt chips aus texts.ts in beiden Sprachen.

### 4. Der Aufbau von 03 auf dem Desktop

Gemeldet am 28.08.: "text unten zu lange blurry, wie waere es den text also
die 2 saetze ueber die kategorien zu machen? oder besser diesen bereich ueber
die kategorien und den anderen text hochschieben?"

Zwei Sachen liegen da uebereinander, und sie haben verschiedene Ursachen.

Erstens die Unschaerfe. Die zwei Haken sind das vierte und fuenfte Element
ihrer Spalte, und die Staffelung schiebt deren Strecke bis cover 23,5 Prozent
nach hinten. Sie sind damit erst scharf, wenn ihre Oberkante rund 220 px ueber
der Unterkante steht, und weil sie ganz unten in einer langen Spalte stehen,
faellt genau das auf. Das ist unabhaengig vom Aufbau zu beheben: die
Staffelung fuer alles ab dem vierten Element kappen, damit kein Element
spaeter als cover 19 Prozent fertig wird.

Zweitens die Zuordnung, und das ist der eigentliche Punkt. Der farbige
Anspruch und der Satz darunter ("Spend your points wisely. / 3 answers, 10
points.") gehoeren zu der Kategorie, die man gerade gewaehlt hat -- sie stehen
aber in einer anderen Spalte, weit unter der Liste. Man aendert etwas rechts
und liest die Folge links unten.

Mein Vorschlag, statt beider Varianten aus der Meldung:
 * Anspruch und Satz wandern direkt unter die Kategorienliste, in dieselbe
   Spalte. Dort gehoeren sie hin, dort passiert die Wahl.
 * Die zwei Haken ruecken in der linken Spalte direkt unter den Absatz. Die
   linke Spalte ist dann durchgehend "worum es hier geht", die mittlere
   "waehl eine, das ist sie".
 * Damit ist die linke Spalte kuerzer, endet hoeher, und die Unschaerfe faellt
   ohnehin weniger auf.

### 5. Der Spruch am Seitenende steht nicht mittig

Gemeldet am 28.08.: "text ist nicht mittig wenn ganz unten (ist das browser
abhaengig?)".

Teils. Der Hauptgrund ist aber ein anderer, und der ist eindeutig: der
Ausgleich, der im Kommentar steht, ist im Code gar nicht da. Dort heisst es,
ein Polster von zwei Fusshoehen oben schiebe die Mitte um genau eine Fusshoehe
nach unten. Gemessen steht --fuss korrekt auf 113 px, das padding-top des
Abschnitts aber auf 0. Der Ausgleich ist also entweder nie eingebaut oder
irgendwann mit rausgeflogen.

Was ich messen konnte (Chromium, ganz unten gescrollt, Abweichung nach oben):
16 px bei 2000x1013, 21 px bei 1440x900, 25 px bei 1280x800. In Wolfs
Bildschirmfoto sieht es nach deutlich mehr aus, und das ist der browserabhaengige
Teil: 92svh faellt je nach Browser und Werkzeugleisten verschieden aus, und
je hoeher der Abschnitt gegenueber dem freien Bereich ist, desto weiter
rutscht seine Mitte nach oben.

Zu tun, und zwar so, dass die Frage nach dem Browser gar nicht mehr aufkommt:
dem Abschnitt height:calc(100svh - var(--fuss)) geben statt clamp(...92svh...).
Dann ist seine Unterkante genau die Oberkante des Fusses, und seine eigene
Mitte ist die Mitte des freien Bereichs -- ohne Ausgleichsrechnung. Danach bei
1280, 1440 und 2000 nachmessen, Abweichung muss 0 sein.

## Ideen, die wir verworfen haben (damit sie nicht zweimal kommen)

* Pfote als Mauszeiger. Verworfen am 28.08., "die neue pfote sieht doof aus".
  Brief dazu steht in der Historie, Commit a937f0a.
