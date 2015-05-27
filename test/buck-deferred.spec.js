/* jshint expr: true */

describe('$.Defered', function () {

    var dfd,
        isPromise;

    isPromise = function (arg) {
        arg.should.have.property('then');
        arg.should.have.property('done');
        arg.should.have.property('fail');
        arg.should.have.property('progress');
        arg.should.not.have.property('resolve');
        arg.should.not.have.property('reject');
        arg.should.not.have.property('resolveWith');
        arg.should.not.have.property('rejectWith');
    };

    beforeEach(function () {
        dfd = new $.Deferred();
    });

    describe('contructor', function () {
        it('should create a new Deferred object', function () {
            dfd.should.be.instanceOf($.Deferred);
        });

        it('should call passed function', function () {
            var spy = sinon.spy(),
                funDfd = new $.Deferred(spy);

            spy.should.have.been.calledOn(funDfd);
            spy.should.have.been.calledWith(funDfd);
        });
    });

    describe('state', function () {
        it('should return the correct promise;s state', function () {
            var resolvedDfd = new $.Deferred(),
                rejectedDfd = new $.Deferred();

            dfd.state().should.be.equal('pending');

            resolvedDfd.resolve();
            resolvedDfd.state().should.be.equal('resolved');

            rejectedDfd.reject();
            rejectedDfd.state().should.be.equal('rejected');
        });
    });

    describe('promise', function () {
        it('should return promise', function () {
            isPromise(dfd.promise());
        });
    });

    describe('resolve', function () {
        it('should change state', function () {
            dfd.resolve();
            dfd.state().should.be.equal('resolved');
        });

        it('should call all done callbacks in the correct order', function () {
            var doneSpy1 = sinon.spy(),
                doneSpy2 = sinon.spy(),
                doneSpy3 = sinon.spy();

            dfd.done(doneSpy1).done(doneSpy2).done(doneSpy3);

            dfd.resolve();

            doneSpy1.should.have.been.called;
            doneSpy2.should.have.been.calledAfter(doneSpy1);
            doneSpy3.should.have.been.called.calledAfter(doneSpy2);
        });

        it('should pass arguments correctly', function () {
            var doneSpy = sinon.spy(),
                args = [1, 'Hulk'];

            dfd.done(doneSpy);

            dfd.resolve.apply(dfd, args);

            doneSpy.should.have.been.calledWith.apply(doneSpy.should.have.been, args);
        });

        it('should call resolveWith', function () {
            var resolveWithSpy = sinon.spy(dfd, 'resolveWith');

            dfd.resolve();

            resolveWithSpy.should.have.been.called;
        });

        it('should support chaining', function () {
            dfd.resolve().should.be.equal(dfd);
        });

        it('should resolve only once', function () {
            var doneSpy = sinon.spy(),
                resolve1arg = { 'hero': 'Spider Man' },
                resolve2arg = { 'hero': 'Ant Man' };

            dfd.done(doneSpy);
            dfd.resolve(resolve1arg);
            dfd.resolve(resolve2arg);

            doneSpy.should.have.been.calledOnce;
            doneSpy.should.have.been.calledWith(resolve1arg);
        });
    });

    describe('resolveWith', function () {
        it('should apply the passed context correctly', function () {
            var doneSpy = sinon.spy(),
                context = { 'hero': 'Captain America' };

            dfd.done(doneSpy);
            dfd.resolveWith(context);

            doneSpy.should.have.been.calledOn(context);
        });

        it('should support chaining', function () {
            dfd.resolveWith({}, {}).should.be.equal(dfd);
        });
    });

    describe('reject', function () {
        it('should change state', function () {
            dfd.reject();
            dfd.state().should.be.equal('rejected');
        });

        it('should call all fail callbacks in the correct order', function () {
            var failSpy1 = sinon.spy(),
                failSpy2 = sinon.spy(),
                failSpy3 = sinon.spy();

            dfd.fail(failSpy1).fail(failSpy2).fail(failSpy3);

            dfd.reject();

            failSpy1.should.have.been.called;
            failSpy2.should.have.been.calledAfter(failSpy1);
            failSpy3.should.have.been.called.calledAfter(failSpy2);
        });

        it('should pass arguments correctly', function () {
            var failSpy = sinon.spy(),
                args = [1, 'Black Widow'];

            dfd.fail(failSpy);

            dfd.reject.apply(dfd, args);

            failSpy.should.have.been.calledWith.apply(failSpy.should.have.been, args);
        });

        it('should call rejectWith', function () {
            var rejectWithSpy = sinon.spy(dfd, 'rejectWith');

            dfd.reject();

            rejectWithSpy.should.have.been.called;
        });

        it('should support chaining', function () {
            dfd.reject().should.be.equal(dfd);
        });

        it('should reject only once', function () {
            var failSpy = sinon.spy(),
                reject1arg = { 'hero': 'Black Panther' },
                reject2arg = { 'hero': 'Cable' };

            dfd.fail(failSpy);
            dfd.reject(reject1arg);
            dfd.reject(reject2arg);

            failSpy.should.have.been.calledOnce;
            failSpy.should.have.been.calledWith(reject1arg);
        });
    });

    describe('rejectWith', function () {
        it('should apply the passed context correctly', function () {
            var failSpy = sinon.spy(),
                context = { 'hero': 'Colossus' };

            dfd.fail(failSpy);
            dfd.rejectWith(context);

            failSpy.should.have.been.calledOn(context);
        });

        it('should support chaining', function () {
            dfd.rejectWith({}, {}).should.be.equal(dfd);
        });
    });

    describe('notify', function () {
        it('should not change state', function () {
            dfd.notify();
            dfd.state().should.be.equal('pending');
        });

        it('should call all progress callbacks in the correct order', function () {
            var progressSpy1 = sinon.spy(),
                progressSpy2 = sinon.spy(),
                progressSpy3 = sinon.spy();

            dfd.progress(progressSpy1).progress(progressSpy2).progress(progressSpy3);

            dfd.notify();

            progressSpy1.should.have.been.called;
            progressSpy2.should.have.been.calledAfter(progressSpy1);
            progressSpy3.should.have.been.called.calledAfter(progressSpy2);
        });

        it('should pass arguments correctly', function () {
            var progressSpy = sinon.spy(),
                args = [1, 'Black Widow'];

            dfd.progress(progressSpy);

            dfd.notify.apply(dfd, args);

            progressSpy.should.have.been.calledWith.apply(progressSpy.should.have.been, args);
        });

        it('should call notifyWith', function () {
            var notifyWithSpy = sinon.spy(dfd, 'notifyWith');

            dfd.notify();

            notifyWithSpy.should.have.been.called;
        });

        it('should support chaining', function () {
            dfd.notify().should.be.equal(dfd);
        });

        it('should be able to notify multiple times', function () {
            var progressSpy = sinon.spy(),
                notify1arg = 'Cyclops',
                notify2arg = 'Daredevil';

            dfd.progress(progressSpy);

            dfd.notify(notify1arg);
            progressSpy.should.have.been.calledWith(notify1arg);

            dfd.notify(notify2arg);
            progressSpy.should.have.been.calledWith(notify2arg);
        });

        it('should not notify already reasolved deferred', function () {
            var progressSpy = sinon.spy();

            dfd.progress(progressSpy);
            dfd.resolve();
            dfd.notify();

            progressSpy.should.not.have.been.called;
        });

        it('should not notify already rejected deferred', function () {
            var progressSpy = sinon.spy();

            dfd.progress(progressSpy);
            dfd.reject();
            dfd.notify();

            progressSpy.should.not.have.been.called;
        });
    });

    describe('notifyWith', function () {
        it('should apply the passed context correctly', function () {
            var progressSpy = sinon.spy(),
                context = { 'hero': 'Deadpool' };

            dfd.progress(progressSpy);
            dfd.notifyWith(context);

            progressSpy.should.have.been.calledOn(context);
        });

        it('should support chaining', function () {
            dfd.notifyWith({}, {}).should.be.equal(dfd);
        });
    });

    describe('done', function () {
        it('should add only success callback', function () {
            var doneSpy = sinon.spy(),
                rejectedDfd = new $.Deferred(),
                rejecetedDoneSpy = sinon.spy();

            dfd.done(doneSpy);
            dfd.resolve();
            doneSpy.should.have.been.called;

            rejectedDfd.done(rejecetedDoneSpy);
            rejectedDfd.notify();
            rejectedDfd.reject();
            rejecetedDoneSpy.should.not.have.been.called;
        });

        it('should accept multiple callbacks', function () {
            var done1Spy = sinon.spy(),
                done2Spy = sinon.spy();

            dfd.done(done1Spy, done2Spy);
            dfd.resolve();

            done1Spy.should.have.been.called;
            done2Spy.should.have.been.called;
        });

        it('should support chaining', function () {
            dfd.done(function() {}).should.be.equal(dfd);
        });

        it('should accept array-like arguments', function () {
            var done1Spy = sinon.spy(),
                done2Spy = sinon.spy(),
                done3Spy = sinon.spy();

            dfd.done(done1Spy, [done2Spy, done3Spy]);
            dfd.resolve();

            done1Spy.should.have.been.called;
            done2Spy.should.have.been.called;
            done3Spy.should.have.been.called;
        });

        it('should immediatelly call callbacks for already resolved deferred', function () {
            var doneSpy = sinon.spy();

            dfd.resolve();
            dfd.done(doneSpy);

            doneSpy.should.have.been.called;
        });
    });

    describe('fail', function () {
        it('should add only fail callback', function () {
            var failSpy = sinon.spy(),
                resolvedDfd = new $.Deferred(),
                resolvedFailSpy = sinon.spy();

            dfd.fail(failSpy);
            dfd.reject();
            failSpy.should.have.been.called;

            resolvedDfd.fail(resolvedFailSpy);
            resolvedDfd.notify();
            resolvedDfd.resolve();
            resolvedFailSpy.should.not.have.been.called;
        });

        it('should accept multiple callbacks', function () {
            var fail1Spy = sinon.spy(),
                fail2Spy = sinon.spy();

            dfd.fail(fail1Spy, fail2Spy);
            dfd.reject();

            fail1Spy.should.have.been.called;
            fail2Spy.should.have.been.called;
        });

        it('should support chaining', function () {
            dfd.fail(function() {}).should.be.equal(dfd);
        });

        it('should accept array-like arguments', function () {
            var fail1Spy = sinon.spy(),
                fail2Spy = sinon.spy(),
                fail3Spy = sinon.spy();

            dfd.fail(fail1Spy, [fail2Spy, fail3Spy]);
            dfd.reject();

            fail1Spy.should.have.been.called;
            fail2Spy.should.have.been.called;
            fail3Spy.should.have.been.called;
        });

        it('should immediatelly call callbacks for already rejected deferred', function () {
            var failSpy = sinon.spy();

            dfd.reject();
            dfd.fail(failSpy);

            failSpy.should.have.been.called;
        });
    });

    describe('progress', function () {
        it('should add only progress callback', function () {
            var progressSpy = sinon.spy(),
                resolvedDfd = new $.Deferred(),
                resolvedProgressSpy = sinon.spy(),
                rejectedDfd = new $.Deferred(),
                rejectedProgressSpy = sinon.spy();

            dfd.progress(progressSpy);
            dfd.notify();
            progressSpy.should.have.been.called;

            resolvedDfd.progress(resolvedProgressSpy);
            resolvedDfd.resolve();
            resolvedProgressSpy.should.not.have.been.called;

            rejectedDfd.progress(rejectedProgressSpy);
            resolvedDfd.reject();
            rejectedProgressSpy.should.not.have.been.called;
        });

        it('should accept multiple callbacks', function () {
            var progress1Spy = sinon.spy(),
                progress2Spy = sinon.spy();

            dfd.progress(progress1Spy, progress2Spy);
            dfd.notify();

            progress1Spy.should.have.been.called;
            progress2Spy.should.have.been.called;
        });

        it('should support chaining', function () {
            dfd.progress(function() {}).should.be.equal(dfd);
        });

        it('should accept array-like arguments', function () {
            var progress1Spy = sinon.spy(),
                progress2Spy = sinon.spy(),
                progress3Spy = sinon.spy();

            dfd.fail(progress1Spy, [progress2Spy, progress3Spy]);
            dfd.reject();

            progress1Spy.should.have.been.called;
            progress2Spy.should.have.been.called;
            progress3Spy.should.have.been.called;
        });
    });

    describe('always', function () {
        it('should add both success and fail callbacks', function () {
            var doneSpy = sinon.spy(),
                failSpy = sinon.spy();

            dfd.always(doneSpy);
            dfd.resolve();
            doneSpy.should.have.been.called;

            dfd = new $.Deferred();
            dfd.always(failSpy);
            dfd.reject();
            failSpy.should.have.been.called;
        });

        it('should accept multiple callbacks', function () {
            var always1Spy = sinon.spy(),
                always2Spy = sinon.spy();

            dfd.always(always1Spy, always2Spy);
            dfd.resolve();

            always1Spy.should.have.been.called;
            always2Spy.should.have.been.called;
        });

        it('should support chaining', function () {
            dfd.always(function() {}).should.be.equal(dfd);
        });

        it('should accept array-like arguments', function () {
            var always1Spy = sinon.spy(),
                always2Spy = sinon.spy(),
                always3Spy = sinon.spy();

            dfd.fail(always1Spy, [always2Spy, always3Spy]);
            dfd.reject();

            always1Spy.should.have.been.called;
            always2Spy.should.have.been.called;
            always3Spy.should.have.been.called;
        });

        it('should immediatelly call callbacks for already rejected deferred', function () {
            var failSpy = sinon.spy();

            dfd.reject();
            dfd.always(failSpy);

            failSpy.should.have.been.called;
        });

        it('should immediatelly call callbacks for already resolved deferred', function () {
            var doneSpy = sinon.spy();

            dfd.resolve();
            dfd.always(doneSpy);

            doneSpy.should.have.been.called;
        });
    });

    describe('then', function () {
        it('should accept success, fail and progress callbacks', function () {
            var doneSpy = sinon.spy(),
                failSpy = sinon.spy(),
                progressSpy = sinon.spy();

            dfd.then(doneSpy, null, progressSpy);

            dfd.notify();
            progressSpy.should.have.been.called;
            dfd.resolve();
            doneSpy.should.have.been.called;

            dfd = new $.Deferred();
            dfd.then(null, failSpy);
            dfd.reject();
            failSpy.should.have.been.called;
        });

        it('should support chaining', function () {
            isPromise(dfd.then(function () {}));
        });

        it('should forward arguments correctly', function (done) {
            var args = { 'hero': 'Ghost Rider' },
                middleDfd = new $.Deferred(),
                middleArgs = { 'hero': 'Gambit' },

                thenDoneSpy = sinon.spy(),
                middleThenDoneSpy = sinon.spy();

            dfd
                .then(function (arg) {
                    arg.should.be.equal(args);
                    thenDoneSpy();

                    return middleDfd;
                })
                .then(function (middleArg) {
                    middleArg.should.be.equal(middleArgs);
                    middleThenDoneSpy();

                    thenDoneSpy.should.have.been.calledTwice;
                    middleThenDoneSpy.should.have.been.calledAfter(thenDoneSpy);
                    done();
                });

            dfd.then(function (arg) {
                arg.should.be.equal(args);
                thenDoneSpy();
            });

            dfd.resolve(args);
            middleDfd.resolve(middleArgs);
        });

        it('should immediatelly call callbacks for already resolve deferred', function () {
            var doneSpy = sinon.spy();

            dfd.resolve();
            dfd.then(doneSpy);

            doneSpy.should.have.been.called;
        });

        it('should immediatelly call callbacks for already rejected deferred', function () {
            var failSpy = sinon.spy();

            dfd.reject();
            dfd.then(null, failSpy);

            failSpy.should.have.been.called;
        });
    });

});

describe('Promise', function () {
    var promise;

    beforeEach(function () {
        promise = (new $.Deferred()).promise();
    });

    describe('fail', function () {
        it('should support chaining', function () {
            promise.fail(function () { }).should.be.equal(promise);
        });
    });

    describe('always', function () {
        it('should support chaining', function () {
            promise.always(function () { }).should.be.equal(promise);
        });
    });

    describe('done', function () {
        it('should support chaining', function () {
            promise.done(function () { }).should.be.equal(promise);
        });
    });

    describe('progress', function () {
        it('should support chaining', function () {
            promise.progress(function () { }).should.be.equal(promise);
        });
    });
});