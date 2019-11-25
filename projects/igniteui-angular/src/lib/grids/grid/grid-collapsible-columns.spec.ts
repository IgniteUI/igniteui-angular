import { async, TestBed, fakeAsync } from '@angular/core/testing';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { CollapsibleColumnGroupTestComponent } from '../../test-utils/grid-samples.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';


describe('IgxGrid - multi-column headers #grid', () => {
    configureTestSuite();

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
        let contactInf;
        let countryInf;
        let addressInf;
        let regionCol;
        let phoneCol;
        let country;

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

    fdescribe('Base Tests', () => {
        let fixture;
        let grid: IgxGridComponent;
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(CollapsibleColumnGroupTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('Hiding: Verify that expanded state is preserved when hide column group', () => {
            const addressInf = GridFunctions.getColGroup(grid, 'Address Information');
            addressInf.expanded = false;
            fixture.detectChanges();

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, false);
            addressInf.hidden = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, true, 6);
            addressInf.hidden = false;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, false, 13);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, false);

            addressInf.expanded = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, false, 11);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, true);
            addressInf.hidden = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, true, 6);
            addressInf.hidden = false;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(addressInf, false, 11);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, true, true);
        });

        it('Hiding: Verify that column can be hidden when the group is expanded', () => {
            const addressInf = GridFunctions.getColGroup(grid, 'Address Information');
            fixture.detectChanges();

            expect(addressInf.expanded).toBe(true);
            const phoneColumn = grid.getColumnByName('Phone');
            GridFunctions.verifyColumnIsHidden(phoneColumn, false, 11);
            phoneColumn.hidden = true;
            fixture.detectChanges();

            expect(addressInf.expanded).toBe(true);
            GridFunctions.verifyColumnIsHidden(phoneColumn, true, 10);
            phoneColumn.hidden = false;
            fixture.detectChanges();

            expect(addressInf.expanded).toBe(true);
            GridFunctions.verifyColumnIsHidden(phoneColumn, false, 11);
        });

        it('Pinning: Verify that expanded state is preserved when pin column group', () => {
            const addressInf = GridFunctions.getColGroup(grid, 'Address Information');
            fixture.detectChanges();

            expect(addressInf.pinned).toBe(false);
            expect(addressInf.expanded).toBe(true);
            addressInf.pinned = true;
            fixture.detectChanges();

            expect(addressInf.pinned).toBe(true);
            expect(addressInf.expanded).toBe(true);
            addressInf.expanded = false;
            fixture.detectChanges();

            expect(addressInf.pinned).toBe(true);
            expect(addressInf.expanded).toBe(false);
            addressInf.pinned = false;
            fixture.detectChanges();

            expect(addressInf.pinned).toBe(false);
            expect(addressInf.expanded).toBe(false);
        });

        it('Editing: Verify edit mode is closed when expand/collapse a group', () => {
            const addressInf = GridFunctions.getColGroup(grid, 'Address Information');
            const contactNameCol = grid.getColumnByName('ContactName');
            const cell = grid.getCellByColumn(0, 'ContactName');
            contactNameCol.editable = true;
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('enter', cell.nativeElement, true);
            fixture.detectChanges();
            expect(cell.editMode).toBe(true);

            addressInf.expanded = false;
            fixture.detectChanges();

            expect(cell.editMode).toBe(false);
        });

        it('Row Editing: Verify edit mode is closed when expand/collapse a group', () => {
            grid.primaryKey = 'ID';
            fixture.detectChanges();
            const addressInf = GridFunctions.getColGroup(grid, 'Address Information');
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
        });


    });

});
