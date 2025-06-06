import { Component, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSnackbarComponent } from './snackbar.component';
import { useAnimation } from '@angular/animations';
import { HorizontalAlignment, PositionSettings, VerticalAlignment } from '../services/public_api';
import { slideInLeft, slideInRight } from 'igniteui-angular/animations';
import { IgxButtonDirective } from '../directives/button/button.directive';

describe('IgxSnackbar', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                SnackbarInitializeTestComponent,
                SnackbarCustomContentComponent
            ]
        }).compileComponents();
    }));

    let fixture: ComponentFixture<SnackbarInitializeTestComponent>;
    let snackbar: IgxSnackbarComponent;
    let domSnackbar;
    beforeEach(() => {
        fixture = TestBed.createComponent(SnackbarInitializeTestComponent);
        fixture.detectChanges();
        snackbar = fixture.componentInstance.snackbar;
        domSnackbar = fixture.debugElement.query(By.css('igx-snackbar')).nativeElement;
    });

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

    it('should auto hide 1 second after is open', fakeAsync(() => {
        spyOn(snackbar.closing, 'emit');
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
        expect(snackbar.closing.emit).toHaveBeenCalled();
    }));

    it('should not auto hide 1 second after is open', fakeAsync(() => {
        spyOn(snackbar.closing, 'emit');
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
        expect(snackbar.closing.emit).not.toHaveBeenCalled();
        snackbar.close();
    }));

    it('should trigger on action', fakeAsync(() => {
        snackbar.actionText = 'undo';
        snackbar.displayTime = 100;
        spyOn(snackbar.clicked, 'emit');

        snackbar.open();
        tick(100);
        fixture.detectChanges();

        fixture.debugElement.query(By.css('button')).nativeElement.click();
        fixture.detectChanges();

        expect(snackbar.clicked.emit).toHaveBeenCalledWith(snackbar);
    }));

    it('should emit opening when snackbar is shown', fakeAsync(() => {
        spyOn(snackbar.opening, 'emit');
        snackbar.open();
        tick(100);
        expect(snackbar.opening.emit).toHaveBeenCalled();
        snackbar.close();
    }));

    it('should emit onOpened when snackbar is opened', fakeAsync(() => {
        snackbar.displayTime = 100;
        snackbar.autoHide = false;
        spyOn(snackbar.opened, 'emit');
        snackbar.open();
        tick(100);
        fixture.detectChanges();
        expect(snackbar.opened.emit).toHaveBeenCalled();
        snackbar.close();
    }));

    it('should emit closing when snackbar is hidden', () => {
        spyOn(snackbar.closing, 'emit');
        snackbar.open();
        snackbar.close();
        expect(snackbar.closing.emit).toHaveBeenCalled();
    });

    it('should emit onClosed when snackbar is closed', fakeAsync(() => {
        snackbar.displayTime = 100;
        snackbar.autoHide = false;
        spyOn(snackbar.closed, 'emit');
        snackbar.open();
        snackbar.close();
        tick(100);
        fixture.detectChanges();
        expect(snackbar.closed.emit).toHaveBeenCalled();
    }));

    it('should be opened and closed by the toggle method', fakeAsync(() => {
        snackbar.displayTime = 100;
        snackbar.autoHide = false;

        snackbar.toggle();
        tick(100);
        expect(snackbar.isVisible).toBeTrue();
        expect(snackbar.collapsed).toBeFalse();

        snackbar.toggle();
        tick(100);
        expect(snackbar.isVisible).toBeFalse();
        expect(snackbar.collapsed).toBeTrue();
    }));

    it('can set snackbar message through open method', fakeAsync(() => {
        snackbar.displayTime = 100;
        snackbar.autoHide = false;

        snackbar.open('Custom Message');
        tick(100);
        fixture.detectChanges();
        expect(snackbar.isVisible).toBeTruthy();

        expect(snackbar.autoHide).toBeFalsy();
        expect(snackbar.textMessage).toBe('Custom Message');
        snackbar.close();
    }));
    it('should be able to set custom positionSettings', () => {
        const defaultPositionSettings = snackbar.positionSettings;
        const defaulOpenAnimationParams = {duration: '.35s', easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
         fromPosition: 'translateY(100%)', toPosition: 'translateY(0)'};
        expect(defaultPositionSettings.horizontalDirection).toBe(-0.5);
        expect(defaultPositionSettings.verticalDirection).toBe(0);
        expect(defaultPositionSettings.openAnimation.options.params).toEqual(defaulOpenAnimationParams);
        const newPositionSettings: PositionSettings = {
            openAnimation: useAnimation(slideInLeft, { params: { duration: '1000ms' } }),
            closeAnimation: useAnimation(slideInRight, { params: { duration: '1000ms' } }),
            horizontalDirection: HorizontalAlignment.Center,
            verticalDirection: VerticalAlignment.Middle,
            horizontalStartPoint: HorizontalAlignment.Center,
            verticalStartPoint: VerticalAlignment.Middle,
            minSize: { height: 100, width: 100 }
        };
        snackbar.positionSettings = newPositionSettings;
        fixture.detectChanges();
        const customPositionSettings = snackbar.positionSettings;
        expect(customPositionSettings.horizontalDirection).toBe(-0.5);
        expect(customPositionSettings.verticalDirection).toBe(-0.5);
        expect(customPositionSettings.openAnimation.options.params).toEqual({duration: '1000ms'});
        expect(customPositionSettings.minSize).toEqual({height: 100, width: 100});
    });
});

describe('IgxSnackbar with custom content', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                SnackbarCustomContentComponent
            ]
        }).compileComponents();
    }));

    let fixture: ComponentFixture<SnackbarCustomContentComponent>;
    let snackbar: IgxSnackbarComponent;
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

        // Verify the custom button is displayed instead of the snackbar actionText
        const button = fixture.debugElement.query(By.css('.igx-button'));
        expect(button.nativeElement.innerText).toEqual('Read More');
        expect(button.nativeElement.innerText).not.toContain(snackbar.actionText);

        // Verify the message is displayed on the left side of the custom content
        const messageElRect = messageEl.nativeElement.getBoundingClientRect();
        const customContentRect = customContent.nativeElement.getBoundingClientRect();
        expect(messageElRect.left <= customContentRect.left).toBe(true, 'The message is not on the left of the custom content');

        // Verify the custom content element is on the left side of the button
        const buttonRect = button.nativeElement.getBoundingClientRect();
        expect(customContentRect.right <= buttonRect.left).toBe(true, 'The custom element is not on the left of the button');
        expect(messageElRect.right <= buttonRect.left).toBe(true, 'The button is not on the right side of the snackbar content');
        snackbar.close();
    });

    it('should be able to set a message though open method', () => {
        snackbar.autoHide = false;
        fixture.componentInstance.text = 'Retry';
        fixture.detectChanges();

        snackbar.open('The message was not send. Would you like to retry?');
        fixture.detectChanges();

        const messageEl = fixture.debugElement.query(By.css('.igx-snackbar__message'));
        expect(messageEl.nativeElement.innerText).toBe('The message was not send. Would you like to retry? Custom content');
        snackbar.close();

        snackbar.open('Another Message?!');
        fixture.detectChanges();

        expect(snackbar.isVisible).toBe(true);
        expect(messageEl.nativeElement.innerText).toBe('Another Message?! Custom content');
        snackbar.close();
    });
});

@Component({
    template: `<igx-snackbar #snackbar [actionText]="text">
               </igx-snackbar>`,
    imports: [IgxSnackbarComponent]
})
class SnackbarInitializeTestComponent {
    @ViewChild(IgxSnackbarComponent, { static: true }) public snackbar: IgxSnackbarComponent;
    public text: string;
}

@Component({
    template: `<igx-snackbar #snackbar [actionText]="text">
                    <span class="igx-snackbar__content">Custom content</span>
                    <button igxButton>Read More</button>
               </igx-snackbar>`,
    imports: [IgxSnackbarComponent, IgxButtonDirective]
})
class SnackbarCustomContentComponent {
    @ViewChild(IgxSnackbarComponent, { static: true }) public snackbar: IgxSnackbarComponent;
    public text: string;
}
