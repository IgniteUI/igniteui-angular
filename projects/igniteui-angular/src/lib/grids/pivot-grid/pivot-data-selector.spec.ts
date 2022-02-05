import { fakeAsync, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { DisplayDensity } from "../../core/displayDensity";
import { IgxInputDirective } from "../../input-group/public_api";
import { configureTestSuite } from "../../test-utils/configure-suite";
import { IgxPivotGridTestBaseComponent } from "../../test-utils/pivot-grid-samples.spec";
import { PivotGridType } from "../common/grid.interface";
import { IgxPivotDataSelectorComponent } from "./pivot-data-selector.component";
import {
    IPivotDimension,
    IPivotValue,
    PivotDimensionType
} from "./pivot-grid.interface";
import { IgxPivotGridModule } from "./pivot-grid.module";

fdescribe("Pivot data selector", () => {
    let fixture;
    let grid: PivotGridType;
    let selector: IgxPivotDataSelectorComponent;
    let pivotItems: (IPivotDimension | IPivotValue)[];

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [IgxPivotGridTestBaseComponent],
            imports: [NoopAnimationsModule, IgxPivotGridModule],
        });
    });

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(IgxPivotGridTestBaseComponent);
        fixture.detectChanges();
        grid = fixture.componentInstance.pivotGrid;
        selector = fixture.componentInstance.dataSelector;
        pivotItems = [
            ...grid.pivotConfiguration.columns,
            ...grid.pivotConfiguration.rows,
            ...grid.pivotConfiguration.filters,
            ...grid.pivotConfiguration.values,
        ];
    }));

    it("should set its display density based on the passed grid instance", () => {
        grid.displayDensity = DisplayDensity.compact;
        fixture.detectChanges();
        expect(selector.displayDensity).toEqual(DisplayDensity.compact);
    });

    it("should render a list of all row, column, filter, and value dimensions", () => {
        const valueList = Array.from(
            fixture.debugElement
                .query(By.directive(IgxPivotDataSelectorComponent))
                .nativeElement.querySelectorAll(
                    ".igx-pivot-data-selector__filter > igx-list > igx-list-item"
                ) as NodeList
        );

        valueList.forEach((li, index) => {
            expect(li.textContent).toEqual(
                (pivotItems[index] as any).memberName ||
                    (pivotItems[index] as any).member
            );
        });
    });

    it("should filter the dimension list based on a search term", () => {
        const term = (
            Object.values(
                fixture.componentInstance.pivotConfigHierarchy
            )[0][0] as IPivotDimension
        ).memberName;

        const inputElement = fixture.debugElement
            .query(By.directive(IgxPivotDataSelectorComponent))
            .query(By.directive(IgxInputDirective)).nativeElement;

        inputElement.value = term;
        inputElement.dispatchEvent(new Event("input"));
        fixture.detectChanges();

        const valueList = Array.from(
            fixture.debugElement
                .query(By.directive(IgxPivotDataSelectorComponent))
                .nativeElement.querySelectorAll(
                    ".igx-pivot-data-selector__filter > igx-list > igx-list-item"
                ) as NodeList
        );

        valueList.forEach((li) => {
            expect(li.textContent).toContain(term);
        });

        expect(valueList.length).toBe(1);
    });

    it("should include/exclude a dimension from the pivot config on chekcbox selection", () => {

    });

    it("should render panel header sections for all pivot dimensions", () => {
        Object.values(PivotDimensionType).forEach((dt) => {
            if (isNaN(Number(dt))) return;
            const headerNode = getPanelHeaderByDimensionType(
                dt as PivotDimensionType
            );
            const headerTitle = selector._panels.find(
                (panel) => panel.type === (dt as PivotDimensionType)
            ).name;
            const dimensionSize = grid.getDimensionsByType(
                dt as PivotDimensionType
            ).length;

            expect(headerNode.textContent).toContain(headerTitle);
            expect(headerNode.textContent).toContain(dimensionSize);
        });
    });

    it("should render panel header section for the values", () => {
        const headerNode = getPanelHeaderByDimensionType(null);
        const headerTitle = selector._panels.find(
            (panel) => panel.type === null
        ).name;
        const valuesSize = grid.pivotConfiguration.values?.length;

        expect(headerNode.textContent).toContain(headerTitle);
        expect(headerNode.textContent).toContain(valuesSize.toString());
    });

    it("should render a section of all dimension items in a panel", () => {
        Object.values(PivotDimensionType).forEach((dt) => {
            if (isNaN(Number(dt))) return;
            expectConfigToMatchPanels(dt as PivotDimensionType);
        });
    });

    it("should render a section of all value items in a panel", () => {
        expectConfigToMatchPanels(null); // pass an invalid type (null) to test for values
    });

    it("should sort row and column dimensions on click", () => {});

    const expectConfigToMatchPanels = (dimensionType: PivotDimensionType) => {
        const items = getPanelItemsByDimensionType(dimensionType);
        let dimension: IPivotDimension[] | IPivotValue[];

        switch (dimensionType) {
            case PivotDimensionType.Filter:
                dimension = grid.pivotConfiguration.filters;
                break;
            case PivotDimensionType.Column:
                dimension = grid.pivotConfiguration.columns;
                break;
            case PivotDimensionType.Row:
                dimension = grid.pivotConfiguration.rows;
                break;
            default:
                dimension = grid.pivotConfiguration.values;
                break;
        }

        expect(items.length).toEqual(dimension.length);

        items.forEach((li, index) => {
            const item = dimension[index] as any;
            expect(li.textContent).toContain(item.memberName || item.member);
        });
    };

    const getPanelHeaderByDimensionType = (
        dimensionType: PivotDimensionType
    ) => {
        const panelIndex = selector._panels.findIndex(
            (panel) => panel.type === dimensionType
        );

        return fixture.debugElement
            .query(By.directive(IgxPivotDataSelectorComponent))
            .nativeElement.querySelectorAll("igx-expansion-panel-header")[
            panelIndex
        ] as Node;
    };

    const getPanelItemsByDimensionType = (
        dimensionType: PivotDimensionType
    ) => {
        const panelIndex = selector._panels.findIndex(
            (panel) => panel.type === dimensionType
        );

        return Array.from(
            fixture.debugElement
                .query(By.directive(IgxPivotDataSelectorComponent))
                .nativeElement.querySelectorAll("igx-expansion-panel-body")
                [panelIndex].querySelectorAll("igx-list-item") as NodeList
        );
    };
});
