import style from 'bundle-text:./component-style.css'

class OverzoomControl extends HTMLElement {
  constructor () {
    super()
    const _style = document.createElement('style')
    const _template = document.createElement('template')
    let dataListString = ''
    Array(15).fill().map((x, i) => i).forEach(x => {
      let selString = x === 9 ? 'selected' : ''
      dataListString = dataListString.concat(`<option ${selString} value="${x}">${x}</option>`)
    })
    _style.innerHTML = `
        ${style}
        #overzoomControl{
            display: flex;
            position: absolute;
            top: 0.2em;
            right: 0.2em;
        }
        #overzoomControlButton{
          border-left:  solid 1px #cfd6e6;
        }
      `
    _template.innerHTML = `
        <div id="overzoomControl" class="parentControl">

        <select  id="overzoomInput" title="Overzoom from zoomlevel">
            ${dataListString}
            </select>
        </div>
    `

    this.shadow = this.attachShadow({ mode: 'open' })
    this.shadow.appendChild(_style)
    this.shadow.appendChild(_template.content.cloneNode(true))

    this.checkEvent = new CustomEvent('check', {
      bubbles: true,
      cancelable: false
    })
  }
  getZoom () {
    return parseInt(this.shadow.getElementById('overzoomInput').value)
  }

  setZoom (z) {
    let sel = this.shadow.getElementById('overzoomInput')
    let selector = `option[value="${z}"]`
    sel.querySelector(selector).selected = true
  }

  connectedCallback () {
    this.shadow.getElementById('overzoomInput').addEventListener('change', (event) => {
      let val = event.target.value
      this.dispatchEvent(new CustomEvent('overzoom-changed', { bubbles: true, composed: true, detail: { value: val } })) // dispatch event, so that parent can loop and deselect other items
    })
  }
}

export default OverzoomControl
