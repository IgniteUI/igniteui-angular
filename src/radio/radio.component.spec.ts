import {
    async,
    TestBed
} from "@angular/core/testing";
import { FormsModule } from '@angular/forms';
import { Component, ViewChildren } from "@angular/core";
import { By } from "@angular/platform-browser";
import { IgxRadio } from './radio.component';

describe('IgRadio', function() {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitRadio,
                RadioWithModel,
                IgxRadio
            ],
            imports: [FormsModule]
        })
        .compileComponents();
    }));

    it('Init a radio', () => {
        let fixture = TestBed.createComponent(InitRadio);
        fixture.detectChanges();

        let nativeRadio = fixture.debugElement.query(By.css('input')).nativeElement;
        let nativeLabel = fixture.debugElement.query(By.css('label')).nativeElement;

        expect(nativeRadio).toBeTruthy();
        expect(nativeRadio.type).toBe('radio');
        expect(nativeLabel).toBeTruthy();
        expect(nativeLabel.textContent.trim()).toEqual('Radio');
    });

    it('Binding to ngModel', async(() => {
        let fixture = TestBed.createComponent(RadioWithModel);
        fixture.detectChanges();

        let radios = fixture.componentInstance.radios.toArray();

        expect(radios.length).toEqual(3);

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(radios[0].checked).toBe(true);

            radios[1].nativeRadio.nativeElement.dispatchEvent(new Event('change'));
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(radios[1].checked).toBe(true);
                expect(radios[0].checked).toBe(false);
                expect(fixture.componentInstance.selected).toEqual('Bar');
            });
        });
    }));
});


@Component({ template: `<igx-radio>Radio</igx-radio>` })
class InitRadio {}

@Component({
    template: `
    <igx-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']" value="{{item}}" name="group" [(ngModel)]="selected">{{item}}</igx-radio>
    `
})
class RadioWithModel {
    @ViewChildren(IgxRadio) radios;

    selected = "Foo";
}