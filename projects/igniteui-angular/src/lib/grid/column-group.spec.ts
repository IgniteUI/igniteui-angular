import { async, TestBed } from '@angular/core/testing';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { Component, ViewChild, DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnComponent, IgxColumnGroupComponent } from './column.component';
import { By } from '@angular/platform-browser';

const GRID_COL_THEAD_TITLE_CLASS = 'igx-grid__th-title';
const GRID_COL_GROUP_THEAD_TITLE_CLASS = 'igx-grid__thead-title';
const GRID_COL_GROUP_THEAD_GROUP_CLASS = 'igx-grid__thead-group';
const GRID_COL_THEAD_CLASS = '.igx-grid__th';

const expectedColumnGroups = 5;
const expectedLevel = 2;

describe('IgxGrid - multi-column headers', () => {

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
                NestedColGroupsGridComponent
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

        expect(grid.columnList.filter(col => col.columnGroup).length).toEqual(expectedColumnGroups);
        expect(grid.getColumnByName('ContactName').level).toEqual(expectedLevel);
    });

    it('column hiding - parent level', () => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const addressGroup = grid.columnList.filter(c => c.header === 'Address Information')[0];

        addressGroup.hidden = true;
        fixture.detectChanges();

        expect(document.querySelectorAll('igx-grid-header').length).toEqual(6);
    });

    it('column hiding - child level', () => {
        const fixture = TestBed.createComponent(ColumnGroupChildLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const addressGroup = grid.columnList.filter(c => c.header === 'Address')[0];

        addressGroup.children.first.hidden = true;
        fixture.detectChanges();

        expect(document.querySelectorAll('igx-grid-header').length).toEqual(5);
        expect(addressGroup.children.first.hidden).toBe(true);
        expect(addressGroup.children.first.children.toArray().every(c => c.hidden === true)).toEqual(true);
    });

    it('column hiding - Verify column hiding of Individual column and Child column', () => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        expect(document.querySelectorAll('igx-grid-header').length).toEqual(18);
        expect(fixture.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS)).length).toEqual(11);

        // Hide individual column
        grid.getColumnByName('ID').hidden = true;
        fixture.detectChanges();

        expect(document.querySelectorAll('igx-grid-header').length).toEqual(17);
        expect(fixture.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS)).length).toEqual(10);

        // Hide column in goup
        grid.getColumnByName('CompanyName').hidden = true;
        fixture.detectChanges();
        expect(document.querySelectorAll('igx-grid-header').length).toEqual(16);
        expect(fixture.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS)).length).toEqual(9);

        grid.getColumnByName('Address').hidden = true;
        fixture.detectChanges();
        expect(document.querySelectorAll('igx-grid-header').length).toEqual(15);
        expect(fixture.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS)).length).toEqual(8);
    });

    it('column hiding - Verify when 2 of 2 child columns are hidden, the Grouped column would be hidden as well.', () => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        expect(document.querySelectorAll('igx-grid-header').length).toEqual(18);
        expect(fixture.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS)).length).toEqual(11);

        // Hide 2 columns in the group
        grid.getColumnByName('ContactName').hidden = true;
        grid.getColumnByName('ContactTitle').hidden = true;
        fixture.detectChanges();

        expect(document.querySelectorAll('igx-grid-header').length).toEqual(15);
        expect(fixture.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS)).length).toEqual(9);
        expect(getColGroup(grid, 'Person Details').hidden).toEqual(true);

        // Show one of the columns
        grid.getColumnByName('ContactName').hidden = false;
        fixture.detectChanges();

        expect(document.querySelectorAll('igx-grid-header').length).toEqual(17);
        expect(fixture.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS)).length).toEqual(10);
        expect(getColGroup(grid, 'Person Details').hidden).toEqual(false);
    });

    it('column hiding - Verify when 1 child column and 1 group are hidden, the Grouped column would be hidden as well.', () => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        expect(document.querySelectorAll('igx-grid-header').length).toEqual(18);
        expect(fixture.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS)).length).toEqual(11);

        // Hide 2 columns in the group
        grid.getColumnByName('CompanyName').hidden = true;
        getColGroup(grid, 'Person Details').hidden = true;
        fixture.detectChanges();

        expect(document.querySelectorAll('igx-grid-header').length).toEqual(13);
        expect(fixture.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS)).length).toEqual(8);
        expect(getColGroup(grid, 'General Information').hidden).toEqual(true);

        // Show the group
        getColGroup(grid, 'Person Details').hidden = false;
        fixture.detectChanges();
        expect(document.querySelectorAll('igx-grid-header').length).toEqual(17);
        expect(fixture.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS)).length).toEqual(10);
        expect(getColGroup(grid, 'General Information').hidden).toEqual(false);
    });

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

    it('Width should be correct. Column group with column. Width in px.', () => {
        const fixture = TestBed.createComponent(OneGroupOneColGridComponent);
        const gridWidth = '600px';
        const gridWidthPx = parseInt(gridWidth, 10);
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        grid.width = gridWidth;
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        expect(locationColGroup.width).toBe(gridWidthPx.toString());
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(gridWidthPx.toString());
    });

    it('Width should be correct. Column group with column. Width in percent.', () => {
        const fixture = TestBed.createComponent(OneGroupOneColGridComponent);
        const gridWidth = '50%';
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        grid.width = gridWidth;
        fixture.detectChanges();

        const locationColGroup = getColGroup(grid, 'Location');
        const gridWidthInPx = (parseInt(gridWidth, 10) / 100) *
            parseInt(componentInstance.gridWrapperWidthPx, 10);
        expect(locationColGroup.width).toBe(gridWidthInPx.toString());
        const cityColumn = grid.getColumnByName('City');
        expect(cityColumn.width).toBe(gridWidthInPx.toString());
    });

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

    it('Width should be correct. Column group with three columns. Width in px.', () => {
        const fixture = TestBed.createComponent(OneGroupThreeColsGridComponent);
        const gridWidth = '600px';
        const gridWidthInPx = parseInt(gridWidth, 10);
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        grid.width = gridWidth;
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
    });

    it('Width should be correct. Column group with three columns. Width in percent.', () => {
        const fixture = TestBed.createComponent(OneGroupThreeColsGridComponent);
        const gridWidth = '50%';
        const componentInstance = fixture.componentInstance;
        const grid = componentInstance.grid;
        grid.width = gridWidth;
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
    });

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

    it('API method level should return correct values', () => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Fax').hidden = true;
        getColGroup(grid, 'Person Details').hidden = true;
        fixture.detectChanges();

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
    });

    it('API method columnGroup should return correct values', () => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Fax').hidden = true;
        getColGroup(grid, 'Person Details').hidden = true;
        fixture.detectChanges();

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
    });

    it('API method allChildren should return correct values', () => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Fax').hidden = true;
        getColGroup(grid, 'Person Details').hidden = true;
        fixture.detectChanges();

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
    });

    it('API method children should return correct values', () => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Fax').hidden = true;
        getColGroup(grid, 'Person Details').hidden = true;
        fixture.detectChanges();

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
    });

    it('API method topLevelParent should return correct values', () => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        grid.getColumnByName('Fax').hidden = true;
        getColGroup(grid, 'Person Details').hidden = true;
        fixture.detectChanges();

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
    });

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
        fixture.whenStable().then(() => {
            const firstGroup = fixture.debugElement.query(By.css('.firstGroup'));
            testColumnGroupHeaderRendering(firstGroup, firstGroupChildrenCount * columnWidthPx,
                gridHeadersDepth * grid.defaultRowHeight, componentInstance.firstGroupTitle,
                'firstGroupColumn', firstGroupChildrenCount);

            const horizontalScroll = grid.parentVirtDir.getHorizontalScroll();
            const scrollToNextGroup = firstGroupChildrenCount * columnWidthPx + columnWidthPx;
            horizontalScroll.scrollLeft = scrollToNextGroup;
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            setTimeout(() => {
                const secondGroup = fixture.debugElement.query(By.css('.secondGroup'));
                testColumnGroupHeaderRendering(secondGroup,
                    secondGroupChildrenCount * secondSubGroupChildrenCount * columnWidthPx,
                    gridHeadersDepth * grid.defaultRowHeight, componentInstance.secondGroupTitle,
                    'secondSubGroup', secondGroupChildrenCount);

                const secondSubGroups = secondGroup.queryAll(By.css('.secondSubGroup'));
                testColumnGroupHeaderRendering(secondSubGroups[0],
                    secondSubGroupChildrenCount * columnWidthPx,
                    secondSubGroupHeadersDepth * grid.defaultRowHeight, componentInstance.secondSubGroupTitle,
                    'secondSubGroupColumn', secondSubGroupChildrenCount);

                testColumnGroupHeaderRendering(secondSubGroups[1],
                    secondSubGroupChildrenCount * columnWidthPx,
                    secondSubGroupHeadersDepth * grid.defaultRowHeight, componentInstance.secondSubGroupTitle,
                    'secondSubGroupColumn', secondSubGroupChildrenCount);

                const horizontalScroll = grid.parentVirtDir.getHorizontalScroll();
                const scrollToNextGroup = horizontalScroll.scrollLeft +
                    secondSubGroupHeadersDepth * secondSubGroupChildrenCount * columnWidthPx;
                horizontalScroll.scrollLeft = scrollToNextGroup;
                return fixture.whenStable();
            }, 100);
        }).then(() => {
            fixture.detectChanges();
            setTimeout(() => {
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
        });
    }));

    it('column pinning -  Pin a column in a group', () => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);

        // Pin a column in a group
        const colContactTitle = grid.getColumnByName('ContactTitle');
        colContactTitle.pinned = true;
        fixture.detectChanges();

        // Verify the topParent group is pinned
        const grGeneralInf = getColGroup(grid, 'General Information');
        expect(grGeneralInf.allChildren.every(c => c.pinned === true)).toEqual(true);

        // expect(grGeneralInf.visibleIndex).toEqual(-1);
        // expect(grid.getColumnByName('ID').visibleIndex).toEqual(0);

        expect(grid.pinnedColumns.length).toEqual(5);
        expect(grid.unpinnedColumns.length).toEqual(13);

        // Unpin a column
        grid.getColumnByName('CompanyName').pinned = false;
        fixture.detectChanges();

        // Verify the topParent group is not pinned
        expect(grGeneralInf.allChildren.every(c => c.pinned === false)).toEqual(true);

        // expect(grGeneralInf.visibleIndex).toEqual(0);
        // expect(grid.getColumnByName('ID').visibleIndex).toEqual(0);

        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);
    });

    it('column pinning -  Pin a group in level one', () => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);

        // Pin top group
        const grGeneralInf = getColGroup(grid, 'General Information');
        grGeneralInf.pinned = true;
        fixture.detectChanges();

        // Verify group and all its children are pinned
        expect(grGeneralInf.allChildren.every(c => c.pinned === true)).toEqual(true);

        // expect(grGeneralInf.visibleIndex).toEqual(-1);
        expect(grid.getColumnByName('CompanyName').visibleIndex).toEqual(0);

        // expect(grGeneralInf.visibleIndex).toEqual(-1);
        // expect(grid.getColumnByName('CompanyName').visibleIndex).toEqual(0);

        expect(grid.pinnedColumns.length).toEqual(5);
        expect(grid.unpinnedColumns.length).toEqual(13);

        // Unpin top group
        grGeneralInf.pinned = false;
        fixture.detectChanges();

        // Verify group and all its children are not pinned
        expect(grGeneralInf.allChildren.every(c => c.pinned === false)).toEqual(true);

        // expect(grGeneralInf.visibleIndex).toEqual(0);
        expect(grid.getColumnByName('ID').visibleIndex).toEqual(0);

        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);
    });

    it('column pinning -  Try to pin column or group which not match in the view', () => {
        const fixture = TestBed.createComponent(ColumnGroupFourLevelTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);

        // Try to pin top group
        const grAdressInf = getColGroup(grid, 'Address Information');
        grAdressInf.pinned = true;
        fixture.detectChanges();

        // Verify group and all its children are not pinned
        expect(grAdressInf.allChildren.every(c => c.pinned === false)).toEqual(true);

        expect(grid.getColumnByName('ID').visibleIndex).toEqual(0);

        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);

        // Try to pin a column
        grid.getColumnByName('Fax').pinned = true;
        fixture.detectChanges();

        // Verify group and all its children are not pinned
        expect(grAdressInf.allChildren.every(c => c.pinned === false)).toEqual(true);

        expect(grid.getColumnByName('ID').visibleIndex).toEqual(0);

        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);

        // Try to pin child group
        getColGroup(grid, 'Contact Information').pinned = true;
        fixture.detectChanges();

        // Verify group and all its children are not pinned
        expect(grAdressInf.allChildren.every(c => c.pinned === false)).toEqual(true);

        expect(grid.getColumnByName('ID').visibleIndex).toEqual(0);

        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(18);
    });

    it('column pinning -  Verify pin a not fully visble group', () => {
        const fixture = TestBed.createComponent(ColumnGroupTwoGroupsTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        expect(grid.pinnedColumns.length).toEqual(0);
        expect(grid.unpinnedColumns.length).toEqual(13);

        // Pin a Group which is not fully visble
        const grAdressInf = getColGroup(grid, 'Address Information');
        grAdressInf.pinned = true;
        fixture.detectChanges();

        // Verify group and all its children are not pinned
        expect(grAdressInf.allChildren.every(c => c.pinned === true)).toEqual(true);

        expect(grid.getCellByColumn(0, 'ID')).toBeDefined();
        expect(grid.getCellByColumn(0, 'Country')).toBeDefined();
        expect(grid.getCellByColumn(0, 'City')).toBeDefined();

        // expect(grid.getCellByColumn(0, 'ID').value).toEqual("ALFKI");
        // expect(grid.getCellByColumn(0, 'Country').value).toEqual("Germany");
        // expect(grid.getCellByColumn(0, 'City').value).toEqual("Berlin");
    });

    xit('Should move column group correctly. One level column groups.', () => {
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
        fixture.detectChanges();
        testColumnsOrder(contactInfoCols.concat(genInfoCols).concat(locCols));

        // moving first to be last
        grid.moveColumn(ci.contactInfoColGroup, ci.locationColGroup);
        fixture.detectChanges();
        testColumnsOrder(genInfoCols.concat(locCols).concat(contactInfoCols));

        // moving inner to be last 
        grid.moveColumn(ci.locationColGroup, ci.contactInfoColGroup);
        fixture.detectChanges();
        testColumnsOrder(genInfoCols.concat(contactInfoCols).concat(locCols));

        // moving inner to be first
        grid.moveColumn(ci.contactInfoColGroup, ci.genInfoColGroup);
        fixture.detectChanges();
        testColumnsOrder(contactInfoCols.concat(genInfoCols).concat(locCols));

        // moving to the same spot, no change expected
        grid.moveColumn(ci.genInfoColGroup, ci.genInfoColGroup);
        fixture.detectChanges();
        testColumnsOrder(contactInfoCols.concat(genInfoCols).concat(locCols));

        // moving column group to the place of a column, no change expected
        grid.moveColumn(ci.genInfoColGroup, ci.countryCol);
        fixture.detectChanges();
        testColumnsOrder(contactInfoCols.concat(genInfoCols).concat(locCols));
    });

    xit('Should move columns within column groups. One level column groups.', () => {
        const fixture = TestBed.createComponent(ThreeGroupsThreeColumnsGridComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;
        const grid = ci.grid;
        const genInfoAndLocCols = [ci.genInfoColGroup, ci.companyNameCol,
            ci.contactNameCol, ci.contactTitleCol, ci.locationColGroup, ci.countryCol,
            ci.regionCol, ci.cityCol];

        // moving last to be first
        grid.moveColumn(ci.postalCodeCol, ci.phoneCol);
        fixture.detectChanges();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.postalCodeCol, ci.phoneCol, ci.faxCol]));

        // moving first to be last
        grid.moveColumn(ci.postalCodeCol, ci.faxCol);
        fixture.detectChanges();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.phoneCol, ci.faxCol, ci.postalCodeCol]));

        // moving inner to be last 
        grid.moveColumn(ci.faxCol, ci.postalCodeCol);
        fixture.detectChanges();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.phoneCol, ci.postalCodeCol, ci.faxCol]));

        // moving inner to be first
        grid.moveColumn(ci.postalCodeCol, ci.phoneCol);
        fixture.detectChanges();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.postalCodeCol, ci.phoneCol, ci.faxCol]));

        // moving to the sample spot, no change expected
        grid.moveColumn(ci.postalCodeCol, ci.postalCodeCol);
        fixture.detectChanges();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.postalCodeCol, ci.phoneCol, ci.faxCol]));

        // moving column to the place of its column group, no change expected
        grid.moveColumn(ci.postalCodeCol, ci.contactInfoColGroup);
        fixture.detectChanges();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.postalCodeCol, ci.phoneCol, ci.faxCol]));

        //// moving column to the place of a column group, no change expected
        grid.moveColumn(ci.postalCodeCol, ci.genInfoColGroup);
        fixture.detectChanges();
        testColumnsOrder(genInfoAndLocCols.concat([ci.contactInfoColGroup,
            ci.postalCodeCol, ci.phoneCol, ci.faxCol]));
    });

    xit('Should move columns and groups. Two level column groups.', () => {
        const fixture = TestBed.createComponent(NestedColGroupsGridComponent);
        fixture.detectChanges();
        const ci = fixture.componentInstance;
        const grid = ci.grid;

        // moving a two-level col
        grid.moveColumn(ci.phoneCol, ci.locationColGroup);
        fixture.detectChanges();
        testColumnsOrder([ci.contactInfoColGroup, ci.phoneCol, ci.locationColGroup, ci.countryCol,
            ci.genInfoColGroup, ci.companyNameCol, ci.cityCol]);

        // moving a three-level col
        grid.moveColumn(ci.cityCol, ci.contactInfoColGroup);
        fixture.detectChanges();
        const colsOrder = [ci.cityCol, ci.contactInfoColGroup, ci.phoneCol,
            ci.locationColGroup, ci.countryCol, ci.genInfoColGroup, ci.companyNameCol];
        testColumnsOrder(colsOrder);

        // moving between different groups, hould stay the same
        grid.moveColumn(ci.locationColGroup, ci.companyNameCol);
        fixture.detectChanges();
        testColumnsOrder(colsOrder);

        // moving between different levels, should stay the same
        grid.moveColumn(ci.countryCol, ci.phoneCol);
        fixture.detectChanges();
        testColumnsOrder(colsOrder);

        // moving between different levels, should stay the same
        grid.moveColumn(ci.cityCol, ci.phoneCol);
        fixture.detectChanges();
        testColumnsOrder(colsOrder);

        grid.moveColumn(ci.genInfoColGroup, ci.companyNameCol);
        fixture.detectChanges();
        testColumnsOrder(colsOrder);

        grid.moveColumn(ci.locationColGroup, ci.contactInfoColGroup);
        fixture.detectChanges();
        testColumnsOrder(colsOrder);
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
    data = DATASOURCE;
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
    data = DATASOURCE;
}

@Component({
    template: `
    <igx-grid #grid [data]="data">
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

    data = DATASOURCE;
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
            <igx-column-group header="Postal Code">
                <igx-column field="PostalCode"></igx-column>
            </igx-column-group>
        </igx-column-group>
    </igx-grid>
    `
})
export class ColumnGroupFourLevelTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;

    data = DATASOURCE;
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

    data = DATASOURCE;
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

    data = DATASOURCE;
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

    data = DATASOURCE;
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

    data = DATASOURCE;
}

@Component({
    template: `
        <igx-grid #grid [data]="data" [height]="gridHeight" [columnWidth]="columnWidth">
            <igx-column-group headerClasses="firstGroup" [header]="firstGroupTitle">
                <igx-column headerClasses="firstGroupColumn" field="ID" *ngFor="let item of hunderdItems;"></igx-column>
            </igx-column-group>
            <igx-column-group headerClasses="secondGroup" [header]="secondGroupTitle">
                <igx-column-group headerClasses="secondSubGroup" [header]="secondSubGroupTitle">
                    <igx-column headerClasses="secondSubGroupColumn" field="ID" *ngFor="let item of fiftyItems;"></igx-column>
                </igx-column-group>
                <igx-column-group headerClasses="secondSubGroup" [header]="secondSubGroupTitle">
                    <igx-column  headerClasses="secondSubGroupColumn" field="ID" *ngFor="let item of fiftyItems;"></igx-column>
                </igx-column-group>
            </igx-column-group>
            <igx-column headerClasses="lonelyId" [header]="idHeaderTitle" field="ID"></igx-column>
            <igx-column-group header="General Information">
                <igx-column headerClasses="companyName" [header]="companyNameTitle" field="CompanyName"></igx-column>
                <igx-column-group headerClasses="personDetails" [header]="personDetailsTitle">
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
    data = DATASOURCE;

    hunderdItems = new Array(100);
    fiftyItems = new Array(50);

    firstGroupTitle = '100 IDs';
    secondGroupTitle = '2 col groups with 50 IDs each';
    secondSubGroupTitle = '50 IDs';
    idHeaderTitle = 'ID';
    companyNameTitle = 'Company Name';
    personDetailsTitle = 'Person Details';
}

export const DATASOURCE = [
    // tslint:disable:max-line-length
    { 'ID': 'ALFKI', 'CompanyName': 'Alfreds Futterkiste', 'ContactName': 'Maria Anders', 'ContactTitle': 'Sales Representative', 'Address': 'Obere Str. 57', 'City': 'Berlin', 'Region': null, 'PostalCode': '12209', 'Country': 'Germany', 'Phone': '030-0074321', 'Fax': '030-0076545' },
    { 'ID': 'ANATR', 'CompanyName': 'Ana Trujillo Emparedados y helados', 'ContactName': 'Ana Trujillo', 'ContactTitle': 'Owner', 'Address': 'Avda. de la Constitución 2222', 'City': 'México D.F.', 'Region': null, 'PostalCode': '05021', 'Country': 'Mexico', 'Phone': '(5) 555-4729', 'Fax': '(5) 555-3745' },
    { 'ID': 'ANTON', 'CompanyName': 'Antonio Moreno Taquería', 'ContactName': 'Antonio Moreno', 'ContactTitle': 'Owner', 'Address': 'Mataderos 2312', 'City': 'México D.F.', 'Region': null, 'PostalCode': '05023', 'Country': 'Mexico', 'Phone': '(5) 555-3932', 'Fax': null },
    { 'ID': 'AROUT', 'CompanyName': 'Around the Horn', 'ContactName': 'Thomas Hardy', 'ContactTitle': 'Sales Representative', 'Address': '120 Hanover Sq.', 'City': 'London', 'Region': null, 'PostalCode': 'WA1 1DP', 'Country': 'UK', 'Phone': '(171) 555-7788', 'Fax': '(171) 555-6750' },
    { 'ID': 'BERGS', 'CompanyName': 'Berglunds snabbköp', 'ContactName': 'Christina Berglund', 'ContactTitle': 'Order Administrator', 'Address': 'Berguvsvägen 8', 'City': 'Luleå', 'Region': null, 'PostalCode': 'S-958 22', 'Country': 'Sweden', 'Phone': '0921-12 34 65', 'Fax': '0921-12 34 67' },
    { 'ID': 'BLAUS', 'CompanyName': 'Blauer See Delikatessen', 'ContactName': 'Hanna Moos', 'ContactTitle': 'Sales Representative', 'Address': 'Forsterstr. 57', 'City': 'Mannheim', 'Region': null, 'PostalCode': '68306', 'Country': 'Germany', 'Phone': '0621-08460', 'Fax': '0621-08924' },
    { 'ID': 'BLONP', 'CompanyName': 'Blondesddsl père et fils', 'ContactName': 'Frédérique Citeaux', 'ContactTitle': 'Marketing Manager', 'Address': '24, place Kléber', 'City': 'Strasbourg', 'Region': null, 'PostalCode': '67000', 'Country': 'France', 'Phone': '88.60.15.31', 'Fax': '88.60.15.32' },
    { 'ID': 'BOLID', 'CompanyName': 'Bólido Comidas preparadas', 'ContactName': 'Martín Sommer', 'ContactTitle': 'Owner', 'Address': 'C/ Araquil, 67', 'City': 'Madrid', 'Region': null, 'PostalCode': '28023', 'Country': 'Spain', 'Phone': '(91) 555 22 82', 'Fax': '(91) 555 91 99' },
    { 'ID': 'BONAP', 'CompanyName': 'Bon app\'', 'ContactName': 'Laurence Lebihan', 'ContactTitle': 'Owner', 'Address': '12, rue des Bouchers', 'City': 'Marseille', 'Region': null, 'PostalCode': '13008', 'Country': 'France', 'Phone': '91.24.45.40', 'Fax': '91.24.45.41' },
    { 'ID': 'BOTTM', 'CompanyName': 'Bottom-Dollar Markets', 'ContactName': 'Elizabeth Lincoln', 'ContactTitle': 'Accounting Manager', 'Address': '23 Tsawassen Blvd.', 'City': 'Tsawassen', 'Region': 'BC', 'PostalCode': 'T2F 8M4', 'Country': 'Canada', 'Phone': '(604) 555-4729', 'Fax': '(604) 555-3745' },
    { 'ID': 'BSBEV', 'CompanyName': 'B\'s Beverages', 'ContactName': 'Victoria Ashworth', 'ContactTitle': 'Sales Representative', 'Address': 'Fauntleroy Circus', 'City': 'London', 'Region': null, 'PostalCode': 'EC2 5NT', 'Country': 'UK', 'Phone': '(171) 555-1212', 'Fax': null },
    { 'ID': 'CACTU', 'CompanyName': 'Cactus Comidas para llevar', 'ContactName': 'Patricio Simpson', 'ContactTitle': 'Sales Agent', 'Address': 'Cerrito 333', 'City': 'Buenos Aires', 'Region': null, 'PostalCode': '1010', 'Country': 'Argentina', 'Phone': '(1) 135-5555', 'Fax': '(1) 135-4892' },
    { 'ID': 'CENTC', 'CompanyName': 'Centro comercial Moctezuma', 'ContactName': 'Francisco Chang', 'ContactTitle': 'Marketing Manager', 'Address': 'Sierras de Granada 9993', 'City': 'México D.F.', 'Region': null, 'PostalCode': '05022', 'Country': 'Mexico', 'Phone': '(5) 555-3392', 'Fax': '(5) 555-7293' },
    { 'ID': 'CHOPS', 'CompanyName': 'Chop-suey Chinese', 'ContactName': 'Yang Wang', 'ContactTitle': 'Owner', 'Address': 'Hauptstr. 29', 'City': 'Bern', 'Region': null, 'PostalCode': '3012', 'Country': 'Switzerland', 'Phone': '0452-076545', 'Fax': null },
    { 'ID': 'COMMI', 'CompanyName': 'Comércio Mineiro', 'ContactName': 'Pedro Afonso', 'ContactTitle': 'Sales Associate', 'Address': 'Av. dos Lusíadas, 23', 'City': 'Sao Paulo', 'Region': 'SP', 'PostalCode': '05432-043', 'Country': 'Brazil', 'Phone': '(11) 555-7647', 'Fax': null },
    { 'ID': 'CONSH', 'CompanyName': 'Consolidated Holdings', 'ContactName': 'Elizabeth Brown', 'ContactTitle': 'Sales Representative', 'Address': 'Berkeley Gardens 12 Brewery', 'City': 'London', 'Region': null, 'PostalCode': 'WX1 6LT', 'Country': 'UK', 'Phone': '(171) 555-2282', 'Fax': '(171) 555-9199' },
    { 'ID': 'DRACD', 'CompanyName': 'Drachenblut Delikatessen', 'ContactName': 'Sven Ottlieb', 'ContactTitle': 'Order Administrator', 'Address': 'Walserweg 21', 'City': 'Aachen', 'Region': null, 'PostalCode': '52066', 'Country': 'Germany', 'Phone': '0241-039123', 'Fax': '0241-059428' },
    { 'ID': 'DUMON', 'CompanyName': 'Du monde entier', 'ContactName': 'Janine Labrune', 'ContactTitle': 'Owner', 'Address': '67, rue des Cinquante Otages', 'City': 'Nantes', 'Region': null, 'PostalCode': '44000', 'Country': 'France', 'Phone': '40.67.88.88', 'Fax': '40.67.89.89' },
    { 'ID': 'EASTC', 'CompanyName': 'Eastern Connection', 'ContactName': 'Ann Devon', 'ContactTitle': 'Sales Agent', 'Address': '35 King George', 'City': 'London', 'Region': null, 'PostalCode': 'WX3 6FW', 'Country': 'UK', 'Phone': '(171) 555-0297', 'Fax': '(171) 555-3373' },
    { 'ID': 'ERNSH', 'CompanyName': 'Ernst Handel', 'ContactName': 'Roland Mendel', 'ContactTitle': 'Sales Manager', 'Address': 'Kirchgasse 6', 'City': 'Graz', 'Region': null, 'PostalCode': '8010', 'Country': 'Austria', 'Phone': '7675-3425', 'Fax': '7675-3426' },
    { 'ID': 'FAMIA', 'CompanyName': 'Familia Arquibaldo', 'ContactName': 'Aria Cruz', 'ContactTitle': 'Marketing Assistant', 'Address': 'Rua Orós, 92', 'City': 'Sao Paulo', 'Region': 'SP', 'PostalCode': '05442-030', 'Country': 'Brazil', 'Phone': '(11) 555-9857', 'Fax': null },
    { 'ID': 'FISSA', 'CompanyName': 'FISSA Fabrica Inter. Salchichas S.A.', 'ContactName': 'Diego Roel', 'ContactTitle': 'Accounting Manager', 'Address': 'C/ Moralzarzal, 86', 'City': 'Madrid', 'Region': null, 'PostalCode': '28034', 'Country': 'Spain', 'Phone': '(91) 555 94 44', 'Fax': '(91) 555 55 93' },
    { 'ID': 'FOLIG', 'CompanyName': 'Folies gourmandes', 'ContactName': 'Martine Rancé', 'ContactTitle': 'Assistant Sales Agent', 'Address': '184, chaussée de Tournai', 'City': 'Lille', 'Region': null, 'PostalCode': '59000', 'Country': 'France', 'Phone': '20.16.10.16', 'Fax': '20.16.10.17' },
    { 'ID': 'FOLKO', 'CompanyName': 'Folk och fä HB', 'ContactName': 'Maria Larsson', 'ContactTitle': 'Owner', 'Address': 'Åkergatan 24', 'City': 'Bräcke', 'Region': null, 'PostalCode': 'S-844 67', 'Country': 'Sweden', 'Phone': '0695-34 67 21', 'Fax': null },
    { 'ID': 'FRANK', 'CompanyName': 'Frankenversand', 'ContactName': 'Peter Franken', 'ContactTitle': 'Marketing Manager', 'Address': 'Berliner Platz 43', 'City': 'München', 'Region': null, 'PostalCode': '80805', 'Country': 'Germany', 'Phone': '089-0877310', 'Fax': '089-0877451' },
    { 'ID': 'FRANR', 'CompanyName': 'France restauration', 'ContactName': 'Carine Schmitt', 'ContactTitle': 'Marketing Manager', 'Address': '54, rue Royale', 'City': 'Nantes', 'Region': null, 'PostalCode': '44000', 'Country': 'France', 'Phone': '40.32.21.21', 'Fax': '40.32.21.20' },
    { 'ID': 'FRANS', 'CompanyName': 'Franchi S.p.A.', 'ContactName': 'Paolo Accorti', 'ContactTitle': 'Sales Representative', 'Address': 'Via Monte Bianco 34', 'City': 'Torino', 'Region': null, 'PostalCode': '10100', 'Country': 'Italy', 'Phone': '011-4988260', 'Fax': '011-4988261' }
];
// tslint:enable:max-line-length

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
        .children.filter(c => c.nativeElement.classList.contains(descendentColumnCssClass));

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
    let visibleIndex = 0;
    for (let index = 0; index < columns.length; index++) {
        expect(columns[index].index).toBe(index);
        expect(columns[index].visibleIndex).toBe(visibleIndex);
        if (!(columns[index] instanceof IgxColumnGroupComponent)) {
            visibleIndex++;
        }
    }
}
