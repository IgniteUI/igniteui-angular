import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, ViewChild, DebugElement } from '@angular/core';

import { IgxDialog, IgxDialogModule } from './dialog.component';

fdescribe("Dialog", function () {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [IgxDialogModule],
            declarations: [Alert, Dialog, CustomDialog]
        }).compileComponents();
    }));

    fit("Should set dialog title.", () => {
        let fixture = TestBed.createComponent(Alert),
            dialog = fixture.componentInstance.dialog,
            expectedTitle = "alert";
        
        fixture.detectChanges();
        
        expect(dialog.title).toEqual(expectedTitle);
        let titleDebugElement = fixture.debugElement.query(By.css(".igx-dialog__window-title"));
        expect(titleDebugElement.nativeElement.textContent.trim()).toEqual(expectedTitle);
    });

    fit("Should set dialog message.", () => {
        let fixture = TestBed.createComponent(Alert),
            dialog = fixture.componentInstance.dialog,
            expectedMessage = "message";

        fixture.detectChanges();

        expect(dialog.message).toEqual(expectedMessage);
        let messageDebugElement = fixture.debugElement.query(By.css(".igx-dialog__window-content"));
        expect(messageDebugElement.nativeElement.textContent.trim()).toEqual(expectedMessage);
    });

    fit("Should set custom modal message.", () => {
        let fixture = TestBed.createComponent(CustomDialog),
            dialog = fixture.componentInstance.dialog;

        fixture.detectChanges();

        let messageDebugElement = fixture.debugElement.query(By.css(".igx-dialog__window-content")),
            messageNativeElement = messageDebugElement.nativeElement;
        expect(messageNativeElement.getElementsByClassName("custom-dialog__content").length).toEqual(1);
        expect(messageNativeElement.getElementsByClassName("custom-dialog__content-input").length).toEqual(1);
    });

    fit("Should set left and right button properties.", () => {
        let fixture = TestBed.createComponent(Dialog),
            dialog = fixture.componentInstance.dialog;
        
        fixture.detectChanges();

        expect(dialog.leftButtonLabel).toEqual("left button");
        expect(dialog.leftButtonType).toEqual("raised");
        expect(dialog.leftButtonColor).toEqual("black");
        expect(dialog.leftButtonBackgroundColor).toEqual("darkblue");
        expect(dialog.leftButtonRipple).toEqual("pink");

        expect(dialog.rightButtonLabel).toEqual("right button");
        expect(dialog.rightButtonType).toEqual("raised");
        expect(dialog.rightButtonColor).toEqual("orange");
        expect(dialog.rightButtonBackgroundColor).toEqual("lightblue");
        expect(dialog.rightButtonRipple).toEqual("white");
    });

    fit("Should execute open/close methods.", () => {
        let fixture = TestBed.createComponent(Alert),
            dialog = fixture.componentInstance.dialog;

        fixture.detectChanges();
        testDialogIsOpen(fixture.debugElement, dialog, false);

        dialog.open();
        fixture.detectChanges();
        testDialogIsOpen(fixture.debugElement, dialog, true);
        
        dialog.close();
        fixture.detectChanges();
        testDialogIsOpen(fixture.debugElement, dialog, false);
    });

    fit("Should set closeOnOutsideSelect.", () => {
        let fixture = TestBed.createComponent(Alert),
            dialog = fixture.componentInstance.dialog;

        fixture.detectChanges();
        
        dialog.open();
        fixture.componentInstance.dialog.dialogEl.nativeElement.click();      

        fixture.detectChanges();

        testDialogIsOpen(fixture.debugElement, dialog, false);

        dialog.closeOnOutsideSelect = false;
        dialog.open();
        fixture.componentInstance.dialog.dialogEl.nativeElement.click();

        fixture.detectChanges();

        testDialogIsOpen(fixture.debugElement, dialog, true);
    });
    
    fit("Should test events.", () => {
        let fixture = TestBed.createComponent(Dialog),
            dialog = fixture.componentInstance.dialog;
        
        fixture.detectChanges();

        spyOn(dialog.onOpen, "emit");
        dialog.open();
        fixture.detectChanges();
        expect(dialog.onOpen.emit).toHaveBeenCalledWith(dialog);

        spyOn(dialog.onClose, "emit");
        dialog.close();
        fixture.detectChanges();
        expect(dialog.onClose.emit).toHaveBeenCalledWith(dialog);

        let buttons = fixture.debugElement.nativeElement.querySelectorAll("button"),
            leftButton = buttons[0],
            rightButton = buttons[1];

        spyOn(dialog.onLeftButtonSelect, "emit");
        dispatchEvent(leftButton, "click");
        fixture.detectChanges();
        expect(dialog.onLeftButtonSelect.emit).toHaveBeenCalled();
        
        spyOn(dialog.onRightButtonSelect, "emit");
        dispatchEvent(rightButton, "click");
        fixture.detectChanges();
        expect(dialog.onRightButtonSelect.emit).toHaveBeenCalled();
    });

/*
    fit("Should test ARIA attributes.", () => {

    });*/

    function testDialogIsOpen(debugElement: DebugElement, dialog: IgxDialog, isOpen: boolean) {
        let dialogDebugElement = debugElement.query(By.css(".igx-dialog"));
        let dialogClassList = dialogDebugElement.nativeElement.classList;
        let dialogClassListContainsDialogHidden = dialogClassList.contains("igx-dialog--hidden");
        if (isOpen) {
            expect(dialogClassListContainsDialogHidden).toBeFalsy();
        } else {
            expect(dialogClassListContainsDialogHidden).toBeTruthy();
        }

        expect(dialog.isOpen).toEqual(isOpen);        
    }

    function dispatchEvent(element: HTMLElement, eventType: string) {
        let event = new Event(eventType);
        element.dispatchEvent(event);
    }
});

@Component({ template: `<div #wrapper>
                            <igx-dialog #dialog 
                                title="alert" 
                                message="message" 
                                closeOnOutsideSelect="true">
                            </igx-dialog>
                        </div>` })
class Alert {
    @ViewChild("dialog") dialog: IgxDialog;
}

@Component({ template: `<div #wrapper>
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
class Dialog {
    @ViewChild("dialog") dialog: IgxDialog;
}

@Component({ template: `<div #wrapper>
                            <igx-dialog #dialog title="custom-dialog">
                                <div class="custom-dialog__content">
                                    <input class="custom-dialog__content-input" type="text" />
                                </div>
                            </igx-dialog>
                        <div>` })
class CustomDialog {
    @ViewChild("dialog") dialog: IgxDialog;
}