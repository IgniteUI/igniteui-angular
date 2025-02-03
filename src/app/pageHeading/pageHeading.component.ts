import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AsyncPipe, KeyValuePipe } from '@angular/common';
import {
    IgxIconButtonDirective,
    IgxIconComponent,
    IgxRippleDirective,
    IgxToggleActionDirective
} from 'igniteui-angular';
import { PropertyChangeService } from '../properties-panel/property-change.service';

export type DocumentDirection = 'ltr' | 'rtl';

@Component({
    selector: 'app-page-header',
    styleUrls: ['./pageHeading.styles.scss'],
    templateUrl: './pageHeading.template.html',
    imports: [
        IgxRippleDirective,
        IgxToggleActionDirective,
        IgxIconComponent,
        IgxIconButtonDirective,
        AsyncPipe,
        KeyValuePipe
    ]
})
export class PageHeaderComponent {
    @Input() public title: string;
    public dirMode: DocumentDirection = 'ltr';

    @Output()
    public toggleDirection = new EventEmitter<DocumentDirection>();

    public onToggleDirectionClick(): void {
        this.dirMode = this.dirMode === 'ltr' ? 'rtl' : 'ltr';
        this.toggleDirection.emit(this.dirMode);
    }

    protected propertyChangeService = inject(PropertyChangeService);
}
