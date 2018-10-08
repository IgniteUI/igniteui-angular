import { NgModule, Directive, HostBinding, ViewContainerRef } from '@angular/core';
import { IgxChipComponent } from '../../chips';
import { IgxInputGroupComponent } from '../../input-group';

@Directive({
    selector: 'igx-prefix,[igxPrefix]'
})
export class IgxPrefixDirective {
    @HostBinding('class.igx-input-group__bundle-prefix')
    public childOfInputGroup = false;

    @HostBinding('class.igx-chip-prefix')
    public childOfChip = false;

    constructor(private _viewContainerRef: ViewContainerRef) {
        this.childOfChip = !!this._viewContainerRef.parentInjector.get(IgxChipComponent, null);
        this.childOfInputGroup = !!this._viewContainerRef.parentInjector.get(IgxInputGroupComponent, null);
    }
}

@NgModule({
    declarations: [IgxPrefixDirective],
    exports: [IgxPrefixDirective]
})
export class IgxPrefixModule { }
