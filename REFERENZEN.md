# Was die vier Referenzen gemeinsam sagen

Wolf hat am 27.08. vier Stilberichte geschickt: Air (dunkel, Fotografie),
Custo (Produktgalerie, achromatisch), Dylanbrouwer (brutalistische Typo),
Apple Spanien (Weissraum-Kathedrale). Zwei helle, eine dunkle, eine gemischte,
aus vier verschiedenen Branchen.

Interessant ist nicht, was sie unterscheidet, sondern worin sie sich einig
sind. Sechs Punkte, und alle vier sagen jeden davon ausdruecklich.

## 1. Keine Schatten

Air: "No elevation." Custo: "avoids shadows entirely." Dylanbrouwer: "Don't
apply shadows or elevation to cards." Apple: "Don't use shadows or elevation."

Alle vier erzeugen Tiefe ueber Flaechenwechsel und Haarlinien, nicht ueber
Schatten.

GEMESSEN auf unserer Seite bei 1440x780: 76 Elemente tragen einen Schatten,
davon 17 Spielsteine. Bleiben **59 Schatten an der Oberflaeche**.

Wichtig: die 17 gehoeren nicht dazu. Der Schatten einer Kachel steht in der
Kacheldefinition der App und ist Teil des Spielsteins, nicht des Layouts. Die
59 anderen sind Karten, Kaesten, Knoepfe und das Handy.

## 2. Trennung durch Flaeche oder Luft, nie durch Linien

Apple: "Don't use borders to separate sections. Alternate the canvas color
instead." Custo: 110 px Abstand und abwechselnde Baender. Air: 48 px
Abschnittsabstand. Dylanbrouwer: 48 bis 80 px, Haarlinien nur INNERHALB
heller Abschnitte als Rasterlinien.

GEMESSEN: unsere Seite hat **10 Trennlinien** zwischen Abschnitten.

Damit ist die offene Frage entschieden, und zwar viermal unabhaengig: die
Fassungen K3 und K5 im Mockup treffen es, K1 nicht.

## 3. Ein einziger farbiger Akzent, und nur funktional

Air: Signal Blue nur fuer Verweise, "not for buttons or backgrounds".
Dylanbrouwer: Ember Orange nur fuer Statuspunkte. Apple: Blau nur fuer den
gefuellten Knopf. Custo: gar keine Farbe.

GEMESSEN: **10 verschiedene Textfarben** auf der Seite.

Das klingt schlimmer, als es ist: die meisten davon sind Fraktionsfarben in
der Rangliste, also Inhalt und nicht Schmuck. Genau das machen die vier auch,
Apple laesst die Produktfarben die Farbe tragen und haelt die Oberflaeche
grau. Unsere Entscheidung, Pink aus der Schrift zu nehmen, war richtig, und
sie ist damit vollstaendig: Farbe hat nur noch, was im Spiel auch Farbe hat.

## 4. Grosse Schrift ist der Schmuck

259 px bei Air, 288 bei Dylanbrouwer, 96 bei Apple, 57 bei Custo. Alle vier
setzen einen Schriftgrad, der die Seite traegt, und halten alles andere klein.

GEMESSEN: unsere Ueberschriften stehen bei 75, 75, 34, 34, 30, 34, 44 px.
Zwei Kapitel rufen, der Rest fluestert. Das ist der Grund, warum die Seite
nach dem Hero abfaellt, und Wolf hat es gespuert, bevor die Zahlen da waren.

## 5. Wenige Radien, konsequent

Air: "Don't introduce new radii — stick to 4px (inputs), 8px (buttons),
11-14px (cards/images)." Custo: 8 px ueberall, 31 px nur fuer den einen
Knopf. Dylanbrouwer: 0 px fuer Karten, 9999 nur fuer Bedienelemente.

GEMESSEN: wir benutzen mindestens **acht verschiedene Radien**: 50 %, 9, 16 %,
7, 999, 12, 2 und 10 px.

Auch hier gilt der Vorbehalt: 16 % ist die Kachel der App, 50 % das runde
Foto. Die uebrigen sind gewachsen, nicht entschieden.

## 6. Bewegung: schwer, nicht federnd

Dylanbrouwer ist als einziger genau: Eingang cubic-bezier(0.32, 0.72, 0, 1),
Ausgang (0.19, 1, 0.22, 1), 0,3 s fuer Kleinigkeiten, 0,5 s fuer Bauteile,
0,6 bis 0,75 s fuer ganze Abschnitte. Bewegt werden nur transform, opacity
und Farbe, nie Breite oder Hoehe. Kein Federn, kein Ueberschwingen.

Unser EASE ist cubic-bezier(.22, 1, .36, 1) und liegt damit in derselben
Familie wie deren Ausgangskurve. Das passt schon.

Und: **keine der vier Seiten dreht etwas herein.** Der Aufbau ist ueberall
versetztes Hereinfahren aus Verschiebung und Deckkraft. Damit spricht die
Mehrheit fuer T3 im Trennungs-Mockup und gegen T2, so schoen die Dose von
Mana Mate auch ist.

## Was NICHT uebernommen werden sollte

Alle vier sind Produkt- oder Portfolioseiten mit einem Gegenstand oder mit
Fotografie. Wir haben ein Spiel, das auf der Seite laeuft. Farbe, Bewegung
und Schatten gehoeren bei uns zum Inhalt, nicht zur Verzierung. Die sechs
Punkte gelten also fuer die Oberflaeche, nicht fuer Brett, Kacheln, Wappen
und Leinwand.

Ausserdem: keine der vier benutzt hartes Einrasten. Ihre Ordnung kommt aus
wiederkehrenden Abstaenden. Unser scroll-snap steht auf proximity und damit
auf der leisen Stufe; die Abstaende muessen die Arbeit trotzdem tun.

## Geprueft und entwarnt

Der Abgleich meldete "Times New Roman" und "Arial" auf der Seite. Nachgesehen:
das sind ausschliesslich META-, LINK-, TITLE- und SCRIPT-Elemente im Kopf,
also nichts Sichtbares. Kein Schriftfehler.
