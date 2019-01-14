import {
    Directive, EmbeddedViewRef, Input, OnChanges, ChangeDetectorRef,
    SimpleChange, SimpleChanges, TemplateRef, ViewContainerRef, NgModule, NgZone, ViewRef, Output, EventEmitter
} from '@angular/core';

import { CommonModule } from '@angular/common';

/**
 * @hidden
 */
@Directive({ selector: '[igxTemplateOutlet]' })
export class IgxTemplateOutletDirective implements OnChanges {
    private _viewRef !: EmbeddedViewRef<any>;

    /**
    * The embedded views cache. Collection is key-value paired.
    * Key is the template id, value is the embedded view for the related template.
    */
    private _embeddedViewsMap: Map<string, EmbeddedViewRef<any>> = new Map();

    @Input() public igxTemplateOutletContext !: Object;

    @Input() public igxTemplateOutlet !: TemplateRef<any>;

    @Output()
    public onViewCreated = new EventEmitter<any>();

    @Output()
    public onViewMoved = new EventEmitter<any>();


    constructor(public _viewContainerRef: ViewContainerRef, private _zone: NgZone, public cdr: ChangeDetectorRef) {
    }

    ngOnChanges(changes: SimpleChanges) {
        const actionType: TemplateOutletAction = this._getActionType(changes);
        switch (actionType) {
            case TemplateOutletAction.CreateView: this._recreateView(); break;
            case TemplateOutletAction.MoveView: this._moveView(); break;
            case TemplateOutletAction.UseCachedView: this._useCachedView(); break;
            case TemplateOutletAction.UpdateViewContext: this._updateExistingContext(this.igxTemplateOutletContext); break;
        }
    }

    private _recreateView() {
        // detach old and create new
        if (this._viewRef) {
            this._viewContainerRef.detach(this._viewContainerRef.indexOf(this._viewRef));
        }
        if (this.igxTemplateOutlet) {
            this._viewRef = this._viewContainerRef.createEmbeddedView(
                this.igxTemplateOutlet, this.igxTemplateOutletContext);
            this.onViewCreated.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
            const tmplId = this.igxTemplateOutletContext['templateID'];
            if (tmplId) {
                // if context contains a template id, check if we have a view for that template already stored in the cache
                // if not create a copy and add it to the cache in detached state.
                // Note: Views in detached state do not appear in the DOM, however they remain stored in memory.
                const res = this._embeddedViewsMap.get(this.igxTemplateOutletContext['templateID']);
                if (!res) {
                    this._embeddedViewsMap.set(this.igxTemplateOutletContext['templateID'], this._viewRef);
                }
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
                owner._viewContainerRef.detach(owner._viewContainerRef.indexOf(view));
            }
            if (this._viewRef && this._viewContainerRef.indexOf(this._viewRef) !== -1) {
                this._viewContainerRef.detach(this._viewContainerRef.indexOf(this._viewRef));
            }
            this._viewRef = view;
            this._viewContainerRef.insert(view, 0);
            this._updateExistingContext(this.igxTemplateOutletContext);
            this.onViewMoved.emit({ owner: this, view: this._viewRef, context: this.igxTemplateOutletContext });
        }
    }
    private _useCachedView() {
        // use view for specific template cached in the current template outlet
        const tmplID = this.igxTemplateOutletContext['templateID'];
        const cachedView = tmplID ?
            this._embeddedViewsMap.get(tmplID) :
            null;
        // if view exists, but template has been changed and there is a view in the cache with the related template
        // then detach old view and insert the stored one with the matching template
        // after that update its context.
        this._viewContainerRef.detach(this._viewContainerRef.indexOf(this._viewRef));
        this._viewRef = cachedView;
        this._viewContainerRef.insert(this._viewRef, 0);
        this._updateExistingContext(this.igxTemplateOutletContext);
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

    private _updateExistingContext(ctx: Object): void {
        for (const propName of Object.keys(ctx)) {
            (<any>this._viewRef.context)[propName] = (<any>this.igxTemplateOutletContext)[propName];
        }
    }

    private _getActionType(changes: SimpleChanges) {
        const movedView = this.igxTemplateOutletContext['moveView'];
        const tmplID = this.igxTemplateOutletContext['templateID'];
        const cachedView = tmplID ?
            this._embeddedViewsMap.get(tmplID) :
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
}
enum TemplateOutletAction {
    CreateView,
    MoveView,
    UseCachedView,
    UpdateViewContext
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxTemplateOutletDirective],
    entryComponents: [],
    exports: [IgxTemplateOutletDirective],
    imports: [CommonModule]
})

export class IgxTemplateOutletModule {
}
