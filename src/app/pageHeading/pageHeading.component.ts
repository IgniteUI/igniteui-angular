import {Component, EventEmitter, inject, Input, Output, signal} from '@angular/core';
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

    public dirMode: 'ltr' | 'rtl' = 'ltr';

    @Output() public toggleDirection = new EventEmitter<'ltr' | 'rtl'>();

    public onToggleDirectionClick(): void {
        this.dirMode = this.dirMode === 'ltr' ? 'rtl' : 'ltr';
        this.toggleDirection.emit(this.dirMode);
    }

    protected propertyChangeService = inject(PropertyChangeService);
}
