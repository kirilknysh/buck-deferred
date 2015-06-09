;(function (global, $) {
    function getPerfMeter (objAmount) {
        var perfMeter = global.performance || global.Date,
            _avg = {},
            startMark;

        return {
            start: function () {
                startMark = perfMeter.now();
            },

            finish: function () {
                return perfMeter.now() - startMark;
            },

            avg: function (alias, value) {
                if (!_avg[alias]) {
                    _avg[alias] = [];
                }
                _avg[alias].push(value);

                return value;
            },

            getPerfStats: function () {
                var keys = Object.keys(_avg),
                    i = 0, j = 0, sum = 0, result = {},
                    values;

                for (; i < keys.length; i++) {
                    sum = 0;
                    values = _avg[keys[i]];
                    for (j = 0; j < values.length; j++) {
                        sum += values[j];
                    }
                    result[keys[i]] = 1 / ((sum / values.length) / objAmount);
                }

                return result;
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

    function progressFunc () { }
    function failFunc () { }
    function doneFunc () { }

    var timeout = 200,
        meter, logger;

    global.startPerfTest = function (results) {
        var objAmount = 9999;

        meter = getPerfMeter(objAmount);
        logger = getLogger(results);


        logger.reset();
        logger.log('running...');

        meter.start();
        successTest(objAmount, function () {
            logger.log('------------------');
            failTest(objAmount, function () {
                logger.log('------------------');
                alwaysTest(objAmount, function () {
                    logger.log('------------------');
                    thenTest(objAmount, function () {
                        logger.log('------------------');
                         whenTest(objAmount, function () {
                            logger.log('finish');
                            console.log(meter.getPerfStats());
                        });
                    });
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
        logger.log('create ' + amount + ' deferreds: ' + meter.avg('create', meter.finish()));

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, timeout);
    }

    function setDoneCallbacks (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        for (i = 0; i < l; i++) {
            dfds[i].done(doneFunc);
        }
        logger.log('add done callbacks: ' + meter.avg('done-fail-progr', meter.finish()));

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, timeout);
    }

    function setFailCallbacks (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        for (i = 0; i < l; i++) {
            dfds[i].fail(doneFunc);
        }
        logger.log('add fail callbacks: ' + meter.avg('done-fail-progr', meter.finish()));

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, timeout);
    }

    function setAlwaysCallbacks (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        for (i = 0; i < l; i++) {
            dfds[i].always(doneFunc);
        }
        logger.log('add always callbacks: ' + meter.avg('always', meter.finish()));

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, timeout);
    }

    function setThenCallbacks (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        for (i = 0; i < l; i++) {
            dfds[i].then(doneFunc, failFunc, progressFunc);
        }
        logger.log('add then callbacks: ' + meter.avg('then', meter.finish()));

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, timeout);
    }

    function setDeferredsToWhen (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        $.when.apply($, dfds);
        logger.log('set deferreds to $.when: ' + meter.avg('when', meter.finish()));

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, timeout);
    }

    function resolveDeferreds (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        for (i = 0; i < l; i++) {
            dfds[i].resolve();
        }
        logger.log('resolve deferreds: ' + meter.avg('resolve', meter.finish()));

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, timeout);
    }

    function rejectDeferreds (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        for (i = 0; i < l; i++) {
            dfds[i].reject();
        }
        logger.log('reject deferreds: ' + meter.avg('reject', meter.finish()));

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, timeout);
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
        }, timeout);
    }

    function notifyDeferreds (dfds, callback) {
        var i, l = dfds.length;

        meter.start();
        for (i = 0; i < l; i++) {
            dfds[i].notify();
        }
        logger.log('notify deferreds: ' + meter.avg('notify', meter.finish()));

        global.setTimeout(function() {
            if (typeof callback === 'function') {
                callback(dfds);
            }
        }, timeout);
    }


    function successTest (objAmount, callback) {
        createDeferreds(objAmount, function (dfds) {
            setDoneCallbacks(dfds, function (dfds) {
                resolveDeferreds(dfds, function (dfds) {
                    global.setTimeout(function() {
                        if (typeof callback === 'function') {
                            callback(dfds);
                        }
                    }, timeout);
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
                    }, timeout);
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
                    }, timeout);
                });
            });
        });
    }

    function thenTest (objAmount, callback) {
        createDeferreds(objAmount, function (dfds) {
            setThenCallbacks(dfds, function (dfds) {
                notifyDeferreds(dfds, function (dfds) {
                    resolveDeferreds(dfds, function (dfds) {
                        global.setTimeout(function() {
                            if (typeof callback === 'function') {
                                callback(dfds);
                            }
                        }, timeout);
                    });
                });
            });
        });
    }

    function whenTest (objAmount, callback) {
        createDeferreds(objAmount, function (dfds) {
            setDeferredsToWhen(dfds, function (dfds) {
                resolveDeferreds(dfds, function (dfds) {
                    global.setTimeout(function() {
                        if (typeof callback === 'function') {
                            callback(dfds);
                        }
                    }, timeout);
                });
            });
        });
    }
})(this, this.$);