import { Component, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxSuffixModule, IgxSuffixDirective } from './suffix.directive';
import { IgxInputGroupModule } from '../../input-group/input-group.component';

describe('IgxSuffix', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SuffixComponent,
                InputSuffixComponent
            ],
            imports: [
                IgxSuffixModule,
                IgxInputGroupModule
            ]
        })
        .compileComponents();
    }));

    it('Initializes a suffix.', () => {
        const fixture = TestBed.createComponent(SuffixComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.directive(IgxSuffixDirective))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-input-group__bundle-suffix'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.igx-chip-suffix'))).toBeFalsy();
    });

    it('Initializes a suffix in an input group.', () => {
        const fixture = TestBed.createComponent(InputSuffixComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.directive(IgxSuffixDirective))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-input-group__bundle-suffix'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.igx-chip-suffix'))).toBeFalsy();
    });
});

@Component({
    template: `<igx-suffix>suffix</igx-suffix>`
})
class SuffixComponent {
}

@Component({
    template: `
        <igx-input-group #inputGroup>
            <igx-suffix>suffix</igx-suffix>
            <input igxInput value="read-only" type="text" placeholder="Placeholder" readonly/>
        </igx-input-group>
    `
})
class InputSuffixComponent {
}
