import runtimeConfig from "./runtime-config";

const defaultServiceEndpoints = [
  { 'name': 'omgevingswet-acceptatie', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-acc/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-demo', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-demo/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-pre', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-pre/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-prod', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-ketenprf', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-ketenprf/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-ketenacc', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-ketenacc/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-acceptatie-totaal', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-totaal-acc/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-demo-totaal', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-totaal-demo/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-pre-totaal', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-totaal-pre/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-prod-totaal', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-totaal/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-ketenprf-totaal', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-totaal-ketenprf/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-ketenacc-totaal', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-totaal-ketenacc/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-preprod', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten/wmts/v1_0-preprod/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'bgt-demo', 'url': 'https://api.pdok.nl/lv/bgt/ogc/v1_0/tiles/NetherlandsRDNewQuad/{z}/{x}/{y}.pbf' },
  { 'name': 'trex-perf-demo', 'url': 'https://service.pdok.nl/trex-perf-eric/bgt/{z}/{x}/{y}.pbf' }
]

const serviceEndpoints = runtimeConfig.serviceEndpoints || defaultServiceEndpoints
export default serviceEndpoints
