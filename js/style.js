import { Stroke, Style, Fill, Circle } from 'ol/style'

const yellow = [255, 255, 150, 0.5]
const white = [255, 255, 255, 1]
const blue = [0, 153, 255, 1]
const red = [244, 0, 61, 1]
const redFill = [244, 0, 61, 0.5]
const strokeWidth = 4
const pointWidth = 3.5

const linestringStyle = [new Style({
  stroke: new Stroke({
    color: white,
    width: strokeWidth * 2
  })
}),
new Style({
  stroke: new Stroke({
    color: blue,
    width: strokeWidth
  })
})
]
const linestringSelectedStyle = [new Style({
  stroke: new Stroke({
    color: white,
    width: strokeWidth * 2
  })
}),
new Style({
  stroke: new Stroke({
    color: red,
    width: strokeWidth
  })
})
]

const polygonStyle = [
  new Style({
    fill: new Fill({ color: yellow })
  }),
  new Style({
    stroke: new Stroke({
      color: white,
      width: strokeWidth * 2
    })
  }),
  new Style({
    stroke: new Stroke({
      color: blue,
      width: strokeWidth
    })
  })
]

const polygonSelectedStyle = [
  new Style({
    fill: new Fill({ color: redFill }),
    zIndex: 100
  }),
  new Style({
    stroke: new Stroke({
      color: white,
      width: strokeWidth * 2
    }),
    zIndex: 100
  }),
  new Style({
    stroke: new Stroke({
      color: red,
      width: strokeWidth
    }),
    zIndex: 100
  })
]
const pointStyle = [
  new Style({
    image: new Circle({
      radius: pointWidth * 2,
      fill: new Fill({ color: blue }),
      stroke: new Stroke({
        color: white,
        width: pointWidth / 2
      })
    })
  })
]
const pointSelectedStyle = [
  new Style({
    image: new Circle({
      radius: pointWidth * 2,
      fill: new Fill({ color: red }),
      stroke: new Stroke({
        color: white,
        width: pointWidth / 2
      })
    })
  })
]

export default { pointStyle, linestringStyle, polygonStyle, pointSelectedStyle, linestringSelectedStyle, polygonSelectedStyle }
