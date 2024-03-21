import { Inject, Injectable, NgZone } from '@angular/core';
import { ɵgetDOM as getDOM } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { PlatformUtil } from './utils';
import { HammerManager, HammerOptions, HammerStatic } from './touch-annotations';

const EVENT_SUFFIX = 'precise';

/**
 * Touch gestures manager based on Hammer.js
 * Use with caution, this will track references for single manager per element. Very TBD. Much TODO.
 *
 * @hidden
 */
@Injectable()
export class HammerGesturesManager {
    public static Hammer: HammerStatic = typeof window !== 'undefined' ? (window as any).Hammer : null;
    /**
     * Event option defaults for each recognizer, see http://hammerjs.github.io/api/ for API listing.
     */
    protected hammerOptions: HammerOptions = {};

    private platformBrowser: boolean;
    private _hammerManagers: Array<{ element: EventTarget; manager: HammerManager }> = [];

    constructor(private _zone: NgZone, @Inject(DOCUMENT) private doc: any, private platformUtil: PlatformUtil) {
        this.platformBrowser = this.platformUtil.isBrowser;
        if (this.platformBrowser && HammerGesturesManager.Hammer) {
            this.hammerOptions = {
                // D.P. #447 Force TouchInput due to PointerEventInput bug (https://github.com/hammerjs/hammer.js/issues/1065)
                // see https://github.com/IgniteUI/igniteui-angular/issues/447#issuecomment-324601803
                inputClass: HammerGesturesManager.Hammer.TouchInput,
                recognizers: [
                    [HammerGesturesManager.Hammer.Pan, { threshold: 0 }],
                    [HammerGesturesManager.Hammer.Swipe, { direction: HammerGesturesManager.Hammer.DIRECTION_HORIZONTAL }],
                    [HammerGesturesManager.Hammer.Tap],
                    [HammerGesturesManager.Hammer.Tap, { event: 'doubletap', taps: 2 }, ['tap']]
                ]
            };
        }
    }

    public supports(eventName: string): boolean {
        return eventName.toLowerCase().endsWith('.' + EVENT_SUFFIX);
    }

    /**
     * Add listener extended with options for Hammer.js. Will use defaults if none are provided.
     * Modeling after other event plugins for easy future modifications.
     */
    public addEventListener(
        element: HTMLElement,
        eventName: string,
        eventHandler: (eventObj) => void,
        options: HammerOptions = null): () => void {
        if (!this.platformBrowser) {
            return;
        }

        // Creating the manager bind events, must be done outside of angular
        return this._zone.runOutsideAngular(() => {
            if (!HammerGesturesManager.Hammer) {
                //no hammer
                return;
            }
            let mc: HammerManager = this.getManagerForElement(element);
            if (mc === null) {
                // new Hammer is a shortcut for Manager with defaults
                mc = new HammerGesturesManager.Hammer(element, Object.assign(this.hammerOptions, options));
                this.addManagerForElement(element, mc);
            }
            const handler = (eventObj) => this._zone.run(() => eventHandler(eventObj));
            mc.on(eventName, handler);
            return () => mc.off(eventName, handler);
        });
    }

    /**
     * Add listener extended with options for Hammer.js. Will use defaults if none are provided.
     * Modeling after other event plugins for easy future modifications.
     *
     * @param target Can be one of either window, body or document(fallback default).
     */
    public addGlobalEventListener(target: string, eventName: string, eventHandler: (eventObj) => void): () => void {
        if (!this.platformBrowser || !HammerGesturesManager.Hammer) {
            return;
        }

        const element = this.getGlobalEventTarget(target);

        // Creating the manager bind events, must be done outside of angular
        return this.addEventListener(element as HTMLElement, eventName, eventHandler);
    }

    /**
     * Exposes [Dom]Adapter.getGlobalEventTarget to get global event targets.
     * Supported: window, document, body. Defaults to document for invalid args.
     *
     * @param target Target name
     */
    public getGlobalEventTarget(target: string): EventTarget {
        return getDOM().getGlobalEventTarget(this.doc, target);
    }

    /**
     * Set HammerManager options.
     *
     * @param element The DOM element used to create the manager on.
     *
     * ### Example
     *
     * ```ts
     * manager.setManagerOption(myElem, "pan", { pointers: 1 });
     * ```
     */
    public setManagerOption(element: EventTarget, event: string, options: any) {
        const manager = this.getManagerForElement(element);
        manager.get(event).set(options);
    }

    /**
     * Add an element and manager map to the internal collection.
     *
     * @param element The DOM element used to create the manager on.
     */
    public addManagerForElement(element: EventTarget, manager: HammerManager) {
        this._hammerManagers.push({element, manager});
    }

    /**
     * Get HammerManager for the element or null
     *
     * @param element The DOM element used to create the manager on.
     */
    public getManagerForElement(element: EventTarget): HammerManager {
        const result =  this._hammerManagers.filter(value => value.element === element);
        return result.length ? result[0].manager : null;
    }

    /**
     * Destroys the HammerManager for the element, removing event listeners in the process.
     *
     * @param element The DOM element used to create the manager on.
     */
    public removeManagerForElement(element: HTMLElement) {
        let index: number = null;
        for (let i = 0; i < this._hammerManagers.length; i++) {
            if (element === this._hammerManagers[i].element) {
                index = i;
                break;
            }
        }
        if (index !== null) {
            const item = this._hammerManagers.splice(index, 1)[0];
            // destroy also
            item.manager.destroy();
        }
    }

    /** Destroys all internally tracked HammerManagers, removing event listeners in the process. */
    public destroy() {
        for (const item of this._hammerManagers) {
            item.manager.destroy();
        }
        this._hammerManagers = [];
    }
}
