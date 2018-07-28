/**
 *@module Globals
*/

/**
 *@private
*/
let installCallbacks = [],

    /**
     *@private
    */
    uninstallCallbacks = [],

    /**
     *@private
     * returns boolean indicating if argument is a function
    */
    isCallable = function(callback) {
        return (toString.call(callback) === '[object Function]' ||
            callback instanceof Function) && !(callback instanceof RegExp);
    },

    /**
     *@private
     * runs the callback function
     *@param {Function} callback - the callback function
    */
    runCallback = function(callback) {
        try {
            callback();
        }
        catch(ex) {
            //
        }
    };

/**
 * the host object. the topmost this object in a given environment
 *@type {Object}
 *@memberof Globals
*/
export let host = null;

/**
 * the root object. an example is the document object
 *@memberof Globals
 *@type {Object}
*/
export let root = null;

/**
 *@function
 *@memberof Globals
 *@param {*} variable - variable to operate on
 *@returns {string}
*/
export let toString = Object.prototype.toString;

/**
 * returns boolean indicating if library globals have been installed
 *@memberof Globals
 *@returns {boolean}
*/
export let installed = function() {
    return host !== null && root !== null;
};

/**
 * registers callback to execute when the library globals are installed
 *@memberof Globals
 *@param {Function} callback - callback function to execute
 *@throws {TypeError} if callback is not a function
 *@returns {boolean}
*/
export let onInstall = function(callback) {
    if (!isCallable(callback))
        throw new TypeError('callback is not a function');

    if (installed())
        runCallback(callback);
    else
        installCallbacks.push(callback);
};

/**
 * registers callback to execute when the library globals are uninstalled
 *@memberof Globals
 *@param {Function} callback - callback function to execute
 *@returns {boolean}
 *@throws {TypeError} if callback is not a function
*/
export let onUninstall = function(callback) {
    if (!isCallable(callback))
        throw new TypeError('callback is not a function');

    if (!installed())
        runCallback(callback);
    else
        uninstallCallbacks.push(callback);
};

/**
 * installs the globals and executes all registered onInstall callbacks
 *@memberof Globals
 *@param {Object} hostParam - the host object, the global this object in a given test environment
 *@param {Object} rootParam - the root object. an example is the document object
 *@returns {boolean}
*/
export let install = function(hostParam, rootParam) {
    if (!installed() && hostParam && rootParam) {
        host = hostParam;
        root = rootParam;

        installCallbacks.forEach(installCallback => {
            runCallback(installCallback);
        });
        installCallbacks = [];
        return true;
    }
    return false;
};

/**
 * uninstalls the globals and executes all registered onUninstall callbacks
 *@memberof Globals
 *@returns {boolean}
*/
export let uninstall = function() {
    if (installed()) {
        host = root = null;
        uninstallCallbacks.forEach(uninstallCallback => {
            runCallback(uninstallCallback);
        });
        uninstallCallbacks = [];
        return true;
    }
    return false;
};

/**
 * contains browser vendor prefixes
 *@memberof Globals
 *@type {string[]}
*/
export let browserPrefixes = ['khtml-', 'o-', 'moz-', 'ms-', 'webkit-', ''];

// try and install it if window and document objects are present
/* istanbul ignore else */
if (typeof window !== 'undefined' && typeof window.document !== 'undefined')
    install(window, window.document);