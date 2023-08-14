// https://stackoverflow.com/questions/5495952/draw-svg-on-html5-canvas-with-support-for-font-element

const canvas = document.getElementsByTagName('canvas')[0]
canvas.width = canvas.height = 600
const ctx = canvas.getContext('2d')
const img = new Image()
img.onload = function () { ctx.drawImage(img, 0, 0) }
img.src = '/svg/tiger.svg'
