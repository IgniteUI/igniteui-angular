import { Component, DebugElement, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxGridComponent } from "./grid.component";
import { IgxGridModule } from "./index";

describe("IgxGrid - input properties", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridTestComponent
            ],
            imports: [
                NoopAnimationsModule, IgxGridModule.forRoot()]
        })
        .compileComponents();
    }));

    it("height/width should be calculated depending on number of records", async(() => {
        const fix = TestBed.createComponent(IgxGridTestComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid;
        const gridBody = fix.debugElement.query(By.css(".igx-grid__tbody"));
        const gridHeader = fix.debugElement.query(By.css(".igx-grid__thead"));
        const gridFooter = fix.debugElement.query(By.css(".igx-grid__tfoot"));
        const gridScroll = fix.debugElement.query(By.css(".igx-grid__scroll"));

        expect(grid.rowList.length).toEqual(1);
        expect(window.getComputedStyle(gridBody.nativeElement).height).toMatch("50px");

        for (let i = 2; i < 31; i++) {
            grid.addRow({ index: i, value: i});
        }

        fix.detectChanges();
        expect(grid.rowList.length).toEqual(30);
        expect(window.getComputedStyle(gridBody.nativeElement).height).toMatch("1500px");

        grid.height = "200px";
        grid.width = "200px";
        fix.detectChanges();
        let gridBodyHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10);

        expect(grid.rowList.length).toEqual(30);
        expect(window.getComputedStyle(grid.nativeElement).width).toMatch("200px");
        expect(window.getComputedStyle(grid.nativeElement).height).toMatch("200px");
        expect(parseInt(window.getComputedStyle(gridBody.nativeElement).height, 10)).toEqual(gridBodyHeight);

        grid.height = "50%";
        grid.width = "50%";
        fix.detectChanges();
        gridBodyHeight = parseInt(window.getComputedStyle(grid.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridHeader.nativeElement).height, 10)
            - parseInt(window.getComputedStyle(gridFooter.nativeElement).height, 10);

        expect(grid.rowList.length).toEqual(30);
        expect(window.getComputedStyle(grid.nativeElement).height).toMatch("300px");
        expect(window.getComputedStyle(grid.nativeElement).width).toMatch("400px");
        expect(parseInt(window.getComputedStyle(gridBody.nativeElement).height, 10)).toEqual(gridBodyHeight);
    }));
});

@Component({
    template: `<div style="width: 800px; height: 600px;">
    <igx-grid #grid [data]="data" [autoGenerate]="false" [columnWidth]="null">
        <igx-column field="index" header="index" dataType="number"></igx-column>
        <igx-column field="value" header="value" dataType="number"></igx-column>
    </igx-grid></div>`
})
export class IgxGridTestComponent {
    public data = [{ index: 1, value: 1}];

    @ViewChild("grid", { read: IgxGridComponent })
    public grid: IgxGridComponent;
}
