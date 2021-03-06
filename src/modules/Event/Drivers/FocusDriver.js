/**
 *@module FocusDriver
 *@memberof EventDrivers
*/

/**
 * event initialization options.
 *@typedef {Object} FocusEventInit
 *@private
 *@property {boolean} [bubbles=true] - boolean value indicating if event bubbles
 *@property {boolean} [cancelable=false] - boolean value indicating if event is
 * cancelable
 *@property {WindowProxy} [view=null] - identifies the window from which the event was generated.
 *@property {number} [detail=0] - value is initialized to a number that is application-specific.
 *@property {EventTarget} [relatedTarget=null] - initializes the secondary EventTarget
 * related to a Focus event, depending on the type of event.
*/
import {createDOMEvent} from '../../Globals.js';
import UIDriver from './UIDriver.js';
import Util from '../../Util.js';

/**
 * focus event driver class
 *@memberof EventDrivers.FocusDriver#
 *@see {@link https://www.w3.org/TR/uievents/#events-focusevent| W3C.org}
*/
export default class FocusDriver extends UIDriver {
    /**
     * event types in the focus event interface
     *@memberof EventDrivers.FocusDriver
     *@type {Array}
    */
    static get events() {
        return ['blur', 'focus', 'focusin', 'focusout'];
    }

    /**
     * event init keys
     *@memberof EventDrivers.FocusDriver
     *@type {Array}
    */
    static get eventInitKeys() {
        let keys = UIDriver.eventInitKeys;

        keys.push('relatedTarget');
        return keys;
    }

    /**
     * initializes the event according to the FocusEvent interface eventInit requirement
     *@memberof EventDrivers.FocusDriver
     *@param {Object} storeIn - object in which to store initializations
     *@param {FocusEventInit} getFrom - event initialization objects
     *@returns {Object}
    */
    static initEvent(storeIn, getFrom) {
        UIDriver.initEvent(storeIn, getFrom);

        storeIn.relatedTarget = Util.isEventTarget(getFrom.relatedTarget)?
            getFrom.relatedTarget : null;
        return storeIn;
    }

    /**
     * creates a FocusEvent object that can be dispatched to an event target
     *@memberof EventDrivers.FocusDriver
     *@param {string} type - the event type
     *@param {FocusEventInit} eventInit - event initialization object
     *@returns {FocusEvent}
    */
    static create(type, eventInit) {
        return createDOMEvent(
            'FocusEvent', type, this.initEvent({}, eventInit), this.eventInitKeys
        );
    }

    /**
     *@param {FocusEvent} event - the dispatched event object
    */
    constructor(event) {
        super(event);
    }

    /**
     *@memberof EventDrivers.FocusDriver#
     *@private
     *@type {string}
    */
    get [Symbol.toStringTag]() {
        return 'FocusDriver';
    }

    /**
     * the secondary target for this event. In some cases (like when tabbing in or out
     * a page), this property may be set to null for security reasons.
     *@memberof EventDrivers.FocusDriver#
     *@type {EventTarget|null}
    */
    get relatedTarget() {
        return this.event.relatedTarget;
    }
}