import {
    Component,
    ViewChild
} from "@angular/core";

import { async, TestBed } from "@angular/core/testing";

import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - search API", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SimpleGridComponent
            ],
            imports: [IgxGridModule.forRoot()]
        }).compileComponents();
    }));

    it("Should clear all highlights", () => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const component: SimpleGridComponent = fix.debugElement.componentInstance;
        const count = component.gridSearch.findNext("software");
        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(5);
        expect(count).toBe(5);

        component.gridSearch.clearHighlights();
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(0);
    });

    it("findNext highlights the correct cells", () => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const component: SimpleGridComponent = fix.debugElement.componentInstance;
        let count = component.gridSearch.findNext("developer");
        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(4);
        expect(count).toBe(4);

        let activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[0]);

        count = component.gridSearch.findNext("developer");
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[1]);

        count = component.gridSearch.findNext("developer");
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[2]);

        count = component.gridSearch.findNext("developer");
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[3]);

        count = component.gridSearch.findNext("developer");
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[0]);
    });

    it("findPrev highlights the correct cells", () => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const component: SimpleGridComponent = fix.debugElement.componentInstance;
        let count = component.gridSearch.findNext("developer");
        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(4);
        expect(count).toBe(4);

        let activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[0]);

        count = component.gridSearch.findPrev("developer");
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[3]);

        count = component.gridSearch.findPrev("developer");
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[2]);

        count = component.gridSearch.findPrev("developer");
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[1]);

        count = component.gridSearch.findPrev("developer");
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[0]);
    });

    it("findPrev and findNext work properly for case sensitive seaches", () => {
        const fix = TestBed.createComponent(SimpleGridComponent);
        fix.detectChanges();

        const component: SimpleGridComponent = fix.debugElement.componentInstance;
        let count = component.gridSearch.findNext("Developer", true);
        fix.detectChanges();
        let spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        expect(spans.length).toBe(3);
        expect(count).toBe(3);

        let activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[0]);

        count = component.gridSearch.findPrev("Developer", true);
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[2]);

        count = component.gridSearch.findNext("Developer", true);
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[0]);

        count = component.gridSearch.findNext("Developer", true);
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);
        expect(activeSpan).toBe(spans[1]);

        count = component.gridSearch.findPrev("developer", true);
        fix.detectChanges();
        spans = fix.debugElement.nativeElement.querySelectorAll("." + component.highlightClass);
        activeSpan = fix.debugElement.nativeElement.querySelector("." + component.activeClass);

        expect(activeSpan).toBe(null);
        expect(count).toBe(0);
        expect(spans.length).toBe(0);
    });

});

@Component({
    template: `
        <igx-grid #gridSearch [data]="data">
            <igx-column field="ID"></igx-column>
            <igx-column field="Name"></igx-column>
            <igx-column field="JobTitle"></igx-column>
            <igx-column field="HireDate"></igx-column>
        </igx-grid>
    `
})
export class SimpleGridComponent {
    public data = [
        { ID: 1, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
        { ID: 2, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
        { ID: 3, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
        { ID: 4, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
        { ID: 5, Name: "Celia Martinez", JobTitle: "Senior Software DEVELOPER", HireDate: "2007-12-19T11:23:17.714Z" },
        { ID: 6, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
        { ID: 7, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
        { ID: 8, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
        { ID: 9, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
        { ID: 10, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "2011-11-28T11:23:17.714Z" }
    ];

    @ViewChild("gridSearch", { read: IgxGridComponent })
    public gridSearch: IgxGridComponent;

    public highlightClass = "igx-highlight";
    public activeClass = "igx-highlight__active";
}
