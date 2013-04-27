(function () {

    function DrawingContextCanvas2D(canvas2Dcontext) {
        this.canvas2DContext = canvas2Dcontext;
        this.width = canvas2Dcontext.canvas.width;
        this.height = canvas2Dcontext.canvas.height;
    }

    // DrawingContext prototype
    Object.defineProperties(DrawingContextCanvas2D.prototype, {
        globalAlpha: {
            get: function get_globalAlpha() {
                return this.canvas2DContext.globalAlpha;
            },
            set: function set_globalAlpha(opacity) {
                this.canvas2DContext.globalAlpha = opacity;
            },
        },
        font: {
            get: function get_font() {
                return this.canvas2DContext.font;
            },
            set: function set_font(fontContext) {
                this.canvas2DContext.font = fontContext;
            },
        },
        fillStyle: {
            get: function get_fillStyle() {
                return this.canvas2DContext.fillStyle;
            },
            set: function set_fillStyle(fill) {
                this.canvas2DContext.fillStyle = fill;
            },
        },

        pushTransform: {
            value: function pushTransform(transform) {
                var context2D = this.canvas2DContext;
                context2D.save();

                var translation = transform.translation;
                if (translation.x != 0.0 || translation.y != 0.0) {
                    context2D.translate(translation.x, translation.y);
                }

                var scale = transform.scale;
                if (scale.x != 1.0 || scale.y != 1.0) {
                    context2D.scale(scale.x, scale.y);
                }
                if (transform.rotation != 0) {
                    context2D.rotate(transform.rotation);
                }
            }
        },

        popTransform: {
            value: function popTransform() {
                this.canvas2DContext.restore();
            }
        },

        drawFrame: {
            value: function (frame) {

                var sourceRect = frame.sourceRect;
                
                this.canvas2DContext.drawImage(frame.image, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, -frame.centerPoint.x, -frame.centerPoint.y, sourceRect.width, sourceRect.height);
            },
        },

        drawFill: {
            value: function drawFill(fill) {

                this.canvas2DContext.fillStyle = fill.pattern;

                var destRect = fill.destRect;
                this.canvas2DContext.fillRect(0, 0, destRect.width, destRect.height);
            },
        },

        measureText: {
            value: function measureText(text) {
                return this.canvas2DContext.measureText(text);
            }
        },
        fillText: {
            value: function fillText(text, x, y) {
                this.canvas2DContext.fillText(text, x, y);
            },
        },

        clear: {
            value: function clear() {
                this.canvas2DContext.clearRect(0, 0, this.width, this.height);
                //this.canvas2DContext.canvas.width = this.canvas2DContext.canvas.width;
            },
        },

        beginDraw: {
            value: function beginDraw() {
                this.clear();
                this.canvas2DContext.save();

            },
        },

        endDraw: {
            value: function endDraw() {
                this.canvas2DContext.restore();
            },
        },
    });

    Acropolis.Graphics.DrawingContextCanvas2D = DrawingContextCanvas2D;
})();