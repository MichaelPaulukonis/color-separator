import saveAs from 'file-saver'
import { datestring, filenamer } from './filelib'

let namer = null

export default function Sketch({ p5Instance: p5, p5Object, params }) {
  const colorSep = {}
  const density = 1 // halftone (and other riso funcs) don't work with 2 NO IDEA

  p5.preload = () => {
    // params.img = p5.loadImage(require('~/assets/images/sour_sweets05.jpg'))
    // params.img = p5.loadImage(require('~/assets/images/nancy.bubblegum.jpg'))
    params.img = p5.loadImage(require('~/assets/images/CMYK-Chart.png'))
    // params.img = p5.loadImage(require('~/assets/images/small.cmyk.png'))
    // params.img = p5.loadImage(require('~/assets/images/Rain_blo_1_cent_d.jpg'))
    // params.img = p5.loadImage(require('~/assets/images/joe.cool.jpeg'))
    // params.img = p5.loadImage(require('~/assets/images/black.square.jpeg'))
  }

  let canvas

  p5.setup = () => {
    window._p5Instance = p5
    p5.pixelDensity(density)
    params.width = params.img.width
    params.height = params.img.height
    canvas = p5.createCanvas(params.width, params.height)
    canvas.drop(gotFile)
    canvas.parent('#sketch-holder')
    p5.background('white')
    p5.noLoop()
    p5.image(params.img, 0, 0)
  }

  const imageReady = (img) => {
    p5.resizeCanvas(img.width, img.height)
    params.img.loadPixels()
    p5.image(img, 0, 0)
    params.imageLoaded = true
  }

  const gotFile = (file) => {
    if (file && file.type === 'image') {
      params.imageLoaded = false
      params.img = p5.loadImage(file.data, imageReady)
    } else {
      console.log('Not an image file!')
    }
  }

  p5.mousePressed = () => {
    // TODO: get color under mouse
    // sent to params.eyedropper
    const rgb = () => p5.int(p5.random(255))
    params.eyedropper = `rgb(${rgb()},${rgb()},${rgb()})`
  }

  const colorKeys = ['r', 'g', 'b', 'c', 'y', 'm', 'k']

  p5.keyTyped = () => {
    if (p5.key === 'a') {
      const channel = params.channel[0] // first letter (ugh)
      const color = params.color
      const extract = extractSingleColor({ img: params.img, targChnl: channel, color })
      p5.image(extract, 0, 0)
    } else if (p5.key === 'e') {
      // doesn't use params.color only extract/target
      const extract = extractTargetColor({ img: params.img, color: params.color, extractColor: params.extractColor, threshold: params.threshold })
      p5.image(extract, 0, 0)
    } else if (colorKeys.indexOf(p5.key) > -1) {
      params.currChannel = p5.key
      oneChannel(params.img, p5.key)
    } else if (p5.key === 'o') {
      params.currChannel = 'original'
      oneChannel(params.img, p5.key)
    } else if (p5.key === 'd') {
      const d = ditherImage(params.img, params.ditherType, params.threshold)
      p5.image(d, 0, 0)
    } else if (p5.key === 's') {
      savit()
    } else if (p5.key === 'h') {
      const img = p5.get()
      halftoner({ img, pattern: params.halftonePattern, threshold: params.threshold, angle: params.halftoneAngle, size: params.halftoneSize })
    }
  }

  // somewhat picky about threshold
  // when (re)processing a single-color image often goes to all-white
  const halftoner = ({ img, pattern, threshold, angle, size }) => {
    const rso = new Riso(params.color)
    p5.background(255)
    clearRiso()

    const halftoned = halftoneImage(img, pattern, size, angle, threshold)

    rso.image(halftoned, 0, 0)
    drawRiso()
    halftoned.remove()
  }

  const oneChannel = (img, channel) => {
    let extract = null
    if (['r', 'g', 'b'].indexOf(channel) > -1) {
      extract = extractRGBChannel(img, channel)
      // extract = extractSingleColor({ img, targChnl: channel })
    } else if (['c', 'y', 'm', 'k'].indexOf(channel) > -1) {
      extract = extractCMYKChannelRiso(img, channel)
    } else {
      extract = img
    }
    p5.background(255, 255, 255)
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

  // from https://stackoverflow.com/a/52453462/41153
  function deltaE(rgbA, rgbB) {
    const labA = rgb2lab(rgbA)
    const labB = rgb2lab(rgbB)
    const deltaL = labA[0] - labB[0]
    const deltaA = labA[1] - labB[1]
    const deltaB = labA[2] - labB[2]
    const c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2])
    const c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2])
    const deltaC = c1 - c2
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH)
    const sc = 1.0 + 0.045 * c1
    const sh = 1.0 + 0.015 * c1
    const deltaLKlsl = deltaL / (1.0)
    const deltaCkcsc = deltaC / (sc)
    const deltaHkhsh = deltaH / (sh)
    const i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh
    return i < 0 ? 0 : Math.sqrt(i)
  }

  function rgb2lab(rgb) {
    let r = rgb[0] / 255; let g = rgb[1] / 255; let b = rgb[2] / 255; let x; let y; let z
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
    x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116
    y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116
    z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
  }

  const extractTargetColor = ({ img, color, extractColor, threshold }) => {
    const extractRGB = [
      p5.red(p5.color(extractColor)),
      p5.green(p5.color(extractColor)),
      p5.blue(p5.color(extractColor))
    ]

    const channel = p5.createImage(img.width, img.height)
    img.loadPixels()
    channel.loadPixels()
    for (let i = 0; i < img.pixels.length; i += 4) {
      const pixRGB = [img.pixels[i], img.pixels[i + 1], img.pixels[i + 2]]
      const distance = deltaE(extractRGB, pixRGB)
      const comp = p5.map(distance, 0, 100, 0, 255)
      if (comp >= threshold) {
        // mayb e if average of a larger region? ugh.
        channel.pixels[i] = 255
        channel.pixels[i + 1] = 255
        channel.pixels[i + 2] = 255
      } else {
        // leave 'em be!
        channel.pixels[i] = img.pixels[i]
        channel.pixels[i + 1] = img.pixels[i + 1]
        channel.pixels[i + 2] = img.pixels[i + 2]
      }
      channel.pixels[i + 3] = img.pixels[i + 3]
    }
    channel.updatePixels()
    return channel
  }

  // original
  const extractSingleColor = ({ img, targChnl, color }) => {
    const offset = ['b', 'r', 'g'].indexOf(targChnl)

    const dropToWhite = (color) => {
      const targPixel = color[offset]
      return targPixel < params.threshold
    }
    const channel = p5.createImage(img.width, img.height)
    img.loadPixels()
    channel.loadPixels()
    for (let i = 0; i < img.pixels.length; i += 4) {
      if (!dropToWhite([img.pixels[i], img.pixels[i + 1], img.pixels[i + 2]])) {
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

  // this IS CMYK, only faster than the other routine
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

    const channel = p5.createImage(img.width, img.height)
    img.loadPixels()
    channel.loadPixels()

    for (let i = 0; i < img.pixels.length; i += 4) {
      // cyan
      channel.pixels[i] = splits[0] === 0 ? img.pixels[i + channelOffset] : splits[0]
      // magenta
      channel.pixels[i + 1] = splits[1] === 0 ? img.pixels[i + channelOffset] : splits[1]
      // yellow
      channel.pixels[i + 2] = splits[2] === 0 ? img.pixels[i + channelOffset] : splits[2]

      channel.pixels[i + 3] = img.pixels[i + 3]
    }
    channel.updatePixels()
    return channel
  }

  // maybe use the RISO now
  const extractCMYKChannel = (img, c) => {
    if (c === 'c' || c === 'cyan') c = 0
    if (c === 'm' || c === 'magenta') c = 1
    if (c === 'y' || c === 'yellow') c = 2
    if (c === 'k' || c === 'black') c = 3

    const channel = p5.createImage(img.width, img.height)
    img.loadPixels()
    channel.loadPixels()
    for (let i = 0; i < img.pixels.length; i += 4) {
      const tmp = p5.color(img.pixels[i], img.pixels[i + 1], img.pixels[i + 2], img.pixels[i + 3])

      // if nothing, it goes to clear
      // it should go to black or white, depending

      switch (c) {
        case 0: { // cyan
          const _c = (255 - p5.red(tmp))
          channel.pixels[i] = 0
          channel.pixels[i + 1] = 255
          channel.pixels[i + 2] = 255
          channel.pixels[i + 3] = _c
        }
          break

        case 1: {
          const _m = (255 - p5.green(tmp))
          channel.pixels[i] = 255
          channel.pixels[i + 1] = 0
          channel.pixels[i + 2] = 255
          channel.pixels[i + 3] = _m
        }
          break

        case 2: {
          const _y = (255 - p5.blue(tmp))
          channel.pixels[i] = 255
          channel.pixels[i + 1] = 255
          channel.pixels[i + 2] = 0
          channel.pixels[i + 3] = _y
        }
          break

        case 3: {
          const _k = (255 - Math.floor(p5.brightness(tmp)))
          if (_k > 230) {
            channel.pixels[i] = 0
            channel.pixels[i + 1] = 0
            channel.pixels[i + 2] = 0
            channel.pixels[i + 3] = 255
          } else {
            channel.pixels[i] = 255
            channel.pixels[i + 1] = 255
            channel.pixels[i + 2] = 255
            channel.pixels[i + 3] = 255
          }
        }
          break
      }
    }
    channel.updatePixels()
    return channel
  }

  // channel can be a number, a name, or a string of channels like 'cy' or 'cmk'
  // NOTE: this goes to black, not the target color
  // NOTE: the black extraction might work better in the other method. !!!
  function extractCMYKChannelRiso(img, c) {
    const desiredCMYKChannels = []
    if (typeof c === 'number' && c < 4) {
      desiredCMYKChannels.push(c)
    } else {
      c = c.toLowerCase()
      if (c === 'cyan' || c.includes('c')) desiredCMYKChannels.push(0)
      if (c === 'magenta' || c.includes('m')) desiredCMYKChannels.push(1)
      if (c === 'yellow' || c.includes('y')) desiredCMYKChannels.push(2)
      if (c === 'black' || c.includes('k')) desiredCMYKChannels.push(3)
    }
    const channel = p5.createImage(img.width, img.height)
    img.loadPixels()
    channel.loadPixels()
    for (let i = 0; i < img.pixels.length; i += 4) {
      const r = img.pixels[i]
      const g = img.pixels[i + 1]
      const b = img.pixels[i + 2]
      const cmyk = rgb2cmyk(r, g, b)
      let val = 0
      desiredCMYKChannels.forEach((channelIndex) => { val += cmyk[channelIndex] })
      val /= desiredCMYKChannels.length
      channel.pixels[i] = val
      channel.pixels[i + 1] = val
      channel.pixels[i + 2] = val
      channel.pixels[i + 3] = img.pixels[i + 3]
    }
    channel.updatePixels()
    return channel
  }

  const ditherImage = (img, type = 'floydsteinberg', threshold = 128) => {
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

  const RISOCOLORS = [
    { name: 'BLACK', color: [0, 0, 0] },
    { name: 'BURGUNDY', color: [145, 78, 114] },
    { name: 'BLUE', color: [0, 120, 191] },
    { name: 'GREEN', color: [0, 169, 92] },
    { name: 'MEDIUMBLUE', color: [50, 85, 164] },
    { name: 'BRIGHTRED', color: [241, 80, 96] },
    { name: 'RISOFEDERALBLUE', color: [61, 85, 136] },
    { name: 'PURPLE', color: [118, 91, 167] },
    { name: 'TEAL', color: [0, 131, 138] },
    { name: 'FLATGOLD', color: [187, 139, 65] },
    { name: 'HUNTERGREEN', color: [64, 112, 96] },
    { name: 'RED', color: [255, 102, 94] },
    { name: 'BROWN', color: [146, 95, 82] },
    { name: 'YELLOW', color: [255, 232, 0] },
    { name: 'MARINERED', color: [210, 81, 94] },
    { name: 'ORANGE', color: [255, 108, 47] },
    { name: 'FLUORESCENTPINK', color: [255, 72, 176] },
    { name: 'LIGHTGRAY', color: [136, 137, 138] },
    { name: 'METALLICGOLD', color: [172, 147, 110] },
    { name: 'CRIMSON', color: [228, 93, 80] },
    { name: 'FLUORESCENTORANGE', color: [255, 116, 119] },
    { name: 'CORNFLOWER', color: [98, 168, 229] },
    { name: 'SKYBLUE', color: [73, 130, 207] },
    { name: 'SEABLUE', color: [0, 116, 162] },
    { name: 'LAKE', color: [35, 91, 168] },
    { name: 'INDIGO', color: [72, 77, 122] },
    { name: 'MIDNIGHT', color: [67, 80, 96] },
    { name: 'MIST', color: [213, 228, 192] },
    { name: 'GRANITE', color: [165, 170, 168] },
    { name: 'CHARCOAL', color: [112, 116, 124] },
    { name: 'SMOKYTEAL', color: [95, 130, 137] },
    { name: 'STEEL', color: [55, 94, 119] },
    { name: 'SLATE', color: [94, 105, 94] },
    { name: 'TURQUOISE', color: [0, 170, 147] },
    { name: 'EMERALD', color: [25, 151, 93] },
    { name: 'GRASS', color: [57, 126, 88] },
    { name: 'FOREST', color: [81, 110, 90] },
    { name: 'SPRUCE', color: [74, 99, 93] },
    { name: 'MOSS', color: [104, 114, 77] },
    { name: 'SEAFOAM', color: [98, 194, 177] },
    { name: 'KELLYGREEN', color: [103, 179, 70] },
    { name: 'LIGHTTEAL', color: [0, 157, 165] },
    { name: 'IVY', color: [22, 155, 98] },
    { name: 'PINE', color: [35, 126, 116] },
    { name: 'LAGOON', color: [47, 97, 101] },
    { name: 'VIOLET', color: [157, 122, 210] },
    { name: 'ORCHID', color: [170, 96, 191] },
    { name: 'PLUM', color: [132, 89, 145] },
    { name: 'RAISIN', color: [119, 93, 122] },
    { name: 'GRAPE', color: [108, 93, 128] },
    { name: 'SCARLET', color: [246, 80, 88] },
    { name: 'TOMATO', color: [210, 81, 94] },
    { name: 'CRANBERRY', color: [209, 81, 122] },
    { name: 'MAROON', color: [158, 76, 110] },
    { name: 'RASPBERRYRED', color: [209, 81, 122] },
    { name: 'BRICK', color: [167, 81, 84] },
    { name: 'LIGHTLIME', color: [227, 237, 85] },
    { name: 'SUNFLOWER', color: [255, 181, 17] },
    { name: 'MELON', color: [255, 174, 59] },
    { name: 'APRICOT', color: [246, 160, 77] },
    { name: 'PAPRIKA', color: [238, 127, 75] },
    { name: 'PUMPKIN', color: [255, 111, 76] },
    { name: 'BRIGHTOLIVEGREEN', color: [180, 159, 41] },
    { name: 'BRIGHTGOLD', color: [186, 128, 50] },
    { name: 'COPPER', color: [189, 100, 57] },
    { name: 'MAHOGANY', color: [142, 89, 90] },
    { name: 'BISQUE', color: [242, 205, 207] },
    { name: 'BUBBLEGUM', color: [249, 132, 202] },
    { name: 'LIGHTMAUVE', color: [230, 181, 201] },
    { name: 'DARKMAUVE', color: [189, 140, 166] },
    { name: 'WINE', color: [145, 78, 114] },
    { name: 'GRAY', color: [146, 141, 136] },
    { name: 'CORAL', color: [255, 142, 145] },
    { name: 'WHITE', color: [255, 255, 255] },
    { name: 'AQUA', color: [94, 200, 229] },
    { name: 'MINT', color: [130, 216, 213] },
    { name: 'CLEARMEDIUM', color: [242, 242, 242] },
    { name: 'FLUORESCENTYELLOW', color: [255, 233, 22] },
    { name: 'FLUORESCENTRED', color: [255, 76, 101] },
    { name: 'FLUORESCENTGREEN', color: [68, 214, 44] }
  ]

  class Riso extends p5Object.Graphics {
    constructor(channelColor, w, h) {
      if (!w) w = p5.width
      if (!h) h = p5.height

      super(w, h, null, p5)

      let foundColor

      if (typeof channelColor === 'string') {
        channelColor = channelColor.trim().replace(/ /g, '').toUpperCase()
        foundColor = RISOCOLORS.find(c => c.name === channelColor)
      }

      if (foundColor) {
        this.channelColor = foundColor.color
        this.channelName = foundColor.name
      } else {
        this.channelColor = channelColor
        this.channelName = null
      }

      // store original versions of fill and stroke
      this._fill = p5Object.prototype.fill.bind(this)
      this._stroke = p5Object.prototype.stroke.bind(this)
      this._image = p5Object.prototype.image.bind(this)

      this.stroke(this.channelColor[0], this.channelColor[1], this.channelColor[2]) // stroke with channel color by default

      this.channelIndex = Riso.channels.length

      Riso.channels.push(this)
    }

    export(filename) {
      if (!filename) {
        if (this.channelName) {
          filename = this.channelName + '.png'
        } else {
          filename = this.channelIndex + '.png'
        }
      }

      // this.filter(GRAY);

      const buffer = p5.createGraphics(this.width, this.height)

      buffer.loadPixels()
      this.loadPixels()

      for (let i = 0; i < this.pixels.length; i += 4) {
        buffer.pixels[i] = 0
        buffer.pixels[i + 1] = 0
        buffer.pixels[i + 2] = 0
        buffer.pixels[i + 3] = this.pixels[i + 3]
      }

      buffer.updatePixels()
      buffer.save(filename)
    }

    cutout(imageMask) {
      const img = this.get()
      img.cutout(imageMask)
      this.clear()
      this.copy(img, 0, 0, this.width, this.height, 0, 0, img.width, img.height)
    }

    stroke(c) {
      this._stroke(this.channelColor[0], this.channelColor[1], this.channelColor[2], c)
    }

    fill(c) {
      this._fill(this.channelColor[0], this.channelColor[1], this.channelColor[2], c)
    }

    image(img, x, y, w, h) {
      const alphaValue = p5.alpha(this.drawingContext.fillStyle) / 255
      const newImage = p5.createImage(img.width, img.height)
      img.loadPixels()
      newImage.loadPixels()
      for (let i = 0; i < newImage.pixels.length; i += 4) {
        newImage.pixels[i] = this.channelColor[0]
        newImage.pixels[i + 1] = this.channelColor[1]
        newImage.pixels[i + 2] = this.channelColor[2]

        if (img.pixels[i + 3] < 255) {
          newImage.pixels[i + 3] = img.pixels[i + 3] * alphaValue
        } else {
          newImage.pixels[i + 3] = (255 - (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3) * alphaValue
        }
      }
      newImage.updatePixels()
      this._image(newImage, x, y, w, h)
      return newImage
    }

    draw() {
      p5.image(this, 0, 0)
    }
  }

  function drawRiso() {
    p5.blendMode(p5.MULTIPLY)
    Riso.channels.forEach(c => c.draw())
    p5.blendMode(p5.BLEND)
  }

  function exportRiso() {
    Riso.channels.forEach(c => c.export())
  }

  function clearRiso() {
    Riso.channels.forEach(c => c.clear())
  }

  function risoNoFill() {
    Riso.channels.forEach(c => c.noFill())
  }

  function risoNoStroke() {
    Riso.channels.forEach(c => c.noStroke())
  }

  // frequency is gridSize !!!
  function halftoneImage(img, shape, frequency, angle, intensity) {
    if (shape === undefined) shape = 'circle'
    if (frequency === undefined) frequency = 10
    if (angle === undefined) angle = 45
    if (intensity === undefined) intensity = 127

    const halftonePatterns = {
      line(c, x, y, g, d) {
        c.rect(x, y, g, g * d)
      },
      square(c, x, y, g, d) {
        c.rect(x, y, g * d, g * d)
      },
      circle(c, x, y, g, d) {
        c.ellipse(x, y, d * g, d * g)
      },
      ellipse(c, x, y, g, d) {
        c.ellipse(x, y, g * d * 0.7, g * d)
      },
      cross(c, x, y, g, d) {
        c.rect(x, y, g, g * d)
        c.rect(x, y, g * d, g)
      }
    }

    const patternFunction = typeof shape === 'function' ? shape : halftonePatterns[shape]

    const w = img.width
    const h = img.height

    const rotatedCanvas = p5.createGraphics(img.width * 2, img.height * 2)
    rotatedCanvas.background(255)
    rotatedCanvas.imageMode(p5.CENTER)
    rotatedCanvas.push()
    rotatedCanvas.translate(img.width, img.height)
    rotatedCanvas.rotate(-angle)
    rotatedCanvas.image(img, 0, 0)
    rotatedCanvas.pop()
    rotatedCanvas.loadPixels()

    const out = p5.createGraphics(w * 2, h * 2)
    out.background(255)
    out.ellipseMode(p5.CORNER)
    out.rectMode(p5.CENTER)
    out.fill(0)
    out.noStroke()

    const gridsize = frequency

    for (let x = 0; x < w * 2; x += gridsize) {
      for (let y = 0; y < h * 2; y += gridsize) {
        const avg = rotatedCanvas.pixels[(x + y * w * 2) * 4]

        if (avg < 255) {
          const darkness = (255 - avg) / 255
          patternFunction(out, x, y, gridsize, darkness)
        }
      }
    }
    rotatedCanvas.background(255)
    rotatedCanvas.push()
    rotatedCanvas.translate(w, h)
    rotatedCanvas.rotate(angle)
    rotatedCanvas.image(out, 0, 0)
    rotatedCanvas.pop()

    const result = rotatedCanvas.get(w / 2, h / 2, w, h)
    rotatedCanvas.remove()
    out.remove()

    if (intensity === false) {
      return result
    } else {
      return ditherImage(result, 'none', intensity)
    }
  }

  p5Object.Image.prototype.cutout = function (p5Image) {
    // this is basically the same as mask but without an different compositeoperation

    if (p5Image === undefined) {
      p5Image = this
    }
    const currBlend = this.drawingContext.globalCompositeOperation

    let scaleFactor = 1
    if (p5Image instanceof p5.Renderer) {
      scaleFactor = p5Image._pInst._pixelDensity
    }

    const copyArgs = [
      p5Image,
      0,
      0,
      scaleFactor * p5Image.width,
      scaleFactor * p5Image.height,
      0,
      0,
      this.width,
      this.height
    ]

    this.drawingContext.globalCompositeOperation = 'destination-out'
    p5.Image.prototype.copy.apply(this, copyArgs)
    this.drawingContext.globalCompositeOperation = currBlend
    this.setModified(true)
  }

  Riso.channels = []

  return colorSep
}
