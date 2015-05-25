;(function (global, $) {
    var STATE = {
        PENDING: 'pending',
        RESOLVED: 'resolved',
        REJECTED: 'rejected'
    };

    function Promise () {
        this.successCallbacks = [];
        this.failCallbacks = [];
        this.progressCallbacks = [];

        this._state = STATE.PENDING;
    }

    Promise.prototype.state = function () {
        return this._state;
    };

    Promise.prototype.then = function (fnDone, fnFail, fnProgress) {
        this.done(fnDone);
        this.fail(fnDone);
        this.progress(fnProgress);
    };

    Promise.prototype.fail = function (/* fns */) {
        var iterator = 0;

        for (; iterator < arguments.length; iterator++) {
            if (typeof arguments[iterator] === 'function') {
                this.failCallbacks.push(arguments[iterator]);
            }
        }
    };

    Promise.prototype.always = function (/* fns */) {
        var iterator = 0;

        for (; iterator < arguments.length; iterator++) {
            if (typeof arguments[iterator] === 'function') {
                this.successCallbacks.push(arguments[iterator]);
                this.failCallbacks.push(arguments[iterator]);
            }
        }
    };

    Promise.prototype.done = function (/* fns */) {
        var iterator = 0;

        for (; iterator < arguments.length; iterator++) {
            if (typeof arguments[iterator] === 'function') {
                this.successCallbacks.push(arguments[iterator]);
            }
        }
    };

    Promise.prototype.progress = function (/* fns */) {
        var iterator = 0;

        for (; iterator < arguments.length; iterator++) {
            if (typeof arguments[iterator] === 'function') {
                this.progressCallbacks.push(arguments[iterator]);
            }
        }
    };

    function sequentialCalls (context, args, fns) {
        var iterator = 0;

        for (; iterator < fns.length; iterator++) {
            fns[iterator].apply(context, args);
        }

        //clear fns ??? 
    }


    $.Deferred = function (func) {
        this._promise = new Promise();

        if (typeof func === 'function') {
            func.call(this, this);
        }
    };

    $.Deferred.prototype.state = function () {
        return this._promise.state();
    };

    $.Deferred.prototype.then = function () {
        // chaining ???
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