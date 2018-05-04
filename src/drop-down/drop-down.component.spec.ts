import { Component, ContentChildren, DebugElement, ViewChild } from "@angular/core";
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
                IgxDropDownTestComponent,
                IgxDropDownTestScrollComponent
            ],
            imports: [IgxDropDownModule, BrowserAnimationsModule, NoopAnimationsModule, IgxToggleModule]
        })
            .compileComponents();
    }));

    it("should select item by SPACE/ENTER and click", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdown;
        const listItems = list.items.toArray();
        let currentItem: DebugElement;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(4);
        button.click({stopPropagation : () => null});
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items.first);
            currentItem = fixture.debugElement.query(By.css(".igx-drop-down__item--focused"));
            expect(currentItem.componentInstance.index).toEqual(0);
            currentItem.triggerEventHandler("keydown.ArrowDown", {});
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css(".igx-drop-down__item--focused"));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(1);
            currentItem.triggerEventHandler("keydown.Space", {});
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items.toArray()[1]);
            button.click({stopPropagation : () => null});
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css(".igx-drop-down__item--selected"));
            currentItem.triggerEventHandler("keydown.ArrowDown", {});
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css(".igx-drop-down__item--focused"));
            currentItem.triggerEventHandler("keydown.Enter", {});
            return fixture.whenStable();
        }).then(() => {
            expect(list.selectedItem).toEqual(list.items.toArray()[2]);
        }).then(() => {
            fixture.detectChanges();
            button.click({stopPropagation : () => null});
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            list.items.toArray()[1].element.nativeElement.click();
            return fixture.whenStable();
        }).then(() => {
            expect(list.selectedItem).toEqual(list.items.toArray()[1]);
        });
    });

    xit("should change the selected values indefinitely", () => {
        // To DO
    });

    it("Should navigate through the items using Up/Down/Home/End keys", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdown;
        const listItems = list.items.toArray();
        let currentItem: DebugElement;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(4);
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items.first);
            currentItem = fixture.debugElement.query(By.css(".igx-drop-down__item--focused"));
            expect(currentItem.componentInstance.index).toEqual(0);
            currentItem.triggerEventHandler("keydown.ArrowDown", {});
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css(".igx-drop-down__item--focused"));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(1);
            currentItem.triggerEventHandler("keydown.End", {});
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            // expect(1).toEqual(2);
            currentItem = fixture.debugElement.query(By.css(".igx-drop-down__item--focused"));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(3);
            currentItem.triggerEventHandler("keydown.ArrowUp", {});
            return fixture.whenStable();
            // const currentItem = list.selectedItem.element as DebugElement;
        }).then(() => {
            fixture.detectChanges();
            currentItem = fixture.debugElement.query(By.css(".igx-drop-down__item--focused"));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(2);
            currentItem.triggerEventHandler("keydown.Home", {});
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items.first);
            currentItem = fixture.debugElement.query(By.css(".igx-drop-down__item--focused"));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(0);
        });
    });

    xit("Should support disabled items and headers", () => {
        // To DO
    });

    it("Should notify when selection has changed", async(() => {
        const fixture = TestBed.createComponent(IgxDropDownTestComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdown;
        const mockObj = { stopPropagation : () => null };
        spyOn(list.onSelection, "emit").and.callThrough();
        spyOn(list.onClose, "emit").and.callThrough();
        spyOn(fixture.componentInstance, "onSelection");
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(4);
        button.click(mockObj);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items.first);
            expect(list.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.onSelection).toHaveBeenCalledTimes(1);
            const lastListItem = list.items.last.element.nativeElement;
            lastListItem.click({});
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items.last);
            expect(list.onSelection.emit).toHaveBeenCalledTimes(2);
            expect(list.onClose.emit).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.onSelection).toHaveBeenCalledTimes(2);
        });
    }));

    it("Should persist selection through scrolling", async(() => {
        const fixture = TestBed.createComponent(IgxDropDownTestScrollComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownScroll;
        const listItems = list.items.toArray();
        let currentItem: DebugElement;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(15);
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items.first);
            currentItem = fixture.debugElement.queryAll(By.css(".igx-drop-down__item--focused"))[0];
            expect(currentItem.componentInstance.index).toEqual(0);
            const scrollElement = list.toggle.element as HTMLElement;
            console.log("LOGGING: 1 ", scrollElement.scrollTop);
            scrollElement.scrollTop += 150;
            expect(document.getElementsByClassName("igx-drop-down__item--focused").length).toEqual(1);
            expect(document.getElementsByClassName("igx-drop-down__item--focused")[0].innerHTML.trim()).toEqual("Item 1");
            scrollElement.scrollTop = 0;
            currentItem = fixture.debugElement.queryAll(By.css(".igx-drop-down__item--focused"))[0];
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(0);
        });
    }));

    xit("Should be able to implement to any kind of anchor", () => {
        // To DO
    });

    xit("Items can be disabled/enabled at runtime", () => {
        // To DO
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

    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdown: IgxDropDownComponent;

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
        // console.log(ev);
    }
}

@Component({
    template: `
    <button (click)="toggleDropDown()">Show</button>
    <igx-drop-down #scrollDropDown>
        <igx-drop-down-item *ngFor="let item of items">
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    `
})
class IgxDropDownTestScrollComponent {

    @ViewChild("scrollDropDown", { read: IgxDropDownComponent })
    public dropdownScroll: IgxDropDownComponent;

    public items: any[] = [
        { field: "Item 1" },
        { field: "Item 2" },
        { field: "Item 3" },
        { field: "Item 4" },
        { field: "Item 5" },
        { field: "Item 6" },
        { field: "Item 7" },
        { field: "Item 8" },
        { field: "Item 9" },
        { field: "Item 10" },
        { field: "Item 11" },
        { field: "Item 12" },
        { field: "Item 13" },
        { field: "Item 14" },
        { field: "Item 15" }
    ];

    public toggleDropDown() {
        this.dropdownScroll.toggleDropDown();
    }
}
