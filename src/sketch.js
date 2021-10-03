// import saveAs from 'file-saver'
// import { datestring, filenamer } from './filelib'

// const namer = null

export default function Sketch ({ p5Instance: p5, p5Object }) {
  let blue
  let yellow
  let red

  p5.preload = () => {
    console.log('here!')
    window._p5Instance = p5Object// for p5.riso
    window.slowDown()
  }

  p5.setup = function () {
    // Set up a global object to capture this instance.
    window._p5Instance = p5
    p5.createCanvas(600, 600)
    p5.pixelDensity(1)
    p5.noStroke()

    red = new Riso('red')
    blue = new Riso('blue')
    yellow = new Riso('yellow')

    p5.colorGrid(red, 0)
    p5.colorGrid(yellow, 90)
    p5.colorGrid(blue, 270)

    drawRiso()
  }

  p5.draw = function () {}

  p5.mouseClicked = function () {
    exportRiso()
  }

  p5.colorGrid = function (layer, angle) {
    deg = angle * (p5.PI / 180)
    layer.push()
    layer.translate(299, 299)
    layer.rotate(deg)
    layer.translate(-299, -299)
    // GRID
    layer.noStroke()
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        const a = p5.map(y, 0, 19, 255, 0)
        const w = p5.map(x, 0, 20, 50, 550)
        const h = p5.map(y, 0, 20, 50, 550)
        layer.fill(a)
        layer.rect(w, h, 23, 23)

        // key
        if (w > 510) { // only draw edge strip once
          layer.rect(550 + 30, h, 23, 23)
        }
      }
    }
    layer.pop()
  }
}
