(function () {

    var _matrix3 = Acropolis.Math.Matrix3;

    function DrawingContextCanvasWebGL(gl) {

        this.gl = gl;
        
        // Shader data model
        this.texture = null;
        
        var maxVertices = 48;
        this.positionAndTextCoords = new Float32Array(maxVertices * 4);
        this.transformScaleRotations = new Float32Array(maxVertices * 4);
        this.transformTranslations = new Float32Array(maxVertices * 2);

        this.vertexCount = 0;
        this.maxVertices = maxVertices;

        this.transforms = new Array();

        // identity
        this.transforms.push(_matrix3.makeTranslation(0, 0));

        var vertexShader = createShaderFromScript(gl, "2d-vertex-shader");
        var fragmentShader = createShaderFromScript(gl, "2d-fragment-shader");
        var program = createProgram(gl, [vertexShader, fragmentShader]);
        gl.useProgram(program);
        
        this.resolutionUniform = gl.getUniformLocation(program, "uResolution");
        this.samplerUniform = gl.getUniformLocation(program, "uSampler");
        this.positionAndTexCoordAttribute = gl.getAttribLocation(program, "aPositionAndTexCoord");
        this.transformScaleRotationAttribute = gl.getAttribLocation(program, "aTransformScaleRotation");
        this.transformTranslationAttribute = gl.getAttribLocation(program, "aTransformTranslation");

        //gl.enable(gl.DEPTH_TEST);

        initBuffers(gl, this);
    }

    var initBuffers = function (gl, drawingContext) {    

        gl.enableVertexAttribArray(drawingContext.positionAndTexCoordAttribute);
        gl.enableVertexAttribArray(drawingContext.transformScaleRotationAttribute);
        gl.enableVertexAttribArray(drawingContext.transformTranslationAttribute);

        drawingContext.bufferPosAndTexCoords = gl.createBuffer();
        drawingContext.bufferTransformScaleRotations = gl.createBuffer();
        drawingContext.bufferTransformTranslations = gl.createBuffer();
    }

    var createShaderFromScript = function (gl, scriptId) {

        var shaderSource = "";
        var shaderType;
        var shaderScript = document.getElementById(scriptId);
        shaderSource = shaderScript.text;

        if (shaderScript.type == "x-shader/x-vertex") {
            shaderType = gl.VERTEX_SHADER;
        }
        else if (shaderScript.type == "x-shader/x-fragment") {
            shaderType = gl.FRAGMENT_SHADER;
        }

        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            lastError = gl.getShaderInfoLog(shader);
            alert("*** Error compiling shader '" + shader + "':" + lastError);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    };

    var createProgram = function (gl, shaders) {

        var program = gl.createProgram();
        for (var i = 0; i < shaders.length; ++i) {
            gl.attachShader(program, shaders[i]);
        }
        gl.linkProgram(program);

        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            lastError = gl.getProgramInfoLog(program);
            alert("Error in program linking:" + lastError);

            gl.deleteProgram(program);
            return null;
        }

        return program;
    }

    // DrawingContext prototype
    Object.defineProperties(DrawingContextCanvasWebGL.prototype, {

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

                var image = frame.image;
                var imageWidth = image.width;
                var imageHeight = image.height;

                var verticesPerQuad = 6;

                if (this.vertexCount + verticesPerQuad >= this.maxVertices || (this.texture != null && this.texture.image != image)) {

                    // Flush
                    this.endDraw();
                    this.beginDraw();
                }

                var centerPoint = frame.centerPoint;
                var sourceRect = frame.sourceRect;

                var transform = this.transforms[this.transforms.length - 1];

                for (var i = 0; i < verticesPerQuad; i++) {

                    var dx;
                    var dy;
                    var sx;
                    var sy;
                    switch (i) {
                        case 0:
                        case 5:
                            dx = -centerPoint.x;
                            dy = -centerPoint.y;
                            sx = sourceRect.x / imageWidth;
                            sy = 1.0 - (sourceRect.y / imageHeight);
                            break;
                        case 1:
                            dx = centerPoint.x;
                            dy = -centerPoint.y;
                            sx = (sourceRect.x + sourceRect.width) / imageWidth;
                            sy = 1.0 - (sourceRect.y / imageHeight);
                            break;
                        case 2:
                        case 3:
                            dx = centerPoint.x;
                            dy = centerPoint.y;
                            sx = (sourceRect.x + sourceRect.width) / imageWidth;
                            sy = 1.0 - ((sourceRect.y + sourceRect.height) / imageHeight);
                            break;
                        case 4:
                            dx = -centerPoint.x;
                            dy = centerPoint.y;
                            sx = sourceRect.x / imageWidth;
                            sy = 1.0 - ((sourceRect.y + sourceRect.height) / imageHeight);
                            break;
                    }
                    
                    var v4Count = this.vertexCount * 4;
                    var v2Count = this.vertexCount * 2;

                    var positionAndTextCoords = this.positionAndTextCoords;
                    var transformScaleRotations = this.transformScaleRotations;
                    var transformTranslations = this.transformTranslations;

                    positionAndTextCoords[v4Count] = dx;
                    positionAndTextCoords[v4Count + 1] = dy;
                    positionAndTextCoords[v4Count + 2] = sx;
                    positionAndTextCoords[v4Count + 3] = sy;

                    transformScaleRotations[v4Count] = transform[0];
                    transformScaleRotations[v4Count + 1] = transform[1];
                    transformScaleRotations[v4Count + 2] = transform[3];
                    transformScaleRotations[v4Count + 3] = transform[4];
                    
                    transformTranslations[v2Count] = transform[6];
                    transformTranslations[v2Count + 1] = transform[7];

                    /*
                    var vertexData = new Float32Array([
                        // m11, m12, m13, 0,
                        // m21, m22, m23, 0,
                        // m31, m32, m33, 0,
                        // dx, dy, sx, sy,
                        transform[0], transform[1], transform[2], 0,
                        transform[3], transform[4], transform[5], 0,
                        transform[6], transform[7], transform[8], 0,
                        dx,           dy,           sx,           sy,

                    ]);
                    */
                                        
                    this.vertexCount++;
                }

                if (this.texture == null) {

                    // Set up texture for current batch
                    var gl = this.gl;

                    var texture = gl.createTexture();
                    texture.image = image;

                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                    gl.generateMipmap(gl.TEXTURE_2D);
                    gl.bindTexture(gl.TEXTURE_2D, null);

                    this.texture = texture;
                }
            },
        },

        drawFill: {
            value: function drawFill(fill) {

                var transform = this.transforms[this.transforms.length - 1];
            },
        },

        clear: {
            value: function () {

                var gl = this.gl;
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            },
        },

        beginDraw: {
            value: function () {

            },
        },

        endDraw: {
            value: function () {

                var gl = this.gl;
                var canvas = gl.canvas;

                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.enable(gl.BLEND);

                gl.uniform2f(this.resolutionUniform, canvas.width, canvas.height);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.uniform1i(this.samplerUniform, 0);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPosAndTexCoords);
                gl.bufferData(gl.ARRAY_BUFFER, this.positionAndTextCoords, gl.STATIC_DRAW);
                gl.vertexAttribPointer(this.positionAndTexCoordAttribute, 4, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTransformScaleRotations);
                gl.bufferData(gl.ARRAY_BUFFER, this.transformScaleRotations, gl.STATIC_DRAW);
                gl.vertexAttribPointer(this.transformScaleRotationAttribute, 4, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTransformTranslations);
                gl.bufferData(gl.ARRAY_BUFFER, this.transformTranslations, gl.STATIC_DRAW);
                gl.vertexAttribPointer(this.transformTranslationAttribute, 2, gl.FLOAT, false, 0, 0);

                gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);

                this.vertexCount = 0;
            },
        },
    });

    Acropolis.Graphics.DrawingContextCanvasWebGL = DrawingContextCanvasWebGL;
})();