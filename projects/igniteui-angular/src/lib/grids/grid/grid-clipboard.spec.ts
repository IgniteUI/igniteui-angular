import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './public_api';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxGridClipboardComponent } from '../../test-utils/grid-samples.spec';
import { CancelableEventArgs } from '../../core/utils';
import { take } from 'rxjs/operators';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxGridFilteringRowComponent } from '../filtering/base/grid-filtering-row.component';
import { IgxInputDirective } from '../../input-group/public_api';

describe('IgxGrid - Clipboard #grid', () => {

    let fix: ComponentFixture<IgxGridClipboardComponent>;
    let grid: IgxGridComponent;
    configureTestSuite((() => {
        return TestBed.configureTestingModule({
            imports: [IgxGridClipboardComponent, NoopAnimationsModule]
        });
    }));

    beforeEach(() => {
        fix = TestBed.createComponent(IgxGridClipboardComponent);
        fix.detectChanges();
        grid = fix.componentInstance.grid;
    });

    it('Copy data with default settings', () => {
        const copySpy = spyOn<any>(grid.gridCopy, 'emit').and.callThrough();
        const range = { rowStart: 0, rowEnd: 1, columnStart: 1, columnEnd: 3 };
        grid.selectRange(range);
        fix.detectChanges();

        const eventData = dispatchCopyEventOnGridBody(fix);
        expect(copySpy).toHaveBeenCalledTimes(1);
        expect(eventData).
             
            toEqual('ProductNameHeader\tDownloads\tReleased\r\n** Ignite UI for JavaScript **\t254\tfalse\r\n** NetAdvantage **\t127\ttrue\r\n');
    });

    it('Copy data when there are no selected cells', () => {
        const copySpy = spyOn<any>(grid.gridCopy, 'emit').and.callThrough();
        const eventData = dispatchCopyEventOnGridBody(fix);
        expect(copySpy).toHaveBeenCalledTimes(1);
        expect(copySpy).toHaveBeenCalledWith({
            data: [],
            cancel: false
        });
        expect(eventData).toEqual('');
    });

    it('Copy data with different separator', () => {
        const copySpy = spyOn<any>(grid.gridCopy, 'emit').and.callThrough();
        grid.clipboardOptions.separator = ';';
        grid.selectRange({ rowStart: 0, rowEnd: 0, columnStart: 0, columnEnd: 0 });
        grid.selectRange({ rowStart: 1, rowEnd: 1, columnStart: 1, columnEnd: 1 });
        fix.detectChanges();

        let eventData = dispatchCopyEventOnGridBody(fix);
        expect(copySpy).toHaveBeenCalledTimes(1);
        expect(eventData).toEqual('ID;ProductNameHeader\r\n1;\r\n;** NetAdvantage **');

        grid.clipboardOptions.separator = ',';
        fix.detectChanges();

        eventData = dispatchCopyEventOnGridBody(fix);
        expect(copySpy).toHaveBeenCalledTimes(2);
        expect(eventData).toEqual('ID,ProductNameHeader\r\n1,\r\n,** NetAdvantage **');
    });

    it('Copy data without headers', () => {
        const copySpy = spyOn<any>(grid.gridCopy, 'emit').and.callThrough();
        grid.clipboardOptions.copyHeaders = false;
        grid.selectRange({ rowStart: 1, rowEnd: 2, columnStart: 2, columnEnd: 3 });
        fix.detectChanges();

        let eventData = dispatchCopyEventOnGridBody(fix);
        expect(copySpy).toHaveBeenCalledTimes(1);
        expect(eventData).toEqual('127\ttrue\r\n20\t\r\n');

        grid.clipboardOptions.copyHeaders = true;
        fix.detectChanges();

        eventData = dispatchCopyEventOnGridBody(fix);
        expect(copySpy).toHaveBeenCalledTimes(2);
        expect(eventData).toEqual('Downloads\tReleased\r\n127\ttrue\r\n20\t\r\n');
    });

    it('Copy data when paging is enabled', () => {
        fix.componentInstance.paging = true;
        fix.detectChanges();
        grid.paginator.perPage = 5;
        fix.detectChanges();

        grid.paginator.page = 1;
        fix.detectChanges();
        const copySpy = spyOn<any>(grid.gridCopy, 'emit').and.callThrough();
        grid.clipboardOptions.copyHeaders = false;
        grid.selectRange({ rowStart: 1, rowEnd: 2, columnStart: 2, columnEnd: 3 });
        fix.detectChanges();

        const eventData = dispatchCopyEventOnGridBody(fix);
        expect(copySpy).toHaveBeenCalledTimes(1);
        expect(eventData).toEqual('0\ttrue\r\n1000\t\r\n');
    });

    it('Disable clipboardOptions', () => {
        const copySpy = spyOn<any>(grid.gridCopy, 'emit').and.callThrough();
        grid.clipboardOptions.enabled = false;
        grid.selectRange({ rowStart: 0, rowEnd: 2, columnStart: 0, columnEnd: 3 });
        fix.detectChanges();

        const eventData = dispatchCopyEventOnGridBody(fix);
        expect(copySpy).toHaveBeenCalledTimes(0);
        expect(eventData).toEqual('');
    });

    it('Disable copyFormatters', () => {
        const copySpy = spyOn<any>(grid.gridCopy, 'emit').and.callThrough();
        grid.clipboardOptions.copyFormatters = false;
        grid.selectRange({ rowStart: 1, rowEnd: 3, columnStart: 1, columnEnd: 1 });
        fix.detectChanges();

        let eventData = dispatchCopyEventOnGridBody(fix);
        expect(copySpy).toHaveBeenCalledTimes(1);
        expect(eventData).toEqual('ProductNameHeader\r\nNetAdvantage\r\nIgnite UI for Angular\r\n');
        grid.clipboardOptions.copyFormatters = true;
        fix.detectChanges();

        eventData = dispatchCopyEventOnGridBody(fix);
        expect(copySpy).toHaveBeenCalledTimes(2);
        expect(eventData).toEqual('ProductNameHeader\r\n** NetAdvantage **\r\n** Ignite UI for Angular **\r\n** null **');
    });

    it('Cancel gridCopy event ', () => {
        const copySpy = spyOn<any>(grid.gridCopy, 'emit').and.callThrough();
        grid.gridCopy.pipe(take(1)).subscribe((e: CancelableEventArgs) => e.cancel = true);
        grid.selectRange({ rowStart: 1, rowEnd: 3, columnStart: 0, columnEnd: 3 });
        fix.detectChanges();

        const eventData = dispatchCopyEventOnGridBody(fix);
        expect(copySpy).toHaveBeenCalledTimes(1);
        expect(copySpy).toHaveBeenCalledWith({
            data: grid.getSelectedData(true, true),
            cancel: true
        });
        expect(eventData).toEqual('undefined');
    });

    it('Copy when there is a cell in edit mode', fakeAsync(() => {
        const copySpy = spyOn<any>(grid.gridCopy, 'emit').and.callThrough();
        const cell = grid.getCellByColumn(0, 'ProductName');
        grid.gridAPI.get_cell_by_index(0, 'ProductName').nativeElement.dispatchEvent( new Event('dblclick'));
        tick(16);
        fix.detectChanges();
        expect(cell.editMode).toBe(true);

        grid.selectRange({ rowStart: 1, rowEnd: 3, columnStart: 0, columnEnd: 3 });
        tick(16);
        fix.detectChanges();

        expect(cell.editMode).toBe(true);

        const eventData = dispatchCopyEventOnGridBody(fix);
        expect(copySpy).toHaveBeenCalledTimes(0);
        expect(eventData).toEqual('');
    }));

    it('Should be able to copy from quick filtering input', fakeAsync(() => {
        fix.componentInstance.allowFiltering = true;
        fix.detectChanges();
        const productNameFilterCellChip = GridFunctions.getFilterChipsForColumn('ProductName', fix)[0];
        productNameFilterCellChip.nativeElement.click();
        tick(100);
        fix.detectChanges();

        const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
        const inputDebugElement = filteringRow.query(By.directive(IgxInputDirective));
        const input = inputDebugElement.nativeElement;
        const searchVal = 'aaa';

        const ev = new ClipboardEvent('copy', {bubbles: true, clipboardData: new DataTransfer()});
        ev.clipboardData.setData('text/plain', searchVal);
        input.dispatchEvent(ev);
        fix.detectChanges();
        const eventData = ev.clipboardData.getData('text/plain');
        expect(eventData).toEqual(searchVal);
    }));
});

const dispatchCopyEventOnGridBody = (fixture) => {
    const gridBody = fixture.debugElement.query(By.css('.igx-grid__tbody')).nativeElement;
    const ev = new ClipboardEvent('copy', {clipboardData: new DataTransfer()});
    gridBody.dispatchEvent(ev);
    fixture.detectChanges();
    return  ev.clipboardData.getData('text/plain');
};
