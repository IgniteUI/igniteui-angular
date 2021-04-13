import { Component, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSnackbarComponent, IgxSnackbarModule } from './snackbar.component';

import { configureTestSuite } from '../test-utils/configure-suite';

describe('IgxSnackbar', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                SnackbarInitializeTestComponent,
                SnackbarCustomContentComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxSnackbarModule
            ]
        }).compileComponents();
    }));

    let fixture; let domSnackbar; let snackbar;
    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(SnackbarInitializeTestComponent);
        fixture.detectChanges();
        snackbar = fixture.componentInstance.snackbar;
        domSnackbar = fixture.debugElement.query(By.css('igx-snackbar')).nativeElement;
    }));

    it('should properly initialize properties', () => {
        expect(snackbar.id).toContain('igx-snackbar-');
        expect(snackbar.actionText).toBeUndefined();
        expect(snackbar.displayTime).toBe(4000);
        expect(snackbar.autoHide).toBeTruthy();
        expect(snackbar.isVisible).toBeFalsy();

        expect(domSnackbar.id).toContain('igx-snackbar-');
        snackbar.id = 'customId';
        fixture.detectChanges();

        expect(snackbar.id).toBe('customId');
        expect(domSnackbar.id).toBe('customId');
    });

    it('should auto hide 1 seconds after is open', fakeAsync(() => {
        const displayTime = 1000;
        snackbar.displayTime = displayTime;
        fixture.detectChanges();
        snackbar.open();

        fixture.detectChanges();
        expect(snackbar.isVisible).toBeTruthy();
        expect(snackbar.autoHide).toBeTruthy();

        tick(1000);
        fixture.detectChanges();
        expect(snackbar.isVisible).toBeFalsy();
    }));

    it('should not auto hide seconds after is open', fakeAsync(() => {
        const displayTime = 1000;
        snackbar.displayTime = displayTime;
        snackbar.autoHide = false;

        snackbar.open();

        fixture.detectChanges();
        expect(snackbar.isVisible).toBeTruthy();
        expect(snackbar.autoHide).toBeFalsy();

        tick(1000);
        fixture.detectChanges();
        expect(snackbar.isVisible).toBeTruthy();
    }));

    it('should trigger on action', () => {
        fixture.componentInstance.text = 'Click';

        spyOn(snackbar.clicked, 'emit');

        snackbar.isVisible = true;
        fixture.detectChanges();

        fixture.debugElement.nativeElement.querySelector('button').click();
        fixture.detectChanges();

        expect(snackbar.clicked.emit).toHaveBeenCalledWith(snackbar);
    });
});

describe('IgxSnackbar with custom content', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                SnackbarCustomContentComponent
            ],
            imports: [
                BrowserAnimationsModule,
                IgxSnackbarModule
            ]
        }).compileComponents();
    }));

    let fixture; let snackbar;
    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(SnackbarCustomContentComponent);
        fixture.detectChanges();
        snackbar = fixture.componentInstance.snackbar;
    }));

    it('should display a message, a custom content element and a button', () => {
        fixture.componentInstance.text = 'Undo';
        snackbar.open('Item shown');
        fixture.detectChanges();

        const messageEl = fixture.debugElement.query(By.css('.igx-snackbar__message'));
        expect(messageEl.nativeElement.innerText).toContain('Item shown');

        const customContent = fixture.debugElement.query(By.css('.igx-snackbar__content'));
        expect(customContent).toBeTruthy('Custom content is not found');

        // Verify the message is displayed on the left side of the custom content
        const messageElRect = messageEl.nativeElement.getBoundingClientRect();
        const customContentRect = customContent.nativeElement.getBoundingClientRect();
        expect(messageElRect.left <= customContentRect.left).toBe(true, 'The message is not on the left of the custom content');

        // Verify the custom content element is on the left side of the button
        const button = fixture.debugElement.query(By.css('.igx-snackbar__button'));
        const buttonRect = button.nativeElement.getBoundingClientRect();
        expect(customContentRect.right <= buttonRect.left).toBe(true, 'The custom element is not on the left of the button');
        expect(messageElRect.right <= buttonRect.left).toBe(true, 'The button is not on the right side of the snackbar content');
    });

    it('should be able to set a message though show method', () => {
        snackbar.autoHide = false;
        fixture.componentInstance.text = 'Retry';
        fixture.detectChanges();

        snackbar.open('The message was not send. Would you like to retry?');
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.igx-snackbar__message').innerText)
        .toBe('The message was not send. Would you like to retry? Custom content');

        snackbar.open('Another Message?!');
        fixture.detectChanges();

        expect(snackbar.isVisible).toBe(true);
        expect(fixture.nativeElement.querySelector('.igx-snackbar__message').innerText)
        .toBe('Another Message?! Custom content');
    });
});

@Component({
    template: `<igx-snackbar #snackbar [actionText]="text">
               </igx-snackbar>`
})
class SnackbarInitializeTestComponent {
    @ViewChild(IgxSnackbarComponent, { static: true }) public snackbar: IgxSnackbarComponent;
    public text: string;
}

@Component({
    template: `<igx-snackbar #snackbar [actionText]="text">
                    <span class="igx-snackbar__content">Custom content</span>
               </igx-snackbar>`
})
class SnackbarCustomContentComponent {
    @ViewChild(IgxSnackbarComponent, { static: true }) public snackbar: IgxSnackbarComponent;
    public text: string;
}
