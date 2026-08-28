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

## Ideen, die wir verworfen haben (damit sie nicht zweimal kommen)

* Pfote als Mauszeiger. Verworfen am 28.08., "die neue pfote sieht doof aus".
  Brief dazu steht in der Historie, Commit a937f0a.
