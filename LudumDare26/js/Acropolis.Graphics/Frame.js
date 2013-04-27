Acropolis.Graphics = {};

(function () {

    _math = Acropolis.Math;

    function Frame(img, sourceX, sourceY, sourceCX, sourceCY) {
        this.image = img;

        this.centerPoint = new _math.Vector2(sourceCX / 2.0, sourceCY / 2.0);

        this.sourceRect = {
            x: sourceX,
            y: sourceY,
            width: sourceCX,
            height: sourceCY
        }
    }

    Acropolis.Graphics.Frame = Frame;
})();