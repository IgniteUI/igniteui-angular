import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxSelectComponent, IgxSelectGroupComponent, IgxSelectItemComponent, IgxLabelDirective, IgxSelectToggleIconDirective, IgxIconComponent, IgxInputGroupComponent, IgxInputDirective, IgxSuffixDirective, IgxPrefixDirective, IgxHintDirective, IgxComboComponent, IgxDatePickerComponent, IgxTimePickerComponent, IgxButtonDirective, IgxRippleDirective } from 'igniteui-angular';

@Component({
    selector: 'app-reactive-form',
    styleUrls: ['reactive-form-sample.component.scss'],
    templateUrl: 'reactive-form-sample.component.html',
    imports: [FormsModule, ReactiveFormsModule, IgxSelectComponent, NgFor, IgxSelectGroupComponent, IgxSelectItemComponent, IgxLabelDirective, IgxSelectToggleIconDirective, IgxIconComponent, IgxInputGroupComponent, IgxInputDirective, IgxSuffixDirective, IgxPrefixDirective, IgxHintDirective, IgxComboComponent, IgxDatePickerComponent, IgxTimePickerComponent, IgxButtonDirective, IgxRippleDirective]
})
export class ReactiveFormSampleComponent {
    public genres = [];
    public user: UntypedFormGroup;

    constructor(fb: UntypedFormBuilder) {
        this.user = fb.group({
            // date: ['', Validators.required],
            date: ['', { validators: Validators.required, updateOn: 'blur' }],
            dateTime: ['', Validators.required],
            email: ['', Validators.required],
            fullName: new UntypedFormControl('', Validators.required),
            genres: [''],
            movie: ['', Validators.required],
            phone: ['']
        });

        this.genres = [
            { type: 'Action', movies: ['The Matrix', 'Kill Bill: Vol.1', 'The Dark Knight Rises'] },
            { type: 'Adventure', movies: ['Interstellar', 'Inglourious Basterds', 'Inception'] },
            {
                type: 'Comedy', movies: ['Wild Tales', 'In Bruges', 'Three Billboards Outside Ebbing, Missouri',
                    'Untouchable', '3 idiots']
            },
            { type: 'Crime', movies: ['Training Day', 'Heat', 'American Gangster'] },
            { type: 'Drama', movies: ['Fight Club', 'A Beautiful Mind', 'Good Will Hunting', 'City of God'] },
            { type: 'Biography', movies: ['Amadeus', 'Bohemian Rhapsody'] },
            { type: 'Mystery', movies: ['The Prestige', 'Memento', 'Cloud Atlas'] },
            { type: 'Musical', movies: ['All That Jazz'] },
            { type: 'Romance', movies: ['Love Actually', 'In The Mood for Love'] },
            { type: 'Sci-Fi', movies: ['The Fifth Element'] },
            { type: 'Thriller', movies: ['The Usual Suspects'] },
            { type: 'Western', movies: ['Django Unchained'] }];

    }

    public onSubmit() {
        console.log(this.user);
    }
}
