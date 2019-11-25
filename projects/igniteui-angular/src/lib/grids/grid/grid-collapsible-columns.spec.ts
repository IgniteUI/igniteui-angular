import { async, TestBed, fakeAsync } from '@angular/core/testing';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { CollapsibleColumnGroupTestComponent } from '../../test-utils/grid-samples.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';


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

});

