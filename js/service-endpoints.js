import runtimeConfig from "./runtime-config";

const defaultServiceEndpoints = [
  { 'name': 'demo-actueel', 'url': 'https://api.pdok.nl/omgevingswet/omgevingsdocumenten/ogc/v2_0/collections/demo-actueel/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf'},
  { 'name': 'demo-volledig', 'url': 'https://api.pdok.nl/omgevingswet/omgevingsdocumenten/ogc/v2_0/collections/demo-volledig/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf'},
  { 'name': 'ketenacceptatie-actueel', 'url': 'https://api.pdok.nl/omgevingswet/omgevingsdocumenten/ogc/v2_0/collections/ketenacceptatie-actueel/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf'},
  { 'name': 'ketenacceptatie-volledig', 'url': 'https://api.pdok.nl/omgevingswet/omgevingsdocumenten/ogc/v2_0/collections/ketenacceptatie-volledig/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf'},
  { 'name': 'leverancierstest-actueel', 'url': 'https://api.pdok.nl/omgevingswet/omgevingsdocumenten/ogc/v2_0/collections/leverancierstest-actueel/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf'},
  { 'name': 'leverancierstest-volledig', 'url': 'https://api.pdok.nl/omgevingswet/omgevingsdocumenten/ogc/v2_0/collections/leverancierstest-volledig/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf'},
  { 'name': 'ketenperformance-actueel', 'url': 'https://api.pdok.nl/omgevingswet/omgevingsdocumenten/ogc/v2_0/collections/ketenperformance-actueel/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf'},
  { 'name': 'ketenperformance-volledig', 'url': 'https://api.pdok.nl/omgevingswet/omgevingsdocumenten/ogc/v2_0/collections/ketenperformance-volledig/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf'},
  { 'name': 'preproductie-actueel', 'url': 'https://api.pdok.nl/omgevingswet/omgevingsdocumenten/ogc/v2_0/collections/preproductie-actueel/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf'},
  { 'name': 'preproductie-volledig', 'url': 'https://api.pdok.nl/omgevingswet/omgevingsdocumenten/ogc/v2_0/collections/preproductie-volledig/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf'},
  { 'name': 'productie-actueel', 'url': 'https://api.pdok.nl/omgevingswet/omgevingsdocumenten/ogc/v2_0/collections/productie-actueel/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf'},
  { 'name': 'productie-volledig', 'url': 'https://api.pdok.nl/omgevingswet/omgevingsdocumenten/ogc/v2_0/collections/productie-volledig/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf'},
  { 'name': '(old) omgevingswet-demo', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-demo/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': '(old) omgevingswet-pre', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-pre/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': '(old) omgevingswet-prod', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': '(old) omgevingswet-ketenprf', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-ketenprf/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': '(old) omgevingswet-ketenacc', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-ketenacc/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': '(old) omgevingswet-demo-totaal', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-totaal-demo/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': '(old) omgevingswet-pre-totaal', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-totaal-pre/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': '(old) omgevingswet-prod-totaal', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-totaal/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': '(old) omgevingswet-ketenprf-totaal', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-totaal-ketenprf/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': '(old) omgevingswet-ketenacc-totaal', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-totaal-ketenacc/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': '(old) omgevingswet-preprod', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten/wmts/v1_0-preprod/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'bgt v1.0', 'url': 'https://api.pdok.nl/lv/bgt/ogc/v1_0/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}.pbf' },
]

const serviceEndpoints = runtimeConfig.serviceEndpoints || defaultServiceEndpoints
export default serviceEndpoints
