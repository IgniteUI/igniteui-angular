import { EmptyMockGrid } from './empty-mockgrid';
import { IGridAPIService } from './api.service';
import { IgxColumnComponent } from './column.component';
import { QueryList } from '@angular/core';
import { IgxRowComponent } from './row.component';

describe('API Service - unit tests', () => {
    let service: MockGridService;
    let grid: MockGrid;

    beforeEach(() => {
        service = new MockGridService();
        grid = new MockGrid();
        service.register(grid);
    });

    it('Should be able to get registered grid', () => {
        const registeredGrid = service.get(grid.id);
        expect(registeredGrid === grid);
    });

    it('Should be able to delete registered grid', () => {
        service.unsubscribe(grid);
        const notRegisteredGrid = service.get(grid.id);
        expect(notRegisteredGrid).not.toBeDefined();
    });

    it('Should be able to get a column by key', () => {
        const column = new IgxColumnComponent(service, null, null);
        column.field = 'test';
        grid.columns = [column];
        const foundColumn = service.get_column_by_name(grid.id, column.field);
        expect(foundColumn === column);
    });

    // TODO Add summary test

    it('Should be able to find a row by key with primary key', () => {
        const dataItem = {
            primaryKey: 'test',
        };
        const row = new IgxRowComponent<MockGrid>(service, null, null, null);
        row.rowData = dataItem;
        const list = new QueryList<IgxRowComponent<MockGrid>>();
        list.reset([row]);

        grid.dataRowList = list;
        grid.primaryKey = 'primaryKey';

        const foundRow = service.get_row_by_key(grid.id, dataItem.primaryKey);
        expect(foundRow === row);
    });

    it('Should be able to find a row by key with no primary key', () => {
        const dataItem = {
            primaryKey: 'test',
        };
        const row = new IgxRowComponent<MockGrid>(service, null, null, null);
        row.rowData = dataItem;
        const list = new QueryList<IgxRowComponent<MockGrid>>();
        list.reset([row]);

        grid.dataRowList = list;

        const foundRow = service.get_row_by_key(grid.id, dataItem);
        expect(foundRow === row);
    });

    it('Should be able to find a row by index', () => {
        const row = new IgxRowComponent<MockGrid>(service, null, null, null);
        row.index = 6;
        const list = new QueryList<IgxRowComponent<MockGrid>>();
        list.reset([row]);
        const foundRow = service.get_row_by_index(grid.id, row.index);
        expect(foundRow === row);
    });
});

class MockGrid extends EmptyMockGrid {}

class MockGridService extends IGridAPIService<MockGrid> {}


