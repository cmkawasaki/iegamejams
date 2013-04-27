RuleSet = (function () {
    var _ruleSet = {};

    Object.defineProperties(_ruleSet, {
        gameWidth: {
            value: 1024
        },
        gameHeight: {
            value: 768
        },
        edgeBuffer: {
            value: 40
        },
        rightEdgeBuffer: {
            value: 220
        },
        bulletDelay: {
            value: 15.5,
        },
        bulletSpeed: {
            value: 9.5
        },
        enemyBulletRateFraction: {
            value: 0.7
        },
        playerInvincibleTime: {
            value: 37
        },
        powerupSpawnMultiplier: {
            writable: true,
            value: 0.4
        },        
        hazzardSpawnMultiplier: {
            value: 0.3
        },
        helperWallPowerupDuration: {
            value: 350
        },
        threeShotSpread: {
            value: 1.5
        },
        threeShotWaitFraction: {
            value: 1
        },
        threeShotDuration: {
            value: 380
        },
        rapidShotDuration: {
            value: 500
        },
        rapidFireWaitFraction: {
            value: 0.415
        },
        powerupMoveSpeed: {
            value: -2.7123456
        },
        hazardMoveSpeedX: {
            value: -0.87
        },
        hazardMoveSpeedRandomSubtractionMaxX: {
            value: 0.3
        },
        hazardMoveSpeedRandomSubtractionMaxY: {
            value: 0.4
        },
        maxVelocity: {
            value: 8.25,
        },
        acceleration: {
            value: 2.753287
        },
        enemySpawnTime: {
            value: 2500
        },
        enemySpawnDistance: {
            value: 1280
        },
        enemyClipDistance: {
            value: -200
        },
        evacuationSpeed: {
            value: -15
        },
        mouseBuffer: {
            value: 10
        },

        // Parallax controlling values
        parallaxPerTick: {
            value: -1.0
        },
        farParallax: {
            value: 0.05
        },
        midParallax: {
            value: 0.115
        },
        nearParallax: {
            value: 0.225
        },
        foregroundParallax: {
            value: 1.0
        },

        maxStars: {
            value: 60
        },
        minStarScale: {
            value: 0.75
        },

        maxStarScale: {
            value: 1.25
        },

        victoryLapFrames: {
            value: 300
        },

        //Point Controlling Values
        pointForGhostKill: {
            value: 100
        },
        pointForPowerup: {
            value: 10
        },

        // Credits Throttling
        creditsSpawnDistance: {
            value: 1280
        },
        creditsScrollSpeed: {
            value: -5
        },
        creditsTickDelay: {
            value: 300
        },

        // Score Screens
        scoreScrollSpeed: {
            value: -5
        },
        scoreFont: {
            value: "28pt 'Bauhaus 93', sans-serif"
        },
    });

    return _ruleSet;
})();
