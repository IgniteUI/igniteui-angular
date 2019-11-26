import { async, TestBed, fakeAsync } from '@angular/core/testing';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { CollapsibleColumnGroupTestComponent } from '../../test-utils/grid-samples.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';


fdescribe('IgxGrid - multi-column headers #grid', () => {
    configureTestSuite();
    let contactInf;
    let countryInf;
    let addressInf;
    let regionInf;
    let regionCol;
    let phoneCol;
    let country;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                CollapsibleColumnGroupTestComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule
            ]
        }).compileComponents();
    }));

    describe('Base Tests', () => {
        let fixture;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(CollapsibleColumnGroupTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            contactInf = GridFunctions.getColGroup(grid, 'Contact Information');
            countryInf = GridFunctions.getColGroup(grid, 'Country Information');
            addressInf = GridFunctions.getColGroup(grid, 'Address Information');
            regionCol = grid.getColumnByName('Region');
            phoneCol = grid.getColumnByName('Phone');
            country = grid.getColumnByName('Country');
        }));

        it('verify setting collapsible to a column group ', () => {
            GridFunctions.verifyColumnIsHidden(contactInf, false, 10);
            GridFunctions.verifyColumnIsHidden(countryInf, true, 10);

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header);
            GridFunctions.verifyGroupIsExpanded(fixture, contactInf.header, false);

            spyOn(addressInf.collapsibleChange, 'emit').and.callThrough();
            addressInf.collapsible = false;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(contactInf, false, 19);
            GridFunctions.verifyColumnIsHidden(countryInf, false, 19);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, false);
            expect(addressInf.collapsibleChange.emit).toHaveBeenCalledTimes(1);
            expect(addressInf.collapsibleChange.emit).toHaveBeenCalledWith(false);

            addressInf.collapsible = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(contactInf, false, 10);
            GridFunctions.verifyColumnIsHidden(countryInf, true, 10);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header);
            expect(addressInf.collapsibleChange.emit).toHaveBeenCalledTimes(2);
            expect(addressInf.collapsibleChange.emit).toHaveBeenCalledWith(true);
        });

        it('verify setting collapsible when all the column has same visibleWhenCollapsed', () => {
            addressInf.collapsible = false;
            fixture.detectChanges();

            expect(contactInf.collapsible).toBeFalsy();
            expect(countryInf.collapsible).toBeFalsy();

            GridFunctions.verifyGroupIsExpanded(fixture, contactInf.header, false);
            GridFunctions.verifyGroupIsExpanded(fixture, countryInf.header, false);

            regionCol.visibleWhenCollapsed = false;
            phoneCol.visibleWhenCollapsed = true;

            fixture.detectChanges();

            expect(contactInf.collapsible).toBeTruthy();
            expect(countryInf.collapsible).toBeTruthy();

            GridFunctions.verifyGroupIsExpanded(fixture, contactInf.header);
            GridFunctions.verifyGroupIsExpanded(fixture, countryInf.header);

            GridFunctions.verifyColumnIsHidden(country, true, 12);
            GridFunctions.verifyColumnIsHidden(regionCol, false, 12);

            GridFunctions.verifyColumnIsHidden(grid.getColumnByName('Fax'), false, 12);
            GridFunctions.verifyColumnIsHidden(phoneCol, true, 12);
        });

        it('verify setting expanded to a column group', () => {
            spyOn(addressInf.expandedChange, 'emit').and.callThrough();
            addressInf.expanded = false;
            fixture.detectChanges();

            expect(addressInf.expanded).toBeFalsy();
            GridFunctions.verifyColumnIsHidden(contactInf, true, 13);
            GridFunctions.verifyColumnIsHidden(countryInf, false, 13);

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, false);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledTimes(1);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledWith(false);

            addressInf.expanded = true;
            fixture.detectChanges();

            expect(addressInf.expanded).toBeTruthy();
            GridFunctions.verifyColumnIsHidden(contactInf, false, 11);
            GridFunctions.verifyColumnIsHidden(countryInf, true, 11);

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledTimes(2);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledWith(true);
        });

        it('verify setting expanded to a column group form UI', () => {
            spyOn(addressInf.expandedChange, 'emit').and.callThrough();
            GridFunctions.clickGroupExpandIndicator(fixture, addressInf.header);
            fixture.detectChanges();

            expect(addressInf.expanded).toBeFalsy();
            GridFunctions.verifyColumnIsHidden(contactInf, true, 13);
            GridFunctions.verifyColumnIsHidden(countryInf, false, 13);

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, false);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledTimes(1);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledWith(false);

            GridFunctions.clickGroupExpandIndicator(fixture, addressInf.header);
            fixture.detectChanges();

            expect(addressInf.expanded).toBeTruthy();
            GridFunctions.verifyColumnIsHidden(contactInf, false, 11);
            GridFunctions.verifyColumnIsHidden(countryInf, true, 11);

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledTimes(2);
            expect(addressInf.expandedChange.emit).toHaveBeenCalledWith(true);
        });
    });

    describe('Integration Tests', () => {
        let fixture;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(CollapsibleColumnGroupTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            regionInf = GridFunctions.getColGroup(grid, 'Region Information');
            countryInf = GridFunctions.getColGroup(grid, 'Country Information');
            contactInf = GridFunctions.getColGroup(grid, 'Contact Information');
            addressInf = GridFunctions.getColGroup(grid, 'Address Information');
            regionCol = grid.getColumnByName('Region');
            phoneCol = grid.getColumnByName('Phone');
            country = grid.getColumnByName('Country');
        }));

        it('Hiding: Verify that expanded state is preserved when hide column group', () => {
            addressInf.expanded = false;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, false);
            addressInf.hidden = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, true, 6);
            addressInf.hidden = false;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, false, 16);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, false);

            addressInf.expanded = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, false, 10);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, true);
            addressInf.hidden = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, true, 6);
            addressInf.hidden = false;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, false, 10);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, true);
        });

        it('Hiding: Verify that column can be hidden when the group is expanded', () => {
            expect(addressInf.expanded).toBe(true);
            GridFunctions.verifyColumnIsHidden(phoneCol, false, 10);
            phoneCol.hidden = true;
            fixture.detectChanges();

            expect(addressInf.expanded).toBe(true);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, true);
            GridFunctions.verifyColumnIsHidden(phoneCol, true, 9);
            phoneCol.hidden = false;
            fixture.detectChanges();

            expect(addressInf.expanded).toBe(true);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, true);
            GridFunctions.verifyColumnIsHidden(phoneCol, false, 10);
        });

        it('Hiding: Verify collapse a group when for a column disableHiding is set', () => {
            phoneCol.disableHiding = true;
            fixture.detectChanges();

            addressInf.expanded = false;
            fixture.detectChanges();

            expect(phoneCol.disableHiding).toBe(true);
            GridFunctions.verifyColumnIsHidden(phoneCol, true, 16);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, false);
        });

        it(`Hiding: Verify that when a column has set to hidden to true and
            visibleWhenCollapseChange to false, it is previewed in expanded group`, () => {
            expect(addressInf.collapsible).toBe(true);
            expect(fixture.componentInstance.hideContactInformation).toBe(true);

            GridFunctions.verifyColumnIsHidden(contactInf, false, 10);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, true);

            contactInf.hidden = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(contactInf, true, 6);
            contactInf.hidden = false;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(contactInf, false, 10);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, true);
        });

        it('Pinning: Verify that expanded state is preserved when pin column group', () => {
            expect(addressInf.pinned).toBe(false);
            expect(addressInf.expanded).toBe(true);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, true);
            addressInf.pinned = true;
            fixture.detectChanges();

            expect(addressInf.pinned).toBe(true);
            expect(addressInf.expanded).toBe(true);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, true);
            addressInf.expanded = false;
            fixture.detectChanges();

            expect(addressInf.pinned).toBe(true);
            expect(addressInf.expanded).toBe(false);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, false);
            addressInf.pinned = false;
            fixture.detectChanges();

            expect(addressInf.pinned).toBe(false);
            expect(addressInf.expanded).toBe(false);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, false);
        });

        it('Editing: Verify edit mode is closed when expand/collapse a group', () => {
            const contactNameCol = grid.getColumnByName('ContactName');
            const cell = grid.getCellByColumn(0, 'ContactName');
            contactNameCol.editable = true;
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('enter', cell.nativeElement, true);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            addressInf.expanded = false;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, false);
            expect(cell.editMode).toBe(false);
        });

        it('Row Editing: Verify edit mode is closed when expand/collapse a group', () => {
            grid.primaryKey = 'ID';
            fixture.detectChanges();

            grid.rowEditable = true;
            fixture.detectChanges();
            addressInf.expanded = false;
            fixture.detectChanges();

            const cell = grid.getCellByColumn(0, 'Country');
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('enter', cell.nativeElement, true);
            fixture.detectChanges();

            expect(cell.editMode).toBe(true);
            expect(grid.crudService.row).not.toBeNull();
            addressInf.expanded = true;
            fixture.detectChanges();

            expect(grid.crudService.row).toBeNull();
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, true);
        });

        it('Moving: Verify that expanded state is preserved when move column group', () => {
            const generalInf = GridFunctions.getColGroup(grid, 'General Information');

            expect(addressInf.expanded).toBeTruthy();
            expect(generalInf.collapsible).toBeFalsy();
            expect(generalInf.visibleIndex).toBe(1);

            grid.moveColumn(generalInf, addressInf);
            fixture.detectChanges();

            expect(addressInf.expanded).toBeTruthy();
            expect(generalInf.collapsible).toBeFalsy();
            expect(generalInf.visibleIndex).toBe(3);
            addressInf.expanded = false;
            fixture.detectChanges();

            expect(addressInf.expanded).toBeFalsy();
            grid.moveColumn(generalInf, addressInf);
            fixture.detectChanges();

            expect(addressInf.expanded).toBeFalsy();
            expect(generalInf.collapsible).toBeFalsy();
            expect(generalInf.visibleIndex).toBe(1);
        });

        it('Moving: Verify moving column inside the group', () => {
            const postalCode = grid.getColumnByName('PostalCode');
            addressInf.expanded = false;
            country.visibleWhenCollapsed = false;
            regionInf.visibleWhenCollapsed = false;
            postalCode.visibleWhenCollapsed = false;
            fixture.detectChanges();

            expect(regionInf.expanded).toBe(true);
            expect(countryInf.expanded).toBe(true);
            expect(country.visibleIndex).toBe(4);

            grid.moveColumn(country, regionInf);
            fixture.detectChanges();

            expect(regionInf.expanded).toBe(true);
            GridFunctions.verifyGroupIsExpanded(fixture, regionInf.header, true, true);
            expect(countryInf.expanded).toBe(true);
            GridFunctions.verifyGroupIsExpanded(fixture, countryInf.header, true, true);
            expect(country.visibleIndex).toBe(6);
        });

        it('Search: search when a group is expanded', async() => {
            const highlightClass = '.igx-highlight';
            grid.findNext('Mexico');
            await wait(30);
            fixture.detectChanges();

            let spans = fixture.nativeElement.querySelectorAll(highlightClass);
            expect(spans.length).toBe(0);

            addressInf.expanded = false;
            fixture.detectChanges();

            spans = fixture.nativeElement.querySelectorAll(highlightClass);
            expect(spans.length).toBe(2);
        });

        it('Group By: test when group by a column', () => {
            addressInf.expanded = false;
            country.visibleWhenCollapsed = false;
            regionInf.visibleWhenCollapsed = false;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf.header, true, true);
            grid.groupBy({ fieldName: 'Country', dir: SortingDirection.Asc, ignoreCase: false });
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf.header, true, true);
            GridFunctions.verifyColumnIsHidden(country, false, 13);
            grid.hideGroupedColumns = true;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, countryInf.header, true, true);
            GridFunctions.verifyColumnIsHidden(country, true, 12);
        });
    });
});
