import { ElementRef, EmbeddedViewRef, Injector, TemplateRef } from '@angular/core';


const CONTEXT_PROP = 'context';

/**
 * Wraps a template ref and exposes the entire context to the template as additional prop
 */
export class TemplateRefWrapper<C> extends TemplateRef<C> {

    get elementRef(): ElementRef<any> {
        return this._templateRef.elementRef;
    }

    /** Create a wrapper around TemplateRef with the context exposed */
    constructor(private _templateRef: TemplateRef<C>) {
        super();
    }
    createEmbeddedView(context: C, injector?: Injector): EmbeddedViewRef<C> {
        context[CONTEXT_PROP] = context;
        return this._templateRef.createEmbeddedView(context, injector);
    }

}
