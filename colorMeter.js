// from https://embed.plnkr.co/plunk/ERaf37


function color_meter (_cwith2, _ccolor2) {
    const _r = _cwith2[0]
    const _g = _cwith2[1]
    const _b = _cwith2[2]
  
    const __r = _ccolor2[0]
    const __g = _ccolor2[1]
    const __b = _ccolor2[2]
  
    let p1 = (_r / 255) * 100
    let p2 = (_g / 255) * 100
    let p3 = (_b / 255) * 100
  
    const perc1 = Math.round((p1 + p2 + p3) / 3)
  
    p1 = (__r / 255) * 100
    p2 = (__g / 255) * 100
    p3 = (__b / 255) * 100
  
    const perc2 = Math.round((p1 + p2 + p3) / 3)
  
    const result = Math.abs(perc1 - perc2)
  }

function color_meter () {
  const cwith2 = $('#color1-input').val()
  const ccolor2 = $('#color2-input').val()

  if (!cwith2 && !ccolor2) return

  const _cwith2 = (cwith2.charAt(0) == '#') ? cwith2.substring(1, 7) : cwith2
  const _ccolor2 = (ccolor2.charAt(0) == '#') ? ccolor2.substring(1, 7) : ccolor2

  const _r = parseInt(_cwith2.substring(0, 2), 16)
  const _g = parseInt(_cwith2.substring(2, 4), 16)
  const _b = parseInt(_cwith2.substring(4, 6), 16)

  const __r = parseInt(_ccolor2.substring(0, 2), 16)
  const __g = parseInt(_ccolor2.substring(2, 4), 16)
  const __b = parseInt(_ccolor2.substring(4, 6), 16)

  let p1 = (_r / 255) * 100
  let p2 = (_g / 255) * 100
  let p3 = (_b / 255) * 100

  const perc1 = Math.round((p1 + p2 + p3) / 3)

  p1 = (__r / 255) * 100
  p2 = (__g / 255) * 100
  p3 = (__b / 255) * 100

  const perc2 = Math.round((p1 + p2 + p3) / 3)

  const result = Math.abs(perc1 - perc2)
  $('.result').text(result)
  $('h1').show()
}

function parseTextColor () {
  const cwith2 = $('#color1-input').val()
  const ccolor2 = $('#color2-input').val()

  if (!cwith2 && !ccolor2) return

  $('#color1-input').css({ color: cwith2 })
  $('#color2-input').css({ color: ccolor2 })
  $('.color1-block').css({ 'background-color': cwith2 })
  $('.color2-block').css({ 'background-color': ccolor2 })
}

$(document).ready(function () {
  parseTextColor()
  $('h1').hide()

  $('form').submit(function (event) {
    event.preventDefault()
    parseTextColor()
    color_meter()
  })
})
