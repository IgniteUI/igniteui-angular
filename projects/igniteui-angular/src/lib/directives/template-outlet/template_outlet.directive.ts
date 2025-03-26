import {
    Directive, EmbeddedViewRef, Input, OnChanges, ChangeDetectorRef,
    SimpleChange, SimpleChanges, TemplateRef, ViewContainerRef, NgZone, Output, EventEmitter,
    OnDestroy,
} from '@angular/core';

import { IBaseEventArgs } from '../../core/utils';

/**
 * @hidden
 */
@Directive({
    selector: '[igxTemplateOutlet]',
    standalone: true
})
export class IgxTemplateOutletDirective implements OnChanges, OnDestroy {
    @Input() public igxTemplateOutletContext !: any;

    @Input() public igxTemplateOutlet !: TemplateRef<any>;

    @Output()
    public viewCreated = new EventEmitter<IViewChangeEventArgs>();

    @Output()
    public viewMoved = new EventEmitter<IViewChangeEventArgs>();

    @Output()
    public cachedViewLoaded = new EventEmitter<ICachedViewLoadedEventArgs>();

    @Output()
    public beforeViewDetach = new EventEmitter<IViewChangeEventArgs>();

    private _viewRef !: EmbeddedViewRef<any>;

    /**
     * The embedded views cache. Collection is key-value paired.
     * Key is the template type, value is another key-value paired collection
     * where the key is the template id and value is the embedded view for the related template.
     */
    private _embeddedViewsMap: Map<string, Map<any, EmbeddedViewRef<any>>> = new Map();

    constructor(public _viewContainerRef: ViewContainerRef, private _zone: NgZone, public cdr: ChangeDetectorRef) {
    }

    public ngOnChanges(changes: SimpleChanges) {
        const actionType: TemplateOutletAction = this._getActionType(changes);
        switch (actionType) {
            case TemplateOutletAction.CreateView: this._recreateView(); break;
            case TemplateOutletAction.MoveView: this._moveView(); break;
            case TemplateOutletAction.UseCachedView: this._useCachedView(); break;
            case TemplateOutletAction.UpdateViewContext: this._updateExistingContext(this.igxTemplateOutletContext); break;
        }
    }

    public ngOnDestroy(): void {
        this.cleanCache();
    }

    public cleanCache() {
        this._embeddedViewsMap.forEach((collection) => {
            collection.forEach((item => {
                if (!item.destroyed) {
                    item.destroy();
                }
            }));
            collection.clear();
        });
        this._embeddedViewsMap.clear();
    }

    private _recreateView() {
        const prevIndex = this._viewRef ? this._viewContainerRef.indexOf(this._viewRef) : -1;
        // detach old and create new
        if (prevIndex !== -1) {
            this.beforeViewDetach.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
            this._viewContainerRef.detach(prevIndex);
        }
        if (this.igxTemplateOutlet) {
            this._viewRef = this._viewContainerRef.createEmbeddedView(
                this.igxTemplateOutlet, this.igxTemplateOutletContext);
            this.viewCreated.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
            const tmplId = this.igxTemplateOutletContext['templateID'];
            if (tmplId) {
                // if context contains a template id, check if we have a view for that template already stored in the cache
                // if not create a copy and add it to the cache in detached state.
                // Note: Views in detached state do not appear in the DOM, however they remain stored in memory.
                this.cacheView(tmplId, this._viewRef);
            }
        }
    }

    private _moveView() {
        // using external view and inserting it in current view.
        const view = this.igxTemplateOutletContext['moveView'];
        const owner = this.igxTemplateOutletContext['owner'];
        if (view !== this._viewRef) {
            if (owner._viewContainerRef.indexOf(view) !== -1) {
                // detach in case view it is attached somewhere else at the moment.
                this.beforeViewDetach.emit({ owner: this, view, context: this.igxTemplateOutletContext });
                owner._viewContainerRef.detach(owner._viewContainerRef.indexOf(view));
            }
            if (this._viewRef && this._viewContainerRef.indexOf(this._viewRef) !== -1) {
                this.beforeViewDetach.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
                this._viewContainerRef.detach(this._viewContainerRef.indexOf(this._viewRef));
            }
            this._viewRef = view;
            this._viewContainerRef.insert(view, 0);
            this._updateExistingContext(this.igxTemplateOutletContext);
            this.viewMoved.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
        } else {
            this._updateExistingContext(this.igxTemplateOutletContext);
        }
    }
    private _useCachedView() {
        // use view for specific template cached in the current template outlet
        const tmplID = this.igxTemplateOutletContext['templateID'];
        const cachedView = tmplID ?
            this._embeddedViewsMap.get(tmplID.type)?.get(tmplID.id) :
            null;
        // if view exists, but template has been changed and there is a view in the cache with the related template
        // then detach old view and insert the stored one with the matching template
        // after that update its context.
        if (this._viewContainerRef.length > 0) {
            this.beforeViewDetach.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
            this._viewContainerRef.detach(this._viewContainerRef.indexOf(this._viewRef));
        }

        this._viewRef = cachedView;
        const oldContext = this._cloneContext(cachedView.context);
        this._viewContainerRef.insert(this._viewRef, 0);
        this._updateExistingContext(this.igxTemplateOutletContext);
        this.cachedViewLoaded.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext, oldContext });
    }

    private _shouldRecreateView(changes: SimpleChanges): boolean {
        const ctxChange = changes['igxTemplateOutletContext'];
        return !!changes['igxTemplateOutlet'] || (ctxChange && this._hasContextShapeChanged(ctxChange));
    }

    private _hasContextShapeChanged(ctxChange: SimpleChange): boolean {
        const prevCtxKeys = Object.keys(ctxChange.previousValue || {});
        const currCtxKeys = Object.keys(ctxChange.currentValue || {});

        if (prevCtxKeys.length === currCtxKeys.length) {
            for (const propName of currCtxKeys) {
                if (prevCtxKeys.indexOf(propName) === -1) {
                    return true;
                }
            }
            return false;
        } else {
            return true;
        }
    }

    private _updateExistingContext(ctx: any): void {
        for (const propName of Object.keys(ctx)) {
            this._viewRef.context[propName] = this.igxTemplateOutletContext[propName];
        }
    }

    private _cloneContext(ctx: any): any {
        const clone = {};
        for (const propName of Object.keys(ctx)) {
            clone[propName] = ctx[propName];
        }
        return clone;
    }

    private _getActionType(changes: SimpleChanges) {
        const movedView = this.igxTemplateOutletContext['moveView'];
        const tmplID = this.igxTemplateOutletContext['templateID'];
        const cachedView = tmplID ?
            this._embeddedViewsMap.get(tmplID.type)?.get(tmplID.id) :
            null;
        const shouldRecreate = this._shouldRecreateView(changes);
        if (movedView) {
            // view is moved from external source
            return TemplateOutletAction.MoveView;
        } else if (shouldRecreate && cachedView) {
            // should recreate (template or context change) and there is a matching template in cache
            return TemplateOutletAction.UseCachedView;
        } else if (!this._viewRef || shouldRecreate) {
            // no view or should recreate
            return TemplateOutletAction.CreateView;
        } else if (this.igxTemplateOutletContext) {
            // has context, update context
            return TemplateOutletAction.UpdateViewContext;
        }
    }

    private cacheView(tmplID: { type: string, id: unknown } | undefined, viewRef: EmbeddedViewRef<any>) {
        if (!tmplID) {
            return;
        }

        const hasUniqueId = tmplID.id !== undefined && tmplID.id !== null;
        if (hasUniqueId) {
            // Don't cache locally unique id views, they're handled by the parent component by using moveview instead of cache
            return;
        }

        let resCollection = this._embeddedViewsMap.get(tmplID.type);
        if (!resCollection) {
            resCollection = new Map();
            this._embeddedViewsMap.set(tmplID.type, resCollection);
        }

        resCollection.set(tmplID.id, viewRef);
    }
}
enum TemplateOutletAction {
    CreateView,
    MoveView,
    UseCachedView,
    UpdateViewContext
}

export interface IViewChangeEventArgs extends IBaseEventArgs {
    owner: IgxTemplateOutletDirective;
    view: EmbeddedViewRef<any>;
    context: any;
}

export interface ICachedViewLoadedEventArgs extends IViewChangeEventArgs {
    oldContext: any;
}

/**
 * @hidden
 */

