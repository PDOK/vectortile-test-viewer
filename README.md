# Vector Tile Test Viewer - voor omgevingswet

Test viewer voor het inspecteren van vector tile sets in RD (EPSG:28992).

## Getting started

Installeer NPM (aangeraden wordt om v6.14.15 te gebruiken, die meegeleverd wordt met de huidige LTS release van Node.js v14.18.1). 

Na het clonen van dit repo installeer de dependencies, door volgende uit te voeren in root van directory:

```npm
npm install .
```

Start de een applicatie met:

```npm
npm start
```

De viewer is nu beschikbaar op [http://localhost:1234/](http://localhost:1234/).

## Tiles serveren lokaal

Het volgende script kan gebruikt worden om vectortile-sets lokaal uit te serveren:

<https://gist.github.com/arbakker/6cc78304be9fd1b2c1dc251e877b918c>

## Docker

```
docker run -p 8080:80 -e RUNTIME_CONFIG='{"serviceEndpoints": [{"name": "my", "url": "http://host/tiles/{z}/{x}/{y}.pbf"}]}' pdok/vectortile-test-viewer
```
