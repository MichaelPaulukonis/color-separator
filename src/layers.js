export default class Layers {
  constructor(p5Object, dl, temp) {
    this.p5Object = p5Object
    this.drawingLayer = dl   // p5.Graphics, full-size
    this.tempLayer = temp
    // this.displayLayer
  }

  // TODO: integrate the visible, scaled canvas
  // the hidden full-size canvas
  // and any other temporary drawing layers (channels)
  // and it also handles history!
  // since that is a layer-thing

  // TODO: only need to calculate once
  // this is probably a minor optimization
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
    // why create anew ?????
    // backgroundStorage = p5.createGraphics(img.width, img.height)
    backgroundStorage.blendMode(p5.BLEND)
    backgroundStorage.background('white')
    backgroundStorage.image(img, 0, 0)
    const r = getScale(img)
    p5.resizeCanvas(img.width * r, img.height * r) // no need every time!
    p5.background('white')
    p5.blendMode(p5.BLEND)
    p5.image(img, 0, 0, img.width * r, img.height * r)
    params.ratio = r
    params.imageLoaded = true
  }

  render = (img) => {
    history.snapshot(img)
    renderRaw(img)
  }


  /**
   * Returns a p5.Graphics object that is a copy of the current drawing
   */
  copy() {
    // this is copying, somewhat, the initLayer code
    // but whatevs.....
    const layer = this.p5Object.createGraphics(this.p5Object.width, this.p5Object.height)
    layer.pixelDensity(this.p5Object.pixelDensity())
    // layer.image(this.p5.get(), 0, 0) // makes things blurry??
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

  setFont(font) {
    this.p5Object.textFont(font)
    this.drawingLayer.textFont(font)
  }

  textSize(size) {
    this.p5Object.textSize(size)
    this.drawingLayer.textSize(size)
  }
}
