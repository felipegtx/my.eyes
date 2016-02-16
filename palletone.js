self.importScripts("quantize.js");

self.addEventListener("message", function (e) {

    if (e.data === "DONE") {
        self.postMessage("DONE");
        self.close();
        return;
    }

    var colors = [],
        imageData = e.data.imageData;

    for (var colorData = 0; colorData < imageData.length; colorData += 4) {

        var red = imageData[colorData],
            green = imageData[colorData + 1],
            blue = imageData[colorData + 2],
            alpha = imageData[colorData + 3];

        if (alpha >= 150) {
            if (!(red > 250 && green > 250 && blue > 250)) {
                colors.push([red, green, blue]);
            }
        }
    }

    var cmap = MMCQ.quantize(colors, 5);
    if (cmap) {
        self.postMessage({ x: e.data.x, y: e.data.y, palette: cmap.palette()[0] });
    }
    delete colorData;
    delete colors;
    delete cmap;

}, false);
