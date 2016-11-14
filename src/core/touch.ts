import {Injectable, NgZone} from '@angular/core';

const EVENT_SUFFIX: string = "precise";


/**
 * Touch gestures manager based on Hammer.js
 * Use with caution, this will track references for single manager per element. Very TBD. Much TODO.
 */
@Injectable()
export class HammerGesturesManager {
    private _hammerManagers: Array<{ element: EventTarget, manager: HammerManager; }> = [];

    /**
     * Event option defaults for each recognizer, see http://hammerjs.github.io/api/ for API listing.
     */
    protected hammerOptions: Array<any> = [
        {
            name: "pan",
            options: {
                threshold: 0
            }
        }, {
            name: "pinch",
            options: {
                enable: true
            }
        }, {
            name: "rotate",
            options: {
                enable: true
            }
        }];

    constructor(private _zone: NgZone) {
    }

    supports(eventName: string): boolean {
        return eventName.toLowerCase().endsWith("." + EVENT_SUFFIX);
    }

    /**
     * Add listener extended with options for Hammer.js. Will use defaults if none are provided.
     * Modeling after other event plugins for easy future modifications.
     */
    addEventListener(element: HTMLElement, eventName: string, eventHandler: Function, options: Object = null): Function {
        let self = this;


        // Creating the manager bind events, must be done outside of angular
        return this._zone.runOutsideAngular(function() {
            // new Hammer is a shortcut for Manager with defaults
            var mc = new Hammer(element);
            for (var i = 0; i < self.hammerOptions.length; i++) {
                mc.get(self.hammerOptions[i].name).set(self.hammerOptions[i].options);
            }
            var handler = function(eventObj) { self._zone.run(function() { eventHandler(eventObj); }); };
            mc.on(eventName, handler);
            return () => { mc.off(eventName, handler); };
        });
    }

    /**
     * Add listener extended with options for Hammer.js. Will use defaults if none are provided.
     * Modeling after other event plugins for easy future modifications.
     *
     * @param target Can be one of either window, body or document(fallback default).
     */
    addGlobalEventListener(target: string, eventName: string, eventHandler: Function): Function {
        var self = this,
            element = this.getGlobalEventTarget(target);

        // Creating the manager bind events, must be done outside of angular
        return this._zone.runOutsideAngular(function() {
            // new Hammer is a shortcut for Manager with defaults

            var mc : HammerManager = new Hammer(element as HTMLElement);
            self.addManagerForElement(element as HTMLElement, mc);

            for (var i = 0; i < self.hammerOptions.length; i++) {
                mc.get(self.hammerOptions[i].name).set(self.hammerOptions[i].options);
            }
            var handler = function(eventObj) {
                self._zone.run(function() {
                    eventHandler(eventObj);
                });
            };
            mc.on(eventName, handler);
            return () => { mc.off(eventName, handler); };
        });
    }

    /** temp replacement for DOM.getGlobalEventTarget(target) because DI won't play nice for now */
    getGlobalEventTarget(target: string): EventTarget {
        switch (target) {
            case "window":
                return window;
            case "body":
                return document.body;
            default:
                return document;
        }
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
    setManagerOption(element: EventTarget, event: string, options: any) {
        var manager = this.getManagerForElement(element);
        manager.get(event).set(options);
    }

    /**
     * Add an element and manager map to the internal collection.
     *
     * @param element The DOM element used to create the manager on.
     */
    addManagerForElement(element: EventTarget, manager: HammerManager) {
        this._hammerManagers.push({element: element, manager: manager});
    }

    /**
     * Get HammerManager for the element or null
     *
     * @param element The DOM element used to create the manager on.
     */
    getManagerForElement(element: EventTarget) : HammerManager {
        var result =  this._hammerManagers.filter(function (value, index, array) {
            return value.element === element;
        });
        return result.length ? result[0].manager : null;
    }

    /**
     * Destroys the HammerManager for the element, removing event listeners in the process.
     *
     * @param element The DOM element used to create the manager on.
     */
    removeManagerForElement(element: HTMLElement) {
        let index: number = null;
        for (var i = 0; i < this._hammerManagers.length; i++) {
            if(element === this._hammerManagers[i].element) {
                index = i;
                break;
            }
        }
        if (index !== null) {
            var item = this._hammerManagers.splice(index, 1)[0];
            // destroy also
            item.manager.destroy();
        }
    }

    /** Destroys all internally tracked HammerManagers, removing event listeners in the process. */
    destroy() {
        for (var i = 0; i < this._hammerManagers.length; i++) {
            this._hammerManagers[i].manager.destroy();
        }
        this._hammerManagers = [];
    }
}

