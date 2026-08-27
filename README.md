# Bildungscampus Infodisplay

Kiosk-Webapp für Infoscreens am [Bildungscampus Heilbronn](https://bildungscampus.hn): Wetter, Mensaplan und Veranstaltungen im Vollbild, skaliert auf jede Auflösung.

## Funktionen

- Layout 1920×1080, mittig skaliert (`contain`) auf jeden Bildschirm
- Karussell: Mensa (heute) und Veranstaltungen, Wechsel alle 12 Sekunden
- Wetterleiste (3 Tage) plus Live-Uhr (Europe/Berlin)
- Server-Proxys `/api/weather`, `/api/mensa`, `/api/events` — der API-Key bleibt serverseitig
- Fallback auf Mock-Daten, wenn Upstream fehlt oder der Key nicht gesetzt ist
- Docker-Stack hinter Caddy, ohne Root im App-Container

## Voraussetzungen

- Node.js 22
- Optional: Docker + Docker Compose

## Lokal starten

```bash
npm ci
cp .env.example .env.local
# SMARTCITY_API_KEY in .env.local eintragen (nicht committen)
npm run dev
```

Die App läuft unter `http://localhost:3000` (oder dem nächsten freien Port).

## Docker

```bash
cp .env.example .env
# Key und ggf. Ports setzen, z. B. CADDY_HTTP_PORT=8080
docker compose up --build -d
```

Standardmäßig bindet Caddy Host-Port 80/443. Wenn die Ports belegt sind:

```bash
CADDY_HTTP_PORT=8080 CADDY_HTTPS_PORT=8443 docker compose up --build -d
```

Aufruf dann: `http://localhost:8080`

## Umgebungsvariablen

Nur in `.env` / `.env.local`, nie ins Image oder ins Git. Vorlage: [`.env.example`](.env.example)

| Variable | Pflicht | Beschreibung |
| --- | --- | --- |
| `SMARTCITY_API_KEY` | für Campus-Wetter/Mensa | Key aus der [Smart City Data Library](https://data-library.smartcity.hn) (My apps), Header `x-apikey` |
| `SMARTCITY_CLIENT_ID` | nein | Alias für denselben Key |
| `SMARTCITY_WEATHER_URL` | nein | Override, nur Host `apis.smartcity.hn` |
| `SMARTCITY_THM_URL` | nein | Override, nur Host `apis.smartcity.hn` |
| `SMARTCITY_MENSA_URL` | nein | Override, nur Host `apis.smartcity.hn` |
| `CADDY_HTTP_PORT` | nein | Host-Port für HTTP (Default `80`) |
| `CADDY_HTTPS_PORT` | nein | Host-Port für HTTPS (Default `443`) |

Ohne Key: Wetter über Open-Meteo, Mensa über OpenMensa (Canteen 277), Veranstaltungen als Mock.

## Sicherheit

- Secrets nicht in die Dockerfile-`ENV` schreiben
- App-Container: Non-Root (`node`), `read_only`, `cap_drop: ALL`, `no-new-privileges`
- Nur Caddy veröffentlicht Ports; Next.js hängt im internen `proxy_network`
- `npm audit` und Trivy-Scan in [`.github/workflows/security.yml`](.github/workflows/security.yml)

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Caddy · Docker
