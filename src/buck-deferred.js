;(function (global, $) {
    var STATE = {
        PENDING: 'pending',
        RESOLVED: 'resolved',
        REJECTED: 'rejected'
    };

    function Promise() {
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


    $.Deferred = function (func) {
        this.promise = new Promise();

        if (typeof func === 'function') {
            func.call(this, this);
        }
    };

    $.Deferred.prototype.then = function () {
        // chaining ???
    };

    $.Deferred.prototype.fail = function (/* fns */) {
        this.promise.fail.apply(this.promise, arguments);

        return this;
    };

    $.Deferred.prototype.always = function (/* fns */) {
        this.promise.always.apply(this.promise, arguments);

        return this;
    };

    $.Deferred.prototype.done = function (/* fns */) {
        this.promise.done.apply(this.promise, arguments);

        return this;
    };

    $.Deferred.prototype.progress = function (/* fns */) {
        this.promise.progress.apply(this.promise, arguments);

        return this;
    };

    $.Deferred.prototype.resolve = function () {
        return this.resolveWith(this.promise, arguments);
    };

    $.Deferred.prototype.resolveWith = function (context, args) {
        this.promise._state = STATE.RESOLVED;

        return this;
    };

    $.Deferred.prototype.reject = function () {
        return this.rejectWith(this.promise, arguments);
    };

    $.Deferred.prototype.rejectWith = function (context, args) {
        this.promise._state = STATE.REJECTED;

        return this;
    };

    $.Deferred.prototype.notify = function () {
        return this.notifyWith(this.promise, arguments);
    };

    $.Deferred.prototype.notifyWith = function (context, args) {
        return this;
    };

    $.Deferred.prototype.promise = function (obj) {
        //do we need promise non-objects??
        return typeof obj === 'object' ? obj/* mixin promise into passed obj */ : this.promise;
    };

    $.when = function (/* dfds */) {

    };
})(this, this.$ = this.$ || {});