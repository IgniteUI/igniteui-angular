import { NgModule, Directive } from '@angular/core';

@Directive({
    selector: 'igx-prefix,[igxPrefix]'
})
export class IgxPrefixDirective { }

@NgModule({
    declarations: [IgxPrefixDirective],
    exports: [IgxPrefixDirective]
})
export class IgxPrefixModule { }
