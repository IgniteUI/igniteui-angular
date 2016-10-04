import {
    async,
    TestBed
} from "@angular/core/testing";
import { FormsModule } from '@angular/forms';
import { Component, ViewChildren } from "@angular/core";
import { By } from "@angular/platform-browser";
import { IgRadio } from "./radio";

describe('IgRadio', function() {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitRadio,
                RadioWithModel,
                IgRadio
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

    it('Binding to ngModel', () => {
        let fixture = TestBed.createComponent(RadioWithModel);
        fixture.detectChanges();

        let radios = fixture.componentInstance.radios.toArray();
        fixture.detectChanges();


        expect(radios.length).toEqual(3);
        expect(radios[0].checked).toBe(true);
        fixture.detectChanges();
        expect(fixture.componentInstance.user.favouriteVarName).toEqual("Foo");
    });
});


@Component({ template: `<ig-radio>Radio</ig-radio>` })
class InitRadio {}

@Component({
    template: `
    <ig-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']" value="{{item}}" name="group" [(ngModel)]="user.favouriteVarName">{{item}}</ig-radio>
    `
})
class RadioWithModel {
    @ViewChildren(IgRadio) radios;

    user = {
        favouriteVarName: 'Foo'
    };
}