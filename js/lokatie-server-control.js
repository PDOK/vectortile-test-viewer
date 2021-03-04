import style from 'bundle-text:./component-style.css'
import 'autocompleter/autocomplete.css'

import autocomplete from 'autocompleter'
import WKT from 'ol/format/WKT'
const LOCATIE_SERVER_URL = 'https://geodata.nationaalgeoregister.nl/locatieserver/v3'

class FilterControl extends HTMLElement {
  constructor () {
    super()
    const _style = document.createElement('style')
    const _template = document.createElement('template')

    _style.innerHTML = `
        ${style}
        #locationServerControl{
            display: flex;
            position: absolute;
            bottom: 0.5em;
            right: 0.5em;
        }
        @media only screen and (max-width: 1024px) {
          #locationServerControl{
            bottom: 3em;
            left: 0.5em;
          }
        }
      
      
      `
    _template.innerHTML = `
        <div id="locationServerControl" class="parentControl">
            <input id="lsInput" class="control" type="text" placeholder="zoek in locatieserver" title="Zoek in PDOK Locatieserver">
        </div>
    `

    this.shadow = this.attachShadow({ mode: 'open' })

    this.shadow.appendChild(_style)
    this.shadow.appendChild(_template.content.cloneNode(true))

    autocomplete({
      input: this.shadow.getElementById('lsInput'),
      debounceWaitMs: 10,
      showOnFocus: true,
      fetch: function (text, update) {
        fetch(`${LOCATIE_SERVER_URL}/suggest?q=${text}`)
          .then((response) => {
            return response.json()
          })
          .then((data) => {
            const suggestions = []
            if (data.response.docs.length > 0) {
              data.response.docs.forEach(function (item) {
                const name = item.weergavenaam
                const id = item.id
                suggestions.push({ label: name, value: id })
              })
              update(suggestions)
            }
          })
      },
      customize: function (input, inputRect, container, maxHeight) {
        if (maxHeight < 100) {
          container.style.top = ''
          container.style.bottom = (window.innerHeight - inputRect.bottom + input.offsetHeight + input.clientHeight) + 'px'
          container.style.maxHeight = '200px'
        }
      },
      onSelect: (item, input) => {
        input.value = item.label
        const id = item.value
        fetch(`${LOCATIE_SERVER_URL}/lookup?id=${id}&fl=id,geometrie_ll`)
          .then((response) => {
            return response.json()
          })
          .then((data) => {
            const wktLoc = data.response.docs[0].geometrie_ll
            const format = new WKT()
            const feature = format.readFeature(wktLoc, {
              dataProjection: 'EPSG:4326',
              featureProjection: 'EPSG:3857'
            })
            const ext = feature.getGeometry().getExtent()
            this.dispatchEvent(new CustomEvent('location-selected', { bubbles: true, composed: true, detail: { extent: ext } }))
          })
      }
    })
  }
}

export default FilterControl
