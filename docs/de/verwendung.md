# Verwendung

Wenn Du Node.js und **GDPR CLI** installiert hast, kannst Du nun endlich loslegen! Öffne dazu einfach Deine bevorzugte `terminal`-Anwendung oder die `Windows Powershell` und gebe Folgendes ein:

```bash
gdpr scan deinewebseite.de
```

Das Tool sollte die von Dir eingegebene Website scannen und Dir einige Informationen zu ihr anzeigen. Du kannst damit überprüfen, ob ein Element der Webseite Daten an nicht-europäische Server sendet, um Deine Datenschutzhinweise entsprechend anzupassen.

Für die grundlegende Verwendung von **GDPR CLI** gilt:

```bash
gdpr [befehl] [optionen] [URL]
```

## Befehle

| Befehl  | Bedeutung                                                      |
| :------ | :------------------------------------------------------------- |
| scan, s | Scan-Kommando - scannt und analysiert eine festgelegte Website |
| help    | Hilfe - **noch nicht fertig**                                  |

## Optionen

Es sind bereits einige Optionen verfügbar, um Deine Bedürfnisse zu spezifizieren.

#### Globale Optionen

| Option        | Bedeutung                                                     |
| :------------ | :------------------------------------------------------------ |
| -v, --verbose | Ausführlicher Modus - gibt einfach alles aus, was möglich ist |
| -m, --mute    | Stummer Modus - gibt nur die Ergebnisse der Analyse aus       |
| -V, --version | Version - zeigt die Version von **GDPR CLI** an               |
| -h, --help    | Hilfe - die grundlegende globale Hilfe                        |

#### Optionen für den `scan`-Befehl

| Option            | Bedeutung                                   |
| :---------------- | :------------------------------------------ |
| -f, --fonts       | Zeigt nur die Ergebnisse zu den Fonts       |
| -s, --ssl         | Zeigt nur das SSL-Zertifikat an             |
| -p, --prefetching | Zeigt nur die DNS-Prefetching-Ergebnisse an |
| -a, --analytics   | Zeigt nur die Analytics-Ergebnisse an       |

## Kombination

Du kannst viele dieser Optionen frei kombinieren. Hier ein Beispiel:

```bash
gdpr scan -vfa deinewebseite.de
```

In diesem Fall wird **GDPR CLI** im ausführlichen Modus gestartet und nur nach Fonts und Analytics-Tools scannen.
