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

        it('First test', () => {
            const contactInf = GridFunctions.getColGroup(grid, 'Contact Information');
            const country = GridFunctions.getColGroup(grid, 'Country');
            const addressInf = GridFunctions.getColGroup(grid, 'Address Information');

            GridFunctions.verifyColumnIsHidden(contactInf, false, 11);
            GridFunctions.verifyColumnIsHidden(country, true, 11);

            GridFunctions.verifyGroupIsExpanded(fixture, addressInf.header);
            GridFunctions.verifyGroupIsExpanded(fixture, contactInf.header, false);

        });
    });

});

