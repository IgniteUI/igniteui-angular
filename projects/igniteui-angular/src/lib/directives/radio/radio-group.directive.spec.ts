import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IgxRadioGroupDirective } from './radio-group.directive';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup, UntypedFormBuilder, FormGroup, FormControl } from '@angular/forms';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { IgxRadioComponent } from '../../radio/radio.component';
import { NgFor } from '@angular/common';

describe('IgxRadioGroupDirective', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                RadioGroupComponent,
                RadioGroupOnPushComponent,
                RadioGroupSimpleComponent,
                RadioGroupWithModelComponent,
                RadioGroupRequiredComponent,
                RadioGroupReactiveFormsComponent,
                RadioGroupDeepProjectionComponent
            ]
        })
        .compileComponents();
    }));

    it('Properly initialize the radio group buttons\' properties.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.radioButtons).toBeDefined();
        expect(radioInstance.radioButtons.length).toEqual(3);

        const allRequiredButtons = radioInstance.radioButtons.filter((btn) => btn.required);
        expect(allRequiredButtons.length).toEqual(radioInstance.radioButtons.length);

        const allButtonsWithGroupName = radioInstance.radioButtons.filter((btn) => btn.name === radioInstance.name);
        expect(allButtonsWithGroupName.length).toEqual(radioInstance.radioButtons.length);

        const buttonWithGroupValue = radioInstance.radioButtons.find((btn) => btn.value === radioInstance.value);
        expect(buttonWithGroupValue).toBeDefined();
        expect(buttonWithGroupValue).toEqual(radioInstance.selected);
    }));

    it('Properly initializes FormControlValue with OnPush change detection strategy', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupOnPushComponent);
        const radioInstance = fixture.componentInstance.radio;

        fixture.detectChanges();
        tick();

        expect(radioInstance.checked).toBeTrue();
    }));

    it('Setting radioGroup\'s properties should affect all radio buttons.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.radioButtons).toBeDefined();

        // name
        radioInstance.name = 'newGroupName';
        fixture.detectChanges();

        const allButtonsWithNewName = radioInstance.radioButtons.filter((btn) => btn.name === 'newGroupName');
        expect(allButtonsWithNewName.length).toEqual(radioInstance.radioButtons.length);

        // required
        radioInstance.required = true;
        fixture.detectChanges();

        const allRequiredButtons = radioInstance.radioButtons.filter((btn) => btn.required);
        expect(allRequiredButtons.length).toEqual(radioInstance.radioButtons.length);

        // invalid
        radioInstance.invalid = true;
        fixture.detectChanges();

        const allInvalidButtons = radioInstance.radioButtons.filter((btn) => btn.invalid);
        expect(allInvalidButtons.length).toEqual(radioInstance.radioButtons.length);
    }));

    it('Set value should change selected property', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toBeDefined();
        expect(radioInstance.value).toEqual('Baz');

        expect(radioInstance.selected).toBeDefined();
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.last);

        spyOn(radioInstance.change, 'emit');

        radioInstance.value = 'Foo';
        fixture.detectChanges();

        expect(radioInstance.value).toEqual('Foo');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
        expect(radioInstance.change.emit).not.toHaveBeenCalled();
    }));

    it('Set selected property should change value', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toBeDefined();
        expect(radioInstance.value).toEqual('Baz');

        expect(radioInstance.selected).toBeDefined();
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.last);

        spyOn(radioInstance.change, 'emit');

        radioInstance.selected = radioInstance.radioButtons.first;
        fixture.detectChanges();

        expect(radioInstance.value).toEqual('Foo');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
        expect(radioInstance.change.emit).not.toHaveBeenCalled();
    }));

    it('Clicking on a radio button should update the model.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupWithModelComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        radioInstance.radioButtons.first.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toEqual('Winter');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
    }));

    it('Updating the model should select a radio button.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupWithModelComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        fixture.componentInstance.personBob.favoriteSeason = 'Winter';
        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toEqual('Winter');
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
    }));

    it('Properly update the model when radio group is hosted in Reactive forms.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupReactiveFormsComponent);

        fixture.detectChanges();
        tick();

        expect(fixture.componentInstance.personForm).toBeDefined();
        expect(fixture.componentInstance.model).toBeDefined();
        expect(fixture.componentInstance.newModel).toBeUndefined();

        fixture.componentInstance.personForm.patchValue({ favoriteSeason: fixture.componentInstance.seasons[0] });
        fixture.componentInstance.updateModel();
        fixture.detectChanges();
        tick();

        expect(fixture.componentInstance.newModel).toBeDefined();
        expect(fixture.componentInstance.newModel.name).toEqual(fixture.componentInstance.model.name);
        expect(fixture.componentInstance.newModel.favoriteSeason).toEqual(fixture.componentInstance.seasons[0]);
    }));

    it('Properly initialize selection when value is falsy in deep content projection', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupDeepProjectionComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.componentInstance.radioGroup;
        expect(radioGroup.value).toEqual(0);
        expect(radioGroup.radioButtons.first.checked).toEqual(true);
    }));

    it('Properly rebind dynamically added components', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupDeepProjectionComponent);
        const radioInstance = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        tick();

        fixture.componentInstance.choices = [ 0, 1, 4, 7 ];
        fixture.detectChanges();
        tick();

        radioInstance.radioButtons.last.nativeLabel.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toEqual(7);
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.last);
    }));

    it('Updates checked radio button correctly', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupSimpleComponent);
        fixture.detectChanges();
        tick();

        const radioGroup = fixture.componentInstance.radioGroup;
        expect(radioGroup.radioButtons.first.checked).toEqual(true);
        expect(radioGroup.radioButtons.last.checked).toEqual(false);

        radioGroup.radioButtons.last.select();
        fixture.detectChanges();
        tick();

        expect(radioGroup.radioButtons.first.checked).toEqual(false);
        expect(radioGroup.radioButtons.last.checked).toEqual(true);
    }));

    it('Should update styles correctly when required radio group\'s value is set.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupRequiredComponent);
        const radioGroup = fixture.componentInstance.radioGroup;
        fixture.detectChanges();
        tick();

        const domRadio = fixture.debugElement.query(By.css('igx-radio')).nativeElement;
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(false);
        expect(radioGroup.selected).toBeUndefined;
        expect(radioGroup.invalid).toBe(false);

        dispatchRadioEvent('keyup', domRadio, fixture);
        expect(domRadio.classList.contains('igx-radio--focused')).toBe(true);
        dispatchRadioEvent('blur', domRadio, fixture);
        fixture.detectChanges();
        tick();

        expect(radioGroup.invalid).toBe(true);
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(true);

        dispatchRadioEvent('keyup', domRadio, fixture);
        expect(domRadio.classList.contains('igx-radio--focused')).toBe(true);

        radioGroup.radioButtons.first.select();
        fixture.detectChanges();
        tick();

        expect(domRadio.classList.contains('igx-radio--checked')).toBe(true);
        expect(radioGroup.invalid).toBe(false);
        expect(radioGroup.radioButtons.first.checked).toEqual(true);
        expect(domRadio.classList.contains('igx-radio--invalid')).toBe(false);
    }));
});

@Component({
    template: `
    <igx-radio-group #radioGroup>
        <igx-radio [checked]="true">Option 1</igx-radio>
        <igx-radio>Option 2</igx-radio>
    </igx-radio-group>
`,
    imports: [IgxRadioGroupDirective, IgxRadioComponent]
})
class RadioGroupSimpleComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;
}

@Component({
    template: `<igx-radio-group #radioGroup name="radioGroup" value="Baz" required="true">
    <igx-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']" value="{{item}}">
        {{item}}
    </igx-radio>
</igx-radio-group>
`,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, NgFor]
})
class RadioGroupComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;
}

@Component({
    template: `<igx-radio-group #radioGroup name="radioGroup" required>
    <igx-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']" value="{{item}}">
        {{item}}
    </igx-radio>
</igx-radio-group>
`,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, NgFor]
})
class RadioGroupRequiredComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;
}

interface Person {
    name: string;
    favoriteSeason: string;
}

@Component({
    template: `
<form [formGroup]="form">
    <igx-radio-group formControlName="radio">
        <igx-radio #checkedRadio value="value1">value1</igx-radio>
        <igx-radio value="value2">value2</igx-radio>
        <igx-radio value="value3">value3</igx-radio>
    </igx-radio-group>
</form>
`,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class RadioGroupOnPushComponent {
    @ViewChild('checkedRadio', { read: IgxRadioComponent, static: true })
    public radio: IgxRadioComponent;

    public form = new FormGroup({
        radio: new FormControl('value1'),
    });
}

@Component({
    template: ` <igx-radio-group #radioGroupSeasons name="radioGroupSeasons" [(ngModel)]="personBob.favoriteSeason">
                    <igx-radio *ngFor="let item of seasons" value="{{item}}">
                        {{item}}
                    </igx-radio>
                </igx-radio-group>
`,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, NgFor, FormsModule]
})
class RadioGroupWithModelComponent {
    @ViewChild('radioGroupSeasons', { read: IgxRadioGroupDirective, static: true }) public radioGroup: IgxRadioGroupDirective;

    public seasons = [
        'Winter',
        'Spring',
        'Summer',
        'Autumn',
    ];

    public personBob: Person = { name: 'Bob', favoriteSeason: 'Summer' };
}

@Component({
    template: `
<form [formGroup]="personForm">
    <igx-radio-group formControlName="favoriteSeason" name="radioGroupReactive">
        <igx-radio *ngFor="let item of seasons" value="{{item}}">
            {{item}}
        </igx-radio>
    </igx-radio-group>
</form>
`,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, NgFor, ReactiveFormsModule]
})
class RadioGroupReactiveFormsComponent {
    public seasons = [
        'Winter',
        'Spring',
        'Summer',
        'Autumn',
    ];

    public newModel: Person;
    public model: Person = { name: 'Kirk', favoriteSeason: this.seasons[1] };
    public personForm: UntypedFormGroup;

    constructor(private _formBuilder: UntypedFormBuilder) {
        this._createForm();
    }

    public updateModel() {
        const formModel = this.personForm.value;

        this.newModel = {
            name: formModel.name as string,
            favoriteSeason: formModel.favoriteSeason as string
        };
    }

    private _createForm() {
        // create form
        this.personForm = this._formBuilder.group({
            name: '',
            favoriteSeason: ''
        });

        // simulate model loading from service
        this.personForm.setValue({
            name: this.model.name,
            favoriteSeason: this.model.favoriteSeason
        });
    }
}

@Component({
    template: `
        <form [formGroup]="group1">
            <igx-radio-group formControlName="favouriteChoice" name="radioGroupReactive">
                <div *ngFor="let choice of choices">
                    <p><igx-radio [value]="choice">{{ choice }}</igx-radio></p>
                </div>
            </igx-radio-group>
        </form>
    `,
    imports: [IgxRadioComponent, IgxRadioGroupDirective, NgFor, ReactiveFormsModule]
})
class RadioGroupDeepProjectionComponent {

    @ViewChild(IgxRadioGroupDirective, { static: true })
    public radioGroup: IgxRadioGroupDirective;

    public choices = [0, 1, 2];
    public group1: UntypedFormGroup;

    constructor(private _builder: UntypedFormBuilder) {
        this._createForm();
    }

    private _createForm() {
        this.group1 = this._builder.group({
            favouriteChoice: 0
        });
    }
}

const dispatchRadioEvent = (eventName, radioNativeElement, fixture) => {
    radioNativeElement.dispatchEvent(new Event(eventName));
    fixture.detectChanges();
};
