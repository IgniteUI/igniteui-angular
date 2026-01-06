import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AsyncPipe, KeyValuePipe } from '@angular/common';
import {
    IgxDropDownComponent,
    IgxDropDownItemComponent,
    IgxDropDownItemNavigationDirective,
    IgxIconButtonDirective,
    IgxIconComponent,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxRippleDirective,
    IgxToggleActionDirective,
    ISelectionEventArgs,
    setCurrentI18n
} from 'igniteui-angular';
import { PropertyChangeService } from '../properties-panel/property-change.service';
import { FormsModule } from '@angular/forms';

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
        KeyValuePipe,
        IgxDropDownItemNavigationDirective,
        IgxDropDownComponent,
        IgxDropDownItemComponent,
        IgxInputGroupComponent,
        IgxInputDirective,
        FormsModule,
    ]
})
export class PageHeaderComponent {
    @Input() public title: string;
    public dirMode: DocumentDirection = 'ltr';
    public locale = 'EN';
    public selectLocales = ['BG', 'EN', 'DE', 'ES', 'FR', 'IT', 'JA', 'KO', 'zh-Hans', 'zh-Hant'];

    @Output()
    public toggleDirection = new EventEmitter<DocumentDirection>();

    public onToggleDirectionClick(): void {
        this.dirMode = this.dirMode === 'ltr' ? 'rtl' : 'ltr';
        this.toggleDirection.emit(this.dirMode);
    }

    protected propertyChangeService = inject(PropertyChangeService);


    public updateLocale(args: ISelectionEventArgs) {
        // New API
        this.locale = args.newSelection.value;
        setCurrentI18n(this.locale);
    }
}
