import { Component, ViewChild } from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxButtonDirective } from './button.directive';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('IgxButton', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitButtonComponent,
                ButtonWithAttribsComponent,
                IgxButtonDirective
            ]
        })
        .compileComponents();
    }));

    it('Initializes a button', () => {
        const fixture = TestBed.createComponent(InitButtonComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('span.igx-button--flat'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('i.material-icons'))).toBeTruthy();
    });

    it('Button with properties', () => {
        const fixture = TestBed.createComponent(ButtonWithAttribsComponent);
        fixture.detectChanges();

        const button = fixture.debugElement.query(By.css('span')).nativeElement;

        expect(button).toBeTruthy();
        expect(button.classList.contains('igx-button--raised')).toBe(true);
        expect(button.classList.contains('igx-button--disabled')).toBe(true);

        fixture.componentInstance.disabled = false;
        fixture.detectChanges();

        expect(button.classList.contains('igx-button--disabled')).toBe(false);
        expect(button.style.color).toEqual('white');
        expect(button.style.background).toEqual('black');

        fixture.componentInstance.foreground = 'yellow';
        fixture.componentInstance.background = 'green';
        fixture.detectChanges();

        expect(button.style.color).toEqual('yellow');
        expect(button.style.background).toEqual('green');
    });
});

@Component({
    template:
    `<span igxButton="flat" igx-ripple="white">
        <i class="material-icons">add</i>
    </span>`
})
class InitButtonComponent {
}

@Component({
    template:
    `<span igxButton="raised"
        [igxButtonColor]="foreground"
        [igxButtonBackground]="background"
        [disabled]="disabled">Test</span>`
})
class ButtonWithAttribsComponent {
    public disabled = true;
    public foreground = 'white';
    public background = 'black';
}
