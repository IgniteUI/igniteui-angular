import { ElementRef, EmbeddedViewRef, Injector, TemplateRef, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

const CONTEXT_PROP = 'context';

/**
 * Wraps a template ref and exposes the entire context to the template as additional prop
 */
export class TemplateRefWrapper<C> extends TemplateRef<C> {

    get elementRef(): ElementRef<any> {
        return this._templateRef.elementRef;
    }

    /** Create a wrapper around TemplateRef with the context exposed */
    constructor(private _templateRef: TemplateRef<C>, private _templateFunction: any) {
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

        let view = this._templateRef.createEmbeddedView(context, injector);
        if (isBridged) {
            view.onDestroy(() => {
                this.destroyingBridgedView(contentContext);
            });
        }

        return view;
    }

    destroyingBridgedView(contentContext: TemplateRefWrapperContentContext) {
        this._templateFunction.___onTemplateTeardown(this._templateFunction, this.elementRef.nativeElement, contentContext);
    }

}

class TemplateRefWrapperContentContext {
    _id: string;

}