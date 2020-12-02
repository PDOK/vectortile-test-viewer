# Vector Tile Test Viewer

Test viewer voor het inspecteren van vector tile sets in RD (EPSG:28992). 

## Getting started

Na het clonen van dit repo installeer de dependencies, door volgende uit te voeren in root van directory:

```
npm install .
```

Start nu de een applicatie met:

```
npm start
```

De viewer is nu beschikbaar op [http://localhost:1234/](http://localhost:1234/).

## detected vulnerabilities with npm audit

Negeer detected vulnerability "Prototype Pollution in node-forge", [auteur van de parcel-bundler](https://github.com/parcel-bundler/parcel/issues/5145#issuecomment-693228935) is van mening dat het geen vulnerability betreft.