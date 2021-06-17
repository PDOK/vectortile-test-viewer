# Vector Tile Test Viewer - voor omgevingswet

Test viewer voor het inspecteren van vector tile sets in RD (EPSG:28992).

## Getting started

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

## detected vulnerabilities with npm audit

De vulnerability "Prototype Pollution in node-forge" die met `npm audit` wordt gedetecteerd kan geneerd worden. De [auteur van de parcel-bundler](https://github.com/parcel-bundler/parcel/issues/5145#issuecomment-693228935) is van mening dat het geen vulnerability betreft.
