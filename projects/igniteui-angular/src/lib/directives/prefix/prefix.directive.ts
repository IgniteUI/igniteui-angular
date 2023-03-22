import { NgModule, Directive } from '@angular/core';

/**
 * @hidden
 */
@Directive({
    selector: 'igx-prefix,[igxPrefix],[igxStart]'
})
export class IgxPrefixDirective { }

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxPrefixDirective],
    exports: [IgxPrefixDirective]
})
export class IgxPrefixModule { }
