import {zoneSymbol} from '../../lib/browser/utils';

describe('setTimeout', function () {
  it('should intercept setTimeout', function (done) {
    var cancelId: any;
    var testZone = Zone.current.fork(Zone['wtfZoneSpec']).fork({ name: 'TestZone' });
    testZone.run(() => {
      var timeoutFn = function () {
        expect(Zone.current.name).toEqual(('TestZone'));
        global[zoneSymbol('setTimeout')](function () {
          expect(wtfMock.log).toEqual([
            '# Zone:fork("<root>::WTF", "TestZone")',
            '> Zone:invoke:unit-test("<root>::WTF::TestZone")',
            '# Zone:schedule:macroTask:setTimeout("<root>::WTF::TestZone", ' + id + ')',
            '< Zone:invoke:unit-test',
            '> Zone:invokeTask:setTimeout("<root>::WTF::TestZone")',
            '< Zone:invokeTask:setTimeout'
          ]);
          done();
        });
      };
      expect(Zone.current.name).toEqual(('TestZone'));
      cancelId = setTimeout(timeoutFn, 3);
      var id = JSON.stringify((<MacroTask>cancelId).data);
      expect(wtfMock.log).toEqual([
        '# Zone:fork("<root>::WTF", "TestZone")',
        '> Zone:invoke:unit-test("<root>::WTF::TestZone")',
        '# Zone:schedule:macroTask:setTimeout("<root>::WTF::TestZone", ' + id + ')'
      ]);
    }, null, null, 'unit-test');
  });

  it('should allow canceling of fns registered with setTimeout', function (done) {
    var spy = jasmine.createSpy('spy');
    var cancelId = setTimeout(spy, 0);
    clearTimeout(cancelId);
    setTimeout(function () {
      expect(spy).not.toHaveBeenCalled();
      done();
    });
  });

  it('should allow canceling undefined timeout ids', function () {
    var clearUndefined = function() {
      clearTimeout(undefined);
    };
    expect(clearUndefined).not.toThrow();
  });

});
