import { Component, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IgxRadioModule, IgxRadioGroupDirective } from './radio-group.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('IgxRadioGroupDirective', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                RadioGroupComponent,
                RadioGroupWithModelComponent
            ],
            imports: [
                IgxRadioModule,
                FormsModule,
                ReactiveFormsModule
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

        var allRequiredButtons = radioInstance.radioButtons.filter((btn) => btn.required);
        expect(allRequiredButtons.length).toEqual(radioInstance.radioButtons.length);

        var allButtonsWithGroupName = radioInstance.radioButtons.filter((btn) => btn.name === radioInstance.name);
        expect(allButtonsWithGroupName.length).toEqual(radioInstance.radioButtons.length);

        var allButtonsWithGroupLabelPos = radioInstance.radioButtons.filter((btn) => btn.labelPosition === radioInstance.labelPosition);
        expect(allButtonsWithGroupLabelPos.length).toEqual(radioInstance.radioButtons.length);

        var buttonWithGroupValue = radioInstance.radioButtons.find((btn) => btn.value === radioInstance.value);
        expect(buttonWithGroupValue).toBeDefined();
        expect(buttonWithGroupValue).toEqual(radioInstance.selected);
    }));

    it('Setting radioGroup\'s properties should affect all radio buttons.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.radioButtons).toBeDefined();

        // name
        radioInstance.name = "newGroupName";
        fixture.detectChanges();

        var allButtonsWithNewName = radioInstance.radioButtons.filter((btn) => btn.name === "newGroupName");
        expect(allButtonsWithNewName.length).toEqual(radioInstance.radioButtons.length);

        // required
        radioInstance.required = true;
        fixture.detectChanges();

        var allRequiredButtons = radioInstance.radioButtons.filter((btn) => btn.required);
        expect(allRequiredButtons.length).toEqual(radioInstance.radioButtons.length);

        // labelPosition
        radioInstance.labelPosition = "after";
        fixture.detectChanges();

        var allAfterButtons = radioInstance.radioButtons.filter((btn) => btn.labelPosition === "after");
        expect(allAfterButtons.length).toEqual(radioInstance.radioButtons.length);

        // disabled
        radioInstance.disabled = true;
        fixture.detectChanges();

        var allDisabledButtons = radioInstance.radioButtons.filter((btn) => btn.disabled);
        expect(allDisabledButtons.length).toEqual(radioInstance.radioButtons.length);
    }));

    it('Set value should change selected property and emit change event.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toBeDefined();
        expect(radioInstance.value).toEqual("Baz");

        expect(radioInstance.selected).toBeDefined();
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.last);

        spyOn(radioInstance.change, 'emit');

        radioInstance.value = "Foo";
        fixture.detectChanges();

        expect(radioInstance.value).toEqual("Foo");
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
        expect(radioInstance.change.emit).toHaveBeenCalled();
    }));

    it('Set selected property should change value and emit change event.', fakeAsync(() => {
        const fixture = TestBed.createComponent(RadioGroupComponent);
        const radioInstance = fixture.componentInstance.radioGroup;

        fixture.detectChanges();
        tick();

        expect(radioInstance.value).toBeDefined();
        expect(radioInstance.value).toEqual("Baz");

        expect(radioInstance.selected).toBeDefined();
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.last);

        spyOn(radioInstance.change, 'emit');

        radioInstance.selected = radioInstance.radioButtons.first;
        fixture.detectChanges();

        expect(radioInstance.value).toEqual("Foo");
        expect(radioInstance.selected).toEqual(radioInstance.radioButtons.first);
        expect(radioInstance.change.emit).toHaveBeenCalled();
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
});

@Component({
    template: `<igx-radiogroup #radioGroup name="radioGroup" value="Baz" required="true" labelPosition="before">
    <igx-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']" value="{{item}}">
        {{item}}
    </igx-radio>
</igx-radiogroup>
`
})
class RadioGroupComponent {
    @ViewChild('radioGroup', { read: IgxRadioGroupDirective }) public radioGroup: IgxRadioGroupDirective;
}

class Person {
    name: string;
    favoriteSeason: string;
}

@Component({
    template: ` <igx-radiogroup #radioGroupSeasons name="radioGroupSeasons" [(ngModel)]="personBob.favoriteSeason">
                    <igx-radio *ngFor="let item of seasons" value="{{item}}">
                        {{item}}
                    </igx-radio>
                </igx-radiogroup>
`
})
class RadioGroupWithModelComponent {
    seasons = [
        'Winter',
        'Spring',
        'Summer',
        'Autumn',
    ];

    @ViewChild('radioGroupSeasons', { read: IgxRadioGroupDirective }) public radioGroup: IgxRadioGroupDirective;

    personBob: Person = { name: 'Bob', favoriteSeason: 'Summer' };
}