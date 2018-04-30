import { Component, ContentChildren, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { IgxToggleDirective, IgxToggleModule } from "../directives/toggle/toggle.directive";
import { IgxDropDownComponent, IgxDropDownModule } from "./drop-down.component";

describe("IgxDropDown ", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxDropDownTestComponent
            ],
            imports: [IgxDropDownModule, BrowserAnimationsModule]
        })
        .compileComponents();
    }));

    it("should initialize igx-drop-down", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestComponent);
        const list = fixture.componentInstance.items;
        expect(list).toBeDefined();
        expect(list.length).toEqual(4);
    });

    xit("should select item by click", () => {
        //To DO
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
        <igx-drop-down-item *ngFor="let item of items" isDisabled={{item.disabled}} isHeader={{item.header}}>
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    <div style="position: fixed; width: 100px; height: 100px; background-color: red; top: 50px; left: 300px; z-index: 9000;"></div>
    `
})
export class IgxDropDownTestComponent {
    public  items: any[] = [
         { field: "Cables" },
         { field: "Switches", disabled: true, header: true },
         { field: "Switches", disabled: false },
         { field: "Batteries", disabled: true }
    ];
    @ViewChild(IgxDropDownComponent) public igxDropDown: IgxDropDownComponent;
}
