import saveAs from 'file-saver'
import { datestring, filenamer } from './filelib'
import colors from './colors'

let namer = null

export default function Sketch ({ p5Instance: p5, p5Object }) {
  const colorSep = {}
  const density = 2
  const params = {
    width: 500,
    height: 500,
    currChannel: ''
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
    p5.noLoop()
    p5.image(img, 0, 0)
  }

  const colorKeys = ['r', 'g', 'b', 'c', 'y', 'm', 'k']

  p5.keyTyped = () => {
    if (p5.key === 'a') {
      const color = p5.random(Object.values(colors))
      const extract = extractSingleColor({ img, targChnl: 'b', color })
      p5.image(extract, 0, 0)
    } else if (colorKeys.indexOf(p5.key) > -1) {
      params.currChannel = p5.key
      oneChannel(img, p5.key)
    } else if (p5.key === 'o') {
      params.currChannel = 'original'
      oneChannel(img, p5.key)
    } else if (p5.key === 'd') {
      const d = ditherImage(p5.get())
      p5.image(d, 0, 0)
    } else if (p5.key === 's') {
      savit()
    }
  }

  const oneChannel = (img, channel) => {
    let extract = null
    if (['r', 'g', 'b'].indexOf(channel) > -1) {
      extract = extractRGBChannel(img, channel)
      // extract = extractSingleColor({ img, targChnl: channel })
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

  const savit = () => {
    console.log('saving canvas: ')
    namer = filenamer(`color-sep.${params.currChannel}.${datestring()}`)
    saver(p5.drawingContext.canvas, namer() + '.png')
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

  const extractSingleColor = ({ img, targChnl, color }) => {
    // const isWhite = ([r, g, b]) => r === 0 && g === 0 && b === 0
    // Get the brightness value of the pixel
    // const gray = brightness(pixel);
    const min = 50
    const threshold = ([r, g, b]) => {
      const c = p5.color(r, g, b)
      const gray = p5.brightness(c)
      return gray < min
    }
    const channel = p5.createImage(img.width, img.height)
    img.loadPixels()
    channel.loadPixels()
    for (let i = 0; i < img.pixels.length; i += 4) {
      if (!threshold([img.pixels[i], img.pixels[i + 1], img.pixels[i + 2]])) {
        channel.pixels[i] = 255
        channel.pixels[i + 1] = 255
        channel.pixels[i + 2] = 255
      } else {
        channel.pixels[i] = color[0]
        channel.pixels[i + 1] = color[1]
        channel.pixels[i + 2] = color[2]
      }
      channel.pixels[i + 3] = img.pixels[i + 3]
    }
    channel.updatePixels()
    return channel
  }

  const extractRGBChannel = (img, targChnl) => {
    let channelOffset = 0

    const magenta = [255, 0, 255]
    const yellow = [255, 255, 0]
    const cyan = [0, 255, 255]

    let splits = []
    switch (targChnl) {
      case 'r':
        channelOffset = 1
        splits = magenta
        break

      case 'g':
        channelOffset = 2
        splits = yellow
        break

      case 'b':
        channelOffset = 0
        splits = cyan
        break
    }

    // splits = colors.GREEN

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

      // hrm. Extract color, then convert it to another color
      // MATH!

      // 0 channel needs to be normal
      channel.pixels[i] = splits[0] === 0 ? img.pixels[i + channelOffset] : splits[0]
      channel.pixels[i + 1] = splits[1] === 0 ? img.pixels[i + channelOffset] : splits[1]
      channel.pixels[i + 2] = splits[2] === 0 ? img.pixels[i + channelOffset] : splits[2]

      // channel.pixels[i] = splits[0]
      // channel.pixels[i + 1] = splits[1]
      // channel.pixels[i + 2] = splits[2]

      // meh, who cares about alpha
      channel.pixels[i + 3] = img.pixels[i + 3]
      // channel.pixels[i + 3] =
      //   255 - (img.pixels[i + channelOffset] + img.pixels[i + channelOffset] + img.pixels[i + channelOffset]) / 3
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
