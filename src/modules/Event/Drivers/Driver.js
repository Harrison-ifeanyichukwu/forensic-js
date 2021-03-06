/**
 *@namespace EventDrivers
*/

/**
 *@module Driver
 *@memberof EventDrivers
*/

/**
 * event initialization options.
 *@typedef {Object} EventInit
 *@private
 *@property {boolean} [bubbles=true] - boolean value indicating if event bubbles
 *@property {boolean} [cancelable=false] - boolean value indicating if event is
 * cancelable
*/
import {createDOMEvent} from '../../Globals.js';
import Util from '../../Util.js';

/**
 * base event driver class
 *@memberof EventDrivers.Driver#
 *@see {@link https://developer.mozilla.org/en-US/docs/Web/API/Event| Mozilla Developers Network}
*/
export default class Driver {
    /**
     * event types in the base Event interface
     *@memberof EventDrivers.Driver
     *@type {Array}
    */
    static get events() {
        return [
            'afterprint', 'audioend', 'audiostart', 'beforeprint', 'cached', 'canplay',
            'canplaythrough', 'change', 'chargingchange', 'chargingtimechange', 'checking',
            'close', 'dischargingtimechange', 'DOMContentLoaded', 'downloading', 'durationchange',
            'emptied', 'end', 'ended', 'fullscreenchange', 'fullscreenerror', 'languagechange',
            'loadeddata', 'loadedmetadata', 'noupdate', 'obsolete', 'offline', 'online', 'open',
            'orientationchange', 'pause', 'play', 'playing', 'ratechange', 'readystatechange',
            'reset', 'seeked', 'seeking', 'selectstart', 'selectionchange', 'soundend',
            'soundstart', 'stalled', 'start', 'submit', 'success', 'suspend', 'timeupdate',
            'updateready', 'volumechange', 'waiting'
        ];
    }

    /**
     *@type {Array}
     *@memberof EventDrivers.Driver
    */
    static get eventInitKeys() {
        return ['bubbles', 'cancelable'];
    }

    /**
     * initializes the event according to the Event interface eventInit requirement
     *@memberof EventDrivers.Driver
     *@param {Object} storeIn - object in which to store initializations
     *@param {EventInit} getFrom - event initialization objects
     *@returns {Object}
    */
    static initEvent(storeIn, getFrom) {
        storeIn.bubbles = typeof getFrom.bubbles !== 'undefined' && !getFrom.bubbles?
            false : true;
        storeIn.cancelable = typeof getFrom.cancelable !== 'undefined' && !getFrom.cancelable?
            false : true;
        return storeIn;
    }

    /**
     * creates an Event object that can be dispatched to an event target
     *@memberof EventDrivers.Driver
     *@param {string} type - the event type
     *@param {EventInit} eventInit - event initialization object
     *@returns {Event}
    */
    static create(type, eventInit) {
        return createDOMEvent(
            'Event', type, this.initEvent({}, eventInit), this.eventInitKeys
        );
    }

    /**
     *@param {Event} event - the dispatched event object
    */
    constructor(event) {
        this.event = event;
        this._currentTarget = null;
        this._isPropagating = true;
        this._phase = 1;
        this._passive = false;
    }

    /**
     *@type {string}
     *@memberof EventDrivers.Driver#
     *@private
    */
    get [Symbol.toStringTag]() {
        return 'Driver';
    }

    /**
     * the event type
     *@memberof EventDrivers.Driver#
     *@type {string}
    */
    get type() {
        return this.event.type;
    }

    /**
     * the event target
     *@memberof EventDrivers.Driver#
     *@type {EventTarget}
    */
    get target() {
        return this.event.target;
    }

    /**
     * gets the current target whose event listener's callback is being invoked
     *@memberof EventDrivers.Driver#
     *@type {EventTarget}
    */
    get currentTarget() {
        return this._currentTarget || this.event.currentTarget;
    }

    /**
     * sets the current target whose event listener's callback is being invoked.
     *@memberof EventDrivers.Driver#
     *@param {EventTarget} target - the current event target
     *@private
    */
    set currentTarget(target) {
        if (Util.isEventTarget(target))
            this._currentTarget = target;
    }

    /**
     * returns boolean indicating if it is passive event
     *@memberof EventDrivers.Driver#
     *@type {boolean}
    */
    get passive() {
        return this._passive;
    }

    /**
     * sets boolean property indicating if it passive event.
     *@memberof EventDrivers.Driver#
     *@private
     *@param {boolean} status - the status
    */
    set passive(status) {
        this._passive = status? true : false;
    }

    /**
     * the event phase
     *@memberof EventDrivers.Driver#
     *@type {number}
    */
    get phase() {
        return this._phase;
    }

    /**
     * sets event phase
     *@memberof EventDrivers.Driver#
     *@private
     *@param {number} value - the event phase
     *@returns {boolean}
    */
    set phase(value) {
        switch(value) {
            case 0:
            case 1:
            case 2:
                this._phase = value;
                break;
            default:
                this._phase = 3;
                break;
        }
    }

    /**
     * boolean value indicating if event bubbles
     *@memberof EventDrivers.Driver#
     *@type {boolean}
    */
    get bubbles() {
        return this.event.bubbles;
    }

    /**
     * boolean value indicating if event was dispatched by the user agent, and false otherwise.
     *@memberof EventDrivers.Driver#
     *@type {boolean}
    */
    get isTrusted() {
        return this.event.isTrusted;
    }

    /**
     * boolean value indicating if event default action has been prevented
     *@memberof EventDrivers.Driver#
     *@type {boolean}
    */
    get defaultPrevented() {
        return this.event.defaultPrevented;
    }

    /**
     * boolean value indicating if event is still propagating
     *@memberof EventDrivers.Driver#
     *@type {boolean}
    */
    get isPropagating() {
        return this._isPropagating;
    }

    /**
     * the creation time of event as the number of milliseconds that passed since
     * 00:00:00 UTC on 1 January 1970.
     *@memberof EventDrivers.Driver#
     *@type {number}
    */
    get timestamp() {
        return this.event.timeStamp;
    }

    /**
     * stops the event from propagating.
     *@memberof EventDrivers.Driver#
    */
    stopPropagation() {
        this.event.stopPropagation();
        this._isPropagating = false;
    }

    /**
     * prevents the events default.
     *@memberof EventDrivers.Driver#
    */
    preventDefault() {
        if (this.passive)
            throw new Error('can\'t call preventDefault inside passive event listener');

        else if (!this.defaultPrevented)
            this.event.preventDefault();
    }
}