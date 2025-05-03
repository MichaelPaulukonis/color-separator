import saveAs from 'file-saver'
import { datestring, filenamer } from './filelib'
import { allColors as RISOCOLORS } from '../src/colors.js'
import Layers from './layers'

let namer = null

export default function Sketch ({ p5Instance: p5, p5Object, params }) {
  const colorSep = {}
  const density = 1 // halftone (and other riso funcs) don't work with 2 NO IDEA
  let ditherTemplates = []
  let dithers = []
  let images = []

  p5.preload = () => {
    params.img = p5.loadImage(require('~/assets/images/small.cmyk.png'))

    // drop-down with ALL local sample images ???
    images = [
      p5.loadImage(require('~/assets/images/sour_sweets05.jpg')),
      p5.loadImage(require('~/assets/images/nancy.bubblegum.jpg')),
      p5.loadImage(require('~/assets/images/CMYK-Chart.png')),
      p5.loadImage(require('~/assets/images/small.cmyk.png')),
      p5.loadImage(require('~/assets/images/Rain_blo_1_cent_d.jpg')),
      p5.loadImage(require('~/assets/images/joe.cool.jpeg')),
      p5.loadImage(require('~/assets/images/black.square.jpeg'))
    ]
    ditherTemplates = [
      p5.loadImage(require('~/assets/dithers/4x28.png')),
      p5.loadImage(require('~/assets/dithers/4x36.png')),
      p5.loadImage(require('~/assets/dithers/4x68.png')),
      p5.loadImage(require('~/assets/dithers/6x42 LINES.png')),
      p5.loadImage(require('~/assets/dithers/5x30 CIRCLES.png')),
      p5.loadImage(require('~/assets/dithers/5x30 CIRCUITS.png')),
      p5.loadImage(require('~/assets/dithers/5x45 DiagLines.png'))
    ]
  }

  let canvas
  let layers

  p5.setup = () => {
    window._p5Instance = p5
    p5.pixelDensity(density)
    params.width = params.img.width
    params.height = params.img.height
    canvas = p5.createCanvas(params.width, params.height)
    canvas.drop(gotFile)
    canvas.parent('#sketch-holder')
    dithers = ditherTemplates.map(dt => new dither(dt))
    layers = new Layers(p5)
    layers.imageReady(params.img)
    p5.noLoop()
  }

  const getScale = (image) => {
    const displayLarge = { width: 800, height: 800 }
    const displaySmall = { width: 200, height: 200 }

    const ratio = (img, display) => {
      const widthRatio = display.width / img.width
      const heightRatio = display.height / img.height
      return Math.min(widthRatio, heightRatio)
    }

    let r = ratio(image, displayLarge)
    if (r > 3) r = ratio(image, displaySmall)

    return r
  }

  const gotFile = (file) => {
    if (file && file.type === 'image') {
      params.imageLoaded = false
      params.img = p5.loadImage(file.data, layers.imageReady)
    } else {
      console.log('Not an image file!')
    }
  }

  const render = (img) => {
    layers.history.snapshot(img)
    layers.renderRaw(img)
  }

  p5.mousePressed = () => {
    // TODO: get color under mouse
    // sent to params.eyedropper
    const rgb = () => p5.int(p5.random(255))
    params.eyedropper = `rgb(${rgb()},${rgb()},${rgb()})`
  }

  const colorKeys = ['r', 'g', 'b', 'c', 'y', 'm', 'k']

  p5.keyTyped = () => {
    if (p5.key === 'u') {
      layers.history.undo()
    } else if (p5.key === 'a') {
      const channel = params.channel[0] // first letter (ugh)
      const color = params.color
      const extract = extractSingleColor({ img: params.img, targChnl: channel, color })
      render(extract)
    } else if (p5.key === 'e') {
      // doesn't use params.color only extract/target
      const extract = extractTargetColor({ img: params.img, color: params.color, extractColor: params.extractColor, threshold: params.threshold })
      render(extract)
    } else if (colorKeys.indexOf(p5.key) > -1) {
      params.currChannel = p5.key
      oneChannel(params.img, p5.key)
    } else if (p5.key === 'o') {
      params.currChannel = 'original'
      oneChannel(params.img, p5.key)
    } else if (p5.key === 'd') {
      const d = ditherImage(params.img, params.ditherType, params.threshold)
      render(d)
    } else if (p5.key === 's') {
      savit()
    } else if (p5.key === 'h') {
      const img = layers.storageLayer.get()
      halftoner({ img, pattern: params.halftonePattern, threshold: params.threshold, angle: params.halftoneAngle, size: params.halftoneSize })
    } else if (p5.key === 'p') {
      const img = layers.storageLayer.get()
      photoDither(img)
    } else if (p5.key === '?') {
      // Show help modal
      window.$nuxt.$modal.show('help')
    }
  }

  const photoDither = (img) => {
    img.loadPixels()
    layers.tempLayer.background(0) // The darker color
    layers.tempLayer.fill(255) // The lighter color
    const width = img.width
    const height = img.height

    const pxSize = 5
    for (let x = 0; x < width; x += pxSize) {
      for (let y = 0; y < height; y += pxSize) {
        // TODO: pick from color
        // const colorToSend = color(noise(x / 150, y / 150, cos(frameCount / 10)) * 256);

        const targPixel = (x * y)
        const red = img.pixels[targPixel]
        const green = img.pixels[targPixel + 1]
        const blue = img.pixels[targPixel + 2]

        const shade = 0.2126 * red + 0.7152 * green + 0.0722 * blue

        // const colorToSend = p5.color(red, green, blue)
        // const brightness = p5.brightness(colorToSend)
        if (ditherColor(shade, x / pxSize, y / pxSize)) {
          layers.tempLayer.square(x, y, pxSize)
        }
      }
    }
    layers.render(layers.tempLayer)
  }

  function dither (img) {
    this.image = img
    this.width = this.image.width
    this.steps = this.image.height / this.width
    this.image.loadPixels()
    // console.log(this.file + ", " + this.image + ", " + this.width + ", " + this.steps);
  }

  // TODO: scope out the dithers array to be local (or passed in)

  function ditherColor (brightness, x1, y1) {
    const currentDither = 1
    const mX = x1 % dithers[currentDither].width
    const mY = y1 % dithers[currentDither].width
    const level = p5.ceil(p5.map(brightness, 0, 100, dithers[currentDither].steps, 0))

    const newColor = dithers[currentDither].image.get(mX, mY + (level - 1) * dithers[currentDither].width)

    if (newColor.toString('#rrggbb') === '255,255,255,255') {
      return true
    } else {
      return false
    }
  }

  // somewhat picky about threshold
  // when (re)processing a single-color image often goes to all-white
  const halftoner = ({ img, pattern, threshold, angle, size }) => {
    const rso = new Riso(params.color, img.width, img.height, p5)
    p5.background(255)
    clearRiso()

    const halftoned = halftoneImage(img, pattern, size, angle, threshold)

    rso.image(halftoned, 0, 0)
    drawRiso()
  }

  const oneChannel = (img, channel) => {
    let extract = null
    if (['r', 'g', 'b'].indexOf(channel) > -1) {
      extract = extractRGBChannel(img, channel)
    } else if (['c', 'y', 'm', 'k'].indexOf(channel) > -1) {
      const color = channel === 'c'
        ? 'CYAN'
        : channel === 'y'
          ? 'YELLOW'
          : channel === 'm'
            ? 'MAGENTA'
            : 'BLACK'
      const rso = new Riso(color, img.width, img.height, p5)
      clearRiso()
      extract = extractCMYKChannelRiso(img, channel)
      rso.image(extract, 0, 0)
      drawRiso()
      return
    } else {
      extract = img
    }
    p5.background(255, 255, 255)
    render(extract)
  }

  const saver = (canvas, name) => {
    canvas.toBlob(blob => saveAs(blob, name))
  }

  const savit = () => {
    console.log('saving canvas: ')
    namer = filenamer(`color-sep.${params.currChannel}.${datestring()}`)
    saver(layers.storageLayer.drawingContext.canvas, namer() + '.png')
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
  function deltaE (rgbA, rgbB) {
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

  function rgb2lab (rgb) {
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
  function extractCMYKChannelRiso (img, c) {
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
      let cmyk = rgb2cmyk(r, g, b)
      if (r === 0 && g === 0 && b === 0) {
        cmyk = [0, 0, 0, 0]
      }
      let val = 0
      desiredCMYKChannels.forEach((channelIndex) => { val += cmyk[channelIndex] })
      val /= desiredCMYKChannels.length
      const threshed = val > params.threshold ? 255 : 0
      channel.pixels[i] = threshed
      channel.pixels[i + 1] = threshed
      channel.pixels[i + 2] = threshed
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

  class Riso extends p5Object.Graphics {
    constructor (channelColor, w, h, p5) {
      if (!w) w = p5.width
      if (!h) h = p5.height

      super(w, h, null, p5)

      let foundColor

      if (typeof channelColor === 'string') {
        console.log(RISOCOLORS)
        console.log(channelColor, RISOCOLORS[channelColor])
        foundColor = RISOCOLORS[channelColor] || 'BLACK'
      }

      if (foundColor) {
        this.channelColor = foundColor
        this.channelName = channelColor
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

    cutout (imageMask) {
      const img = this.get()
      img.cutout(imageMask)
      this.clear()
      this.copy(img, 0, 0, this.width, this.height, 0, 0, img.width, img.height)
    }

    stroke (c) {
      this._stroke(this.channelColor[0], this.channelColor[1], this.channelColor[2], c)
    }

    fill (c) {
      this._fill(this.channelColor[0], this.channelColor[1], this.channelColor[2], c)
    }

    image (img, x, y, w, h) {
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

    draw () {
      layers.tempLayer.image(this, 0, 0)
    }
  }

  function drawRiso () {
    layers.tempLayer.background('white')
    layers.tempLayer.blendMode(p5.MULTIPLY)
    Riso.channels.forEach(c => c.draw())
    layers.tempLayer.blendMode(p5.BLEND)
    layers.render(layers.tempLayer)
  }

  function clearRiso () {
    Riso.channels.forEach(c => c.clear())
  }

  function risoNoFill () {
    Riso.channels.forEach(c => c.noFill())
  }

  function risoNoStroke () {
    Riso.channels.forEach(c => c.noStroke())
  }

  const halftonePatterns = {
    line (c, x, y, g, d) {
      c.rect(x, y, g, g * d)
    },
    square (c, x, y, g, d) {
      c.rect(x, y, g * d, g * d)
    },
    circle (c, x, y, g, d) {
      c.ellipse(x, y, d * g, d * g)
    },
    ellipse (c, x, y, g, d) {
      c.ellipse(x, y, g * d * 0.7, g * d)
    },
    cross (c, x, y, g, d) {
      c.rect(x, y, g, g * d)
      c.rect(x, y, g * d, g)
    }
  }

  function halftoneImage (img, shape, gridSize, angle, threshold) {
    if (shape === undefined) shape = 'circle'
    if (gridSize === undefined) gridSize = 10
    if (angle === undefined) angle = 45
    if (threshold === undefined) threshold = 127

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

    // TODO: reduce the sample image by gridSize
    // then each pixel is the avg of target area
    const avgs = []
    for (let x = 0; x < w * 2; x += gridSize) {
      for (let y = 0; y < h * 2; y += gridSize) {
        const targPixel = (x + y * w * 2) * 4

        const r = rotatedCanvas.pixels[targPixel]
        const g = rotatedCanvas.pixels[targPixel + 1]
        const b = rotatedCanvas.pixels[targPixel + 2]

        const luma = (0.299 * r + 0.587 * g + 0.114 * b)
        if (luma < 255) {
          const darkness = (255 - luma) / 255
          patternFunction(out, x, y, gridSize, darkness)
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

    if (threshold === false) {
      return result
    } else {
      return ditherImage(result, 'none', threshold)
    }
  }

  function halftoneImageRiso (img, shape, frequency, angle, intensity) {
    if (shape === undefined) shape = 'circle'
    if (frequency === undefined) frequency = 10
    if (angle === undefined) angle = 45
    if (intensity === undefined) intensity = 127

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
    const avgs = []
    for (let x = 0; x < w * 2; x += gridsize) {
      for (let y = 0; y < h * 2; y += gridsize) {
        const targPixel = (x + y * w * 2) * 4
        const avg = rotatedCanvas.pixels[targPixel] // how can this be an AVERAGE ????? it's one pixel!
        // oh, the original riso would have passed in a black image
        const quad = [rotatedCanvas.pixels[targPixel], rotatedCanvas.pixels[targPixel - 1], rotatedCanvas.pixels[targPixel - 2], rotatedCanvas.pixels[targPixel - 3]]
        avgs.push(quad)
        if (avg < 255) {
          // avgs.push(avg)
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
