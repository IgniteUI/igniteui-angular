import { DebugElement } from "@angular/core";
import { fakeAsync, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { IgxCheckboxComponent } from "../../checkbox/checkbox.component";
import { SortingDirection } from "../../data-operations/sorting-strategy";
import { IgxExpansionPanelHeaderComponent } from '../../expansion-panel/expansion-panel-header.component';
import { IgxExpansionPanelComponent } from '../../expansion-panel/expansion-panel.component';
import { IgxInputDirective } from "../../input-group/public_api";
import { configureTestSuite } from "../../test-utils/configure-suite";
import { IgxPivotGridTestBaseComponent } from "../../test-utils/pivot-grid-samples.spec";
import { UIInteractions, wait } from "../../test-utils/ui-interactions.spec";
import { PivotGridType } from "../common/grid.interface";
import { IgxPivotDataSelectorComponent } from "./pivot-data-selector.component";
import {
    IPivotDimension,
    IPivotValue,
    PivotDimensionType
} from "./pivot-grid.interface";
import { Size } from '../common/enums';
import { setElementSize } from '../../test-utils/helper-utils.spec';

describe("Pivot data selector", () => {

    configureTestSuite(() => {
        return TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, IgxPivotDataSelectorComponent],
        });
    });

    it("should initialize standalone before a grid is set ", () => {
        const fixture = TestBed.createComponent(IgxPivotDataSelectorComponent);
        fixture.detectChanges();
        expect(fixture.componentInstance).toBeDefined();
    });
});

describe("Pivot data selector integration", () => {
    let fixture;
    let grid: PivotGridType;
    let selector: IgxPivotDataSelectorComponent;
    let pivotItems: (IPivotDimension | IPivotValue)[];

    configureTestSuite(() => {
        return TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxPivotGridTestBaseComponent
            ]
        });
    });

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(IgxPivotGridTestBaseComponent);
        fixture.detectChanges();
        grid = fixture.componentInstance.pivotGrid;
        selector = fixture.componentInstance.dataSelector;
        pivotItems = [
            ...grid.pivotConfiguration.rows,
            ...grid.pivotConfiguration.columns,
            ...grid.pivotConfiguration.filters,
            ...grid.pivotConfiguration.values,
        ];
    }));

    it("should set its size based on the passed grid instance size", () => {
        setElementSize(grid.nativeElement, Size.Small)
        fixture.detectChanges();
        expect((selector as any).size).toEqual(Size.Small);
    });

    it("should set through API expand states for panels with two way data binding", () => {
        spyOn(selector.filtersExpandedChange, "emit");
        spyOn(selector.columnsExpandedChange, "emit");
        spyOn(selector.rowsExpandedChange, "emit");
        spyOn(selector.valuesExpandedChange, "emit");

        const expansionPanels = fixture.debugElement.queryAll(By.directive(IgxExpansionPanelComponent));
        expect(expansionPanels.length).toEqual(4);
        expect(expansionPanels[0].componentInstance.collapsed).toBeFalse();
        expect(expansionPanels[1].componentInstance.collapsed).toBeFalse();
        expect(expansionPanels[2].componentInstance.collapsed).toBeFalse();
        expect(expansionPanels[3].componentInstance.collapsed).toBeFalse();

        fixture.componentInstance.filterExpandState = false;
        fixture.detectChanges();

        expect(expansionPanels[0].componentInstance.collapsed).toBeTruthy();
        expect(expansionPanels[1].componentInstance.collapsed).toBeFalse();
        expect(expansionPanels[2].componentInstance.collapsed).toBeFalse();
        expect(expansionPanels[3].componentInstance.collapsed).toBeFalse();

        fixture.componentInstance.columnExpandState = false;
        fixture.detectChanges();

        expect(expansionPanels[0].componentInstance.collapsed).toBeTrue();
        expect(expansionPanels[1].componentInstance.collapsed).toBeTrue();
        expect(expansionPanels[2].componentInstance.collapsed).toBeFalse();
        expect(expansionPanels[3].componentInstance.collapsed).toBeFalse();

        fixture.componentInstance.rowExpandState = false;
        fixture.detectChanges();

        expect(expansionPanels[0].componentInstance.collapsed).toBeTrue();
        expect(expansionPanels[1].componentInstance.collapsed).toBeTrue();
        expect(expansionPanels[2].componentInstance.collapsed).toBeTrue();
        expect(expansionPanels[3].componentInstance.collapsed).toBeFalse();

        fixture.componentInstance.valueExpandState = false;
        fixture.detectChanges();

        expect(expansionPanels[0].componentInstance.collapsed).toBeTrue();
        expect(expansionPanels[1].componentInstance.collapsed).toBeTrue();
        expect(expansionPanels[2].componentInstance.collapsed).toBeTrue();
        expect(expansionPanels[3].componentInstance.collapsed).toBeTrue();

        expect(selector.filtersExpandedChange.emit).not.toHaveBeenCalled();
        expect(selector.columnsExpandedChange.emit).not.toHaveBeenCalled();
        expect(selector.rowsExpandedChange.emit).not.toHaveBeenCalled();
        expect(selector.valuesExpandedChange.emit).not.toHaveBeenCalled();
    });

    it("should reflect expansion of panels through two way data binding", async() => {
        const expansionPanels = fixture.debugElement.queryAll(By.directive(IgxExpansionPanelComponent));
        const panelHeaders = fixture.debugElement.queryAll(By.directive(IgxExpansionPanelHeaderComponent));
        expect(expansionPanels.length).toEqual(4);

        expect(fixture.componentInstance.filterExpandState).toBeTrue();
        expect(fixture.componentInstance.columnExpandState).toBeTrue();
        expect(fixture.componentInstance.rowExpandState).toBeTrue();
        expect(fixture.componentInstance.valueExpandState).toBeTrue();
        expect(expansionPanels[0].componentInstance.collapsed).toBeFalse();
        expect(expansionPanels[1].componentInstance.collapsed).toBeFalse();
        expect(expansionPanels[2].componentInstance.collapsed).toBeFalse();
        expect(expansionPanels[3].componentInstance.collapsed).toBeFalse();

        UIInteractions.simulateClickEvent(panelHeaders[0].nativeElement);
        fixture.detectChanges();
        await wait(100);

        expect(fixture.componentInstance.filterExpandState).toBeFalse();
        expect(expansionPanels[0].componentInstance.collapsed).toBeTrue();

        UIInteractions.simulateClickEvent(panelHeaders[1].nativeElement);
        fixture.detectChanges();
        await wait(100);

        expect(fixture.componentInstance.columnExpandState).toBeFalse();
        expect(expansionPanels[1].componentInstance.collapsed).toBeTrue();

        UIInteractions.simulateClickEvent(panelHeaders[2].nativeElement);
        fixture.detectChanges();
        await wait(100);

        expect(fixture.componentInstance.rowExpandState).toBeFalse();
        expect(expansionPanels[2].componentInstance.collapsed).toBeTrue();

        UIInteractions.simulateClickEvent(panelHeaders[3].nativeElement);
        fixture.detectChanges();
        await wait(100);

        expect(fixture.componentInstance.valueExpandState).toBeFalse();
        expect(expansionPanels[3].componentInstance.collapsed).toBeTrue();
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

        // Clear the filter
        inputElement.value = undefined;
        inputElement.dispatchEvent(new Event("input"));
        fixture.detectChanges();
    });

    it("should enable/disable dimensions from the pivot config on checkbox click", () => {
        const dimension = grid.pivotConfiguration.columns[0];
        let items = getPanelItemsByDimensionType(PivotDimensionType.Column);

        const checkbox = fixture.debugElement
            .query(By.directive(IgxPivotDataSelectorComponent))
            .queryAll(By.directive(IgxCheckboxComponent))
            .find(
                (el: DebugElement) =>
                    el.componentInstance.ariaLabelledBy === dimension.memberName
            );

        // Initial State
        expect(dimension.enabled).toBe(true);
        expect(items.length).toEqual(grid.pivotConfiguration.columns.length);
        checkbox.nativeElement.dispatchEvent(new Event("click"));

        fixture.detectChanges();

        // After clicking on the checkbox
        items = getPanelItemsByDimensionType(PivotDimensionType.Column);
        expect(dimension.enabled).toBe(false);
        expect(items.length).toEqual(
            grid.pivotConfiguration.columns.length - 1
        );
    });

    it("should sort column and row dimensions on item click", () => {
        const colDimension = grid.pivotConfiguration.columns[0];
        const rowDimension = grid.pivotConfiguration.rows[0];
        const colSortEl = getPanelItemsByDimensionType(
            PivotDimensionType.Column
        )
            .find((item) => item.textContent.includes(colDimension.memberName))
            .parentNode.querySelector(".igx-pivot-data-selector__action-sort");
        const rowSortEl = getPanelItemsByDimensionType(PivotDimensionType.Row)
            .find((item) => item.textContent.includes(rowDimension.memberName))
            .parentNode.querySelector(".igx-pivot-data-selector__action-sort");

        colSortEl.dispatchEvent(new Event("click"));
        rowSortEl.dispatchEvent(new Event("click"));
        fixture.detectChanges();

        expect(colDimension.sortDirection).toEqual(SortingDirection.Asc);
        expect(rowDimension.sortDirection).toEqual(SortingDirection.Asc);

        colSortEl.dispatchEvent(new Event("click"));
        rowSortEl.dispatchEvent(new Event("click"));
        fixture.detectChanges();

        expect(colDimension.sortDirection).toEqual(SortingDirection.Desc);
        expect(rowDimension.sortDirection).toEqual(SortingDirection.Desc);

        colSortEl.dispatchEvent(new Event("click"));
        rowSortEl.dispatchEvent(new Event("click"));
        fixture.detectChanges();

        expect(colDimension.sortDirection).toEqual(SortingDirection.None);
        expect(rowDimension.sortDirection).toEqual(SortingDirection.None);
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

    it("should fire event handlers on reorder in a panel using drag and drop gestures", () => {
        // Get all value items
        const items = getPanelItemsByDimensionType(null);

        spyOn(selector, "ghostCreated");
        spyOn(selector, "onItemDragMove");
        spyOn(selector, "onItemDragEnd");
        spyOn(selector, "onItemDropped");

        // Get the drag handle of the last item in the panel
        const dragHandle = items[0].parentNode
            .querySelectorAll("igx-list-item")[items.length - 1].querySelector("[igxDragHandle]");

        dragHandle.scrollIntoView();
        fixture.detectChanges();

        let { x: handleX, y: handleY } = dragHandle.getBoundingClientRect();
        // Take into account that the window offset, since pointer events automatically add it.
        handleY = handleY + window.pageYOffset

        UIInteractions.simulatePointerEvent("pointerdown", dragHandle, handleX, handleY);
        fixture.detectChanges();

        UIInteractions.simulatePointerEvent("pointermove", dragHandle, handleX, handleY - 10);
        fixture.detectChanges();

        const ghost = document.body.querySelector(".igx-pivot-data-selector__item-ghost");
        expect(selector.ghostCreated).toHaveBeenCalled();

        UIInteractions.simulatePointerEvent("pointermove", ghost, handleX, handleY - 36);
        fixture.detectChanges();
        expect(selector.onItemDragMove).toHaveBeenCalled();

        UIInteractions.simulatePointerEvent("pointerup", ghost, handleX, handleY - 36);
        fixture.detectChanges();

        expect(selector.onItemDragEnd).toHaveBeenCalled();
        expect(selector.onItemDropped).toHaveBeenCalled();
    });

    it("should reorder items in a panel using drag and drop gestures", () => {
        // Get all value items
        const items = getPanelItemsByDimensionType(null);

        expect(fixture.componentInstance.pivotGrid.pivotConfiguration.values[0].member).toEqual('UnitsSold');
        expect(fixture.componentInstance.pivotGrid.pivotConfiguration.values[1].member).toEqual('UnitPrice');

        // Get the drag handle of the last item in the panel
        const dragHandle = items[0].parentNode
            .querySelectorAll("igx-list-item")[items.length - 1].querySelector("[igxDragHandle]");

        dragHandle.scrollIntoView();
        fixture.detectChanges();

        let { x: handleX, y: handleY } = dragHandle.getBoundingClientRect();
        // Take into account that the window offset, since pointer events automatically add it.
        handleY = handleY + window.pageYOffset

        UIInteractions.simulatePointerEvent("pointerdown", dragHandle, handleX, handleY);
        fixture.detectChanges();

        UIInteractions.simulatePointerEvent("pointermove", dragHandle, handleX, handleY - 10);
        fixture.detectChanges();

        const ghost = document.body.querySelector(".igx-pivot-data-selector__item-ghost");
        fixture.componentInstance.dataSelector.dropAllowed = true;

        UIInteractions.simulatePointerEvent("pointermove", ghost, handleX, handleY - 36);
        fixture.detectChanges();

        UIInteractions.simulatePointerEvent("pointerup", ghost, handleX, handleY - 36);
        fixture.detectChanges();

        expect(fixture.componentInstance.pivotGrid.pivotConfiguration.values[0].member).toEqual('UnitPrice');
        expect(fixture.componentInstance.pivotGrid.pivotConfiguration.values[1].member).toEqual('UnitsSold');
    });

    it("should call filtering menu on column and row filter click", () => {
        spyOn(grid.filteringService, "toggleFilterDropdown");

        const columnItems = getPanelItemsByDimensionType(
            PivotDimensionType.Column
        );
        const rowItems = getPanelItemsByDimensionType(PivotDimensionType.Row);

        const getFilteringIcon = (item: Node) =>
            item.parentNode
                .querySelector("igx-list-item")
                .querySelector(".igx-pivot-data-selector__action-filter");

        const colFilterActions = columnItems.map(getFilteringIcon);
        const rowFilterActions = rowItems.map(getFilteringIcon);

        colFilterActions[0].dispatchEvent(new Event('click'));
        fixture.detectChanges();

        expect(grid.filteringService.toggleFilterDropdown).toHaveBeenCalled();

        rowFilterActions[0].dispatchEvent(new Event('click'));
        fixture.detectChanges();

        expect(grid.filteringService.toggleFilterDropdown).toHaveBeenCalled();
    });

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
                .nativeElement.querySelectorAll("igx-expansion-panel-body")[panelIndex].querySelectorAll("igx-list-item") as NodeList
        );
    };
});
