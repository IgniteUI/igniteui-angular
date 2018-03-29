import { Component, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxInputGroupComponent, IgxInputGroupModule } from "./input-group.component";

const INPUT_GROUP_CSS_CLASS = "igx-input-group";
const INPUT_GROUP_BOX_CSS_CLASS = "igx-input-group--box";
const INPUT_GROUP_BORDER_CSS_CLASS = "igx-input-group--border";
const INPUT_GROUP_SEARCH_CSS_CLASS = "igx-input-group--search";

describe("IgxInputGroup", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InputGroupComponent,
                InputGroupBoxComponent,
                InputGroupBorderComponent,
                InputGroupSearchComponent
            ],
            imports: [
                IgxInputGroupModule
            ]
        })
        .compileComponents();
    }));

    it("Initializes an input group.", () => {
        const fixture = TestBed.createComponent(InputGroupComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css("igx-input-group")).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        // the default type should be line
        testInputGroupType("line", igxInputGroup, inputGroupElement);
    });

    it("Initializes an input group with type box.", () => {
        const fixture = TestBed.createComponent(InputGroupBoxComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css("igx-input-group")).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        testInputGroupType("box", igxInputGroup, inputGroupElement);
    });

    it("Initializes an input group with type border.", () => {
        const fixture = TestBed.createComponent(InputGroupBorderComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css("igx-input-group")).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        testInputGroupType("border", igxInputGroup, inputGroupElement);
    });

    it("Initializes an input group with type search.", () => {
        const fixture = TestBed.createComponent(InputGroupSearchComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css("igx-input-group")).nativeElement;
        expect(inputGroupElement.classList.contains(INPUT_GROUP_CSS_CLASS)).toBe(true);

        const igxInputGroup = fixture.componentInstance.igxInputGroup;
        testInputGroupType("search", igxInputGroup, inputGroupElement);
    });

    it("Should be able to change input group type programatically.", () => {
        const fixture = TestBed.createComponent(InputGroupComponent);
        fixture.detectChanges();

        const inputGroupElement = fixture.debugElement.query(By.css("igx-input-group")).nativeElement;
        const igxInputGroup = fixture.componentInstance.igxInputGroup;

        igxInputGroup.type = "box";
        fixture.detectChanges();
        testInputGroupType("box", igxInputGroup, inputGroupElement);

        igxInputGroup.type = "border";
        fixture.detectChanges();
        testInputGroupType("border", igxInputGroup, inputGroupElement);

        igxInputGroup.type = "search";
        fixture.detectChanges();
        testInputGroupType("search", igxInputGroup, inputGroupElement);

        igxInputGroup.type = "line";
        fixture.detectChanges();
        testInputGroupType("line", igxInputGroup, inputGroupElement);
    });
});

@Component({
    template: `<igx-input-group #igxInputGroup>
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupComponent {
    @ViewChild("igxInputGroup") public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup type="box">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupBoxComponent {
    @ViewChild("igxInputGroup") public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup type="border">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupBorderComponent {
    @ViewChild("igxInputGroup") public igxInputGroup: IgxInputGroupComponent;
}

@Component({
    template: `<igx-input-group #igxInputGroup type="search">
                    <input igxInput />
                </igx-input-group>`
})
class InputGroupSearchComponent {
    @ViewChild("igxInputGroup") public igxInputGroup: IgxInputGroupComponent;
}

function testInputGroupType(type, component: IgxInputGroupComponent, nativeElement) {
    let isLine = false;
    let isBorder = false;
    let isBox = false;
    let isSearch = false;

    switch (type) {
        case "line":
            isLine = true;
            break;
        case "border":
            isBorder = true;
            break;
        case "box":
            isBox = true;
            break;
        case "search":
            isSearch = true;
            break;
        default: break;
    }

    expect(nativeElement.classList.contains(INPUT_GROUP_BOX_CSS_CLASS)).toBe(isBox);
    expect(nativeElement.classList.contains(INPUT_GROUP_BORDER_CSS_CLASS)).toBe(isBorder);
    expect(nativeElement.classList.contains(INPUT_GROUP_SEARCH_CSS_CLASS)).toBe(isSearch);

    expect(component.isTypeLine).toBe(isLine);
    expect(component.isTypeBorder).toBe(isBorder);
    expect(component.isTypeBox).toBe(isBox);
    expect(component.isTypeSearch).toBe(isSearch);
}
