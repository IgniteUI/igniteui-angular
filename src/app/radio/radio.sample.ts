import { Component, ViewChild, AfterContentInit, ViewContainerRef, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxRadioGroupDirective, IgxLayoutDirective, IgxCardComponent, IgxCardHeaderComponent, IgxCardHeaderTitleDirective, IgxCardContentDirective, IgxCardActionsComponent, IgxRippleDirective, IgxButtonDirective, IgxRadioComponent, RadioGroupAlignment } from 'igniteui-angular';
import { RadioGroupComponent } from './radio-group.component';

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
    styleUrls: ['radio.sample.scss'],
    templateUrl: 'radio.sample.html',
    imports: [IgxRadioGroupDirective, FormsModule, IgxLayoutDirective, IgxCardComponent, IgxCardHeaderComponent, IgxCardHeaderTitleDirective, IgxCardContentDirective, IgxCardActionsComponent, IgxRippleDirective, IgxButtonDirective, IgxRadioComponent, ReactiveFormsModule, JsonPipe]
})
export class RadioSampleComponent implements AfterContentInit {
    @ViewChild('radioGroupZZ', { read: IgxRadioGroupDirective, static: true })
    public radioGroup: IgxRadioGroupDirective;
    public disabled = false;
    public invalid = false;

    public selectedValue: any;
    public options = [0, 1, 2, 3, 4];
    public initial = this.options[0];
    public seasons = [
        { name: 'Winter', disabled: false },
        { name: 'Spring', disabled: true },
        { name: 'Summer', disabled: false },
        { name: 'Autumn', disabled: true }
    ];
    public personBob: Person = new Person('Bob', this.seasons[2].name);
    public newPerson: Person;
    public personKirk: Person = new Person('Kirk', this.seasons[1].name);
    public personKirkForm: UntypedFormGroup;
    public alignment: RadioGroupAlignment = RadioGroupAlignment.vertical;
    private viewContainerRef = inject(ViewContainerRef);

    private cdr = inject(ChangeDetectorRef);

    constructor(private _formBuilder: UntypedFormBuilder) {
        this._createPersonKirkForm();
    }

    public createRadioGroupComponent() {
        this.viewContainerRef.clear();

        const componentRef = this.viewContainerRef.createComponent(RadioGroupComponent);
        const radioGroup = componentRef.instance as RadioGroupComponent;

        radioGroup.value = 1;
        radioGroup.required = true;

        radioGroup.radios = [
          { value: 1, label: 'Radio 1' },
          { value: 2, label: 'Radio 2' },
          { value: 3, label: 'Radio 3' },
        ];

        this.cdr.detectChanges();
    }

    public removeRadioGroupComponent() {
        this.viewContainerRef.clear();
        this.cdr.detectChanges();
    }

    public ngAfterContentInit(): void {
        setTimeout(() => this.selectedValue = this.radioGroup.value);
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

    public get diagnostic() {
        return JSON.stringify(this.personBob);
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
        this.personBob.favoriteSeason = this.seasons[1].name;
    }
}
