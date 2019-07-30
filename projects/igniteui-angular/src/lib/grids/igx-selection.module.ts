import { Directive, NgModule } from '@angular/core';

@Directive({
    selector: '[igxRowSelector]'
})
export class IgxRowSelectorDirective {
}

@Directive({
    selector: '[igxHeadSelector]'
})
export class IgxHeadSelectorDirective {
}

@NgModule({
    declarations: [IgxRowSelectorDirective, IgxHeadSelectorDirective],
    exports: [IgxRowSelectorDirective, IgxHeadSelectorDirective]
})
export class IgxSelectorsModule {
}
