/* jshint expr: true */

describe('$.Defered', function () {

    var dfd;

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
            var prms = dfd.promise();

            prms.should.be.equal(dfd._promise);
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

            doneSpy.should.have.been.calledOnce
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

});