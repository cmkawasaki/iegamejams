(function () {
    
    var _math = Acropolis.Math;

    function Sprite() {
        this.children = new Array();
        this.transform = _math.Transform2.identity.clone();
        this.parent = null;
    }

    // Sprite prototype
    Object.defineProperties(Sprite.prototype, {
        spriteType: {
            get: function getSpriteType() { 
                return /[^ \(]+(?=\()/.exec(Object.getPrototypeOf(this).constructor.toString())[0];
            },
            enumerable: true
        },
        draw: {
            value: function draw(drawingContext, time) {

                drawingContext.pushTransform(this.transform);

                this.drawCore(drawingContext, time);

                var len = this.children.length;

                for (var i = 0; i < len; i++) {
                    var child = this.children[i];
                    child.draw(drawingContext, time);
                }

                drawingContext.popTransform();
            },
        },
        drawCore: {
            value: function drawCore(drawingContext, time) {
                // Basic sprites are invisible, derived sprites should override this
            },
        },

        addChild: {
            value: function addChild(child) {
                if (child.parent !== null) {
                    throw "Child cannot be added, already has a parent.";
                }
                this.children.push(child);
                child.parent = this;
            },
        },

        removeChild: {
            value: function removeChild(child) {
                if (child.parent !== this) {
                    throw "Not my baby!";
                }
                this.children.splice(this.children.indexOf(child), 1);
                child.parent = null;
            },
        },
    });

    Acropolis.Graphics.Sprite = Sprite;

    function FrameSprite(frame) {
        Sprite.call(this, arguments);
        this.frame = frame;
    }

    FrameSprite.prototype = Object.create(Sprite.prototype);
    FrameSprite.prototype.constructor = FrameSprite;

    // FrameSprite prototype
    Object.defineProperties(FrameSprite.prototype, {
        drawCore: {
            value: function drawCore(drawingContext, time) {
                drawingContext.drawFrame(this.frame);
            },
        },

    });

    Acropolis.Graphics.FrameSprite = FrameSprite;

    function FillSprite(fill) {
        Sprite.call(this, arguments);
        this.fill = fill;
    }

    FillSprite.prototype = Object.create(Sprite.prototype);
    FillSprite.prototype.constructor = FillSprite;

    // FrameSprite prototype
    Object.defineProperties(FillSprite.prototype, {
        drawCore: {
            value: function drawCore(drawingContext, time) {
                drawingContext.drawFill(this.fill);
            },
        },
    });

    Acropolis.Graphics.FillSprite = FillSprite;

    function LayerAlphaSprite(opacity) {
        Sprite.call(this, arguments);

        this.opacity = opacity;
    }
    LayerAlphaSprite.prototype = Object.create(Sprite.prototype);
    LayerAlphaSprite.prototype.constructor = LayerAlphaSprite;

    Object.defineProperties(LayerAlphaSprite.prototype, {
        draw: {
            value: function draw(drawingContext, time) {
                var oldAlpha = drawingContext.globalAlpha;
                drawingContext.globalAlpha = this.opacity;

                Sprite.prototype.draw.call(this, drawingContext, time);

                drawingContext.globalAlpha = oldAlpha;
            },
        },
    });

    Acropolis.Graphics.LayerAlphaSprite = LayerAlphaSprite;

    function TextSprite(text, fontStyle, fontColor) {
        Sprite.call(this, arguments);

        this.text = text;
        this.fontStyle = fontStyle;
        this.fontColor = fontColor;
    }
    TextSprite.prototype = Object.create(Sprite.prototype);
    TextSprite.prototype.constructor = TextSprite;

    Object.defineProperties(TextSprite.prototype, {
        drawCore: {
            value: function drawCore(drawingContext, time) {
                var oldFont = drawingContext.font;
                var oldFill = drawingContext.fillStyle;

                drawingContext.font = this.fontStyle;
                drawingContext.fillStyle = this.fontColor;
                drawingContext.fillText(this.text, this.transform.translation.x, this.transform.translation.y);

                drawingContext.font = oldFont;
                drawingContext.fillStyle = oldFill;
            },
        },
        measureText: {
            value: function measureText(drawingContext, time) {
                var oldFont = drawingContext.font;
                var oldFill = drawingContext.fillStyle;

                drawingContext.font = this.fontStyle;
                drawingContext.fillStyle = this.fontColor;
                var measure = drawingContext.measureText(this.text);

                drawingContext.font = oldFont;
                drawingContext.fillStyle = oldFill;

                return measure;
            },
        },
    });

    Acropolis.Graphics.TextSprite = TextSprite;
})();