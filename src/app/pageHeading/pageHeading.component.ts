import { Component, Input } from '@angular/core';
import { IgxButtonDirective, IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective, IgxToggleActionDirective } from 'igniteui-angular';


@Component({
    selector: 'app-page-header',
    styleUrls: ['./pageHeading.styles.scss'],
    templateUrl: './pageHeading.template.html',
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective, IgxToggleActionDirective, IgxIconComponent, IgxIconButtonDirective]
})
export class PageHeaderComponent {
    @Input()
    public title: string;
}
