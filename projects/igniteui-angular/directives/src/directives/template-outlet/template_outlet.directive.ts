import {
    Directive,
    EmbeddedViewRef,
    Input,
    OnChanges,
    SimpleChange,
    SimpleChanges,
    TemplateRef,
    ViewContainerRef,
    Output,
    EventEmitter,
    inject
} from '@angular/core';
import { IBaseEventArgs } from 'igniteui-angular/core';

/**
 * @hidden
 */
@Directive({
    selector: '[igxTemplateOutlet]',
    standalone: true
})
export class IgxTemplateOutletDirective implements OnChanges {
    private readonly _viewContainerRef = inject(ViewContainerRef);

    /**
     * The embedded views cache. Collection is key-value paired.
     * Key is the template type, value is another key-value paired collection
     * where the key is the template id and value is the embedded view for the related template.
     */
    private readonly _embeddedViewsMap: Map<string, Map<any, EmbeddedViewRef<any>>> = new Map();

    private _viewRef!: EmbeddedViewRef<any>;


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

    public ngOnChanges(changes: SimpleChanges) {
        const { actionType, cachedView } = this._getActionType(changes);

        switch (actionType) {
            case TemplateOutletAction.CreateView: this._recreateView(); break;
            case TemplateOutletAction.MoveView: this._moveView(); break;
            case TemplateOutletAction.UseCachedView: this._useCachedView(cachedView); break;
            case TemplateOutletAction.UpdateViewContext: this._updateExistingContext(this.igxTemplateOutletContext); break;
        }
    }

    public cleanCache(): void {
        for (const collection of this._embeddedViewsMap.values()) {
            for (const item of collection.values()) {
                if (!item.destroyed) {
                    item.destroy();
                }
            }
            collection.clear();
        }

        this._embeddedViewsMap.clear();
    }

    public cleanView(templateId: { type: string; id: any }): void {
        const viewCollection = this._embeddedViewsMap.get(templateId.type);
        const view = viewCollection?.get(templateId.id);

        if (view) {
            view.destroy();
            this._embeddedViewsMap.get(templateId.type).delete(templateId.id);
        }
    }

    private _recreateView(): void {
        const prevIndex = this._viewContainerRef.indexOf(this._viewRef);

        // detach old and create new
        if (prevIndex !== -1) {
            this.beforeViewDetach.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
            this._viewContainerRef.detach(prevIndex);
        }

        if (this.igxTemplateOutlet) {
            this._viewRef = this._viewContainerRef.createEmbeddedView(
                this.igxTemplateOutlet, this.igxTemplateOutletContext);
            this.viewCreated.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
            const templateId = this.igxTemplateOutletContext['templateID'];

            if (templateId) {
                // if context contains a template id, check if we have a view for that template already stored in the cache
                // if not create a copy and add it to the cache in detached state.
                // Note: Views in detached state do not appear in the DOM, however they remain stored in memory.
                let resCollection = this._embeddedViewsMap.get(templateId.type);

                if (!resCollection) {
                    resCollection = new Map();
                    this._embeddedViewsMap.set(templateId.type, resCollection);
                }

                if (!resCollection.has(templateId.id)) {
                    resCollection.set(templateId.id, this._viewRef);
                }
            }
        }
    }

    private _moveView() {
        // using external view and inserting it in current view.
        const view = this.igxTemplateOutletContext['moveView'];
        const owner = this.igxTemplateOutletContext['owner'];

        if (view !== this._viewRef) {
            const viewIndex = owner._viewContainerRef.indexOf(view);
            const viewRefIndex = this._viewContainerRef.indexOf(this._viewRef);

            if (viewIndex !== -1) {
                // detach in case view it is attached somewhere else at the moment.
                this.beforeViewDetach.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
                owner._viewContainerRef.detach(viewIndex);
            }

            if (this._viewRef && viewRefIndex !== -1) {
                this.beforeViewDetach.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
                this._viewContainerRef.detach(viewRefIndex);
            }

            this._viewRef = view;
            this._viewContainerRef.insert(view, 0);
            this._updateExistingContext(this.igxTemplateOutletContext);
            this.viewMoved.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
        } else {
            this._updateExistingContext(this.igxTemplateOutletContext);
        }
    }
    private _useCachedView(cachedView: EmbeddedViewRef<any>) {
        // use view for specific template cached in the current template outlet
        // if view exists, but template has been changed and there is a view in the cache with the related template
        // then detach old view and insert the stored one with the matching template
        // after that update its context.
        if (this._viewContainerRef.length > 0) {
            this.beforeViewDetach.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
            // Since the directive always inserts at index 0, we can safely detach at index 0
            this._viewContainerRef.detach(0);
        }

        this._viewRef = cachedView;
        const oldContext = {...cachedView.context};
        this._viewContainerRef.insert(this._viewRef, 0);
        this._updateExistingContext(this.igxTemplateOutletContext);
        this.cachedViewLoaded.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext, oldContext });
    }

    private _shouldRecreateView(changes: SimpleChanges): boolean {
        const ctxChange = changes['igxTemplateOutletContext'];
        return !!changes['igxTemplateOutlet'] || (ctxChange && this._hasContextShapeChanged(ctxChange));
    }

    private _hasContextShapeChanged(ctxChange: SimpleChange): boolean {
        const prevKeys = new Set(Object.keys(ctxChange.previousValue || {}));
        const currKeys = new Set(Object.keys(ctxChange.currentValue || {}));


        if (prevKeys.size !== currKeys.size) {
            return true;
        }

        return currKeys.difference(prevKeys).size > 0;
    }

    private _updateExistingContext(ctx: any): void {
        Object.assign(this._viewRef.context, ctx);
    }

    private _getActionType(changes: SimpleChanges): { actionType: TemplateOutletAction; cachedView: EmbeddedViewRef<any> | null } {
        const movedView = this.igxTemplateOutletContext['moveView'];
        const templateId = this.igxTemplateOutletContext['templateID'];
        const cachedView = templateId ?
            this._embeddedViewsMap.get(templateId.type)?.get(templateId.id) :
            null;
        const shouldRecreate = this._shouldRecreateView(changes);

        if (movedView) {
            // view is moved from external source
            return { actionType: TemplateOutletAction.MoveView, cachedView };
        } else if (shouldRecreate && cachedView) {
            // should recreate (template or context change) and there is a matching template in cache
            return { actionType: TemplateOutletAction.UseCachedView, cachedView };
        } else if (!this._viewRef || shouldRecreate) {
            // no view or should recreate
            return { actionType: TemplateOutletAction.CreateView, cachedView };
        } else if (this.igxTemplateOutletContext) {
            // has context, update context
            return { actionType: TemplateOutletAction.UpdateViewContext, cachedView };
        }
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
