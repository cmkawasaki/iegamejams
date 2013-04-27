var CurrentFrame = 0;

function LightShapeGameEngine() {
    this.rootSprite = null;
    this.frames = {};
    this.layers = {};
    this.uiElements = {};
    this.collisionManagers = [];
    this.frameTimes = [];
    this.currentState = LightShapeGameEngine.GAMESTATE_UNINITIALIZED;
    this.lapEndFrame = undefined;
}

LightShapeGameEngine.prototype = Object.create(null);
LightShapeGameEngine.prototype.constructor = LightShapeGameEngine;

Object.defineProperties(LightShapeGameEngine, {
    GAMESTATE_UNINITIALIZED: {
        value: 0
    },
    GAMESTATE_CONTENTLOADING: {
        value: 1
    },
    GAMESTATE_STARTSCREEN: {
        value: 2
    },
    GAMESTATE_PLAYING: {
        value: 3
    },
    GAMESTATE_DEATHSEQUENCE: {
        value: 4
    },
    GAMESTATE_GAMEOVER: {
        value: 5
    },
    GAMESTATE_VICTORYLAP: {
        value: 6
    },
    GAMESTATE_CREDITSLOADING: {
        value: 7
    },
    GAMESTATE_CREDITS: {
        value: 8
    },
});

(function () {
    // Using statements for namespaces
    var _gfx = Acropolis.Graphics;
    var _math = Acropolis.Math;

    //TODO: Add Credits here
    var _credits = [ "chris", "justin" ];
    var _creditsTicks = 0;
    var _currentCredit = 0;

    Object.defineProperties(LightShapeGameEngine.prototype, {
        processCurrentState: {
            value: function processCurrentState() {
                ParticleManager.tick(this);
                switch (this.currentState) {
                    case LightShapeGameEngine.GAMESTATE_UNINITIALIZED:
                        throw "loadContent should be called prior to processCurrentState";
                        break;

                    case LightShapeGameEngine.GAMESTATE_CONTENTLOADING:
                        if (ContentManager.isComplete) {
                            //TODO: Build up any frames we plan on using
                            this.transitionGameState(LightShapeGameEngine.GAMESTATE_STARTSCREEN);
                        }
                        return false;

                    case LightShapeGameEngine.GAMESTATE_STARTSCREEN:                    
                        break;
                    case LightShapeGameEngine.GAMESTATE_CREDITSLOADING:
                        break;

                    case LightShapeGameEngine.GAMESTATE_CREDITS:
                        break;

                    case LightShapeGameEngine.GAMESTATE_PLAYING:
                        break;

                    case LightShapeGameEngine.GAMESTATE_DEATHSEQUENCE:
                        break;

                    case LightShapeGameEngine.GAMESTATE_VICTORYLAP:
                        break;

                    case LightShapeGameEngine.GAMESTATE_GAMEOVER:
                        break;
                }
                
                this.processEvacuationLayer();
                return true;
            },
        },

        processCollisions: {
            value: function processCollisions() {
                var processedCollisions = [];
                for (var collisionSet = 0; collisionSet < this.collisionManagers.length; collisionSet++) {
                    var manager = this.collisionManagers[collisionSet];
                    var collisions = this.collisionManagers[collisionSet].getCollisions();
                    for (var collisionIndex = 0; collisionIndex < collisions.length; collisionIndex++) {
                        var collision = collisions[collisionIndex];

                        if (!manager.ignoreSource && this.processCollision(collision.layerLeft, collision.spriteLeft, collision.spriteRight)) {
                            processedCollisions.push(collision.spriteLeft);
                        }
                        if (!manager.ignoreTarget && this.processCollision(collision.layerRight, collision.spriteRight, collision.spriteLeft)) {
                            processedCollisions.push(collision.spriteRight);
                        }
                    }
                }
                if (processedCollisions.length > 0) {
                    SoundManager.play("crash");
                    for (var i = 0; i < processedCollisions.length; i++) {
                        var c = processedCollisions[i];
                        if (c.blowTheFuckUp)
                        {                        
                            c.blowTheFuckUp(this);
                        }

                        delete c.isProcessed;
                    }
                }
            },
        },

        processCollision: {
            value: function processCollision(layer, sprite, contactSprite) {
                if (sprite === this.playerShip) {
                    if (this.playerShip.isInvincible() || this.state == LightShapeGameEngine.GAMESTATE_CREDITS) {
                        if (this.playerShip.bubbleActive)
                        {
                            this.playerShip.bubbleActive = false;
                            this.playerShip.AbleToGetKilledTime = CurrentFrame + RuleSet.playerInvincibleTime;
                        }

                        return false;
                    }
                    this.playerShip = undefined;
                    if (contactSprite.ghostName) {
                        ScoreManager.setKillerName(contactSprite.ghostName);
                    }
                } else if (sprite.applyPowerup) {
                    sprite.applyPowerup(contactSprite);
                    // NOTE: we still want default processing
                }

                if(sprite.pointValue)
                {
                    ScoreManager.addPoints(sprite.pointValue);
                    if (sprite instanceof Ships.EnemyShip) {
                        ScoreManager.addKill(1);
                    }
                }
                
                if (!sprite.isProcessed) {
                    layer.removeChild(sprite);
                    sprite.isProcessed = true;
                    return true;
                }
            },
        },

        loadContent: {
            value: function loadContent() {
                /*
                ContentManager.addResource("images/stars/star1.png");
                ContentManager.addResource("images/ships/playerShip.png");
                ContentManager.addResource("images/ships/enemyShip.png");
                for (var i = 0; i <= 21; i++) {
                    ContentManager.addResource("images/ships/playerShipBroken" + i + ".png");
                    ContentManager.addResource("images/ships/enemyShipBroken" + i + ".png");
                }
                ContentManager.addResource("images/bullets/playerBullet.png");
                ContentManager.addResource("images/bullets/enemyBullet.png");
                ContentManager.addResource("images/powerups/bulletWall.png");
                ContentManager.addResource("images/powerups/helperWall.png");
                ContentManager.addResource("images/powerups/playerBubble.png");
                ContentManager.addResource("images/powerups/shield.png");
                for (var i = 0; i <= 4; i++)
                {
                    ContentManager.addResource("images/hazards/hazardA" + i + ".png");
                }                
                for (var i = 0; i <= 4; i++)
                {
                    ContentManager.addResource("images/hazards/hazardB" + i + ".png");
                }
                ContentManager.addResource("images/powerups/shield.png"); 
                ContentManager.addResource("images/powerups/rapidFire.png");
                ContentManager.addResource("images/powerups/threeGuns.png");                

                // UI resouces for the start screen
                ContentManager.addResource("images/UI/title.png");
                ContentManager.addResource("images/UI/startButton.png");
                ContentManager.addResource("images/UI/creditsButton.png");
                ContentManager.addResource("images/UI/replayButton.png");
                ContentManager.addResource("images/UI/youSurvived.png");
                for (var i = 0; i <= 5; i++)
                {                
                    ContentManager.addResource("images/UI/startButtonBroken" + i + ".png");
                    ContentManager.addResource("images/UI/creditsButtonBroken" + i + ".png");
                    ContentManager.addResource("images/UI/replayButtonBroken" + i + ".png");
                }

                this.transitionGameState(LightShapeGameEngine.GAMESTATE_CONTENTLOADING);
                */
            }
        },

        initLayers: {
            value: function initLayers() {
            },
        },

        initFrames: {
            value: function initFrames() {
               
            }
        },

        initCollisionManagers: {
            value: function initCollisionManagers() {
            },
        },

    });
})();