/**
 *@module XML
*/
import { onInstall, host, root, install} from './Globals.js';
import Util from './Util.js';
import Xhr from './Xhr.js';

/**
 *@name xmlStates
 *@private
*/
let xmlStates = {

        /**
         * boolean value indicating if module is supported
        */
        supported: false,

        /**
         * internet explorer ActiveXObject implementation version string
        */
        ieString: '',

        /**
         * xml serializer
        */
        serializer: null,

        /**
         * dom xml parser
        */
        parser: null,
    },

    /**
     * handles internet explorer readystate change event
     *@private
     *@this {XMLDocument}
     *@param {Event} e - the ready state change event object
     *@param {Callable} resolve - promise resolve callback
     *@param {Callable} reject - promise reject callback
    */
    /* istanbul ignore next */
    handleIEReadyStateChangeEvent = function(e, resolve, reject) {
        if (this.readyState === 4 || this.readyState === 'complete') {
            if(this.parseError.errorCode === 0)
                resolve(this);
            else
                reject(this);
        }
    },

    /**
     * creates xml document through internet explorer active x object construct
     *@private
     *@param {string} [prolog] - xml prolog as well as optional root element
     *@param {DocumentType} [documentType=null] - new document documentType node. defaults to null.
     *@returns {XMLDocument}
    */
    /* istanbul ignore next */
    createActiveXObjectDocument = function(prolog, documentType) {
        let xmlDoc = new host.ActiveXObject(xmlStates.ieString);
        xmlDoc.async = true;
        if (prolog)
            xmlDoc.loadXML(prolog);

        switch(xmlStates.ieString) {
            case 'MSXML2.DOMDocument.6.0':
                xmlDoc.setProperty('SelectionLanguage', 'XPath');
                xmlDoc.setProperty('ProhibitDTD', false);
                break;
            case 'MSXML2.DOMDocument.3.0':
                xmlDoc.setProperty('SelectionLanguage', 'XSLPattern');
                break;
        }

        xmlDoc.setProperty('ValidateOnParse', false);
        xmlDoc.preserveWhiteSpace = true;

        if(documentType)
            xmlDoc.appendChild(documentType);

        return xmlDoc;
    },

    /**
     * creates xml document through the dom implementation createDocument method
     *@private
     *@param {string} [prolog] - xml prolog as well as optional root element
     *@param {DocumentType} [documentType=null] - new document documentType node. defaults to null.
     *@returns {XMLDocument}
    */
    creatDOMImplementationDocument = function(prolog, documentType) {
        var xmlDoc = root.implementation.createDocument('', '', documentType);
        xmlDoc.async = true;
        xmlDoc.parseError = {errorCode: 0, reason: '', srcText: '', line: 0, linepos: 0};

        if(prolog)
            xmlDoc.loadXML(prolog);

        return xmlDoc;
    },

    /**
     * creates an xml document. lazy loads
     *@private
     *@param {string} [prolog] - xml prolog as well as optional root element
     *@param {DocumentType} [documentType=null] - new document documentType node. defaults to null.
     *@returns {XMLDocument}
    */
    createDocument = function(prolog, documentType) {
        /* istanbul ignore if */
        if (typeof host.ActiveXObject !== 'undefined') {
            for (const version of ['MSXML2.XMLHttp.6.0', 'MSXML2.XMLHttp.3.0']) {
                try {
                    new host.ActiveXObject(version);
                    xmlStates.supported = true;
                    xmlStates.ieString = version;
                    createDocument = createActiveXObjectDocument;
                }
                catch(ex) {
                    //
                }
            }
        }

        /* istanbul ignore else */
        if (!xmlStates.supported && typeof root.implementation.createDocument !== 'undefined') {
            xmlStates.supported = true;
            createDocument = creatDOMImplementationDocument;
        }

        /* istanbul ignore if */
        if (!xmlStates.supported)
            createDocument = () => {
                throw new Error('XML Document is not supported');
            };

        creatDOMImplementationDocument = createActiveXObjectDocument = null;
        return createDocument(prolog, documentType);
    },

    /**
     *@private
     *@returns {string}
    */
    text = function() {

        if (!this.hasChildNodes())
            return this.data.trim();

        let text = [],
            childNodes = this.childNodes,
            len = childNodes.length,
            i = -1;
        while (++i < len) {
            let current = childNodes[i].text;
            if (current)
                text.push(current);
        }
        return text.join('\n');
    },

    /**
     * parses the xml string argument into the this document.
     *@private
     *@this {XMLDocument}
     *@param {string} xmlString - xml string
    */
    parseXML = function(xmlString) {
        let parsedXML = xmlStates.parser.parseFromString(xmlString, 'text/xml');

        if (parsedXML.getElementsByTagName('parsererror').length > 0) {
            //erronous document
            this.parseError.errorCode = 1;
            let parserError = parsedXML.getElementsByTagName('parsererror')[0],
                namespaceURI = parserError.namespaceURI.toLowerCase(),
                parserErrorString = '';

            /* istanbul ignore else */
            if (namespaceURI === 'http://www.mozilla.org/newlayout/xml/parsererror.xml') {
                //gecko format
                parserErrorString = parserError.text;

                /* istanbul ignore if */
                if (/^xml parsing error:\s*(.+)$/mi.test(parserErrorString)) {
                    //firefox parser
                    this.parseError.reason = RegExp.$1;

                    //capture line number and column number
                    /^line number (\d+), column (\d+)/mi.test(parserErrorString);
                    this.parseError.line = parseInt(RegExp.$1);
                    this.parseError.linepos = parseInt(RegExp.$2);
                }
                else {
                    //jsdom parser
                    /^(.+)$/mi.test(parserErrorString);
                    this.parseError.reason = RegExp.$1;

                    /^line: (\d+)$/mi.test(parserErrorString);
                    this.parseError.line = parseInt(RegExp.$1);

                    /^column: (\d+)$/mi.test(parserErrorString);
                    this.parseError.linepos = parseInt(RegExp.$1);

                }
            }
            else if (namespaceURI === 'http://www.w3.org/1999/xhtml') {
                // webkit parsererror format
                parserErrorString = parserError.getElementsByTagName('div')[0].text;
                if (/line (\d+) at column (\d+):\s+(.+)/i.test(parserErrorString)) {
                    this.parseError.reason = RegExp.$3;
                    this.parseError.line = parseInt(RegExp.$1);
                    this.parseError.linepos = parseInt(RegExp.$2);
                }
            }

            //locate src text
            let lines = xmlString.split(/\n\r?/m);
            this.parseError.srcText = lines[this.parseError.line - 1].trim();
        }

        if (this.documentElement)
            this.removeChild(this.documentElement);

        this.appendChild(this.importNode(parsedXML.documentElement, true));
    };

/**
 * sets up the xml module
 *@private
*/
let init = function() {

    /* istanbul ignore if */
    if (xmlStates.ieString)
        return;

    xmlStates.parser = new host.DOMParser();
    xmlStates.serializer = new host.XMLSerializer();

    let xml = createDocument(),
        /**
         *@name XMLDocument
        */
        XMLDocument = null;

    /* istanbul ignore if */
    if (Util.objectIsA(xml, 'XMLDocument'))
        XMLDocument = host.XMLDocument;
    else
        XMLDocument = host.Document;

    /**
     * override the load method
     *@memberof XMLDocument#
     *@param {string} url - xml resource url
     *@returns {Promise}
    */
    XMLDocument.prototype.load = function(url) {
        let xmlDoc = this;
        return new Promise((resolve, reject) => {

            Xhr.fetch(url).then((response) => {
                parseXML.call(xmlDoc, response.text());

                if (xmlDoc.parseError.errorCode === 0)
                    resolve(xmlDoc);
                else
                    reject(xmlDoc);
            })
                .catch(() => {
                    xmlDoc.parseError.errorCode = 1;
                    xmlDoc.parseError.reason = 'error occurred while fetching xml resource';
                    reject(xmlDoc);
                });
        });
    };

    /**
     * define a loadXML method
     *@memberof XMLDocument#
     *@param {string} xmlString - the xml string
    */
    XMLDocument.prototype.loadXML = function(xmlString) {
        parseXML.call(this, xmlString);
    };

    /*define xml getter property on node prototype*/
    Object.defineProperty(host.Node.prototype, 'xml', {
        get() {
            return xmlStates.serializer.serializeToString(this);
        }
    });

    /*define text property on node prototype */
    Object.defineProperty(host.Node.prototype, 'text', {
        get() {
            return text.call(this);
        }
    });
};

onInstall(init);

export default class XML {
    /**
     *@type {boolean}
     * true if xml document creation is supported
    */
    static get supported() {
        return xmlStates.supported;
    }

    /**
     *@type {string}
     * the activeXObject MSXML version string used assuming when running in internet explorer
    */
    static get ieString() {
        return xmlStates.ieString;
    }

    /**
     * calls the Globals install method with the parameters. This is useful when using the
     * Utils module as a standalone distribution or lib.
     *
     *@param {Object} hostParam - the host object, the global this object in a given usage
     * environment
     *@param {Object} rootParam - the root object. an example is the document object
     *@returns {boolean}
    */
    static install(hostParam, rootParam) {
        return install(hostParam, rootParam);
    }

    /**
     * xml document construct
     *@param {string} [qualifiedName] - document root node qualified name
     *@param {Object} [namespaces] - object literal containing prefixName:namespaceURI pairs.
     * the default namespaceURI should be named 'default' or 'xmlns'.
     *@param {DocumentType} [documentType] - a documentType node. defaults to null.
    */
    constructor(qualifiedName, namespaces, documentType) {
        let stringNamespaces = '';
        if (Util.isPlainObject(namespaces)) {
            for (let [name, value] of Object.entries(namespaces)) {
                let namespace = `xmlns${name === 'default' || name === 'xmlns'? '' : ':' + name}="${value}"`;
                stringNamespaces += ` ${namespace}`;
            }
        }

        let prolog = '';
        if (typeof qualifiedName === 'string' && qualifiedName) {
            prolog = `<?xml version="1.0" encoding="utf-8" ?>
                <${qualifiedName}${stringNamespaces? stringNamespaces : ''}></${qualifiedName}>`;
        }

        this._document = createDocument(prolog, documentType);
    }

    /**
     * returns object identity
     *@private
     *@type {string}
    */
    get [Symbol.toStringTag]() {
        return 'XML';
    }

    /**
     * the xml document
     *@type {XMLDocument}
    */
    get document() {
        return this._document;
    }

    /**
     * loads xml resource from the given url
     *@param {string} url - xml resource url location
     *@returns {Promise}
    */
    load(url) {
        let xmlDoc = this.document;
        /* istanbul ignore if */
        if (xmlStates.ieString)
            return new Promise((resolve, reject) => {
                xmlDoc.onreadystatechange = Util.generateCallback(
                    handleIEReadyStateChangeEvent, xmlDoc, [resolve, reject]
                );
                xmlDoc.load(url);
            });
        else
            return new Promise((resolve, reject) => {
                xmlDoc.load(url).then(xmlDoc => {
                    resolve(xmlDoc);
                })
                    .catch(xmlDoc => {
                        reject(xmlDoc);
                    });
            });
    }

    /**
     * loads xml string into the document
     *@param {string} xmlString - the xml string
     *@returns {Promise}
    */
    loadXML(xmlString) {
        xmlString = xmlString.toString().trim();
        let xmlDoc = this.document;
        return new Promise((resolve, reject) => {
            xmlDoc.loadXML(xmlString);

            if (xmlDoc.parseError.errorCode === 0)
                resolve(xmlDoc);
            else
                reject(xmlDoc);
        });
    }
}