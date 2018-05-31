import { Directive, Inject, ElementRef, NgModule } from '@angular/core';
import { IgxOverlayService } from './overlay';

@Directive({
    selector: '[igxOverlay]'
})
export class IgxOverlayDirective {
    private _id: number;

    constructor(
        @Inject(IgxOverlayService) private _overlay,
        private _elementRef: ElementRef) { }

    public show() {
        // tslint:disable-next-line:no-debugger
        debugger;
        this._id = this._overlay.show(this._elementRef);
    }

    public hide() {
        // tslint:disable-next-line:no-debugger
        debugger;
        this._overlay.hide(this._id);
    }
}
@NgModule({
    declarations: [ IgxOverlayDirective ],
    exports: [ IgxOverlayDirective ],
    providers: [ IgxOverlayDirective ]
})
export class IgxOverlayModule {}
