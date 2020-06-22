import 'normalize.css'
import 'ol/ol.css'
import { Map, View } from 'ol'
import MVT from 'ol/format/MVT.js'
import VectorTileLayer from 'ol/layer/VectorTile.js'
import VectorTileSource from 'ol/source/VectorTile.js'
import WMTSSource from 'ol/source/WMTS'
import TileLayer from 'ol/layer/Tile.js'
import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
import Projection from 'ol/proj/Projection'
import { register } from 'ol/proj/proj4.js'
import { getTopLeft } from 'ol/extent.js'
import proj4 from 'proj4'
import TileGrid from 'ol/tilegrid/TileGrid'
import { transformExtent } from 'ol/proj.js'
import { Control } from 'ol/control.js'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, Stroke, Style } from 'ol/style'

// TileDebug can be used to show boundaries of tiling schema
import TileDebug from 'ol/source/TileDebug'

// set api endpoint based on build env (debug -> .env, production -> .env.production)
const sidebarEmptyText = 'Klik op een object voor attribuut informatie'
const selectionProperty = 'identificatie'

// global vars
var controller = new AbortController()
var signal = controller.signal
var selection = {}

// initialize ol objects
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')
register(proj4)
const rdProjection = new Projection({
  code: 'EPSG:28992',
  extent: [-285401.92, 22598.08, 595401.92, 903401.92]
})
const resolutions = [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420, 0.210]
const matrixIds = new Array(15)
for (var i = 0; i < 15; ++i) {
  matrixIds[i] = i
}
let polStyle = new Style({
  stroke: new Stroke({
    color: 'blue',
    width: 1
  }),
  fill: new Fill(
    { color: 'rgba(255, 255, 0, 0.05)' }
  )
})
const tileBackgroundLayer = new TileLayer({
  extent: rdProjection.extent,
  source: new WMTSSource({
    url: 'https://geodata.nationaalgeoregister.nl/tiles/service/wmts',
    layer: 'brtachtergrondkaartgrijs',
    matrixSet: 'EPSG:28992',
    format: 'image/png',
    projection: rdProjection,
    tileGrid: new WMTSTileGrid({
      origin: getTopLeft(rdProjection.getExtent()),
      resolutions: resolutions,
      matrixIds: matrixIds
    }),
    style: 'default'
  })
})

const vectorTileLayer = new VectorTileLayer(
  {
    rendermode: 'image',
    style: polStyle
  }
)

// TileDebug can be used to show boundaries of tiling schema
const debugTLayer = new TileLayer({
  source: new TileDebug({
    projection: rdProjection,
    tileGrid: new TileGrid({
      extent: rdProjection.getExtent(),
      resolutions: resolutions,
      tileSize: [256, 256],
      projection: rdProjection,
      matrixSet: 'EPSG:28992',
      origin: getTopLeft(rdProjection.getExtent())
    })
  })
})
const bboxSource = new VectorSource()
const bboxLayer = new VectorLayer({ style: polStyle, source: bboxSource })

const map = new Map({
  layers: [
    tileBackgroundLayer,
    vectorTileLayer,
    debugTLayer,
    bboxLayer
  ],
  target: 'map',
  view: new View({
    projection: rdProjection,
    center: [102618, 487217],
    zoom: 2
  })
})

function zoomToTileSet (map, bounds) {
  let boundsString = bounds.replace(']', '').replace('[', '')
  let extentString = boundsString.split(',')
  let extent = extentString.map(Number)
  if (extent.includes(NaN)) {
    // silently ignore if extent cannot be read
    return
  }
  let extentRd = transformExtent(extent, 'EPSG:4326', rdProjection)
  map.getView().fit(extentRd, { maxZoom: 11 })
}

function getVTSource () {
  let vtSource = window.location.hash
  if (vtSource === null) { return '' }
  vtSource = vtSource.substr(1)
  return vtSource
}

function setTileEndpoint (endpoint) {
  window.location.hash = endpoint
}

function getVectorTileSource (tileEndpoint) {
  return new VectorTileSource({
    format: new MVT(),
    tileGrid: new TileGrid({
      extent: rdProjection.getExtent(),
      resolutions: resolutions,
      tileSize: [256, 256],
      projection: rdProjection,
      matrixSet: 'EPSG:28992',
      origin: getTopLeft(rdProjection.getExtent())
    }),
    tilePixelRatio: 16,
    url: `${tileEndpoint}/{z}/{x}/{y}.pbf`,
    renderBuffer: 10
  })
}

function changeTileSource (tileEndpoint) {
  document.getElementById('featureinfo').innerHTML = sidebarEmptyText
  document.getElementById('sourceInput').value = tileEndpoint
  selection = {}
  let vtSource = getVectorTileSource(tileEndpoint)
  // set invisible to prevent unstyled flasing of vectorTileLayer
  vectorTileLayer.setVisible(false)
  vectorTileLayer.setSource(vtSource)
  vectorTileLayer.setVisible(true)

  // abort (long) running ajax requests
  controller.abort()
  // refresh abortcontroller
  controller = new AbortController()
  signal = controller.signal
  // retrieve metadata/capabilities for selected tileset
  let metadataJsonUrl = `${tileEndpoint}/metadata.json`
  let request = new Request(metadataJsonUrl)
  fetch(request, {
    signal
  })
    .then(fetchStatusHandler)
    .then(response => response.json())
    .then(function (data) {
      zoomToTileSet(map, data.bounds)
      setTileEndpoint(tileEndpoint)
    }).catch(function (error) {
      console.log(error)
    })
}

function fetchStatusHandler (response) {
  if (response.status === 200) {
    return response
  } else {
    let message = `<p class='error'>${response.url} returned HTTP ${response.status}</p>`
    document.getElementById('tileSetError').innerHTML = message
  }
}

function setEventListenerMap () {
  map.on('click', function (e) {
    let markup = ''
    let features = map.getFeaturesAtPixel(e.pixel, { hitTolerance: 3 })
    let getSecondFeature = (Object.keys(selection).length > 0)
    selection = {}
    if (features != null && features.length > 0) {
      let feature = (getSecondFeature && features.length > 1) ? features[1] : features[0]
      let featureId = feature.get(selectionProperty)
      // add selected feature to lookup
      selection[featureId] = feature
      features.forEach(function (feature) {
        let properties = feature.getProperties()
        markup += `${markup && '<hr>'}<div><h3>Vector Tile Object</h3><table class='gfitable'>`
        for (let property in properties) {
          markup += `<tr><th>${property}</th><td>${properties[property]}</td></tr>`
        }
        markup += '</table>'
      })
    }
    if (markup === '') {
      markup = sidebarEmptyText
    }
    document.getElementById('featureinfo').innerHTML = markup
    vectorTileLayer.changed()
  })
}

function changesourceInput () {
  const sourceInput = document.getElementById('sourceInput')
  let sourceInputText = sourceInput.value
  if (sourceInputText !== '') {
    changeTileSource(sourceInputText)
  }
}
function setEventListenersourceInputButton () {
  const sourceButton = document.getElementById('sourceInputButton')
  sourceButton.addEventListener('click', function (event) {
    event.preventDefault()
    changesourceInput()
  }, false)
}

function toggleElements () {
  let headingEl = document.getElementById('heading')
  let sidebarEl = document.getElementById('sidebar')
  let btnEl = document.getElementById('btnAppOpen')
  if (window.innerWidth < 640) {
    headingEl.style.display = 'none'
    sidebarEl.style.display = 'none'
    btnEl.style.display = 'block'
  } else {
    headingEl.style.display = 'block'
    sidebarEl.style.display = 'flex'
    btnEl.style.display = 'none'
  }
  let contentEl = document.getElementById('content')
  contentEl.style.display = 'none'
  // eslint-disable-next-line no-unused-expressions
  contentEl.offsetHeight
  contentEl.style.display = 'block'
}

function resizeApp () {
  let mapEl = document.getElementById('map')
  if (mapEl.style.display === 'none') {
    toggleSidebar()
  }
  toggleElements()
  let headingEl = document.getElementById('heading')
  let sidebarEl = document.getElementById('sidebar')
  let mapWrapperEl = document.getElementById('mapwrapper')
  let styleHeading = window.getComputedStyle(headingEl)
  let headingElHeight = parseInt(styleHeading.height.replace('px', ''))
  let mapHeight

  if (window.innerWidth < 640) {
    mapHeight = window.innerHeight
    mapWrapperEl.style.padding = '0px'
    sidebarEl.style.marginLeft = '0px'
  } else {
    mapHeight = window.innerHeight - headingElHeight
    mapWrapperEl.style.padding = '5px'
    sidebarEl.style.marginLeft = '5px'
  }
  mapWrapperEl.style.height = `${mapHeight}px`
  var siteHeader = document.getElementById('content')
  map.updateSize()
  siteHeader.style.display = 'none'
  // eslint-disable-next-line no-unused-expressions
  siteHeader.offsetHeight
  siteHeader.style.display = 'block'
}

function addControl () {
  let button = document.createElement('button')
  button.innerHTML = '&lt'
  let myElement = document.createElement('div')
  myElement.className = 'ol-control'
  myElement.id = 'btnAppOpen'
  myElement.appendChild(button)
  let myControl = new Control({ element: myElement })
  map.addControl(myControl)
}

function addVTSourceInput () {
  let parent = document.createElement('div')
  let input = document.createElement('input')
  let button = document.createElement('button')
  parent.id = 'sourceControl'
  button.innerText = 'OK'
  button.id = 'sourceInputButton'
  input.placeholder = 'tile endpoint'
  input.id = 'sourceInput'
  input.type = 'text'
  input.autocomplete = 'off'
  parent.appendChild(input)
  parent.appendChild(button)
  let myControl = new Control({ element: parent })
  map.addControl(myControl)
}

function toggleSidebar () {
  let sidebarEl = document.getElementById('sidebar')
  let mapEl = document.getElementById('map')
  let btnClose = document.getElementById('btnAppCloseWrapper')
  if (sidebarEl.style.display === 'none') {
    sidebarEl.style.display = 'flex'
    mapEl.style.display = 'none'
    btnClose.style.display = 'inline-block'
    sidebarEl.style.maxWidth = 'unset'
  } else {
    btnClose.style.display = 'none'
    sidebarEl.style.display = 'none'
    mapEl.style.display = 'block'
    sidebarEl.style.maxWidth = '20em'
  }
}

function setEventListenerAppButton () {
  let btnApp = document.getElementById('btnAppOpen')
  let btnAppClose = document.getElementById('btnAppClose')
  btnApp.addEventListener('click', toggleSidebar, false)
  btnAppClose.addEventListener('click', toggleSidebar, false)
}

function setEventListeners () {
  window.addEventListener('resize', resizeApp)
  setEventListenerMap()
  setEventListenersourceInputButton()
  setEventListenerAppButton()
}

function initApp () {
  addControl()
  addVTSourceInput()
  resizeApp()
  setEventListeners()
  let vtSource = getVTSource()
  if (vtSource !== '') {
    changeTileSource(vtSource)
  }
}

initApp()
