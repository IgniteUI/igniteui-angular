import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, required, FormField, disabled } from '@angular/forms/signals';
import {
    IgxCheckboxComponent,
    IgxSwitchComponent,
    IgxRadioComponent,
    IgxRadioGroupDirective,
    IgxSliderComponent,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxComboComponent,
    IgxSimpleComboComponent,
    IgxDatePickerComponent,
    IgxDateRangePickerComponent,
    IgxTimePickerComponent,
    IgxCalendarComponent,
    IgxInputGroupComponent,
    IgxInputDirective,
    IgxLabelDirective,
    IgxHintDirective,
    IgxButtonDirective,
    IgxRippleDirective,
    DateRange,
} from 'igniteui-angular';

interface SignalFormModel {
    fullName: string;
    acceptTerms: boolean;
    enableNotifications: boolean;
    priority: string;
    volume: number;
    movie: string;
    genres: string[];
    country: string;
    birthDate: Date;
    dateRange: DateRange;
    meetingTime: Date;
    calendarDate: Date;
}

@Component({
    selector: 'app-signal-forms',
    templateUrl: 'signal-forms-sample.component.html',
    styleUrls: ['signal-forms-sample.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        JsonPipe,
        FormField,
        IgxCheckboxComponent,
        IgxSwitchComponent,
        IgxRadioComponent,
        IgxRadioGroupDirective,
        IgxSliderComponent,
        IgxSelectComponent,
        IgxSelectItemComponent,
        IgxComboComponent,
        IgxSimpleComboComponent,
        IgxDatePickerComponent,
        IgxDateRangePickerComponent,
        IgxTimePickerComponent,
        IgxCalendarComponent,
        IgxInputGroupComponent,
        IgxInputDirective,
        IgxLabelDirective,
        IgxHintDirective,
        IgxButtonDirective,
        IgxRippleDirective,
    ],
})
export class SignalFormsSampleComponent {
    protected model = signal<SignalFormModel>({
        fullName: '',
        acceptTerms: false,
        enableNotifications: true,
        priority: 'medium',
        volume: 50,
        movie: '',
        genres: [],
        country: '',
        birthDate: null,
        dateRange: null,
        meetingTime: null,
        calendarDate: null,
    });

    protected signalForm = form(this.model, (root) => {
        required(root.fullName);
        required(root.movie);
        disabled(root.enableNotifications, ({valueOf}) => !valueOf(root.acceptTerms));
        disabled(root.fullName, ({valueOf}) => !valueOf(root.acceptTerms));
        disabled(root.movie, ({valueOf}) => !valueOf(root.acceptTerms));
    });

    protected movies = ['The Matrix', 'Inception', 'Interstellar', 'The Dark Knight', 'Fight Club'];

    protected genres = [
        'Action', 'Adventure', 'Comedy', 'Crime', 'Drama',
        'Biography', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
    ];

    protected countries = [
        'United States', 'United Kingdom', 'Germany', 'France',
        'Japan', 'Canada', 'Australia', 'Brazil',
    ];

    protected onSubmit(): void {
        console.log('Signal form model:', this.model());
        console.log('Form valid:', this.signalForm().valid());
    }

    protected onReset(): void {
        this.model.set({
            fullName: '',
            acceptTerms: false,
            enableNotifications: true,
            priority: 'medium',
            volume: 50,
            movie: '',
            genres: [],
            country: '',
            birthDate: null,
            dateRange: null,
            meetingTime: null,
            calendarDate: null,
        });
    }
}
