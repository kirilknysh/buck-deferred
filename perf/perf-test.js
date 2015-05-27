;(function (global, $) {
    function getPerfMeter () {
        var perfMeter = global.performance || global.Date,
            startMark;

        return {
            start: function () {
                startMark = perfMeter.now();
            },

            finish: function () {
                return perfMeter.now() - startMark;
            }
        };
    }

    function getLogger (node) {
        return {
            log: function (value) {
                var line = global.document.createElement('div');
                line.innerText = value + '';

                node.appendChild(line);
            },

            reset: function () {
                node.innerHTML = '';
            }
        };
    }

    function thenFunc () { }
    function failFunc () { }
    function doneFunc () { }

    var meter, logger;

    global.startPerfTest = function (results) {
        var objAmount = 99999;

        meter = getPerfMeter();
        logger = getLogger(results);


        logger.reset();
        logger.log('running...');

        meter.start();
        successTest(objAmount, function () {
            logger.log('------------------');
            failTest(objAmount, function () {
                logger.log('------------------');
                alwaysTest(objAmount, function () {
                    logger.log('finish');
                });
            });
        });
    };

    function createDeferreds (amount, callback) {
        var dfds = [],
            i;

        meter.start();
        for (i = 0; i < amount; i++) {
            dfds.push(new $.Deferred());
        }
        logger.log('create ' + amount + ' deferreds: ' + meter.finish());

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, 100);
    }

    function setDoneCallbacks (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        for (i = 0; i < l; i++) {
            dfds[i].done(doneFunc);
        }
        logger.log('add done callbacks: ' + meter.finish());

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, 100);
    }

    function setFailCallbacks (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        for (i = 0; i < l; i++) {
            dfds[i].fail(doneFunc);
        }
        logger.log('add fail callbacks: ' + meter.finish());

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, 100);
    }

    function setAlwaysCallbacks (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        for (i = 0; i < l; i++) {
            dfds[i].always(doneFunc);
        }
        logger.log('add always callbacks: ' + meter.finish());

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, 100);
    }

    function resolveDeferreds (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        for (i = 0; i < l; i++) {
            dfds[i].resolve();
        }
        logger.log('resolve deferreds: ' + meter.finish());

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, 100);
    }

    function rejectDeferreds (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        for (i = 0; i < l; i++) {
            dfds[i].reject();
        }
        logger.log('reject deferreds: ' + meter.finish());

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, 100);
    }

    function resolveRejectDeferreds (dfds, callback) {
        var i, l = dfds.length, l2 = Math.round(l / 2);

        meter.start();
        for (i = 0; i < l2; i++) {
            dfds[i].resolve();
        }
        for (i = l2; i < l; i++) {
            dfds[i].reject();
        }
        logger.log('resolve/reject deferreds: ' + meter.finish());

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, 100);
    }


    function successTest (objAmount, callback) {
        createDeferreds(objAmount, function (dfds) {
            setDoneCallbacks(dfds, function (dfds) {
                resolveDeferreds(dfds, function (dfds) {
                    global.setTimeout(function() {
                        if (typeof callback === 'function') {
                            callback(dfds);
                        }
                    }, 100);
                });
            });
        });
    }

    function failTest (objAmount, callback) {
        createDeferreds(objAmount, function (dfds) {
            setFailCallbacks(dfds, function (dfds) {
                rejectDeferreds(dfds, function (dfds) {
                    global.setTimeout(function() {
                        if (typeof callback === 'function') {
                            callback(dfds);
                        }
                    }, 100);
                });
            });
        });
    }

    function alwaysTest (objAmount, callback) {
        createDeferreds(objAmount, function (dfds) {
            setAlwaysCallbacks(dfds, function (dfds) {
                resolveRejectDeferreds(dfds, function (dfds) {
                    global.setTimeout(function() {
                        if (typeof callback === 'function') {
                            callback(dfds);
                        }
                    }, 100);
                });
            });
        });
    }
})(this, this.$);