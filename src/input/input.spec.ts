import {
  async,
  TestBed,
} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {TextInput, IgInputModule} from './input';


describe('IgInput', function() {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, IgInputModule],
            declarations: [
                InitInput,
                InputWithAttribs,
                InputWithModel,
                DisabledInput
            ]
        })
        .compileComponents();
    }));

    it('Initializes an empty input', () => {
        let fixture = TestBed.createComponent(InitInput);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
    });

    it("Initializes an empty input with attributes", () => {
        let fixture = TestBed.createComponent(InputWithAttribs);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('input')).nativeElement.getAttribute('name')).toBe("username");
        expect(fixture.debugElement.query(By.css('input')).nativeElement.getAttribute('id')).toBe("username");
        expect(fixture.debugElement.query(By.css('label')).nativeElement.textContent.trim()).toBe("Username");
        expect(fixture.debugElement.query(By.css('input')).nativeElement.getAttribute('placeholder')).toBe(fixture.componentInstance.placeholder);
    });

    it('Disabled input, @Input properties testing', () => {
        let fixture = TestBed.createComponent(DisabledInput);
        fixture.detectChanges();

        let instance = fixture.componentInstance;
        let input = instance.igText;
        let el = fixture.debugElement.query(By.css('input')).nativeElement;
        fixture.detectChanges();

        expect(el.getAttribute('disabled')).toBeDefined();

        input.placeholder = 'Placeholder';
        input.name = 'input1';
        input.tabindex = 10;
        input.required = true;

        fixture.detectChanges();

        expect(el.getAttribute('placeholder')).toBe('Placeholder');
        expect(el.getAttribute('name')).toBe('input1');
        expect(el.getAttribute('tabindex')).toBe('10');
        expect(el.getAttribute('required')).toBeDefined();

    });

    it('Bound to data model', () => {

        let fixture = TestBed.createComponent(InputWithModel);
        fixture.detectChanges();

        let instance = fixture.componentInstance;
        let el = fixture.debugElement.query(By.css('input')).nativeElement;

        // https://github.com/angular/angular/issues/10148
        // ngModel is now always asynchronous when updating ergo the mess below

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(el.value).toBe(instance.model);
            });
        });

        instance.model = 'John Doe';
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(el.value).toBe('John Doe');
            });
        });

        el.value = 'Unknown';
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(instance.model).toBe('Unknown');
            });
        });

        instance.igText.value = "John Doe";
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(instance.model).toBe('John Doe');
            });
        });
    });

});

@Component({ template: `<ig-text #input></ig-text>` })
class InitInput {
    @ViewChild('input') igText;
}

@Component({ template: `<ig-text id="username" [placeholder]="placeholder" name="username">Username</ig-text>`})
class InputWithAttribs {
    placeholder = "Please enter a name";
}

@Component({ template: `<ig-text #input [(ngModel)]="model"></ig-text>` })
class InputWithModel {
    @ViewChild('input') igText;
    model ='Jane Doe';
}

@Component({ template: `<ig-text #input [disabled]="true">Disabled</ig-text>` })
class DisabledInput {
    @ViewChild('input') igText;
}