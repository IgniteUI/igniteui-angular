import {Directive, EmbeddedViewRef, Input, OnChanges, ChangeDetectorRef,
     SimpleChange, SimpleChanges, TemplateRef, ViewContainerRef, NgModule, NgZone, ViewRef, Output, EventEmitter} from '@angular/core';

import { CommonModule } from '@angular/common';

/**
 * @hidden
 */
@Directive({selector: '[igxTemplateOutlet]'})
export class IgxTemplateOutletDirective implements OnChanges {
  private _viewRef !: EmbeddedViewRef<any>;

    /**
    * The embedded views cache. Collection is key-value paired.
    * Key is the template id, value is the embedded view for the related template.
    */
  private _embeddedViewsMap: Map<string, EmbeddedViewRef<any>> = new Map();

  @Input() public igxTemplateOutletContext !: Object;

  @Input() public igxTemplateOutlet !: TemplateRef<any>;


  constructor(private _viewContainerRef: ViewContainerRef,  private _zone: NgZone,  public cdr: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges) {
    const recreateView = this._shouldRecreateView(changes);
    if (recreateView) {
        // view should be re-created due to changes in the template or context.
        // check if we have existing view with the new template stored in the cache.
        const tmplID = this.igxTemplateOutletContext['templateID'];
        const cachedView = tmplID ?
            this._embeddedViewsMap.get(tmplID) :
            null;
        if (!this._viewRef || !cachedView) {
            // if view does not exist yet
            // or if there is no template defined in the template outlet context
            // or if there's no such view in the cache - then re-create view.
            this._recreateView();
        } else {
           // if view exists, but template has been changed and there is a view in the cache with the related template
           // then detach old view and insert the stored one with the matching template
           // after that update its context.
            this._viewContainerRef.detach(this._viewContainerRef.indexOf(this._viewRef));
            this._viewRef = cachedView;
            this._viewContainerRef.insert(this._viewRef, 0);
            this._updateExistingContext(this.igxTemplateOutletContext);
        }
    } else {
        // view should not be re-created. Check if it exists and if context exists and just update it.
      if (this._viewRef && this.igxTemplateOutletContext) {
          this._updateExistingContext(this.igxTemplateOutletContext);
      }
    }
  }

  private _recreateView() {
     // remove and recreate
     if (this._viewRef) {
         this._viewContainerRef.detach(this._viewContainerRef.indexOf(this._viewRef));
      }
      if (this.igxTemplateOutlet) {
        this._viewRef = this._viewContainerRef.createEmbeddedView(
              this.igxTemplateOutlet, this.igxTemplateOutletContext);
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
