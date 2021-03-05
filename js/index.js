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
import TileDebug from 'ol/source/TileDebug'
import style from './style'
import FilterControl from './filter-control'
import SourceControl from './source-control'
import LocationServerControl from './locatie-server-control'

const sidebarEmptyText = 'Klik op een object voor attribuut informatie'
const selectionProperty = 'identificatie'

proj4.defs(
  'EPSG:28992',
  '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs'
)
register(proj4)
const rdProjection = new Projection({
  code: 'EPSG:28992',
  extent: [-285401.92, 22598.08, 595401.92, 903401.92]
})
const resolutions = [
  3440.64,
  1720.32,
  860.16,
  430.08,
  215.04,
  107.52,
  53.76,
  26.88,
  13.44,
  6.72
]
const matrixIds = new Array(8)
for (var i = 0; i < 15; ++i) {
  matrixIds[i] = i
}

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

const vectorTileLayer = new VectorTileLayer({
  rendermode: 'image',
  useInterimTilesOnError: false
})

// TileDebug can be used to show boundaries of tiling schema
// off by one vertically
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

const map = new Map({
  layers: [tileBackgroundLayer, vectorTileLayer, debugTLayer],
  target: 'map',
  view: new View({
    projection: rdProjection,
    center: [102618, 487217],
    zoom: 2
  })
})

function getFragementQuery () {
  if (window.location.hash) {
    return new URLSearchParams(window.location.hash.substr(1))
  }
  return new URLSearchParams()
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
    renderBuffer: 10,
    cacheSize: 0
  })
}

/* Previously updated on every mappan and zoom event, but ran into rate limit of the
  history API in firefox. So now the url is retrieved when the button is clicked.
  See https://hg.mozilla.org/mozilla-central/rev/efcefed227f304781326e7c8a52633559a79b6ad
 */
function handleMapEvents () {
  const fragQuery = getFragementQuery()
  let source = fragQuery.get('source')
  source = source !== null ? source : sourceControl.getName()
  const center = map.getView().getCenter()
  const x = center[0].toString()
  const y = center[1].toString()
  const z = map
    .getView()
    .getZoom()
    .toString()

  const filter = filterControl.getFilter()
  const filterInclude = filterControl.getFilterMode()

  const hashSearchParams = new URLSearchParams({ x, y, z, source, filter, filterInclude })
  const hashSearchParamsString = hashSearchParams.toString()
  return hashSearchParamsString
}

function initMapFromUrl () {
  const fragQuery = getFragementQuery()
  if (fragQuery && fragQuery.get('filter') && fragQuery.get('filterInclude')) {
    filterControl.setFilter(fragQuery.get('filter'))
    let filterMode = fragQuery.get('filterInclude')
    filterMode = filterMode !== 'false'
    filterControl.setFilterMode(filterMode)
  }
  if (fragQuery && fragQuery.get('source')) {
    sourceControl.setSelectedByName(fragQuery.get('source'))
  }
  changeTileSource()
  if (fragQuery && fragQuery.get('x') && fragQuery.get('y') && fragQuery.get('z')) {
    const center = [parseFloat(fragQuery.get('x')), parseFloat(fragQuery.get('y'))]
    map.getView().setCenter(center)
    const zoom = Number(fragQuery.get('z'))
    map.getView().setZoom(zoom)
  } else {
    zoomToTileSet()
  }
  window.location.hash = ``
}

function changeTileSource () {
  let tileEndpoint = sourceControl.getUrl()
  document.getElementById('featureinfo').innerHTML = sidebarEmptyText
  // document.getElementById('sourceInput').value = tileEndpoint
  selection = {}
  vtSource = getVectorTileSource(tileEndpoint)
  // set invisible to prevent unstyled flashing of vectorTileLayer
  vectorTileLayer.setVisible(false)
  vectorTileLayer.setSource(vtSource)
  vectorTileLayer.setVisible(true)
}

function zoomToTileSet () {
  let tileEndpoint = sourceControl.getUrl()
  let metadataJsonUrl = `${tileEndpoint}/metadata.json`
  fetch(metadataJsonUrl)
    .then((response) => fetchStatusHandler(response))
    .then((response) => { return response.json() })
    .then(function (data) {
      let boundsString = data.bounds.replace(']', '').replace('[', '')
      let extentString = boundsString.split(',')
      let extent = extentString.map(Number)
      if (extent.includes(NaN)) {
        return
      }
      let extentRd = transformExtent(extent, 'EPSG:4326', rdProjection)
      map.getView().fit(extentRd, { maxZoom: 11 })
    })
    .catch(function (error) {
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

function isEqual (array1, array2) {
  return (
    array1.length === array2.length &&
        array1.every((value, index) => value === array2[index])
  )
}

function setEventListenerMap () {
  map.on('click', function (e) {
    let markup = ''
    let features = map.getFeaturesAtPixel(e.pixel, { hitTolerance: 3 })
    if (!features) {
      highlighted = null
      vectorTileLayer.changed()
      return
    }
    let newSelection = []
    features.forEach(function (ft) {
      let ftId = ft.get(selectionProperty)
      let layer = ft.get('layer')
      newSelection.push(`${layer}-${ftId}`)
    })

    if (features != null && features.length > 0) {
      // copy array to sort and compare
      let selCopy = Array.from(selection).sort()
      let newSelCopy = Array.from(newSelection).sort()

      if (isEqual(selCopy, newSelCopy)) {
        // if equal increment index to highlight next feature,
        let newIndex =
                    (selection.indexOf(highlighted) % (selection.length - 1)) + 1
        highlighted = selection[newIndex]
      } else {
        highlighted = newSelection[0]
      }
      selection = newSelection
      features.forEach(function (feature) {
        let ftId = feature.get(selectionProperty)
        let layer = feature.get('layer')

        if (`${layer}-${ftId}` === highlighted) {
          let properties = feature.getProperties()
          markup += `${markup && '<hr>'
          }<div><h3>Vector Tile Object</h3><table class='gfitable'>`
          for (let property in properties) {
            markup += `<tr><th>${property}</th><td>${properties[property]}</td></tr>`
          }
          markup += '</table>'
        }
      })
    }
    if (markup === '') {
      markup = sidebarEmptyText
    }
    document.getElementById('featureinfo').innerHTML = markup
    vectorTileLayer.changed()
  })
}

function sourceInputButtonClickHandler (event) {
  event.preventDefault()
  changeTileSource()
}

function filterInputButtonClickHandler (event) {
  event.preventDefault()
  vectorTileLayer.setStyle(styleFunction)
}

function locationSelectedHandler (event) {
  let extentRd = transformExtent(event.detail.extent, 'EPSG:3857', rdProjection)
  map.getView().fit(extentRd, { maxZoom: 9 })
}

function addVTSourceInput () {
  sourceControl.id = 'sourceControl'
  let myControl = new Control({ element: sourceControl })
  map.addControl(myControl)
  sourceControl.addEventListener('select-changed', sourceInputButtonClickHandler, false)
}

function addFilterInput () {
  let myControl = new Control({ element: filterControl })
  map.addControl(myControl)
  filterControl.addEventListener('select-changed', filterInputButtonClickHandler, false)
}

function addLsInput () {
  let myControl = new Control({ element: lsCOntrol })
  map.addControl(myControl)
  lsCOntrol.addEventListener('location-selected', locationSelectedHandler, false)
}

function setEventListeners () {
  setEventListenerMap()

  // deselect button
  document.getElementById('deselect').addEventListener('click', function (e) {
    highlighted = null
    vectorTileLayer.changed()
    document.getElementById('featureinfo').innerHTML = ''
  })

  // copy url button
  document.getElementById('copyUrl').addEventListener('click', function (e) {
    let hash = handleMapEvents()
    let sharableUrl = `${window.location.href}${hash}`
    navigator.clipboard.writeText(sharableUrl).then(function () {
      let prevColor = e.target.style.color
      e.target.style.color = 'green'
      setTimeout(x => { e.target.style.color = prevColor }, 300)
    }, function (err) {
      alert('Async: Could not copy text: ', err)
    })
  }, false)
}

function styleFunction (feature, resolution) {
  let geomType = feature.getType().toLowerCase()
  let filterString = filterControl.getFilter()
  let filterMode = filterControl.getFilterMode()
  let ftId = feature.get(selectionProperty)
  let filters = filterString !== '' ? filterString.split(',') : []
  filters = filters.map(x => x.trim())
  if (filters.length > 0) {
    let includes = false
    filters.some(filter => {
      if (filter.includes('*')) {
        let regexResult = new RegExp('^' + filter.replace(/\*/g, '.*') + '$').test(ftId)
        if (regexResult) includes = regexResult
        return regexResult
      } else {
        let compareResult = (ftId === filter)
        if (compareResult) includes = compareResult
        return compareResult
      }
    })
    let filterResult = false
    if (includes) {
      filterResult = filterMode
    } else {
      filterResult = !filterMode
    }
    if (!filterResult) {
      return
    }
  }
  let layer = feature.get('layer')
  let selected = `${layer}-${ftId}` === highlighted
  return style.getStyleByGeomType(geomType, selected)
}

function initApp () {
  addVTSourceInput()
  addFilterInput()
  addLsInput()
  setEventListeners()
  vectorTileLayer.setStyle(styleFunction)
  initMapFromUrl()
}

customElements.define('filter-control', FilterControl)
const filterControl = document.createElement('filter-control')
customElements.define('source-control', SourceControl)
const sourceControl = document.createElement('source-control')
customElements.define('locatieserver-control', LocationServerControl)
const lsCOntrol = document.createElement('locatieserver-control')

var highlighted
var selection
var vtSource
initApp()
