// based on processing.js code at https://www.openprocessing.org/sketch/131411

export default class Undo {
  constructor (renderFunc, undoLimit) {
    // Number of currently available undo and redo snapshots
    let archiveCount = 0
    let redoSteps = 0
    const images = new CircImgCollection(renderFunc, undoLimit) // number of undos
    let temp

    this.snapshot = (img) => {
      archiveCount = Math.min(archiveCount + 1, undoLimit - 1)
      // each time we draw we disable redo
      redoSteps = 0
      images.store(img.get()) // reference to image or graphic, which means may be gone :-()
      // images.next()
    }

    this.undo = () => {
      if (archiveCount > 0) {
        archiveCount--
        redoSteps++
        images.prev()
        images.show()
      }
    }
    this.redo = () => {
      if (redoSteps > 0) {
        archiveCount++
        redoSteps--
        images.next()
        images.show()
      }
    }
    this.history = () => images.all().slice(0, archiveCount)
  }
}

class CircImgCollection {
  constructor (renderFunc, amountOfImages) {
    let current = -1
    const imgs = []
    const amount = amountOfImages

    this.all = () => imgs

    this.next = () => {
      current = (current + 1) % amount
    }
    this.prev = () => {
      current = (current - 1 + amount) % amount
    }
    this.store = (newImg) => {
      newImg.loadPixels()
      current = (current + 1) % amount
      imgs[current] = newImg
    }

    this.show = () => {
      renderFunc(imgs[current])
    }
  }
}
