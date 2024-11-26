import { Component, inject, Input } from '@angular/core';
import { NgIf, AsyncPipe, KeyValuePipe } from '@angular/common';
import { IgxButtonDirective, IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective, IgxToggleActionDirective } from 'igniteui-angular';
import { PropertyChangeService } from '../properties-panel/property-change.service';

@Component({
    selector: 'app-page-header',
    styleUrls: ['./pageHeading.styles.scss'],
    templateUrl: './pageHeading.template.html',
    imports: [IgxButtonDirective, IgxRippleDirective, IgxToggleActionDirective, IgxIconComponent, IgxIconButtonDirective, NgIf, AsyncPipe, KeyValuePipe]
})
export class PageHeaderComponent {
    @Input()
    public title: string;

    protected propertyChangeService = inject(PropertyChangeService);
}
