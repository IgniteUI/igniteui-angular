import { async, TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { Component, ViewChild, DebugElement, AfterViewInit } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnComponent, IgxColumnGroupComponent } from '../column.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { By } from '@angular/platform-browser';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { wait } from '../../test-utils/ui-interactions.spec';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxGridHeaderComponent } from '../grid-header.component';

const GRID_COL_THEAD_TITLE_CLASS = 'igx-grid__th-title';
const GRID_COL_GROUP_THEAD_TITLE_CLASS = 'igx-grid__thead-title';
const GRID_COL_GROUP_THEAD_GROUP_CLASS = 'igx-grid__thead-group';
const GRID_COL_THEAD_CLASS = '.igx-grid__th';

describe('IgxGrid - multi-column headers', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                OneGroupOneColGridComponent,
                OneGroupThreeColsGridComponent,
                BlueWhaleGridComponent,
                ColumnGroupTestComponent,
                ColumnGroupChildLevelTestComponent,
                ColumnGroupFourLevelTestComponent,
                ThreeGroupsThreeColumnsGridComponent,
                ColumnGroupTwoGroupsTestComponent,
                NestedColGroupsGridComponent,
                StegosaurusGridComponent,
                ColumnGroupGroupingTestComponent,
                EmptyColGridComponent,
                OneColPerGroupGridComponent,
                NestedColumnGroupsGridComponent,
                DynamicGridComponent,
                NumberColWidthGridComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule.forRoot()
            ]
        }).compileComponents();
    }));

    it('should initialize a grid with column groups', () => {
        const fixture = TestBed.createComponent(ColumnGroupTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const expectedColumnGroups = 5;
        const expectedLevel = 2;

        expect(grid.columnList.filter(col => col.columnGroup).length).toEqual(expectedColumnGroups);
        expect(grid.getColumnByName('ContactName').level).toEqual(expectedLevel);
    });

    it('column hiding - parent level', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        tick();
        const addressGroup = grid.columnList.filter(c => c.header === 'Address Information')[0];

        addressGroup.hidden = true;
        tick();

        expect(document.querySelectorAll('igx-grid-header').length).toEqual(4);
        expect(document.querySelectorAll('igx-grid-header-group').length).toEqual(6);
    }));

    it('column hiding - child level', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupChildLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        tick();
        const addressGroup = grid.columnList.filter(c => c.header === 'Address')[0];

        addressGroup.children.first.hidden = true;
        tick();

        expect(document.querySelectorAll('igx-grid-header-group').length).toEqual(5);
        expect(addressGroup.children.first.hidden).toBe(true);
        expect(addressGroup.children.first.children.toArray().every(c => c.hidden === true)).toEqual(true);
    }));

    it('column hiding - Verify column hiding of Individual column and Child column', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        tick();
        testGroupsAndColumns(18, 11);

        // Hide individual column
        grid.getColumnByName('ID').hidden = true;
        tick();

        testGroupsAndColumns(17, 10);

        // Hide column in goup
        grid.getColumnByName('CompanyName').hidden = true;
        tick();
        expect(document.querySelectorAll('igx-grid-header-group').length).toEqual(16);
        expect(fixture.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS)).length).toEqual(9);

        grid.getColumnByName('Address').hidden = true;
        tick();

        testGroupsAndColumns(15, 8);
    }));

    it('column hiding - Verify when 2 of 2 child columns are hidden, the Grouped column would be hidden as well.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        tick();

        testGroupsAndColumns(18, 11);

        // Hide 2 columns in the group
        grid.getColumnByName('ContactName').hidden = true;
        tick();
        grid.getColumnByName('ContactTitle').hidden = true;
        tick();

        testGroupsAndColumns(15, 9);
        expect(getColGroup(grid, 'Person Details').hidden).toEqual(true);

        // Show one of the columns
        grid.getColumnByName('ContactName').hidden = false;
        tick();

        testGroupsAndColumns(17, 10);
        expect(getColGroup(grid, 'Person Details').hidden).toEqual(false);
    }));

    it('column hiding - Verify when 1 child column and 1 group are hidden, the Grouped column would be hidden as well.',
    fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        tick();

        testGroupsAndColumns(18, 11);

        // Hide 2 columns in the group
        grid.getColumnByName('CompanyName').hidden = true;
        tick();
        getColGroup(grid, 'Person Details').hidden = true;
        tick();

        testGroupsAndColumns(13, 8);
        expect(getColGroup(grid, 'General Information').hidden).toEqual(true);

        // Show the group
        getColGroup(grid, 'Person Details').hidden = false;
        tick();
        testGroupsAndColumns(17, 10);
        expect(getColGroup(grid, 'General Information').hidden).toEqual(false);
    }));

    it('Width should be correct. Column group with column. No width.', () => {
        const fixture = TestBed.createComponent(OneGroupOneColGridComponent);
        fixture.detectChanges();

        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        const locationColGroup = getColGroup(grid, 'Location');
        expect(locationColGroup.width).toBe(componentInstance.gridWrapperWidthPx);
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(componentInstance.gridWrapperWidthPx);
    });

    it('Width should be correct. Column group with column. Width in px.', fakeAsync(() => {
        const fixture = TestBed.createComponent(OneGroupOneColGridComponent);
        const gridWidth = '600px';
        const gridWidthPx = parseInt(gridWidth, 10);
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        grid.width = gridWidth;
        tick();
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        expect(locationColGroup.width).toBe(gridWidthPx.toString());
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(gridWidthPx.toString());
    }));

    it('Width should be correct. Column group with column. Width in percent.', fakeAsync(() => {
        const fixture = TestBed.createComponent(OneGroupOneColGridComponent);
        const gridWidth = '50%';
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        tick();
        grid.width = gridWidth;
        tick();
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        const gridWidthInPx = (parseInt(gridWidth, 10) / 100) *
            parseInt(componentInstance.gridWrapperWidthPx, 10);
        expect(locationColGroup.width).toBe(gridWidthInPx.toString());
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(gridWidthInPx.toString());
    }));

    it('Width should be correct. Column group with column. Column width in px.', () => {
        const fixture = TestBed.createComponent(OneGroupOneColGridComponent);
        const gridColWidth = '200px';
        const gridColWidthPx = parseInt(gridColWidth, 10);
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        grid.columnWidth = gridColWidth;
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        expect(locationColGroup.width).toBe(gridColWidthPx.toString());
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(gridColWidth);
    });

    it('Width should be correct. Column group with column. Column width in percent.', () => {
        const fixture = TestBed.createComponent(OneGroupOneColGridComponent);
        const gridColWidth = '50%';
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        grid.columnWidth = gridColWidth;
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        expect(locationColGroup.width).toBe(gridColWidth);
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(gridColWidth);
    });

    it('Width should be correct. Column group with column. Column with width in px.', () => {
        const fixture = TestBed.createComponent(OneGroupOneColGridComponent);
        const columnWidth = '200px';
        const columnWidthPx = parseInt(columnWidth, 10);
        const componentInstance = fixture.componentInstance;
        componentInstance.columnWidth = columnWidth;
        const grid = componentInstance.grid;
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        expect(locationColGroup.width).toBe(columnWidthPx.toString());
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(columnWidth);
    });

    it('Width should be correct. Column group with column. Column with width in percent.', () => {
        const fixture = TestBed.createComponent(OneGroupOneColGridComponent);
        const columnWidth = '50%';
        const componentInstance = fixture.componentInstance;
        componentInstance.columnWidth = columnWidth;
        const grid = componentInstance.grid;
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        expect(locationColGroup.width).toBe(columnWidth);
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(columnWidth);
    });

    it('Width should be correct. Column group with three columns. No width.', () => {
        const fixture = TestBed.createComponent(OneGroupThreeColsGridComponent);
        fixture.detectChanges();

        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        const locationColGroup = getColGroup(grid, 'Location');
        expect(locationColGroup.width).toBe(componentInstance.gridWrapperWidthPx);
        const colWidth = parseInt(componentInstance.gridWrapperWidthPx, 10) / 3;
        const countryColumn = grid.getColumnByName('Country');
        expect(countryColumn.width).toBe(colWidth.toString());
        const regionColumn = grid.getColumnByName('Region');
        expect(regionColumn.width).toBe(colWidth.toString());
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(colWidth.toString());
    });

    it('Width should be correct. Column group with three columns. Width in px.', fakeAsync(() => {
        const fixture = TestBed.createComponent(OneGroupThreeColsGridComponent);
        const gridWidth = '600px';
        const gridWidthInPx = parseInt(gridWidth, 10);
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        grid.width = gridWidth;
        tick();
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        expect(locationColGroup.width).toBe(gridWidthInPx.toString());
        const colWidth = parseInt(gridWidth, 10) / 3;
        const countryColumn = grid.getColumnByName('Country');
        expect(countryColumn.width).toBe(colWidth.toString());
        const regionColumn = grid.getColumnByName('Region');
        expect(regionColumn.width).toBe(colWidth.toString());
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(colWidth.toString());
    }));

    it('Width should be correct. Column group with three columns. Width in percent.', fakeAsync(() => {
        const fixture = TestBed.createComponent(OneGroupThreeColsGridComponent);
        const gridWidth = '50%';
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        grid.width = gridWidth;
        tick();
        fixture.detectChanges();

        const gridWidthInPx = (parseInt(gridWidth, 10) / 100) *
            parseInt(componentInstance.gridWrapperWidthPx, 10);
        const colWidth = gridWidthInPx / 3;
        const locationColGroup = getColGroup(grid, 'Location');
        expect(locationColGroup.width).toBe(gridWidthInPx.toString());
        const countryColumn = grid.getColumnByName('Country');
        expect(countryColumn.width).toBe(colWidth.toString());
        const regionColumn = grid.getColumnByName('Region');
        expect(regionColumn.width).toBe(colWidth.toString());
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(colWidth.toString());
    }));

    it('Width should be correct. Column group with three columns. Column width in px.', () => {
        const fixture = TestBed.createComponent(OneGroupThreeColsGridComponent);
        const gridColWidth = '200px';
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        grid.columnWidth = gridColWidth;
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        const gridWidth = parseInt(gridColWidth, 10) * 3;
        expect(locationColGroup.width).toBe(gridWidth.toString());
        const countryColumn = grid.getColumnByName('Country');
        expect(countryColumn.width).toBe(gridColWidth);
        const regionColumn = grid.getColumnByName('Region');
        expect(regionColumn.width).toBe(gridColWidth);
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(gridColWidth);
    });

    it('Width should be correct. Colum group with three columns. Column width in percent.', () => {
        const fixture = TestBed.createComponent(OneGroupThreeColsGridComponent);
        const gridColWidth = '20%';
        const groupWidth = '60%';
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        grid.columnWidth = gridColWidth;
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        expect(locationColGroup.width).toBe(groupWidth);
        const countryColumn = grid.getColumnByName('Country');
        expect(countryColumn.width).toBe(gridColWidth);
        const regionColumn = grid.getColumnByName('Region');
        expect(regionColumn.width).toBe(gridColWidth);
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(gridColWidth);
    });

    it('Width should be correct. Column group with three columns. Columns with width in px.', () => {
        const fixture = TestBed.createComponent(OneGroupThreeColsGridComponent);
        const columnWidth = '200px';
        const componentInstance = fixture.componentInstance;
        componentInstance.columnWidth = columnWidth;
        const grid = componentInstance.grid;
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        const groupWidth = parseInt(columnWidth, 10) * 3;
        expect(locationColGroup.width).toBe(groupWidth.toString());
        const countryColumn = grid.getColumnByName('Country');
        expect(countryColumn.width).toBe(columnWidth);
        const regionColumn = grid.getColumnByName('Region');
        expect(regionColumn.width).toBe(columnWidth);
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(columnWidth);
    });

    it('Width should be correct. Column group with three columns. Columns with width in percent.', () => {
        const fixture = TestBed.createComponent(OneGroupThreeColsGridComponent);
        const columnWidth = '20%';
        const groupWidth = '60%';
        const componentInstance = fixture.componentInstance;
        componentInstance.columnWidth = columnWidth;
        const grid = componentInstance.grid;
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        expect(locationColGroup.width).toBe(groupWidth);
        const countryColumn = grid.getColumnByName('Country');
        expect(countryColumn.width).toBe(columnWidth);
        const regionColumn = grid.getColumnByName('Region');
        expect(regionColumn.width).toBe(columnWidth);
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(columnWidth);
    });

    it('API method level should return correct values', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Fax').hidden = true;
        tick();
        getColGroup(grid, 'Person Details').hidden = true;
        tick();

        expect(grid.columnList.filter(col => col.columnGroup).length).toEqual(7);

        // Get level of column
        expect(grid.getColumnByName('ID').level).toEqual(0);
        expect(grid.getColumnByName('CompanyName').level).toEqual(1);
        expect(grid.getColumnByName('Country').level).toEqual(2);
        expect(grid.getColumnByName('City').level).toEqual(3);
        expect(grid.getColumnByName('PostalCode').level).toEqual(2);
        // Get level of hidden column
        expect(grid.getColumnByName('Fax').level).toEqual(2);
        // Get level of column in hidden group
        expect(grid.getColumnByName('ContactTitle').level).toEqual(2);

        // Get level of grouped column
        expect(getColGroup(grid, 'General Information').level).toEqual(0);
        expect(getColGroup(grid, 'Location').level).toEqual(1);
        expect(getColGroup(grid, 'Location City').level).toEqual(2);
        expect(getColGroup(grid, 'Contact Information').level).toEqual(1);
        expect(getColGroup(grid, 'Postal Code').level).toEqual(1);
        // Get level of hidden group
        expect(getColGroup(grid, 'Person Details').level).toEqual(1);
    }));

    it('API method columnGroup should return correct values', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Fax').hidden = true;
        tick();
        getColGroup(grid, 'Person Details').hidden = true;
        tick();

        expect(grid.columnList.filter(col => col.columnGroup).length).toEqual(7);
        // Get columnGroup of column
        expect(grid.getColumnByName('ID').columnGroup).toEqual(false);
        expect(grid.getColumnByName('Fax').columnGroup).toEqual(false);
        expect(grid.getColumnByName('ContactTitle').columnGroup).toEqual(false);

        // Get columnGroup of grouped column
        expect(getColGroup(grid, 'General Information').columnGroup).toEqual(true);
        expect(getColGroup(grid, 'Location City').columnGroup).toEqual(true);
        expect(getColGroup(grid, 'Contact Information').columnGroup).toEqual(true);
        expect(getColGroup(grid, 'Postal Code').columnGroup).toEqual(true);
        expect(getColGroup(grid, 'Person Details').columnGroup).toEqual(true);
    }));

    it('API method allChildren should return correct values', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Fax').hidden = true;
        tick();
        getColGroup(grid, 'Person Details').hidden = true;
        tick();

        expect(grid.columnList.filter(col => col.columnGroup).length).toEqual(7);
        // Get allChildren of column
        expect(grid.getColumnByName('ID').allChildren.length).toEqual(0);
        expect(grid.getColumnByName('PostalCode').allChildren.length).toEqual(0);
        // Get allChildren of hidden column
        expect(grid.getColumnByName('Fax').allChildren.length).toEqual(0);

        // Get allChildren of group
        const genInfGroupedColumnAllChildren = getColGroup(grid, 'General Information').allChildren;
        expect(genInfGroupedColumnAllChildren.length).toEqual(4);
        expect(genInfGroupedColumnAllChildren.indexOf(getColGroup(grid, 'Person Details'))).toBeGreaterThanOrEqual(0);

        // Get allChildren of hidden group
        expect(getColGroup(grid, 'Person Details').allChildren.length).toEqual(2);

        // Get allChildren of group with one column
        const postCodeGroupedColumnAllChildren = getColGroup(grid, 'Postal Code').allChildren;
        expect(postCodeGroupedColumnAllChildren.length).toEqual(1);
        expect(postCodeGroupedColumnAllChildren.indexOf(grid.getColumnByName('PostalCode'))).toEqual(0);

        // Get allChildren of group with hidden columns and more levels
        const addressGroupedColumnAllChildren = getColGroup(grid, 'Address Information').allChildren;
        expect(addressGroupedColumnAllChildren.length).toEqual(11);
        expect(addressGroupedColumnAllChildren.indexOf(getColGroup(grid, 'Postal Code'))).toBeGreaterThanOrEqual(0);
        expect(addressGroupedColumnAllChildren.indexOf(grid.getColumnByName('PostalCode'))).toBeGreaterThanOrEqual(0);
        expect(addressGroupedColumnAllChildren.indexOf(grid.getColumnByName('Address'))).toBeGreaterThanOrEqual(0);
        expect(addressGroupedColumnAllChildren.indexOf(grid.getColumnByName('Country'))).toBeGreaterThanOrEqual(0);
        expect(addressGroupedColumnAllChildren.indexOf(grid.getColumnByName('Fax'))).toBeGreaterThanOrEqual(0);
        expect(addressGroupedColumnAllChildren.indexOf(getColGroup(grid, 'General Information'))).toEqual(-1);
    }));

    it('API method children should return correct values', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Fax').hidden = true;
        tick();
        getColGroup(grid, 'Person Details').hidden = true;
        tick();

        expect(grid.columnList.filter(col => col.columnGroup).length).toEqual(7);

        // Get children of grouped column
        expect(getColGroup(grid, 'General Information').children.length).toEqual(2);

        // Get children of hidden group
        expect(getColGroup(grid, 'Person Details').children.length).toEqual(2);

        // Get children of group with one column
        const postCodeGroupedColumnAllChildren = getColGroup(grid, 'Postal Code').children;
        expect(postCodeGroupedColumnAllChildren.length).toEqual(1);

        // Get children of group with more levels
        const addressGroupedColumnAllChildren = getColGroup(grid, 'Address Information').children;
        expect(addressGroupedColumnAllChildren.length).toEqual(3);
    }));

    it('API method topLevelParent should return correct values', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Fax').hidden = true;
        tick();
        getColGroup(grid, 'Person Details').hidden = true;
        tick();

        expect(grid.columnList.filter(col => col.columnGroup).length).toEqual(7);

        // Get topLevelParent of column with no group
        expect(grid.getColumnByName('ID').topLevelParent).toBeNull();

        // Get topLevelParent of column
        const addressGroupedColumn = getColGroup(grid, 'Address Information');
        expect(grid.getColumnByName('PostalCode').topLevelParent).toEqual(addressGroupedColumn);
        expect(grid.getColumnByName('Fax').topLevelParent).toEqual(addressGroupedColumn);
        expect(grid.getColumnByName('Country').topLevelParent).toEqual(addressGroupedColumn);

        const genInfGroupedColumn = getColGroup(grid, 'General Information');
        expect(grid.getColumnByName('ContactName').topLevelParent).toEqual(genInfGroupedColumn);
        expect(grid.getColumnByName('CompanyName').topLevelParent).toEqual(genInfGroupedColumn);

        // Get topLevelParent of top group
        expect(genInfGroupedColumn.topLevelParent).toBeNull();
        expect(addressGroupedColumn.topLevelParent).toBeNull();

        // Get topLevelParent of group
        expect(getColGroup(grid, 'Person Details').topLevelParent).toEqual(genInfGroupedColumn);
        expect(getColGroup(grid, 'Postal Code').topLevelParent).toEqual(addressGroupedColumn);
        expect(getColGroup(grid, 'Location City').topLevelParent).toEqual(addressGroupedColumn);
    }));

    it('Should render column group headers correctly.', ((done) => {
        const fixture = TestBed.createComponent(BlueWhaleGridComponent);
        fixture.detectChanges();
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        const columnWidthPx = parseInt(componentInstance.columnWidth, 10);
        // 2 levels of column group and 1 level of columns
        const gridHeadersDepth = 3;

        const firstGroupChildrenCount = 100;
        const secondGroupChildrenCount = 2;
        const secondSubGroupChildrenCount = 50;
        const secondSubGroupHeadersDepth = 2;

        fixture.detectChanges();
        const firstGroup = fixture.debugElement.query(By.css('.firstGroup'));
        testColumnGroupHeaderRendering(firstGroup, firstGroupChildrenCount * columnWidthPx,
            gridHeadersDepth * grid.defaultRowHeight, componentInstance.firstGroupTitle,
            'firstGroupColumn', firstGroupChildrenCount);

        let horizontalScroll = grid.parentVirtDir.getHorizontalScroll();
        let scrollToNextGroup = firstGroupChildrenCount * columnWidthPx + columnWidthPx;
        horizontalScroll.scrollLeft = scrollToNextGroup;

        setTimeout(() => {
            fixture.detectChanges();
            const secondGroup = fixture.debugElement.query(By.css('.secondGroup'));
            testColumnGroupHeaderRendering(secondGroup,
                secondGroupChildrenCount * secondSubGroupChildrenCount * columnWidthPx,
                gridHeadersDepth * grid.defaultRowHeight, componentInstance.secondGroupTitle,
                'secondSubGroup', 0);

            const secondSubGroups = secondGroup.queryAll(By.css('.secondSubGroup'));
            testColumnGroupHeaderRendering(secondSubGroups[0],
                secondSubGroupChildrenCount * columnWidthPx,
                secondSubGroupHeadersDepth * grid.defaultRowHeight, componentInstance.secondSubGroupTitle,
                'secondSubGroupColumn', secondSubGroupChildrenCount);

            testColumnGroupHeaderRendering(secondSubGroups[1],
                secondSubGroupChildrenCount * columnWidthPx,
                secondSubGroupHeadersDepth * grid.defaultRowHeight, componentInstance.secondSubGroupTitle,
                'secondSubGroupColumn', secondSubGroupChildrenCount);

            horizontalScroll = grid.parentVirtDir.getHorizontalScroll();
            scrollToNextGroup = horizontalScroll.scrollLeft +
                secondSubGroupHeadersDepth * secondSubGroupChildrenCount * columnWidthPx;

            horizontalScroll.scrollLeft = scrollToNextGroup;
            setTimeout(() => {
                fixture.detectChanges();

                const idColumn = fixture.debugElement.query(By.css('.lonelyId'));
                testColumnHeaderRendering(idColumn, columnWidthPx,
                    gridHeadersDepth * grid.defaultRowHeight, componentInstance.idHeaderTitle);

                const companyNameColumn = fixture.debugElement.query(By.css('.companyName'));
                testColumnHeaderRendering(companyNameColumn, columnWidthPx,
                    2 * grid.defaultRowHeight, componentInstance.companyNameTitle);

                const personDetailsColumn = fixture.debugElement.query(By.css('.personDetails'));
                testColumnGroupHeaderRendering(personDetailsColumn, 2 * columnWidthPx,
                    2 * grid.defaultRowHeight, componentInstance.personDetailsTitle,
                    'personDetailsColumn', 2);
                done();
            }, 200);
        }, 100);
    }));

    it('column pinning - Pin a column in a group using property.', fakeAsync(() => {
        PinningTests.testColumnGroupPinning((component) => {
            component.contactTitleCol.pinned = true;
            tick();
        }, (component) => {
            component.contactTitleCol.pinned = false;
            tick();
        });
    }));

    it('column pinning - Pin a column in a group using grid API.', fakeAsync(() => {
        PinningTests.testColumnGroupPinning((component) => {
            component.grid.pinColumn(component.contactTitleCol);
            tick();
        }, (component) => {
            component.grid.unpinColumn(component.contactTitleCol);
            tick();
        });
    }));

    it('column pinning - Pin an inner column group using property.', fakeAsync(() => {
        PinningTests.testColumnGroupPinning((component) => {
            component.pDetailsColGroup.pinned = true;
            tick();
        }, (component) => {
            component.pDetailsColGroup.pinned = false;
            tick();
        });
    }));

    it('column pinning - Pin an inner column group using grid API.', fakeAsync(() => {
        PinningTests.testColumnGroupPinning((component) => {
            component.grid.pinColumn(component.pDetailsColGroup);
            tick();
        }, (component) => {
            component.grid.unpinColumn(component.pDetailsColGroup);
            tick();
        });
    }));

    it('column pinning - Pin a group using property.', fakeAsync(() => {
        PinningTests.testColumnGroupPinning((component) => {
            component.genInfoColGroup.pinned = true;
            tick();
        }, (component) => {
            component.genInfoColGroup.pinned = false;
            tick();
        });
    }));

    it('column pinning - Pin a group using API.', fakeAsync(() => {
        PinningTests.testColumnGroupPinning((component) => {
            component.grid.pinColumn(component.genInfoColGroup);
            tick();
        }, (component) => {
            component.grid.unpinColumn(component.genInfoColGroup);
            tick();
        });
    }));

    it('column pinning - Try to pin column or group which exceeds the pinned area width.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;
        const grid = ci.grid;
        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);

        // Try to pin top group
        ci.addrInfoColGroup.pinned = true;
        tick();

        // Verify group and all its children are not pinned
        testColumnPinning(ci.addrInfoColGroup, false);
        testColumnsOrder(ci.colsAndGroupsNaturalOrder);

        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);

        // Try to pin a column
        ci.faxCol.pinned = true;
        tick();

        // Verify group and all its children are not pinned
        testColumnPinning(ci.addrInfoColGroup, false);
        testColumnsOrder(ci.colsAndGroupsNaturalOrder);

        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);

        // Try to pin child group
        ci.contactInfoColGroup.pinned = true;
        tick();

        // Verify group and all its children are not pinned
        testColumnPinning(ci.addrInfoColGroup, false);
        testColumnsOrder(ci.colsAndGroupsNaturalOrder);

        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);
    }));

    it('column pinning - Verify pin a not fully visble group', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupTwoGroupsTestComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;
        const grid = ci.grid;
        tick();
        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(13);

        // Pin a Group which is not fully visble
        const grAdressInf = getColGroup(grid, 'Address Information');
        tick();
        grAdressInf.pinned = true;
        tick();

        // Verify group and all its children are not pinned
        testColumnPinning(grAdressInf, true);

        expect(grid.getCellByColumn(0, 'ID')).toBeDefined();
        expect(grid.getCellByColumn(0, 'Country')).toBeDefined();
        expect(grid.getCellByColumn(0, 'City')).toBeDefined();

        expect(grid.getCellByColumn(0, 'ID').value).toEqual('ALFKI');
        expect(grid.getCellByColumn(0, 'Country').value).toEqual('Germany');
        expect(grid.getCellByColumn(0, 'City').value).toEqual('Berlin');
    }));

    it('Should pin column groups using indexes correctly.', fakeAsync(() => {
        const fixture = TestBed.createComponent(StegosaurusGridComponent);
        fixture.detectChanges();

        const ci = fixture.componentInstance;
        const grid = ci.grid;

        ci.idCol.pinned = true;
        tick();
        ci.genInfoColGroup.pinned = true;
        tick();
        ci.postalCodeColGroup.pinned = true;
        tick();
        ci.cityColGroup.pinned = true;
        tick();

        testColumnsVisibleIndexes([ci.idCol].concat(ci.genInfoColList)
            .concat(ci.postalCodeColList).concat(ci.cityColList).concat(ci.countryColList)
            .concat(ci.regionColList).concat(ci.addressColList).concat(ci.phoneColList)
            .concat(ci.faxColList));

        // unpinning with index
        expect(grid.unpinColumn(ci.genInfoColGroup, 2)).toBe(true);
        const postUnpinningColList = [ci.idCol].concat(ci.postalCodeColList).concat(ci.cityColList)
            .concat(ci.countryColList).concat(ci.regionColList).concat(ci.genInfoColList)
            .concat(ci.addressColList).concat(ci.phoneColList).concat(ci.faxColList);
        testColumnsVisibleIndexes(postUnpinningColList);
        testColumnPinning(ci.genInfoColGroup, false);

        // pinning to non-existent index
        expect(grid.pinColumn(ci.genInfoColGroup, 15)).toBe(false);
        testColumnsVisibleIndexes(postUnpinningColList);
        testColumnPinning(ci.genInfoColGroup, false);

        // pinning to negative index
        expect(grid.pinColumn(ci.genInfoColGroup, -15)).toBe(false);
        testColumnsVisibleIndexes(postUnpinningColList);
        testColumnPinning(ci.genInfoColGroup, false);

        // pinning with index
        expect(grid.pinColumn(ci.genInfoColGroup, 2)).toBe(true);
        const postPinningColList = [ci.idCol].concat(ci.postalCodeColList).concat(ci.genInfoColList)
            .concat(ci.cityColList).concat(ci.countryColList).concat(ci.regionColList)
            .concat(ci.addressColList).concat(ci.phoneColList).concat(ci.faxColList);
        testColumnsVisibleIndexes(postPinningColList);
        testColumnPinning(ci.genInfoColGroup, true);

        // unpinning to non-existent index
        expect(grid.unpinColumn(ci.genInfoColGroup, 15)).toBe(false);
        testColumnsVisibleIndexes(postPinningColList);
        testColumnPinning(ci.genInfoColGroup, true);

        // unpinning to negative index
        expect(grid.unpinColumn(ci.genInfoColGroup, -15)).toBe(false);
        testColumnsVisibleIndexes(postPinningColList);
        testColumnPinning(ci.genInfoColGroup, true);
    }));

    it('Should not allow moving group to another level via API.', () => {
        const fixture = TestBed.createComponent(ColumnGroupTestComponent);
        fixture.detectChanges();
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;

        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(16);
        expect(grid.rowList.first.cells.first.value).toMatch('ALFKI');
        expect(grid.rowList.first.cells.toArray()[1].value).toMatch('Alfreds Futterkiste');
        expect(grid.rowList.first.cells.toArray()[2].value).toMatch('Maria Anders');
        expect(grid.rowList.first.cells.toArray()[3].value).toMatch('Sales Representative');

        // Pin a column
        const colID = grid.getColumnByName('ID');
        colID.pinned = true;

        expect(grid.pinnedColumns.length).toEqual(1);
        expect(grid.unpinnedColumns.length).toEqual(15);
        expect(colID.visibleIndex).toEqual(0);
        expect(grid.rowList.first.cells.first.value).toMatch('ALFKI');

        // Try to move a group column to pinned area, where there is non group column
        const contName = grid.getColumnByName('ContactName');
        grid.moveColumn(contName, colID);

        // pinning should be unsuccesfull !
        expect(grid.pinnedColumns.length).toEqual(1);
        expect(grid.unpinnedColumns.length).toEqual(15);
        expect(grid.rowList.first.cells.first.value).toMatch('ALFKI');

        // pin grouped column to the pinned area
        const genGroup = getColGroup(grid, 'General Information');
        genGroup.pinned = true;

        expect(grid.pinnedColumns.length).toEqual(6);
        expect(grid.unpinnedColumns.length).toEqual(10);
        expect(genGroup.visibleIndex).toEqual(1);
        expect(colID.visibleIndex).toEqual(0);

        expect(grid.rowList.first.cells.first.value).toMatch('ALFKI');
        expect(grid.rowList.first.cells.toArray()[1].value).toMatch('Alfreds Futterkiste');
        expect(grid.rowList.first.cells.toArray()[2].value).toMatch('Maria Anders');
        expect(grid.rowList.first.cells.toArray()[3].value).toMatch('Sales Representative');

        // pin grouped column to the pinned area
        const compName = grid.getColumnByName('CompanyName');
        const persDetails = getColGroup(grid, 'Person Details');
        const contTitle = grid.getColumnByName('ContactTitle');

        grid.moveColumn(colID, genGroup);
        grid.moveColumn(compName, persDetails);
        grid.moveColumn(contName, contTitle);

        expect(grid.rowList.first.cells.first.value).toMatch('Sales Representative');
        expect(grid.rowList.first.cells.toArray()[1].value).toMatch('Maria Anders');
        expect(grid.rowList.first.cells.toArray()[2].value).toMatch('Alfreds Futterkiste');
        expect(grid.rowList.first.cells.toArray()[3].value).toMatch('ALFKI');
    });

    it('Should move column group correctly. One level column groups.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ThreeGroupsThreeColumnsGridComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;
        const grid = ci.grid;
        const genInfoCols = [ci.genInfoColGroup, ci.companyNameCol,
        ci.contactNameCol, ci.contactTitleCol];
        const locCols = [ci.locationColGroup, ci.countryCol, ci.regionCol, ci.cityCol];
        const contactInfoCols = [ci.contactInfoColGroup, ci.phoneCol, ci.faxCol, ci.postalCodeCol];

        testColumnsOrder(genInfoCols.concat(locCols).concat(contactInfoCols));

        // moving last to be first
        grid.moveColumn(ci.contactInfoColGroup, ci.genInfoColGroup);
        tick();
        testColumnsOrder(contactInfoCols.concat(genInfoCols).concat(locCols));

        // moving first to be last
        grid.moveColumn(ci.contactInfoColGroup, ci.locationColGroup);
        tick();
        testColumnsOrder(genInfoCols.concat(locCols).concat(contactInfoCols));

        // moving inner to be last
        grid.moveColumn(ci.locationColGroup, ci.contactInfoColGroup);
        tick();
        testColumnsOrder(genInfoCols.concat(contactInfoCols).concat(locCols));

        // moving inner to be first
        grid.moveColumn(ci.contactInfoColGroup, ci.genInfoColGroup);
        tick();
        testColumnsOrder(contactInfoCols.concat(genInfoCols).concat(locCols));

        // moving to the same spot, no change expected
        grid.moveColumn(ci.genInfoColGroup, ci.genInfoColGroup);
        tick();
        testColumnsOrder(contactInfoCols.concat(genInfoCols).concat(locCols));

        // moving column group to the place of a column, no change expected
        grid.moveColumn(ci.genInfoColGroup, ci.countryCol);
        tick();
        testColumnsOrder(contactInfoCols.concat(genInfoCols).concat(locCols));
    }));

    it('Should move columns within column groups. One level column groups.', fakeAsync(() => {
        const fixture = TestBed.createComponent(ThreeGroupsThreeColumnsGridComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;
        const grid = ci.grid;
        const genInfoAndLocCols = [ci.genInfoColGroup, ci.companyNameCol,
        ci.contactNameCol, ci.contactTitleCol, ci.locationColGroup, ci.countryCol,
        ci.regionCol, ci.cityCol];

        // moving last to be first
        grid.moveColumn(ci.postalCodeCol, ci.phoneCol);
        tick();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
        ci.postalCodeCol, ci.phoneCol, ci.faxCol]));

        // moving first to be last
        grid.moveColumn(ci.postalCodeCol, ci.faxCol);
        tick();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
        ci.phoneCol, ci.faxCol, ci.postalCodeCol]));

        // moving inner to be last
        grid.moveColumn(ci.faxCol, ci.postalCodeCol);
        tick();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
        ci.phoneCol, ci.postalCodeCol, ci.faxCol]));

        // moving inner to be first
        grid.moveColumn(ci.postalCodeCol, ci.phoneCol);
        tick();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
        ci.postalCodeCol, ci.phoneCol, ci.faxCol]));

        // moving to the sample spot, no change expected
        grid.moveColumn(ci.postalCodeCol, ci.postalCodeCol);
        tick();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
        ci.postalCodeCol, ci.phoneCol, ci.faxCol]));

        // moving column to the place of its column group, no change expected
        grid.moveColumn(ci.postalCodeCol, ci.contactInfoColGroup);
        tick();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
        ci.postalCodeCol, ci.phoneCol, ci.faxCol]));

        //// moving column to the place of a column group, no change expected
        grid.moveColumn(ci.postalCodeCol, ci.genInfoColGroup);
        tick();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
        ci.postalCodeCol, ci.phoneCol, ci.faxCol]));
    }));

    it('Should move columns and groups. Two level column groups.', fakeAsync(() => {
        const fixture = TestBed.createComponent(NestedColGroupsGridComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;
        const grid = ci.grid;

        // moving a two-level col
        grid.moveColumn(ci.phoneCol, ci.locationColGroup);
        tick();
        testColumnsOrder([ci.contactInfoColGroup, ci.phoneCol, ci.locationColGroup, ci.countryCol,
        ci.genInfoColGroup, ci.companyNameCol, ci.cityCol]);

        // moving a three-level col
        grid.moveColumn(ci.cityCol, ci.contactInfoColGroup);
        tick();
        const colsOrder = [ci.cityCol, ci.contactInfoColGroup, ci.phoneCol,
        ci.locationColGroup, ci.countryCol, ci.genInfoColGroup, ci.companyNameCol];
        testColumnsOrder(colsOrder);

        // moving between different groups, hould stay the same
        grid.moveColumn(ci.locationColGroup, ci.companyNameCol);
        tick();
        testColumnsOrder(colsOrder);

        // moving between different levels, should stay the same
        grid.moveColumn(ci.countryCol, ci.phoneCol);
        tick();
        testColumnsOrder(colsOrder);

        // moving between different levels, should stay the same
        grid.moveColumn(ci.cityCol, ci.phoneCol);
        tick();
        testColumnsOrder(colsOrder);

        grid.moveColumn(ci.genInfoColGroup, ci.companyNameCol);
        tick();
        testColumnsOrder(colsOrder);

        grid.moveColumn(ci.locationColGroup, ci.contactInfoColGroup);
        tick();
        testColumnsOrder(colsOrder);
    }));

    it('Should move columns and groups. Pinning enabled.', fakeAsync(() => {
        const fixture = TestBed.createComponent(StegosaurusGridComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;

        ci.idCol.pinned = true;
        tick();
        ci.genInfoColGroup.pinned = true;
        tick();
        ci.postalCodeColGroup.pinned = true;
        tick();
        ci.cityColGroup.pinned = true;
        tick();

        // moving group from unpinned to pinned
        ci.grid.moveColumn(ci.phoneColGroup, ci.idCol);
        tick();
        let postMovingOrder = ci.phoneColList.concat([ci.idCol]).concat(ci.genInfoColList)
            .concat(ci.postalCodeColList).concat(ci.cityColList).concat(ci.countryColList)
            .concat(ci.regionColList).concat(ci.addressColList).concat(ci.faxColList);
        testColumnsVisibleIndexes(postMovingOrder);
        testColumnPinning(ci.phoneColGroup, true);
        testColumnPinning(ci.idCol, true);

        // moving sub group to different parent, should not be allowed
        ci.grid.moveColumn(ci.pDetailsColGroup, ci.regionCol);
        tick();
        testColumnsVisibleIndexes(postMovingOrder);
        testColumnPinning(ci.pDetailsColGroup, true);
        testColumnPinning(ci.regionCol, false);

        // moving pinned group as firstly unpinned
        ci.grid.moveColumn(ci.idCol, ci.cityColGroup);
        tick();
        ci.idCol.pinned = false;
        tick();
        postMovingOrder = ci.phoneColList.concat(ci.genInfoColList)
            .concat(ci.postalCodeColList).concat(ci.cityColList).concat([ci.idCol])
            .concat(ci.countryColList).concat(ci.regionColList)
            .concat(ci.addressColList).concat(ci.faxColList);
        testColumnsVisibleIndexes(postMovingOrder);
        testColumnPinning(ci.idCol, false);
        testColumnPinning(ci.countryColGroup, false);

        // moving column to different parent, shound not be allowed
        ci.grid.moveColumn(ci.postalCodeCol, ci.cityCol);
        tick();
        testColumnsVisibleIndexes(postMovingOrder);
        testColumnPinning(ci.postalCodeCol, true);
        testColumnPinning(ci.cityCol, true);
    }));

    it('sorting - sort a grouped column by API', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;

        // Verify columns and groups
        testGroupsAndColumns(18, 11);

        grid.getColumnByName('CompanyName').sortable = true;
        tick();
        grid.getColumnByName('ContactName').sortable = true;
        tick();
        fixture.detectChanges();
        // Sort column
        grid.sort({fieldName: 'CompanyName', dir: SortingDirection.Asc, ignoreCase: true});
        fixture.detectChanges();

        // Verify columns and groups
        testGroupsAndColumns(18, 11);

        // Verify cells
        expect(grid.getCellByColumn(0, 'ID').value).toEqual('ALFKI');
        expect(grid.getCellByColumn(0, 'ContactTitle').value).toEqual('Sales Representative');
        expect(grid.getCellByColumn(0, 'CompanyName').value).toEqual('Alfreds Futterkiste');
        expect(grid.getCellByColumn(4, 'ID').value).toEqual('BSBEV');
        expect(grid.getCellByColumn(4, 'ContactTitle').value).toEqual('Sales Representative');
        expect(grid.getCellByColumn(4, 'Country').value).toEqual('UK');

        grid.clearSort();
        tick();
        fixture.detectChanges();
        // Verify columns and groups
        testGroupsAndColumns(18, 11);

        // Verify cells
        expect(grid.getCellByColumn(0, 'ID').value).toEqual('ALFKI');
        expect(grid.getCellByColumn(0, 'ContactTitle').value).toEqual('Sales Representative');
        expect(grid.getCellByColumn(0, 'CompanyName').value).toEqual('Alfreds Futterkiste');
        expect(grid.getCellByColumn(4, 'ID').value).toEqual('BERGS');
        expect(grid.getCellByColumn(4, 'Country').value).toEqual('Sweden');

        // sort column which is not in the view
        grid.sort({fieldName: 'ContactName', dir: SortingDirection.Asc, ignoreCase: true});
        fixture.detectChanges();

        // Verify columns and groups
        testGroupsAndColumns(18, 11);

        // Verify cells
        expect(grid.getCellByColumn(0, 'ID').value).toEqual('ANATR');
        expect(grid.getCellByColumn(0, 'ContactTitle').value).toEqual('Owner');
        expect(grid.getCellByColumn(0, 'CompanyName').value).toEqual('Ana Trujillo Emparedados y helados');
        expect(grid.getCellByColumn(3, 'ID').value).toEqual('FAMIA');
        expect(grid.getCellByColumn(3, 'ContactTitle').value).toEqual('Marketing Assistant');
        expect(grid.getCellByColumn(3, 'Country').value).toEqual('Brazil');
    }));

    it('sorting - sort a grouped column by clicking on header cell UI', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;

        // Verify columns and groups
        testGroupsAndColumns(18, 11);

        grid.getColumnByName('CompanyName').sortable = true;
        tick();
        fixture.detectChanges();

        // Sort column by clicking on it
        const contactTitleHeaderCell = fixture.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS))[3];
        contactTitleHeaderCell.triggerEventHandler('click', new Event('click'));
        tick();
        fixture.detectChanges();

        // Verify columns and groups
        testGroupsAndColumns(18, 11);
        // Verify cells
        expect(grid.getCellByColumn(0, 'ID').value).toEqual('ALFKI');
        expect(grid.getCellByColumn(0, 'ContactTitle').value).toEqual('Sales Representative');
        expect(grid.getCellByColumn(0, 'CompanyName').value).toEqual('Alfreds Futterkiste');
        expect(grid.getCellByColumn(4, 'ID').value).toEqual('BERGS');
        expect(grid.getCellByColumn(4, 'ContactTitle').value).toEqual('Order Administrator');
        expect(grid.getCellByColumn(4, 'Country').value).toEqual('Sweden');
    }));

    it('filtering - filter a grouped column', fakeAsync(() => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const initialRowListLenght = grid.rowList.length;
        // Verify columns and groups
        testGroupsAndColumns(18, 11);

        grid.getColumnByName('ContactTitle').filterable = true;
        tick();
        grid.getColumnByName('PostalCode').filterable = true;
        tick();
        fixture.detectChanges();

        // Filter column
        grid.filter('ContactTitle', 'Accounting Manager',
            IgxStringFilteringOperand.instance().condition('equals'), true);
            tick();
        fixture.detectChanges();
        expect(grid.rowList.length).toEqual(2);

        // Verify columns and groups
        testGroupsAndColumns(18, 11);

        // Filter column
        grid.filter('PostalCode', '28', IgxStringFilteringOperand.instance().condition('contains'), true);
        tick();
        fixture.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        // Reset filters
        grid.clearFilter('ContactTitle');
        tick();
        grid.clearFilter('PostalCode');
        tick();
        fixture.detectChanges();

        expect(grid.rowList.length).toEqual(initialRowListLenght);
        // Verify columns and groups
        testGroupsAndColumns(18, 11);

        // Filter column with no match
        grid.filter('ContactTitle', 'no items', IgxStringFilteringOperand.instance().condition('equals'), true);
        tick();
        fixture.detectChanges();
        expect(grid.rowList.length).toEqual(0);
        // Verify columns and groups
        testGroupsAndColumns(18, 11);

        // Clear filter
        grid.clearFilter('ContactTitle');
        tick();
        fixture.detectChanges();

        expect(grid.rowList.length).toEqual(initialRowListLenght);
        // Verify columns and groups
        testGroupsAndColumns(18, 11);
    }));


    it('grouping - verify grouping when there are grouped columns', () => {
        const fixture = TestBed.createComponent(ColumnGroupGroupingTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;

        // Verify columns and groups
        testGroupsAndColumns(9, 6);

        grid.getColumnByName('ContactTitle').groupable = true;
        grid.getColumnByName('Country').groupable = true;
        grid.getColumnByName('Phone').groupable = true;

        grid.groupBy({ fieldName: 'ContactTitle', dir: SortingDirection.Desc, ignoreCase: false,
            strategy: DefaultSortingStrategy.instance() });

        // verify grouping expressions
        const grExprs = grid.groupingExpressions;
        expect(grExprs.length).toEqual(1);
        expect(grExprs[0].fieldName).toEqual('ContactTitle');

        // verify rows
        const groupRows = grid.groupsRowList.toArray();
        const dataRows = grid.dataRowList.toArray();

        expect(groupRows.length).toEqual(5);
        expect(dataRows.length).toEqual(11);

        // Verify first grouped row
        const firstGroupedRow = groupRows[0].groupRow;
        expect(firstGroupedRow.value).toEqual('Sales Representative');
        expect(firstGroupedRow.records.length).toEqual(4);
    });

    it('Should not render empty column group.', () => {
        const fixture = TestBed.createComponent(EmptyColGridComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;

        // Empty column group should not be displayed
        const emptyColGroup = fixture.debugElement.query(By.css('.emptyColGroup'));
        expect(parseInt(ci.emptyColGroup.width, 10)).toBe(0);
        expect(emptyColGroup).toBe(null);
    });

    it('Should render headers correctly when having a column per group.', () => {
        const fixture = TestBed.createComponent(OneColPerGroupGridComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;
        const grid = ci.grid;

        const addressColGroup = fixture.debugElement.query(By.css('.addressColGroup'));
        const addressColGroupDepth = 2; // one-level children
        const addressColGroupChildrenCount = 1;

        testColumnGroupHeaderRendering(addressColGroup, parseInt(ci.columnWidth, 10),
            addressColGroupDepth * grid.defaultRowHeight, ci.addressColGroupTitle,
            'addressCol', addressColGroupChildrenCount);

        const addressCol = fixture.debugElement.query(By.css('.addressCol'));

        testColumnHeaderRendering(addressCol, parseInt(ci.columnWidth, 10),
            grid.defaultRowHeight, ci.addressColTitle);

        const phoneColGroup = fixture.debugElement.query(By.css('.phoneColGroup'));
        const phoneColGroupDepth = 2; // one-level children
        const phoneColGroupChildrenCount = 1;

        testColumnGroupHeaderRendering(phoneColGroup, parseInt(ci.phoneColWidth, 10),
            phoneColGroupDepth * grid.defaultRowHeight, ci.phoneColGroupTitle,
            'phoneCol', phoneColGroupChildrenCount);

        const phoneCol = fixture.debugElement.query(By.css('.phoneCol'));

        testColumnHeaderRendering(phoneCol, parseInt(ci.phoneColWidth, 10),
            grid.defaultRowHeight, ci.phoneColTitle);

        const faxColGroup = fixture.debugElement.query(By.css('.faxColGroup'));
        const faxColGroupDepth = 2; // one-level children
        const faxColGroupChildrenCount = 1;

        testColumnGroupHeaderRendering(faxColGroup, parseInt(ci.faxColWidth, 10),
            faxColGroupDepth * grid.defaultRowHeight, ci.faxColGroupTitle, 'faxCol',
            faxColGroupChildrenCount);

        const faxCol = fixture.debugElement.query(By.css('.faxCol'));

        testColumnHeaderRendering(faxCol, parseInt(ci.faxColWidth, 10),
            grid.defaultRowHeight, ci.faxColTitle);
    });

    it('Should render headers correctly when having nested column groups.', () => {
        const fixture = TestBed.createComponent(NestedColumnGroupsGridComponent);
        fixture.detectChanges();
        NestedColGroupsTests.testHeadersRendering(fixture);
    });

    it('Should render headers correctly when having nested column groups with huge header text.', () => {
        const fixture = TestBed.createComponent(NestedColumnGroupsGridComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;

        const title = 'Lorem Ipsum is simply dummy text of the printing and typesetting' +
            ' industry.Lorem Ipsum has been the industry\'s standard dummy text ever since' +
            ' the 1500s, when an unknown printer took a galley of type and scrambled it to' +
            ' make a type specimen book. It has survived not only five centuries, but also the' +
            ' leap into electronic typesetting, remaining essentially unchanged.It was popularised' +
            ' in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and' +
            ' more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.';
        ci.masterColGroupTitle = ci.firstSlaveColGroupTitle =
            ci.secondSlaveColGroupTitle = ci.addressColTitle = ci.phoneColTitle =
            ci.faxColTitle = ci.cityColTitle = title;

        ci.grid.cdr.markForCheck();
        fixture.detectChanges();
        NestedColGroupsTests.testHeadersRendering(fixture);
    });

    it('Should emit "columnInit" event when having multi-column headers.', () => {
        const fixture = TestBed.createComponent(NestedColumnGroupsGridComponent);
        const ci = fixture.componentInstance;
        const grid = ci.grid;

        spyOn(grid.onColumnInit, 'emit').and.callThrough();
        fixture.detectChanges();
        const colsCount = 4;
        const colGroupsCount = 3;

        expect(grid.onColumnInit.emit).toHaveBeenCalledTimes(colsCount + colGroupsCount);
    });

    it('Should fire "columnInit" event when adding a multi-column header.', () => {
        const fixture = TestBed.createComponent(DynamicGridComponent);
        const ci = fixture.componentInstance;
        const grid = ci.grid;
        fixture.detectChanges();

        spyOn(grid.onColumnInit, 'emit').and.callThrough();
        ci.mchCount.push({});
        fixture.detectChanges();
        const colsCount = 2; // 1 col group and 1 col
        expect(grid.onColumnInit.emit).toHaveBeenCalledTimes(colsCount);
    });

    it('Should not throw exception if multi-column header columns width is set as number', () => {
        expect(() => {
            const fixture = TestBed.createComponent(NumberColWidthGridComponent);
            fixture.detectChanges();
        }).not.toThrow();
    });
});

@Component({
    template: `
    <div id="grid-wrapper" [style.width.px]="gridWrapperWidthPx">
        <igx-grid #grid [data]="data" [height]='gridHeight'>
            <igx-column-group header="Location">
                <igx-column field="City" [width]='columnWidth'></igx-column>
            </igx-column-group>
        </igx-grid>
    </div>
    `
})
export class OneGroupOneColGridComponent {
    @ViewChild('grid') public grid: IgxGridComponent;
    public gridWrapperWidthPx = '1000';
    public gridHeight = '500px';
    public columnWidth: string;
    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <div id="grid-wrapper" [style.width.px]="gridWrapperWidthPx">
        <igx-grid #grid [data]="data" [height]='gridHeight'>
            <igx-column-group header="Location">
                <igx-column field="Country" [width]='columnWidth'></igx-column>
                <igx-column field="Region" [width]='columnWidth'></igx-column>
                <igx-column field="City" [width]='columnWidth'></igx-column>
            </igx-column-group>
        </igx-grid>
    </div>
    `
})
export class OneGroupThreeColsGridComponent {
    @ViewChild('grid') public grid: IgxGridComponent;
    public gridWrapperWidthPx = '900';
    public gridHeight = '500px';
    public columnWidth: string;
    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="500px">
        <igx-column field="ID"></igx-column>
        <igx-column-group header="General Information">
            <igx-column filterable="true" sortable="true" resizable="true" field="CompanyName"></igx-column>
            <igx-column-group header="Person Details">
                <igx-column filterable="true" sortable="true" resizable="true" field="ContactName"></igx-column>
                <igx-column filterable="true" sortable="true" resizable="true" field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group header="Address Information">
            <igx-column-group header="Location">
                <igx-column filterable="true" sortable="true" resizable="true" field="Country"></igx-column>
                <igx-column filterable="true" sortable="true" resizable="true" field="Region"></igx-column>
                <igx-column filterable="true" sortable="true" resizable="true" field="City"></igx-column>
                <igx-column filterable="true" sortable="true" resizable="true" field="Address"></igx-column>
            </igx-column-group>
            <igx-column-group header="Contact Information">
                <igx-column filterable="true" sortable="true" resizable="true" field="Phone"></igx-column>
                <igx-column filterable="true" sortable="true" resizable="true" field="Fax"></igx-column>
                <igx-column filterable="true" sortable="true" resizable="true" field="PostalCode"></igx-column>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `
})
export class ColumnGroupTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="600px" width="800px">
        <igx-column #idCol field="ID"></igx-column>
        <igx-column-group #genInfoColGroup header="General Information">
            <igx-column #companyNameCol field="CompanyName"></igx-column>
            <igx-column-group #pDetailsColGroup header="Person Details">
                <igx-column #contactNameCol field="ContactName"></igx-column>
                <igx-column #contactTitleCol field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group #addrInfoColGroup header="Address Information">
            <igx-column-group #locationColGroup header="Location">
                <igx-column #countryCol field="Country"></igx-column>
                <igx-column #regionCol field="Region"></igx-column>
                <igx-column-group #locCityColGroup header="Location City">
                    <igx-column #cityCol field="City"></igx-column>
                    <igx-column #addressCol field="Address"></igx-column>
                </igx-column-group>
            </igx-column-group>
            <igx-column-group #contactInfoColGroup header="Contact Information">
                <igx-column #phoneCol field="Phone"></igx-column>
                <igx-column #faxCol field="Fax"></igx-column>
            </igx-column-group>
            <igx-column-group #postalCodeColGroup header="Postal Code">
                <igx-column #postalCodeCol field="PostalCode"></igx-column>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `
})
export class ColumnGroupFourLevelTestComponent implements AfterViewInit {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    @ViewChild('idCol', { read: IgxColumnComponent })
    idCol: IgxColumnComponent;

    @ViewChild('genInfoColGroup', { read: IgxColumnGroupComponent })
    genInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('companyNameCol', { read: IgxColumnComponent })
    companyNameCol: IgxColumnComponent;
    @ViewChild('pDetailsColGroup', { read: IgxColumnGroupComponent })
    pDetailsColGroup: IgxColumnGroupComponent;
    @ViewChild('contactNameCol', { read: IgxColumnComponent })
    contactNameCol: IgxColumnComponent;
    @ViewChild('contactTitleCol', { read: IgxColumnComponent })
    contactTitleCol: IgxColumnComponent;

    public genInfoColsAndGroups = [];

    @ViewChild('addrInfoColGroup', { read: IgxColumnGroupComponent })
    addrInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('locationColGroup', { read: IgxColumnGroupComponent })
    locationColGroup: IgxColumnGroupComponent;
    @ViewChild('countryCol', { read: IgxColumnComponent })
    countryCol: IgxColumnComponent;
    @ViewChild('regionCol', { read: IgxColumnComponent })
    regionCol: IgxColumnComponent;
    @ViewChild('locCityColGroup', { read: IgxColumnGroupComponent })
    locCityColGroup: IgxColumnGroupComponent;
    @ViewChild('cityCol', { read: IgxColumnComponent })
    cityCol: IgxColumnComponent;
    @ViewChild('addressCol', { read: IgxColumnComponent })
    addressCol: IgxColumnComponent;
    @ViewChild('contactInfoColGroup', { read: IgxColumnGroupComponent })
    contactInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('phoneCol', { read: IgxColumnComponent })
    phoneCol: IgxColumnComponent;
    @ViewChild('faxCol', { read: IgxColumnComponent })
    faxCol: IgxColumnComponent;
    @ViewChild('postalCodeColGroup', { read: IgxColumnGroupComponent })
    postalCodeColGroup: IgxColumnGroupComponent;
    @ViewChild('postalCodeCol', { read: IgxColumnComponent })
    postalCodeCol: IgxColumnComponent;

    public addressColsAndGroups = [];
    public colsAndGroupsNaturalOrder = [];

    data = SampleTestData.contactInfoDataFull();

    ngAfterViewInit() {
        this.genInfoColsAndGroups = [this.genInfoColGroup, this.companyNameCol, this.pDetailsColGroup,
        this.contactNameCol, this.contactTitleCol];

        this.addressColsAndGroups = [this.addrInfoColGroup, this.locationColGroup, this.countryCol,
        this.regionCol, this.locCityColGroup, this.cityCol, this.addressCol, this.contactInfoColGroup,
        this.phoneCol, this.faxCol, this.postalCodeColGroup, this.postalCodeCol];

        this.colsAndGroupsNaturalOrder = [this.idCol].concat(this.genInfoColsAndGroups)
            .concat(this.addressColsAndGroups);
    }
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="600px" width="800px">
        <igx-column field="ID"></igx-column>
        <igx-column-group header="Address">
            <igx-column-group header="Location">
                <igx-column field="Country"></igx-column>
                <igx-column field="Region"></igx-column>
                <igx-column-group header="Location City">
                    <igx-column field="City"></igx-column>
                    <igx-column field="Address"></igx-column>
                </igx-column-group>
            </igx-column-group>
            <igx-column-group header="Contact Information">
                <igx-column field="Phone"></igx-column>
                <igx-column field="Fax"></igx-column>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `
})
export class ColumnGroupChildLevelTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="1000px">
        <igx-column field="ID"></igx-column>
        <igx-column-group header="General Information">
             <igx-column field="ContactName"></igx-column>
             <igx-column field="ContactTitle"></igx-column>
        </igx-column-group>
        <igx-column-group header="Address Information">
                <igx-column field="Country"></igx-column>
                <igx-column field="City"></igx-column>
				<igx-column-group header="Phone Information">
				    <igx-column field="Phone"></igx-column>
				</igx-column-group>
        </igx-column-group>
    </igx-grid>
    `
})
export class ColumnGroupGroupingTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    data = SampleTestData.contactInfoData();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="600px" width="800px">
        <igx-column field="ID"></igx-column>
        <igx-column-group header="General Information">
            <igx-column  field="CompanyName"></igx-column>
            <igx-column-group header="Person Details">
                <igx-column field="ContactName"></igx-column>
                <igx-column field="ContactTitle"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group header="Address Information">
            <igx-column field="Region"></igx-column>
            <igx-column-group header="Location">
                <igx-column field="Country"></igx-column>
                <igx-column-group header="Location City">
                    <igx-column field="City"></igx-column>
                    <igx-column field="Address"></igx-column>
                </igx-column-group>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
       `
})
export class ColumnGroupTwoGroupsTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="600px" width="1000px">
        <igx-column-group #genInfoColGroup header="General Information">
            <igx-column #companyNameCol field="CompanyName"></igx-column>
            <igx-column #contactNameCol field="ContactName"></igx-column>
            <igx-column #contactTitleCol field="ContactTitle"></igx-column>
        </igx-column-group>
        <igx-column-group #locationColGroup header="Location">
            <igx-column #countryCol field="Country"></igx-column>
            <igx-column #regionCol field="Region"></igx-column>
            <igx-column #cityCol field="City"></igx-column>
        </igx-column-group>
        <igx-column-group #contactInfoColGroup header="Contact Information">
            <igx-column #phoneCol field="Phone"></igx-column>
            <igx-column #faxCol field="Fax"></igx-column>
            <igx-column #postalCodeCol field="PostalCode"></igx-column>
        </igx-column-group>
    </igx-grid>
    `
})
export class ThreeGroupsThreeColumnsGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    @ViewChild('genInfoColGroup', { read: IgxColumnGroupComponent })
    genInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('companyNameCol', { read: IgxColumnComponent })
    companyNameCol: IgxColumnComponent;
    @ViewChild('contactNameCol', { read: IgxColumnComponent })
    contactNameCol: IgxColumnComponent;
    @ViewChild('contactTitleCol', { read: IgxColumnComponent })
    contactTitleCol: IgxColumnComponent;

    @ViewChild('locationColGroup', { read: IgxColumnGroupComponent })
    locationColGroup: IgxColumnGroupComponent;
    @ViewChild('countryCol', { read: IgxColumnComponent })
    countryCol: IgxColumnComponent;
    @ViewChild('regionCol', { read: IgxColumnComponent })
    regionCol: IgxColumnComponent;
    @ViewChild('cityCol', { read: IgxColumnComponent })
    cityCol: IgxColumnComponent;

    @ViewChild('contactInfoColGroup', { read: IgxColumnGroupComponent })
    contactInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('phoneCol', { read: IgxColumnComponent })
    phoneCol: IgxColumnComponent;
    @ViewChild('faxCol', { read: IgxColumnComponent })
    faxCol: IgxColumnComponent;
    @ViewChild('postalCodeCol', { read: IgxColumnComponent })
    postalCodeCol: IgxColumnComponent;

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="600px" width="1000px">
        <igx-column-group #contactInfoColGroup header="Contact Info">
            <igx-column-group #locationColGroup header="Location">
                <igx-column #countryCol field="Country"></igx-column>
            </igx-column-group>
            <igx-column #phoneCol field="Phone"></igx-column>
        </igx-column-group>
        <igx-column-group #genInfoColGroup header="General Information">
            <igx-column #companyNameCol field="CompanyName"></igx-column>
        </igx-column-group>
        <igx-column #cityCol field="City"></igx-column>
    </igx-grid>
    `
})
export class NestedColGroupsGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    @ViewChild('contactInfoColGroup', { read: IgxColumnGroupComponent })
    contactInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('locationColGroup', { read: IgxColumnGroupComponent })
    locationColGroup: IgxColumnGroupComponent;
    @ViewChild('countryCol', { read: IgxColumnComponent })
    countryCol: IgxColumnComponent;
    @ViewChild('phoneCol', { read: IgxColumnComponent })
    phoneCol: IgxColumnComponent;

    @ViewChild('genInfoColGroup', { read: IgxColumnGroupComponent })
    genInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('companyNameCol', { read: IgxColumnComponent })
    companyNameCol: IgxColumnComponent;

    @ViewChild('cityCol', { read: IgxColumnComponent })
    cityCol: IgxColumnComponent;

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" height="600px" width="1000px" columnWidth="100px">
        <igx-column #idCol field="ID" header="Id"></igx-column>
        <igx-column-group #genInfoColGroup header="General Information">
            <igx-column #companyNameCol field="CompanyName" header="Company Name"></igx-column>
            <igx-column-group #pDetailsColGroup header="Person Details">
                <igx-column #contactNameCol field="ContactName" header="Contact Name"></igx-column>
                <igx-column #contactTitleCol field="ContactTitle" header="Contact Title"></igx-column>
            </igx-column-group>
        </igx-column-group>
        <igx-column-group #postalCodeColGroup header="Postal Code">
            <igx-column #postalCodeCol field="PostalCode" header="Postal Code"></igx-column>
        </igx-column-group>
        <igx-column-group #cityColGroup header="City Group">
            <igx-column #cityCol field="City" header="City"></igx-column>
        </igx-column-group>
        <igx-column-group #countryColGroup header="Country Group">
            <igx-column #countryCol field="Country" header="Country"></igx-column>
        </igx-column-group>
        <igx-column-group #regionColGroup header="Region Group">
            <igx-column #regionCol field="Region" header="Region"></igx-column>
        </igx-column-group>
        <igx-column-group #addressColGroup header="Address Group">
            <igx-column #addressCol field="Address" header="Address"></igx-column>
        </igx-column-group>
        <igx-column-group #phoneColGroup header="Phone Group">
            <igx-column #phoneCol field="Phone" header="Phone"></igx-column>
        </igx-column-group>
        <igx-column-group #faxColGroup header="Fax Group">
            <igx-column #faxCol field="Fax" header="Fax"></igx-column>
        </igx-column-group>
    </igx-grid>
    `
})
export class StegosaurusGridComponent implements AfterViewInit {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    @ViewChild('idCol', { read: IgxColumnComponent })
    idCol: IgxColumnComponent;

    @ViewChild('genInfoColGroup', { read: IgxColumnGroupComponent })
    genInfoColGroup: IgxColumnGroupComponent;
    @ViewChild('companyNameCol', { read: IgxColumnComponent })
    companyNameCol: IgxColumnComponent;
    @ViewChild('pDetailsColGroup', { read: IgxColumnGroupComponent })
    pDetailsColGroup: IgxColumnGroupComponent;
    @ViewChild('contactNameCol', { read: IgxColumnComponent })
    contactNameCol: IgxColumnComponent;
    @ViewChild('contactTitleCol', { read: IgxColumnComponent })
    contactTitleCol: IgxColumnComponent;

    @ViewChild('postalCodeColGroup', { read: IgxColumnGroupComponent })
    postalCodeColGroup: IgxColumnGroupComponent;
    @ViewChild('postalCodeCol', { read: IgxColumnComponent })
    postalCodeCol: IgxColumnComponent;

    @ViewChild('cityColGroup', { read: IgxColumnGroupComponent })
    cityColGroup: IgxColumnGroupComponent;
    @ViewChild('cityCol', { read: IgxColumnComponent })
    cityCol: IgxColumnComponent;

    @ViewChild('countryColGroup', { read: IgxColumnGroupComponent })
    countryColGroup: IgxColumnGroupComponent;
    @ViewChild('countryCol', { read: IgxColumnComponent })
    countryCol: IgxColumnComponent;

    @ViewChild('regionColGroup', { read: IgxColumnGroupComponent })
    regionColGroup: IgxColumnGroupComponent;
    @ViewChild('regionCol', { read: IgxColumnComponent })
    regionCol: IgxColumnComponent;

    @ViewChild('addressColGroup', { read: IgxColumnGroupComponent })
    addressColGroup: IgxColumnGroupComponent;
    @ViewChild('addressCol', { read: IgxColumnComponent })
    addressCol: IgxColumnComponent;

    @ViewChild('phoneColGroup', { read: IgxColumnGroupComponent })
    phoneColGroup: IgxColumnGroupComponent;
    @ViewChild('phoneCol', { read: IgxColumnComponent })
    phoneCol: IgxColumnComponent;

    @ViewChild('faxColGroup', { read: IgxColumnGroupComponent })
    faxColGroup: IgxColumnGroupComponent;
    @ViewChild('faxCol', { read: IgxColumnComponent })
    faxCol: IgxColumnComponent;

    public genInfoColList;
    public postalCodeColList;
    public cityColList;
    public countryColList;
    public regionColList;
    public addressColList;
    public phoneColList;
    public faxColList;

    data = SampleTestData.contactInfoDataFull();

    ngAfterViewInit() {
        this.genInfoColList = [this.genInfoColGroup, this.companyNameCol, this.pDetailsColGroup,
        this.contactNameCol, this.contactTitleCol];
        this.postalCodeColList = [this.postalCodeColGroup, this.postalCodeCol];
        this.cityColList = [this.cityColGroup, this.cityCol];
        this.countryColList = [this.countryColGroup, this.countryCol];
        this.regionColList = [this.regionColGroup, this.regionCol];
        this.addressColList = [this.addressColGroup, this.addressCol];
        this.phoneColList = [this.phoneColGroup, this.phoneCol];
        this.faxColList = [this.faxColGroup, this.faxCol];
    }
}

@Component({
    template: `
        <igx-grid #grid [data]="data" [height]="gridHeight" [columnWidth]="columnWidth">
            <igx-column-group headerGroupClasses="firstGroup" [header]="firstGroupTitle">
                <igx-column headerClasses="firstGroupColumn" field="ID" *ngFor="let item of hunderdItems;"></igx-column>
            </igx-column-group>
            <igx-column-group headerGroupClasses="secondGroup" [header]="secondGroupTitle">
                <igx-column-group headerGroupClasses="secondSubGroup" [header]="secondSubGroupTitle">
                    <igx-column headerClasses="secondSubGroupColumn" field="ID" *ngFor="let item of fiftyItems;"></igx-column>
                </igx-column-group>
                <igx-column-group headerGroupClasses="secondSubGroup" [header]="secondSubGroupTitle">
                    <igx-column  headerClasses="secondSubGroupColumn" field="ID" *ngFor="let item of fiftyItems;"></igx-column>
                </igx-column-group>
            </igx-column-group>
            <igx-column headerClasses="lonelyId" [header]="idHeaderTitle" field="ID"></igx-column>
            <igx-column-group header="General Information">
                <igx-column headerClasses="companyName" [header]="companyNameTitle" field="CompanyName"></igx-column>
                <igx-column-group headerGroupClasses="personDetails" [header]="personDetailsTitle">
                    <igx-column headerClasses="personDetailsColumn" field="ContactName"></igx-column>
                    <igx-column headerClasses="personDetailsColumn" field="ContactTitle"></igx-column>
                </igx-column-group>
            </igx-column-group>
            <igx-column-group header="Address Information">
                <igx-column-group header="Location">
                    <igx-column field="Country"></igx-column>
                    <igx-column field="Region"></igx-column>
                    <igx-column field="City"></igx-column>
                    <igx-column field="Address"></igx-column>
                </igx-column-group>
                <igx-column-group header="Contact Information">
                    <igx-column field="Phone"></igx-column>
                    <igx-column field="Fax"></igx-column>
                    <igx-column field="PostalCode"></igx-column>
                </igx-column-group>
            </igx-column-group>
        </igx-grid>
    `
})
export class BlueWhaleGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    public gridHeight = '500px';
    public columnWidth = '100px';
    data = SampleTestData.contactInfoDataFull();

    hunderdItems = new Array(100);
    fiftyItems = new Array(50);

    firstGroupTitle = '100 IDs';
    secondGroupTitle = '2 col groups with 50 IDs each';
    secondSubGroupTitle = '50 IDs';
    idHeaderTitle = 'ID';
    companyNameTitle = 'Company Name';
    personDetailsTitle = 'Person Details';
}

@Component({
    template: `
        <igx-grid #grid [data]="data" height="600px" columnWidth="100px">
            <igx-column-group headerGroupClasses="emptyColGroup" #emptyColGroup header="First Group">
            </igx-column-group>
        </igx-grid>
    `
})
export class EmptyColGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    @ViewChild('emptyColGroup', { read: IgxColumnGroupComponent })
    emptyColGroup: IgxColumnGroupComponent;

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
        <igx-grid #grid [data]="data" height="600px" [columnWidth]="columnWidth">
            <igx-column-group headerGroupClasses="addressColGroup" [header]="addressColGroupTitle">
                <igx-column headerClasses="addressCol" field="Address" [header]="addressColTitle"></igx-column>
            </igx-column-group>
            <igx-column-group headerGroupClasses="phoneColGroup" [header]="phoneColGroupTitle">
                <igx-column headerClasses="phoneCol" field="Phone" [header]="phoneColTitle" [width]="phoneColWidth"></igx-column>
            </igx-column-group>
            <igx-column-group headerGroupClasses="faxColGroup" [header]="faxColGroupTitle">
                <igx-column headerClasses="faxCol" field="Fax" [header]="faxColTitle" [width]="faxColWidth"></igx-column>
            </igx-column-group>
        </igx-grid>
    `
})
export class OneColPerGroupGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    columnWidth = '100px';
    phoneColWidth = '200px';
    faxColWidth = '300px';

    addressColGroupTitle = 'Address Group';
    addressColTitle = 'Address';

    phoneColGroupTitle = 'Phone Group';
    phoneColTitle = 'Phone';

    faxColGroupTitle = 'Fax Group';
    faxColTitle = 'Fax';

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
        <igx-grid #grid [data]="data" height="600px" [columnWidth]="columnWidth">
            <igx-column-group headerGroupClasses="masterColGroup" [header]="masterColGroupTitle">
                <igx-column-group headerGroupClasses="firstSlaveColGroup slaveColGroup" [header]="firstSlaveColGroupTitle">
                    <igx-column headerClasses="addressCol firstSlaveChild" field="Address" [header]="addressColTitle"></igx-column>
                    <igx-column headerClasses="phoneCol firstSlaveChild" field="Phone" [header]="phoneColTitle" [width]="phoneColWidth">
                    </igx-column>
                </igx-column-group>
                <igx-column-group headerGroupClasses="secondSlaveColGroup slaveColGroup" [header]="secondSlaveColGroupTitle">
                    <igx-column headerClasses="faxCol secondSlaveChild" field="Fax" [header]="faxColTitle" [width]="faxColWidth">
                    </igx-column>
                    <igx-column headerClasses="cityCol secondSlaveChild" field="City" [header]="cityColTitle" [width]="cityColWidth">
                    </igx-column>
                </igx-column-group>
            </igx-column-group>
        </igx-grid>
    `
})
export class NestedColumnGroupsGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    columnWidth = '100px';
    phoneColWidth = '200px';
    faxColWidth = '300px';
    cityColWidth = '400px';

    masterColGroupTitle = 'Master';
    firstSlaveColGroupTitle = 'Slave 1';
    secondSlaveColGroupTitle = 'Slave 2';

    addressColTitle = 'Address';
    phoneColTitle = 'Phone';
    faxColTitle = 'Fax';
    cityColTitle = 'City';

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
        <igx-grid #grid [data]="data" height="500px" columnWidth="100px">
            <igx-column-group header="MCH" *ngFor="let item of mchCount;">
                <igx-column field="City"></igx-column>
            </igx-column-group>
        </igx-grid>
    `
})
export class DynamicGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;
    mchCount = new Array(1);

    data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
        <igx-grid #grid [data]="data" height="500px">
            <igx-column-group header="MCH">
                <igx-column *ngFor="let c of columns"
                    [field]="c.field"
                    [header]="c.field"
                    [width]="c.width"></igx-column>
            </igx-column-group>
        </igx-grid>
    `
})
export class NumberColWidthGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    data = SampleTestData.contactInfoDataFull();

    columns = [
        { field: 'ID', width: 100 },
        { field: 'CompanyName', width: 200 },
        { field: 'ContactName', width: 150 },
        { field: 'City', width: 100 },
    ];
}

function getColGroup(grid: IgxGridComponent, headerName: string): IgxColumnGroupComponent {
    const colGroups = grid.columnList.filter(c => c.columnGroup && c.header === headerName);
    if (colGroups.length === 0) {
        return null;
    } else if (colGroups.length === 1) {
        return colGroups[0];
    } else {
        throw new Error('More than one column group found.');
    }
}

// tests column and column group header rendering
function testColumnGroupHeaderRendering(column: DebugElement, width: number, height: number,
    title: string, descendentColumnCssClass?: string, descendentColumnCount?: number) {

    expect(column.nativeElement.offsetHeight).toBe(height);
    expect(column.nativeElement.offsetWidth).toBe(width);

    const colHeaderTitle = column.children
        .filter(c => c.nativeElement.classList.contains(GRID_COL_GROUP_THEAD_TITLE_CLASS))[0];
    expect(colHeaderTitle.nativeElement.textContent).toBe(title);

    const colGroupDirectChildren = column.children
        .filter(c => c.nativeElement.classList.contains(GRID_COL_GROUP_THEAD_GROUP_CLASS))[0]
        .children.filter(c => {
            const header = c.query(By.directive(IgxGridHeaderComponent));
           return header.nativeElement.classList.contains(descendentColumnCssClass);
        });

    expect(colGroupDirectChildren.length).toBe(descendentColumnCount);
}

function testColumnHeaderRendering(column: DebugElement, width: number, height: number,
    title: string) {
    expect(column.nativeElement.offsetHeight).toBe(height);
    expect(column.nativeElement.offsetWidth).toBe(width);

    const colHeaderTitle = column.children
        .filter(c => c.nativeElement.classList.contains(GRID_COL_THEAD_TITLE_CLASS))[0];
    expect(colHeaderTitle.nativeElement.textContent.trim()).toBe(title);
}

function testColumnsOrder(columns: IgxColumnComponent[]) {
    testColumnsIndexes(columns);
    testColumnsVisibleIndexes(columns);
}

function testColumnsIndexes(columns: IgxColumnComponent[]) {
    for (let index = 0; index < columns.length; index++) {
        expect(columns[index].index).toBe(index);
    }
}

function testColumnsVisibleIndexes(columns: IgxColumnComponent[]) {
    let visibleIndex = 0;
    for (let index = 0; index < columns.length; index++) {
        expect(columns[index].visibleIndex).toBe(visibleIndex);
        if (!(columns[index] instanceof IgxColumnGroupComponent)) {
            visibleIndex++;
        }
    }
}

function testGroupsAndColumns(groups: number, columns: number) {
    expect(document.querySelectorAll('igx-grid-header-group').length).toEqual(groups);
    expect(document.querySelectorAll(GRID_COL_THEAD_CLASS).length).toEqual(columns);
}

function testColumnPinning(column: IgxColumnComponent, isPinned: boolean) {
    expect(column.pinned).toBe(isPinned);
    expect(column.allChildren.every(c => c.pinned === isPinned)).toEqual(true);
}


type PinUnpinFunc = (component: ColumnGroupFourLevelTestComponent) => void;

class PinningTests {
    static testColumnGroupPinning(pinGenInfoColFunc: PinUnpinFunc, unpinGenInfoColFunc: PinUnpinFunc) {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;
        const grid = ci.grid;
        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);

        // Pin a column in a group
        pinGenInfoColFunc(ci);

        // Verify the topParent group is pinned
        testColumnPinning(ci.genInfoColGroup, true);
        testColumnPinning(ci.idCol, false);
        testColumnPinning(ci.addrInfoColGroup, false);
        testColumnsIndexes(ci.colsAndGroupsNaturalOrder);
        testColumnsVisibleIndexes(ci.genInfoColsAndGroups.concat(ci.idCol).concat(ci.addrInfoColGroup));

        expect(grid.pinnedColumns.length).toEqual(5);
        expect(grid.unpinnedColumns.length).toEqual(13);

        // Unpin a column
        unpinGenInfoColFunc(ci);

        // Verify the topParent group is not pinned
        testColumnPinning(ci.genInfoColGroup, false);
        testColumnPinning(ci.idCol, false);
        testColumnPinning(ci.addrInfoColGroup, false);
        testColumnsOrder(ci.colsAndGroupsNaturalOrder);

        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);
    }
}

class NestedColGroupsTests {
    static testHeadersRendering(fixture: ComponentFixture<NestedColumnGroupsGridComponent>) {
        const ci = fixture.componentInstance;
        const grid = ci.grid;
        const firstSlaveColGroup = fixture.debugElement.query(By.css('.firstSlaveColGroup'));
        const firstSlaveColGroupDepth = 2; // one-level children
        const firstSlaveColGroupChildrenCount = 2;
        const firstSlaveColGroupWidth = parseInt(ci.columnWidth, 10) + parseInt(ci.phoneColWidth, 10);

        testColumnGroupHeaderRendering(firstSlaveColGroup, firstSlaveColGroupWidth,
            firstSlaveColGroupDepth * grid.defaultRowHeight,
            ci.firstSlaveColGroupTitle, 'firstSlaveChild', firstSlaveColGroupChildrenCount);

        const secondSlaveColGroup = fixture.debugElement.query(By.css('.secondSlaveColGroup'));
        const secondSlaveColGroupDepth = 2; // one-level children
        const secondSlaveColGroupChildrenCount = 2;
        const secondSlaveColGroupWidth = parseInt(ci.faxColWidth, 10) + parseInt(ci.cityColWidth, 10);

        testColumnGroupHeaderRendering(secondSlaveColGroup, secondSlaveColGroupWidth,
            secondSlaveColGroupDepth * grid.defaultRowHeight,
            ci.secondSlaveColGroupTitle, 'secondSlaveChild', secondSlaveColGroupChildrenCount);

        const masterColGroup = fixture.debugElement.query(By.css('.masterColGroup'));
        const masterColGroupWidth = firstSlaveColGroupWidth + secondSlaveColGroupWidth;
        const masterSlaveColGroupDepth = 3;
        const masterColGroupChildrenCount = 0;

        testColumnGroupHeaderRendering(masterColGroup, masterColGroupWidth,
            masterSlaveColGroupDepth * grid.defaultRowHeight, ci.masterColGroupTitle,
            'slaveColGroup', masterColGroupChildrenCount);
    }
}
