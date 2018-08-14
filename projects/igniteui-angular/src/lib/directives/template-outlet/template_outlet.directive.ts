import {Directive, EmbeddedViewRef, Input, OnChanges, ChangeDetectorRef,
     SimpleChange, SimpleChanges, TemplateRef, ViewContainerRef, NgModule, NgZone, ViewRef, Output, EventEmitter} from '@angular/core';

import { CommonModule } from '@angular/common';

@Directive({selector: '[igxTemplateOutlet]'})
export class IgxTemplateOutletDirective implements OnChanges {
  private _viewRef !: EmbeddedViewRef<any>;
  private _embeddedViewsMap: Map<string, EmbeddedViewRef<any>> = new Map();

  @Input() public igxTemplateOutletContext !: Object;

  @Input() public igxTemplateOutlet !: TemplateRef<any>;


  constructor(private _viewContainerRef: ViewContainerRef,  private _zone: NgZone,  public cdr: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges) {
    const recreateView = this._shouldRecreateView(changes);
    if (recreateView) {
      if (!this._viewRef) {
        // first time - create embedded view.
        this._recreateView();
      } else {
        if (this.igxTemplateOutletContext['templateID']) {
            const res = this._embeddedViewsMap.get(this.igxTemplateOutletContext['templateID']);
            if (res) {
                // use from cache
                const vr = this._viewRef;
                const detachedView = this._viewContainerRef.detach(this._viewContainerRef.indexOf(this._viewRef));
                this._viewRef = res;
                this._viewContainerRef.insert(this._viewRef, 0);
                this._updateExistingContext(this.igxTemplateOutletContext);
            } else {
                this._recreateView();
            }
        } else {
            this._recreateView();
        }
     }
    } else {
      if (this._viewRef && this.igxTemplateOutletContext) {
          this._updateExistingContext(this.igxTemplateOutletContext);
      }
    }
  }

  private _recreateView() {
     // remove and recreate
     if (this._viewRef) {
         this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._viewRef));
      }
      if (this.igxTemplateOutlet) {
        this._viewRef = this._viewContainerRef.createEmbeddedView(
              this.igxTemplateOutlet, this.igxTemplateOutletContext);
            const tmplId = this.igxTemplateOutletContext['templateID'];
            if (tmplId) {
                const res = this._embeddedViewsMap.get(this.igxTemplateOutletContext['templateID']);
                if (!res) {
                    let emptyView = this._viewContainerRef.createEmbeddedView(
                        this.igxTemplateOutlet, {});
                    emptyView = this._viewContainerRef.detach(this._viewContainerRef.indexOf(emptyView)) as EmbeddedViewRef<any>;
                    this._embeddedViewsMap.set(this.igxTemplateOutletContext['templateID'], emptyView);
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
@NgModule({
    declarations: [IgxTemplateOutletDirective],
    entryComponents: [],
    exports: [IgxTemplateOutletDirective],
    imports: [CommonModule]
})

export class IgxTemplateOutletModule {
}
