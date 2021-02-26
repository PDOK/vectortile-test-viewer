// import style from './component-style'
import style from 'bundle-text:./component-style.css'

class FilterControl extends HTMLElement {
  constructor () {
    super()
    const _style = document.createElement('style')
    const _template = document.createElement('template')

    _style.innerHTML = `
        ${style}
        #filterControl{
            display: flex;
            position: absolute;
            bottom: 0.5em;
            left: 0.5em;
        }
        #filterCheckParent{
            border-top: solid 1px #cfd6e6;
            border-bottom: solid 1px #cfd6e6;
            display: flex;
            justify-content: center;
        }
        #filterCheck{
            margin-left: 0.5em;
            margin-right: 0.5em;
        }
        #filterControlButton{
          border-left:  solid 1px #cfd6e6;
        }
      `

    _template.innerHTML = `
        <div id="filterControl" class="parentControl">
            <input id="filterInput" class="control" type="text" placeholder="id filter" title="Kommagescheiden lijst van identificatie's, accepteert wildcard * (alleen op einde)">
            <div class="control" id="filterCheckParent">
              <input checked type="checkbox" id="filterCheck" title="Checked=include, unchecked=exclude" >
            </div>
            <button class="control" id="filterControlButton" >OK</button>
        </div>
    `

    this.shadow = this.attachShadow({ mode: 'open' })

    this.shadow.appendChild(_style)
    this.shadow.appendChild(_template.content.cloneNode(true))
  }
  getFilter () {
    return this.shadow.getElementById('filterInput').value
  }
  getFilterMode () {
    return this.shadow.getElementById('filterCheck').checked
  }
  setFilter (val) {
    val = val === undefined ? '' : val
    this.shadow.getElementById('filterInput').value = val
  }
  setFilterMode (val) {
    this.shadow.getElementById('filterCheck').checked = val
  }
  connectedCallback () {
    this.shadow.addEventListener('keydown', (event) => {
      event.stopPropagation()
    })
    this.shadow.getElementById('filterControlButton').addEventListener('click', (event) => {
      this.dispatchEvent(new CustomEvent('control-button-clicked', { bubbles: true, composed: true, detail: { id: this.id } })) // dispatch event, so that parent can loop and deselect other items
    })
    this.shadow.getElementById('filterInput').addEventListener('click', (event) => {
      event.target.focus()
    })
  }
}

export default FilterControl
