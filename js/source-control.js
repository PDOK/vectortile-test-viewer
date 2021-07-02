import style from 'bundle-text:./component-style.css'
import serviceEndpoints from './service-endpoints'

class SourceControl extends HTMLElement {
  constructor () {
    super()
    const _style = document.createElement('style')
    const _template = document.createElement('template')
    let dataListString = ''
    let first = true
    serviceEndpoints.sort(function (a, b) {
      var nameA = a.name.toUpperCase() // ignore upper and lowercase
      var nameB = b.name.toUpperCase() // ignore upper and lowercase
      if (nameA < nameB) {
        return -1
      }
      if (nameA > nameB) {
        return 1
      }
      // names must be equal
      return 0
    })

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
        #sourceInput{
          width: auto;
        }
      `
    _template.innerHTML = `
        <div id="sourceControl" class="parentControl">
        <select  id="sourceInput">
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
    this.shadow.getElementById('sourceInput').addEventListener('change', (event) => {
      this.dispatchEvent(new CustomEvent('select-changed', { bubbles: true, composed: true, detail: { id: this.id } })) // dispatch event, so that parent can loop and deselect other items
    })
  }
}

export default SourceControl
