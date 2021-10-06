import saveAs from 'file-saver'
import { datestring, filenamer } from './filelib'

let namer = null

export default function Sketch ({ p5Instance: p5, p5Object }) {
  const colorSep = {}
  const density = 2
  const params = {
    width: 500,
    height: 500
  }
  let img = null

  p5.preload = () => {
    // img = p5.loadImage(require('~/assets/images/nancy.bubblegum.jpg'))
    img = p5.loadImage(require('~/assets/images/sour_sweets05.jpg'))
  }

  p5.setup = () => {
    p5.pixelDensity(density)
    params.width = img.width
    params.height = img.height
    p5.createCanvas(params.width, params.height)
    p5.background('white')
    namer = filenamer('color-sep.' + datestring())
    p5.noLoop()
    p5.image(img, 0, 0)

    // const red = extractRGBChannel(img, 'red')
    // const channel = extractCMYKChannel(img, 'k')
    // p5.image(channel, 0, 0)
  }

  p5.keyTyped = () => {
    const colors = ['r', 'g', 'b', 'c', 'y', 'm', 'k']
    if (colors.indexOf(p5.key) > -1) {
      oneChannel(img, p5.key)
    }
    if (p5.key === 'o') {
      oneChannel(img, p5.key)
    }
  }

  const oneChannel = (img, channel) => {
    let extract = null
    if (['r', 'g', 'b'].indexOf(channel) > -1) {
      extract = extractRGBChannel(img, channel)
    } else if (['c', 'y', 'm', 'k'].indexOf(channel) > -1) {
      extract = extractCMYKChannel(img, channel)
    } else {
      extract = img
    }
    p5.image(extract, 0, 0)
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

  const rgb2cmyk = (r, g, b) => {
    // adapted from https://www.rapidtables.com/convert/color/rgb-to-cmyk.html

    r = r / 255
    b = b / 255
    g = g / 255

    let k = Math.min(1 - r, 1 - b, 1 - g)
    const c = 1 - (1 - r - k) / (1 - k)
    const m = 1 - (1 - g - k) / (1 - k)
    const y = 1 - (1 - b - k) / (1 - k)

    k = 1 - k

    return [c * 255, m * 255, y * 255, k * 255]
  }

  const cmyk2 = (r, g, b) => {
    // RGB --> CMYK
    let c = 1 - (r / 255)
    let m = 1 - (g / 255)
    let y = 1 - (b / 255)
    let k = 1
    if (c < k) {
      k = c
    }
    if (m < k) {
      k = m
    }
    if (y < k) {
      k = y
    }
    c = (c - k) / (1 - k)
    m = (m - k) / (1 - k)
    y = (y - k) / (1 - k)
    return [c * 255, m * 255, y * 255, k * 255]
  }

  const extractRGBChannel = (img, ch) => {
    let c = 0
    if (ch === 'r') c = 0
    if (ch === 'g') c = 1
    if (ch === 'b') c = 2

    let splits = []
    switch (ch) {
      case 'r':
        c = 0
        splits = [255, 0, 255]
        break

      case 'g':
        c = 1
        splits = [255, 255, 0]
        break

      case 'b':
        c = 2
        splits = [0, 255, 255]
        break
    }

    const channel = p5.createImage(img.width, img.height)
    img.loadPixels()
    channel.loadPixels()
    // cyan: 0, 255, 255
    // magenta: 255, 0, 255
    // yellow: 255, 255, 0
    for (let i = 0; i < img.pixels.length; i += 4) {
      // channel.pixels[i] = img.pixels[i + c]
      // channel.pixels[i + 1] = img.pixels[i + c]
      // channel.pixels[i + 2] = img.pixels[i + c]

      // 0 channel needs to be normal
      channel.pixels[i] = splits[0] === 0 ? img.pixels[i + c] : splits[0]
      channel.pixels[i + 1] = splits[1] === 0 ? img.pixels[i + c] : splits[1]
      channel.pixels[i + 2] = splits[2] === 0 ? img.pixels[i + c] : splits[2]

      // meh, who cares about alpha
      channel.pixels[i + 3] = img.pixels[i + 3]
    }
    channel.updatePixels()
    return channel
  }

  const extractCMYKChannel = (img, c) => {
    if (c === 'c' || c === 'cyan') c = 0
    if (c === 'm' || c === 'magenta') c = 1
    if (c === 'y' || c === 'yellow') c = 2
    if (c === 'k' || c === 'black') c = 3

    const channel = p5.createImage(img.width, img.height)
    img.loadPixels()
    channel.loadPixels()
    for (let i = 0; i < img.pixels.length; i += 4) {
      const r = img.pixels[i]
      const g = img.pixels[i + 1]
      const b = img.pixels[i + 2]
      const val = rgb2cmyk(r, g, b)[c]
      const val2 = cmyk2(r, g, b)[c]
      // if (val2 !== val) {
      //   console.log(`1: ${val} 2: ${val2}`)
      // }
      channel.pixels[i] = val
      channel.pixels[i + 1] = val
      channel.pixels[i + 2] = val
      channel.pixels[i + 3] = img.pixels[i + 3]
    }
    channel.updatePixels()
    return channel
  }

  const ditherImage = (img, type, threshold = 128) => {
    // source adapted from: https://github.com/meemoo/meemooapp/blob/44236a29574812026407c0288ab15390e88b556a/src/nodes/image-monochrome-worker.js

    const out = img.get()
    const w = out.width
    let newPixel, err

    const bayerThresholdMap = [
      [15, 135, 45, 165],
      [195, 75, 225, 105],
      [60, 180, 30, 150],
      [240, 120, 210, 90]
    ]

    const lumR = []
    const lumG = []
    const lumB = []

    out.loadPixels()

    for (let i = 0; i < 256; i++) {
      lumR[i] = i * 0.299
      lumG[i] = i * 0.587
      lumB[i] = i * 0.114
    }

    for (let i = 0; i <= out.pixels.length; i += 4) {
      out.pixels[i] = Math.floor(
        lumR[out.pixels[i]] + lumG[out.pixels[i + 1]] + lumB[out.pixels[i + 2]]
      )
    }

    for (let i = 0; i <= out.pixels.length; i += 4) {
      if (type === 'none') {
        // No dithering
        out.pixels[i] = out.pixels[i] < threshold ? 0 : 255
      } else if (type === 'bayer') {
        // 4x4 Bayer ordered dithering algorithm
        const x = (i / 4) % w
        const y = Math.floor(i / 4 / w)
        const map = Math.floor(
          (out.pixels[i] + bayerThresholdMap[x % 4][y % 4]) / 2
        )
        out.pixels[i] = map < threshold ? 0 : 255
      } else if (type === 'floydsteinberg') {
        // Floyd–Steinberg dithering algorithm
        newPixel = out.pixels[i] < 129 ? 0 : 255
        err = Math.floor((out.pixels[i] - newPixel) / 16)
        out.pixels[i] = newPixel
        out.pixels[i + 4] += err * 7
        out.pixels[i + 4 * w - 4] += err * 3
        out.pixels[i + 4 * w] += err * 5
        out.pixels[i + 4 * w + 4] += err * 1
      } else {
        // Bill Atkinson's dithering algorithm
        newPixel = out.pixels[i] < 129 ? 0 : 255
        err = Math.floor((out.pixels[i] - newPixel) / 8)
        out.pixels[i] = newPixel

        out.pixels[i + 4] += err
        out.pixels[i + 8] += err
        out.pixels[i + 4 * w - 4] += err
        out.pixels[i + 4 * w] += err
        out.pixels[i + 4 * w + 4] += err
        out.pixels[i + 8 * w] += err
      }

      // Set g and b pixels equal to r
      out.pixels[i + 1] = out.pixels[i + 2] = out.pixels[i]
    }
    out.updatePixels()
    return out
  }

  colorSep.savit = savit

  return colorSep
}
