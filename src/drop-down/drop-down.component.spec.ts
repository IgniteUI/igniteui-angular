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
