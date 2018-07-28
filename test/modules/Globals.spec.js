import * as Globals from '../../src/modules/Globals.js';

describe('Globals', function() {
    after(function() {
        Globals.install(window, document);
    });

    describe('.installed()', function() {
        it('should return true if library globals has been installed', function() {
            expect(Globals.installed()).to.be.true;
        });

        it('should return false if library globals are not installed', function() {
            Globals.uninstall();
            expect(Globals.installed()).to.be.false;
        });
    });

    describe('.install(host, root)', function() {
        beforeEach(function() {
            Globals.uninstall();
        });

        it('should install library globals using the given host and root parameters and return true if successful', function() {
            expect(Globals.install(window, document)).to.be.true;
        });

        it('should execute all onInstall callbacks when it installs library globals', function() {
            let called = false;
            Globals.onInstall(function() {
                called = true;
            });
            Globals.install(window, document);
            expect(called).to.be.true;
        });

        it('should do nothing if library globals is already installed', function() {
            expect(Globals.install(window, document)).to.be.true;
            expect(Globals.install(window, document)).to.be.false;
        });
    });

    describe('.uninstall()', function() {
        beforeEach(function() {
            Globals.install(window, document);
        });

        it('should uninstall library globals when called and return true if successful', function() {
            expect(Globals.uninstall()).to.be.true;
        });

        it('should execute all registered onUninstall callbacks when it uninstalls library globals', function() {
            let called = false;
            Globals.onUninstall(function() {
                called = true;
            });
            Globals.uninstall();
            expect(called).to.be.true;
        });

        it('should do nothing if the library is not installed', function() {
            expect(Globals.uninstall()).to.be.true;
            expect(Globals.uninstall()).to.be.false;
        });
    });

    describe('.host', function() {
        beforeEach(function() {
            Globals.uninstall();
        });

        it('should be null until library globals are installed', function() {
            expect(Globals.host).to.be.null;
        });

        it('should reflect the host object immediately after library globals are intalled', function() {
            Globals.install(window, document);
            expect(Globals.host).to.be.equals(window);
        });

        it('should be null immediately after library globals are uninstalled', function() {
            expect(Globals.host).to.be.null;
        });
    });

    describe('.root', function() {
        beforeEach(function() {
            Globals.uninstall();
        });

        it('should be null until library globals are installed', function() {
            expect(Globals.root).to.be.null;
        });

        it('should reflect the root object immediately after library globals are intalled', function() {
            Globals.install(window, document);
            expect(Globals.root).to.be.equals(document);
        });

        it('should be null immediately after library globals are uninstalled', function() {
            expect(Globals.root).to.be.null;
        });
    });

    describe('.onInstall(callback)', function() {
        beforeEach(function() {
            Globals.uninstall();
        });

        it('should register a callback that gets executed once library globals are installed', function() {
            let called = false;
            Globals.onInstall(function() {
                called = true;
            });
            Globals.install(window, document);
            expect(called).to.be.true;
        });

        it('should execute the callback immediately if library globals are already installed', function() {
            let called = false;
            Globals.install(window, document); //install it
            Globals.onInstall(function() {
                called = true;
            });
            expect(called).to.be.true;
        });

        it('should throw a TypeError if callback is not a function', function() {
            expect(function() {
                Globals.onInstall(null);
            }).to.throw(TypeError);
        });
    });

    describe('.onUninstall(callback)', function() {
        beforeEach(function() {
            Globals.install(window, document);
        });

        it('should register a callback that gets executed once library globals are uninstalled', function() {
            let called = false;
            Globals.onUninstall(function() {
                called = true;
            });
            Globals.uninstall();
            expect(called).to.be.true;
        });

        it('should execute the callback immediately if library globals are not installed', function() {
            let called = false;
            Globals.uninstall(); //uninstall it
            Globals.onUninstall(function() {
                called = true;
            });
            expect(called).to.be.true;
        });

        it('should throw error if callback is not a function', function() {
            expect(function() {
                Globals.onUninstall(null);
            }).to.throw(TypeError);
        });
    });

    describe('.browserPrefixes', function() {
        it('should return an array of browser prefixes', function() {
            expect(Globals.browserPrefixes).to.be.an('array');
        });
    });
});