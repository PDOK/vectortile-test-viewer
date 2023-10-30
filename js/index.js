
import olCssText from 'bundle-text:ol/ol.css'
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
import OverzoomControl from './overzoom-control'
import { setSearchParams, getSearchParams } from './util'

// [1]: base up until /z/x/y
// [2]: base up until and including version (if applicable, otherwise same as 1)
// [3]: version (if applicable)
// [4]: extension
const endpointRegex = /^(((?:.(?!v[0-9]+_[0-9]+))+(?:\/(v[0-9]+_[0-9]+))?).*)\/{z}\/{[xy]}\/{[yx]}([.]pbf)?$/

// add ol style css
let olStyle = document.createElement('style')
olStyle.textContent = olCssText
const head = document.head || document.getElementsByTagName('head')[0]
head.appendChild(olStyle)

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

const matrixIds = Array(15).fill().map((x, i) => i)
const resolutions = matrixIds.map(x => 3440.64 / 2 ** (x))

function getMatrixIdsVt (z = 9) {
  return Array(z + 1).fill().map((x, i) => i)
}
function getResolutionsVt (z = 9) {
  return getMatrixIdsVt(z).map(x => 3440.64 / 2 ** (x))
}

const tileBackgroundLayer = new TileLayer({
  extent: rdProjection.extent,
  source: new WMTSSource({
    url: 'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0',
    layer: 'grijs',
    matrixSet: 'EPSG:28992',
    crossOrigin: 'Anonymous',
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
    renderMode: 'hybrid',
    opacity: 0.8,
    declutter: true,
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

function getVectorTileSource (tileEndpoint) {
  let resolutions = getResolutionsVt(overzoomControl.getZoom())
  return new VectorTileSource({
    format: new MVT(),
    projection: rdProjection,
    tileGrid: new TileGrid({
      extent: rdProjection.getExtent(),
      resolutions: resolutions,
      tileSize: [256, 256],
      projection: rdProjection,
      matrixSet: 'EPSG:28992',
      origin: getTopLeft(rdProjection.getExtent())
    }),
    url: `${tileEndpoint}`,
    cacheSize: 0
  })
}

function changeTileSourceWithDefaultZoom () {
  let sourceUrl = sourceControl.getUrl()
  // retrieve url that ends with `vX_X/`, input url:
  // https://service.pdok.nl/omgevingswet/omgevingsdocumenten-demo/wmts/v1_0/locaties/EPSG:28992
  const endpointParts = endpointRegex.exec(sourceUrl)
  if (endpointParts[3] && sourceUrl.includes("wmts")) {
    let capabilitiesUrl = `${endpointParts[2]}/WMTSCapabilities.xml`
    fetch(capabilitiesUrl)
      .then((response) => {
        return response.text()
      })
      .then((text) => {
        let maxZoom = getMaxZoomCapabilities(text)
        overzoomControl.setZoom(maxZoom)
        changeTileSource()
      })
  } else {
    changeTileSource()
  }
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
  vectorTileLayer.set('renderMode', 'hybrid')
}

function zoomToTileSet () {
  let tileEndpoint = sourceControl.getUrl()
  const endpointParts = endpointRegex.exec(tileEndpoint)
  let metadataJsonUrl = `${endpointParts[1]}/metadata.json`
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

function updateStateZoom () {
  const searchParams = getSearchParams()
  const view = map.getView()
  const center = view.getCenter()
  searchParams.set('x', center[0].toString())
  searchParams.set('y', center[1].toString())
  searchParams.set('z', view.getZoom().toString())
  setSearchParams(searchParams)
}

function updateStateOverzoom (overzoom) {
  const searchParams = getSearchParams()
  searchParams.set('overzoomLevel', overzoom)
  setSearchParams(searchParams)
}

function updateStateFilter () {
  const searchParams = getSearchParams()
  let filterInclude = filterControl.getFilterMode()
  let filter = filterControl.getFilter()
  searchParams.set('filter', filter)
  searchParams.set('filterInclude', filterInclude)
  setSearchParams(searchParams)
}

function unsetFilter () {
  filterControl.setFilter('')
  filterControl.setFilterMode(true)
}

function updateStateSource (sourceName) {
  const searchParams = getSearchParams()
  searchParams.set('source', sourceName)
  setSearchParams(searchParams)
  // when changing source, reset filter query parmas, since filters are not necessarily applicable to other source/dataset
  unsetFilter()
}

function setEventListenerMap () {
  map.on('moveend', function (e) {
    updateStateZoom()
  })

  map.on('click', function (e) {
    let markup = ''
    let features = map.getFeaturesAtPixel(e.pixel, { hitTolerance: 3 })
    if (!features) {
      highlighted = null
      vectorTileLayer.changed()
      return
    }
    features.sort((a, b) => {
      const orderLookup = {
        'Polygon': 3,
        'Point': 1,
        'LineString': 2
      }
      let order1 = orderLookup[a.type_]
      let order2 = orderLookup[b.type_]
      return order1 - order2
    })

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
          let markupHr = markup && '<hr>'
          markup += `${markupHr}<div><h3>Vector Tile Object</h3><table class='gfitable'>`
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

function getMaxZoomCapabilities (xmlString) {
  let parser = new DOMParser()
  let xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  let tileMatrixSets = xmlDoc.querySelectorAll('TileMatrixSet>Identifier')
  let rdTileMatrixSet = null
  tileMatrixSets.forEach(function (tm) {
    if (tm.innerHTML === 'EPSG:28992') {
      rdTileMatrixSet = tm.parentElement
    }
  })
  let maxZoom = rdTileMatrixSet.lastElementChild.querySelector('Identifier').innerHTML
  return maxZoom
}
function sourceInputButtonChangeHandler (event) {
  event.preventDefault()
  updateStateSource(sourceControl.getName())
  changeTileSourceWithDefaultZoom()
}

function filterInputButtonClickHandler (event) {
  event.preventDefault()
  updateStateFilter()
  vectorTileLayer.setStyle(styleFunction)
}

function locationSelectedHandler (event) {
  let extentRd = transformExtent(event.detail.extent, 'EPSG:3857', rdProjection)
  map.getView().fit(extentRd, { maxZoom: 14 })
}

function overzoomChangedHandler (event) {
  updateStateOverzoom(overzoomControl.getZoom())
  changeTileSource()
}

function addVTSourceInput () {
  sourceControl.id = 'sourceControl'
  let myControl = new Control({ element: sourceControl })
  map.addControl(myControl)
  sourceControl.addEventListener('select-changed', sourceInputButtonChangeHandler, false)
  // call updateStateSource to properly init url if not set
  let searchParams = getSearchParams()
  let source = searchParams.get('source')
  if (!source) {
    updateStateSource(sourceControl.getName())
  }
}

function addFilterInput () {
  let myControl = new Control({ element: filterControl })
  map.addControl(myControl)
  filterControl.addEventListener('control-button-clicked', filterInputButtonClickHandler, false)
}

function addLsInput () {
  let myControl = new Control({ element: lsCOntrol })
  map.addControl(myControl)
  lsCOntrol.addEventListener('location-selected', locationSelectedHandler, false)
}

function addOverzoomInput (oz) {
  let myControl = new Control({ element: overzoomControl })
  map.addControl(myControl)
  if (oz) {
    overzoomControl.setZoom(oz)
  }
  overzoomControl.addEventListener('overzoom-changed', overzoomChangedHandler, false)
  updateStateOverzoom(overzoomControl.getZoom())
}

function setEventListeners () {
  setEventListenerMap()

  // deselect button
  document.getElementById('deselect').addEventListener('click', function (e) {
    highlighted = null
    vectorTileLayer.changed()
    document.getElementById('featureinfo').innerHTML = ''
  })
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
  let searchParams = getSearchParams()
  let overzoomLevel = searchParams.get('overzoomLevel')

  addOverzoomInput(overzoomLevel)
  addFilterInput()
  addLsInput()
  addVTSourceInput()

  setEventListeners()
  vectorTileLayer.setStyle(styleFunction)

  let source = searchParams.get('source')
  if (source) {
    sourceControl.setSelectedByName(source)
  }

  if (overzoomLevel) {
    changeTileSource()
  } else {
    changeTileSourceWithDefaultZoom()
  }
  if (searchParams.has('x') && searchParams.has('y') && searchParams.has('z')) {
    const center = [parseFloat(searchParams.get('x')), parseFloat(searchParams.get('y'))]
    map.getView().setCenter(center)
    const zoom = Number(searchParams.get('z'))
    map.getView().setZoom(zoom)
  } else {
    zoomToTileSet()
  }

  if (searchParams.has('source')) {
    sourceControl.setSelectedByName(searchParams.get('source'))
  }
  if (searchParams.has('filter') && searchParams.has('filterInclude')) {
    filterControl.setFilter(searchParams.get('filter'))
    let filterMode = searchParams.get('filterInclude')
    filterMode = filterMode !== 'false'
    filterControl.setFilterMode(filterMode)
  }
}

customElements.define('filter-control', FilterControl)
const filterControl = document.createElement('filter-control')
customElements.define('source-control', SourceControl)
const sourceControl = document.createElement('source-control')
customElements.define('locatieserver-control', LocationServerControl)
const lsCOntrol = document.createElement('locatieserver-control')
customElements.define('overzoom-control', OverzoomControl)
const overzoomControl = document.createElement('overzoom-control')

var highlighted
var selection
var vtSource
initApp()
