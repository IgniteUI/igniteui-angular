import { fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxPivotGridModule } from 'igniteui-angular';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxPivotGridTestBaseComponent, IgxTotalSaleAggregate } from '../../test-utils/pivot-grid-samples.spec';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
const CSS_CLASS_DROP_DOWN_BASE = 'igx-drop-down';
const CSS_CLASS_LIST = 'igx-drop-down__list';
const CSS_CLASS_ITEM = 'igx-drop-down__item';

describe('Basic IgxPivotGrid #pivotGrid', () => {
    let fixture;
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxPivotGridTestBaseComponent
            ],
            imports: [
                NoopAnimationsModule, IgxPivotGridModule]
        });
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(IgxPivotGridTestBaseComponent);
        fixture.detectChanges();
    }));

    it('should apply formatter and dataType from measures', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const actualFormatterValue = pivotGrid.rowList.first.cells.first.title;
        expect(actualFormatterValue).toEqual('774$');
        const actualDataTypeValue = pivotGrid.rowList.first.cells.last.title;
        expect(actualDataTypeValue).toEqual('$71.89');
    });

    it('should apply css class to cells from measures', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const cells = pivotGrid.rowList.first.cells;
        expect(cells.first.nativeElement.classList).toContain('test');
        expect(cells.last.nativeElement.classList).not.toContain('test');
    });

    describe('IgxPivotGrid Features #pivotGrid', () => {
        it('should allow changing default aggregation via value chip drop-down.', () => {
            fixture.detectChanges();
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const valueChip = headerRow.querySelector('igx-chip[id="UnitsSold"]');
            let content = valueChip.querySelector('.igx-chip__content');
            expect(content.textContent.trim()).toBe('SUM(UnitsSold)');

            const aggregatesIcon = valueChip.querySelectorAll('igx-icon')[1];
            aggregatesIcon.click();
            fixture.detectChanges();
            const items = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_ITEM}`));
            expect(items.length).toBe(5);
            // select count
            items[0].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();

            // check chip and row
            content = valueChip.querySelector('.igx-chip__content');
            expect(content.textContent.trim()).toBe('COUNT(UnitsSold)');
            expect(pivotGrid.gridAPI.get_cell_by_index(0, 'Bulgaria-UnitsSold').value).toBe(2);
            expect(pivotGrid.gridAPI.get_cell_by_index(0, 'USA-UnitsSold').value).toBe(3);
            expect(pivotGrid.gridAPI.get_cell_by_index(0, 'Uruguay-UnitsSold').value).toBe(2);

        });
        it('should allow showing custom aggregations via pivot configuration.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.pivotConfiguration.values.push({
                member: 'AmountOfSale',
                displayName: 'Amount of Sale',
                aggregate: {
                    key: 'SUM',
                    aggregator: IgxTotalSaleAggregate.totalSale,
                    label: 'Sum of Sale'
                },
                aggregateList: [{
                    key: 'SUM',
                    aggregator: IgxTotalSaleAggregate.totalSale,
                    label: 'Sum of Sale'
                },{
                    key: 'MIN',
                    aggregator: IgxTotalSaleAggregate.totalMin,
                    label: 'Minimum of Sale'
                },{
                    key: 'MAX',
                    aggregator: IgxTotalSaleAggregate.totalMax,
                    label: 'Maximum of Sale'
                }],
                enabled: true
            });
            pivotGrid.pipeTrigger++;
            pivotGrid.setupColumns();
            fixture.detectChanges();
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const valueChip = headerRow.querySelector('igx-chip[id="AmountOfSale"]');
            let content = valueChip.querySelector('.igx-chip__content');
            expect(content.textContent.trim()).toBe('SUM(Amount of Sale)');

            const aggregatesIcon = valueChip.querySelectorAll('igx-icon')[1];
            aggregatesIcon.click();
            fixture.detectChanges();

            const items = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_ITEM}`));
            expect(items.length).toBe(3);
            // select min
            items[1].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
             // check chip and row values
             content = valueChip.querySelector('.igx-chip__content');
             expect(content.textContent.trim()).toBe('MIN(Amount of Sale)');
             expect(pivotGrid.gridAPI.get_cell_by_index(0, 'Bulgaria-AmountOfSale').value).toBe(3612.42);
             expect(pivotGrid.gridAPI.get_cell_by_index(0, 'USA-AmountOfSale').value).toBe(0);
             expect(pivotGrid.gridAPI.get_cell_by_index(0, 'Uruguay-AmountOfSale').value).toBe(242.08);
        });
    });
});
