/**
 * the Xhr module performs request related tasks, manages request queues, progress watch,
 * request headers and lots more
 *@module Xhr
*/
import {install} from './Globals.js';
import Util from './Util.js';
import Queue from './Queue.js';
import Transport from './XhrComponents/Transport.js';
import _Request from './XhrComponents/Request.js';
import _Response from './XhrComponents/Response.js';

/**
 *@name xhrStates
 *@private
*/
let xhrStates = {

        /**
         * default request timeout value.
        */
        timeoutAfter: 15000,

        /**
         * boolean value to indicate if manager has been started
        */
        started: false,

        /**
         * time in milliseconds to poll requests in a repeating circle
        */
        pollAfter: 250,

        /**
         * this is the number of milliseconds a request will stay and its priority level will be
         * promoted
        */
        promoteAfter: 3000,

        /**
         * pending requests
        */
        pendingRequests: new Queue(null, true, false, (one, two) => {
            return Queue.fnSort(one.priority, two.priority);
        }),

        /**
         * active requests
        */
        activeRequests: new Queue(null, false),

        /**
         * global headers
        */
        globalHeaders: {

        }
    },

    /**
     *@private
     * checks for request that have completed, initaiting the appropriate callback
    */
    checkActiveRequests = function () {
        xhrStates.activeRequests.forEach(function(request, idx, queue) {
            if (request.state === 'complete') {
                queue.deleteIndex(idx);

                let response = new _Response(request);
                if (response.ok)
                    request.resolve(response);
                else
                    request.reject(response);
            }
        });
    },

    /**
     *@private
     * executes next request
    */
    executeNextRequest = function () {
        let activeRequests = xhrStates.activeRequests,
            pendingRequests = xhrStates.pendingRequests;

        while(activeRequests.length < 4 && pendingRequests.length > 0) {
            let request = pendingRequests.shift();

            request.send();

            request.stayed = 0;
            activeRequests.put(request);
        }
    },

    /**
     * promotes the priority of each pending request that have lasted for ageLimit
     *@private
    */
    promote = function () {
        var pendingRequests = xhrStates.pendingRequests;
        pendingRequests.forEach((request) => {
            request.age += xhrStates.pollAfter;
            if (request.age >= xhrStates.promoteAfter) {
                request.age = 0;
                request.priority -= 1;
            }
        });
        pendingRequests.sort();
    },

    /**
     * manages the polling process.
     *@private
    */
    manage = function() {
        clearTimeout(xhrStates.iterationId);

        promote();
        executeNextRequest();
        checkActiveRequests();

        if (xhrStates.pendingRequests.length > 0 || xhrStates.activeRequests.length > 0)
            xhrStates.iterationId = setTimeout(manage, xhrStates.pollAfter);
        else
            xhrStates.started = false;
    },

    /**
     * starts the polling processing.
     *@private
    */
    start = function() {
        if (xhrStates.started)
            return;

        xhrStates.iterationId = setTimeout(manage, xhrStates.pollAfter);
        xhrStates.started = true;
    },

    /**
     * asynchronously execute a http request on the given url using a given http method verb.
     *@private
     *@param {string} url - the resource url
     *@param {Object} [options] - optional request configuration object
     *@returns {Promise}
    */
    fetch = function(url, options, overrideMethod) {
        options = Util.isPlainObject(options)? options : {};

        options.globalHeaders = xhrStates.globalHeaders;
        options.overrideMethod = overrideMethod;
        options.timeoutAfter = xhrStates.timeoutAfter;

        return new Promise((resolve, reject) => {
            let request = new _Request(url, options, resolve, reject, Transport.create());
            request.age = 0;
            request.active = false;
            xhrStates.pendingRequests.put(request);
            start();
        });
    };

export default {

    /**
     * calls the Globals install method with the parameters. This is useful when using the
     * Utils module as a standalone distribution or lib.
     *
     *@param {Object} hostParam - the host object, the global this object in a given usage
     * environment
     *@param {Object} rootParam - the root object. an example is the document object
     *@returns {boolean}
    */
    install(hostParam, rootParam) {
        return install(hostParam, rootParam);
    },

    /**
     * sets default request timeout or retrieves the default timeout value. Default is 15000 ms
     *@param {number} [ms] - time in milliseconds after which to timeout request
     *@returns {*}
    */
    timeoutAfter(ms) {
        if (!Util.isNumber(ms))
            return xhrStates.timeoutAfter;

        xhrStates.timeoutAfter = ms;
        return this;
    },

    /**
     * sets the polling time or retrieves the poll time value. The default value is 250ms
     *@param {number} [ms] - time in milliseconds after which to poll requests repeatedly
     *@returns {*}
    */
    pollAfter(ms) {
        if (!Util.isNumber(ms))
            return xhrStates.pollAfter;

        xhrStates.pollAfter = ms;
        return this;
    },

    /**
     * sets time after which a pending request priority is promoted one value up or returns
     * the value if called with no ms argument. default value is 3000ms
     *@param {number} ms - time in milliseconds after which to promote a request's priority
     *@returns {*}
    */
    promoteAfter(ms) {
        if (!Util.isNumber(ms))
            return xhrStates.promoteAfter;

        xhrStates.promoteAfter = ms;
        return this;
    },

    /**
     * indicates if xml http request is supported
     *@type {boolean}
    */
    get supported() {
        return Transport.supported;
    },

    /**
     * contains the  ActiveXObject MSXML version string used in creating xhr transport.
     * Its value will be empty if created through the XMLHttpRequest construct
     *@type {string}
    */
    get ieString() {
        return Transport.ieString;
    },

    /**
     * adds a http header to the global header object.
     *@param {string} name - the header name
     *@param {*} value - the header value
     *@returns {this}
    */
    addHeader(name, value) {
        name = name.toString().trim();
        xhrStates.globalHeaders[name] = value;
        return this;
    },

    /**
     * adds http headers to the global header object.
     *@param {Object} entries - the header entries
     *@returns {this}
    */
    addHeaders(entries) {
        for (const [name, value] of Object.entries(entries))
            this.addHeader(name, value);
        return this;
    },

    /**
     * removes http header from the global header object.
     *@param {string} headerName - global header to remove
     *@returns {this}
    */
    removeHeader(headerName) {
        headerName = headerName.toString().trim();
        delete xhrStates.globalHeaders[headerName];
        return this;
    },

    /**
     * removes comma separated list of headers from the global header object.
     *@param {...string} headerNames - comma separated list of headers to remove
     *@returns {this}
    */
    removeHeaders(...headerNames) {
        for (let headerName of headerNames)
            this.removeHeader(headerName);

        return this;
    },

    /**
     * asynchronously execute a http request on the given url using a given http method verb.
     *@param {string} url - the resource url
     *@param {Object} [options] - optional request configuration object
     *@returns {Promise}
    */
    fetch(url, options) {
        return fetch(url, options);
    },

    /**
     * get data asynchronously from given url.
     *@param {string} url - the resource url
     *@param {Object} [options] - optional request configuration object
     *@returns {Promise}
    */
    get(url, options) {
        return fetch(url, options, 'GET');
    },

    /**
     * post data asynchronously to the given url.
     *@param {string} url - the resource url
     *@param {Object} [options] - optional request configuration object
     *@returns {Promise}
    */
    post(url, options) {
        return fetch(url, options, 'POST');
    },

    /**
     * put data asynchronously on the given url.
     *@param {string} url - the resource url
     *@param {Object} [options] - optional request configuration object
     *@returns {Promise}
    */
    put(url, options) {
        return fetch(url, options, 'PUT');
    },

    /**
     * delete data asynchronously on the given url.
     *@param {string} url - the resource url
     *@param {Object} [options] - optional request configuration object
     *@returns {Promise}
    */
    delete(url, options) {
        return fetch(url, options, 'DELETE');
    },

    /**
     * retrieve a resource meta headers from the given url.
     *@param {string} url - the resource url
     *@param {Object} [options] - optional request configuration object
     *@returns {Promise}
    */
    head(url, options) {
        return fetch(url, options, 'HEAD');
    },

    /**
     * retrieve resource permitted http communications method verbs from the given url.
     *@param {string} url - the resource url
     *@param {Object} [options] - optional request configuration object
     *@returns {Promise}
    */
    options(url, options) {
        return fetch(url, options, 'OPTIONS');
    },
};