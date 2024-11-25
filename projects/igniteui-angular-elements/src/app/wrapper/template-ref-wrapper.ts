import { ElementRef, EmbeddedViewRef, Injector, TemplateRef } from '@angular/core';

const CONTEXT_PROP = 'context';
const IMPLICIT_PROP = 'implicit';
const PREFIX_IMPLICIT_PROP = '$implicit';

/**
 * Wraps a template ref and exposes the entire context to the template as additional prop
 */
export class TemplateRefWrapper<C extends object> extends TemplateRef<C> {

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
        //#region bridged template props
        let isBridged = !!this._templateFunction.___isBridged;
        let contentContext: TemplateRefWrapperContentContext;
        let contentId: string;
        let root: any;
        //#endregion

        // https://github.com/angular/angular/pull/51887
        /**  Angular 17+ context is behind a proxy: will throw on set for templates without context & underlying object will change, so Proxy extra props on top */
        let ctx = <C>new Proxy(context, {
            has(_target, prop): boolean {
                if (prop === IMPLICIT_PROP) {
                    return true;
                }
                // Angular's Proxy doesn't handle this, so technically everything returns false ¯\(°_o)/¯
                return false;
            },
            get(target, prop, receiver) {
                if (prop === CONTEXT_PROP) {
                    // redirect context prop to this proxy that implements other props:
                    return receiver;
                }
                if (prop === IMPLICIT_PROP) {
                    prop = PREFIX_IMPLICIT_PROP
                }
                if (isBridged && prop === '___contentId') {
                    return contentId;
                }
                if (isBridged && prop === '___immediate') {
                    return true;
                }
                if (isBridged && prop === '___root') {
                    return root;
                }
                return Reflect.get(target, prop, receiver);
            },
        });

        const viewRef = (this.innerTemplateRef as any).createEmbeddedViewImpl(ctx, injector);

        if (isBridged) {
            root = viewRef.rootNodes[0];

            contentContext = new TemplateRefWrapperContentContext();
            contentId = crypto.randomUUID();
            contentContext._id = contentId;
            root._id = contentId;
            contentContext.root = root;
            contentContext.templateFunction = this._templateFunction;

            this._contentContext.set(contentId, contentContext);
            this._templateFunction.___onTemplateInit(this._templateFunction, root, contentContext);
            //contentContext.templateFunction.___onTemplateContextChanged(contentContext.templateFunction, contentContext.root, context);

            viewRef.onDestroy(() => {
                this.destroyingBridgedView(contentContext);
            });
        }

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
