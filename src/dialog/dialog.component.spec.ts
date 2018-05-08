import { Component, DebugElement, ElementRef, ViewChild } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { IDialogEventArgs, IgxDialogComponent, IgxDialogModule } from "./dialog.component";

describe("Dialog", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AlertComponent, DialogComponent, CustomDialogComponent, NestedDialogsComponent, CustomTemplatesDialogComponent],
            imports: [BrowserAnimationsModule, IgxDialogModule]
        }).compileComponents();
    }));
    it("Initialize a datepicker component with id", () => {
        const fixture = TestBed.createComponent(AlertComponent);
        fixture.detectChanges();

        const dialog = fixture.componentInstance.dialog;
        const domDialog = fixture.debugElement.query(By.css("igx-dialog")).nativeElement;

        expect(dialog.id).toContain("igx-dialog-");
        expect(domDialog.id).toContain("igx-dialog-");

        dialog.id = "customDialog";
        fixture.detectChanges();

        expect(dialog.id).toBe("customDialog");
        expect(domDialog.id).toBe("customDialog");
    });

    it("Should set dialog title.", () => {
        const fixture = TestBed.createComponent(AlertComponent);
        const dialog = fixture.componentInstance.dialog;
        const expectedTitle = "alert";

        dialog.open();
        fixture.detectChanges();

        expect(dialog.title).toEqual(expectedTitle);
        const titleDebugElement = fixture.debugElement.query(By.css(".igx-dialog__window-title"));
        expect(titleDebugElement.nativeElement.textContent.trim()).toEqual(expectedTitle);
        dialog.close();
    });

    it("Should set dialog message.", () => {
        const fixture = TestBed.createComponent(AlertComponent);
        const dialog = fixture.componentInstance.dialog;
        const expectedMessage = "message";

        dialog.open();
        fixture.detectChanges();

        expect(dialog.message).toEqual(expectedMessage);
        const messageDebugElement = fixture.debugElement.query(By.css(".igx-dialog__window-content"));
        expect(messageDebugElement.nativeElement.textContent.trim()).toEqual(expectedMessage);
    });

    it("Should set custom modal message.", () => {
        const fixture = TestBed.createComponent(CustomDialogComponent);
        const dialog = fixture.componentInstance.dialog;

        dialog.open();
        fixture.detectChanges();

        const dialogWindow = fixture.debugElement.query(By.css(".igx-dialog__window"));
        const customContent = fixture.debugElement.query(By.css(".custom-dialog__content"));
        expect(customContent).toBeTruthy();
        expect(dialogWindow.children.length).toEqual(2);
        expect(customContent.children.length).toEqual(1);
    });

    it("Should set left and right button properties.", () => {
        const fixture = TestBed.createComponent(DialogComponent);
        const dialog = fixture.componentInstance.dialog;

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
        const fixture = TestBed.createComponent(AlertComponent);
        const dialog = fixture.componentInstance.dialog;

        fixture.detectChanges();
        expect(dialog.isOpen).toEqual(false);

        dialog.open();
        fixture.detectChanges();
        expect(dialog.isOpen).toEqual(true);

        dialog.close();
        fixture.detectChanges();
        expect(dialog.isOpen).toEqual(false);
    });

    it("Should set closeOnOutsideSelect.", () => {
        const fixture = TestBed.createComponent(AlertComponent);
        fixture.detectChanges();

        const dialog = fixture.componentInstance.dialog;
        dialog.open();
        fixture.detectChanges();

        const dialogElem = fixture.debugElement.query(By.css(".igx-dialog")).nativeElement;
        dialogElem.click();
        fixture.detectChanges();

        expect(dialog.isOpen).toEqual(false);

        dialog.closeOnOutsideSelect = false;
        dialog.open();
        fixture.detectChanges();

        dialogElem.click();

        fixture.detectChanges();

        expect(dialog.isOpen).toEqual(true);
    });

    it("Should test events.", () => {
        const fixture = TestBed.createComponent(DialogComponent);
        const dialog = fixture.componentInstance.dialog;
        const args: IDialogEventArgs = {
            dialog,
            event: null
        };

        spyOn(dialog.onOpen, "emit");
        dialog.open();
        dialog.close();
        fixture.detectChanges();
        expect(dialog.onOpen.emit).toHaveBeenCalledWith(args);

        spyOn(dialog.onClose, "emit");
        dialog.open();
        dialog.close();
        fixture.detectChanges();
        expect(dialog.onClose.emit).toHaveBeenCalledWith(args);

        dialog.open();
        fixture.detectChanges();
        const buttons = fixture.debugElement.nativeElement.querySelectorAll("button");
        const leftButton = buttons[0];
        const rightButton = buttons[1];

        spyOn(dialog.onLeftButtonSelect, "emit");
        dispatchEvent(leftButton, "click");
        expect(dialog.onLeftButtonSelect.emit).toHaveBeenCalled();

        spyOn(dialog.onRightButtonSelect, "emit");
        dispatchEvent(rightButton, "click");
        expect(dialog.onRightButtonSelect.emit).toHaveBeenCalled();
    });

    it("Should set ARIA attributes.", () => {
        const alertFixture = TestBed.createComponent(AlertComponent);
        const alert = alertFixture.componentInstance.dialog;

        alert.open();
        alertFixture.detectChanges();
        expect(alert.role).toEqual("alertdialog");

        const dialogFixture = TestBed.createComponent(DialogComponent);
        const dialog = dialogFixture.componentInstance.dialog;

        dialog.open();
        dialogFixture.detectChanges();
        expect(dialog.role).toEqual("dialog");
        const titleWrapper = dialogFixture.debugElement.query(By.css(".igx-dialog__window-title"));
        const dialogWindow = dialogFixture.debugElement.query(By.css(".igx-dialog__window"));
        expect(titleWrapper.attributes.id).toEqual(dialogWindow.attributes["aria-labelledby"]);
    });

    it("Should close only inner dialog on closeOnOutsideSelect.", () => {
        const fixture = TestBed.createComponent(NestedDialogsComponent);
        fixture.detectChanges();

        const mainDialog = fixture.componentInstance.main;
        const childDialog = fixture.componentInstance.child;

        mainDialog.open();
        childDialog.open();
        fixture.detectChanges();

        const dialogs = fixture.debugElement.queryAll(By.css(".igx-dialog"));
        const maindDialogElem = dialogs[0].nativeElement;
        const childDialogElem = dialogs[1].nativeElement;

        childDialogElem.click();
        fixture.detectChanges();

        expect(mainDialog.isOpen).toEqual(true);
        expect(childDialog.isOpen).toEqual(false);

        maindDialogElem.click();
        fixture.detectChanges();

        expect(mainDialog.isOpen).toEqual(false);
        expect(childDialog.isOpen).toEqual(false);
    });

    it("Should initialize igx-dialog custom templates", () => {
        const fixture = TestBed.createComponent(CustomTemplatesDialogComponent);
        const dialog = fixture.componentInstance.dialog;

        dialog.open();
        fixture.detectChanges();

        expect(dialog.titleTemplate).toBeDefined();
        expect(dialog.buttonsTemplate).toBeDefined();

        const dialogWindow = fixture.debugElement.query(By.css(".igx-dialog__window"));
        expect(dialogWindow.children.length).toEqual(2);

        expect(dialogWindow.children[0].nativeElement.innerText).toEqual("TITLE");
        expect(dialogWindow.children[1].nativeElement.innerText).toEqual("BUTTONS");

        dialog.close();
    });

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
                                leftButtonLabel="OK">
                            </igx-dialog>
                        </div>` })
class AlertComponent {
    @ViewChild("dialog") public dialog: IgxDialogComponent;
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
    @ViewChild("dialog") public dialog: IgxDialogComponent;
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
    @ViewChild("dialog") public dialog: IgxDialogComponent;
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
    @ViewChild("child") public child: IgxDialogComponent;
    @ViewChild("main") public main: IgxDialogComponent;
}

@Component({
    template: `<igx-dialog #dialog>
                <ng-template igxDialogTitle>
                    <div>TITLE</div>
                </ng-template>
                <ng-template igxDialogActions>
                    <div>BUTTONS</div>
                </ng-template>
            </igx-dialog>` })
class CustomTemplatesDialogComponent {
    @ViewChild("dialog") public dialog: IgxDialogComponent;
}
