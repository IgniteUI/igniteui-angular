import { NgModule, Directive, HostBinding, ChangeDetectorRef } from '@angular/core';

@Directive({
    selector: 'igx-prefix,[igxPrefix]'
})
export class IgxPrefixDirective {
    @HostBinding('class.igx-input-group__bundle-prefix')
    public childOfInputGroup = false;

    @HostBinding('class.igx-chip__prefix')
    public childOfChip = false;

    constructor(public cdr: ChangeDetectorRef) { }
}

@NgModule({
    declarations: [IgxPrefixDirective],
    exports: [IgxPrefixDirective]
})
export class IgxPrefixModule { }
