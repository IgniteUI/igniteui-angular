import { NgModule, Directive } from '@angular/core';

/**
 * @hidden
 */
@Directive({
    selector: 'igx-suffix,[igxSuffix]'
})
export class IgxSuffixDirective { }

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxSuffixDirective],
    exports: [IgxSuffixDirective]
})
export class IgxSuffixModule { }
