import { Directive } from '@angular/core';
import { IgxNoTypographyDirective } from 'igniteui-angular/directives';

@Directive({
    selector: '[igxTabHeaderLabel],igx-tab-header-label',
    standalone: true,
    hostDirectives: [IgxNoTypographyDirective]
})
export class IgxTabHeaderLabelDirective { }

@Directive({
    selector: '[igxTabHeaderIcon],igx-tab-header-icon',
    standalone: true
})
export class IgxTabHeaderIconDirective { }
