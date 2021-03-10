import { Component, ViewChild, AfterContentInit } from '@angular/core';
import { IgxRadioGroupDirective, RadioGroupAlignment } from 'igniteui-angular';
import { FormGroup, FormBuilder } from '@angular/forms';

class Person {
    public favoriteSeason: string;

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
    @ViewChild('radioGroupZZ', { read: IgxRadioGroupDirective, static: true })
    public radioGroup: IgxRadioGroupDirective;

    public selectedValue: any;
    public options = [0, 1, 2, 3, 4];
    public initial = this.options[0];
    public seasons = [
        'Winter',
        'Spring',
        'Summer',
        'Autumn',
    ];
    public personBob: Person = new Person('Bob', this.seasons[2]);
    public newPerson: Person;
    public personKirk: Person = new Person('Kirk', this.seasons[1]);
    public personKirkForm: FormGroup;
    public alignment: RadioGroupAlignment = RadioGroupAlignment.vertical;

    constructor(private _formBuilder: FormBuilder) {
        this._createPersonKirkForm();
    }

    public get diagnostic() {
        return JSON.stringify(this.personBob);
    }

    public ngAfterContentInit(): void {
        setTimeout(() => this.selectedValue = this.radioGroup.value);
    }

    public onBtnClick() {
        this.radioGroup.value = 'Baz';
    }

    public onUpdateBtnClick() {
        const formModel = this.personKirkForm.value;

        this.newPerson = new Person(formModel.name as string, formModel.favoriteSeason as string);
    }

    public onRadioChange(evt) {
        this.selectedValue = evt.value;
    }

    public onSubmit() {
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
