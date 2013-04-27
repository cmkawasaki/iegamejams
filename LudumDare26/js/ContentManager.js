ContentManager = (function () {
    var _resources = {};
    var _contentManager = {};
    var _outstandingResources = 0;

    Object.defineProperties(_contentManager, {
        addResource: {
            value: function addResource(url) {
                if (!_resources[url]) {
                    _outstandingResources++;

                    var img = new Image();
                    img.addEventListener("load", function _onLoad(evt) {
                        _outstandingResources--;
                    });
                    img.addEventListener("error", function _onError(evt) {
                        _outstandingResources--;
                    });
                    img.src = url;
                    _resources[url] = img;
                }
            },
        },
        getResource: {
            value: function getResource(url) {
                return _resources[url];
            },
        },
        isComplete: {
            get: function get_isComplete() {
                return (_outstandingResources == 0);
            },
        },
    });

    return _contentManager;
})();