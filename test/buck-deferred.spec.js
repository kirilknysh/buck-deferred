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

});