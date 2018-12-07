import { Component, DebugElement, ElementRef, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { IDialogEventArgs, IgxDialogComponent, IgxDialogModule } from './dialog.component';
import { configureTestSuite } from '../test-utils/configure-suite';

const OVERLAY_MAIN_CLASS = 'igx-overlay';
const OVERLAY_WRAPPER_CLASS = `${OVERLAY_MAIN_CLASS}__wrapper`;
const OVERLAY_MODAL_WRAPPER_CLASS = `${OVERLAY_WRAPPER_CLASS}--modal`;

describe('Dialog', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AlertComponent,
                DialogComponent,
                CustomDialogComponent,
                NestedDialogsComponent,
                CustomTemplates1DialogComponent,
                CustomTemplates2DialogComponent,
                DialogSampleComponent
            ],
            imports: [BrowserAnimationsModule, NoopAnimationsModule, IgxDialogModule]
        }).compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    it('Initialize a datepicker component with id', () => {
        const fixture = TestBed.createComponent(AlertComponent);
        fixture.detectChanges();

        const dialog = fixture.componentInstance.dialog;
        const domDialog = fixture.debugElement.query(By.css('igx-dialog')).nativeElement;

        expect(dialog.id).toContain('igx-dialog-');
        expect(domDialog.id).toContain('igx-dialog-');

        dialog.id = 'customDialog';
        fixture.detectChanges();

        expect(dialog.id).toBe('customDialog');
        expect(domDialog.id).toBe('customDialog');
    });

    it('Should set dialog title.', () => {
        const fixture = TestBed.createComponent(AlertComponent);
        const dialog = fixture.componentInstance.dialog;
        const expectedTitle = 'alert';

        dialog.open();
        fixture.detectChanges();

        expect(dialog.title).toEqual(expectedTitle);
        const titleDebugElement = fixture.debugElement.query(By.css('.igx-dialog__window-title'));
        expect(titleDebugElement.nativeElement.textContent.trim()).toEqual(expectedTitle);
        dialog.close();
    });

    it('Should set dialog message.', () => {
        const fixture = TestBed.createComponent(AlertComponent);
        const dialog = fixture.componentInstance.dialog;
        const expectedMessage = 'message';

        dialog.open();
        fixture.detectChanges();

        expect(dialog.message).toEqual(expectedMessage);
        const messageDebugElement = fixture.debugElement.query(By.css('.igx-dialog__window-content'));
        expect(messageDebugElement.nativeElement.textContent.trim()).toEqual(expectedMessage);
    });

    it('Should set custom modal message.', () => {
        const fixture = TestBed.createComponent(CustomDialogComponent);
        const dialog = fixture.componentInstance.dialog;

        dialog.open();
        fixture.detectChanges();

        const dialogWindow = fixture.debugElement.query(By.css('.igx-dialog__window'));
        const customContent = fixture.debugElement.query(By.css('.custom-dialog__content'));
        expect(customContent).toBeTruthy();
        expect(dialogWindow.children.length).toEqual(2);
        expect(customContent.children.length).toEqual(1);
    });

    it('Should set left and right button properties.', () => {
        const fixture = TestBed.createComponent(DialogComponent);
        const dialog = fixture.componentInstance.dialog;

        fixture.detectChanges();

        dialog.open();
        expect(dialog.leftButtonLabel).toEqual('left button');
        expect(dialog.leftButtonType).toEqual('raised');
        expect(dialog.leftButtonColor).toEqual('black');
        expect(dialog.leftButtonBackgroundColor).toEqual('darkblue');
        expect(dialog.leftButtonRipple).toEqual('pink');

        expect(dialog.rightButtonLabel).toEqual('right button');
        expect(dialog.rightButtonType).toEqual('raised');
        expect(dialog.rightButtonColor).toEqual('orange');
        expect(dialog.rightButtonBackgroundColor).toEqual('lightblue');
        expect(dialog.rightButtonRipple).toEqual('white');
    });

    it('Should execute open/close methods.', fakeAsync(() => {
        const fixture = TestBed.createComponent(AlertComponent);
        const dialog = fixture.componentInstance.dialog;
        fixture.detectChanges();
        expect(dialog.isOpen).toEqual(false);

        dialog.open();
        fixture.detectChanges();
        tick();
        expect(dialog.isOpen).toEqual(true);

        dialog.close();
        tick();
        fixture.detectChanges();
        expect(dialog.isOpen).toEqual(false);
    }));

    it('Should set closeOnOutsideSelect.', fakeAsync(() => {
        const fixture = TestBed.createComponent(AlertComponent);
        fixture.detectChanges();
        const dialog = fixture.componentInstance.dialog;
        dialog.open();
        tick();
        fixture.detectChanges();

        const dialogElem = fixture.debugElement.query(By.css('.igx-dialog')).nativeElement;
        dialogElem.click();
        tick();
        fixture.detectChanges();

        expect(dialog.isOpen).toEqual(false);

        dialog.closeOnOutsideSelect = false;
        dialog.open();
        tick();
        fixture.detectChanges();

        dialogElem.click();
        tick();
        fixture.detectChanges();
        expect(dialog.isOpen).toEqual(true);
    }));

    it('Should test events.', fakeAsync(() => {
        const fixture = TestBed.createComponent(DialogSampleComponent);
        const dialog = fixture.componentInstance.dialog;
        const args: IDialogEventArgs = {
            dialog,
            event: null
        };
        spyOn(dialog.onOpen, 'emit');
        dialog.open();
        tick();
        fixture.detectChanges();
        expect(dialog.onOpen.emit).toHaveBeenCalledWith(args);

        spyOn(dialog.onClose, 'emit');
        dialog.close();
        tick();
        fixture.detectChanges();
        expect(dialog.onClose.emit).toHaveBeenCalledWith(args);

        dialog.open();
        tick();
        fixture.detectChanges();
        const buttons = document.getElementsByClassName('custom-sample')[0].nextElementSibling.querySelectorAll('button');
        const leftButton = buttons[0];
        const rightButton = buttons[1];

        spyOn(dialog.onLeftButtonSelect, 'emit');
        dispatchEvent(leftButton, 'click');
        expect(dialog.onLeftButtonSelect.emit).toHaveBeenCalled();

        spyOn(dialog.onRightButtonSelect, 'emit');
        dispatchEvent(rightButton, 'click');
        tick();
        expect(dialog.onRightButtonSelect.emit).toHaveBeenCalled();
    }));

    it('Should set ARIA attributes.', () => {
        const alertFixture = TestBed.createComponent(AlertComponent);
        const alert = alertFixture.componentInstance.dialog;

        alert.open();
        alertFixture.detectChanges();
        expect(alert.role).toEqual('alertdialog');

        const dialogFixture = TestBed.createComponent(DialogComponent);
        const dialog = dialogFixture.componentInstance.dialog;

        dialog.open();
        dialogFixture.detectChanges();
        expect(dialog.role).toEqual('dialog');
        const titleWrapper = dialogFixture.debugElement.query(By.css('.igx-dialog__window-title'));
        const dialogWindow = dialogFixture.debugElement.query(By.css('.igx-dialog__window'));
        expect(titleWrapper.attributes.id).toEqual(dialogWindow.attributes['aria-labelledby']);
    });

    it('Should close only inner dialog on closeOnOutsideSelect.', fakeAsync(() => {
        const fixture = TestBed.createComponent(NestedDialogsComponent);
        fixture.detectChanges();

        const mainDialog = fixture.componentInstance.main;
        const childDialog = fixture.componentInstance.child;

        mainDialog.open();
        tick();

        childDialog.open();
        tick();
        fixture.detectChanges();

        const dialogs = fixture.debugElement.queryAll(By.css('.igx-dialog'));
        const maindDialogElem = dialogs[0].nativeElement;
        const childDialogElem = dialogs[1].nativeElement;

        childDialogElem.click();
        tick();
        fixture.detectChanges();

        expect(mainDialog.isOpen).toEqual(true);
        expect(childDialog.isOpen).toEqual(false);

        maindDialogElem.click();
        tick();
        fixture.detectChanges();

        expect(mainDialog.isOpen).toEqual(false);
        expect(childDialog.isOpen).toEqual(false);
    }));

    it('Should initialize igx-dialog custom title and actions', () => {
        const data = [{
                component: CustomTemplates1DialogComponent
            }, {
                component: CustomTemplates2DialogComponent
            }];

        data.forEach((item) => {
            const fixture = TestBed.createComponent(item.component);
            const dialog = fixture.componentInstance.dialog;

            dialog.open();
            fixture.detectChanges();

            const dialogWindow = fixture.debugElement.query(By.css('.igx-dialog__window'));
            expect(dialogWindow.children.length).toEqual(2);

            expect(dialogWindow.children[0].nativeElement.innerText.toString()).toContain('TITLE');
            expect(dialogWindow.children[1].nativeElement.innerText.toString()).toContain('BUTTONS');

            dialog.close();
        });

    });

    it('When modal mode is changed, overlay should be informed', fakeAsync(() => {
        const fix = TestBed.createComponent(AlertComponent);
        fix.detectChanges();

        const dialog = fix.componentInstance.dialog;

        dialog.open();
        tick();
        fix.detectChanges();

        let overlaydiv = document.getElementsByClassName(OVERLAY_MAIN_CLASS)[0];
        let overlayWrapper = overlaydiv.children[0];
        expect(overlayWrapper.classList.contains(OVERLAY_WRAPPER_CLASS)).toBe(true);
        expect(overlayWrapper.classList.contains(OVERLAY_MODAL_WRAPPER_CLASS)).toBe(false);

        dialog.close();
        tick();
        fix.detectChanges();

        fix.componentInstance.isModal = true;
        fix.detectChanges();

        dialog.open();
        tick();
        fix.detectChanges();

        overlaydiv = document.getElementsByClassName(OVERLAY_MAIN_CLASS)[0];
        overlayWrapper = overlaydiv.children[0];
        expect(overlayWrapper.classList.contains(OVERLAY_MODAL_WRAPPER_CLASS)).toBe(true);
        expect(overlayWrapper.classList.contains(OVERLAY_WRAPPER_CLASS)).toBe(false);
    }));

    it('Default button of the dialog is focused after opening the dialog and can be closed with keyboard.', (async() => {
        const fix = TestBed.createComponent(DialogComponent);
        fix.detectChanges();

        const dialog: IgxDialogComponent = fix.componentInstance.dialog as IgxDialogComponent;
        dialog.open();
        fix.detectChanges();
        await wait(16);

        // Verify dialog is opened and its default right button is focused
        const dialogDOM = fix.debugElement.query(By.css('.igx-dialog'));
        const rightButton = dialogDOM.queryAll(By.css('button')).filter((b) => b.nativeElement.innerText === 'right button')[0];
        expect(document.activeElement).toBe(rightButton.nativeElement);
        expect(dialog.isOpen).toEqual(true);

        // Press 'escape' key
        UIInteractions.simulateKeyDownEvent(document.activeElement, 'Escape');
        fix.detectChanges();
        await wait(16);

        // Verify dialog is closed and its default right button is no longer focused
        expect(document.activeElement).not.toBe(rightButton.nativeElement);
        expect(dialog.isOpen).toEqual(false);
    }));

    function dispatchEvent(element: HTMLElement, eventType: string) {
        const event = new Event(eventType);
        element.dispatchEvent(event);
    }
});

@Component({
    template: `<div #wrapper>
                            <igx-dialog #dialog
                                title="alert"
                                message="message"
                                closeOnOutsideSelect="true"
                                leftButtonLabel="OK"
                                [isModal]="isModal">
                            </igx-dialog>
                        </div>` })
class AlertComponent {
    @ViewChild('dialog') public dialog: IgxDialogComponent;
    public isModal = false;
}

@Component({
    template: `<div #wrapper>
                            <igx-dialog #dialog title="dialog" message="message"
                                leftButtonLabel="left button"
                                leftButtonType="raised"
                                leftButtonColor="black"
                                leftButtonBackgroundColor="darkblue"
                                leftButtonRipple="pink"

                                rightButtonLabel="right button"
                                rightButtonType="raised"
                                rightButtonColor="orange"
                                rightButtonBackgroundColor="lightblue"
                                rightButtonRipple="white">
                            </igx-dialog>
                        </div>` })
class DialogComponent {
    @ViewChild('dialog') public dialog: IgxDialogComponent;
}
@Component({
    template: `<div #wrapper>
                            <igx-dialog #dialog
                                leftButtonLabel="left button"
                                leftButtonType="raised"
                                leftButtonColor="black"
                                leftButtonBackgroundColor="darkblue"
                                leftButtonRipple="pink"

                                rightButtonLabel="right button"
                                rightButtonType="raised"
                                rightButtonColor="orange"
                                rightButtonBackgroundColor="lightblue"
                                rightButtonRipple="white">
                                <div class="custom-sample">
                                    <h2>Custom Sample</h2>
                                </div>
                            </igx-dialog>
                        </div>` })
class DialogSampleComponent {
    @ViewChild('dialog') public dialog: IgxDialogComponent;
}
@Component({
    template: `<div #wrapper>
                            <igx-dialog #dialog title="custom-dialog">
                                <div class="custom-dialog__content">
                                    <input class="custom-dialog__content-input" type="text" />
                                </div>
                            </igx-dialog>
                        <div>` })
class CustomDialogComponent {
    @ViewChild('dialog') public dialog: IgxDialogComponent;
}

@Component({
    template: `<igx-dialog #main
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
                        </igx-dialog>` })
class NestedDialogsComponent {
    @ViewChild('child') public child: IgxDialogComponent;
    @ViewChild('main') public main: IgxDialogComponent;
}

@Component({
    template: `<igx-dialog #dialog>
                <igx-dialog-title>
                    <div>TITLE 1</div>
                </igx-dialog-title>
                <igx-dialog-actions>
                    <div>BUTTONS 1</div>
                </igx-dialog-actions>
            </igx-dialog>` })
class CustomTemplates1DialogComponent {
    @ViewChild('dialog') public dialog: IgxDialogComponent;
}

@Component({
    template: `<igx-dialog #dialog>
                    <div igxDialogTitle>TITLE 2</div>
                    <div igxDialogActions>BUTTONS 2</div>
            </igx-dialog>` })
class CustomTemplates2DialogComponent {
    @ViewChild('dialog') public dialog: IgxDialogComponent;
}
