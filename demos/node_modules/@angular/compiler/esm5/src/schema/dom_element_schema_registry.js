/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SecurityContext } from '../core';
import { isNgContainer, isNgContent } from '../ml_parser/tags';
import { dashCaseToCamelCase } from '../util';
import { SECURITY_SCHEMA } from './dom_security_schema';
import { ElementSchemaRegistry } from './element_schema_registry';
var BOOLEAN = 'boolean';
var NUMBER = 'number';
var STRING = 'string';
var OBJECT = 'object';
/**
 * This array represents the DOM schema. It encodes inheritance, properties, and events.
 *
 * ## Overview
 *
 * Each line represents one kind of element. The `element_inheritance` and properties are joined
 * using `element_inheritance|properties` syntax.
 *
 * ## Element Inheritance
 *
 * The `element_inheritance` can be further subdivided as `element1,element2,...^parentElement`.
 * Here the individual elements are separated by `,` (commas). Every element in the list
 * has identical properties.
 *
 * An `element` may inherit additional properties from `parentElement` If no `^parentElement` is
 * specified then `""` (blank) element is assumed.
 *
 * NOTE: The blank element inherits from root `[Element]` element, the super element of all
 * elements.
 *
 * NOTE an element prefix such as `:svg:` has no special meaning to the schema.
 *
 * ## Properties
 *
 * Each element has a set of properties separated by `,` (commas). Each property can be prefixed
 * by a special character designating its type:
 *
 * - (no prefix): property is a string.
 * - `*`: property represents an event.
 * - `!`: property is a boolean.
 * - `#`: property is a number.
 * - `%`: property is an object.
 *
 * ## Query
 *
 * The class creates an internal squas representation which allows to easily answer the query of
 * if a given property exist on a given element.
 *
 * NOTE: We don't yet support querying for types or events.
 * NOTE: This schema is auto extracted from `schema_extractor.ts` located in the test folder,
 *       see dom_element_schema_registry_spec.ts
 */
// =================================================================================================
// =================================================================================================
// =========== S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P  ===========
// =================================================================================================
// =================================================================================================
//
//                       DO NOT EDIT THIS DOM SCHEMA WITHOUT A SECURITY REVIEW!
//
// Newly added properties must be security reviewed and assigned an appropriate SecurityContext in
// dom_security_schema.ts. Reach out to mprobst & rjamet for details.
//
// =================================================================================================
var SCHEMA = [
    '[Element]|textContent,%classList,className,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*copy,*cut,*paste,*search,*selectstart,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerHTML,#scrollLeft,#scrollTop,slot' +
        /* added manually to avoid breaking changes */
        ',*message,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored',
    '[HTMLElement]^[Element]|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*auxclick,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,outerText,!spellcheck,%style,#tabIndex,title,!translate',
    'abbr,address,article,aside,b,bdi,bdo,cite,code,dd,dfn,dt,em,figcaption,figure,footer,header,i,kbd,main,mark,nav,noscript,rb,rp,rt,rtc,ruby,s,samp,section,small,strong,sub,sup,u,var,wbr^[HTMLElement]|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*auxclick,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,outerText,!spellcheck,%style,#tabIndex,title,!translate',
    'media^[HTMLElement]|!autoplay,!controls,%controlsList,%crossOrigin,#currentTime,!defaultMuted,#defaultPlaybackRate,!disableRemotePlayback,!loop,!muted,*encrypted,*waitingforkey,#playbackRate,preload,src,%srcObject,#volume',
    ':svg:^[HTMLElement]|*abort,*auxclick,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,%style,#tabIndex',
    ':svg:graphics^:svg:|',
    ':svg:animation^:svg:|*begin,*end,*repeat',
    ':svg:geometry^:svg:|',
    ':svg:componentTransferFunction^:svg:|',
    ':svg:gradient^:svg:|',
    ':svg:textContent^:svg:graphics|',
    ':svg:textPositioning^:svg:textContent|',
    'a^[HTMLElement]|charset,coords,download,hash,host,hostname,href,hreflang,name,password,pathname,ping,port,protocol,referrerPolicy,rel,rev,search,shape,target,text,type,username',
    'area^[HTMLElement]|alt,coords,download,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,referrerPolicy,rel,search,shape,target,username',
    'audio^media|',
    'br^[HTMLElement]|clear',
    'base^[HTMLElement]|href,target',
    'body^[HTMLElement]|aLink,background,bgColor,link,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink',
    'button^[HTMLElement]|!autofocus,!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value',
    'canvas^[HTMLElement]|#height,#width',
    'content^[HTMLElement]|select',
    'dl^[HTMLElement]|!compact',
    'datalist^[HTMLElement]|',
    'details^[HTMLElement]|!open',
    'dialog^[HTMLElement]|!open,returnValue',
    'dir^[HTMLElement]|!compact',
    'div^[HTMLElement]|align',
    'embed^[HTMLElement]|align,height,name,src,type,width',
    'fieldset^[HTMLElement]|!disabled,name',
    'font^[HTMLElement]|color,face,size',
    'form^[HTMLElement]|acceptCharset,action,autocomplete,encoding,enctype,method,name,!noValidate,target',
    'frame^[HTMLElement]|frameBorder,longDesc,marginHeight,marginWidth,name,!noResize,scrolling,src',
    'frameset^[HTMLElement]|cols,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows',
    'hr^[HTMLElement]|align,color,!noShade,size,width',
    'head^[HTMLElement]|',
    'h1,h2,h3,h4,h5,h6^[HTMLElement]|align',
    'html^[HTMLElement]|version',
    'iframe^[HTMLElement]|align,!allowFullscreen,frameBorder,height,longDesc,marginHeight,marginWidth,name,referrerPolicy,%sandbox,scrolling,src,srcdoc,width',
    'img^[HTMLElement]|align,alt,border,%crossOrigin,#height,#hspace,!isMap,longDesc,lowsrc,name,referrerPolicy,sizes,src,srcset,useMap,#vspace,#width',
    'input^[HTMLElement]|accept,align,alt,autocapitalize,autocomplete,!autofocus,!checked,!defaultChecked,defaultValue,dirName,!disabled,%files,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,%valueAsDate,#valueAsNumber,#width',
    'li^[HTMLElement]|type,#value',
    'label^[HTMLElement]|htmlFor',
    'legend^[HTMLElement]|align',
    'link^[HTMLElement]|as,charset,%crossOrigin,!disabled,href,hreflang,integrity,media,referrerPolicy,rel,%relList,rev,%sizes,target,type',
    'map^[HTMLElement]|name',
    'marquee^[HTMLElement]|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width',
    'menu^[HTMLElement]|!compact',
    'meta^[HTMLElement]|content,httpEquiv,name,scheme',
    'meter^[HTMLElement]|#high,#low,#max,#min,#optimum,#value',
    'ins,del^[HTMLElement]|cite,dateTime',
    'ol^[HTMLElement]|!compact,!reversed,#start,type',
    'object^[HTMLElement]|align,archive,border,code,codeBase,codeType,data,!declare,height,#hspace,name,standby,type,useMap,#vspace,width',
    'optgroup^[HTMLElement]|!disabled,label',
    'option^[HTMLElement]|!defaultSelected,!disabled,label,!selected,text,value',
    'output^[HTMLElement]|defaultValue,%htmlFor,name,value',
    'p^[HTMLElement]|align',
    'param^[HTMLElement]|name,type,value,valueType',
    'picture^[HTMLElement]|',
    'pre^[HTMLElement]|#width',
    'progress^[HTMLElement]|#max,#value',
    'q,blockquote,cite^[HTMLElement]|',
    'script^[HTMLElement]|!async,charset,%crossOrigin,!defer,event,htmlFor,integrity,src,text,type',
    'select^[HTMLElement]|!autofocus,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value',
    'shadow^[HTMLElement]|',
    'slot^[HTMLElement]|name',
    'source^[HTMLElement]|media,sizes,src,srcset,type',
    'span^[HTMLElement]|',
    'style^[HTMLElement]|!disabled,media,type',
    'caption^[HTMLElement]|align',
    'th,td^[HTMLElement]|abbr,align,axis,bgColor,ch,chOff,#colSpan,headers,height,!noWrap,#rowSpan,scope,vAlign,width',
    'col,colgroup^[HTMLElement]|align,ch,chOff,#span,vAlign,width',
    'table^[HTMLElement]|align,bgColor,border,%caption,cellPadding,cellSpacing,frame,rules,summary,%tFoot,%tHead,width',
    'tr^[HTMLElement]|align,bgColor,ch,chOff,vAlign',
    'tfoot,thead,tbody^[HTMLElement]|align,ch,chOff,vAlign',
    'template^[HTMLElement]|',
    'textarea^[HTMLElement]|autocapitalize,!autofocus,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap',
    'title^[HTMLElement]|text',
    'track^[HTMLElement]|!default,kind,label,src,srclang',
    'ul^[HTMLElement]|!compact,type',
    'unknown^[HTMLElement]|',
    'video^media|#height,poster,#width',
    ':svg:a^:svg:graphics|',
    ':svg:animate^:svg:animation|',
    ':svg:animateMotion^:svg:animation|',
    ':svg:animateTransform^:svg:animation|',
    ':svg:circle^:svg:geometry|',
    ':svg:clipPath^:svg:graphics|',
    ':svg:defs^:svg:graphics|',
    ':svg:desc^:svg:|',
    ':svg:discard^:svg:|',
    ':svg:ellipse^:svg:geometry|',
    ':svg:feBlend^:svg:|',
    ':svg:feColorMatrix^:svg:|',
    ':svg:feComponentTransfer^:svg:|',
    ':svg:feComposite^:svg:|',
    ':svg:feConvolveMatrix^:svg:|',
    ':svg:feDiffuseLighting^:svg:|',
    ':svg:feDisplacementMap^:svg:|',
    ':svg:feDistantLight^:svg:|',
    ':svg:feDropShadow^:svg:|',
    ':svg:feFlood^:svg:|',
    ':svg:feFuncA^:svg:componentTransferFunction|',
    ':svg:feFuncB^:svg:componentTransferFunction|',
    ':svg:feFuncG^:svg:componentTransferFunction|',
    ':svg:feFuncR^:svg:componentTransferFunction|',
    ':svg:feGaussianBlur^:svg:|',
    ':svg:feImage^:svg:|',
    ':svg:feMerge^:svg:|',
    ':svg:feMergeNode^:svg:|',
    ':svg:feMorphology^:svg:|',
    ':svg:feOffset^:svg:|',
    ':svg:fePointLight^:svg:|',
    ':svg:feSpecularLighting^:svg:|',
    ':svg:feSpotLight^:svg:|',
    ':svg:feTile^:svg:|',
    ':svg:feTurbulence^:svg:|',
    ':svg:filter^:svg:|',
    ':svg:foreignObject^:svg:graphics|',
    ':svg:g^:svg:graphics|',
    ':svg:image^:svg:graphics|',
    ':svg:line^:svg:geometry|',
    ':svg:linearGradient^:svg:gradient|',
    ':svg:mpath^:svg:|',
    ':svg:marker^:svg:|',
    ':svg:mask^:svg:|',
    ':svg:metadata^:svg:|',
    ':svg:path^:svg:geometry|',
    ':svg:pattern^:svg:|',
    ':svg:polygon^:svg:geometry|',
    ':svg:polyline^:svg:geometry|',
    ':svg:radialGradient^:svg:gradient|',
    ':svg:rect^:svg:geometry|',
    ':svg:svg^:svg:graphics|#currentScale,#zoomAndPan',
    ':svg:script^:svg:|type',
    ':svg:set^:svg:animation|',
    ':svg:stop^:svg:|',
    ':svg:style^:svg:|!disabled,media,title,type',
    ':svg:switch^:svg:graphics|',
    ':svg:symbol^:svg:|',
    ':svg:tspan^:svg:textPositioning|',
    ':svg:text^:svg:textPositioning|',
    ':svg:textPath^:svg:textContent|',
    ':svg:title^:svg:|',
    ':svg:use^:svg:graphics|',
    ':svg:view^:svg:|#zoomAndPan',
    'data^[HTMLElement]|value',
    'keygen^[HTMLElement]|!autofocus,challenge,!disabled,form,keytype,name',
    'menuitem^[HTMLElement]|type,label,icon,!disabled,!checked,radiogroup,!default',
    'summary^[HTMLElement]|',
    'time^[HTMLElement]|dateTime',
    ':svg:cursor^:svg:|',
];
var _ATTR_TO_PROP = {
    'class': 'className',
    'for': 'htmlFor',
    'formaction': 'formAction',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
};
var DomElementSchemaRegistry = /** @class */ (function (_super) {
    tslib_1.__extends(DomElementSchemaRegistry, _super);
    function DomElementSchemaRegistry() {
        var _this = _super.call(this) || this;
        _this._schema = {};
        SCHEMA.forEach(function (encodedType) {
            var type = {};
            var _a = tslib_1.__read(encodedType.split('|'), 2), strType = _a[0], strProperties = _a[1];
            var properties = strProperties.split(',');
            var _b = tslib_1.__read(strType.split('^'), 2), typeNames = _b[0], superName = _b[1];
            typeNames.split(',').forEach(function (tag) { return _this._schema[tag.toLowerCase()] = type; });
            var superType = superName && _this._schema[superName.toLowerCase()];
            if (superType) {
                Object.keys(superType).forEach(function (prop) { type[prop] = superType[prop]; });
            }
            properties.forEach(function (property) {
                if (property.length > 0) {
                    switch (property[0]) {
                        case '*':
                            // We don't yet support events.
                            // If ever allowing to bind to events, GO THROUGH A SECURITY REVIEW, allowing events
                            // will
                            // almost certainly introduce bad XSS vulnerabilities.
                            // type[property.substring(1)] = EVENT;
                            break;
                        case '!':
                            type[property.substring(1)] = BOOLEAN;
                            break;
                        case '#':
                            type[property.substring(1)] = NUMBER;
                            break;
                        case '%':
                            type[property.substring(1)] = OBJECT;
                            break;
                        default:
                            type[property] = STRING;
                    }
                }
            });
        });
        return _this;
    }
    DomElementSchemaRegistry.prototype.hasProperty = function (tagName, propName, schemaMetas) {
        if (schemaMetas.some(function (schema) { return schema.name === NO_ERRORS_SCHEMA.name; })) {
            return true;
        }
        if (tagName.indexOf('-') > -1) {
            if (isNgContainer(tagName) || isNgContent(tagName)) {
                return false;
            }
            if (schemaMetas.some(function (schema) { return schema.name === CUSTOM_ELEMENTS_SCHEMA.name; })) {
                // Can't tell now as we don't know which properties a custom element will get
                // once it is instantiated
                return true;
            }
        }
        var elementProperties = this._schema[tagName.toLowerCase()] || this._schema['unknown'];
        return !!elementProperties[propName];
    };
    DomElementSchemaRegistry.prototype.hasElement = function (tagName, schemaMetas) {
        if (schemaMetas.some(function (schema) { return schema.name === NO_ERRORS_SCHEMA.name; })) {
            return true;
        }
        if (tagName.indexOf('-') > -1) {
            if (isNgContainer(tagName) || isNgContent(tagName)) {
                return true;
            }
            if (schemaMetas.some(function (schema) { return schema.name === CUSTOM_ELEMENTS_SCHEMA.name; })) {
                // Allow any custom elements
                return true;
            }
        }
        return !!this._schema[tagName.toLowerCase()];
    };
    /**
     * securityContext returns the security context for the given property on the given DOM tag.
     *
     * Tag and property name are statically known and cannot change at runtime, i.e. it is not
     * possible to bind a value into a changing attribute or tag name.
     *
     * The filtering is white list based. All attributes in the schema above are assumed to have the
     * 'NONE' security context, i.e. that they are safe inert string values. Only specific well known
     * attack vectors are assigned their appropriate context.
     */
    DomElementSchemaRegistry.prototype.securityContext = function (tagName, propName, isAttribute) {
        if (isAttribute) {
            // NB: For security purposes, use the mapped property name, not the attribute name.
            propName = this.getMappedPropName(propName);
        }
        // Make sure comparisons are case insensitive, so that case differences between attribute and
        // property names do not have a security impact.
        tagName = tagName.toLowerCase();
        propName = propName.toLowerCase();
        var ctx = SECURITY_SCHEMA[tagName + '|' + propName];
        if (ctx) {
            return ctx;
        }
        ctx = SECURITY_SCHEMA['*|' + propName];
        return ctx ? ctx : SecurityContext.NONE;
    };
    DomElementSchemaRegistry.prototype.getMappedPropName = function (propName) { return _ATTR_TO_PROP[propName] || propName; };
    DomElementSchemaRegistry.prototype.getDefaultComponentElementName = function () { return 'ng-component'; };
    DomElementSchemaRegistry.prototype.validateProperty = function (name) {
        if (name.toLowerCase().startsWith('on')) {
            var msg = "Binding to event property '" + name + "' is disallowed for security reasons, " +
                ("please use (" + name.slice(2) + ")=...") +
                ("\nIf '" + name + "' is a directive input, make sure the directive is imported by the") +
                " current module.";
            return { error: true, msg: msg };
        }
        else {
            return { error: false };
        }
    };
    DomElementSchemaRegistry.prototype.validateAttribute = function (name) {
        if (name.toLowerCase().startsWith('on')) {
            var msg = "Binding to event attribute '" + name + "' is disallowed for security reasons, " +
                ("please use (" + name.slice(2) + ")=...");
            return { error: true, msg: msg };
        }
        else {
            return { error: false };
        }
    };
    DomElementSchemaRegistry.prototype.allKnownElementNames = function () { return Object.keys(this._schema); };
    DomElementSchemaRegistry.prototype.normalizeAnimationStyleProperty = function (propName) {
        return dashCaseToCamelCase(propName);
    };
    DomElementSchemaRegistry.prototype.normalizeAnimationStyleValue = function (camelCaseProp, userProvidedProp, val) {
        var unit = '';
        var strVal = val.toString().trim();
        var errorMsg = null;
        if (_isPixelDimensionStyle(camelCaseProp) && val !== 0 && val !== '0') {
            if (typeof val === 'number') {
                unit = 'px';
            }
            else {
                var valAndSuffixMatch = val.match(/^[+-]?[\d\.]+([a-z]*)$/);
                if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
                    errorMsg = "Please provide a CSS unit value for " + userProvidedProp + ":" + val;
                }
            }
        }
        return { error: errorMsg, value: strVal + unit };
    };
    return DomElementSchemaRegistry;
}(ElementSchemaRegistry));
export { DomElementSchemaRegistry };
function _isPixelDimensionStyle(prop) {
    switch (prop) {
        case 'width':
        case 'height':
        case 'minWidth':
        case 'minHeight':
        case 'maxWidth':
        case 'maxHeight':
        case 'left':
        case 'top':
        case 'bottom':
        case 'right':
        case 'fontSize':
        case 'outlineWidth':
        case 'outlineOffset':
        case 'paddingTop':
        case 'paddingLeft':
        case 'paddingBottom':
        case 'paddingRight':
        case 'marginTop':
        case 'marginLeft':
        case 'marginBottom':
        case 'marginRight':
        case 'borderRadius':
        case 'borderWidth':
        case 'borderTopWidth':
        case 'borderLeftWidth':
        case 'borderRightWidth':
        case 'borderBottomWidth':
        case 'textIndent':
            return true;
        default:
            return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxzQkFBc0IsRUFBRSxnQkFBZ0IsRUFBa0IsZUFBZSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRWxHLE9BQU8sRUFBQyxhQUFhLEVBQUUsV0FBVyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0QsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRTVDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN0RCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUVoRSxJQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFDMUIsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3hCLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUN4QixJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFFeEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeUNHO0FBRUgsb0dBQW9HO0FBQ3BHLG9HQUFvRztBQUNwRyxvR0FBb0c7QUFDcEcsb0dBQW9HO0FBQ3BHLG9HQUFvRztBQUNwRyxFQUFFO0FBQ0YsK0VBQStFO0FBQy9FLEVBQUU7QUFDRixrR0FBa0c7QUFDbEcscUVBQXFFO0FBQ3JFLEVBQUU7QUFDRixvR0FBb0c7QUFFcEcsSUFBTSxNQUFNLEdBQWE7SUFDdkIsZ09BQWdPO1FBQzVOLDhDQUE4QztRQUM5QyxrS0FBa0s7SUFDdEsscTFCQUFxMUI7SUFDcjFCLG9nQ0FBb2dDO0lBQ3BnQywrTkFBK047SUFDL04sMHVCQUEw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eXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NVU1RPTV9FTEVNRU5UU19TQ0hFTUEsIE5PX0VSUk9SU19TQ0hFTUEsIFNjaGVtYU1ldGFkYXRhLCBTZWN1cml0eUNvbnRleHR9IGZyb20gJy4uL2NvcmUnO1xuXG5pbXBvcnQge2lzTmdDb250YWluZXIsIGlzTmdDb250ZW50fSBmcm9tICcuLi9tbF9wYXJzZXIvdGFncyc7XG5pbXBvcnQge2Rhc2hDYXNlVG9DYW1lbENhc2V9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge1NFQ1VSSVRZX1NDSEVNQX0gZnJvbSAnLi9kb21fc2VjdXJpdHlfc2NoZW1hJztcbmltcG9ydCB7RWxlbWVudFNjaGVtYVJlZ2lzdHJ5fSBmcm9tICcuL2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcblxuY29uc3QgQk9PTEVBTiA9ICdib29sZWFuJztcbmNvbnN0IE5VTUJFUiA9ICdudW1iZXInO1xuY29uc3QgU1RSSU5HID0gJ3N0cmluZyc7XG5jb25zdCBPQkpFQ1QgPSAnb2JqZWN0JztcblxuLyoqXG4gKiBUaGlzIGFycmF5IHJlcHJlc2VudHMgdGhlIERPTSBzY2hlbWEuIEl0IGVuY29kZXMgaW5oZXJpdGFuY2UsIHByb3BlcnRpZXMsIGFuZCBldmVudHMuXG4gKlxuICogIyMgT3ZlcnZpZXdcbiAqXG4gKiBFYWNoIGxpbmUgcmVwcmVzZW50cyBvbmUga2luZCBvZiBlbGVtZW50LiBUaGUgYGVsZW1lbnRfaW5oZXJpdGFuY2VgIGFuZCBwcm9wZXJ0aWVzIGFyZSBqb2luZWRcbiAqIHVzaW5nIGBlbGVtZW50X2luaGVyaXRhbmNlfHByb3BlcnRpZXNgIHN5bnRheC5cbiAqXG4gKiAjIyBFbGVtZW50IEluaGVyaXRhbmNlXG4gKlxuICogVGhlIGBlbGVtZW50X2luaGVyaXRhbmNlYCBjYW4gYmUgZnVydGhlciBzdWJkaXZpZGVkIGFzIGBlbGVtZW50MSxlbGVtZW50MiwuLi5ecGFyZW50RWxlbWVudGAuXG4gKiBIZXJlIHRoZSBpbmRpdmlkdWFsIGVsZW1lbnRzIGFyZSBzZXBhcmF0ZWQgYnkgYCxgIChjb21tYXMpLiBFdmVyeSBlbGVtZW50IGluIHRoZSBsaXN0XG4gKiBoYXMgaWRlbnRpY2FsIHByb3BlcnRpZXMuXG4gKlxuICogQW4gYGVsZW1lbnRgIG1heSBpbmhlcml0IGFkZGl0aW9uYWwgcHJvcGVydGllcyBmcm9tIGBwYXJlbnRFbGVtZW50YCBJZiBubyBgXnBhcmVudEVsZW1lbnRgIGlzXG4gKiBzcGVjaWZpZWQgdGhlbiBgXCJcImAgKGJsYW5rKSBlbGVtZW50IGlzIGFzc3VtZWQuXG4gKlxuICogTk9URTogVGhlIGJsYW5rIGVsZW1lbnQgaW5oZXJpdHMgZnJvbSByb290IGBbRWxlbWVudF1gIGVsZW1lbnQsIHRoZSBzdXBlciBlbGVtZW50IG9mIGFsbFxuICogZWxlbWVudHMuXG4gKlxuICogTk9URSBhbiBlbGVtZW50IHByZWZpeCBzdWNoIGFzIGA6c3ZnOmAgaGFzIG5vIHNwZWNpYWwgbWVhbmluZyB0byB0aGUgc2NoZW1hLlxuICpcbiAqICMjIFByb3BlcnRpZXNcbiAqXG4gKiBFYWNoIGVsZW1lbnQgaGFzIGEgc2V0IG9mIHByb3BlcnRpZXMgc2VwYXJhdGVkIGJ5IGAsYCAoY29tbWFzKS4gRWFjaCBwcm9wZXJ0eSBjYW4gYmUgcHJlZml4ZWRcbiAqIGJ5IGEgc3BlY2lhbCBjaGFyYWN0ZXIgZGVzaWduYXRpbmcgaXRzIHR5cGU6XG4gKlxuICogLSAobm8gcHJlZml4KTogcHJvcGVydHkgaXMgYSBzdHJpbmcuXG4gKiAtIGAqYDogcHJvcGVydHkgcmVwcmVzZW50cyBhbiBldmVudC5cbiAqIC0gYCFgOiBwcm9wZXJ0eSBpcyBhIGJvb2xlYW4uXG4gKiAtIGAjYDogcHJvcGVydHkgaXMgYSBudW1iZXIuXG4gKiAtIGAlYDogcHJvcGVydHkgaXMgYW4gb2JqZWN0LlxuICpcbiAqICMjIFF1ZXJ5XG4gKlxuICogVGhlIGNsYXNzIGNyZWF0ZXMgYW4gaW50ZXJuYWwgc3F1YXMgcmVwcmVzZW50YXRpb24gd2hpY2ggYWxsb3dzIHRvIGVhc2lseSBhbnN3ZXIgdGhlIHF1ZXJ5IG9mXG4gKiBpZiBhIGdpdmVuIHByb3BlcnR5IGV4aXN0IG9uIGEgZ2l2ZW4gZWxlbWVudC5cbiAqXG4gKiBOT1RFOiBXZSBkb24ndCB5ZXQgc3VwcG9ydCBxdWVyeWluZyBmb3IgdHlwZXMgb3IgZXZlbnRzLlxuICogTk9URTogVGhpcyBzY2hlbWEgaXMgYXV0byBleHRyYWN0ZWQgZnJvbSBgc2NoZW1hX2V4dHJhY3Rvci50c2AgbG9jYXRlZCBpbiB0aGUgdGVzdCBmb2xkZXIsXG4gKiAgICAgICBzZWUgZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5X3NwZWMudHNcbiAqL1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyA9PT09PT09PT09PSBTIFQgTyBQICAgLSAgUyBUIE8gUCAgIC0gIFMgVCBPIFAgICAtICBTIFQgTyBQICAgLSAgUyBUIE8gUCAgIC0gIFMgVCBPIFAgID09PT09PT09PT09XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgICAgIERPIE5PVCBFRElUIFRISVMgRE9NIFNDSEVNQSBXSVRIT1VUIEEgU0VDVVJJVFkgUkVWSUVXIVxuLy9cbi8vIE5ld2x5IGFkZGVkIHByb3BlcnRpZXMgbXVzdCBiZSBzZWN1cml0eSByZXZpZXdlZCBhbmQgYXNzaWduZWQgYW4gYXBwcm9wcmlhdGUgU2VjdXJpdHlDb250ZXh0IGluXG4vLyBkb21fc2VjdXJpdHlfc2NoZW1hLnRzLiBSZWFjaCBvdXQgdG8gbXByb2JzdCAmIHJqYW1ldCBmb3IgZGV0YWlscy5cbi8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmNvbnN0IFNDSEVNQTogc3RyaW5nW10gPSBbXG4gICdbRWxlbWVudF18dGV4dENvbnRlbnQsJWNsYXNzTGlzdCxjbGFzc05hbWUsaWQsaW5uZXJIVE1MLCpiZWZvcmVjb3B5LCpiZWZvcmVjdXQsKmJlZm9yZXBhc3RlLCpjb3B5LCpjdXQsKnBhc3RlLCpzZWFyY2gsKnNlbGVjdHN0YXJ0LCp3ZWJraXRmdWxsc2NyZWVuY2hhbmdlLCp3ZWJraXRmdWxsc2NyZWVuZXJyb3IsKndoZWVsLG91dGVySFRNTCwjc2Nyb2xsTGVmdCwjc2Nyb2xsVG9wLHNsb3QnICtcbiAgICAgIC8qIGFkZGVkIG1hbnVhbGx5IHRvIGF2b2lkIGJyZWFraW5nIGNoYW5nZXMgKi9cbiAgICAgICcsKm1lc3NhZ2UsKm1vemZ1bGxzY3JlZW5jaGFuZ2UsKm1vemZ1bGxzY3JlZW5lcnJvciwqbW96cG9pbnRlcmxvY2tjaGFuZ2UsKm1venBvaW50ZXJsb2NrZXJyb3IsKndlYmdsY29udGV4dGNyZWF0aW9uZXJyb3IsKndlYmdsY29udGV4dGxvc3QsKndlYmdsY29udGV4dHJlc3RvcmVkJyxcbiAgJ1tIVE1MRWxlbWVudF1eW0VsZW1lbnRdfGFjY2Vzc0tleSxjb250ZW50RWRpdGFibGUsZGlyLCFkcmFnZ2FibGUsIWhpZGRlbixpbm5lclRleHQsbGFuZywqYWJvcnQsKmF1eGNsaWNrLCpibHVyLCpjYW5jZWwsKmNhbnBsYXksKmNhbnBsYXl0aHJvdWdoLCpjaGFuZ2UsKmNsaWNrLCpjbG9zZSwqY29udGV4dG1lbnUsKmN1ZWNoYW5nZSwqZGJsY2xpY2ssKmRyYWcsKmRyYWdlbmQsKmRyYWdlbnRlciwqZHJhZ2xlYXZlLCpkcmFnb3ZlciwqZHJhZ3N0YXJ0LCpkcm9wLCpkdXJhdGlvbmNoYW5nZSwqZW1wdGllZCwqZW5kZWQsKmVycm9yLCpmb2N1cywqZ290cG9pbnRlcmNhcHR1cmUsKmlucHV0LCppbnZhbGlkLCprZXlkb3duLCprZXlwcmVzcywqa2V5dXAsKmxvYWQsKmxvYWRlZGRhdGEsKmxvYWRlZG1ldGFkYXRhLCpsb2Fkc3RhcnQsKmxvc3Rwb2ludGVyY2FwdHVyZSwqbW91c2Vkb3duLCptb3VzZWVudGVyLCptb3VzZWxlYXZlLCptb3VzZW1vdmUsKm1vdXNlb3V0LCptb3VzZW92ZXIsKm1vdXNldXAsKm1vdXNld2hlZWwsKnBhdXNlLCpwbGF5LCpwbGF5aW5nLCpwb2ludGVyY2FuY2VsLCpwb2ludGVyZG93biwqcG9pbnRlcmVudGVyLCpwb2ludGVybGVhdmUsKnBvaW50ZXJtb3ZlLCpwb2ludGVyb3V0LCpwb2ludGVyb3ZlciwqcG9pbnRlcnVwLCpwcm9ncmVzcywqcmF0ZWNoYW5nZSwqcmVzZXQsKnJlc2l6ZSwqc2Nyb2xsLCpzZWVrZWQsKnNlZWtpbmcsKnNlbGVjdCwqc2hvdywqc3RhbGxlZCwqc3VibWl0LCpzdXNwZW5kLCp0aW1ldXBkYXRlLCp0b2dnbGUsKnZvbHVtZWNoYW5nZSwqd2FpdGluZyxvdXRlclRleHQsIXNwZWxsY2hlY2ssJXN0eWxlLCN0YWJJbmRleCx0aXRsZSwhdHJhbnNsYXRlJyxcbiAgJ2FiYnIsYWRkcmVzcyxhcnRpY2xlLGFzaWRlLGIsYmRpLGJkbyxjaXRlLGNvZGUsZGQsZGZuLGR0LGVtLGZpZ2NhcHRpb24sZmlndXJlLGZvb3RlcixoZWFkZXIsaSxrYmQsbWFpbixtYXJrLG5hdixub3NjcmlwdCxyYixycCxydCxydGMscnVieSxzLHNhbXAsc2VjdGlvbixzbWFsbCxzdHJvbmcsc3ViLHN1cCx1LHZhcix3YnJeW0hUTUxFbGVtZW50XXxhY2Nlc3NLZXksY29udGVudEVkaXRhYmxlLGRpciwhZHJhZ2dhYmxlLCFoaWRkZW4saW5uZXJUZXh0LGxhbmcsKmFib3J0LCphdXhjbGljaywqYmx1ciwqY2FuY2VsLCpjYW5wbGF5LCpjYW5wbGF5dGhyb3VnaCwqY2hhbmdlLCpjbGljaywqY2xvc2UsKmNvbnRleHRtZW51LCpjdWVjaGFuZ2UsKmRibGNsaWNrLCpkcmFnLCpkcmFnZW5kLCpkcmFnZW50ZXIsKmRyYWdsZWF2ZSwqZHJhZ292ZXIsKmRyYWdzdGFydCwqZHJvcCwqZHVyYXRpb25jaGFuZ2UsKmVtcHRpZWQsKmVuZGVkLCplcnJvciwqZm9jdXMsKmdvdHBvaW50ZXJjYXB0dXJlLCppbnB1dCwqaW52YWxpZCwqa2V5ZG93biwqa2V5cHJlc3MsKmtleXVwLCpsb2FkLCpsb2FkZWRkYXRhLCpsb2FkZWRtZXRhZGF0YSwqbG9hZHN0YXJ0LCpsb3N0cG9pbnRlcmNhcHR1cmUsKm1vdXNlZG93biwqbW91c2VlbnRlciwqbW91c2VsZWF2ZSwqbW91c2Vtb3ZlLCptb3VzZW91dCwqbW91c2VvdmVyLCptb3VzZXVwLCptb3VzZXdoZWVsLCpwYXVzZSwqcGxheSwqcGxheWluZywqcG9pbnRlcmNhbmNlbCwqcG9pbnRlcmRvd24sKnBvaW50ZXJlbnRlciwqcG9pbnRlcmxlYXZlLCpwb2ludGVybW92ZSwqcG9pbnRlcm91dCwqcG9pbnRlcm92ZXIsKnBvaW50ZXJ1cCwqcHJvZ3Jlc3MsKnJhdGVjaGFuZ2UsKnJlc2V0LCpyZXNpemUsKnNjcm9sbCwqc2Vla2VkLCpzZWVraW5nLCpzZWxlY3QsKnNob3csKnN0YWxsZWQsKnN1Ym1pdCwqc3VzcGVuZCwqdGltZXVwZGF0ZSwqdG9nZ2xlLCp2b2x1bWVjaGFuZ2UsKndhaXRpbmcsb3V0ZXJUZXh0LCFzcGVsbGNoZWNrLCVzdHlsZSwjdGFiSW5kZXgsdGl0bGUsIXRyYW5zbGF0ZScsXG4gICdtZWRpYV5bSFRNTEVsZW1lbnRdfCFhdXRvcGxheSwhY29udHJvbHMsJWNvbnRyb2xzTGlzdCwlY3Jvc3NPcmlnaW4sI2N1cnJlbnRUaW1lLCFkZWZhdWx0TXV0ZWQsI2RlZmF1bHRQbGF5YmFja1JhdGUsIWRpc2FibGVSZW1vdGVQbGF5YmFjaywhbG9vcCwhbXV0ZWQsKmVuY3J5cHRlZCwqd2FpdGluZ2ZvcmtleSwjcGxheWJhY2tSYXRlLHByZWxvYWQsc3JjLCVzcmNPYmplY3QsI3ZvbHVtZScsXG4gICc6c3ZnOl5bSFRNTEVsZW1lbnRdfCphYm9ydCwqYXV4Y2xpY2ssKmJsdXIsKmNhbmNlbCwqY2FucGxheSwqY2FucGxheXRocm91Z2gsKmNoYW5nZSwqY2xpY2ssKmNsb3NlLCpjb250ZXh0bWVudSwqY3VlY2hhbmdlLCpkYmxjbGljaywqZHJhZywqZHJhZ2VuZCwqZHJhZ2VudGVyLCpkcmFnbGVhdmUsKmRyYWdvdmVyLCpkcmFnc3RhcnQsKmRyb3AsKmR1cmF0aW9uY2hhbmdlLCplbXB0aWVkLCplbmRlZCwqZXJyb3IsKmZvY3VzLCpnb3Rwb2ludGVyY2FwdHVyZSwqaW5wdXQsKmludmFsaWQsKmtleWRvd24sKmtleXByZXNzLCprZXl1cCwqbG9hZCwqbG9hZGVkZGF0YSwqbG9hZGVkbWV0YWRhdGEsKmxvYWRzdGFydCwqbG9zdHBvaW50ZXJjYXB0dXJlLCptb3VzZWRvd24sKm1vdXNlZW50ZXIsKm1vdXNlbGVhdmUsKm1vdXNlbW92ZSwqbW91c2VvdXQsKm1vdXNlb3ZlciwqbW91c2V1cCwqbW91c2V3aGVlbCwqcGF1c2UsKnBsYXksKnBsYXlpbmcsKnBvaW50ZXJjYW5jZWwsKnBvaW50ZXJkb3duLCpwb2ludGVyZW50ZXIsKnBvaW50ZXJsZWF2ZSwqcG9pbnRlcm1vdmUsKnBvaW50ZXJvdXQsKnBvaW50ZXJvdmVyLCpwb2ludGVydXAsKnByb2dyZXNzLCpyYXRlY2hhbmdlLCpyZXNldCwqcmVzaXplLCpzY3JvbGwsKnNlZWtlZCwqc2Vla2luZywqc2VsZWN0LCpzaG93LCpzdGFsbGVkLCpzdWJtaXQsKnN1c3BlbmQsKnRpbWV1cGRhdGUsKnRvZ2dsZSwqdm9sdW1lY2hhbmdlLCp3YWl0aW5nLCVzdHlsZSwjdGFiSW5kZXgnLFxuICAnOnN2ZzpncmFwaGljc146c3ZnOnwnLFxuICAnOnN2ZzphbmltYXRpb25eOnN2Zzp8KmJlZ2luLCplbmQsKnJlcGVhdCcsXG4gICc6c3ZnOmdlb21ldHJ5Xjpzdmc6fCcsXG4gICc6c3ZnOmNvbXBvbmVudFRyYW5zZmVyRnVuY3Rpb25eOnN2Zzp8JyxcbiAgJzpzdmc6Z3JhZGllbnReOnN2Zzp8JyxcbiAgJzpzdmc6dGV4dENvbnRlbnReOnN2ZzpncmFwaGljc3wnLFxuICAnOnN2Zzp0ZXh0UG9zaXRpb25pbmdeOnN2Zzp0ZXh0Q29udGVudHwnLFxuICAnYV5bSFRNTEVsZW1lbnRdfGNoYXJzZXQsY29vcmRzLGRvd25sb2FkLGhhc2gsaG9zdCxob3N0bmFtZSxocmVmLGhyZWZsYW5nLG5hbWUscGFzc3dvcmQscGF0aG5hbWUscGluZyxwb3J0LHByb3RvY29sLHJlZmVycmVyUG9saWN5LHJlbCxyZXYsc2VhcmNoLHNoYXBlLHRhcmdldCx0ZXh0LHR5cGUsdXNlcm5hbWUnLFxuICAnYXJlYV5bSFRNTEVsZW1lbnRdfGFsdCxjb29yZHMsZG93bmxvYWQsaGFzaCxob3N0LGhvc3RuYW1lLGhyZWYsIW5vSHJlZixwYXNzd29yZCxwYXRobmFtZSxwaW5nLHBvcnQscHJvdG9jb2wscmVmZXJyZXJQb2xpY3kscmVsLHNlYXJjaCxzaGFwZSx0YXJnZXQsdXNlcm5hbWUnLFxuICAnYXVkaW9ebWVkaWF8JyxcbiAgJ2JyXltIVE1MRWxlbWVudF18Y2xlYXInLFxuICAnYmFzZV5bSFRNTEVsZW1lbnRdfGhyZWYsdGFyZ2V0JyxcbiAgJ2JvZHleW0hUTUxFbGVtZW50XXxhTGluayxiYWNrZ3JvdW5kLGJnQ29sb3IsbGluaywqYmVmb3JldW5sb2FkLCpibHVyLCplcnJvciwqZm9jdXMsKmhhc2hjaGFuZ2UsKmxhbmd1YWdlY2hhbmdlLCpsb2FkLCptZXNzYWdlLCpvZmZsaW5lLCpvbmxpbmUsKnBhZ2VoaWRlLCpwYWdlc2hvdywqcG9wc3RhdGUsKnJlamVjdGlvbmhhbmRsZWQsKnJlc2l6ZSwqc2Nyb2xsLCpzdG9yYWdlLCp1bmhhbmRsZWRyZWplY3Rpb24sKnVubG9hZCx0ZXh0LHZMaW5rJyxcbiAgJ2J1dHRvbl5bSFRNTEVsZW1lbnRdfCFhdXRvZm9jdXMsIWRpc2FibGVkLGZvcm1BY3Rpb24sZm9ybUVuY3R5cGUsZm9ybU1ldGhvZCwhZm9ybU5vVmFsaWRhdGUsZm9ybVRhcmdldCxuYW1lLHR5cGUsdmFsdWUnLFxuICAnY2FudmFzXltIVE1MRWxlbWVudF18I2hlaWdodCwjd2lkdGgnLFxuICAnY29udGVudF5bSFRNTEVsZW1lbnRdfHNlbGVjdCcsXG4gICdkbF5bSFRNTEVsZW1lbnRdfCFjb21wYWN0JyxcbiAgJ2RhdGFsaXN0XltIVE1MRWxlbWVudF18JyxcbiAgJ2RldGFpbHNeW0hUTUxFbGVtZW50XXwhb3BlbicsXG4gICdkaWFsb2deW0hUTUxFbGVtZW50XXwhb3BlbixyZXR1cm5WYWx1ZScsXG4gICdkaXJeW0hUTUxFbGVtZW50XXwhY29tcGFjdCcsXG4gICdkaXZeW0hUTUxFbGVtZW50XXxhbGlnbicsXG4gICdlbWJlZF5bSFRNTEVsZW1lbnRdfGFsaWduLGhlaWdodCxuYW1lLHNyYyx0eXBlLHdpZHRoJyxcbiAgJ2ZpZWxkc2V0XltIVE1MRWxlbWVudF18IWRpc2FibGVkLG5hbWUnLFxuICAnZm9udF5bSFRNTEVsZW1lbnRdfGNvbG9yLGZhY2Usc2l6ZScsXG4gICdmb3JtXltIVE1MRWxlbWVudF18YWNjZXB0Q2hhcnNldCxhY3Rpb24sYXV0b2NvbXBsZXRlLGVuY29kaW5nLGVuY3R5cGUsbWV0aG9kLG5hbWUsIW5vVmFsaWRhdGUsdGFyZ2V0JyxcbiAgJ2ZyYW1lXltIVE1MRWxlbWVudF18ZnJhbWVCb3JkZXIsbG9uZ0Rlc2MsbWFyZ2luSGVpZ2h0LG1hcmdpbldpZHRoLG5hbWUsIW5vUmVzaXplLHNjcm9sbGluZyxzcmMnLFxuICAnZnJhbWVzZXReW0hUTUxFbGVtZW50XXxjb2xzLCpiZWZvcmV1bmxvYWQsKmJsdXIsKmVycm9yLCpmb2N1cywqaGFzaGNoYW5nZSwqbGFuZ3VhZ2VjaGFuZ2UsKmxvYWQsKm1lc3NhZ2UsKm9mZmxpbmUsKm9ubGluZSwqcGFnZWhpZGUsKnBhZ2VzaG93LCpwb3BzdGF0ZSwqcmVqZWN0aW9uaGFuZGxlZCwqcmVzaXplLCpzY3JvbGwsKnN0b3JhZ2UsKnVuaGFuZGxlZHJlamVjdGlvbiwqdW5sb2FkLHJvd3MnLFxuICAnaHJeW0hUTUxFbGVtZW50XXxhbGlnbixjb2xvciwhbm9TaGFkZSxzaXplLHdpZHRoJyxcbiAgJ2hlYWReW0hUTUxFbGVtZW50XXwnLFxuICAnaDEsaDIsaDMsaDQsaDUsaDZeW0hUTUxFbGVtZW50XXxhbGlnbicsXG4gICdodG1sXltIVE1MRWxlbWVudF18dmVyc2lvbicsXG4gICdpZnJhbWVeW0hUTUxFbGVtZW50XXxhbGlnbiwhYWxsb3dGdWxsc2NyZWVuLGZyYW1lQm9yZGVyLGhlaWdodCxsb25nRGVzYyxtYXJnaW5IZWlnaHQsbWFyZ2luV2lkdGgsbmFtZSxyZWZlcnJlclBvbGljeSwlc2FuZGJveCxzY3JvbGxpbmcsc3JjLHNyY2RvYyx3aWR0aCcsXG4gICdpbWdeW0hUTUxFbGVtZW50XXxhbGlnbixhbHQsYm9yZGVyLCVjcm9zc09yaWdpbiwjaGVpZ2h0LCNoc3BhY2UsIWlzTWFwLGxvbmdEZXNjLGxvd3NyYyxuYW1lLHJlZmVycmVyUG9saWN5LHNpemVzLHNyYyxzcmNzZXQsdXNlTWFwLCN2c3BhY2UsI3dpZHRoJyxcbiAgJ2lucHV0XltIVE1MRWxlbWVudF18YWNjZXB0LGFsaWduLGFsdCxhdXRvY2FwaXRhbGl6ZSxhdXRvY29tcGxldGUsIWF1dG9mb2N1cywhY2hlY2tlZCwhZGVmYXVsdENoZWNrZWQsZGVmYXVsdFZhbHVlLGRpck5hbWUsIWRpc2FibGVkLCVmaWxlcyxmb3JtQWN0aW9uLGZvcm1FbmN0eXBlLGZvcm1NZXRob2QsIWZvcm1Ob1ZhbGlkYXRlLGZvcm1UYXJnZXQsI2hlaWdodCwhaW5jcmVtZW50YWwsIWluZGV0ZXJtaW5hdGUsbWF4LCNtYXhMZW5ndGgsbWluLCNtaW5MZW5ndGgsIW11bHRpcGxlLG5hbWUscGF0dGVybixwbGFjZWhvbGRlciwhcmVhZE9ubHksIXJlcXVpcmVkLHNlbGVjdGlvbkRpcmVjdGlvbiwjc2VsZWN0aW9uRW5kLCNzZWxlY3Rpb25TdGFydCwjc2l6ZSxzcmMsc3RlcCx0eXBlLHVzZU1hcCx2YWx1ZSwldmFsdWVBc0RhdGUsI3ZhbHVlQXNOdW1iZXIsI3dpZHRoJyxcbiAgJ2xpXltIVE1MRWxlbWVudF18dHlwZSwjdmFsdWUnLFxuICAnbGFiZWxeW0hUTUxFbGVtZW50XXxodG1sRm9yJyxcbiAgJ2xlZ2VuZF5bSFRNTEVsZW1lbnRdfGFsaWduJyxcbiAgJ2xpbmteW0hUTUxFbGVtZW50XXxhcyxjaGFyc2V0LCVjcm9zc09yaWdpbiwhZGlzYWJsZWQsaHJlZixocmVmbGFuZyxpbnRlZ3JpdHksbWVkaWEscmVmZXJyZXJQb2xpY3kscmVsLCVyZWxMaXN0LHJldiwlc2l6ZXMsdGFyZ2V0LHR5cGUnLFxuICAnbWFwXltIVE1MRWxlbWVudF18bmFtZScsXG4gICdtYXJxdWVlXltIVE1MRWxlbWVudF18YmVoYXZpb3IsYmdDb2xvcixkaXJlY3Rpb24saGVpZ2h0LCNoc3BhY2UsI2xvb3AsI3Njcm9sbEFtb3VudCwjc2Nyb2xsRGVsYXksIXRydWVTcGVlZCwjdnNwYWNlLHdpZHRoJyxcbiAgJ21lbnVeW0hUTUxFbGVtZW50XXwhY29tcGFjdCcsXG4gICdtZXRhXltIVE1MRWxlbWVudF18Y29udGVudCxodHRwRXF1aXYsbmFtZSxzY2hlbWUnLFxuICAnbWV0ZXJeW0hUTUxFbGVtZW50XXwjaGlnaCwjbG93LCNtYXgsI21pbiwjb3B0aW11bSwjdmFsdWUnLFxuICAnaW5zLGRlbF5bSFRNTEVsZW1lbnRdfGNpdGUsZGF0ZVRpbWUnLFxuICAnb2xeW0hUTUxFbGVtZW50XXwhY29tcGFjdCwhcmV2ZXJzZWQsI3N0YXJ0LHR5cGUnLFxuICAnb2JqZWN0XltIVE1MRWxlbWVudF18YWxpZ24sYXJjaGl2ZSxib3JkZXIsY29kZSxjb2RlQmFzZSxjb2RlVHlwZSxkYXRhLCFkZWNsYXJlLGhlaWdodCwjaHNwYWNlLG5hbWUsc3RhbmRieSx0eXBlLHVzZU1hcCwjdnNwYWNlLHdpZHRoJyxcbiAgJ29wdGdyb3VwXltIVE1MRWxlbWVudF18IWRpc2FibGVkLGxhYmVsJyxcbiAgJ29wdGlvbl5bSFRNTEVsZW1lbnRdfCFkZWZhdWx0U2VsZWN0ZWQsIWRpc2FibGVkLGxhYmVsLCFzZWxlY3RlZCx0ZXh0LHZhbHVlJyxcbiAgJ291dHB1dF5bSFRNTEVsZW1lbnRdfGRlZmF1bHRWYWx1ZSwlaHRtbEZvcixuYW1lLHZhbHVlJyxcbiAgJ3BeW0hUTUxFbGVtZW50XXxhbGlnbicsXG4gICdwYXJhbV5bSFRNTEVsZW1lbnRdfG5hbWUsdHlwZSx2YWx1ZSx2YWx1ZVR5cGUnLFxuICAncGljdHVyZV5bSFRNTEVsZW1lbnRdfCcsXG4gICdwcmVeW0hUTUxFbGVtZW50XXwjd2lkdGgnLFxuICAncHJvZ3Jlc3NeW0hUTUxFbGVtZW50XXwjbWF4LCN2YWx1ZScsXG4gICdxLGJsb2NrcXVvdGUsY2l0ZV5bSFRNTEVsZW1lbnRdfCcsXG4gICdzY3JpcHReW0hUTUxFbGVtZW50XXwhYXN5bmMsY2hhcnNldCwlY3Jvc3NPcmlnaW4sIWRlZmVyLGV2ZW50LGh0bWxGb3IsaW50ZWdyaXR5LHNyYyx0ZXh0LHR5cGUnLFxuICAnc2VsZWN0XltIVE1MRWxlbWVudF18IWF1dG9mb2N1cywhZGlzYWJsZWQsI2xlbmd0aCwhbXVsdGlwbGUsbmFtZSwhcmVxdWlyZWQsI3NlbGVjdGVkSW5kZXgsI3NpemUsdmFsdWUnLFxuICAnc2hhZG93XltIVE1MRWxlbWVudF18JyxcbiAgJ3Nsb3ReW0hUTUxFbGVtZW50XXxuYW1lJyxcbiAgJ3NvdXJjZV5bSFRNTEVsZW1lbnRdfG1lZGlhLHNpemVzLHNyYyxzcmNzZXQsdHlwZScsXG4gICdzcGFuXltIVE1MRWxlbWVudF18JyxcbiAgJ3N0eWxlXltIVE1MRWxlbWVudF18IWRpc2FibGVkLG1lZGlhLHR5cGUnLFxuICAnY2FwdGlvbl5bSFRNTEVsZW1lbnRdfGFsaWduJyxcbiAgJ3RoLHRkXltIVE1MRWxlbWVudF18YWJicixhbGlnbixheGlzLGJnQ29sb3IsY2gsY2hPZmYsI2NvbFNwYW4saGVhZGVycyxoZWlnaHQsIW5vV3JhcCwjcm93U3BhbixzY29wZSx2QWxpZ24sd2lkdGgnLFxuICAnY29sLGNvbGdyb3VwXltIVE1MRWxlbWVudF18YWxpZ24sY2gsY2hPZmYsI3NwYW4sdkFsaWduLHdpZHRoJyxcbiAgJ3RhYmxlXltIVE1MRWxlbWVudF18YWxpZ24sYmdDb2xvcixib3JkZXIsJWNhcHRpb24sY2VsbFBhZGRpbmcsY2VsbFNwYWNpbmcsZnJhbWUscnVsZXMsc3VtbWFyeSwldEZvb3QsJXRIZWFkLHdpZHRoJyxcbiAgJ3RyXltIVE1MRWxlbWVudF18YWxpZ24sYmdDb2xvcixjaCxjaE9mZix2QWxpZ24nLFxuICAndGZvb3QsdGhlYWQsdGJvZHleW0hUTUxFbGVtZW50XXxhbGlnbixjaCxjaE9mZix2QWxpZ24nLFxuICAndGVtcGxhdGVeW0hUTUxFbGVtZW50XXwnLFxuICAndGV4dGFyZWFeW0hUTUxFbGVtZW50XXxhdXRvY2FwaXRhbGl6ZSwhYXV0b2ZvY3VzLCNjb2xzLGRlZmF1bHRWYWx1ZSxkaXJOYW1lLCFkaXNhYmxlZCwjbWF4TGVuZ3RoLCNtaW5MZW5ndGgsbmFtZSxwbGFjZWhvbGRlciwhcmVhZE9ubHksIXJlcXVpcmVkLCNyb3dzLHNlbGVjdGlvbkRpcmVjdGlvbiwjc2VsZWN0aW9uRW5kLCNzZWxlY3Rpb25TdGFydCx2YWx1ZSx3cmFwJyxcbiAgJ3RpdGxlXltIVE1MRWxlbWVudF18dGV4dCcsXG4gICd0cmFja15bSFRNTEVsZW1lbnRdfCFkZWZhdWx0LGtpbmQsbGFiZWwsc3JjLHNyY2xhbmcnLFxuICAndWxeW0hUTUxFbGVtZW50XXwhY29tcGFjdCx0eXBlJyxcbiAgJ3Vua25vd25eW0hUTUxFbGVtZW50XXwnLFxuICAndmlkZW9ebWVkaWF8I2hlaWdodCxwb3N0ZXIsI3dpZHRoJyxcbiAgJzpzdmc6YV46c3ZnOmdyYXBoaWNzfCcsXG4gICc6c3ZnOmFuaW1hdGVeOnN2ZzphbmltYXRpb258JyxcbiAgJzpzdmc6YW5pbWF0ZU1vdGlvbl46c3ZnOmFuaW1hdGlvbnwnLFxuICAnOnN2ZzphbmltYXRlVHJhbnNmb3JtXjpzdmc6YW5pbWF0aW9ufCcsXG4gICc6c3ZnOmNpcmNsZV46c3ZnOmdlb21ldHJ5fCcsXG4gICc6c3ZnOmNsaXBQYXRoXjpzdmc6Z3JhcGhpY3N8JyxcbiAgJzpzdmc6ZGVmc146c3ZnOmdyYXBoaWNzfCcsXG4gICc6c3ZnOmRlc2NeOnN2Zzp8JyxcbiAgJzpzdmc6ZGlzY2FyZF46c3ZnOnwnLFxuICAnOnN2ZzplbGxpcHNlXjpzdmc6Z2VvbWV0cnl8JyxcbiAgJzpzdmc6ZmVCbGVuZF46c3ZnOnwnLFxuICAnOnN2ZzpmZUNvbG9yTWF0cml4Xjpzdmc6fCcsXG4gICc6c3ZnOmZlQ29tcG9uZW50VHJhbnNmZXJeOnN2Zzp8JyxcbiAgJzpzdmc6ZmVDb21wb3NpdGVeOnN2Zzp8JyxcbiAgJzpzdmc6ZmVDb252b2x2ZU1hdHJpeF46c3ZnOnwnLFxuICAnOnN2ZzpmZURpZmZ1c2VMaWdodGluZ146c3ZnOnwnLFxuICAnOnN2ZzpmZURpc3BsYWNlbWVudE1hcF46c3ZnOnwnLFxuICAnOnN2ZzpmZURpc3RhbnRMaWdodF46c3ZnOnwnLFxuICAnOnN2ZzpmZURyb3BTaGFkb3deOnN2Zzp8JyxcbiAgJzpzdmc6ZmVGbG9vZF46c3ZnOnwnLFxuICAnOnN2ZzpmZUZ1bmNBXjpzdmc6Y29tcG9uZW50VHJhbnNmZXJGdW5jdGlvbnwnLFxuICAnOnN2ZzpmZUZ1bmNCXjpzdmc6Y29tcG9uZW50VHJhbnNmZXJGdW5jdGlvbnwnLFxuICAnOnN2ZzpmZUZ1bmNHXjpzdmc6Y29tcG9uZW50VHJhbnNmZXJGdW5jdGlvbnwnLFxuICAnOnN2ZzpmZUZ1bmNSXjpzdmc6Y29tcG9uZW50VHJhbnNmZXJGdW5jdGlvbnwnLFxuICAnOnN2ZzpmZUdhdXNzaWFuQmx1cl46c3ZnOnwnLFxuICAnOnN2ZzpmZUltYWdlXjpzdmc6fCcsXG4gICc6c3ZnOmZlTWVyZ2VeOnN2Zzp8JyxcbiAgJzpzdmc6ZmVNZXJnZU5vZGVeOnN2Zzp8JyxcbiAgJzpzdmc6ZmVNb3JwaG9sb2d5Xjpzdmc6fCcsXG4gICc6c3ZnOmZlT2Zmc2V0Xjpzdmc6fCcsXG4gICc6c3ZnOmZlUG9pbnRMaWdodF46c3ZnOnwnLFxuICAnOnN2ZzpmZVNwZWN1bGFyTGlnaHRpbmdeOnN2Zzp8JyxcbiAgJzpzdmc6ZmVTcG90TGlnaHReOnN2Zzp8JyxcbiAgJzpzdmc6ZmVUaWxlXjpzdmc6fCcsXG4gICc6c3ZnOmZlVHVyYnVsZW5jZV46c3ZnOnwnLFxuICAnOnN2ZzpmaWx0ZXJeOnN2Zzp8JyxcbiAgJzpzdmc6Zm9yZWlnbk9iamVjdF46c3ZnOmdyYXBoaWNzfCcsXG4gICc6c3ZnOmdeOnN2ZzpncmFwaGljc3wnLFxuICAnOnN2ZzppbWFnZV46c3ZnOmdyYXBoaWNzfCcsXG4gICc6c3ZnOmxpbmVeOnN2ZzpnZW9tZXRyeXwnLFxuICAnOnN2ZzpsaW5lYXJHcmFkaWVudF46c3ZnOmdyYWRpZW50fCcsXG4gICc6c3ZnOm1wYXRoXjpzdmc6fCcsXG4gICc6c3ZnOm1hcmtlcl46c3ZnOnwnLFxuICAnOnN2ZzptYXNrXjpzdmc6fCcsXG4gICc6c3ZnOm1ldGFkYXRhXjpzdmc6fCcsXG4gICc6c3ZnOnBhdGheOnN2ZzpnZW9tZXRyeXwnLFxuICAnOnN2ZzpwYXR0ZXJuXjpzdmc6fCcsXG4gICc6c3ZnOnBvbHlnb25eOnN2ZzpnZW9tZXRyeXwnLFxuICAnOnN2Zzpwb2x5bGluZV46c3ZnOmdlb21ldHJ5fCcsXG4gICc6c3ZnOnJhZGlhbEdyYWRpZW50Xjpzdmc6Z3JhZGllbnR8JyxcbiAgJzpzdmc6cmVjdF46c3ZnOmdlb21ldHJ5fCcsXG4gICc6c3ZnOnN2Z146c3ZnOmdyYXBoaWNzfCNjdXJyZW50U2NhbGUsI3pvb21BbmRQYW4nLFxuICAnOnN2ZzpzY3JpcHReOnN2Zzp8dHlwZScsXG4gICc6c3ZnOnNldF46c3ZnOmFuaW1hdGlvbnwnLFxuICAnOnN2ZzpzdG9wXjpzdmc6fCcsXG4gICc6c3ZnOnN0eWxlXjpzdmc6fCFkaXNhYmxlZCxtZWRpYSx0aXRsZSx0eXBlJyxcbiAgJzpzdmc6c3dpdGNoXjpzdmc6Z3JhcGhpY3N8JyxcbiAgJzpzdmc6c3ltYm9sXjpzdmc6fCcsXG4gICc6c3ZnOnRzcGFuXjpzdmc6dGV4dFBvc2l0aW9uaW5nfCcsXG4gICc6c3ZnOnRleHReOnN2Zzp0ZXh0UG9zaXRpb25pbmd8JyxcbiAgJzpzdmc6dGV4dFBhdGheOnN2Zzp0ZXh0Q29udGVudHwnLFxuICAnOnN2Zzp0aXRsZV46c3ZnOnwnLFxuICAnOnN2Zzp1c2VeOnN2ZzpncmFwaGljc3wnLFxuICAnOnN2Zzp2aWV3Xjpzdmc6fCN6b29tQW5kUGFuJyxcbiAgJ2RhdGFeW0hUTUxFbGVtZW50XXx2YWx1ZScsXG4gICdrZXlnZW5eW0hUTUxFbGVtZW50XXwhYXV0b2ZvY3VzLGNoYWxsZW5nZSwhZGlzYWJsZWQsZm9ybSxrZXl0eXBlLG5hbWUnLFxuICAnbWVudWl0ZW1eW0hUTUxFbGVtZW50XXx0eXBlLGxhYmVsLGljb24sIWRpc2FibGVkLCFjaGVja2VkLHJhZGlvZ3JvdXAsIWRlZmF1bHQnLFxuICAnc3VtbWFyeV5bSFRNTEVsZW1lbnRdfCcsXG4gICd0aW1lXltIVE1MRWxlbWVudF18ZGF0ZVRpbWUnLFxuICAnOnN2ZzpjdXJzb3JeOnN2Zzp8Jyxcbl07XG5cbmNvbnN0IF9BVFRSX1RPX1BST1A6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgJ2NsYXNzJzogJ2NsYXNzTmFtZScsXG4gICdmb3InOiAnaHRtbEZvcicsXG4gICdmb3JtYWN0aW9uJzogJ2Zvcm1BY3Rpb24nLFxuICAnaW5uZXJIdG1sJzogJ2lubmVySFRNTCcsXG4gICdyZWFkb25seSc6ICdyZWFkT25seScsXG4gICd0YWJpbmRleCc6ICd0YWJJbmRleCcsXG59O1xuXG5leHBvcnQgY2xhc3MgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IGV4dGVuZHMgRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBfc2NoZW1hOiB7W2VsZW1lbnQ6IHN0cmluZ106IHtbcHJvcGVydHk6IHN0cmluZ106IHN0cmluZ319ID0ge307XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICBTQ0hFTUEuZm9yRWFjaChlbmNvZGVkVHlwZSA9PiB7XG4gICAgICBjb25zdCB0eXBlOiB7W3Byb3BlcnR5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgICBjb25zdCBbc3RyVHlwZSwgc3RyUHJvcGVydGllc10gPSBlbmNvZGVkVHlwZS5zcGxpdCgnfCcpO1xuICAgICAgY29uc3QgcHJvcGVydGllcyA9IHN0clByb3BlcnRpZXMuc3BsaXQoJywnKTtcbiAgICAgIGNvbnN0IFt0eXBlTmFtZXMsIHN1cGVyTmFtZV0gPSBzdHJUeXBlLnNwbGl0KCdeJyk7XG4gICAgICB0eXBlTmFtZXMuc3BsaXQoJywnKS5mb3JFYWNoKHRhZyA9PiB0aGlzLl9zY2hlbWFbdGFnLnRvTG93ZXJDYXNlKCldID0gdHlwZSk7XG4gICAgICBjb25zdCBzdXBlclR5cGUgPSBzdXBlck5hbWUgJiYgdGhpcy5fc2NoZW1hW3N1cGVyTmFtZS50b0xvd2VyQ2FzZSgpXTtcbiAgICAgIGlmIChzdXBlclR5cGUpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoc3VwZXJUeXBlKS5mb3JFYWNoKChwcm9wOiBzdHJpbmcpID0+IHsgdHlwZVtwcm9wXSA9IHN1cGVyVHlwZVtwcm9wXTsgfSk7XG4gICAgICB9XG4gICAgICBwcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnR5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKHByb3BlcnR5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBzd2l0Y2ggKHByb3BlcnR5WzBdKSB7XG4gICAgICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgICAgLy8gV2UgZG9uJ3QgeWV0IHN1cHBvcnQgZXZlbnRzLlxuICAgICAgICAgICAgICAvLyBJZiBldmVyIGFsbG93aW5nIHRvIGJpbmQgdG8gZXZlbnRzLCBHTyBUSFJPVUdIIEEgU0VDVVJJVFkgUkVWSUVXLCBhbGxvd2luZyBldmVudHNcbiAgICAgICAgICAgICAgLy8gd2lsbFxuICAgICAgICAgICAgICAvLyBhbG1vc3QgY2VydGFpbmx5IGludHJvZHVjZSBiYWQgWFNTIHZ1bG5lcmFiaWxpdGllcy5cbiAgICAgICAgICAgICAgLy8gdHlwZVtwcm9wZXJ0eS5zdWJzdHJpbmcoMSldID0gRVZFTlQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgICAgIHR5cGVbcHJvcGVydHkuc3Vic3RyaW5nKDEpXSA9IEJPT0xFQU47XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgIHR5cGVbcHJvcGVydHkuc3Vic3RyaW5nKDEpXSA9IE5VTUJFUjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgICAgdHlwZVtwcm9wZXJ0eS5zdWJzdHJpbmcoMSldID0gT0JKRUNUO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHR5cGVbcHJvcGVydHldID0gU1RSSU5HO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBoYXNQcm9wZXJ0eSh0YWdOYW1lOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcsIHNjaGVtYU1ldGFzOiBTY2hlbWFNZXRhZGF0YVtdKTogYm9vbGVhbiB7XG4gICAgaWYgKHNjaGVtYU1ldGFzLnNvbWUoKHNjaGVtYSkgPT4gc2NoZW1hLm5hbWUgPT09IE5PX0VSUk9SU19TQ0hFTUEubmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0YWdOYW1lLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICBpZiAoaXNOZ0NvbnRhaW5lcih0YWdOYW1lKSB8fCBpc05nQ29udGVudCh0YWdOYW1lKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChzY2hlbWFNZXRhcy5zb21lKChzY2hlbWEpID0+IHNjaGVtYS5uYW1lID09PSBDVVNUT01fRUxFTUVOVFNfU0NIRU1BLm5hbWUpKSB7XG4gICAgICAgIC8vIENhbid0IHRlbGwgbm93IGFzIHdlIGRvbid0IGtub3cgd2hpY2ggcHJvcGVydGllcyBhIGN1c3RvbSBlbGVtZW50IHdpbGwgZ2V0XG4gICAgICAgIC8vIG9uY2UgaXQgaXMgaW5zdGFudGlhdGVkXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnRQcm9wZXJ0aWVzID0gdGhpcy5fc2NoZW1hW3RhZ05hbWUudG9Mb3dlckNhc2UoKV0gfHwgdGhpcy5fc2NoZW1hWyd1bmtub3duJ107XG4gICAgcmV0dXJuICEhZWxlbWVudFByb3BlcnRpZXNbcHJvcE5hbWVdO1xuICB9XG5cbiAgaGFzRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcsIHNjaGVtYU1ldGFzOiBTY2hlbWFNZXRhZGF0YVtdKTogYm9vbGVhbiB7XG4gICAgaWYgKHNjaGVtYU1ldGFzLnNvbWUoKHNjaGVtYSkgPT4gc2NoZW1hLm5hbWUgPT09IE5PX0VSUk9SU19TQ0hFTUEubmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0YWdOYW1lLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICBpZiAoaXNOZ0NvbnRhaW5lcih0YWdOYW1lKSB8fCBpc05nQ29udGVudCh0YWdOYW1lKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNjaGVtYU1ldGFzLnNvbWUoKHNjaGVtYSkgPT4gc2NoZW1hLm5hbWUgPT09IENVU1RPTV9FTEVNRU5UU19TQ0hFTUEubmFtZSkpIHtcbiAgICAgICAgLy8gQWxsb3cgYW55IGN1c3RvbSBlbGVtZW50c1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gISF0aGlzLl9zY2hlbWFbdGFnTmFtZS50b0xvd2VyQ2FzZSgpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBzZWN1cml0eUNvbnRleHQgcmV0dXJucyB0aGUgc2VjdXJpdHkgY29udGV4dCBmb3IgdGhlIGdpdmVuIHByb3BlcnR5IG9uIHRoZSBnaXZlbiBET00gdGFnLlxuICAgKlxuICAgKiBUYWcgYW5kIHByb3BlcnR5IG5hbWUgYXJlIHN0YXRpY2FsbHkga25vd24gYW5kIGNhbm5vdCBjaGFuZ2UgYXQgcnVudGltZSwgaS5lLiBpdCBpcyBub3RcbiAgICogcG9zc2libGUgdG8gYmluZCBhIHZhbHVlIGludG8gYSBjaGFuZ2luZyBhdHRyaWJ1dGUgb3IgdGFnIG5hbWUuXG4gICAqXG4gICAqIFRoZSBmaWx0ZXJpbmcgaXMgd2hpdGUgbGlzdCBiYXNlZC4gQWxsIGF0dHJpYnV0ZXMgaW4gdGhlIHNjaGVtYSBhYm92ZSBhcmUgYXNzdW1lZCB0byBoYXZlIHRoZVxuICAgKiAnTk9ORScgc2VjdXJpdHkgY29udGV4dCwgaS5lLiB0aGF0IHRoZXkgYXJlIHNhZmUgaW5lcnQgc3RyaW5nIHZhbHVlcy4gT25seSBzcGVjaWZpYyB3ZWxsIGtub3duXG4gICAqIGF0dGFjayB2ZWN0b3JzIGFyZSBhc3NpZ25lZCB0aGVpciBhcHByb3ByaWF0ZSBjb250ZXh0LlxuICAgKi9cbiAgc2VjdXJpdHlDb250ZXh0KHRhZ05hbWU6IHN0cmluZywgcHJvcE5hbWU6IHN0cmluZywgaXNBdHRyaWJ1dGU6IGJvb2xlYW4pOiBTZWN1cml0eUNvbnRleHQge1xuICAgIGlmIChpc0F0dHJpYnV0ZSkge1xuICAgICAgLy8gTkI6IEZvciBzZWN1cml0eSBwdXJwb3NlcywgdXNlIHRoZSBtYXBwZWQgcHJvcGVydHkgbmFtZSwgbm90IHRoZSBhdHRyaWJ1dGUgbmFtZS5cbiAgICAgIHByb3BOYW1lID0gdGhpcy5nZXRNYXBwZWRQcm9wTmFtZShwcm9wTmFtZSk7XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIGNvbXBhcmlzb25zIGFyZSBjYXNlIGluc2Vuc2l0aXZlLCBzbyB0aGF0IGNhc2UgZGlmZmVyZW5jZXMgYmV0d2VlbiBhdHRyaWJ1dGUgYW5kXG4gICAgLy8gcHJvcGVydHkgbmFtZXMgZG8gbm90IGhhdmUgYSBzZWN1cml0eSBpbXBhY3QuXG4gICAgdGFnTmFtZSA9IHRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBwcm9wTmFtZSA9IHByb3BOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgbGV0IGN0eCA9IFNFQ1VSSVRZX1NDSEVNQVt0YWdOYW1lICsgJ3wnICsgcHJvcE5hbWVdO1xuICAgIGlmIChjdHgpIHtcbiAgICAgIHJldHVybiBjdHg7XG4gICAgfVxuICAgIGN0eCA9IFNFQ1VSSVRZX1NDSEVNQVsnKnwnICsgcHJvcE5hbWVdO1xuICAgIHJldHVybiBjdHggPyBjdHggOiBTZWN1cml0eUNvbnRleHQuTk9ORTtcbiAgfVxuXG4gIGdldE1hcHBlZFByb3BOYW1lKHByb3BOYW1lOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gX0FUVFJfVE9fUFJPUFtwcm9wTmFtZV0gfHwgcHJvcE5hbWU7IH1cblxuICBnZXREZWZhdWx0Q29tcG9uZW50RWxlbWVudE5hbWUoKTogc3RyaW5nIHsgcmV0dXJuICduZy1jb21wb25lbnQnOyB9XG5cbiAgdmFsaWRhdGVQcm9wZXJ0eShuYW1lOiBzdHJpbmcpOiB7ZXJyb3I6IGJvb2xlYW4sIG1zZz86IHN0cmluZ30ge1xuICAgIGlmIChuYW1lLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgnb24nKSkge1xuICAgICAgY29uc3QgbXNnID0gYEJpbmRpbmcgdG8gZXZlbnQgcHJvcGVydHkgJyR7bmFtZX0nIGlzIGRpc2FsbG93ZWQgZm9yIHNlY3VyaXR5IHJlYXNvbnMsIGAgK1xuICAgICAgICAgIGBwbGVhc2UgdXNlICgke25hbWUuc2xpY2UoMil9KT0uLi5gICtcbiAgICAgICAgICBgXFxuSWYgJyR7bmFtZX0nIGlzIGEgZGlyZWN0aXZlIGlucHV0LCBtYWtlIHN1cmUgdGhlIGRpcmVjdGl2ZSBpcyBpbXBvcnRlZCBieSB0aGVgICtcbiAgICAgICAgICBgIGN1cnJlbnQgbW9kdWxlLmA7XG4gICAgICByZXR1cm4ge2Vycm9yOiB0cnVlLCBtc2c6IG1zZ307XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7ZXJyb3I6IGZhbHNlfTtcbiAgICB9XG4gIH1cblxuICB2YWxpZGF0ZUF0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiB7ZXJyb3I6IGJvb2xlYW4sIG1zZz86IHN0cmluZ30ge1xuICAgIGlmIChuYW1lLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgnb24nKSkge1xuICAgICAgY29uc3QgbXNnID0gYEJpbmRpbmcgdG8gZXZlbnQgYXR0cmlidXRlICcke25hbWV9JyBpcyBkaXNhbGxvd2VkIGZvciBzZWN1cml0eSByZWFzb25zLCBgICtcbiAgICAgICAgICBgcGxlYXNlIHVzZSAoJHtuYW1lLnNsaWNlKDIpfSk9Li4uYDtcbiAgICAgIHJldHVybiB7ZXJyb3I6IHRydWUsIG1zZzogbXNnfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtlcnJvcjogZmFsc2V9O1xuICAgIH1cbiAgfVxuXG4gIGFsbEtub3duRWxlbWVudE5hbWVzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX3NjaGVtYSk7IH1cblxuICBub3JtYWxpemVBbmltYXRpb25TdHlsZVByb3BlcnR5KHByb3BOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkYXNoQ2FzZVRvQ2FtZWxDYXNlKHByb3BOYW1lKTtcbiAgfVxuXG4gIG5vcm1hbGl6ZUFuaW1hdGlvblN0eWxlVmFsdWUoY2FtZWxDYXNlUHJvcDogc3RyaW5nLCB1c2VyUHJvdmlkZWRQcm9wOiBzdHJpbmcsIHZhbDogc3RyaW5nfG51bWJlcik6XG4gICAgICB7ZXJyb3I6IHN0cmluZywgdmFsdWU6IHN0cmluZ30ge1xuICAgIGxldCB1bml0OiBzdHJpbmcgPSAnJztcbiAgICBjb25zdCBzdHJWYWwgPSB2YWwudG9TdHJpbmcoKS50cmltKCk7XG4gICAgbGV0IGVycm9yTXNnOiBzdHJpbmcgPSBudWxsICE7XG5cbiAgICBpZiAoX2lzUGl4ZWxEaW1lbnNpb25TdHlsZShjYW1lbENhc2VQcm9wKSAmJiB2YWwgIT09IDAgJiYgdmFsICE9PSAnMCcpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgICAgICB1bml0ID0gJ3B4JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHZhbEFuZFN1ZmZpeE1hdGNoID0gdmFsLm1hdGNoKC9eWystXT9bXFxkXFwuXSsoW2Etel0qKSQvKTtcbiAgICAgICAgaWYgKHZhbEFuZFN1ZmZpeE1hdGNoICYmIHZhbEFuZFN1ZmZpeE1hdGNoWzFdLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgZXJyb3JNc2cgPSBgUGxlYXNlIHByb3ZpZGUgYSBDU1MgdW5pdCB2YWx1ZSBmb3IgJHt1c2VyUHJvdmlkZWRQcm9wfToke3ZhbH1gO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7ZXJyb3I6IGVycm9yTXNnLCB2YWx1ZTogc3RyVmFsICsgdW5pdH07XG4gIH1cbn1cblxuZnVuY3Rpb24gX2lzUGl4ZWxEaW1lbnNpb25TdHlsZShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgc3dpdGNoIChwcm9wKSB7XG4gICAgY2FzZSAnd2lkdGgnOlxuICAgIGNhc2UgJ2hlaWdodCc6XG4gICAgY2FzZSAnbWluV2lkdGgnOlxuICAgIGNhc2UgJ21pbkhlaWdodCc6XG4gICAgY2FzZSAnbWF4V2lkdGgnOlxuICAgIGNhc2UgJ21heEhlaWdodCc6XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgY2FzZSAndG9wJzpcbiAgICBjYXNlICdib3R0b20nOlxuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICBjYXNlICdmb250U2l6ZSc6XG4gICAgY2FzZSAnb3V0bGluZVdpZHRoJzpcbiAgICBjYXNlICdvdXRsaW5lT2Zmc2V0JzpcbiAgICBjYXNlICdwYWRkaW5nVG9wJzpcbiAgICBjYXNlICdwYWRkaW5nTGVmdCc6XG4gICAgY2FzZSAncGFkZGluZ0JvdHRvbSc6XG4gICAgY2FzZSAncGFkZGluZ1JpZ2h0JzpcbiAgICBjYXNlICdtYXJnaW5Ub3AnOlxuICAgIGNhc2UgJ21hcmdpbkxlZnQnOlxuICAgIGNhc2UgJ21hcmdpbkJvdHRvbSc6XG4gICAgY2FzZSAnbWFyZ2luUmlnaHQnOlxuICAgIGNhc2UgJ2JvcmRlclJhZGl1cyc6XG4gICAgY2FzZSAnYm9yZGVyV2lkdGgnOlxuICAgIGNhc2UgJ2JvcmRlclRvcFdpZHRoJzpcbiAgICBjYXNlICdib3JkZXJMZWZ0V2lkdGgnOlxuICAgIGNhc2UgJ2JvcmRlclJpZ2h0V2lkdGgnOlxuICAgIGNhc2UgJ2JvcmRlckJvdHRvbVdpZHRoJzpcbiAgICBjYXNlICd0ZXh0SW5kZW50JzpcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19