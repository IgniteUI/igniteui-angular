import { Component, Input } from '@angular/core';
import { IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective, IgxToggleActionDirective } from 'igniteui-angular';


@Component({
    selector: 'app-page-header',
    styleUrls: ['./pageHeading.styles.scss'],
    templateUrl: './pageHeading.template.html',
    imports: [IgxRippleDirective, IgxToggleActionDirective, IgxIconComponent, IgxIconButtonDirective]
})
export class PageHeaderComponent {
    @Input()
    public title: string;
}
