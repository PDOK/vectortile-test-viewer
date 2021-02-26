// import style from './component-style'
import style from 'bundle-text:./component-style.css'
import serviceEndpoints from './service-endpoints'

class SourceControl extends HTMLElement {
  constructor () {
    super()
    const _style = document.createElement('style')
    const _template = document.createElement('template')
    let dataListString = ''
    let first = true
    serviceEndpoints.forEach(src => {
      let selString = first ? 'selected' : ''
      dataListString = dataListString.concat(`<option ${selString} value="${src.url}">${src.name}</option>`)
      first = false
    })
    _style.innerHTML = `
        ${style}
        #sourceControl{
            display: flex;
            position: absolute;
            top: 0.2em;
            left: 0.2em;
        }
        #sourceControlButton{
          border-left:  solid 1px #cfd6e6;
        }
      `
    _template.innerHTML = `
        <div id="sourceControl" class="parentControl">

        <select  id="sourceInput">
            ${dataListString}
            
            </select>
            <button  class="control" id="sourceControlButton">OK</button>
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
  getUrl () {
    return this.shadow.getElementById('sourceInput').value
  }
  getName () {
    let sel = this.shadow.getElementById('sourceInput')
    return sel.options[sel.selectedIndex].text
  }
  setSelectedByName (name) {
    if (!serviceEndpoints.some(x => x.name === name)) return
    let url = serviceEndpoints.find(x => x.name === name).url
    let sel = this.shadow.getElementById('sourceInput')
    let selector = `option[value="${url}"]`
    sel.querySelector(selector).selected = true
  }

  connectedCallback () {
    this.shadow.getElementById('sourceControlButton').addEventListener('click', (event) => {
      this.dispatchEvent(new CustomEvent('control-button-clicked', { bubbles: true, composed: true, detail: { id: this.id } })) // dispatch event, so that parent can loop and deselect other items
    })
  }
}

export default SourceControl
