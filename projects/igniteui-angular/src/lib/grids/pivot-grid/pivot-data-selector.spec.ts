import { fakeAsync, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { DisplayDensity } from "../../core/displayDensity";
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

    it("should render a header section for the filters panel", () => {});

    it("should render a section of all filter items in an expansion panel", () => {
        expectConfigToMatchPanels(PivotDimensionType.Filter);
    });

    it("should render a header section for the columns panel", () => {});

    it("should render a section of all column items in an expansion panel", () => {
        expectConfigToMatchPanels(PivotDimensionType.Column);
    });

    it("should render a header section for the rows panel", () => {});

    it("should render a section of all row items in an expansion panel", () => {
        expectConfigToMatchPanels(PivotDimensionType.Row);
    });

    it("should render a header section for the values panel", () => {});

    it("should render a section of all value items in an expansion panel", () => {
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
