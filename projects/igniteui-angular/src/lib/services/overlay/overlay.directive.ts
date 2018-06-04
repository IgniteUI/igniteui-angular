import { Directive, Inject, ElementRef, NgModule } from '@angular/core';
import { IgxOverlayService } from './overlay';
import { IPositionStrategy } from './position/IPositionStrategy';

@Directive({
    selector: '[igxOverlay]'
})
export class IgxOverlayDirective {
    private _id: number;

    constructor(
        @Inject(IgxOverlayService) private _overlay: IgxOverlayService,
        private _elementRef: ElementRef) { }

    public show(positionStrategy?: IPositionStrategy) {
        this._id = this._overlay.show(this._elementRef, positionStrategy);
    }

    public hide() {
        this._overlay.hide(this._id);
    }
}
@NgModule({
    declarations: [ IgxOverlayDirective ],
    exports: [ IgxOverlayDirective ],
    providers: [ IgxOverlayService ]
})
export class IgxOverlayModule {}
