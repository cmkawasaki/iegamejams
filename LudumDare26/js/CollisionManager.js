function CollisionManager() {
}

CollisionManager.prototype = Object.create(null);
CollisionManager.prototype.constructor = CollisionManager;

Object.defineProperties(CollisionManager.prototype, {
    initLayers: {
        value: function initLayers(layerSource, layerTarget, ignoreSource, ignoreTarget) {
            this.layerSource = layerSource;
            this.layerTarget = layerTarget;
            if (ignoreSource) this.ignoreSource = true;
            if (ignoreTarget) this.ignoreTarget = true;
        },
    },

    getCollisions: {
        value: function getCollisions() {
            var collisions = [];

            this.layerSource.children.forEach(function (spriteLeft) {
                var centerPoint = spriteLeft.frame.centerPoint;
                var translation = spriteLeft.transform.translation;

                var left = translation.x - centerPoint.x;
                var right = translation.x + centerPoint.x;
                var top = translation.y - centerPoint.y;
                var bottom = translation.y + centerPoint.y;

                this.layerTarget.children.forEach(function (spriteRight) {
                    var centerPoint2 = spriteRight.frame.centerPoint;
                    var translation2 = spriteRight.transform.translation;

                    var left2 = translation2.x - centerPoint2.x;
                    var right2 = translation2.x + centerPoint2.x;
                    var top2 = translation2.y - centerPoint2.y;
                    var bottom2 = translation2.y + centerPoint2.y;

                    if (!(left2 > right || right2 < left || top2 > bottom || bottom2 < top))
                    {
                        collisions.push({
                            layerLeft: this.layerSource,
                            layerRight: this.layerTarget,
                            spriteLeft: spriteLeft,
                            spriteRight: spriteRight
                        });
                    }
                }, this);
            }, this);

            return collisions;
        },
    },
});
