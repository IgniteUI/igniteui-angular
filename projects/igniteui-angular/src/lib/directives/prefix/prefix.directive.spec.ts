import { Component, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxPrefixModule, IgxPrefixDirective } from './prefix.directive';
import { IgxInputGroupModule } from '../../input-group/input-group.component';

describe('IgxPrefix', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PrefixComponent,
                InputPrefixComponent
            ],
            imports: [
                IgxPrefixModule,
                IgxInputGroupModule
            ]
        })
        .compileComponents();
    }));

    it('Initializes a prefix.', () => {
        const fixture = TestBed.createComponent(PrefixComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.directive(IgxPrefixDirective))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-input-group__bundle-prefix'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.igx-chip-prefix'))).toBeFalsy();
    });

    it('Initializes a prefix in an input group.', () => {
        const fixture = TestBed.createComponent(InputPrefixComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.directive(IgxPrefixDirective))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-input-group__bundle-prefix'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-chip-prefix'))).toBeFalsy();
    });
});

@Component({
    template: `<igx-prefix>prefix</igx-prefix>`
})
class PrefixComponent {
}

@Component({
    template: `
        <igx-input-group #inputGroup>
            <igx-prefix>prefix</igx-prefix>
            <input igxInput value="read-only" type="text" placeholder="Placeholder" readonly/>
        </igx-input-group>
    `
})
class InputPrefixComponent {
}
