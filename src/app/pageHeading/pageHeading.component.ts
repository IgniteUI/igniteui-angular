import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxButtonDirective, IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective, IgxToggleActionDirective } from 'igniteui-angular';
import { PropertyChangeService } from '../properties-panel/property-change.service';

@Component({
    selector: 'app-page-header',
    styleUrls: ['./pageHeading.styles.scss'],
    templateUrl: './pageHeading.template.html',
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective, IgxToggleActionDirective, IgxIconComponent, IgxIconButtonDirective, CommonModule]
})
export class PageHeaderComponent {
    @Input()
    public title: string;

    protected propertyChangeService = inject(PropertyChangeService);
}
