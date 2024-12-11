import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective, IgxToggleActionDirective } from 'igniteui-angular';
import { PropertyChangeService } from '../properties-panel/property-change.service';

@Component({
    selector: 'app-page-header',
    styleUrls: ['./pageHeading.styles.scss'],
    templateUrl: './pageHeading.template.html',
    imports: [ IgxRippleDirective, IgxToggleActionDirective, IgxIconComponent, IgxIconButtonDirective, AsyncPipe, KeyValuePipe]
})
export class PageHeaderComponent {
    @Input() public title: string;

    @Input() public dirMode!: string;

    @Output() public toggleDirection = new EventEmitter<void>();
    public onToggleDirectionClick(): void {
        this.toggleDirection.emit();
    }

    protected propertyChangeService = inject(PropertyChangeService);
}
