// from https://onlinejpgtools.com/extract-cmyk-channels-from-jpg
window.bridges["extract-image-color-channels"] = function() {
    var input = {
        data: null,
        preview: null
    }
    var output = {
        data: null,
        preview: null
    }
    var channelCache = {};
    var bridge = function() {
        var tool = this;
        if (tool.trigger == Trigger.EXAMPLE || tool.trigger == Trigger.IMPORT) {
            channelCache = {};
        }
        if (!input.data) {
            input.data = tool.input.element.querySelector(".data");
            input.preview = tool.input.element.querySelector(".preview");
            output.data = tool.output.element.querySelector(".data");
            output.preview = tool.output.element.querySelector(".preview");
        }
        var empty = tool.input.element.querySelector(".side-box").classList.contains("empty");
        if (empty)
            return;
        var opts = parseOptions(tool);
        if (!opts)
            return;
        if (input.preview.width != input.preview.clientWidth) {
            input.preview.width = input.preview.clientWidth;
            input.preview.height = input.preview.clientHeight;
            output.preview.width = output.preview.clientWidth;
            output.preview.height = output.preview.clientHeight;
        }
        var iSize = {
            width: input.data.width,
            height: input.data.height
        }
        var iCtxPreview = input.preview.getContext("2d");
        fillTransparencyEffect(input.preview);
        var iFit = best_image_fit(iSize.width, iSize.height, input.preview.width, input.preview.height);
        iCtxPreview.drawImage(input.data, iFit.offsetX, iFit.offsetY, iFit.width, iFit.height);
        var imgAmount = Object.keys(opts.channels).length;
        var oSize = {
            width: (iSize.width * imgAmount) + 10 * (imgAmount - 1),
            height: input.data.height
        }
        output.data.width = oSize.width;
        output.data.height = oSize.height;
        var ctxData = output.data.getContext("2d");
        if (opts.extension !== 'png') {
            ctxData.fillStyle = "white";
            ctxData.fillRect(0, 0, output.data.width, output.data.height);
        }
        drawImageColorChannels(ctxData, opts);
        tool.respond();
        var oCtxPreview = output.preview.getContext("2d");
        fillTransparencyEffect(output.preview);
        var fontSize = 24;
        var oFit = best_image_fit(oSize.width, oSize.height, output.preview.width, output.preview.height - (fontSize + 20));
        oCtxPreview.drawImage(output.data, oFit.offsetX, oFit.offsetY, oFit.width, oFit.height);
        var textProps = {
            fontSize: fontSize,
            imgWidth: input.data.width / oFit.scale,
            imgHeight: oFit.height,
            offsetX: oFit.offsetX,
            offsetY: oFit.offsetY,
            scale: oFit.scale,
        }
        printColorNames(oCtxPreview, opts.channels, textProps);
    }
    function printColorNames(ctx, channels, opts) {
        ctx.font = opts.fontSize + 'px Arial';
        ctx.fillStyle = 'black';
        var maxWidth = ctx.measureText('Saturation').width;
        var maxW = ctx.measureText('M').width;
        var imgWidth = opts.imgWidth;
        var pos = 0;
        var distance = 10 / opts.scale;
        var channelsArr = Object.keys(channels);
        for (var i = 0; i < channelsArr.length; i++) {
            var name = channelsArr[i][0].toUpperCase() + channelsArr[i].slice(1);
            var text = maxWidth < imgWidth ? name : maxW < imgWidth ? name.slice(0, 1) : '';
            var w = ctx.measureText(text).width;
            var x = Math.round((imgWidth - w) / 2 + opts.offsetX);
            ctx.fillText(text, x + pos, opts.offsetY + opts.imgHeight + opts.fontSize + 5);
            pos += imgWidth + distance;
        }
    }
    function drawImageColorChannels(ctxData, opts) {
        var orgCanvas = document.createElement("canvas");
        var orgCanvasCtx = orgCanvas.getContext("2d");
        orgCanvas.width = input.data.width;
        orgCanvas.height = input.data.height;
        orgCanvasCtx.drawImage(input.data, 0, 0);
        var pos = 0;
        var distance = 10;
        var colorModels = {
            red: 'rgba',
            green: 'rgba',
            blue: 'rgba',
            alpha: 'rgba',
            cyan: 'cmyk',
            magenta: 'cmyk',
            yellow: 'cmyk',
            key: 'cmyk',
            hue: 'hsl',
            saturation: 'hsl',
            light: 'hsl',
        }
        var channels = Object.keys(opts.channels);
        for (var i = 0; i < channels.length; i++) {
            var pixels = orgCanvasCtx.getImageData(0, 0, orgCanvas.width, orgCanvas.height);
            var colorModel = colorModels[channels[i]];
            var channel = {};
            channel[channels[i]] = true;
            if (channelCache[channels[i]]) {
                pixels = channelCache[channels[i]];
            } else {
                extractChannel(pixels, channel);
                channelCache[channels[i]] = pixels;
            }
            if (opts.grayscale[colorModel]) {
                toGrayscale(pixels);
                channelCache[channels[i]] = false;
            }
            ctxData.putImageData(pixels, pos, 0);
            pos += input.data.width + distance;
        }
    }
    function extractChannel(pixels, channel) {
        if (channel['red'] || channel['green'] || channel['blue'] || channel['alpha']) {
            if (channel['red']) {
                for (var i = 0; i < pixels.data.length; i += 4) {
                    pixels.data[i + 1] = 0;
                    pixels.data[i + 2] = 0;
                }
            } else if (channel['green']) {
                for (var i = 0; i < pixels.data.length; i += 4) {
                    pixels.data[i] = 0;
                    pixels.data[i + 2] = 0;
                }
            } else if (channel['blue']) {
                for (var i = 0; i < pixels.data.length; i += 4) {
                    pixels.data[i] = 0;
                    pixels.data[i + 1] = 0;
                }
            } else if (channel['alpha']) {
                for (var i = 0; i < pixels.data.length; i += 4) {
                    pixels.data[i] = 0;
                    pixels.data[i + 1] = 0;
                    pixels.data[i + 2] = 0;
                }
            }
        } else if (channel['cyan'] || channel['magenta'] || channel['yellow'] || channel['key']) {
            for (var i = 0; i < pixels.data.length; i += 4) {
                var cmyk = rgbToCmyk(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]);
                if (channel['cyan'])
                    var rgb = cmykToRgb(cmyk.c, 0, 0, 0);
                else if (channel['magenta'])
                    var rgb = cmykToRgb(0, cmyk.m, 0, 0);
                else if (channel['yellow'])
                    var rgb = cmykToRgb(0, 0, cmyk.y, 0);
                else if (channel['key'])
                    var rgb = cmykToRgb(0, 0, 0, cmyk.k);
                pixels.data[i] = rgb.r;
                pixels.data[i + 1] = rgb.g;
                pixels.data[i + 2] = rgb.b;
            }
        } else if (channel['hue'] || channel['saturation'] || channel['light']) {
            for (var i = 0; i < pixels.data.length; i += 4) {
                var hsl = rgbToHsl(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]);
                if (channel['hue'])
                    var rgb = hslToRgb(hsl.h, 0.5, 0.5);
                else if (channel['saturation'])
                    var rgb = hslToRgb(0, hsl.s, 0.5);
                else if (channel['light'])
                    var rgb = hslToRgb(0, 0, hsl.l);
                pixels.data[i] = rgb.r;
                pixels.data[i + 1] = rgb.g;
                pixels.data[i + 2] = rgb.b;
            }
        }
    }
    function toGrayscale(pixels) {
        for (var i = 0; i < pixels.data.length; i += 4) {
            var r = pixels.data[i + 0];
            var g = pixels.data[i + 1];
            var b = pixels.data[i + 2];
            var c = 0;
            c = (r + g + b) / 3;
            pixels.data[i + 0] = c;
            pixels.data[i + 1] = c;
            pixels.data[i + 2] = c;
        }
        return pixels;
    }
    function rgbToCmyk(r, g, b) {
        var c = 1 - (r / 255);
        var m = 1 - (g / 255);
        var y = 1 - (b / 255);
        var k = Math.min(c, Math.min(m, y));
        c = (c - k) / (1 - k);
        m = (m - k) / (1 - k);
        y = (y - k) / (1 - k);
        c = Math.round(c * 10000) / 100;
        m = Math.round(m * 10000) / 100;
        y = Math.round(y * 10000) / 100;
        k = Math.round(k * 10000) / 100;
        c = isNaN(c) ? 0 : c;
        m = isNaN(m) ? 0 : m;
        y = isNaN(y) ? 0 : y;
        k = isNaN(k) ? 0 : k;
        return {
            c: c,
            m: m,
            y: y,
            k: k
        }
    }
    function cmykToRgb(c, m, y, k) {
        c = (c / 100);
        m = (m / 100);
        y = (y / 100);
        k = (k / 100);
        c = c * (1 - k) + k;
        m = m * (1 - k) + k;
        y = y * (1 - k) + k;
        var r = 1 - c;
        var g = 1 - m;
        var b = 1 - y;
        r = Math.round(255 * r);
        g = Math.round(255 * g);
        b = Math.round(255 * b);
        return {
            r: r,
            g: g,
            b: b
        }
    }
    function rgbToHsl(r, g, b) {
        r = r / 255;
        g = g / 255;
        b = b / 255;
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var average = (max + min) / 2;
        var h = average;
        var s = average;
        var l = average;
        if (max == min) {
            h = s = 0;
        } else {
            var difference = max - min;
            s = l > 0.5 ? difference / (2 - max - min) : difference / (max + min);
            if (max == r)
                h = (g - b) / difference + (g < b ? 6 : 0);
            else if (max == g)
                h = (b - r) / difference + 2;
            else if (max == b)
                h = (r - g) / difference + 4;
            h /= 6;
        }
        return {
            h: h,
            s: s,
            l: l
        }
    }
    function hslToRgb(h, s, l) {
        var r, g, b;
        if (s == 0) {
            r = g = b = l;
        } else {
            var hueToRgb = function hueToRgb(p, q, t) {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hueToRgb(p, q, h + 1 / 3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1 / 3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        }
    }
    function parseOptions(tool) {
        var options = tool.options.get();
        var error = function(a, b) {
            tool.output.showNegativeBadge(a, b, -1);
        }
        var extension = options['extension'] || 'png';
        var channels = {};
        if (options['red-channel'])
            channels['red'] = true;
        if (options['green-channel'])
            channels['green'] = true;
        if (options['blue-channel'])
            channels['blue'] = true;
        if (options['alpha-channel'])
            channels['alpha'] = true;
        if (options['cyan-channel'])
            channels['cyan'] = true;
        if (options['magenta-channel'])
            channels['magenta'] = true;
        if (options['yellow-channel'])
            channels['yellow'] = true;
        if (options['key-channel'])
            channels['key'] = true;
        if (options['hue-channel'])
            channels['hue'] = true;
        if (options['saturation-channel'])
            channels['saturation'] = true;
        if (options['light-channel'])
            channels['light'] = true;
        if (Object.keys(channels).length == 0) {
            error("No Color Channel Selected", "Select at least one color channel of the image to draw.");
            return false;
        }
        var grayscale = {}
        if (options['rgba-grayscale'])
            grayscale['rgba'] = true;
        if (options['cmyk-grayscale'])
            grayscale['cmyk'] = true;
        if (options['hsl-grayscale'])
            grayscale['hsl'] = true;
        return {
            extension: extension,
            channels: channels,
            grayscale: grayscale
        }
    }
    function fillTransparencyEffect(canvas) {
        var ctx = canvas.getContext("2d");
        var w = canvas.width;
        var h = canvas.height;
        var size = 15;
        var odd = true;
        for (var i = 0; i <= w; i += size) {
            for (var j = 0; j <= h; j += size) {
                if (odd)
                    ctx.fillStyle = "#ffffff";
                else
                    ctx.fillStyle = "#efefef";
                odd = !odd;
                ctx.fillRect(i, j, i + size, j + size);
            }
        }
    }
    function getExtension() {
        return this.options.get().extension || "png";
    }
    return {
        converter: bridge,
        config: {
            type: "image",
            input: {
                import: "base64",
                noClipboard: true,
                download: getExtension,
                image: true
            },
            output: {
                download: getExtension,
                noClipboard: true
            }
        }
    }
}
;
function best_image_fit(width, height, maxWidth, maxHeight) {
    if (width >= maxWidth) {
        var scaleW = width / maxWidth;
        var scaleH = height / maxHeight;
        if (scaleW > scaleH) {
            return {
                width: maxWidth,
                height: height / scaleW,
                offsetX: 0,
                offsetY: (maxHeight - (height / scaleW)) / 2,
                scale: scaleW
            };
        } else {
            return {
                width: width / scaleH,
                height: height / scaleH,
                offsetX: (maxWidth - (width / scaleH)) / 2,
                offsetY: (maxHeight - (height / scaleH)) / 2,
                scale: scaleH
            };
        }
    } else {
        if (height > maxHeight) {
            var scale = height / maxHeight;
            return {
                width: width / scale,
                height: height / scale,
                offsetX: (maxWidth - (width / scale)) / 2,
                offsetY: 0,
                scale: scale
            };
        } else {
            return {
                width: width,
                height: height,
                offsetX: (maxWidth - width) / 2,
                offsetY: (maxHeight - height) / 2,
                scale: 1
            };
        }
    }
}
;