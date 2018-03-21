import { Component, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DataType } from "../data-operations/data-util";
import { IgxButtonModule } from "../directives/button/button.directive";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - Grid Paging", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridMarkupPagingDeclarationComponent,
                GridDeclarationComponent,
                IgxGridMarkupEditingDeclarationComponent,
                IgxGridPageChangeComponent
            ],
            imports: [IgxGridModule.forRoot(), IgxButtonModule, IgxRippleModule]
        })
            .compileComponents();
    }));

    it("should paginate data UI", async(() => {
        const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        const disabled = "igx-button--disabled";

        expect(grid.paging).toBeTruthy();
        expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized");
        expect(grid.getCellByColumn(0, "ID").value).toMatch("1");
        expect(gridElement.querySelector(".igx-paginator")).toBeDefined();

        expect(gridElement.querySelectorAll(".igx-paginator > button").length).toEqual(4);
        expect(gridElement.querySelectorAll(".igx-paginator > button")[0].className.includes(disabled)).toBeTruthy();
        expect(gridElement.querySelectorAll(".igx-paginator > button")[1].className.includes(disabled)).toBeTruthy();
        expect(gridElement.querySelectorAll(".igx-paginator > button")[2].className.includes(disabled)).toBeFalsy();
        expect(gridElement.querySelectorAll(".igx-paginator > button")[3].className.includes(disabled)).toBeFalsy();

        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("1 of 4");
        expect(gridElement.querySelectorAll(".igx-paginator > select").length).toEqual(1);

        // Go to next page
        gridElement.querySelectorAll(".igx-paginator > button")[2]. dispatchEvent(new Event("click"));

        fix.whenStable().then(() => {
            fix.detectChanges();

            expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("2 of 4");
            expect(grid.getCellByColumn(0, "ID").value).toMatch("4");
            expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized");

            expect(gridElement.querySelectorAll(".igx-paginator > button").length).toEqual(4);
            expect(gridElement.querySelectorAll(".igx-paginator > button")[0].className.includes(disabled)).toBeFalsy();
            expect(gridElement.querySelectorAll(".igx-paginator > button")[1].className.includes(disabled)).toBeFalsy();
            expect(gridElement.querySelectorAll(".igx-paginator > button")[2].className.includes(disabled)).toBeFalsy();
            expect(gridElement.querySelectorAll(".igx-paginator > button")[3].className.includes(disabled)).toBeFalsy();

            // Go to last page
            gridElement.querySelectorAll(".igx-paginator > button")[3].dispatchEvent(new Event("click"));
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("4 of 4");
            expect(grid.getCellByColumn(0, "ID").value).toMatch("10");
            expect(grid.rowList.length).toEqual(1, "Invalid number of rows initialized");

            expect(gridElement.querySelectorAll(".igx-paginator > button").length).toEqual(4);
            expect(gridElement.querySelectorAll(".igx-paginator > button")[0].className.includes(disabled)).toBeFalsy();
            expect(gridElement.querySelectorAll(".igx-paginator > button")[1].className.includes(disabled)).toBeFalsy();
            expect(gridElement.querySelectorAll(".igx-paginator > button")[2].className.includes(disabled)).toBeTruthy();
            expect(gridElement.querySelectorAll(".igx-paginator > button")[3].className.includes(disabled)).toBeTruthy();

            // Go to previous page
            gridElement.querySelectorAll(".igx-paginator > button")[1].dispatchEvent(new Event("click"));
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("3 of 4");
            expect(grid.getCellByColumn(0, "ID").value).toMatch("7");
            expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized");

            expect(gridElement.querySelectorAll(".igx-paginator > button").length).toEqual(4);
            expect(gridElement.querySelectorAll(".igx-paginator > button")[0].className.includes(disabled)).toBeFalsy();
            expect(gridElement.querySelectorAll(".igx-paginator > button")[1].className.includes(disabled)).toBeFalsy();
            expect(gridElement.querySelectorAll(".igx-paginator > button")[2].className.includes(disabled)).toBeFalsy();
            expect(gridElement.querySelectorAll(".igx-paginator > button")[3].className.includes(disabled)).toBeFalsy();

            // Go to first page
            gridElement.querySelectorAll(".igx-paginator > button")[0].dispatchEvent(new Event("click"));
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("1 of 4");
            expect(grid.getCellByColumn(0, "ID").value).toMatch("1");
            expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized");

            expect(gridElement.querySelectorAll(".igx-paginator > button").length).toEqual(4);
            expect(gridElement.querySelectorAll(".igx-paginator > button")[0].className.includes(disabled)).toBeTruthy();
            expect(gridElement.querySelectorAll(".igx-paginator > button")[1].className.includes(disabled)).toBeTruthy();
            expect(gridElement.querySelectorAll(".igx-paginator > button")[2].className.includes(disabled)).toBeFalsy();
            expect(gridElement.querySelectorAll(".igx-paginator > button")[3].className.includes(disabled)).toBeFalsy();
        });
    }));

    it("should paginate data API", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");

        grid.paging = true;
        grid.perPage = 3;

        // Goto page 3 through API and listen for event
        spyOn(grid.onPagingDone, "emit");
        grid.paginate(2);

        fix.whenStable().then(() => {
            fix.detectChanges();

            expect(grid.onPagingDone.emit).toHaveBeenCalled();
            expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("3 of 4");
            expect(grid.getCellByColumn(0, "ID").value).toMatch("7");
        });
    }));

    it("change paging settings UI", async(() => {
        const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        const disabled = "igx-button--disabled";

        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(3, "Invalid page size");
        expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized");
        expect(grid.getCellByColumn(0, "ID").value).toMatch("1");
        expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized");
        expect(gridElement.querySelector(".igx-paginator")).toBeDefined();
        expect(gridElement.querySelectorAll(".igx-paginator > select").length).toEqual(1);

        // Change page size
        const select = fix.debugElement.query(By.css(".igx-paginator > select"));
        select.triggerEventHandler("change", { target: { value: 10 } });

        fix.whenStable().then(() => {
            fix.detectChanges();

            expect(grid.paging).toBeTruthy();
            expect(grid.perPage).toEqual(10, "Invalid page size");
            expect(grid.rowList.length).toEqual(10, "Invalid number of rows initialized");
            expect(grid.getCellByColumn(0, "ID").value).toMatch("1");
            expect(grid.rowList.length).toEqual(10, "Invalid number of rows initialized");
            expect(gridElement.querySelector(".igx-paginator")).toBeDefined();
            expect(gridElement.querySelectorAll(".igx-paginator > select").length).toEqual(1);
        });
    }));

    it("change paging settings API", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        const disabled = "igx-button--disabled";

        // Change page size
        grid.paging = true;
        grid.perPage = 2;

        fix.detectChanges();

        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toEqual(2, "Invalid page size");
        expect(grid.rowList.length).toEqual(2, "Invalid number of rows initialized");
        expect(grid.getCellByColumn(0, "ID").value).toMatch("1");
        expect(gridElement.querySelector(".igx-paginator")).toBeDefined();
        expect(gridElement.querySelectorAll(".igx-paginator > select").length).toEqual(1);
        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("1 of 5");

        // Turn off paging
        grid.paging = false;

        fix.detectChanges();

        expect(grid.paging).toBeFalsy();
        expect(grid.perPage).toEqual(2, "Invalid page size after paging was turned off");
        expect(grid.rowList.length).toEqual(10, "Invalid number of rows initialized");
        expect(grid.getCellByColumn(0, "ID").value).toMatch("1");
        expect(gridElement.querySelector(".igx-paginator")).toBeNull();
        expect(gridElement.querySelectorAll(".igx-paginator > select").length).toEqual(0);
    }));

    it("change paging with button", async(() => {
        const fix = TestBed.createComponent(IgxGridPageChangeComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        const gridElement: HTMLElement = fix.nativeElement.querySelector(".igx-grid");
        const nextBtn: HTMLElement = fix.nativeElement.querySelector("#nextPageBtn");
        const prevBtn: HTMLElement = fix.nativeElement.querySelector("#prevPageBtn");
        const idxPageBtn: HTMLElement = fix.nativeElement.querySelector("#idxPageBtn");

        expect(nextBtn).toBeTruthy();
        expect(prevBtn).toBeTruthy();
        expect(idxPageBtn).toBeTruthy();

        expect(grid.paging).toBeTruthy();
        expect(grid.perPage).toMatch("4", "Invalid page size");
        expect(grid.page).toEqual(0);
        expect(grid.rowList.length).toEqual(4, "Invalid number of rows initialized");
        expect(grid.getCellByColumn(0, "ID").value).toMatch("1");
        expect(gridElement.querySelector(".igx-paginator")).toBeDefined();
        expect(gridElement.querySelectorAll(".igx-paginator > select").length).toEqual(1);
        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("1 of 3");

        // Next page button click
        nextBtn.click();
        fix.detectChanges();

        expect(grid.page).toEqual(1, "Invalid page index");
        expect(grid.getCellByColumn(0, "ID").value).toMatch("5");
        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("2 of 3");

        // Previous page button click
        prevBtn.click();
        fix.detectChanges();

        expect(grid.page).toEqual(0, "Invalid page index");
        expect(grid.getCellByColumn(0, "ID").value).toMatch("1");
        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("1 of 3");

        // Go to 3rd page button click
        idxPageBtn.click();
        fix.detectChanges();

        expect(grid.page).toEqual(2, "Invalid page index");
        expect(grid.getCellByColumn(0, "ID").value).toMatch("9");
        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("3 of 3");
    }));
});

const data = [
    { ID: 1, Name: "Casey Houston", JobTitle: "Vice President", HireDate: "2017-06-19T11:43:07.714Z" },
    { ID: 2, Name: "Gilberto Todd", JobTitle: "Director", HireDate: "2015-12-18T11:23:17.714Z" },
    { ID: 3, Name: "Tanya Bennett", JobTitle: "Director", HireDate: "2005-11-18T11:23:17.714Z" },
    { ID: 4, Name: "Jack Simon", JobTitle: "Software Developer", HireDate: "2008-12-18T11:23:17.714Z" },
    { ID: 5, Name: "Celia Martinez", JobTitle: "Senior Software Developer", HireDate: "2007-12-19T11:23:17.714Z" },
    { ID: 6, Name: "Erma Walsh", JobTitle: "CEO", HireDate: "2016-12-18T11:23:17.714Z" },
    { ID: 7, Name: "Debra Morton", JobTitle: "Associate Software Developer", HireDate: "2005-11-19T11:23:17.714Z" },
    // tslint:disable-next-line:object-literal-sort-keys
    { ID: 8, Name: "Erika Wells", JobTitle: "Software Development Team Lead", HireDate: "2005-10-14T11:23:17.714Z" },
    // tslint:disable-next-line:object-literal-sort-keys
    { ID: 9, Name: "Leslie Hansen", JobTitle: "Associate Software Developer", HireDate: "2013-10-10T11:23:17.714Z" },
    { ID: 10, Name: "Eduardo Ramirez", JobTitle: "Manager", HireDate: "2011-11-28T11:23:17.714Z" }
];

@Component({
    template: `
        <igx-grid #grid1 [data]="data" [paging]="true" [perPage]="3">
            <igx-column field="ID"></igx-column>
            <igx-column field="Name"></igx-column>
            <igx-column field="JobTitle"></igx-column>
        </igx-grid>
    `
})
export class GridMarkupPagingDeclarationComponent {
    public data = data;

    @ViewChild("grid1", { read: IgxGridComponent })
    public grid1: IgxGridComponent;
}

@Component({
    template: `
    <igx-grid #grid1 [data]="data">
        <igx-column field="ID"></igx-column>
        <igx-column field="Name"></igx-column>
        <igx-column field="JobTitle"></igx-column>
    </igx-grid>
    `
})
export class GridDeclarationComponent {

    public data = data;

    @ViewChild("grid1", { read: IgxGridComponent })
    public grid1: IgxGridComponent;
}

@Component({
    template: `
    <igx-grid #grid1 [data]="data">
        <igx-column field="ID"></igx-column>
        <igx-column field="Name" [editable]="true"></igx-column>
        <igx-column field="JobTitle" [editable]="true"></igx-column>
    </igx-grid>
    `
})
export class IgxGridMarkupEditingDeclarationComponent {

    public data = data;

    @ViewChild("grid1", { read: IgxGridComponent })
    public grid1: IgxGridComponent;
}

@Component({
    template: `
    <igx-grid #grid1 [data]="data" paging="true" perPage="4">
        <igx-column field="ID"></igx-column>
        <igx-column field="Name" [editable]="true"></igx-column>
        <igx-column field="JobTitle" [editable]="true"></igx-column>
    </igx-grid>
    <button id="prevPageBtn" igxButton (click)="GoToPage(-2)">Prev page</button>
    <button id="nextPageBtn" igxButton (click)="GoToPage(-1)">Next page</button>
    <button id="idxPageBtn" igxButton (click)="GoToPage(2)">Go to 3rd page</button>
    `
})
export class IgxGridPageChangeComponent {

    public data = data;

    @ViewChild("grid1", { read: IgxGridComponent })
    public grid1: IgxGridComponent;

    public GoToPage(val) {
        switch (val) {
        case -2:
            this.grid1.previousPage();
            break;
        case -1:
            this.grid1.nextPage();
            break;
        default:
            this.grid1.paginate(val);
            break;
    }
}
}
