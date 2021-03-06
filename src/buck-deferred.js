;(function (global, $) {
    var
        /**
         * Enum Promise state.
         * @enum {String}
         */
        STATE = {
            PENDING: 'pending',
            RESOLVED: 'resolved',
            REJECTED: 'rejected'
        },
        /**
         * Determines if the passed argument is an array.
         * @function isArray
         * @returns {Boolean} True if argument is an array; false otherwise.
         * @private
         */
        isArray;

    /**
     * Sequentialy calls functions with given context and arguments.
     * @function sequentialCalls
     * @private
     */
    function sequentialCalls (context, args, fns) {
        var iterator = 0;

        for (; iterator < fns.length; iterator++) {
            fns[iterator].apply(context, args);
        }

        //clear fns ???
    }

    /**
     * Converts the given parameter (arguments or array) to array.
     * @function copyToArray
     * @param {Arguments|Array} [args] Object to be converted.
     * @returns {Array} New array.
     * @private
     */
    function copyToArray (args) {
        var i, result;

        if (!args || typeof args.length !== 'number') {
            return [];
        }

        i = args.length;
        result = new Array(i);
        while (--i >= 0) { result[i] = args[i]; }

        return result;
    }

    /**
     * Merges given promise into passed object.
     * @function mergePromise
     * @param {Object} obj The source object that will become a promise.
     * @param {Promise} promise Promise object.
     * @returns {Object} A promise-d source object.
     * @private
     */
    function mergePromise (obj, promise) {
        var keys = Object.keys(promise),
            protoKeys = Object.keys(Promise.prototype),
            iterator;

        for (iterator = 0; iterator < keys.length; iterator++) {
            obj[keys[iterator]] = promise[keys[iterator]];
        }
        for (iterator = 0; iterator < protoKeys.length; iterator++) {
            obj[protoKeys[iterator]] = promise[protoKeys[iterator]];
        }

        return obj;
    }

    isArray = (function () {
        if (Array.isArray) {
            return function __nativeIsArray__(arg) { return Array.isArray(arg); };
        } else {
            return function __toStringIsArray__(arg) { return Object.prototype.toString.call(arg) === '[object Array]'; };
        }
    })();

    /**
     * Creates a new Promise.
     * @class
     */
    function Promise () {
        this.successCallbacks = [];
        this.failCallbacks = [];
        this.progressCallbacks = [];

        /**
         * @private
         */
        this._state = STATE.PENDING;

        this._resultContext = null;
        this._resultArguments = null;

        this._progressContext = null;
        this._progressArguments = null;
    }

    /**
     * Return the current state of the Promise object.
     * @function state
     * @returns {STATE} State of the promise.
     */
    Promise.prototype.state = function () {
        return this._state;
    };

    /**
     * Returns current Promise object or makes Promise from the passed object.
     * @function promise
     * @param {object} [obj] Object that wants to be a Promise.
     * @returns {Promise} Current Promise or a new one.
     */
    Promise.prototype.promise = function(obj) {
        if (obj == null) {
            return this;
        }

        return mergePromise(obj, this);
    };

    /**
     * Chains success, fail and (or) progress callbacks.
     * @function then
     * @param {Function} [fnDone] Success callback.
     * @param {Function} [fnFail] Fail callback.
     * @param {Function} [fnProgress] Progress callback.
     * @returns {Promise} A new Promise.
     */
    Promise.prototype.then = function (fnDone, fnFail, fnProgress) {
        var thenDfd = new $.Deferred();

        this.done(function () {
            var result = fnDone && fnDone.apply(this, arguments);

            if (result instanceof $.Deferred || result instanceof Promise) {
                result
                    .done(function() { thenDfd.resolveWith(null, arguments); })
                    .fail(function() { thenDfd.rejectWith(null, arguments); })
                    .progress(function() { thenDfd.notifyWith(null, arguments); });
            } else {
                thenDfd.resolveWith(this, [result]);
            }
        });
        this.fail(function () {
            var result = fnFail.apply(this, arguments);

            if (result instanceof $.Deferred) {
                result
                    .done(function() { thenDfd.resolveWith(null, arguments);})
                    .fail(function() { thenDfd.rejectWith(null, arguments); })
                    .progress(function() { thenDfd.notifyWith(null, arguments); });
            } else {
                thenDfd.rejectWith(this, [result]);
            }
        });
        this.progress(function () {
            var result = fnProgress.apply(this, arguments);

            if (result instanceof $.Deferred) {
                result
                    .done(function() { thenDfd.resolveWith(null, arguments);})
                    .fail(function() { thenDfd.rejectWith(null, arguments); })
                    .progress(function() { thenDfd.notifyWith(null, arguments); });
            } else {
                thenDfd.notifyWith(this, [result]);
            }
        });

        return thenDfd.promise();
    };

    /**
     * Add fail callback(-s).
     * @function fail
     * @param {Function|...Functions} Fail callbacks(-s).
     * @returns {Promise} The current Promise.
     */
    Promise.prototype.fail = function (/* fns */) {
        var iterator = 0;

        for (; iterator < arguments.length; iterator++) {
            if (typeof arguments[iterator] === 'function') {
                this.failCallbacks.push(arguments[iterator]);
                if (this._state === STATE.REJECTED) {
                    arguments[iterator].apply(this._resultContext, this._resultArguments);
                }
            } else if (isArray(arguments[iterator])) {
                this.fail.apply(this, arguments[iterator]);
            }
        }

        return this;
    };

    /**
     * Add always (success + fail) callback(-s).
     * @function always
     * @param {Function|...Functions} Always callbacks.
     * @returns {Promise} The current Promise.
     */
    Promise.prototype.always = function (/* fns */) {
        var iterator = 0;

        for (; iterator < arguments.length; iterator++) {
            if (typeof arguments[iterator] === 'function') {
                this.successCallbacks.push(arguments[iterator]);
                this.failCallbacks.push(arguments[iterator]);
                if (this._state !== STATE.PENDING) {
                    arguments[iterator].apply(this._resultContext, this._resultArguments);
                }
            } else if (isArray(arguments[iterator])) {
                this.always.apply(this, arguments[iterator]);
            }
        }

        return this;
    };

    /**
     * Add success callback(-s).
     * @function done
     * @param {Function|...Functions} Success callbacks.
     * @returns {Promise} The current Promise.
     */
    Promise.prototype.done = function (/* fns */) {
        var iterator = 0;

        for (; iterator < arguments.length; iterator++) {
            if (typeof arguments[iterator] === 'function') {
                this.successCallbacks.push(arguments[iterator]);
                if (this._state === STATE.RESOLVED) {
                    arguments[iterator].apply(this._resultContext, this._resultArguments);
                }
            } else if (isArray(arguments[iterator])) {
                this.done.apply(this, arguments[iterator]);
            }
        }

        return this;
    };

    /**
     * Add progress callback(-s).
     * @function progress
     * @param {Function|...Functions} Progress callbacks.
     * @returns {Promise} The current Promise.
     */
    Promise.prototype.progress = function (/* fns */) {
        var iterator = 0;

        for (; iterator < arguments.length; iterator++) {
            if (typeof arguments[iterator] === 'function') {
                this.progressCallbacks.push(arguments[iterator]);
                if (this._progressContext !== null) {
                    arguments[iterator].apply(this._progressContext, this._progressArguments);
                }
            } else if (isArray(arguments[iterator])) {
                this.progress.apply(this, arguments[iterator]);
            }
        }

        return this;
    };


    /**
     * Creates a new Deferred.
     * @param {Function} [func] Function which a new Deferred will be pass to.
     * @class
     */
    $.Deferred = function (func) {
        if (!(this instanceof $.Deferred)) {
            return new $.Deferred(func);
        }

        var _promise = new Promise(),
            obj = this;

        /**
         * Return the current state of the Deferred object.
         * @function state
         * @returns {STATE} State of the deferred.
         */
        this.state = function () {
            return _promise.state();
        };
        /**
         * Resolves current Deferred (positive scenario).
         * @function resolve
         * @param {Arguments} Arguments that will be passed to success callbacks.
         * @returns {Deferred} The current Deferred.
         */
        this.resolve = function () {
            return obj.resolveWith(_promise, arguments);
        };
        /**
         * Resolves current Deferred (positive scenario).
         * @function resolveWith
         * @param {Object} [context] Context in scope of which success callbacks will be called.
         * @param {Array} [args] Array of parameters that will be passed to success callbacks.
         * @returns {Deferred} The current Deferred.
         */
        this.resolveWith = function (context, args) {
            if (_promise._state !== STATE.PENDING) {
                return obj;
            }

            _promise._state = STATE.RESOLVED;
            _promise._resultContext = context || _promise;
            _promise._resultArguments = copyToArray(args);

            sequentialCalls(_promise._resultContext, _promise._resultArguments,
                _promise.successCallbacks);

            return obj;
        };
        /**
         * Rejects current Deferred (negative scenario).
         * @function reject
         * @param {Arguments} Arguments that will be passed to fail callbacks.
         * @returns {Deferred} The current Deferred.
         */
        this.reject = function () {
            return obj.rejectWith(_promise, arguments);
        };
        /**
         * Rejects current Deferred (negative scenario).
         * @function rejectWith
         * @param {Object} [context] Context in scope of which fail callbacks will be called.
         * @param {Array} [args] Array of parameters that will be passed to fail callbacks.
         * @returns {Deferred} The current Deferred.
         */
        this.rejectWith = function (context, args) {
             if (_promise._state !== STATE.PENDING) {
                return obj;
            }

            _promise._state = STATE.REJECTED;
            _promise._resultContext = context || _promise;
            _promise._resultArguments = copyToArray(args);

            sequentialCalls(_promise._resultContext, _promise._resultArguments,
                _promise.failCallbacks);

            return obj;
         };
         /**
         * Notifies all progress-listeners.
         * @function notify
         * @param {Arguments} Arguments that will be passed to progress callbacks.
         * @returns {Deferred} The current Deferred.
         */
        this.notify = function () {
            return obj.notifyWith(_promise, arguments);
        };
        /**
         * Notifies all progress-listeners.
         * @function notifyWith
         * @param {Object} [context] Context in scope of which progress callbacks will be called.
         * @param {Array} [args] Array of parameters that will be passed to progress callbacks.
         * @returns {Deferred} The current Deferred.
         */
        this.notifyWith = function (context, args) {
            if (_promise.state() !== STATE.PENDING) {
                return obj;
            }

            _promise._progressContext = context || _promise;
            _promise._progressArguments = copyToArray(args);

            sequentialCalls(_promise._progressContext, _promise._progressArguments,
                _promise.progressCallbacks);

            return obj;
        };
        /**
         * Chains success, fail and (or) progress callbacks.
         * @function then
         * @param {Function} [fnDone] Success callback.
         * @param {Function} [fnFail] Fail callback.
         * @param {Function} [fnProgress] Progress callback.
         * @returns {Promise} A new Promise.
         */
        this.then = function (fnDone, fnFail, fnProgress) {
            return _promise.then.apply(_promise, arguments);
        };
        /**
         * Add success callback(-s).
         * @function done
         * @param {Function|...Functions} Success callbacks.
         * @returns {Deferred} The current Deferred.
         */
        this.done = function (/* fns */) {
            _promise.done.apply(_promise, arguments);

            return obj;
        };
        /**
         * Add fail callback(-s).
         * @function fail
         * @param {Function|...Functions} Fail callbacks.
         * @returns {Deferred} The current Deferred.
         */
        this.fail = function (/* fns */) {
            _promise.fail.apply(_promise, arguments);

            return obj;
        };
        /**
         * Add progress callback(-s).
         * @function progress
         * @param {Function|...Functions} Progress callbacks.
         * @returns {Deferred} The current Deferred.
         */
        this.progress = function (/* fns */) {
            _promise.progress.apply(_promise, arguments);

            return obj;
        };
        /**
         * Add always (success + fail) callback(-s).
         * @function always
         * @param {Function|...Functions} Always callbacks.
         * @returns {Deferred} The current Deferred.
         */
        this.always = function (/* fns */) {
            _promise.always.apply(_promise, arguments);

            return obj;
        };
        /**
         * Returns Promise object linked to current Deferred or makes Promise from the passed object.
         * @function promise
         * @param {object} [obj] Object that wants to be a Promise.
         * @returns {Promise} A new Promise.
         */
        this.promise = function (obj) {
            return _promise.promise(obj);
        };

        if (typeof func === 'function') {
            func.call(this, this);
        }
    };

    $.when = function (/* dfds */) {
        var argsLength = arguments.length,
            remaining = argsLength,
            param, params, contexts, iterator, dfd,
            progressParams,
            doneFn, progressFn, failFn;

        if (argsLength === 0) {
            return (new $.Deferred()).resolve().promise();
        } else if (argsLength === 1) {
            param = arguments[0];
            if (param instanceof $.Deferred) {
                return param.promise();
            } else if (param instanceof Promise) {
                return param;
            } else {
                return (new $.Deferred()).resolve(param).promise();
            }
        }

        params = copyToArray(arguments);
        contexts = new Array(argsLength);
        progressParams = new Array(argsLength);
        dfd = new $.Deferred();
        doneFn = function (index) {
            return function (doneResult) {
                contexts[index] = this;
                params[index] = arguments.length > 1 ? copyToArray(arguments) : doneResult;
                remaining--;
                if (remaining < 1) {
                    dfd.resolveWith(contexts, params);
                }
            };
        };
        progressFn = function (index) {
            return function (progressResult) {
                contexts[index] = this;
                progressParams[index] = arguments.length > 1 ? copyToArray(arguments) : progressResult;
                dfd.notifyWith(contexts, progressParams);
            };
        };
        failFn = function () {
            dfd.rejectWith(this, arguments);
        };

        for (iterator = 0; iterator < argsLength; iterator++) {
            param = params[iterator];
            if (param instanceof $.Deferred || param instanceof Promise) {
                param
                    .done(doneFn(iterator))
                    .progress(progressFn(iterator))
                    .fail(failFn);
            } else {
                remaining--;
            }
        }

        if (remaining === 0) {
            dfd.resolveWith(contexts, params);
        }

        return dfd.promise();
    };
})(this, this.$ = this.$ || {});