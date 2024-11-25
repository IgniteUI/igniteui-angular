import { Component } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxHintDirective } from './hint.directive';

describe('IgxHint', () => {
    configureTestSuite();
    const HINT_START_CSS_CLASS = 'igx-input-group__hint-item--start';
    const HINT_END_CSS_CLASS = 'igx-input-group__hint-item--end';

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HintComponent,
                StartHintComponent,
                EndHintComponent
            ]
        })
        .compileComponents();
    }));

    it('Initializes a hint.', () => {
        const fixture = TestBed.createComponent(HintComponent);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.' + HINT_START_CSS_CLASS))).toBeTruthy();
    });

    it('Initializes a hint with position start.', () => {
        const fixture = TestBed.createComponent(StartHintComponent);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.' + HINT_START_CSS_CLASS))).toBeTruthy();
    });

    it('Initializes a hint with position end.', () => {
        const fixture = TestBed.createComponent(EndHintComponent);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.' + HINT_END_CSS_CLASS))).toBeTruthy();
    });
});

@Component({
    template: `<igx-hint>regular hint</igx-hint>`,
    imports: [IgxHintDirective]
})
class HintComponent {
}

@Component({
    template: `<igx-hint position="start">hin with position start</igx-hint>`,
    imports: [IgxHintDirective]
})
class StartHintComponent {
}

@Component({
    template: `<igx-hint position="end">hint with position end</igx-hint>`,
    imports: [IgxHintDirective]
})
class EndHintComponent {
}
