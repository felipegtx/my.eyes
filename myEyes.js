
(function ($this, d) {

    "use strict";

    $this.addEventListener("load", function () {

        if (!$this.Worker) {
            alert("Woops, your browser does not support this app :(");
            return;
        }

        var currentImageIndex = 0,
            images = [
                /// Just her.
                "http://felipegtx.github.io/my-eye/ela.JPG", 
                "http://felipegtx.github.io/my-eye/ela1.JPG"
            ],
            canvas = d.querySelector("#cnvImages"),
            timeout = null,
            canvasContext = canvas.getContext("2d"),
            myEyes = (function () {

                var _canvasPalette = d.querySelector("#cnvPalette"),
                    _canvasPaletteContext = _canvasPalette.getContext("2d"),
                       _this = {
                           /**
                            * Blinks for a moment to try undestand what we're seeing
                            */
                           blinkTo: function (img, mozaicPieces, then) {

                               mozaicPieces = mozaicPieces || 5;
                               var mozaicHSize = Math.trunc(img.height / mozaicPieces),
                                   mozaicWSize = Math.trunc(img.width / mozaicPieces),
                                   worker = new Worker("palletone.js"),
                                   imageData = null;

                               worker.addEventListener("message", function (event) {

                                   if (event.data === "DONE") {

                                       /// If the next iteration exists
                                       if (typeof then === "function") {
                                           then();
                                       }
                                       return;
                                   }
                                    
                                   /// Let us draw the predominant color 'pixel' representation...
                                   var color = event.data.palette;
                                   _canvasPaletteContext.beginPath();
                                   _canvasPaletteContext.lineWidth = mozaicWSize;
                                   _canvasPaletteContext.strokeStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
                                   _canvasPaletteContext.lineJoin = _canvasPaletteContext.lineCap = 'square';
                                   _canvasPaletteContext.moveTo(event.data.x, event.data.y);
                                   _canvasPaletteContext.lineTo(event.data.x, event.data.y + 1);
                                   _canvasPaletteContext.stroke();
                                   _canvasPaletteContext.closePath();

                                   /// ... then, setup the message to her <3
                                   _canvasPaletteContext.lineWidth = 3;
                                   _canvasPaletteContext.lineJoin = "round";
                                   _canvasPaletteContext.fillStyle = "white";
                                   _canvasPaletteContext.font = "25px Kaushan Script";
                                   _canvasPaletteContext.strokeStyle = "black";
                                   _canvasPaletteContext.strokeText("Para os meus olhos", 480, 415);
                                   _canvasPaletteContext.fillText("Para os meus olhos", 480, 415);
                                   _canvasPaletteContext.font = "55px Kaushan Script";
                                   _canvasPaletteContext.strokeStyle = "black";
                                   _canvasPaletteContext.strokeText("Perfeita", 450, 460);
                                   _canvasPaletteContext.fillText("Perfeita", 450, 460);
                                   _canvasPaletteContext.font = "25px Kaushan Script";
                                   _canvasPaletteContext.strokeStyle = "black";
                                   _canvasPaletteContext.strokeText("em todos os pixels", 500, 480);
                                   _canvasPaletteContext.fillText("em todos os pixels", 500, 480);

                                   // got LSD?
                                   // d.querySelector("body").style.backgroundImage =
                                   //   "url(" + _canvasPalette.toDataURL("image/png") + ")";

                               }, false);

                               var x = 0, y = 0;
                               function requestChain() {
                                   if (x <= img.width) {
                                       
                                       /// Equivalent to moving forward on our loop
                                       if (y > img.height) {
                                           x += mozaicWSize;
                                           y = 0;
                                       }
                                       y += mozaicHSize;
                                       
                                       /// For performance/responsivity reasons the predominant color palette information 
                                       /// is calculated by a separated thread
                                       worker.postMessage({
                                           x: x,
                                           y: y,
                                           imageData: canvasContext.getImageData(x, y, mozaicWSize, mozaicHSize).data
                                       });
                                       
                                       /// By using this approach instead of a classic for-each execution I avoid blocking the 
                                       /// main thread for high-quality image data
                                       $this.requestAnimationFrame(requestChain);
                                   }
                                   else {
                                       worker.postMessage("DONE");
                                   }
                               }

                               /// This implementation frees the main thread by using the request animation frame to schedule new
                               /// pixel color information gattering
                               requestChain();

                               return _this;
                           }
                       };

                return _this;
            })();

        /**
         * Loads a given image onto the base canvas
         * @param string pathToImage Path to the image being loaded
         * @param function onImageLoaded What to do when the image is fully loaded
         */
        function loadImageOntoCanvas(pathToImage, onImageLoaded) {
            var imageObj = new Image();
            imageObj.onload = function () {
                canvasContext.drawImage(this, 0, 0);
                onImageLoaded(this);
            };
            imageObj.src = pathToImage;
        }

        /*
         * Loads one of the selected images into the canvas and waits until the beauty
         * is fully visible before starting over again (until the end of times)
         */
        function loadImage() {
            
            if (currentImageIndex >= images.length) {
                currentImageIndex = 0;
            }
            
            loadImageOntoCanvas(images[currentImageIndex++], function (img) {
                myEyes.blinkTo(img, 10, function () {
                    myEyes.blinkTo(img, 50, function () {

                        /// Show the current image...
                        canvas.style.display = "";
                        
                        /// ... just a little bit 
                        var currentOpacity = 0.1;
                        canvas.style.opacity = currentOpacity;
                        
                        function fadeIn() {
                            if (timeout !== null) {
                                $this.clearTimeout(timeout);
                            }
                            if (currentOpacity <= 1) {
                                canvas.style.opacity = (currentOpacity += 0.1);
                                /// Fade in the current image...
                                timeout = $this.setTimeout(fadeIn, 100);
                            } else {
                                /// ... then fade out ...
                                timeout = $this.setTimeout(fadeOut, 500);
                            }
                        }

                        function fadeOut() {
                            if (timeout !== null) {
                                $this.clearTimeout(timeout);
                            }
                            if (currentOpacity >= 0) {
                                canvas.style.opacity = (currentOpacity -= 0.1);
                                timeout = $this.setTimeout(fadeOut, 100);
                            } else {
                                
                                /// ... move on to the next pretty pic! (:
                                loadImage();
                            }
                        }
                        
                        /// Run the fade-in/out effect chain
                        fadeIn();
                    });
                });
            });
        }
        loadImage();
    });
})(this, document);
