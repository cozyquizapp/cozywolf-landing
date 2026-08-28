# Auftrag: 3D-Beamer für Sektion 04

> Stand 2026-08-28. Wolf: „du bekommst von mir einen 3d beamer und wir schalten
> den bei scroll automatisch an".

Ein einzelnes Objekt, kein Satz. Es steht in Sektion 04 („Mehr als eine freie
Wand braucht ihr nicht") vor der Leinwand und wirft das Bild darauf, das dort
heute schon läuft.

---

## 1. Was es ist

Ein **kleiner Heimbeamer**, wie er auf einem Regal steht. Kein Kinoprojektor,
kein Gerät mit Stativ, kein Röhrenprojektor mit Spulen. Grob quaderförmig mit
weichen Kanten, vorn die Linse, oben eine leichte Wölbung, hinten oder seitlich
angedeutete Lüftungsschlitze. Ein Fuß darunter genügt, kein Kabel.

Größe im Bild: er muss auf 150 px Breite noch als Beamer lesbar sein. Also
große Formen, wenige Kanten, die Linse deutlich als Kreis.

## 2. Stil: wortgleich zum vorhandenen Satz

Die Rezeptur steht schon. Sie stammt aus dem **App-Repo** (`cozyquizapp/KioskQuiz`,
Datei `docs/AVATAR_BRIEF.md`, Abschnitt 4) und ist hier vollständig
wiedergegeben — dieser Auftrag steht also für sich, man braucht das andere Repo
nicht dafür. Nicht neu erfinden, sondern übernehmen:

* **Material.** Matt. Ton, Weichgummi, Filz. Keine Glanzlichter, kein Plastik.
  Leichte Wärme im Halbschatten, keine harten Verlaufskanten. Keine
  Konturlinie.
* **Licht.** EINE weiche Hauptlichtquelle von **oben links, etwa 35 Grad**.
  Schwaches Umgebungslicht von unten rechts. Weicher Kontaktschatten am Objekt
  selbst, damit aus dem Sticker ein Ding wird.
* **Warmes Eigenlicht.** Eine kleine warme Lichtstelle im Körper, wie ein
  Glühwürmchen darin. Das ist die Signatur, die den Satz zusammenhält.
* **Form.** Vereinfachen. Große Formen, wenige Kanten.
* **Haltung.** Nichts steht gerade. Der Beamer ist minimal aus dem Lot, ein
  bis zwei Grad gekippt.
* **Handgemachte Unregelmäßigkeit.** Sichtbar geformt statt perfekt gerechnet.
* **Farbe.** Zurückgenommen und warm. Creme, warmes Grau, gebrochenes Weiß mit
  einem dunkleren Gehäuseteil. **Kein Pink** (beißt sich mit dem Logo) und
  nichts Knalliges: die Farbe im Bild kommt vom Licht des Beamers, nicht vom
  Gehäuse.

## 3. Kamera und Ausrichtung — der beamerspezifische Teil

> **Korrektur vom 28.08., nach Wolfs Einwand.** Hier stand zuerst, die Linse
> solle nach rechts zeigen und sichtbar sein. Das war falsch. Wolf:
> „aber die linse in unsere richtung wäre doch falsch, er soll ja an eine wand
> VOR uns strahlen, oder nicht?" — genau so ist es. Die Leinwand auf der Seite
> steht vor uns und ist uns zugewandt. Ein Beamer, der darauf wirft, steht
> also **zwischen uns und der Wand** und strahlt **von uns weg**. Wer seine
> Linse sieht, sieht einen Beamer, der ins Publikum leuchtet.

### Wo er steht

Zwischen Betrachter und Leinwand, also **näher als die Wand**, tiefer und
etwas seitlich, so dass er die untere Ecke der Projektion leicht überlappt.
Diese Überlappung ist kein Zufall, sie ist der einzige eindeutige Hinweis auf
Tiefe: was etwas verdeckt, steht davor.

### Wie er gedreht ist

**Dreiviertelansicht von HINTEN.** Das Gerät ist von uns weggedreht: wir sehen
seine Rückseite und einen Streifen der Seitenwand, die Vorderseite zeigt in die
Tiefe. Auf die Wand zu.

* **Die Linse ist NICHT zu sehen.** Sie zeigt von uns weg. Es braucht sie also
  auch nicht im Modell — was in der ersten Fassung dieses Auftrags noch die
  wichtigste Forderung war, ist damit hinfällig.
* Uns zugewandt ist die **Rückseite**: Gehäuse, Lüftungsgitter, meinetwegen
  eine angedeutete Buchse. Ein Gitter auf der Rückseite ist richtig, ein Gitter
  auf der Vorderseite wäre falsch.
* Der Körper dreht sich leicht **nach rechts hinten**, in die Richtung, in die
  der Lichtkegel läuft.

### Kamerahöhe

Der Beamer steht tiefer als die Leinwand, wir schauen also **leicht von oben**
auf ihn. Das ist die einzige Angabe, die in der ersten Fassung schon richtig
war — nur die Drehung stimmte nicht.

### Warum die Richtung „nach rechts hinten"

Die Leinwand steht nicht frontal, sondern in Ruhe bei `rotateY(-11°)`. Am
28.08. bei 1440 px nachgemessen sind ihre projizierten Kanten 310 px links und
343 px rechts hoch: die rechte Seite steht näher am Betrachter, die linke läuft
in die Tiefe. Der Kegel läuft also von unten rechts nach oben links in das Bild
hinein — und der Beamer steht entsprechend rechts unterhalb der Projektion.

## 4. Was NICHT ins Bild darf

Der Grund steht in der Sitzung vom 27.08.: die KI-Bilder sind rausgeflogen,
weil sie einen Raum behauptet haben, den es nicht gibt. Zwei Gegenstände und
das Licht dazwischen sind ehrlich, ein Zimmer wäre wieder derselbe Fehler.

* **Kein Lichtkegel.** Der kommt aus CSS und muss sich mit der Wand mitdrehen.
* **Kein Schlagschatten auf einen Boden.** Es gibt keinen Boden.
* **Kein Tisch, kein Regal, keine Wand, kein Hintergrund.** Nur das Gerät.
* **Kein Staub im Strahl, keine Lichtstreifen, kein Bokeh.**
* **Kein Gesicht.** Geräte bekommen im Satz konsequent keine Augen. Der Satz
  dazu aus dem Avatar-Auftrag der App: „Ein Bierkrug mit Augen ist genau der
  Rückfall, den wir vermeiden.".
* **Kein Kabel**, es hinge im Nichts.
* **Keine Marke, keine Beschriftung, keine Knöpfe mit Symbolen.**

## 5. Das Anschalten: kein Licht im Bild

Wichtig, weil das Anschalten in CSS passiert.

Da die Linse von uns weg zeigt, ist sie ohnehin nicht zu sehen — das Anschalten
zeigt sich anders, und besser: das Gerät bekommt einen Lichtsaum um seine
Silhouette, weil das Licht an ihm vorbei zur Wand läuft. Dieser Saum kommt aus
CSS.

Deshalb: **kein Licht im gerenderten Bild.** Kein Schein, kein Halo, keine
helle Kante. Das Gerät wird ausgeschaltet geliefert, gleichmäßig beleuchtet von
der einen Hauptlichtquelle aus Abschnitt 2. Wäre der Schein schon im Bild,
gäbe es keinen Unterschied zwischen aus und an, und genau der ist der Effekt.

## 6. Technische Abgabe

* **Format:** PNG mit Alphakanal. Kein JPG, kein weißer Hintergrund, keine
  Schachbrett-Textur als „Transparenz".
* **Größe:** 1024 × 1024 px. Das Objekt darf die Kanten berühren.
* **Freistellung:** sauber, keine hellen Ränder, keine Halos vom Ausschneiden.
* **Einbau übernehme ich:** zuschneiden auf die Bounding Box, auf 200 px
  skalieren, als webp speichern, Füllanteil messen und in `src/qqKachel.ts`
  eintragen. So sind die drei Hero-Objekte auch entstanden (gemessen: Puzzle
  200×138 Inhalt, Sanduhr 132×200, Gehirn 200×200, jeweils exakt auf die
  Bounding Box beschnitten).
* **Dateiname:** `beamer.png` genügt, ich benenne es zu `obj-beamer.webp`.

## 7. Optional, aber hilfreich

Ein **zweites Bild aus demselben Aufbau**, nur mit leuchtender Linse und einem
warmen Schein auf dem Gehäuse davor. Dann lässt sich zwischen aus und an
überblenden, statt das Leuchten nur oben drauf zu legen. Kostet einen zweiten
Render aus derselben Szene, also fast nichts, und macht das Anschalten
deutlich glaubwürdiger.

Dateiname dafür: `beamer-an.png`.

## 8. Was danach auf der Seite passiert

Damit klar ist, wofür die Auflagen gut sind:

1. Der Beamer steht unten rechts vor der Leinwand, in derselben 3D-Szene wie
   sie (gleiche `perspective`, gleiches gekipptes Eltern-Element). Er kippt
   also mit, wenn die Wand sich beim Anspringen aufrichtet, und überlappt ihre
   untere Ecke leicht.
2. Beim Scrollen in die Sektion geht er von allein an. Heute startet die
   Projektion nur bei `onMouseEnter` oder Klick, und `onMouseLeave` schaltet
   sie wieder aus — wer vorbeiscrollt, ohne die Maus auf die Wand zu legen,
   sieht nie etwas. Auf einem Touchgerät gibt es gar keinen Hover.
3. Der Kegel läuft in CSS vom Gerät weg in die Tiefe zur Leinwand, als
   weicher Keil ohne Kante, und wird beim Anschalten breiter. Dazu ein
   Lichtsaum um die Silhouette.
4. Hover lenkt danach nur noch den hellen Fleck auf der Wand, so wie bisher.
