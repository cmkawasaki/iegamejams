(function () {

    var _drawingContextCanvas2D = Acropolis.Graphics.DrawingContextCanvas2D;
    var _matrix3 = Acropolis.Math.Matrix3;

    function DrawingContextCanvas2DMatrix(canvas2Dcontext) {

        _drawingContextCanvas2D.apply(this, arguments);
        this.transforms = new Array();

        // identity
        this.transforms.push(_matrix3.makeTranslation(0, 0));
    }

    DrawingContextCanvas2DMatrix.prototype = Object.create(_drawingContextCanvas2D.prototype);
    DrawingContextCanvas2DMatrix.prototype.constructor = DrawingContextCanvas2DMatrix;

    // DrawingContext prototype
    Object.defineProperties(DrawingContextCanvas2DMatrix.prototype, {

        pushTransform: {
            value: function pushTransform(transform) {

                var scale = transform.scale;
                var translation = transform.translation;
                var rotation = transform.rotation;

                var localtransform = _matrix3.compose(translation.x, translation.y, scale.x, scale.y, rotation);
                var globaltransform = _matrix3.matrixMultiply(localtransform, this.transforms[this.transforms.length - 1]);

                _matrix3.releaseMatrix(localtransform);

                this.transforms.push(globaltransform);
            }
        },

        popTransform: {
            value: function popTransform() {
                var matrix = this.transforms.pop();
                _matrix3.releaseMatrix(matrix);
            }
        },

        drawFrame: {
            value: function drawFrame(frame) {
                
                var transform = this.transforms[this.transforms.length - 1];
                this.canvas2DContext.setTransform(transform[0], transform[1], transform[3], transform[4], transform[6], transform[7]);

                _drawingContextCanvas2D.prototype.drawFrame.call(this, frame);
            },
        },
        fillText: {
            value: function fillText(text, x, y) {
                var transform = this.transforms[this.transforms.length - 1];
                this.canvas2DContext.setTransform(transform[0], transform[1], transform[3], transform[4], transform[6], transform[7]);

                _drawingContextCanvas2D.prototype.fillText.call(this, text, x, y);
            },
        },
        drawFill: {
            value: function drawFill(fill) {

                var transform = this.transforms[this.transforms.length - 1];
                this.canvas2DContext.setTransform(transform[0], transform[1], transform[3], transform[4], transform[6], transform[7]);

                _drawingContextCanvas2D.prototype.drawFill.call(this, fill);
            },
        },
    });

    Acropolis.Graphics.DrawingContextCanvas2DMatrix = DrawingContextCanvas2DMatrix;
})();