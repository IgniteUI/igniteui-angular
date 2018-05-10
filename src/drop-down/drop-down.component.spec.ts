import { Component, ContentChildren, DebugElement, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule, NoopAnimationsModule } from "@angular/platform-browser/animations";
import { IgxToggleActionDirective, IgxToggleDirective, IgxToggleModule } from "../directives/toggle/toggle.directive";
import { IgxDropDownItemComponent } from "./drop-down-item.component";
import { IgxDropDownComponent, IgxDropDownModule } from "./drop-down.component";

const CSS_CLASS_FOCUSED = "igx-drop-down__item--focused";
const CSS_CLASS_SELECTED = "igx-drop-down__item--selected";
const CSS_CLASS_DISABLED = "igx-drop-down__item--disabled";
const CSS_CLASS_HEADER = "igx-drop-down__header";

describe("IgxDropDown ", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxDropDownTestComponent,
                IgxDropDownTestScrollComponent,
                IgxDropDownTestDisabledComponent,
                IgxDropDownTestDisabledAnyComponent
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
        const listItems = list.items;
        const mockObj = jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]);
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(4);
        button.click(mockObj);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.queryAll(By.css("." + CSS_CLASS_FOCUSED))[0];
            expect(currentItem.componentInstance.index).toEqual(0);
            currentItem.triggerEventHandler("keydown.ArrowDown", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(1);
            currentItem.triggerEventHandler("keydown.Space", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items[1]);
            button.click({ stopPropagation: () => null });
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.queryAll(By.css("." + CSS_CLASS_SELECTED))[0];
            currentItem.triggerEventHandler("keydown.ArrowDown", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            currentItem.triggerEventHandler("keydown.Enter", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items[2]);
            button.click({ stopPropagation: () => null });
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            list.items[1].element.nativeElement.click();
            return fixture.whenStable();
        }).then(() => {
            expect(list.selectedItem).toEqual(list.items[1]);
        });
    });

    it("should change the selected values indefinitely", () => {
        // To DO
        const fixture = TestBed.createComponent(IgxDropDownTestScrollComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownScroll;
        const listItems = list.items;
        const mockObj = jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]);
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(15);
        button.click(mockObj);
        spyOn(list.items[0], "onArrowDownKeyDown").and.callThrough();
        spyOn(list.items[1], "onSpaceKeyDown").and.callThrough();
        spyOn(list.items[4], "onEscapeKeyDown").and.callThrough();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(0);
            currentItem.triggerEventHandler("keydown.ArrowDown", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(1);
            currentItem.triggerEventHandler("keydown.Space", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            // expect(1).toEqual(2);
            expect(list.selectedItem).toEqual(listItems[1]);
            document.getElementsByTagName("button")[1].click();
            return fixture.whenStable();
            // const currentItem = list.selectedItem.element as DebugElement;
        }).then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(listItems[4]);
            button.click();
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_SELECTED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(4);
            currentItem.triggerEventHandler("keydown.Escape", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(listItems[4]);
            expect(list.items[0].onArrowDownKeyDown).toHaveBeenCalledTimes(1);
            expect(list.items[1].onSpaceKeyDown).toHaveBeenCalledTimes(1);
            expect(list.items[4].onEscapeKeyDown).toHaveBeenCalledTimes(1);
        });
    });

    it("Should navigate through the items using Up/Down/Home/End keys", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdown;
        const listItems = list.items;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(4);
        const mockObj = jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]);
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            currentItem.triggerEventHandler("keydown.ArrowDown", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(1);
            currentItem.triggerEventHandler("keydown.End", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(3);
            currentItem.triggerEventHandler("keydown.ArrowUp", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(2);
            currentItem.triggerEventHandler("keydown.Home", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(0);
        });
    });

    it("Should support disabled items", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestDisabledAnyComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownDisabledAny;
        const listItems = list.items;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(13);
        const mockObj = jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]);
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.queryAll(By.css("." + CSS_CLASS_DISABLED))[0];
            expect(currentItem.componentInstance.index).toEqual(2);
            currentItem.triggerEventHandler("click", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.queryAll(By.css(".igx-drop-down__item"))[4];
            expect(currentItem.componentInstance.index).toEqual(4);
            currentItem.triggerEventHandler("click", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items[4]);
        });
    });

    it("Should support header items", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestDisabledAnyComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownDisabledAny;
        const listItems = list.items;
        const headerItems = list.headers;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(13);
        const mockObj = jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]);
        button.click();
        fixture.whenStable().then(() => {
            console.log("Running test");
            fixture.detectChanges();
            const currentItem = fixture.debugElement.queryAll(By.css("." + CSS_CLASS_HEADER))[0];
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance).toEqual(headerItems[0]);
            currentItem.triggerEventHandler("click", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            // expect(list.selectedItem).toEqual(list.items[0]);
            const currentItem = fixture.debugElement.queryAll(By.css(".igx-drop-down__item"))[1];
            currentItem.triggerEventHandler("click", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items[1]);
        });
    });

    it("Should notify when selection has changed", async(() => {
        const fixture = TestBed.createComponent(IgxDropDownTestComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdown;
        const mockObj = jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]);
        spyOn(list.onSelection, "emit").and.callThrough();
        spyOn(list.onClosed, "emit").and.callThrough();
        spyOn(fixture.componentInstance, "onSelection");
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(4);
        button.click(mockObj);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const lastListItem = list.items[3].element.nativeElement;
            lastListItem.click({});
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(list.selectedItem).toEqual(list.items[3]);
            expect(list.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(list.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.onSelection).toHaveBeenCalledTimes(1);
        });
    }));

    it("Should persist selection through scrolling", async(() => {
        const fixture = TestBed.createComponent(IgxDropDownTestScrollComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownScroll;
        const listItems = list.items;
        const mockObj = jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]);
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(15);
        button.click(mockObj);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            // expect(list.selectedItem).toEqual(list.items[0]);
            let currentItem = document.getElementsByClassName(CSS_CLASS_FOCUSED)[0] as HTMLElement;
            currentItem.focus();
            expect(currentItem.innerHTML.trim()).toEqual("Item 1");
            const scrollElement = list.toggleDirective.element as HTMLElement;
            scrollElement.scrollTop += 150;
            currentItem = document.getElementsByClassName(CSS_CLASS_FOCUSED)[0] as HTMLElement;
            expect(currentItem.innerHTML.trim()).toEqual("Item 1");
            scrollElement.scrollTop = 0;
            const currentItem2 = fixture.debugElement.queryAll(By.css("." + CSS_CLASS_FOCUSED))[0];
            expect(currentItem2).toBeDefined();
            expect(currentItem2.componentInstance.index).toEqual(0);
        });
    }));

    xit("Should be able to implement to any kind of anchor", () => {
        // To DO
    });

    it("Items can be disabled/enabled at runtime", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestDisabledAnyComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownDisabledAny;
        const listItems = list.items;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(13);
        const mockObj = jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]);
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.queryAll(By.css("." + CSS_CLASS_DISABLED));
            expect(currentItem.length).toEqual(3);
            expect(list.items[4].isDisabled).toBeFalsy();
            list.items[4].isDisabled = true;
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.queryAll(By.css("." + CSS_CLASS_DISABLED));
            expect(currentItem.length).toEqual(4);
            expect(list.items[4].isDisabled).toBeTruthy();
        });
    });

    it("Esc key closes the dropdown and does not change selection", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdown;
        const mockObj = jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]);
        spyOn(list.onSelection, "emit").and.callThrough();
        spyOn(list.onClosed, "emit").and.callThrough();
        spyOn(list.onOpened, "emit").and.callThrough();
        spyOn(list.toggleDirective.onClosing, "emit").and.callThrough();
        spyOn(list.toggleDirective.onClosed, "emit").and.callThrough();
        spyOn(fixture.componentInstance, "onSelection");
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(4);
        button.click(mockObj);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            // expect(currentItem.componentInstance.index).toEqual(0);
            currentItem.triggerEventHandler("keydown.ArrowDown", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            expect(currentItem).toBeDefined();
            expect(currentItem.componentInstance.index).toEqual(1);
            currentItem.triggerEventHandler("keydown.Escape", mockObj);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            // expect(list.selectedItem).toEqual(list.items[0]);
            expect(list.onOpened.emit).toHaveBeenCalledTimes(1);
            expect(list.onSelection.emit).toHaveBeenCalledTimes(0);
            // should be list.onClose.emit
            expect(list.toggleDirective.onClosing.emit).toHaveBeenCalledTimes(1);
        });
    });

    it("Should not change selection when setting it to non-existing item", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestScrollComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownScroll;
        const listItems = list.items;
        const mockObj = jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]);
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(15);
        list.setSelectedItem(0);
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            // expect(listItems[0].isSelected).toBeTruthy();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(0);
            list.setSelectedItem(-4);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(listItems[0].isSelected).toBeTruthy();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(0);
            list.setSelectedItem(24);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(listItems[0].isSelected).toBeTruthy();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(0);
            list.setSelectedItem(5);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(listItems[5].isSelected).toBeTruthy();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(5);
            // Verify selecting the already selected element is not affecting selection
            list.setSelectedItem(5);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(listItems[5].isSelected).toBeTruthy();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(5);
        });
    });

    it("Home key should select the first enabled item", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownDisabled;
        const listItems = list.items;
        const mockObj = jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]);
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(13);
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(listItems[1].isSelected).toBeFalsy();
            fixture.componentInstance.dropdownDisabled.setSelectedItem(4);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(listItems[4].isSelected).toBeTruthy();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_SELECTED));
            expect(currentItem.componentInstance.index).toEqual(4);
            currentItem.triggerEventHandler("keydown.Home", jasmine.createSpyObj("w/e", ["stopPropagation", "preventDefault"]));
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(listItems[1].isFocused).toBeTruthy();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            expect(currentItem.componentInstance.index).toEqual(1);
        });
    });

    it("End key should select the last enabled item", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownDisabled;
        const listItems = list.items;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(13);
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            fixture.componentInstance.dropdownDisabled.setSelectedItem(4);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_SELECTED));
            expect(list.items[4].isSelected).toBeTruthy();
            currentItem.triggerEventHandler("keydown.End", jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]));
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(listItems[11].isFocused).toBeTruthy();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            expect(currentItem.componentInstance.index).toEqual(11);
        });
    });

    it("Key navigation through disabled items", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownDisabled;
        const listItems = list.items;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(13);
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const currentItem = fixture.debugElement.queryAll(By.css(".igx-drop-down__item"))[0];
            // tslint:disable-next-line:no-debugger
            debugger;
            currentItem.triggerEventHandler("keydown.ArrowDown", jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]));
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            // tslint:disable-next-line:no-debugger
            debugger;
            expect(list.items[3].isFocused).toBeTruthy();
            const currentItem = fixture.debugElement.queryAll(By.css(".igx-drop-down__item"))[0];
            currentItem.triggerEventHandler("keydown.ArrowUp", jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]));
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(listItems[1].isFocused).toBeTruthy();
            const currentItem = fixture.debugElement.query(By.css("." + CSS_CLASS_FOCUSED));
            expect(currentItem.componentInstance.index).toEqual(1);
        });
    });

    it("Change width/height at runtime", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownDisabled;
        const listItems = list.items;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(13);
        fixture.componentInstance.dropdownDisabled.width = "80%";
        fixture.componentInstance.dropdownDisabled.height = "400px";
        fixture.componentInstance.dropdownDisabled.id = "newDD";
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(fixture.componentInstance.dropdownDisabled.height).toEqual("400px");
            expect(fixture.componentInstance.dropdownDisabled.width).toEqual("80%");
            expect(fixture.componentInstance.dropdownDisabled.id).toEqual("newDD");
        });
    });

    it("Disabled items cannot be focused", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownDisabled;
        const listItems = list.items;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(13);
        list.items[0].isFocused = true;
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(list.items[0].isFocused).toEqual(false);
        });
    });

    it("Disabled items cannot be selected", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownDisabled;
        const listItems = list.items;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(13);
        list.setSelectedItem(0);
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(list.items[0].isSelected).toEqual(false);
            button.click();
        });
    });

    it("Clicking a disabled item is not moving the focus", () => {
        const fixture = TestBed.createComponent(IgxDropDownTestDisabledComponent);
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("button")).nativeElement;
        const list = fixture.componentInstance.dropdownDisabled;
        const listItems = list.items;
        expect(list).toBeDefined();
        expect(list.items.length).toEqual(13);
        button.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(list.items[1].isFocused).toEqual(true);
            const currentItem = fixture.debugElement.queryAll(By.css(".igx-drop-down__item"))[0];
            currentItem.triggerEventHandler("keydown.ArrowDown", jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]));
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(list.items[3].isFocused).toEqual(true);
            const firstItem = list.items[0].element.nativeElement;
            firstItem.click({});
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(list.items[3].isFocused).toEqual(true);
            const currentItem = fixture.debugElement.queryAll(By.css(".igx-drop-down__item"))[1];
            currentItem.triggerEventHandler("keydown.ArrowDown", jasmine.createSpyObj("mockEvt", ["stopPropagation", "preventDefault"]));
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(list.items[4].isFocused).toEqual(true);
        });
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
        this.dropdown.toggle();
    }

    public onSelection(ev) {
        // console.log(ev);
    }
}

@Component({
    template: `
    <button (click)="toggleDropDown()">Show</button>
    <button (click)="selectItem5()">Select 5</button>
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
        this.dropdownScroll.toggle();
    }

    public selectItem5() {
        this.dropdownScroll.setSelectedItem(4);
    }
}

@Component({
    template: `
    <button (click)="toggleDropDown()">Show</button>
    <button (click)="selectItem5()">Select 5</button>
    <igx-drop-down #dropdownDisabledAny>
        <igx-drop-down-item *ngFor="let item of items" isDisabled={{item.disabled}} isHeader={{item.header}}>
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    `
})
class IgxDropDownTestDisabledAnyComponent {

    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdownDisabledAny: IgxDropDownComponent;

    public items: any[] = [
        { field: "Item 111"},
        { field: "Item 2", header: true },
        { field: "Item 3" },
        { field: "Item 4", disabled: true },
        { field: "Item 5", header: true },
        { field: "Item 6" },
        { field: "Item 7" },
        { field: "Item 8", disabled: true },
        { field: "Item 9" },
        { field: "Item 10" },
        { field: "Item 11" },
        { field: "Item 12", disabled: true },
        { field: "Item 13" },
        { field: "Item 14" },
        { field: "Item 15"}
    ];

    public toggleDropDown() {
        this.dropdownDisabledAny.toggle();
    }

    public selectItem5() {
        this.dropdownDisabledAny.setSelectedItem(4);
    }
}
@Component({
    template: `
    <button (click)="toggleDropDown()">Show</button>
    <button (click)="selectItem5()">Select 5</button>
    <igx-drop-down #dropdownDisabled>
        <igx-drop-down-item *ngFor="let item of items" isDisabled={{item.disabled}} isHeader={{item.header}}>
            {{ item.field }}
        </igx-drop-down-item>
    </igx-drop-down>
    `
})
class IgxDropDownTestDisabledComponent {

    @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent })
    public dropdownDisabled: IgxDropDownComponent;

    public items: any[] = [
        { field: "Item 111", disabled: true },
        { field: "Item 2", header: true },
        { field: "Item 3" },
        { field: "Item 4", disabled: true },
        { field: "Item 5", header: true },
        { field: "Item 6" },
        { field: "Item 7" },
        { field: "Item 8", disabled: true },
        { field: "Item 9" },
        { field: "Item 10" },
        { field: "Item 11" },
        { field: "Item 12", disabled: true },
        { field: "Item 13" },
        { field: "Item 14" },
        { field: "Item 15", disabled: true }
    ];

    public toggleDropDown() {
        this.dropdownDisabled.toggle();
    }

    public selectItem5() {
        this.dropdownDisabled.setSelectedItem(4);
    }
}
