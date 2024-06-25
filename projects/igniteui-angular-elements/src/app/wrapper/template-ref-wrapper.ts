import { ElementRef, EmbeddedViewRef, Injector, TemplateRef, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

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
    constructor(public innerTemplateRef: TemplateRef<C>, private _templateFunction: any) {
        super();
    }

    private _contentContext = new Map<string, TemplateRefWrapperContentContext>();

    override createEmbeddedView(context: C, injector?: Injector): EmbeddedViewRef<C> {
        return this.createEmbeddedViewImpl(context, injector);
    }

    /** @internal Angular 16 impl gets called directly... */
    createEmbeddedViewImpl(context: C, injector?: Injector, _hydrationInfo: any = null): EmbeddedViewRef<C> {
        context[CONTEXT_PROP] = context;
        context[CONTEXT_PROP] = context;
        context[IMPLICIT_PROP] = context[PREFIX_IMPLICIT_PROP];

        let isBridged = !!this._templateFunction.___isBridged;

        const viewRef = (this.innerTemplateRef as any).createEmbeddedViewImpl(context, injector);

        let contentContext: TemplateRefWrapperContentContext;
        if (isBridged) {
            let root = viewRef.rootNodes[0];


            contentContext = new TemplateRefWrapperContentContext();
            let contentId = uuidv4() as string;
            (context as any).___contentId = contentId;
            (context as any).___immediate = true;
            (context as any).___root = root;
            contentContext._id = contentId;
            root._id = contentId;
            contentContext.root = root;
            contentContext.templateFunction = this._templateFunction;

            this._contentContext.set(contentId, contentContext);
            this._templateFunction.___onTemplateInit(this._templateFunction, root, contentContext);
            //contentContext.templateFunction.___onTemplateContextChanged(contentContext.templateFunction, contentContext.root, context);
        }




        if (isBridged) {
            viewRef.onDestroy(() => {
                this.destroyingBridgedView(contentContext);
            });
        }

        var original = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(viewRef), 'context');
        Object.defineProperty(viewRef, "context", {
            set: function(val) {
                val[CONTEXT_PROP] = val;
                val[IMPLICIT_PROP] = val[PREFIX_IMPLICIT_PROP];
                if (isBridged) {
                    (val as any).___contentId = contentContext._id;
                    (val as any).___immediate = true;
                    (val as any).___root = contentContext.root;
                }
                original.set.call(this, val);
                // if (isBridged) {
                //     contentContext.templateFunction.___onTemplateContextChanged(contentContext.templateFunction, contentContext.root, val);
                // }
            },
            get: function() {
                return original.get.call(this);
            }
        });
        return viewRef;
    }

    destroyingBridgedView(contentContext: TemplateRefWrapperContentContext) {
        this._templateFunction.___onTemplateTeardown(this._templateFunction, contentContext.root, contentContext);
        this._contentContext.delete(contentContext._id);
    }

}

class TemplateRefWrapperContentContext {
    _id: string;
    root: any;
    templateFunction: any;
}
