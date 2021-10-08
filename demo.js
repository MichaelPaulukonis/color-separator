// https://codepen.io/mikeurbonas/pen/poJKKvB

document.getElementById('nextStep').style.display = 'none'
document.getElementById('finalStep').style.visibility = 'hidden'
let img
let red1
let green1
let blue1
let pickCounter = 0
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const canvasNew = document.getElementById('canvasNew')
document.getElementById('canvasNew').style.visibility = 'hidden'
const ctxNew = canvasNew.getContext('2d')

// The following code for 3 or 4 listeners and four functions
// is admittedly kludgey... but works! Still neeed to combine into a single listener ¯\_(ツ)_/¯

image1.addEventListener('click', image1Selected)
image2.addEventListener('click', image2Selected)
image3.addEventListener('click', image3Selected)
image4.addEventListener('click', image4Selected)

function image1Selected (event) {
  img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = 'https://assets.codepen.io/970568/interior-blue.jpg'
  img.onload = function () {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    canvasNew.width = canvas.width
    canvasNew.height = canvas.height
    ctxNew.drawImage(img, 0, 0)
    document.getElementById('begin').style.display = 'none'
    document.getElementById('nextStep').style.display = 'inline'
  }
}

function image2Selected (event) {
  img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/970568/xray-double.jpg'
  img.onload = function () {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    canvasNew.width = canvas.width
    canvasNew.height = canvas.height
    ctxNew.drawImage(img, 0, 0)
    document.getElementById('begin').style.display = 'none'
    document.getElementById('nextStep').style.display = 'inline'
  }
}

function image3Selected (event) {
  img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/970568/glass-color-violet.jpg'
  img.onload = function () {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    canvasNew.width = canvas.width
    canvasNew.height = canvas.height
    ctxNew.drawImage(img, 0, 0)
    document.getElementById('begin').style.display = 'none'
    document.getElementById('nextStep').style.display = 'inline'
  }
}

function image4Selected (event) {
  img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = 'https://assets.codepen.io/970568/mike-dg-blue.jpg'
  img.onload = function () {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    canvasNew.width = canvas.width
    canvasNew.height = canvas.height
    ctxNew.drawImage(img, 0, 0)
    document.getElementById('begin').style.display = 'none'
    document.getElementById('nextStep').style.display = 'inline'
  }
}

const color = document.getElementById('color')

function pickColor (event) {
  document.getElementById('nextStep').style.display = 'none'
  document.getElementById('finalStep').style.visibility = 'visible'
  pickCounter = 1
  const x = event.layerX
  const y = event.layerY
  const pixel = ctx.getImageData(x, y, 1, 1)
  const data = pixel.data
  red1 = data[0]
  green1 = data[1]
  blue1 = data[2]
  const rgb = 'rgb(' + red1 + ', ' + green1 + ', ' + blue1 + ')'
  color.style.background = rgb
  color.textContent = 'You selected: ' + rgb

  const luminance = ((Math.max(red1, green1, blue1) / 255) + (Math.min(red1, green1, blue1) / 255)) / 2

  if (luminance < 0.4) {
    document.getElementById('color').style.color = 'white'
  } else {
    document.getElementById('color').style.color = 'black'
  }
}

function newBaseColor () {
  const newR = document.getElementById('newRed').value
  const newG = document.getElementById('newGreen').value
  const newB = document.getElementById('newBlue').value

  if (
    pickCounter != 1
  ) {
    document.getElementById('rgbErrorMessage').style.display = 'inline'
    document.getElementById('rgbErrorMessage').innerHTML = 'First, click somewhere on the original image.'
    return
  }

  if (
    Math.min(newR, newG, newB) < 0 ||
    Math.max(newR, newG, newB) > 255 ||
    isNaN(newR + newG + newB) || newR.trim() == '' || newG.trim() == '' || newB.trim() == ''
  ) {
    document.getElementById('rgbErrorMessage').style.display = 'inline'
    document.getElementById('rgbErrorMessage').innerHTML =
      'Each field above must contain a number from 0 to 255.'
    return
  }
  document.getElementById('rgbErrorMessage').style.display = 'none'

  const calcR = newR - red1
  const calcG = newG - green1
  const calcB = newB - blue1

  const imageData = ctxNew.getImageData(0, 0, canvasNew.width, canvasNew.height)
  const dataNew = imageData.data
  const l = dataNew.length / 4

  for (let i = 0; i < l; i++) {
    const r = dataNew[i * 4 + 0]
    const g = dataNew[i * 4 + 1]
    const b = dataNew[i * 4 + 2]

    dataNew[i * 4 + 0] = dataNew[i * 4 + 0] + calcR
    dataNew[i * 4 + 1] = dataNew[i * 4 + 1] + calcG
    dataNew[i * 4 + 2] = dataNew[i * 4 + 2] + calcB
  }
  ctxNew.putImageData(imageData, 0, 0)
  document.getElementById('canvasNew').style.visibility = 'visible'
  document.getElementById('button1').style.display = 'none'
  document.getElementById('done').innerHTML = 'Done!'
}

function reset () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctxNew.clearRect(0, 0, canvasNew.width, canvasNew.height)
  document.getElementById('rgbErrorMessage').innerHTML = ''
  pickCounter = 0
  document.getElementById('color').innerHTML = ''
  red1 = 'undefined'
  green1 = 'undefined'
  blue1 = 'undefined'
  document.getElementById('done').innerHTML = ''
  document.getElementById('canvasNew').style.visibility = 'hidden'
  document.getElementById('nextStep').style.display = 'none'
  document.getElementById('button1').style.display = 'inline'
  document.getElementById('finalStep').style.visibility = 'hidden'
  document.getElementById('begin').style.display = 'inline'
}

canvas.addEventListener('click', pickColor)

button1.addEventListener('click', newBaseColor)

button2.addEventListener('click', reset)
