import { async, TestBed,  fakeAsync } from '@angular/core/testing';
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
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(CollapsibleColumnGroupTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        }));

        it('verify setting collapsible to a column group ', () => {
            const contactInf = GridFunctions.getColGroup(grid, 'Contact Information');
            const country = GridFunctions.getColGroup(grid, 'Country Information');
            const addressInf = GridFunctions.getColGroup(grid, 'Address Information');

            GridFunctions.verifyColumnIsHidden(contactInf, false, 11);
            GridFunctions.verifyColumnIsHidden(country, true, 11);

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header);
            GridFunctions.verifyGroupIsExpanded(fixture, contactInf.header, false);

            spyOn(addressInf.collapsibleChange, 'emit').and.callThrough();
            addressInf.collapsible = false;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(contactInf, false, 17);
            GridFunctions.verifyColumnIsHidden(country, false, 17);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header, false);
            expect(addressInf.collapsibleChange.emit).toHaveBeenCalledTimes(1);
            expect(addressInf.collapsibleChange.emit).toHaveBeenCalledWith(false);

            addressInf.collapsible = true;
            fixture.detectChanges();

            GridFunctions.verifyColumnIsHidden(contactInf, false, 11);
            GridFunctions.verifyColumnIsHidden(country, true, 11);
            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header);
            expect(addressInf.collapsibleChange.emit).toHaveBeenCalledTimes(2);
            expect(addressInf.collapsibleChange.emit).toHaveBeenCalledWith(true);
        });

        it('verify setting collapsible when all the column has same visibleWhenCollapsed', () => {
            const contactInf = GridFunctions.getColGroup(grid, 'Contact Information');
            const countryInf = GridFunctions.getColGroup(grid, 'Country Information');
            const addressInf = GridFunctions.getColGroup(grid, 'Address Information');
            const regionCol = grid.getColumnByName('Region');
            const phoneCol = grid.getColumnByName('Phone');
            const country = grid.getColumnByName('Country');
            addressInf.collapsible = false;
            fixture.detectChanges();

            spyOn(contactInf.collapsibleChange, 'emit').and.callThrough();
            spyOn(countryInf.collapsibleChange, 'emit').and.callThrough();

            expect(contactInf.collapsible).toBeFalsy();
            expect(countryInf.collapsible).toBeFalsy();

            GridFunctions.verifyGroupIsExpanded(fixture, contactInf.header, false);
            GridFunctions.verifyGroupIsExpanded(fixture, countryInf.header, false);

            regionCol.visibleWhenCollapsed = false;
            phoneCol.visibleWhenCollapsed = true;

            fixture.detectChanges();

            expect(contactInf.collapsibleChange.emit).toHaveBeenCalledTimes(1);
            expect(contactInf.collapsibleChange.emit).toHaveBeenCalledWith(true);
            expect(countryInf.collapsibleChange.emit).toHaveBeenCalledTimes(1);
            expect(countryInf.collapsibleChange.emit).toHaveBeenCalledWith(true);

            expect(contactInf.collapsible).toBeTruthy();
            expect(countryInf.collapsible).toBeTruthy();

            GridFunctions.verifyGroupIsExpanded(fixture, contactInf.header);
            GridFunctions.verifyGroupIsExpanded(fixture, countryInf.header);

            GridFunctions.verifyColumnIsHidden(country, true, 12);
            GridFunctions.verifyColumnIsHidden(regionCol, false, 12);

            GridFunctions.verifyColumnIsHidden(grid.getColumnByName('Fax'), false, 12);
            GridFunctions.verifyColumnIsHidden(phoneCol, true, 12);
        });
    });

});

