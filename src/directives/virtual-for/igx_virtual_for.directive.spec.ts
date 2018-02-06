import { Component, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IgxVirtForModule } from "./igx_virtual_for.directive";

describe("IgxVirtual directive - simple template", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CustomTemplateDirective],
            imports: [ IgxVirtForModule ]
        })
            .compileComponents();
    }));

    it("should initialize empty directive", fakeAsync(() => {
        const fix = TestBed.createComponent(CustomTemplateDirective);
        fix.detectChanges();
        const container = fix.componentInstance.container;
        const displayContainer: HTMLElement = fix.nativeElement.querySelector("display-container");
        expect(displayContainer).not.toBeNull();
    }));
});

@Component({
    template: `
        <span #container>
            <ng-template igVirtFor [igVirtForOf]="data"></ng-template>
        </span>
    `
})
export class CustomTemplateDirective {
    public data = [];

    @ViewChild("container") public container;

}
