# Color-separation app

Separate image into discrete channels, colored as channel

Inspired by <https://github.com/antiboredom/p5.riso/blob/master/lib/p5.riso.js>

and it's [example sketch](https://github.com/antiboredom/p5.riso/blob/master/tutorials/color-separation.md)

- I am looking to use images for overlays and combinations, and want them in other colors
- Which is why color-name-list is present
- I plan on the core conversions to use [color-convert](https://github.com/Qix-/color-convert)

- the kinda-weird [instance-mode example](https://github.com/antiboredom/p5.riso/tree/a1690e40aa857d86bc6136008cef2f0b33238865/examples/Instance_mode)

## further color research

- https://bgrins.github.io/TinyColor/
- https://github.com/jtnimoy/p5.cmyk.js
- https://levelup.gitconnected.com/notorious-rgb-756f19f3e462
- <https://codegolf.stackexchange.com/questions/114408/extract-an-rgb-channel-of-an-image>

- I ran the bubblegum image through an online CMYK extractor and got a clean (but TINY) image, so there seem to be some flaws in the algorithm
 - https://www.dcode.fr/cmyk-channels
 - https://onlinejpgtools.com/extract-cmyk-channels-from-jpg

- fluorescents from https://www.w3schools.com/colors/colors_crayola.asp
- may look at https://www.shutterstock.com/blog/neon-color-palettes
- https://www.fashiontrendsetter.com/content/color_trends/color-decoder/Color-Code-Neon.html
- https://css-tricks.com/nerds-guide-color-web
- https://app.contrast-finder.org/?lang=en
- https://stackoverflow.com/a/21315790
- https://css-tricks.com/methods-contrasting-text-backgrounds/
- https://en.wikipedia.org/wiki/Web_colors
- https://www.rapidtables.com/web/css/css-color.html#yellow

- [CMYK and filters](https://discourse.processing.org/t/best-way-to-do-this-tint-c-m-y-k/5317/11)

- https://github.com/remistura/p5.palette
- https://geeksoutofthebox.com/2020/09/13/a-color-palette-generator-in-p5-js/
- https://colorjs.io/
- https://tomekdev.com/posts/sorting-colors-in-js <= clusters

- https://www.reddit.com/r/SCREENPRINTING/comments/8qaadd/cmyk_angles_guide_for_color_separation/

### monochrome 

- https://codepen.io/mikeurbonas/pen/poJKKvB
- https://stackoverflow.com/questions/39174195/how-to-re-tint-a-grayscale-image-on-canvas - global compositing 
- https://surma.dev/things/ditherpunk/


## anything that is different

- https://github.com/cyrilf/microbios/blob/e64e6381976842f474a922df29793d84a3d60c99/src/components/Controls.vue
- http://kilobtye.github.io/potrace/# - black-n-white SVG
- LUTs <https://nick-shaw.github.io/cinematiccolor/luts-and-transforms.html>
- <https://threejs.org/docs/#examples/en/math/Lut>
- <https://www.emanueleferonato.com/2018/06/09/playing-with-javascript-photos-and-3d-luts-lookup-tables/> - from p5.riso.js

## web workers

- <https://medium.com/js-dojo/using-web-workers-vue-applications-3de99f4f3371>
- <https://ourcodeworld.com/articles/read/1549/how-to-use-web-workers-in-vuejs>


## doing things with ImageMagick

Well, won't work for a web-app

```
convert CMYK-Chart.png -colorspace cmyk -channel c -negate -separate channel_c.png
convert CMYK-Chart.png -colorspace cmyk -channel m -negate -separate channel_m.png
convert CMYK-Chart.png -colorspace cmyk -channel y -negate -separate channel_y.png
convert CMYK-Chart.png -colorspace cmyk -channel k -negate -separate channel_k.png

convert channel_c.png +level-colors cyan,white channel_c_colored.png
convert channel_m.png +level-colors magenta,white channel_m_colored.png
convert channel_y.png +level-colors yellow,white channel_y_colored.png
```