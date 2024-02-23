/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes recent versions of Safari, Chrome (including
 * Opera), Edge on the desktop, and iOS and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 * because those flags need to be set before `zone.js` being loaded, and webpack
 * will put import in the top of bundle, so user need to create a separate file
 * in this directory (for example: zone-flags.ts), and put the following flags
 * into that file, and then add the following code before importing zone.js.
 * import './zone-flags';
 *
 * The flags allowed in zone-flags.ts are listed here.
 *
 * The following flags will work for all browsers.
 *
 * (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
 * (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
 * (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
 *
 *  in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
 *  with the following flag, it will bypass `zone.js` patch for IE/Edge
 *
 *  (window as any).__Zone_enable_cross_context_check = true;
 *
 */

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.


/***************************************************************************************************
 * APPLICATION IMPORTS
 */
import "./app/ssr-shim";

/**
 * Temporary workaround to kick abort controller listeners out of zone handling
 * until https://github.com/angular/angular/issues/49591 is fixed
 * ~~ Who monkey-patches the monkey-patchers? ~~
 */
Zone && Zone.__load_patch('abortSignal_patchEventTarget', (global: Window, Zone: ZoneType, api: _ZonePrivate) => {
    const EVENT_TARGET = global['EventTarget']?.prototype;
    const ADD_EVENT_LISTENER = api.getGlobalObjects().ADD_EVENT_LISTENER_STR;
    const originalDelegateName = api.symbol(ADD_EVENT_LISTENER);
    const newDelegateName = api.symbol(`${ADD_EVENT_LISTENER}__ig_patch`);


    if (!EVENT_TARGET?.[originalDelegateName]) {
        // not patched, skip
        return;
    }

    // `api.patchMethod(EVENT_TARGET.prototype, ADD_EVENT_LISTENER` won't work because already patched
    EVENT_TARGET[newDelegateName] = EVENT_TARGET[ADD_EVENT_LISTENER];
    EVENT_TARGET[ADD_EVENT_LISTENER] = function () {
        if (arguments[2]?.signal) {
            // skip zone for events with signal until zone can be removed or // https://github.com/angular/angular/issues/49591 is fixed
            return EVENT_TARGET[originalDelegateName].apply(this, arguments);
        } else {
            return EVENT_TARGET[newDelegateName].apply(this, arguments);
        }
    }
});
