/// <reference types="hammerjs" />
import { NgZone } from "@angular/core";
export declare class HammerGesturesManager {
    private _zone;
    private doc;
    protected hammerOptions: HammerOptions;
    private _hammerManagers;
    constructor(_zone: NgZone, doc: any);
    supports(eventName: string): boolean;
    addEventListener(element: HTMLElement, eventName: string, eventHandler: (eventObj) => void, options?: object): () => void;
    addGlobalEventListener(target: string, eventName: string, eventHandler: (eventObj) => void): () => void;
    getGlobalEventTarget(target: string): EventTarget;
    setManagerOption(element: EventTarget, event: string, options: any): void;
    addManagerForElement(element: EventTarget, manager: HammerManager): void;
    getManagerForElement(element: EventTarget): HammerManager;
    removeManagerForElement(element: HTMLElement): void;
    destroy(): void;
}
