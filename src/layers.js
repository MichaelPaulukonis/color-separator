import Undo from './undo.js'

export default class Layers {
  constructor(p5Object, sl = null, temp = null) {
    this.p5Object = p5Object
    this.storageLayer = sl   // p5.Graphics, full-size
    this.tempLayer = temp
    this.ratio = 1
    this.history = new Undo(this.renderRaw, 10)
  }

  // TODO: integrate the visible, scaled canvas
  // the hidden full-size canvas
  // and any other temporary drawing layers (channels)
  // and it also handles history!
  // since that is a layer-thing

  getScale = (image) => {
    const displayLarge = { width: 800, height: 800 }
    const displaySmall = { width: 200, height: 200 }

    const ratio = (img, display) => {
      const widthRatio = display.width / img.width
      const heightRatio = display.height / img.height
      return Math.min(widthRatio, heightRatio);
    }

    let r = ratio(image, displayLarge)
    if (r > 3) r = ratio(image, displaySmall)

    return r;
  }


  // snapshot-free
  renderRaw = (img) => {
    this.storageLayer.blendMode(this.p5Object.BLEND)
    this.storageLayer.background('white')
    this.storageLayer.image(img, 0, 0)
    const r = this.ratio
    this.p5Object.background('white')
    this.p5Object.blendMode(this.p5Object.BLEND)
    this.p5Object.image(img, 0, 0, img.width * r, img.height * r)
    // params.imageLoaded = true // THIS needs to be passed back, yeah?
  }

  render = (img) => {
    this.history.snapshot(img) // whoops, not in here, either
    this.renderRaw(img)
  }

  imageReady = (img) => {
    img.loadPixels() // ?????
    this.storageLayer = this.p5Object.createGraphics(img.width, img.height)
    this.tempLayer = this.p5Object.createGraphics(img.width, img.height)
    const r = this.getScale(img)
    this.p5Object.resizeCanvas(img.width * r, img.height * r)
    this.ratio = r // aaaargh, how to pass back (do we need to ?!?!?)
    this.render(img)
  }

  /**
   * Returns a p5.Graphics object that is a copy of the current drawing
   */
  copy() {
    // this is copying, somewhat, the initLayer code
    // but whatevs.....
    const layer = this.p5Object.createGraphics(this.p5Object.width, this.p5Object.height)
    layer.pixelDensity(this.p5Object.pixelDensity())
    layer.image(this.p5Object, 0, 0)
    return layer
  }

  /**
   * Returns a p5.Graphics object that is a copy of the image passed in
   */
  clone(img) {
    const g = this.p5Object.createGraphics(img.width, img.height)
    g.pixelDensity(this.p5Object.pixelDensity())
    g.image(img, 0, 0)
    return g
  }
}
