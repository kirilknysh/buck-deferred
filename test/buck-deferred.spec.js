/* jshint expr: true */

    var dfd,
        isPromise,
        isDeferred;

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

    isDeferred = function (arg) {
        arg.should.have.property('then');
        arg.should.have.property('done');
        arg.should.have.property('fail');
        arg.should.have.property('progress');
        arg.should.have.property('resolve');
        arg.should.have.property('reject');
        arg.should.have.property('resolveWith');
        arg.should.have.property('rejectWith');
    };

describe('$.Defered', function () {
    beforeEach(function () {
        dfd = new $.Deferred();
    });

    describe('contructor', function () {
        it('should create a new Deferred object', function () {
            isDeferred(dfd);
        });

        it('should call passed function', function () {
            var spy = sinon.spy(),
                funDfd = new $.Deferred(spy);

            spy.should.have.been.calledOn(funDfd);
            spy.should.have.been.calledWith(funDfd);
        });

        it('should create Deferred object without new keyword', function () {
            var dfd1 = $.Deferred();

            isDeferred(dfd1);
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

        it('should make promise from a regular object', function () {
            var obj = { 'hero': 'Iceman' },
                doneSpy = sinon.spy();

            dfd.promise(obj);
            isPromise(obj);

            obj.done(doneSpy);
            dfd.resolve();

            doneSpy.should.have.been.called;
        });

        it('should mixin promise correctly', function () {
            var obj = { 'hero': 'Venom' },
                doneSpy = sinon.spy(),
                resolveArgs = { 'hero': 'Vision' };

            dfd.promise(obj);
            obj.should.have.property('done');
            obj.done(doneSpy);
            dfd.resolve(resolveArgs);

            doneSpy.should.have.been.calledWith(resolveArgs);
        });

        it('should mixin promise correctly (for reject)', function () {
            var obj = { 'hero': 'Winter Soldier' },
                failSpy = sinon.spy(),
                rejectContext = { 'hero': 'X-23' },
                rejectArgs = { 'hero': 'Wolverine' };

            dfd.promise(obj);
            obj.should.have.property('fail');
            obj.fail(failSpy);
            dfd.rejectWith(rejectContext, [rejectArgs]);

            failSpy.should.have.been.calledWith(rejectArgs);
            failSpy.should.have.been.calledOn(rejectContext);
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

        it('should resolve object without obj;s context', function (done) {
            var doneSpy = sinon.spy();

            dfd.done(doneSpy)
                .always(function () {
                    doneSpy.should.have.been.called;
                    done();
                });

            setTimeout(dfd.resolve, 1);
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

        it('should reject object without obj;s context', function (done) {
            var failSpy = sinon.spy();

            dfd.fail(failSpy)
                .always(function () {
                    failSpy.should.have.been.called;
                    done();
                });

            setTimeout(dfd.reject, 1);
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

        it('should notify without obj;s context', function (done) {
            var progressSpy = sinon.spy();

            dfd
                .progress(function () {
                    progressSpy();
                    dfd.resolve();
                })
                .always(function () {
                    progressSpy.should.have.been.called;
                    done();
                });

            setTimeout(dfd.notify, 1);
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
            var doneSpy = sinon.spy(),
                doneArgs = { 'hero': 'Jean Grey' };

            dfd.resolve(doneArgs);
            dfd.done(doneSpy);

            doneSpy.should.have.been.called;
            doneSpy.should.have.been.called.calledWith(doneArgs);
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
            var failSpy = sinon.spy(),
                failArgs = { 'hero': 'Juggernaut' };

            dfd.reject(failArgs);
            dfd.fail(failSpy);

            failSpy.should.have.been.called;
            failSpy.should.have.been.called.calledWith(failArgs);
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

        it('should immediatelly call callbacks with last notification', function () {
            var progressSpy = sinon.spy(),
                progressArgs = { 'hero': 'Loki' };

            dfd.notify(progressArgs);
            dfd.progress(progressSpy);

            progressSpy.should.have.been.called;
            progressSpy.should.have.been.called.calledWith(progressArgs);
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
            var failSpy = sinon.spy(),
                failArgs = { 'hero': 'Luke Cage' };

            dfd.reject(failArgs);
            dfd.always(failSpy);

            failSpy.should.have.been.called;
            failSpy.should.have.been.calledWith(failArgs);
        });

        it('should immediatelly call callbacks for already resolved deferred', function () {
            var doneSpy = sinon.spy(),
                doneArgs = { 'hero': 'Magneto' };

            dfd.resolve(doneArgs);
            dfd.always(doneSpy);

            doneSpy.should.have.been.called;
            doneSpy.should.have.been.calledWith(doneArgs);
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

        it('should support complex then chains', function () {
            var dfd1 = new $.Deferred(),
                result = { 'hero': 'Stan Lee' };

            dfd.then(function () {
                return dfd1.then(function () {
                    return result;
                });
            }).done(function (arg) {
                arg.should.be.equal(result);
            });

            dfd.resolve();
            dfd1.resolve();
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

describe('helpers', function () {
    beforeEach(function () {
        dfd = new $.Deferred();
    });

    describe('$.when', function () {
        it('should always return Promise', function () {
            isPromise($.when());
            isPromise($.when({ 'hero': 'Moon Knight' }));
            isPromise($.when(null));
            isPromise($.when(dfd));
            isPromise($.when(dfd.promise()));
            isPromise($.when(dfd, new $.Deferred()));
        });

        it('should immediately call success callbacks for non-Deferred/Promise objects', function () {
            var whenSpy = sinon.spy(),
                whenArg = { 'hero': 'Mr. Fantastic' };

            $.when().done(whenSpy);
            whenSpy.should.have.been.called;

            whenSpy = sinon.spy();
            $.when(null).done(whenSpy);
            whenSpy.should.have.been.calledWith(null);

            whenSpy = sinon.spy();
            $.when(whenArg).done(whenSpy);
            whenSpy.should.have.been.calledWith(whenArg);
        });

        it('should accept Deferred object and return it;s Promise', function () {
            $.when(dfd).should.be.equal(dfd.promise());
        });

        it('should wait for all passed deferreds before success callbacks calling', function () {
            var doneSpy = sinon.spy(),
                dfd1 = new $.Deferred();

            $.when(dfd, dfd1).done(doneSpy);
            doneSpy.should.not.have.been.called;
            dfd.resolve();
            dfd1.resolve();
            doneSpy.should.have.been.called;
        });

        it('should not call success callbacks if at least one deffered has been rejected', function () {
            var doneSpy = sinon.spy(),
                dfd1 = new $.Deferred();

            $.when(dfd, dfd1).done(doneSpy);
            dfd.resolve();
            dfd1.reject();
            doneSpy.should.not.have.been.called;
        });

        it('should call fail callbacks if at least one deffered has been rejected', function () {
            var failSpy = sinon.spy(),
                doneSpy = sinon.spy(),
                dfd1 = new $.Deferred();

            $.when(dfd, dfd1).done(doneSpy).fail(failSpy);
            dfd.resolve();
            dfd1.reject();
            failSpy.should.have.been.called;
            doneSpy.should.not.have.been.called;
        });

        it('should pass resolved arguments correctly', function () {
            var doneSpy = sinon.spy(),
                resolveArgs = { 'hero': 'Ms. Marvel' },
                resolveArgs1 = { 'hero': 'Nightcrawler' };

            $.when(dfd).done(doneSpy);

            dfd.resolve(resolveArgs, resolveArgs1);
            doneSpy.should.have.been.calledWith(resolveArgs, resolveArgs1);
        });

        it('should pass rejected arguments correctly', function () {
            var failSpy = sinon.spy(),
                rejectArgs = { 'hero': 'Nova' };

            $.when(dfd, new $.Deferred()).fail(failSpy);

            dfd.reject(rejectArgs);
            failSpy.should.have.been.calledWith(rejectArgs);
        });

        it('should pass resolved arguments from all passed deferreds', function () {
            var doneSpy = sinon.spy(),
                dfd1 = new $.Deferred(),
                resolveArgs = { 'hero': 'Psylocke' },
                resolveArgs1 = { 'hero': 'Punisher' };

            $.when(dfd, dfd1).done(doneSpy);
            dfd.resolve(resolveArgs);
            dfd1.resolve(resolveArgs1);

            doneSpy.should.have.been.calledWith(resolveArgs, resolveArgs1);
        });

        it('should pass resolved arguments from all passed deferreds correctly', function () {
            var doneSpy = sinon.spy(),
                dfd1 = new $.Deferred(),
                resolveArgs = { 'hero': 'Psylocke' },
                resolveArgs1 = ['Rocket Raccoon', 'Rogue'];

            $.when(dfd, dfd1).done(doneSpy);
            dfd.resolve(resolveArgs);
            dfd1.resolve.apply(dfd1, resolveArgs1);

            doneSpy.should.have.been.calledWith(resolveArgs, resolveArgs1);
        });

        it('should pass resolved context from passed deferred', function (done) {
            var resolveContext = { 'hero': 'She-Hulk' },
                resolveArgs = { 'hero': 'Silver Surfer' };

            $.when(dfd).done(function (arg) {
                this.should.be.equal(resolveContext);
                arg.should.be.equal(resolveArgs);

                done();
            });
            dfd.resolveWith(resolveContext, [resolveArgs]);
        });

        it('should pass resolved context from all passed deferreds correctly', function (done) {
            var dfd1 = new $.Deferred(),
                resolveContext = { 'hero': 'Psylocke' },
                resolveContext1 = { 'hero': 'Scarlet Witch' };

            $.when(dfd, dfd1).done(function () {
                this[0].should.be.equal(resolveContext);
                this[1].should.be.equal(resolveContext1);

                done();
            });
            dfd.resolveWith(resolveContext);
            dfd1.resolveWith(resolveContext1);
        });

        it('should notify result deferred during param-deferreds progress', function () {
            var progressArg = { 'hero': 'Star-Lord' };

            $.when('Squirrel Girl', dfd).progress(function () {
                should.not.exist(arguments[0]);
                arguments[1].should.be.equal(progressArg);
            });
            dfd.notify(progressArg);
        });

        it('should notify result deferred during param-deferreds progress and pass correct context', function () {
            var dfd1 = new $.Deferred(),
                progressCtx = { 'hero': 'Thing' },
                progressArg = { 'hero': 'Storm' };

            $.when(dfd1, 'Taskmaster', dfd).progress(function () {
                should.not.exist(arguments[0]);
                should.not.exist(arguments[1]);
                arguments[2].should.be.equal(progressArg);

                this.length.should.be.equal(3);
                should.not.exist(this[0]);
                should.not.exist(this[1]);
                this[2].should.be.equal(progressCtx);
            });
            dfd.notifyWith(progressCtx, [progressArg]);
        });
    });
});