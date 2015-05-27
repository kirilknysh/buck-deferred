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
     * @private
     * @returns {Boolean} True if argument is an array; false otherwise.
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
    }

    /**
     * Return the current state of the Promise object.
     * @function state
     * @returns {STATE} State of the promise.
     */
    Promise.prototype.state = function () {
        return this._state;
    };

    Promise.prototype.then = function (fnDone, fnFail, fnProgress) {
        var thenDfd = new $.Deferred();

        if (typeof fnDone === 'function') {
            this.done(function () {
                var result = fnDone.apply(this, arguments);

                if (result instanceof $.Deferred) {
                    result
                        .done(function() { thenDfd.resolve();})
                        .fail(function() { thenDfd.reject(); })
                        .progress(function() { thenDfd.notify(); });
                } else {
                    thenDfd.resolveWith(this, [result]);
                }
            });
        }
        if (typeof fnFail === 'function') {
            this.fail(function () {
                var result = fnFail.apply(this, arguments);

                if (result instanceof $.Deferred) {
                    result
                        .done(function() { thenDfd.resolve();})
                        .fail(function() { thenDfd.reject(); })
                        .progress(function() { thenDfd.notify(); });
                } else {
                    thenDfd.rejectWith(this, [result]);
                }
            });
        }
        if (typeof fnProgress === 'function') {
            this.progress(function () {
                var result = fnProgress.apply(this, arguments);

                if (result instanceof $.Deferred) {
                    result
                        .done(function() { thenDfd.resolve();})
                        .fail(function() { thenDfd.reject(); })
                        .progress(function() { thenDfd.notify(); });
                } else {
                    thenDfd.notifyWith(this, [result]);
                }
            });
        }

        return thenDfd._promise;
    };

    /**
     * Add fail callback(-s).
     * @function fail
     * @param {Function|...Functions}
     * @returns {Promise} The current Promise.
     */
    Promise.prototype.fail = function (/* fns */) {
        var iterator = 0;

        for (; iterator < arguments.length; iterator++) {
            if (typeof arguments[iterator] === 'function') {
                this.failCallbacks.push(arguments[iterator]);
            } else if (isArray(arguments[iterator])) {
                this.fail.apply(this, arguments[iterator]);
            }
        }

        return this;
    };

    /**
     * Add always (success + fail) callback(-s).
     * @function always
     * @param {Function|...Functions}
     * @returns {Promise} The current Promise.
     */
    Promise.prototype.always = function (/* fns */) {
        var iterator = 0;

        for (; iterator < arguments.length; iterator++) {
            if (typeof arguments[iterator] === 'function') {
                this.successCallbacks.push(arguments[iterator]);
                this.failCallbacks.push(arguments[iterator]);
            } else if (isArray(arguments[iterator])) {
                this.always.apply(this, arguments[iterator]);
            }
        }

        return this;
    };

    /**
     * Add success callback(-s).
     * @function done
     * @param {Function|...Functions}
     * @returns {Promise} The current Promise.
     */
    Promise.prototype.done = function (/* fns */) {
        var iterator = 0;

        for (; iterator < arguments.length; iterator++) {
            if (typeof arguments[iterator] === 'function') {
                this.successCallbacks.push(arguments[iterator]);
            } else if (isArray(arguments[iterator])) {
                this.done.apply(this, arguments[iterator]);
            }
        }

        return this;
    };

    /**
     * Add progress callback(-s).
     * @function progress
     * @param {Function|...Functions}
     * @returns {Promise} The current Promise.
     */
    Promise.prototype.progress = function (/* fns */) {
        var iterator = 0;

        for (; iterator < arguments.length; iterator++) {
            if (typeof arguments[iterator] === 'function') {
                this.progressCallbacks.push(arguments[iterator]);
            } else if (isArray(arguments[iterator])) {
                this.progress.apply(this, arguments[iterator]);
            }
        }

        return this;
    };


    $.Deferred = function (func) {
        this._promise = new Promise();

        if (typeof func === 'function') {
            func.call(this, this);
        }
    };

    $.Deferred.prototype.state = function () {
        return this._promise.state();
    };

    $.Deferred.prototype.then = function (fnDone, fnFail, fnProgress) {
        return this._promise.then.apply(this._promise, arguments);
    };

    $.Deferred.prototype.fail = function (/* fns */) {
        this._promise.fail.apply(this._promise, arguments);

        return this;
    };

    $.Deferred.prototype.always = function (/* fns */) {
        this._promise.always.apply(this._promise, arguments);

        return this;
    };

    $.Deferred.prototype.done = function (/* fns */) {
        this._promise.done.apply(this._promise, arguments);

        return this;
    };

    $.Deferred.prototype.progress = function (/* fns */) {
        this._promise.progress.apply(this._promise, arguments);

        return this;
    };

    $.Deferred.prototype.resolve = function () {
        return this.resolveWith(this._promise, arguments);
    };

    $.Deferred.prototype.resolveWith = function (context, args) {
        if (this._promise._state !== STATE.PENDING) {
            return this;
        }

        this._promise._state = STATE.RESOLVED;

        sequentialCalls(context || this._promise, args, this._promise.successCallbacks);

        return this;
    };

    $.Deferred.prototype.reject = function () {
        return this.rejectWith(this._promise, arguments);
    };

    $.Deferred.prototype.rejectWith = function (context, args) {
        if (this._promise._state !== STATE.PENDING) {
            return this;
        }

        this._promise._state = STATE.REJECTED;

        sequentialCalls(context || this._promise, args, this._promise.failCallbacks);

        return this;
    };

    $.Deferred.prototype.notify = function () {
        return this.notifyWith(this._promise, arguments);
    };

    $.Deferred.prototype.notifyWith = function (context, args) {
        sequentialCalls(context || this._promise, args, this._promise.progressCallbacks);
        return this;
    };

    $.Deferred.prototype.promise = function (obj) {
        //do we need promise non-objects??
        return typeof obj === 'object' ? obj/* mixin promise into passed obj */ : this._promise;
    };

    $.when = function (/* dfds */) {

    };
})(this, this.$ = this.$ || {});