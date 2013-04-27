var InputState = (function () {
    var _inputState = {};

    Object.defineProperties(_inputState, {
        none: {
            value: 0
        },
        up: {
            value: 1
        },
        down: {
            value: 2
        },
        left: {
            value: 4
        },
        right: {
            value: 8
        },
    });
    return _inputState;
})();

var InputManager = (function () {
    var _frames = [],
        _iFrame = 0,
        _minFrames = (RuleSet.gameWidth / 2) + RuleSet.edgeBuffer * 2, // screen + buffer past
        _maxFrames = RuleSet.gameWidth + RuleSet.rightEdgeBuffer + RuleSet.edgeBuffer, // screen + frame + buffer past
        _currentInput = InputState.none;

    for (var i = 0; i < _maxFrames; ++i) {
        _frames[i] = { state: InputState.none, p: { x: 0, y: 0 }, v: { x: 0, y: 0 } };
    }

    var _inputManager = {};
    var keys = {
        a: 65,
        b: 66,
        w: 87,
        s: 83,
        d: 68,
        up: 38,
        down: 40,
        left: 37,
        right: 39,
        escape: 27
    };
    var _konamiCode = [keys.up, keys.up, keys.down, keys.down, keys.left, keys.right, keys.left, keys.right, keys.b, keys.a];
    var _konamiOffset = 0;
    var _mouseDown = false;
    var _mouseOver = false;
    var _mousePosition = undefined;
    var _eventListeners = {};
    var _mouseElement = null;
    var _escapeDown = false;
    var _disableEvents = false;

    function _onKeyDown(evt) {
        switch (evt.keyCode) {
            case keys.a:
            case keys.left:
                _currentInput |= InputState.left;
                break;
            case keys.w:
            case keys.up:
                _currentInput |= InputState.up;
                break;
            case keys.s:
            case keys.down:
                _currentInput |= InputState.down;
                break;
            case keys.d:
            case keys.right:
                _currentInput |= InputState.right;
                break;
            case keys.escape:
                _escapeDown = true;
                break;
        }
        if (_konamiCode[_konamiOffset] == evt.keyCode) {
            _konamiOffset++;
            if (_konamiOffset == _konamiCode.length) {
                _konamiOffset = 0;
                _inputManager.dispatchEvent("konamiCode");
            }
        }
        else {
            _konamiOffset = 0;
        }
    }

    function _onKeyUp(evt) {
        switch (evt.keyCode) {
            case keys.a:
            case keys.left:
                _currentInput &= ~InputState.left;
                break;
            case keys.w:
            case keys.up:
                _currentInput &= ~InputState.up;
                break;
            case keys.s:
            case keys.down:
                _currentInput &= ~InputState.down;
                break;
            case keys.d:
            case keys.right:
                _currentInput &= ~InputState.right;
                break;
            case keys.escape:
                if (_escapeDown) {
                    _escapeDown = false;
                    _inputManager.dispatchEvent("edgeUI");
                }
                break;
        }
    }

    function _updateMousePosition(evt, canvasEvent) {
        if (_mouseDown && _mouseOver) {
            if (canvasEvent) {
                _mousePosition = { x: evt.offsetX, y: evt.offsetY };
            } else {
                var ol = _mouseElement.offsetLeft;
                var ot = _mouseElement.offsetTop;
                _mousePosition = { x: evt.clientX - ol, y: evt.clientY - ot };
            }
        } else {
            _mousePosition = undefined;
        }
    }

    function _onMouseDown(evt) {
        if (evt.button === 0) {
            _mouseDown = true;
            _updateMousePosition(evt, false);
        }
    }

    function _onMouseUp(evt) {
        if (evt.button === 0) {
            _mouseDown = false;
            _updateMousePosition(evt, false);
        }
    }

    function _onMouseOver(evt) {
        if (!_mouseOver) {
            _mouseOver = true;
            _updateMousePosition(evt, true);
        }
    }

    function _onMouseOut(evt) {
        if (_mouseOver) {
            _mouseOver = false;
            _updateMousePosition(evt, true);
        }
    }

    function _onMouseMove(evt) {
        _updateMousePosition(evt, true);
    }

    function _resetInput() {
        _currentInput = InputState.none;
        _mousePosition = undefined;
        _konamiOffset = 0;
        _escapeDown = false;
    }

    function _onFocus(evt) {
        _disableEvents = false;
    }

    function _onBlur(evt) {
        _disableEvents = true;
        _resetInput();
    }

    Object.defineProperties(_inputManager, {
        attach: {
            value: function attach(keyElement, mouseElement) {
                _mouseElement = mouseElement;
                keyElement.addEventListener("keydown", _onKeyDown);
                keyElement.addEventListener("keyup", _onKeyUp);
                keyElement.addEventListener("mousedown", _onMouseDown);
                mouseElement.addEventListener("mousemove", _onMouseMove);
                mouseElement.addEventListener("mouseover", _onMouseOver);
                mouseElement.addEventListener("mouseout", _onMouseOut);
                keyElement.addEventListener("mouseup", _onMouseUp);
                if (undefined !== document.onfocusin) {
                    document.addEventListener("focusout", _onBlur);
                    document.addEventListener("focusin", _onFocus);
                } else {
                    window.addEventListener("blur", _onBlur);
                    window.addEventListener("focus", _onFocus);
                }
            },
        },
        tick: {
            value: function tick(gameEngine, record, fireGun) {
                for (var col = gameEngine.layers.layerPlayer.children, i = col.length - 1; i >= 0; i--) {
                    var ship = col[i];
                    var input = _currentInput;
                    var translation = ship.transform.translation;

                    if (_mousePosition) {
                        var dx = translation.x - _mousePosition.x;
                        var dy = translation.y - _mousePosition.y;
                        if (dx > RuleSet.mouseBuffer) {
                            input |= InputState.left;
                        } else if (dx < -RuleSet.mouseBuffer) {
                            input |= InputState.right;
                        }
                        if (dy > RuleSet.mouseBuffer) {
                            input |= InputState.up;
                        } else if (dy < -RuleSet.mouseBuffer) {
                            input |= InputState.down;
                        }
                    }

                    ship.moveShip(input, 0);

                    translation.x = Math.max(RuleSet.edgeBuffer, translation.x);
                    translation.x = Math.min(RuleSet.gameWidth - RuleSet.rightEdgeBuffer, translation.x);
                    
                    ship.updateGuns(!fireGun);

                    // record frame
                    if (record) {
                        var frame = _frames[_iFrame];
                        frame.state = input;
                        frame.p.x = translation.x;
                        frame.p.y = translation.y;
                        frame.v.x = ship.velocityX;
                        frame.v.y = ship.velocityY;
                        ++_iFrame;
                        if (_iFrame >= _maxFrames) {
                            _iFrame = 0;
                        }
                    }
                }
            },
        },
        addEventListener: {
            value: function addEventListener(event, callback) {
                if (!_eventListeners[event]) {
                    _eventListeners[event] = [callback];
                    }
                else {
                    _eventListeners[event].push(callback);
                }
            },
        },
        
        /*getPlayerGhost: {
            value: function getPlayerGhost(playerWon) {
                // returns the ghost of the player
                var ghost = null;
                if (CurrentFrame >= (playerWon ? 60 : _minFrames)) {

                    ghost = {};
                    var lastFrame = _iFrame - 1;
                    if (lastFrame < 0) {
                        lastFrame = _maxFrames - 1;
                    }
                    var spawnFrame = CurrentFrame - _maxFrames;
                    var firstFrame = _iFrame;
                    if (CurrentFrame < _maxFrames) {
                        firstFrame = 0;
                        spawnFrame = 0;
                    }
                    ghost.spawnFrame = spawnFrame;

                    var frame = _frames[firstFrame];
                    ghost.x = frame.p.x;
                    ghost.y = frame.p.y;
                    ghost.vx = frame.v.x;
                    ghost.vy = frame.v.y;
                    ghost.frames = [];
                    for (var i = firstFrame, j = 0, fs = _frames, fd = ghost.frames; i != lastFrame; i = (i == _maxFrames - 1) ? 0 : i + 1, ++j) {
                        fd[j] = fs[i].state;
                    }
                }

                // reset the frame state
                _iFrame = 0;

                return ghost;
            },
        },*/
        addEventListener: {
            value: function addEventListener(event, callback) {
                if (!_eventListeners[event]) {
                    _eventListeners[event] = [callback];
                }
                else {
                    _eventListeners[event].push(callback);
                }
            },
        },
        dispatchEvent: {
            value: function dispatchEvent(event) {
                if (_eventListeners[event]) {
                    _eventListeners[event].forEach(function (callback) {
                        var eventObj = {
                            target: this
                        };
                        callback(eventObj);
                    }, this);
                }
            },
        },
    });

    return _inputManager;
})();
