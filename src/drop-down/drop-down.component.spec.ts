import { Component, ContentChildren, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule, NoopAnimationsModule } from "@angular/platform-browser/animations";
import { IgxToggleActionDirective, IgxToggleDirective, IgxToggleModule } from "../directives/toggle/toggle.directive";
import { IgxDropDownItemComponent } from "./drop-down-item.component";
import { IgxDropDownComponent, IgxDropDownModule } from "./drop-down.component";

describe("IgxDropDown ", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxDropDownTestComponent
            ],
            imports: [IgxDropDownModule, BrowserAnimationsModule, NoopAnimationsModule, IgxToggleModule]
        })
        .compileComponents();
    }));

    it("should initialize igx-drop-down", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestComponent);
        const list = fixture.componentInstance.items;
        expect(list).toBeDefined();
        expect(list.length).toEqual(4);
    });

    fit("should select item by click", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdown.items;
        const item = list[0] as IgxDropDownItemComponent;
        expect(list).toBeDefined();
        expect(list.length).toEqual(4);
        // tslint:disable-next-line:no-debugger
        debugger;
        button.click();
        expect(item.isFocused).toBe(true);
    });

    xit("should select item by SPACE/ENTER", () => {
        //To DO
    });

    xit("should change the selected values indefinitely", () => {
        //To DO
    });

    xit("Should persist selection through scrolling", () => {
        //To DO
    });

    xit("Should navigate through the items using Up/Down/Home/End keys", () => {
        //To DO
    });

    xit("Should support disabled items and headers", () => {
        //To DO
    });

    xit("Should notify when selection has changed", () => {
        //To DO
    });

    xit("Should be able to implement to any kind of anchor", () => {
        //To DO
    });
});

@Component({
    template: `
    <button (click)="toggleDropDown()">Toggle</button>
    <igx-drop-down (onSelection)="onSelection($event)">
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    <div style="position: fixed; width: 100px; height: 100px; background-color: red; top: 50px; left: 300px; z-index: 9000;"></div>`
})
 class IgxDropDownTestComponent {

    @ViewChild(IgxDropDownComponent) public dropdown: IgxDropDownComponent;

    public items: any[] = [
        { field: "Nav1" },
        { field: "Nav2" },
        { field: "Nav3" },
        { field: "Nav4" }
    ];

    public toggleDropDown() {
        this.dropdown.toggleDropDown();
    }

    public onSelection(ev) {
        console.log(ev);
    }
}
