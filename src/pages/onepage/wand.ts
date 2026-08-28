/**
 * Die Bausteine der angedeuteten Backsteinwand.
 *
 * Liegt seit dem 28.08. hier und nicht mehr in OnePage.tsx, weil die
 * Handy-Fassung dieselbe Wand bekommt. Zwei Kopien derselben Zeichnung waeren
 * die sicherste Art, die beiden Fassungen auseinanderlaufen zu lassen.
 */
/**
 * Die angedeutete Backsteinwand hinter der Projektion in 04.
 *
 * Wolf am 28.08.: "die idee waere eine angedeutete backsteinwand im creme
 * farben hinter der beamer view (angedeutet) die leicht satisfying schimmer,
 * sie hat die gleiche neigung wie die beamer view" und praezisiert: "nur die
 * LINIEN zwischen den backsteinen sollen angedeutet sichtbar sein, der bg muss
 * zwischendrin durchkommen".
 *
 * Also keine gefuellten Steine, nur die Fugen: Haarlinien in Creme, sehr
 * schwach, und dazwischen der Seitengrund. Das ist auch der Grund, warum die
 * Idee hier funktioniert und ein Foto nicht wuerde -- gezeichnete Fugen sind
 * eine Zeichnung, ein Ziegelfoto waere ein behaupteter Raum, und genau den
 * haben wir mit den KI-Bildern rausgeworfen.
 *
 * Als SVG im Datenpfad und nicht als Bilddatei: rund 400 Byte, kein zweiter
 * Aufruf, bei jeder Groesse scharf, und der Laeuferverband (jede zweite Reihe
 * um einen halben Stein versetzt) laesst sich damit exakt zeichnen. Mit zwei
 * CSS-Verlaeufen ginge das nicht: die geben ein Gitter, keinen Verband.
 *
 * Format 3 zu 1, also 180 zu 60 -- das ist das Verhaeltnis eines echten
 * Ziegels samt Fuge (rund 225 zu 75 mm).
 */
export const WAND_FUGEN = 'data:image/svg+xml,'
  + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="120">'
    + '<g stroke="rgb(246,239,230)" stroke-width="1.4" fill="none" stroke-linecap="square">'
    // Die zwei Lagerfugen, waagerecht
    + '<path d="M0 .7H360M0 60.7H360"/>'
    // Stossfugen der unteren Reihe, und der oberen um einen halben Stein versetzt
    + '<path d="M.7 0V60M180.7 0V60"/>'
    + '<path d="M90.7 60V120M270.7 60V120"/>'
    + '</g></svg>');

/**
 * Der Rand der Wand.
 *
 * Wolf am 28.08.: "die raender sind immernoch zu gerade, die sollen ausfaden,
 * aber auch nicht ueberall gleich sondern so etwas hmm ungleich, dass es
 * dynamischer wirkt" und "ziegelsteine an den raendern wirken wie harter cut".
 *
 * Vorher lag die Grenze in zwei linearen Verlaeufen plus einer Ellipse. Das
 * ergibt eine gleichmaessige Form, und gleichmaessig heisst hier: gebaut. Eine
 * Wand, die im Dunkeln verschwindet, verschwindet nicht in einer Ellipse.
 *
 * Jetzt ist die Grenze eine Wolke aus acht weichen Ellipsen. Ihre Vereinigung
 * hat keine Achse und keine Mitte, an der man sie festmachen koennte, und sie
 * laeuft an jeder Stelle unterschiedlich weit -- oben kuerzer, links weiter.
 * Als SVG und nicht als CSS-Verlauf, weil sich acht Formen in einer einzigen
 * Maskenebene nur so vereinigen lassen; mit acht CSS-Ebenen muesste man sie
 * ueber mask-composite verrechnen, und das ist zwischen den Browsern das
 * Wackeligste, was es in diesem Bereich gibt.
 */
export const WAND_RAND = 'data:image/svg+xml,'
  + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">'
    + '<defs><radialGradient id="w">'
    + '<stop offset="0" stop-color="#fff"/>'
    + '<stop offset=".52" stop-color="#fff" stop-opacity=".82"/>'
    + '<stop offset="1" stop-color="#fff" stop-opacity="0"/>'
    + '</radialGradient></defs>'
    + '<g fill="url(#w)">'
    + '<ellipse cx="49" cy="51" rx="44" ry="41"/>'
    + '<ellipse cx="17" cy="45" rx="23" ry="27"/>'
    + '<ellipse cx="85" cy="55" rx="20" ry="23"/>'
    + '<ellipse cx="35" cy="17" rx="27" ry="16"/>'
    + '<ellipse cx="69" cy="83" rx="25" ry="15"/>'
    + '<ellipse cx="77" cy="23" rx="18" ry="13"/>'
    + '<ellipse cx="25" cy="81" rx="21" ry="16"/>'
    + '<ellipse cx="58" cy="38" rx="30" ry="24"/>'
    + '</g></svg>');

/**
 * Helligkeit je Ziegel.
 *
 * Zweiter Teil derselben Beobachtung: am Rand sahen die Steine aus wie
 * abgeschnitten. Der Grund ist, dass eine weiche Kante eine LINIE der Laenge
 * nach ausblendet -- die Fuge wird auf halbem Weg blass, und eine Fuge, die in
 * der Mitte aufhoert, ist ein Schnitt.
 *
 * Also blendet jetzt nicht die Kante, sondern der Stein. Diese Kachel legt
 * ueber jedes Ziegelfeld (108 auf 36 Pixel, das Raster der Fugen) einen
 * eigenen, konstanten Wert. Innerhalb eines Steins ist die Helligkeit damit
 * ueberall gleich, seine Fugen enden also mit ihm und nicht irgendwo in der
 * Luft. Nach aussen loescht die Wolke ganze Steine, keine Linienstuecke:
 * "abgeschlossene Ziegel".
 *
 * Der zweite Zweck ist der, den Wolf mit "dynamischer" meint: auch mitten in
 * der Flaeche ist nicht jeder Stein gleich hell, so wie an einer echten Wand.
 * Fuenf mal sechs Felder, damit sich die Folge nicht sichtbar wiederholt.
 */
export const WAND_HELL = [
  [.78, 1, .62, .88, .70],
  [.95, .66, .84, .58, 1],
  [.60, .86, 1, .72, .80],
  [.90, .74, .56, .98, .64],
  [.68, 1, .82, .60, .92],
  [.86, .58, .96, .76, .70],
];
export const WAND_STEINE = 'data:image/svg+xml,'
  + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="540" height="216">'
    + WAND_HELL.map((zeile, y) => zeile.map((a, x) =>
      `<rect x="${x * 108}" y="${y * 36}" width="108" height="36" fill="#fff" opacity="${a}"/>`).join('')).join('')
    + '</svg>');

