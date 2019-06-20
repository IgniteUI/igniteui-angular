import { Component, ViewChild, AfterContentInit } from '@angular/core';
import { IgxRadioGroupDirective } from 'igniteui-angular';
import { FormGroup, FormBuilder } from '@angular/forms';

class Person {
    favoriteSeason: string;

    constructor(public name: string, season?: string) {
        if (season) {
            this.favoriteSeason = season;
        }
    }
}

@Component({
    selector: 'app-radio-sample',
    styleUrls: ['radio.sample.css'],
    templateUrl: 'radio.sample.html'
})
export class RadioSampleComponent implements AfterContentInit {
    @ViewChild('radioGroupZZ', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;

    selectedValue: any;

    seasons = [
        'Winter',
        'Spring',
        'Summer',
        'Autumn',
    ];

    personBob: Person = new Person('Bob', this.seasons[2]);

    newPerson: Person;
    personKirk: Person = new Person('Kirk', this.seasons[1]);
    personKirkForm: FormGroup;

    constructor(private _formBuilder: FormBuilder) {
        this._createPersonKirkForm();
    }

    get diagnostic() {
        return JSON.stringify(this.personBob);
    }

    ngAfterContentInit(): void {
        setTimeout(() => this.selectedValue = this.radioGroup.value);
    }

    onBtnClick(evt) {
        this.radioGroup.value = 'Baz';
    }

    onUpdateBtnClick(evt) {
        const formModel = this.personKirkForm.value;

        this.newPerson = new Person(formModel.name as string, formModel.favoriteSeason as string);
    }

    onRadioChange(evt) {
        this.selectedValue = evt.value;
    }

    onSubmit() {
        this.personBob.favoriteSeason = this.seasons[1];
    }

    private _createPersonKirkForm() {
        this.personKirkForm = this._formBuilder.group({
            name: '',
            favoriteSeason: ''
        });

        this.personKirkForm.setValue({
            name: this.personKirk.name,
            favoriteSeason: this.personKirk.favoriteSeason
        });
    }
}
