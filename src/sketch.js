import saveAs from 'file-saver'
import { datestring, filenamer } from './filelib'

const namer = null

export default function Sketch ({ p5Instance: p5 }) {
  const colorSep = {}
  const density = 2
  const params = {
    width: 500,
    height: 500
  }

  p5.setup = () => {
    p5.pixelDensity(density)
    // TODO: so, you were wondering why there were too many canvases? !!!
    p5.createCanvas(params.width, params.height)
    p5.background('white')
  }

  const saver = (canvas, name) => {
    canvas.toBlob(blob => saveAs(blob, name))
  }

  const savit = ({ params }) => {
    console.log('saving canvas: ')
    saver(colorSep.layers.p5.drawingContext.canvas, namer() + '.png')
  }

  p5.draw = () => {
  }

  colorSep.savit = savit

  return colorSep
}
