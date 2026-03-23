import { Component, Signal, Type, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions } from '../../../test-utils/ui-interactions.spec';
import { IDialogCancellableEventArgs, IDialogEventArgs, IgxDialogComponent } from './dialog.component';
import { useAnimation } from '@angular/animations';
import { PositionSettings, HorizontalAlignment, VerticalAlignment } from 'igniteui-angular/core';
import { IgxToggleDirective } from '../../../directives/src/directives/toggle/toggle.directive';
import { IgxDialogActionsDirective, IgxDialogTitleDirective } from './dialog.directives';
import { slideInTop, slideOutBottom } from 'igniteui-angular/animations';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const OVERLAY_MAIN_CLASS = 'igx-overlay';
const OVERLAY_WRAPPER_CLASS = `${OVERLAY_MAIN_CLASS}__wrapper--flex`;
const OVERLAY_MODAL_WRAPPER_CLASS = `${OVERLAY_MAIN_CLASS}__wrapper--modal`;
const CLASS_OVERLAY_CONTENT_MODAL = `${OVERLAY_MAIN_CLASS}__content--modal`;

describe('Dialog', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                AlertComponent,
                DialogComponent,
                CustomDialogComponent,
                NestedDialogsComponent,
                CustomTemplates1DialogComponent,
                CustomTemplates2DialogComponent,
                DialogSampleComponent,
                PositionSettingsDialogComponent,
                DialogTwoWayDataBindingComponent
            ]
        }).compileComponents();
    });

    afterEach(() => {
        UIInteractions.clearOverlay();
        vi.useRealTimers();
    });

    it('Initialize a dialog component with id', () => {
        const { dialog, domDialog, detectChanges } = createComponent(AlertComponent);

        expect(dialog.id).toContain('igx-dialog-');
        expect(domDialog.id).toContain('igx-dialog-');

        dialog.id = 'customDialog';
        detectChanges();

        expect(dialog.id).toBe('customDialog');
        expect(domDialog.id).toBe('customDialog');
    });

    it('Should set dialog title.', () => {
        const { fixture, dialog, detectChanges } = createComponent(AlertComponent);
        const expectedTitle = 'alert';

        dialog.open();
        detectChanges();

        expect(dialog.title).toEqual(expectedTitle);
        const titleDebugElement = fixture.debugElement.query(By.css('.igx-dialog__window-title'));
        expect(titleDebugElement.nativeElement.textContent.trim()).toEqual(expectedTitle);
        dialog.close();
    });

    it('Should set dialog message.', () => {
        const { fixture, dialog, detectChanges } = createComponent(AlertComponent);
        const expectedMessage = 'message';

        dialog.open();
        detectChanges();

        expect(dialog.message).toEqual(expectedMessage);
        const messageDebugElement = fixture.debugElement.query(By.css('.igx-dialog__window-content'));
        expect(messageDebugElement.nativeElement.textContent.trim()).toEqual(expectedMessage);
    });

    it('Should focus focusable elements in dialog on Tab key pressed', () => {
        const { fixture, dialog, detectChanges } = createComponent(DialogComponent);

        dialog.open();
        detectChanges();

        const buttons = fixture.debugElement.queryAll(By.css('button'));
        const toggle = fixture.debugElement.query(By.directive(IgxToggleDirective));

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        detectChanges();
        expect(document.activeElement).toEqual(buttons[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        detectChanges();
        expect(document.activeElement).toEqual(buttons[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        detectChanges();
        expect(document.activeElement).toEqual(buttons[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle, false, true);
        detectChanges();
        expect(document.activeElement).toEqual(buttons[1].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle, false, true);
        detectChanges();
        expect(document.activeElement).toEqual(buttons[0].nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle, false, true);
        detectChanges();
        expect(document.activeElement).toEqual(buttons[1].nativeElement);
    });

    it('should trap focus on dialog modal with non-focusable elements', () => {
        const { fixture, dialog, detectChanges } = createComponent(AlertComponent);

        dialog.leftButtonLabel = '';
        dialog.open();
        detectChanges();

        const toggle = fixture.debugElement.query(By.directive(IgxToggleDirective));

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        detectChanges();
        expect(document.activeElement).toEqual(toggle.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle, false, true);
        detectChanges();
        expect(document.activeElement).toEqual(toggle.nativeElement);

        UIInteractions.triggerEventHandlerKeyDown('Tab', toggle);
        detectChanges();
        expect(document.activeElement).toEqual(toggle.nativeElement);
    });

    it('Should open and close dialog when set values to IsOpen', async () => {
        vi.useFakeTimers();
        const { dialog, detectChanges } = createComponent(AlertComponent);

        dialog.isOpen = true;
        detectChanges();
        await vi.runAllTimersAsync();

        expect(dialog.isOpen).toEqual(true);

        dialog.close();
        detectChanges();
        await vi.runAllTimersAsync();

        expect(dialog.isOpen).toEqual(false);
    });

    it('Should open and close dialog with isOpen two way data binding', async () => {
        vi.useFakeTimers();
        const { fixture, dialog, detectChanges } = createComponent(DialogTwoWayDataBindingComponent);

        fixture.componentInstance.myDialog = true;
        detectChanges();
        await vi.runAllTimersAsync();

        expect(dialog.isOpen).toEqual(true);


        fixture.componentInstance.myDialog = false;

        detectChanges();
        await vi.runAllTimersAsync();
        expect(dialog.isOpen).toEqual(false);
    });

    it('Should set custom modal message.', () => {
        const { fixture, dialog, detectChanges } = createComponent(CustomDialogComponent);

        dialog.open();
        detectChanges();

        const dialogWindow = fixture.debugElement.query(By.css('.igx-dialog__window'));
        const customContent = fixture.debugElement.query(By.css('.custom-dialog__content'));
        expect(customContent).toBeTruthy();
        expect(dialogWindow.children.length).toEqual(2);
        expect(customContent.children.length).toEqual(1);
    });

    it('Should set left and right button properties.', () => {
        const { dialog, detectChanges } = createComponent(DialogComponent);

        detectChanges();

        dialog.open();
        expect(dialog.leftButtonLabel).toEqual('left button');
        expect(dialog.leftButtonType).toEqual('contained');
        expect(dialog.leftButtonRipple).toEqual('pink');

        expect(dialog.rightButtonLabel).toEqual('right button');
        expect(dialog.rightButtonType).toEqual('contained');
        expect(dialog.rightButtonRipple).toEqual('white');
    });

    it('Should execute open/close methods.', async () => {
        vi.useFakeTimers();
        const { dialog, detectChanges} = createComponent(AlertComponent);
        expect(dialog.isOpen).toEqual(false);

        dialog.open();
        detectChanges();
        await vi.runAllTimersAsync();
        expect(dialog.isOpen).toEqual(true);

        dialog.close();
        detectChanges();
        await vi.runAllTimersAsync();
        expect(dialog.isOpen).toEqual(false);
    });

    it('Should set closeOnOutsideSelect.', async () => {
        vi.useFakeTimers();
        const { dialog, domDialog, detectChanges } = createComponent(AlertComponent);

        dialog.open();
        detectChanges();
        await vi.runAllTimersAsync();

        domDialog.click();
        detectChanges();
        await vi.runAllTimersAsync();

        expect(dialog.isOpen).toEqual(false);

        dialog.closeOnOutsideSelect = false;
        dialog.open();
        detectChanges();
        await vi.runAllTimersAsync();

        domDialog.click();
        detectChanges();
        await vi.runAllTimersAsync();

        domDialog.click();
        detectChanges();
        await vi.runAllTimersAsync();
        expect(dialog.isOpen).toEqual(true);
    });

    it('Should test events.', async () => {
        vi.useFakeTimers();
        const { dialog, detectChanges } = createComponent(DialogSampleComponent);
        const args: IDialogEventArgs = {
            dialog,
            event: undefined,
        };
        let cancellableArgs: IDialogCancellableEventArgs = {
            dialog,
            event: null,
            cancel: false
        };

        vi.spyOn(dialog.opening, 'emit');
        vi.spyOn(dialog.opened, 'emit');
        vi.spyOn(dialog.isOpenChange, 'emit');
        vi.spyOn(dialog.closing, 'emit');
        vi.spyOn(dialog.closed, 'emit');

        dialog.open();
        detectChanges();
        await vi.runAllTimersAsync();

        expect(dialog.opening.emit).toHaveBeenCalledWith(cancellableArgs);
        expect(dialog.isOpenChange.emit).toHaveBeenCalledWith(true);
        expect(dialog.opened.emit).toHaveBeenCalled();

        dialog.close();
        detectChanges();
        await vi.runAllTimersAsync();

        cancellableArgs = { dialog, event: undefined, cancel: false };
        expect(dialog.closing.emit).toHaveBeenCalledWith(cancellableArgs);
        expect(dialog.closed.emit).toHaveBeenCalledWith(args);
        expect(dialog.isOpenChange.emit).toHaveBeenCalledWith(false);

        dialog.open();
        detectChanges();
        await vi.runAllTimersAsync();

        const buttons = document.querySelectorAll('button');
        const leftButton = buttons[0];
        const rightButton = buttons[1];

        vi.spyOn(dialog.leftButtonSelect, 'emit');
        dispatchEvent(leftButton, 'click');
        detectChanges();
        expect(dialog.leftButtonSelect.emit).toHaveBeenCalled();

        vi.spyOn(dialog.rightButtonSelect, 'emit');
        dispatchEvent(rightButton, 'click');
        detectChanges();
        await vi.runAllTimersAsync();
        expect(dialog.rightButtonSelect.emit).toHaveBeenCalled();
    });

    it('should set correct ARIA attributes for alert dialog', () => {
        const { dialog, detectChanges } = createComponent(AlertComponent);

        dialog.open();
        detectChanges();
        expect(dialog.role).toEqual('alertdialog');
    });

    it('should set correct ARIA attributes for regular dialog', () => {
        const { fixture, dialog, detectChanges } = createComponent(DialogComponent);

        dialog.open();
        detectChanges();
        expect(dialog.role).toEqual('dialog');
        const titleWrapper = fixture.debugElement.query(By.css('.igx-dialog__window-title'));
        const dialogWindow = fixture.debugElement.query(By.css('.igx-dialog__window'));
        expect(titleWrapper.attributes.id).toEqual(dialogWindow.attributes['aria-labelledby']);
    });

    it('Should close only inner dialog on closeOnOutsideSelect.', async () => {
        vi.useFakeTimers();
        const fixture = TestBed.createComponent(NestedDialogsComponent);
        const detectChanges = () => fixture.changeDetectorRef.detectChanges();

        const mainDialog = fixture.componentInstance.main();
        const childDialog = fixture.componentInstance.child();

        mainDialog.open();
        detectChanges();
        await vi.runAllTimersAsync();

        childDialog.open();
        detectChanges();
        await vi.runAllTimersAsync();

        const dialogs = fixture.debugElement.queryAll(By.css('.igx-dialog'));
        const mainDialogElem = dialogs[0].nativeElement;
        const childDialogElem = dialogs[1].nativeElement;

        childDialogElem.click();
        detectChanges();
        await vi.runAllTimersAsync();

        expect(mainDialog.isOpen).toEqual(true);
        expect(childDialog.isOpen).toEqual(false);

        mainDialogElem.click();
        detectChanges();
        await vi.runAllTimersAsync();

        expect(mainDialog.isOpen).toEqual(false);
        expect(childDialog.isOpen).toEqual(false);
    });

    it('should initialize igx-dialog with custom title and actions', () => {
        const {fixture, dialog, detectChanges } = createComponent(CustomTemplates1DialogComponent);

        dialog.open();
        detectChanges();

        const dialogWindow = fixture.debugElement.query(By.css('.igx-dialog__window'));
        expect(dialogWindow.children.length).toEqual(3);

        expect(dialogWindow.children[0].nativeElement.innerText.toString()).toContain('TITLE');
        expect(dialogWindow.children[2].nativeElement.innerText.toString()).toContain('BUTTONS');
    });

    it('should initialize igx-dialog with custom title and actions using directives', () => {
        const {fixture, dialog, detectChanges } = createComponent(CustomTemplates2DialogComponent);

        dialog.open();
        detectChanges();

        const dialogWindow = fixture.debugElement.query(By.css('.igx-dialog__window'));
        expect(dialogWindow.children.length).toEqual(3);

        expect(dialogWindow.children[0].nativeElement.innerText.toString()).toContain('TITLE');
        expect(dialogWindow.children[2].nativeElement.innerText.toString()).toContain('BUTTONS');
    });

    it('When modal mode is changed, overlay should be informed', async () => {
        vi.useFakeTimers();
        const { fixture, dialog, detectChanges } = createComponent(AlertComponent);

        dialog.open();
        detectChanges
        await vi.runAllTimersAsync();

        let overlayDiv = document.getElementsByClassName(OVERLAY_MAIN_CLASS)[0];
        let overlayWrapper = overlayDiv.children[0];
        expect(overlayWrapper.classList.contains(OVERLAY_WRAPPER_CLASS)).toBe(true);
        expect(overlayWrapper.classList.contains(OVERLAY_MODAL_WRAPPER_CLASS)).toBe(false);

        dialog.close();
        detectChanges();
        await vi.runAllTimersAsync();

        fixture.componentInstance.isModal = true;
        detectChanges();

        dialog.open();
        detectChanges();
        await vi.runAllTimersAsync();

        overlayDiv = document.getElementsByClassName(OVERLAY_MAIN_CLASS)[0];
        overlayWrapper = overlayDiv.children[0];
        expect(overlayWrapper.classList.contains(OVERLAY_MODAL_WRAPPER_CLASS)).toBe(true);
        expect(overlayWrapper.classList.contains(OVERLAY_WRAPPER_CLASS)).toBe(true);
    });

    it('Default button of the dialog is focused after opening the dialog and can be closed with keyboard.', async () => {
        vi.useFakeTimers();
        const { fixture, dialog, detectChanges } = createComponent(DialogComponent);

        dialog.open();
        detectChanges();
        await vi.runAllTimersAsync();

        // Verify dialog is opened and its default right button is focused
        const dialogDOM = fixture.debugElement.query(By.css('.igx-dialog'));
        const rightButton = dialogDOM.queryAll(By.css('button')).filter((b) => b.nativeElement.innerText === 'right button')[0];
        expect(document.activeElement).toBe(rightButton.nativeElement);
        expect(dialog.isOpen).toEqual(true);

        // Press 'escape' key
        UIInteractions.triggerKeyDownEvtUponElem('Escape', document.activeElement);
        detectChanges();
        await vi.runAllTimersAsync();

        // Verify dialog is closed and its default right button is no longer focused
        expect(document.activeElement).not.toBe(rightButton.nativeElement);
        expect(dialog.isOpen).toEqual(false);
    });

    describe('Position settings', () => {
        it('Define different position settings ', async () => {
            vi.useFakeTimers();
            const { fixture, dialog, detectChanges } = createComponent(PositionSettingsDialogComponent);

            const currentElement = fixture.componentInstance;
            dialog.open();
            detectChanges();
            await vi.runAllTimersAsync();

            expect(dialog.isOpen).toEqual(true);
            const firstContentRect = document.getElementsByClassName(CLASS_OVERLAY_CONTENT_MODAL)[0].getBoundingClientRect();
            const middleDialogPosition = document.documentElement.offsetHeight / 2 - firstContentRect.height / 2;
            expect(firstContentRect.left, 'OffsetLeft position check').toEqual(0);
            expect(firstContentRect.top, 'OffsetTop position check').toBeGreaterThanOrEqual(middleDialogPosition - 2);
            expect(firstContentRect.top, 'OffsetTop position check').toBeLessThanOrEqual(middleDialogPosition + 2);

            dialog.close();
            detectChanges();
            await vi.runAllTimersAsync();

            expect(dialog.isOpen).toEqual(false);
            dialog.positionSettings = currentElement.newPositionSettings;
            detectChanges();
            await vi.runAllTimersAsync();

            dialog.open();
            detectChanges();
            await vi.runAllTimersAsync();

            expect(dialog.isOpen).toEqual(true);
            const secondContentRect = document.getElementsByClassName(CLASS_OVERLAY_CONTENT_MODAL)[0].getBoundingClientRect();
            const topDialogPosition = document.documentElement.offsetWidth / 2 - secondContentRect.width / 2;
            expect(secondContentRect.top, 'OffsetTop position check').toEqual(0);
            expect(secondContentRect.left, 'OffsetLeft position check').toBeGreaterThanOrEqual(topDialogPosition - 2);
            expect(secondContentRect.left, 'OffsetLeft position check').toBeLessThanOrEqual(topDialogPosition + 2);

            dialog.close();
            detectChanges();
            await vi.runAllTimersAsync();

            expect(dialog.isOpen).toEqual(false);
        });

        it('Set animation settings', () => {
            const { fixture, dialog, detectChanges } = createComponent(PositionSettingsDialogComponent);
            const currentElement = fixture.componentInstance;

            // Check initial animation settings
            expect((dialog.positionSettings.openAnimation.animation as any).type, 'Animation type is set').toEqual(8);
            expect(dialog.positionSettings.openAnimation.options.params.duration, 'Animation duration is set to 200ms').toEqual('200ms');

            expect((dialog.positionSettings.closeAnimation.animation as any).type, 'Animation type is set').toEqual(8);
            expect(dialog.positionSettings.closeAnimation.options.params.duration, 'Animation duration is set to 200ms').toEqual('200ms');

            dialog.positionSettings = currentElement.animationSettings;
            detectChanges();

            // Check the new animation settings
            expect(dialog.positionSettings.openAnimation.options.params.duration, 'Animation duration is set to 800ms').toEqual('800ms');
            expect(dialog.positionSettings.closeAnimation.options.params.duration, 'Animation duration is set to 700ms').toEqual('700ms');
        });
    });

    const dispatchEvent = (element: HTMLElement, eventType: string) => {
        const event = new Event(eventType);
        element.dispatchEvent(event);
    };
});

@Component({
    template: `
    <div>
        <igx-dialog
            title="alert"
            message="message"
            closeOnOutsideSelect="true"
            leftButtonLabel="OK"
            [isModal]="isModal">
        </igx-dialog>
    </div>`,
    imports: [IgxDialogComponent]
})
class AlertComponent {
    public dialog = viewChild.required(IgxDialogComponent);
    public isModal = false;
}

@Component({
    template: `
    <div>
        <igx-dialog title="dialog" message="message"
            leftButtonLabel="left button"
            leftButtonType="contained"
            leftButtonRipple="pink"
            rightButtonLabel="right button"
            rightButtonType="contained"
            rightButtonRipple="white">
        </igx-dialog>
    </div>`,
    imports: [IgxDialogComponent]
})
class DialogComponent {
    public dialog = viewChild.required(IgxDialogComponent);
}

@Component({
    template: `
    <div>
        <igx-dialog title="dialog" message="message"
            [(isOpen)]="myDialog"
            leftButtonLabel="left button"
            leftButtonType="contained"
            leftButtonRipple="pink"
            rightButtonLabel="right button"
            rightButtonType="contained"
            rightButtonRipple="white">
        </igx-dialog>
    </div>`,
    imports: [IgxDialogComponent]
})
class DialogTwoWayDataBindingComponent {
    public dialog = viewChild.required(IgxDialogComponent);
    public myDialog = false;
}

@Component({
    template: `
    <div>
        <igx-dialog
            leftButtonLabel="left button"
            leftButtonType="contained"
            leftButtonRipple="pink"
            rightButtonLabel="right button"
            rightButtonType="contained"
            rightButtonRipple="white">
            <div class="custom-sample">
                <h2>Custom Sample</h2>
            </div>
        </igx-dialog>
    </div>`,
    imports: [IgxDialogComponent]
})
class DialogSampleComponent {
    public dialog = viewChild.required(IgxDialogComponent);
}
@Component({
    template: `
    <div>
        <igx-dialog title="custom-dialog">
            <div class="custom-dialog__content">
                <input class="custom-dialog__content-input" type="text" />
            </div>
        </igx-dialog>
    <div>`,
    imports: [IgxDialogComponent]
})
class CustomDialogComponent {
    public dialog = viewChild.required(IgxDialogComponent);
}

@Component({
    template: `
    <igx-dialog #main
        title="Main Dialog"
        leftButtonLabel="Cancel"
        rightButtonLabel="Sign In"
        [closeOnOutsideSelect]="true">

        <igx-dialog #child
            title="Child Dialog"
            leftButtonLabel="Cancel"
            rightButtonLabel="Sign In"
            [closeOnOutsideSelect]="true">
        </igx-dialog>
    </igx-dialog>`,
    imports: [IgxDialogComponent]
})
class NestedDialogsComponent {
    public child = viewChild.required('child', { read: IgxDialogComponent });
    public main = viewChild.required('main', { read: IgxDialogComponent });
}

@Component({
    template: `
    <igx-dialog>
        <igx-dialog-title>
            <div>TITLE 1</div>
        </igx-dialog-title>
        <igx-dialog-actions>
            <div>BUTTONS 1</div>
        </igx-dialog-actions>
    </igx-dialog>`,
    imports: [IgxDialogComponent, IgxDialogTitleDirective, IgxDialogActionsDirective]
})
class CustomTemplates1DialogComponent {
    public dialog = viewChild.required(IgxDialogComponent);
}

@Component({
    template: `
    <igx-dialog>
        <div igxDialogTitle>TITLE 2</div>
        <div igxDialogActions>BUTTONS 2</div>
    </igx-dialog>`,
    imports: [IgxDialogComponent, IgxDialogTitleDirective, IgxDialogActionsDirective]
})
class CustomTemplates2DialogComponent {
    public dialog = viewChild.required(IgxDialogComponent);
}


@Component({
    template: `
    <igx-dialog title="Notification" message="Your email has been sent successfully!" leftButtonLabel="OK"
        [positionSettings]="positionSettings" >
    </igx-dialog>`,
    imports: [IgxDialogComponent]
})
class PositionSettingsDialogComponent {
    public dialog = viewChild.required(IgxDialogComponent);

    public positionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Left,
        verticalDirection: VerticalAlignment.Middle,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Middle,
        openAnimation: useAnimation(slideInTop, { params: { duration: '200ms' } }),
        closeAnimation: useAnimation(slideOutBottom, { params: { duration: '200ms' } })
    };

    public newPositionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Top
    };

    public animationSettings: PositionSettings = {
        openAnimation: useAnimation(slideInTop, { params: { duration: '800ms' } }),
        closeAnimation: useAnimation(slideOutBottom, { params: { duration: '700ms' } })
    };
}

function createComponent<T extends { dialog: Signal<IgxDialogComponent> }>(component: Type<T>) {
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();


    return {
        fixture,
        dialog: fixture.componentInstance.dialog(),
        domDialog: fixture.debugElement.query(By.css('igx-dialog')).nativeElement,
        detectChanges: () => fixture.changeDetectorRef.detectChanges()
    };
}
