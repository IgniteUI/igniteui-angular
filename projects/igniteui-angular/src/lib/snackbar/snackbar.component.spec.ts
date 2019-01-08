import { Component, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSnackbarComponent, IgxSnackbarModule } from './snackbar.component';

import { configureTestSuite } from '../test-utils/configure-suite';

describe('IgxSnackbar', () => {
    configureTestSuite();
    beforeEach(async(() => {
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

    let fixture, domSnackbar, snackbar;
    beforeEach(async(() => {
        fixture = TestBed.createComponent(SnackbarInitializeTestComponent);
        fixture.detectChanges();
        snackbar = fixture.componentInstance.snackbar;
        domSnackbar = fixture.debugElement.query(By.css('igx-snackbar')).nativeElement;
    }));

    it('should properly initialize properties', () => {
        expect(snackbar.id).toContain('igx-snackbar-');
        expect(snackbar.message).toBeUndefined();
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
        snackbar.show();

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

        snackbar.show();

        fixture.detectChanges();
        expect(snackbar.isVisible).toBeTruthy();
        expect(snackbar.autoHide).toBeFalsy();

        tick(1000);
        fixture.detectChanges();
        expect(snackbar.isVisible).toBeTruthy();
    }));

    it('should trigger on action', () => {
        fixture.componentInstance.text = 'Click';

        spyOn(snackbar.onAction, 'emit');

        snackbar.isVisible = true;
        fixture.detectChanges();

        fixture.debugElement.nativeElement.querySelector('button').click();
        fixture.detectChanges();

        expect(snackbar.onAction.emit).toHaveBeenCalledWith(snackbar);
    });
});

describe('Custom content', () => {
    configureTestSuite();
    beforeEach(async(() => {
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

    let fixture, domSnackbar, snackbar;
    beforeEach(async(() => {
        fixture = TestBed.createComponent(SnackbarCustomContentComponent);
        fixture.detectChanges();
        snackbar = fixture.componentInstance.snackbar;
        domSnackbar = fixture.debugElement.query(By.css('igx-snackbar')).nativeElement;
    }));

    it('should display a message', () => {
        fixture.componentInstance.text = 'Undo';
        snackbar.message = 'Item shown';
        snackbar.isVisible = true;
        fixture.detectChanges();

        expect(domSnackbar.innerText).toContain('Item shown');

        const messageEl = fixture.debugElement.query(By.css('.igx-snackbar__message'));
        expect(messageEl).toBeTruthy('Message is not found');

        const customContent = fixture.debugElement.query(By.css('.igx-snackbar__content'));
        expect(customContent).toBeTruthy('Custom content is not found');

        // Verify the message is displayed on the left side of the custom content
        const messageElRect = (<HTMLElement>messageEl.nativeElement).getBoundingClientRect();
        const customContentRect = (<HTMLElement>customContent.nativeElement).getBoundingClientRect();
        expect(messageElRect.right <= customContentRect.left).toBe(true, 'The message is not on the left of the custom content');
    });

    it('should dispay custom content on the left side of the action button', () => {
        fixture.componentInstance.text = 'Undo';
        snackbar.isVisible = true;
        fixture.detectChanges();

        const customContent = fixture.debugElement.query(By.css('.igx-snackbar__content'));
        expect(customContent).toBeTruthy('Custom content is not found');

        // Verify the custom content element is on the left side of the button
        const button = fixture.debugElement.query(By.css('.igx-snackbar__button'));
        const buttonRect = (<HTMLElement>button.nativeElement).getBoundingClientRect();
        const customContentRect = (<HTMLElement>customContent.nativeElement).getBoundingClientRect();
        expect(customContentRect.right <= buttonRect.left).toBe(true, 'The custom element is not on the left of the button');
    });
});

@Component({
    template: `<igx-snackbar #snackbar [actionText]="text">
               </igx-snackbar>`
})
class SnackbarInitializeTestComponent {
    public text: string;
    @ViewChild(IgxSnackbarComponent) public snackbar: IgxSnackbarComponent;
}

@Component({
    template: `<igx-snackbar #snackbar [actionText]="text">
                    <span class="igx-snackbar__content">Custom content</span>
               </igx-snackbar>`
})
class SnackbarCustomContentComponent {
    public text: string;
    @ViewChild(IgxSnackbarComponent) public snackbar: IgxSnackbarComponent;
}
