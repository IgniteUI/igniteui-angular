import { ElementRef, EmbeddedViewRef, Injector, TemplateRef, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

const CONTEXT_PROP = 'context';

/**
 * Wraps a template ref and exposes the entire context to the template as additional prop
 */
export class TemplateRefWrapper<C> extends TemplateRef<C> {

    get elementRef(): ElementRef<any> {
        return this.innerTemplateRef.elementRef;
    }

    /** Create a wrapper around TemplateRef with the context exposed */
    constructor(public innerTemplateRef: TemplateRef<C>, private _templateFunction: any) {
        super();
    }

    private _contentContext = new Map<string, TemplateRefWrapperContentContext>();

    createEmbeddedView(context: C, injector?: Injector): EmbeddedViewRef<C> {
        context[CONTEXT_PROP] = context;

        let isBridged = !!this._templateFunction.___isBridged;

        let contentContext: TemplateRefWrapperContentContext;
        if (isBridged) {
            contentContext = new TemplateRefWrapperContentContext();
            let contentId = uuidv4() as string;
            (context as any).___contentId = contentId;
            contentContext._id = contentId;
            this._contentContext.set(contentId, contentContext);
            this._templateFunction.___onTemplateInit(this._templateFunction, this.elementRef.nativeElement, contentContext);
        }

        const viewRef = this.innerTemplateRef.createEmbeddedView(context, injector);
        if (isBridged) {
            viewRef.onDestroy(() => {
                this.destroyingBridgedView(contentContext);
            });
        }

        var original = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(viewRef), 'context');
        Object.defineProperty(viewRef, "context", {
            set: function(val) {
                val[CONTEXT_PROP] = val;
                original.set.call(this, val);
                if (isBridged) {
                    this._templateFunction.___onTemplateContextChanged(this._templateFunction, this.elementRef.nativeElement, val);
                }
            },
            get: function() {
                return original.get.call(this);
            }
        });
        return viewRef;
    }

    destroyingBridgedView(contentContext: TemplateRefWrapperContentContext) {
        this._templateFunction.___onTemplateTeardown(this._templateFunction, this.elementRef.nativeElement, contentContext);
    }

}

class TemplateRefWrapperContentContext {
    _id: string;

}