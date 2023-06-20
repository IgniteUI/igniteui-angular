import { ElementRef, EmbeddedViewRef, Injector, TemplateRef } from '@angular/core';


const CONTEXT_PROP = 'context';
const IMPLICIT_PROP = 'implicit';
const PREFIX_IMPLICIT_PROP = '$implicit';

/**
 * Wraps a template ref and exposes the entire context to the template as additional prop
 */
export class TemplateRefWrapper<C> extends TemplateRef<C> {

    get elementRef(): ElementRef<any> {
        return this.innerTemplateRef.elementRef;
    }

    /** Create a wrapper around TemplateRef with the context exposed */
    constructor(public innerTemplateRef: TemplateRef<C>) {
        super();
    }
    createEmbeddedView(context: C, injector?: Injector): EmbeddedViewRef<C> {
        context[CONTEXT_PROP] = context;
        context[IMPLICIT_PROP] = context[PREFIX_IMPLICIT_PROP];
        const viewRef = this.innerTemplateRef.createEmbeddedView(context, injector);
        var original = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(viewRef), 'context');
        Object.defineProperty(viewRef, "context", {
            set: function(val) {
                val[CONTEXT_PROP] = val;
                val[IMPLICIT_PROP] = val[PREFIX_IMPLICIT_PROP];
                original.set.call(this, val);
            },
            get: function() {
                return original.get.call(this);
            }
        });
        return viewRef;
    }

}
