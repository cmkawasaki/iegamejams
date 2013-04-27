if (this.Acropolis === undefined) {
    this.Acropolis = {};
}

(function () {

    _math = {};

    // Math statics
    Object.defineProperties(_math, {

        lerp: {
            value: function (min, max, amount) {
                return min + (max - min) * amount;
            },
            writeable: false,
            configurable: false,
        },

        randomBool: {
            value: function randomBool(chance) {
                if (chance === undefined) {
                    chance = 0.5;
                }
                return Math.random() >= chance;
            },
            writeable: false,
            configurable: false,
        },

        randomFloat: {
            value: function randomFloat(min, max) {
                return this.lerp(min, max, Math.random());
            },
            writeable: false,
            configurable: false,
        },
        
        toUnitVector2: {
            value: function toUnitVector2(rotation) {
                return new Vector2(Math.cos(rotation), Math.sin(rotation));
            },
            writeable: false,
            configurable: false,
        },

        toRotation: {
            value: function (unitVector) {
                return Math.atan2(unitVector.y, unitVector.x);
            },
        },

        toDegrees: {
            value: function (radians) {
                return radians / Math.PI * 180.0;
            },
            writeable: false,
            configurable: false,
        },

        toRadians: {
            value: function (degrees) {
                return degrees / 180.0 * Math.PI;
            },
            writeable: false,
            configurable: false,
        },

        Pi: {
            value: Math.PI,
            writeable: false,
            configurable: false,
        },

        PiOver2: {
            value: Math.PI / 2.0,
            writeable: false,
            configurable: false,
        },

        PiOver4: {
            value: Math.PI / 4.0,
            writeable: false,
            configurable: false,
        },

        TwoPi: {
            value: Math.PI * 2.0,
            writeable: false,
            configurable: false,
        },

    });

    Acropolis.Math = _math;

    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    };

    // Vector2 prototype
    Object.defineProperties(Vector2.prototype, {

        clone: {
            value: function () {
                return new Vector2(this.x, this.y);
            },
        },

        length: {
            value: function () {
                return Math.sqrt(this.lengthSquared());
            },
        },

        lengthSquared: {
            value: function () {
                return Vector2.dot(this, this);
            },
        },

        normalize: {
            value: function () {
                this.scale(1.0 / this.length());
            },
        },

        scale: {
            value: function (scale) {
                this.x *= scale;
                this.y *= scale;
            },
        },

        rotate: {
            value: function (rotation) {
                var cosRot = Math.cos(rotation);
                var sinRot = Math.sin(rotation);
                var xNew = this.x * cosRot - this.y * sinRot;
                var yNew = this.x * sinRot + this.y * cosRot;

                this.x = xNew;
                this.y = yNew;
            },
        },

        add: {
            value: function add(vector2) {
                this.x += vector2.x;
                this.y += vector2.y;
            },
        },

        subtract: {
            value: function subtract(vector2) {
                this.x -= vector2.x;
                this.y -= vector2.y;
            },
        },
    });

    // Vector2 statics
    Object.defineProperties(Vector2, {

        unitX: {
            value: new Vector2(1.0, 0.0),
            writeable: false,
            configurable: false,
        },

        unitY: {
            value: new Vector2(0.0, 1.0),
            writeable: false,
            configurable: false,
        },

        zero: {
            value: new Vector2(0.0, 0.0),
            writeable: false,
            configurable: false,
        },

        one: {
            value: new Vector2(1.0, 1.0),
            writeable: false,
            configurable: false,
        },

        dot: {
            value: function dot(v2Left, v2Right) {
                return v2Left.x * v2Right.x + v2Left.y * v2Right.y;
            },
            writeable: false,
            configurable: false,
        },

        lerp: {
            value: function lerp(v2Min, v2Max, amount) {
                return new Vector2(_math.lerp(v2Min.x, v2Max.x), _math.lerp(v2Min.y, v2Max.y), amount);
            },
            writeable: false,
            configurable: false,
        },

        multiply: {
            value: function multiply(v2left, v2right) {
                return new Vector2(v2left.x * v2right.x, v2left.y * v2right.y);
            },
            writeable: false,
            configurable: false,
        },
    });

    Acropolis.Math.Vector2 = Vector2;

    function Transform2(v2Scale, rotation, v2Translation) {
        this.scale = v2Scale;
        this.rotation = rotation;
        this.translation = v2Translation;
    };

    // Transform2 prototype
    Object.defineProperties(Transform2.prototype, {
        transform: {
            value: function transform(v2) {
                var v2New = _math.Vector2.multiply(v2, this.scale);
                v2New.rotate(this.rotation);
                v2New.add(this.translation);

                return v2New;
            },
        },

        clone: {
            value: function clone() {
                return new Transform2(this.scale.clone(), this.rotation, this.translation.clone());
            },
        },
    });

    // Transform2 statics
    Object.defineProperties(Transform2, {

        identity: {
            value: new Transform2(Vector2.one, 0.0, Vector2.zero),
            writeable: false,
            configurable: false,
        },

        compose: {
            value: function compose(t2parent, t2local) {
                throw "not implemented";
            },
            writeable: false,
            configurable: false,
        },
    });

    Acropolis.Math.Transform2 = Transform2;

    function Matrix3() {
    };

    Matrix3.pool = new Array();
    Matrix3.poolCount = 0;

    // Matrix3 statics
    Object.defineProperties(Matrix3, {
        aquireMatrix: {
            value: function aquireMatrix() {
                if (Matrix3.poolCount > 0) {
                    return Matrix3.pool[--Matrix3.poolCount];
                }
                else {
                    return [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0];
                }
            },
            writeable: false,
            configurable: false,
        },

        releaseMatrix: {
            value: function releaseMatrix(matrix) {
                if (Matrix3.poolCount < 100) {
                    Matrix3.pool[Matrix3.poolCount++] = matrix;
                }
            },
            writeable: false,
            configurable: false,
        },

        makeTranslation: {
            value: function makeTranslation(tx, ty) {
                var matrix = [
                  1, 0, 0,
                  0, 1, 0,
                  tx, ty, 1
                ];
                matrix.simple = true;
                return matrix;
            },
            writeable: false,
            configurable: false,
        },

        makeScale: {
            value: function makeScale(sx, sy) {
                var matrix = [
                  sx, 0, 0,
                  0, sy, 0,
                  0, 0, 1
                ];
                matrix.simple = true;
                return matrix;
            },
            writeable: false,
            configurable: false,
        },

        makeRotation: {
            value: function makeRotation(angleInRadians) {
                var c = Math.cos(angleInRadians);
                var s = Math.sin(angleInRadians);
                return [
                  c, -s, 0,
                  s, c, 0,
                  0, 0, 1
                ];
            },
            writeable: false,
            configurable: false,
        },

        compose: {
            value: function compose(tx, ty, sx, sy, angleInRadians) {
                var matrix;
                if ( angleInRadians === 0 ) {
                    matrix = Matrix3.aquireMatrix();
                    matrix[0] = sx;
                    matrix[1] = 0;
                    matrix[2] = 0;
                    matrix[3] = 0;
                    matrix[4] = sy;
                    matrix[5] = 0;
                    matrix[6] = tx;
                    matrix[7] = ty;
                    matrix[8] = 1;
                    matrix.simple = true;
                }
                else {
                    var c = Math.cos(angleInRadians);
                    var s = Math.sin(angleInRadians);
               
                    matrix = Matrix3.aquireMatrix();
                    matrix[0] = sx * c;
                    matrix[1] = -sx * s;
                    matrix[2] = 0;
                    matrix[3] = sy * s;
                    matrix[4] = sy * c;
                    matrix[5] = 0;
                    matrix[6] = tx;
                    matrix[7] = ty;
                    matrix[8] = 1;
                    matrix.simple = false;
                }

                /*
                return [
                    sx * c, -sx * s, 0,
                    sy * s, sy * c, 0,
                    tx, ty, 1
                ]; */
                return matrix;
            },
            writeable: false,
            configurable: false,
        },

        matrixMultiply: {
            value: function matrixMultiply(a, b) {
                if ( a.simple && b.simple ) {
                    var a00 = a[0];
                    var a11 = a[4];
                    var a20 = a[6];
                    var a21 = a[7];
                    var a22 = a[8];
                
                    var b00 = b[0];
                    var b11 = b[4];
                    var b20 = b[6];
                    var b21 = b[7];
                    var b22 = b[8];
                
                    var matrix = Matrix3.aquireMatrix();

                    matrix[0] = a00 * b00;
                    matrix[1] = 0;
                    matrix[2] = 0;
                    matrix[3] = 0;
                    matrix[4] = a11 * b11;
                    matrix[5] = 0;
                    matrix[6] = a20 * b00 + a22 * b20;
                    matrix[7] = a21 * b11 + a22 * b21;
                    matrix[8] = a22 * b22;
                    matrix.simple = true;
                }
                else {
                    var a00 = a[0 * 3 + 0];
                    var a01 = a[0 * 3 + 1];
                    var a10 = a[1 * 3 + 0];
                    var a11 = a[1 * 3 + 1];
                    var a20 = a[2 * 3 + 0];
                    var a21 = a[2 * 3 + 1];
                    var a22 = a[2 * 3 + 2];
                
                    var b00 = b[0 * 3 + 0];
                    var b01 = b[0 * 3 + 1];
                    var b10 = b[1 * 3 + 0];
                    var b11 = b[1 * 3 + 1];
                    var b20 = b[2 * 3 + 0];
                    var b21 = b[2 * 3 + 1];
                    var b22 = b[2 * 3 + 2];
                
                    var matrix = Matrix3.aquireMatrix();

                    matrix[0] = a00 * b00 + a01 * b10;
                    matrix[1] = a00 * b01 + a01 * b11;
                    matrix[2] = 0;
                    matrix[3] = a10 * b00 + a11 * b10;
                    matrix[4] = a10 * b01 + a11 * b11;
                    matrix[5] = 0;
                    matrix[6] = a20 * b00 + a21 * b10 + a22 * b20;
                    matrix[7] = a20 * b01 + a21 * b11 + a22 * b21;
                    matrix[8] = a22 * b22;
                    matrix.simple = false;
                }

                return matrix;
                /*
                return [a00 * b00 + a01 * b10 + a02 * b20,
                        a00 * b01 + a01 * b11 + a02 * b21,
                        a00 * b02 + a01 * b12 + a02 * b22,
                        a10 * b00 + a11 * b10 + a12 * b20,
                        a10 * b01 + a11 * b11 + a12 * b21,
                        a10 * b02 + a11 * b12 + a12 * b22,
                        a20 * b00 + a21 * b10 + a22 * b20,
                        a20 * b01 + a21 * b11 + a22 * b21,
                        a20 * b02 + a21 * b12 + a22 * b22];*/
            },
            writeable: false,
            configurable: false,
        },
    });

    Acropolis.Math.Matrix3 = Matrix3;

})();