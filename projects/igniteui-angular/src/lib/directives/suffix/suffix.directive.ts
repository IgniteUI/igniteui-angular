import { NgModule, Directive, HostBinding, ChangeDetectorRef } from '@angular/core';

@Directive({
    selector: 'igx-suffix,[igxSuffix]'
})
export class IgxSuffixDirective {
    @HostBinding('class.igx-input-group__bundle-suffix')
    public childOfInputGroup = false;

    @HostBinding('class.igx-chip__suffix')
    public childOfChip = false;

    constructor(public cdr: ChangeDetectorRef) { }
}

@NgModule({
    declarations: [IgxSuffixDirective],
    exports: [IgxSuffixDirective]
})
export class IgxSuffixModule { }
