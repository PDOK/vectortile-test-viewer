const defaultServiceEndpoints = [
  { 'name': 'omgevingswet-acceptatie', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-acc/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-demo', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-demo/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-pre', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-pre/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-prod', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'omgevingswet-preprod', 'url': 'https://service.pdok.nl/omgevingswet/omgevingsdocumenten-preprod/wmts/v1_0/locaties/EPSG:28992/{z}/{x}/{y}.pbf' },
  { 'name': 'bgt-demo', 'url': 'https://api.pdok.nl/lv/bgt/oat/v1_0-preprod/tiles/EPSG:28992/{z}/{x}/{y}' }
]

const serviceEndpointsPlaceHolder = "_RUNTIME_SERVICE_ENDPOINTS"
const serviceEndpointsJson = process.env.SERVICE_ENDPOINTS
const serviceEndpoints = (serviceEndpointsJson && serviceEndpointsJson !== serviceEndpointsPlaceHolder)
  ? JSON.parse(serviceEndpointsJson)
  : defaultServiceEndpoints

export default serviceEndpoints
