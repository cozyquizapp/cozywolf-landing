# Die Pfote: was ich brauche

Zwei mögliche Verwendungen, zwei verschiedene Dateien. Bau bitte nur die,
für die du dich entscheidest.

Die drei Farben unten sind aus `public/logo.png` gemessen, es sind die
häufigsten Farbwerte des Wolfs:

| | Wert | wofür |
|---|---|---|
| Rosa | `#F94AA2` | Fläche |
| Dunkelrosa | `#AB0055` | Schattenseite |
| Blau | `#0C3E79` | Krallen und Kontur |

Dein Bild trifft das schon fast. Es geht unten nur um Größe und Kontrast,
nicht um einen neuen Entwurf.

---

## Variante A: die Pfote als Mauszeiger

### Dateien

* `pfote-32.png`, genau 32 × 32 Pixel
* `pfote-64.png`, genau 64 × 64 Pixel, dasselbe Motiv

Beide als PNG mit Transparenz, ohne Schlagschatten.

Warum zwei: Chrome rechnet Zeigerbilder nicht auf die Bildschirmdichte hoch.
Auf einem normalen Bildschirm brauchen wir 32, auf einem Retina 64, und beide
liefern wir zusammen aus. Über 128 × 128 ignoriert Chrome ein Zeigerbild
ohnehin, deshalb sind das die nützlichen Größen.

### Was am Motiv anders sein muss

Das jetzige Bild ist ein 3D-Render mit Fell, weichen Verläufen und viel Luft
am Rand. Bei 32 Pixeln bleibt davon ein rosa Klecks. Also:

1. **Eng beschneiden.** Die Pfote füllt mindestens 90 Prozent der
   Kantenlänge, höchstens ein Pixel transparenter Rand. Im jetzigen Bild ist
   rundherum etwa ein Fünftel Luft, das kostet uns bei 32 Pixeln sechs davon.
2. **Kein Fell, keine weichen Verläufe, kein Weichzeichner.** Flache Fläche,
   höchstens eine Stufe Schatten an der linken Seite in `#AB0055`.
3. **Kontur.** 2 Pixel in der 32er Fassung, 4 in der 64er, in `#0C3E79`. Der
   Zeiger läuft über helle Kacheln und über fast schwarzen Grund. Ohne Kontur
   verschwindet er auf einem der beiden.
4. **Krallen dicker.** An der Basis mindestens 3 Pixel in der 32er Fassung,
   sonst franst die Spitze zu einem grauen Punkt aus.
5. **15 Grad gegen den Uhrzeigersinn drehen**, so dass die obere linke Kralle
   die Spitze bildet. Dort setze ich den Griffpunkt, dann zeigt die Pfote
   dorthin, wo man hinklickt, wie die Spitze eines Pfeils.

### Wie du das am besten machst

Nicht neu rendern lassen. Nimm dein Bild und lass es **nachzeichnen**, also
in eine flache Vektorfassung mit drei Farben übersetzen. Prompt in die
Richtung:

> Flat vector icon of this wolf paw, three flat colours only, thick dark
> outline, no fur texture, no gradients, no shadow, tightly cropped, square,
> transparent background

Danach in einem Bildprogramm auf 64 und auf 32 herunterrechnen und die 32er
Fassung ansehen, nicht die große. Wenn dort die Krallen verschwimmen, Kontur
und Krallen von Hand nachziehen. Am saubersten wäre eine SVG-Fassung, aus der
sich beide Größen verlustfrei rechnen lassen.

---

## Variante B: Pfotenabdrücke als Spur auf der Backsteinwand

### Datei

* `pfote-spur.png`, 256 × 256 Pixel, PNG mit Transparenz

### Wie sie aussehen muss

* Ein einzelner Abdruck: Ballen unten, vier Zehen oben, aufrecht und mittig.
* **Keine Krallen**, keine Kontur, kein Schatten, kein Fell.
* **Einfarbig weiß auf transparent.** Nicht rosa. Ich benutze die Datei als
  Maske und setze die Farbe in CSS, dann nimmt die Spur das Licht der Wand an
  und leuchtet mit den Fugen mit. Eine fertig eingefärbte Pfote könnte das
  nicht.
* Rundherum etwa 8 Pixel Luft, damit die weichen Kanten beim Verkleinern
  nicht anstoßen.

---

## Und dann

Als ZIP hier hineinlegen. Ich messe die Dateien nach (Größe, Transparenz,
Randluft) und sage dir, bevor ich etwas einbaue, ob sie bei 32 Pixeln
tatsächlich lesbar sind.
