# Voraussetzungen

Diese Software basiert auf Node.js, daher ist es zwingend erforderlich, dass `node` und ein Paket-Manager wie `npm` oder `yarn` installiert ist. Wenn dies noch nicht der Fall ist, folge bitte diesen Anweisungen.

## Installieren von Node.js

Node.js ist eine JavaScript-Laufzeitumgebung, die auf der V8-Engine von Google Chrome basiert. Da **GDPR CLI** in JavaScript geschrieben ist, wird diese Software vorausgesetzt.

Um sie herunterzuladen, besuche bitte [nodejs.org](https://nodejs.org/en/). Du kannst entweder den LTS oder die aktuelle Version wählen. Klicke einfach auf eine der beiden Schaltflächen auf der Startseite. Damit solltest Du die richtige Version für Dein Betriebssystem erhalten.

### Windows

!> Node.js benötigt Windows 7 oder höher. Wenn Du noch immer eine ältere Version von Windows verwendest, aktualisiere zuerst Dein Betriebssystem.

Um Node.js zu installieren, musst Du lediglich die zuvor heruntergeladene Datei öffnen und den Anweisungen des Installationsprogramms folgen. Sobald dies abgeschlossen ist, suche nach der `Windows Powershell` und öffne dieses Programm.

### macOS

Um Node.js auf macOS zu installieren, musst Du lediglich die zuvor heruntergeladene Datei öffnen und den Anweisungen des Installationsprogramms folgen. Sobald dies abgeschlossen ist, suche nach der Anwendung `terminal` und öffne sie.

?> Wenn Du `homebrew` installiert hast, gib stattdessen `brew install node` in Deine Kommandozeile ein.

### Linux

Um Node.js unter Linux zu installieren, musst Du lediglich die zuvor heruntergeladene Datei öffnen und den Anweisungen des Installationsprogramms folgen. Sobald dies abgeschlossen ist, öffne einfach Deine bevorzugte `terminal`-Anwendung.

?> Wenn ein Installationsprogramm oder eine Binärdatei für Deine Linux-Distrobution nicht verfügbar ist, kannst Du stattdessen einen Paket-Manager verwenden. Bitte lese dazu diese [detaillierten Anweisungen](https://nodejs.org/en/download/package-manager/)!

## Überprüfung der Installation

Unabhängig davon, welches Betriebssystem Du verwendest, solltest Du immer überprüfen, ob Node.js korrekt installiert ist. Öffne dazu einfach Deine `Windows PowerShell` oder `terminal`-Anwendung und gebe die folgenden Befehle ein:

```bash
node -v
```

```bash
npm -v
```

Wenn beide Kommandos eine Versionsnummer anzeigen, ist alles in Ordnung und Du hast Node.js erfolgreich installiert!

## Fehlerbehebung

**node: command not found**

Unter Mac OS und Linux ist es möglich, dass Du manuell die $PATH-Variable in Deiner Shell-Konfigurationsdatei erweitern musst. Um zu überprüfen, ob diese Variable unvollständig ist, gib bitte den folgenden Befehl im `terminal` ein:

```bash
echo $PATH | grep -c /usr/local/bin
```

Wenn dies eine `0` ausgibt, kannst Du dies mit dem folgenden Kommando beheben:

```bash
echo "export PATH=$PATH:/usr/local/git/bin:/usr/local/bin" >> ~/.bashrc
```

Und schon bist Du fertig!

!> Wenn Du eine andere Shell wie etwa `zsh` verwendst, solltest Du diesen Befehl entsprechend anpassen.
