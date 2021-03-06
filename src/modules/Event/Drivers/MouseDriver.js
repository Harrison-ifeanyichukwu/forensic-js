/**
 *@module MouseDriver
 *@memberof EventDrivers
*/

/**
 * event initialization options.
 *@typedef {Object} MouseEventInit
 *@private
 *@property {boolean} [bubbles=true] - boolean value indicating if event bubbles
 *@property {boolean} [cancelable=false] - boolean value indicating if event is
 * cancelable
 *@property {WindowProxy} [view=null] - identifies the window from which the event was generated.
 *@property {number} [detail=0] - value is initialized to a number that is application-specific.
 *@property {long} [screenX=0] - initializes the X cordinate of the mouse in
 * relation to the device physical screen
 *@property {long} [screenY=0] - initializes the Y cordinate of the mouse in
 * relation to the device physical screen
 *@property {long} [clientX=0] - initializes the X cordinate of the mouse in
 * relation to the browser viewport
 *@property {long} [clientY=0] - initializes the Y cordinate of the mouse in
 * relation to the browser viewport
 *@property {boolean} [ctrlKey=false] - boolean indicating if the control key
 * was active during the event initiation
 *@property {boolean} [altKey=false] - boolean indicating if the alternate key
 * was active during the event initiation
 *@property {boolean} [shiftKey=false] - boolean indicating if the shift key
 * was active during the event initiation
 *@property {boolean} [metaKey=false] - boolean indicating if the meta key
 * was active during the event initiation
 *@property {short} [button=0] - initializes the button that was pressed. 0 represents
 * left button, 1 is wheel button, 2 is right button
 *@property {EventTarget} [relatedTarget=null] - initializes the secondary EventTarget
 * related to a Focus event, depending on the type of event.
*/
import {createDOMEvent} from '../../Globals.js';
import UIDriver from './UIDriver.js';
import Util from '../../Util.js';

/**
 * mouse event driver class
 *@memberof EventDrivers.MouseDriver#
 *@see {@link https://www.w3.org/TR/uievents/#events-mouseevents| W3C.org}
*/
export default class MouseDriver extends UIDriver {
    /**
     * event types in the mouse event interface
     *@memberof EventDrivers.MouseDriver
     *@type {Array}
    */
    static get events() {
        return [
            'click', 'dblclick', 'contextmenu', 'mousedown', 'mousemove', 'mouseup',
            'mouseover', 'show', 'mouseout'
        ];
    }

    /**
     * event init keys
     *@memberof EventDrivers.MouseDriver
     *@type {Array}
    */
    static get eventInitKeys() {
        let keys = UIDriver.eventInitKeys;

        keys.push(
            'screenX', 'screenY', 'clientX', 'clientY', 'ctrlKey', 'altKey', 'shiftKey',
            'metaKey', 'button', 'relatedTarget'
        );
        return keys;
    }

    /**
     * initializes the event according to the MouseEvent interface eventInit requirement
     *@memberof EventDrivers.MouseDriver
     *@param {Object} storeIn - object in which to store initializations
     *@param {MouseEventInit} getFrom - event initialization objects
     *@returns {Object}
    */
    static initEvent(storeIn, getFrom) {
        UIDriver.initEvent(storeIn, getFrom);

        storeIn.screenX = Util.isNumber(getFrom.screenX)? getFrom.screenX : 0;
        storeIn.screenY = Util.isNumber(getFrom.screenY)? getFrom.screenY : 0;

        storeIn.clientX = Util.isNumber(getFrom.clientX)? getFrom.clientX : 0;
        storeIn.clientY = Util.isNumber(getFrom.clientY)? getFrom.clientY : 0;

        storeIn.ctrlKey = getFrom.ctrlKey? true : false;
        storeIn.altKey = getFrom.altKey? true : false;
        storeIn.shiftKey = getFrom.shiftKey? true : false;
        storeIn.metaKey = getFrom.metaKey? true : false;

        storeIn.button = Util.isNumber(getFrom.button)? getFrom.button : 0;
        storeIn.relatedTarget = Util.isEventTarget(getFrom.relatedTarget)?
            getFrom.relatedTarget : null;

        return storeIn;
    }

    /**
     * creates a MouseEvent object that can be dispatched to an event target
     *@memberof EventDrivers.MouseDriver
     *@param {string} type - the event type
     *@param {MouseEventInit} eventInit - event initialization object
     *@returns {MouseEvent}
    */
    static create(type, eventInit) {
        return createDOMEvent(
            'MouseEvent', type, this.initEvent({}, eventInit), this.eventInitKeys
        );
    }

    /**
     *@param {MouseEvent} event - the dispatched event object
    */
    constructor(event) {
        super(event);
    }

    /**
     *@memberof EventDrivers.MouseDriver#
     *@private
     *@type {string}
    */
    get [Symbol.toStringTag]() {
        return 'MouseDriver';
    }

    /**
     * the X cordinate of the mouse in relation to the browser viewport
     *@memberof EventDrivers.MouseDriver#
     *@type {float}
    */
    get clientX() {
        return this.event.clientX;
    }

    /**
     * the Y cordinate of the mouse in relation to the browser viewport
     *@memberof EventDrivers.MouseDriver#
     *@type {float}
    */
    get clientY() {
        return this.event.clientY;
    }

    /**
     * the X cordinate of the mouse in relation to device physical screen
     *@memberof EventDrivers.MouseDriver#
     *@type {float}
    */
    get screenX() {
        return this.event.screenX;
    }

    /**
     * the Y cordinate of the mouse in relation to the device physical screen
     *@memberof EventDrivers.MouseDriver#
     *@type {float}
    */
    get screenY() {
        return this.event.screenY;
    }

    /**
     * boolean value indicating the control key is activated by the event
     *@memberof EventDrivers.MouseDriver#
     *@type {boolean}
    */
    get ctrlKey() {
        return this.event.ctrlKey;
    }

    /**
     * boolean value indicating the shift key is activated by the event
     *@memberof EventDrivers.MouseDriver#
     *@type {boolean}
    */
    get shiftKey() {
        return this.event.shiftKey;
    }

    /**
     * boolean value indicating the meta key is activated by the event
     *@memberof EventDrivers.MouseDriver#
     *@type {boolean}
    */
    get metaKey() {
        return this.event.metaKey;
    }

    /**
     * boolean value indicating the alternate key is activated by the event
     *@memberof EventDrivers.MouseDriver#
     *@type {boolean}
    */
    get altKey() {
        return this.event.altKey;
    }

    /**
     * the button that was pressed. 0 represents left button, 1 is wheel button,
     * 2 is right button
     *@memberof EventDrivers.MouseDriver#
     *@type {number}
    */
    get button() {
        return this.event.button;
    }

    /**
     * represents one or more button(s) of the mouse that are considered active during the
     * event phase. it is totally different from the button attribute.
     * 0 MUST indicate no button is active,
     * 1 MUST indicate the primary button of the mouse, usually the left button
     * 2 MUST indicate the secondary button of the mouse, usually the right button
     * 4 MUST indicate the auxiliary button in general, the middle button, often in a wheel event
     * Note that combination of buttons are represented as a bitwise number
     * 3 would represent 2 | 1
     * 5 would represent 4 | 1
     *@memberof EventDrivers.MouseDriver#
     *@returns {number}
    */
    get buttons() {
        return this.event.buttons;
    }

    /**
     * the secondary target for this event. In some cases (like when tabbing in or out
     * a page), this property may be set to null for security reasons.
     *@memberof EventDrivers.MouseDriver#
     *@type {EventTarget|null}
    */
    get relatedTarget() {
        return this.event.relatedTarget;
    }
}