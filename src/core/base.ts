import {Renderer, Input} from '@angular/core';
import { getDOM } from '@angular/platform-browser/src/dom/dom_adapter'; //this apprarently only works propery in Dart https://github.com/angular/angular/issues/6904
// TODO: Consider measuring util with Ruler https://github.com/angular/angular/issues/6515

/**
 * Base component class
 */
export class BaseComponent {
    /**
     * Should be overriden with @Input() as metadata [field] cannot be extended though iheritance
     * https://github.com/angular/angular/issues/5415
     */
    public id: string;
    constructor(protected renderer: Renderer) { }

    /**
     * Get child element by selector.
     * Replacement for `elementRef.nativeElement.querySelector`
     * @returns Returns the matched DOM element or null
     */
    protected getChild(selector: string): HTMLElement {
         // With DomRenderer selectRootElement will use querySelector against document (!!!) Also will throw if not found
        try {
            if (this.id) {
                selector = "#" + this.id + " " + selector;
            }
            // WARNING: selectRootElement will for whatever reason call clear as well..wiping all contents!
            // -----
            // return this.renderer.selectRootElement(selector);
            // ------
            // INSTEAD temporary per http://stackoverflow.com/a/34433626
            // return DOM.querySelector(DOM.query("document"), selector);
            // could also try http://blog.mgechev.com/2016/01/23/angular2-viewchildren-contentchildren-difference-viewproviders#comment-2543997382
            return document.querySelector(selector) as HTMLElement;
        } catch (error) {
            return null;
        }
    }
}