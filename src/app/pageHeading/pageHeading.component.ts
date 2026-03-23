import {Component, EventEmitter, inject, input, Output, signal, ViewEncapsulation} from '@angular/core';
import { AsyncPipe, KeyValuePipe } from '@angular/common';
import {
    IgxButtonDirective,
    IgxIconButtonDirective,
    IgxIconComponent,
    IgxRippleDirective,
    IgxToggleActionDirective,
    ISelectionEventArgs,
    setCurrentI18n
} from 'igniteui-angular';
import { IgxNavbarComponent, IgxNavbarActionDirective } from 'igniteui-angular/navbar';
import { IgxSelectComponent, IgxSelectItemComponent } from 'igniteui-angular/select';
import { PropertyChangeService } from '../properties-panel/property-change.service';
import { FormsModule } from '@angular/forms';

export type DocumentDirection = 'ltr' | 'rtl';
export type IgSize = 'small' | 'medium' | 'large';

@Component({
    selector: 'app-page-header',
    styleUrls: ['./pageHeading.styles.scss'],
    templateUrl: './pageHeading.template.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        IgxNavbarComponent,
        IgxNavbarActionDirective,
        IgxSelectComponent,
        IgxSelectItemComponent,
        IgxRippleDirective,
        IgxToggleActionDirective,
        IgxIconComponent,
        IgxIconButtonDirective,
        AsyncPipe,
        KeyValuePipe,
        FormsModule,
        IgxButtonDirective,
    ]
})
export class PageHeaderComponent {
    public title = input<string>();
    public dirMode = signal<DocumentDirection>('ltr');
    public locale = 'EN';
    public selectLocales = ['BG', 'EN', 'DE', 'ES', 'FR', 'IT', 'JA', 'KO', 'zh-Hans', 'zh-Hant'];

    public sizeOptions: IgSize[] = ['small', 'medium', 'large'];
    public selectedSize = signal<IgSize>('medium');

    @Output()
    public toggleDirection = new EventEmitter<DocumentDirection>();

    @Output()
    public sizeChange = new EventEmitter<IgSize>();

    public onToggleDirectionClick(): void {
        this.dirMode.update(dir => dir === 'ltr' ? 'rtl' : 'ltr');
        this.toggleDirection.emit(this.dirMode());
    }

    protected propertyChangeService = inject(PropertyChangeService);

    public updateLocale(args: ISelectionEventArgs) {
        this.locale = args.newSelection.value;
        setCurrentI18n(this.locale);
    }

    public updateSize(args: ISelectionEventArgs) {
        this.selectedSize.set(args.newSelection.value);
        this.sizeChange.emit(args.newSelection.value);
    }
}
