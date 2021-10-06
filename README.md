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