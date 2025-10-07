import { Injectable } from '@angular/core';
import { ColumnType, GridType } from './common/grid.interface';
import { columnFieldPath, formatDate, resolveNestedPath } from '../core/utils';
import { formatNumber } from '@angular/common';
import { GridColumnDataType } from '../data-operations/data-util';

interface IMatchInfoCache {
    row: any;
    index: number;
    column: string;
    metadata: Map<string, boolean>;
}

/**
 * A service that provides searching functionality within the grid.
 * @internal
 */
@Injectable()
export class IgxGridSearchService {

    /**
     * A cache representing each row field values concatenated. Used for a quick lookup whether a data row has the searched value.
     */
    private cache: Array<string> = [];

    private columns: Array<ColumnType> = [];

    private data: Array<any> = [];

    public grid: GridType;

    /**
     * Builds a cache that concatenates strings all lowercase. Even though, this might be incorrect for cases that there are formatters this would boost
     * the first pass performance and the performance of building the cache.
     * @example
     * [{ProductName: "Peter", Age: 26, Country: "Portugal"}] -> peter 26 portugal
     */
    public buildCache(data: any[], columns: ColumnType[]) {
        this.columns = columns.filter((column: ColumnType) => column.searchable && !column.columnGroup).sort((c1,c2) => c1.visibleIndex - c2.visibleIndex);
        this.data = data.map(dataRow => this.grid.isRecordMerged(dataRow) ? dataRow.recordRef : dataRow);
        this.data.forEach(record => {
            const value = this.columns.map(column => record[column.field]).join(" ");
            this.cache.push(value.toLowerCase());
        });
    }

    public search(query: string, caseSensitive: boolean, exactMatch: boolean): Array<IMatchInfoCache> {
        if (!query) return [];
        const matchInfoCache = new Array<IMatchInfoCache>();
        const candidateIndexes = this.generateCandidates(query);
        const candidates = candidateIndexes.map((index: number) => this.data[index]);

        const searchText = caseSensitive ? query : query.toLowerCase();
        const columnsPathParts = this.columns.map(col => columnFieldPath(col.field));
        candidates.forEach((row: any, rowIndex: number) => {
            this.columns.forEach((column: ColumnType, columnIndex: number) => {
                const value = this.resolveValue(column, row, columnsPathParts[columnIndex]);
                const searchValue = caseSensitive ? String(value) : String(value).toLowerCase();
                if (searchValue != null) { // not strict equality - checking for undefined as well
                    const isMergePlaceHolder = this.grid.isRecordMerged(row) ? !!row?.cellMergeMeta.get(column.field)?.root : false;
                    if (isMergePlaceHolder) {
                        return;
                    }
                    if (exactMatch && searchText === searchValue) {
                        matchInfoCache.push({
                            row: row,
                            column: column.field,
                            index: 0,
                            metadata: new Map<string, boolean>([['pinned', (this.grid as any).isRecordPinnedByIndex(candidateIndexes[rowIndex])]])
                        });
                    } else if (!exactMatch){
                        let occurrences = 0;
                        let searchIndex = searchValue.indexOf(searchText);
                        while (searchIndex !== -1) {
                            matchInfoCache.push({
                                row: row,
                                column: column.field,
                                index: occurrences++,
                                metadata: new Map<string, boolean>([['pinned', (this.grid as any).isRecordPinnedByIndex(candidateIndexes[rowIndex])]])
                            });
                            searchIndex = searchValue.indexOf(searchText, searchIndex + searchText.length);
                        }
                    }
                }
            });
        });
        return matchInfoCache;
    }

    /**
     * Generates potential row candidates where a query match might occur.
     */
    private generateCandidates(query: string) {
        const queryLower = query.toLowerCase();
        const candidates = [];
        for (let i = 0; i < this.cache.length; i++) {
            if (this.cache[i].includes(queryLower)) {
                candidates.push(i);
            }
        }
        return candidates;
    }

    /**
     * Resolves the row field value based on formatter or column type.
     */
    private resolveValue(column: ColumnType, row: any, pathParts: Array<string>) {
        const pipeArgs = column.pipeArgs;
        const rawValue = resolveNestedPath(row, pathParts)
        let value = rawValue;
        if (column.formatter) {
            value = column.formatter(rawValue, row);
        } else if (column.dataType === GridColumnDataType.Number) {
            value = formatNumber(rawValue as number, this.grid.locale, pipeArgs.digitsInfo);
        } else if (column.dataType === GridColumnDataType.Date) {
            value = formatDate(rawValue as string, pipeArgs.format, this.grid.locale, pipeArgs.timezone);
        }
        return value;
    }

}
