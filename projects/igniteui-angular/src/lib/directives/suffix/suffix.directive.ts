import { NgModule, Directive } from '@angular/core';

@Directive({
    selector: 'igx-suffix,[igxSuffix]'
})
export class IgxSuffixDirective { }

@NgModule({
    declarations: [IgxSuffixDirective],
    exports: [IgxSuffixDirective]
})
export class IgxSuffixModule { }
