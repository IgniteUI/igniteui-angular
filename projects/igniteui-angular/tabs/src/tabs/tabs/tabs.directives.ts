import { Directive } from '@angular/core';

@Directive({
    selector: 'igx-tab-header-label,[igxTabHeaderLabel]',
    standalone: true
})
export class IgxTabHeaderLabelDirective { }

@Directive({
    selector: 'igx-tab-header-icon,[igxTabHeaderIcon]',
    standalone: true
})
export class IgxTabHeaderIconDirective { }
