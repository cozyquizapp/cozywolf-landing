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

Hier weicht der Auftrag vom Avatarsatz ab, und zwar aus einem gemessenen Grund.

Die Leinwand auf der Seite steht nicht frontal. Sie ist um die Hochachse
gedreht: in Ruhe `rotateY(-11°)`, während das Bild läuft `rotateY(-2.6°)`, dazu
eine leichte Kippung um die Querachse. Am 28.08. bei 1440 px nachgemessen sind
die projizierten Kanten in Ruhe:

    linke Kante  310 px hoch
    rechte Kante 343 px hoch

Die rechte Seite steht also näher am Betrachter, die linke läuft in die Tiefe.
Der Beamer steht auf der Seite, wo Platz ist — unten links, unter dem Text —
und wirft von dort nach rechts.

Daraus folgt für das Rendering:

* **Blickwinkel:** Dreiviertelansicht von vorn links, leicht von unten
  (Augenhöhe knapp unter der Oberkante des Geräts). Nicht von oben.
* **Die Linse zeigt nach RECHTS und leicht nach OBEN.** Sie muss im Bild
  sichtbar sein, also nicht in reiner Seitenansicht verschwinden und nicht
  frontal auf den Betrachter zielen. Richtwert: die Blickachse der Linse
  läuft etwa 25 bis 35 Grad nach rechts aus dem Bild heraus und 10 bis 15 Grad
  nach oben.
* **Warum das genau so sein muss:** der Lichtkegel wird nicht mitgerendert,
  sondern liegt in CSS über dem Bild und läuft von der Linse zur Leinwand.
  Zeigt die Linse frontal auf den Betrachter, lässt sich kein Kegel ansetzen,
  der zur Wand führt. Er würde aus dem Bild heraus auf den Leser zielen.
* **Die Linse muss am Rand des Objekts sitzen**, nicht in einer tiefen Nische.
  Der Kegel setzt an ihrer Vorderkante an; liegt sie 20 px tief im Gehäuse,
  klafft dort eine Lücke.

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

## 5. Die Linse: dunkel liefern, nicht leuchtend

Wichtig, weil das Anschalten in CSS passiert.

Die Linse im Bild ist **dunkel und matt**, wie eine ausgeschaltete Lampe: ein
tiefes Glas, ein leichter Ring darum. Das Leuchten legt die Seite darüber,
damit der Beamer beim Scrollen tatsächlich angehen kann. Wäre die Linse schon
im Bild hell, gäbe es keinen Unterschied zwischen aus und an, und genau der ist
der Effekt.

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

1. Der Beamer steht unten links in Sektion 04, in derselben 3D-Szene wie die
   Leinwand (gleiche `perspective`, gleiches gekipptes Eltern-Element). Er
   kippt also mit, wenn die Wand sich beim Anspringen aufrichtet.
2. Beim Scrollen in die Sektion geht er von allein an. Heute startet die
   Projektion nur bei `onMouseEnter` oder Klick, und `onMouseLeave` schaltet
   sie wieder aus — wer vorbeiscrollt, ohne die Maus auf die Wand zu legen,
   sieht nie etwas. Auf einem Touchgerät gibt es gar keinen Hover.
3. Der Kegel läuft in CSS von der Linse zur Leinwand, als weicher Keil ohne
   Kante, und wird beim Anschalten breiter.
4. Hover lenkt danach nur noch den hellen Fleck auf der Wand, so wie bisher.
