import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, ViewChild, DebugElement, ElementRef } from '@angular/core';

import { IgxDialog, IgxDialogModule } from './dialog.component';

describe("Dialog", function () {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [IgxDialogModule],
            declarations: [Alert, Dialog, CustomDialog]
        }).compileComponents();
    }));
    it("Should set dialog title.", () => {
        let fixture = TestBed.createComponent(Alert),
            dialog = fixture.componentInstance.dialog,
            expectedTitle = "alert";
        
        dialog.open();
        fixture.detectChanges();
        
        expect(dialog.title).toEqual(expectedTitle);
        let titleDebugElement = fixture.debugElement.query(By.css(".igx-dialog__window-title"));
        expect(titleDebugElement.nativeElement.textContent.trim()).toEqual(expectedTitle);
        dialog.close();
    });

    it("Should set dialog message.", () => {
        let fixture = TestBed.createComponent(Alert),
            dialog = fixture.componentInstance.dialog,
            expectedMessage = "message";

        dialog.open();
        fixture.detectChanges();

        expect(dialog.message).toEqual(expectedMessage);
        let messageDebugElement = fixture.debugElement.query(By.css(".igx-dialog__window-content"));
        expect(messageDebugElement.nativeElement.textContent.trim()).toEqual(expectedMessage);
    });

    it("Should set custom modal message.", () => {
        let fixture = TestBed.createComponent(CustomDialog),
            dialog = fixture.componentInstance.dialog;
        
        dialog.open();
        fixture.detectChanges();

        let messageDebugElement = fixture.debugElement.query(By.css(".igx-dialog__window-content")),
            messageNativeElement = messageDebugElement.nativeElement;
        expect(messageNativeElement.getElementsByClassName("custom-dialog__content").length).toEqual(1);
        expect(messageNativeElement.getElementsByClassName("custom-dialog__content-input").length).toEqual(1);
    });

    it("Should set left and right button properties.", () => {
        let fixture = TestBed.createComponent(Dialog),
            dialog = fixture.componentInstance.dialog;
        
        fixture.detectChanges();

        dialog.open();
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

    it("Should execute open/close methods.", () => {
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

    it("Should set closeOnOutsideSelect.", () => {
        let fixture = TestBed.createComponent(Alert),
            dialog = fixture.componentInstance.dialog;

        dialog.open();
        fixture.detectChanges();

        fixture.componentInstance.dialog.dialogEl.nativeElement.click();
        testDialogIsOpen(fixture.debugElement, dialog, false);

        dialog.closeOnOutsideSelect = false;
        dialog.open();
        fixture.componentInstance.dialog.dialogEl.nativeElement.click();

        fixture.detectChanges();

        testDialogIsOpen(fixture.debugElement, dialog, true);
    });
    
    it("Should test events.", () => {
        let fixture = TestBed.createComponent(Dialog),
            dialog = fixture.componentInstance.dialog;
        

        spyOn(dialog.onOpen, "emit");
        dialog.open();
        dialog.close();
        fixture.detectChanges();
        expect(dialog.onOpen.emit).toHaveBeenCalledWith(dialog);

        spyOn(dialog.onClose, "emit");
        dialog.open();
        dialog.close();
        fixture.detectChanges();
        expect(dialog.onClose.emit).toHaveBeenCalledWith(dialog);

        dialog.open();
        fixture.detectChanges();
        let buttons = fixture.debugElement.nativeElement.querySelectorAll("button"),
            leftButton = buttons[0],
            rightButton = buttons[1];
        
        spyOn(dialog.onLeftButtonSelect, "emit");
        dispatchEvent(leftButton, "click");
        expect(dialog.onLeftButtonSelect.emit).toHaveBeenCalled();
        
        spyOn(dialog.onRightButtonSelect, "emit");
        dispatchEvent(rightButton, "click");
        expect(dialog.onRightButtonSelect.emit).toHaveBeenCalled();
    });

    it("Should set ARIA attributes.", () => {
        let alertFixture = TestBed.createComponent(Alert),
            alert = alertFixture.componentInstance.dialog;
        
        alert.open();
        alertFixture.detectChanges();
        expect(alert.role).toEqual("alertdialog");

        let dialogFixture = TestBed.createComponent(Dialog),
            dialog = dialogFixture.componentInstance.dialog;

        dialog.open();
        dialogFixture.detectChanges();
        expect(dialog.role).toEqual("dialog");
        let titleWrapper = dialogFixture.debugElement.query(By.css(".igx-dialog__window-title")),
            dialogWindow = dialogFixture.debugElement.query(By.css(".igx-dialog__window"));
        expect(titleWrapper.attributes["id"]).toEqual(dialogWindow.attributes["aria-labelledby"]);
    });

    function testDialogIsOpen(debugElement: DebugElement, dialog: IgxDialog, isOpen: boolean) {
        let dialogDebugElement = debugElement.query(By.css(".igx-dialog"));

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
                                closeOnOutsideSelect="true"
                                leftButtonLabel="OK">
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