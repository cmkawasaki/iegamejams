(function () {

    _math = Acropolis.Math;

    function Fill(pattern, destCX, destCY) {
        this.pattern = pattern;

        this.destRect = {
            width: destCX,
            height: destCY
        }
    }

    Acropolis.Graphics.Fill = Fill;
})();