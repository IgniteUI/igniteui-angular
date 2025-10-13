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

interface FieldCache {
    field: string;
    value: string;
    lowerValue: string;
}

/**
 * Representing row cache for each data record.
 * row - representing the data record
 * fields - a cache containing all fields of a single row
 * joinedLower - a concatenated string from all fields values used for fast pre-filter of the matched records
 */
interface RowCache {
    row: any;
    fields: FieldCache[];
    joinedLower: string;
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
    private rowCache: Array<RowCache> = [];


    public grid: GridType;

    /**
     * Prepares and caches formatted, searchable data for all visible and searchable columns.
     * Each row stores both original and lowercase versions of its formatted field values,
     * plus a joined lowercase string for fast pre-filtering during search.
     */
    public buildCache(data: any[], columns: ColumnType[]) {
        const searchableColumns = columns.filter((column: ColumnType) => column.searchable && !column.columnGroup).sort((c1, c2) => c1.visibleIndex - c2.visibleIndex);
        const columnsPathParts = searchableColumns.map(col => columnFieldPath(col.field));
        this.rowCache = new Array<RowCache>(data.length);
        for (let i = 0; i < data.length; i++) {
            const record = this.grid.isRecordMerged(data[i]) ? data[i].recordRef : data[i];
            const fields: Array<FieldCache> = [];
            for (let j = 0; j < searchableColumns.length; j++) {
                const column = searchableColumns[j];
                const isMergePlaceHolder = this.grid.isRecordMerged(data[i]) ? !!data[i]?.cellMergeMeta.get(column.field)?.root : false;
                if (isMergePlaceHolder) {
                    continue;
                }
                const value = this.resolveValue(column, record, columnsPathParts[j]);
                fields.push({
                    field: column.field,
                    value: String(value),
                    lowerValue: String(value).toLowerCase()
                });
            }
            this.rowCache[i] = {
                row: record,
                fields: fields,
                joinedLower: fields.map(field => field.lowerValue).join(' ')
            };
        }

    }

    /**
     * Searches the cached data for all occurrences of the given query across searchable columns.
     * Supports case-sensitive and exact-match modes, returning every substring occurrence
     * with its corresponding row, column, and occurrence index.
     */
    public search(query: string, caseSensitive: boolean, exactMatch: boolean): Array<IMatchInfoCache> {
        if (!query) return [];
        const matchInfoCache = new Array<IMatchInfoCache>();
        const searchText = caseSensitive ? query : query.toLowerCase();
        for (let i = 0; i < this.rowCache.length; i++) {
            const cacheRecord = this.rowCache[i];

            if (!caseSensitive && !cacheRecord.joinedLower.includes(searchText)) {
                // in case the search is case insensitive we can directly check the cache and pre-filter the records
                continue;
            }

            for (const fieldCache of cacheRecord.fields) {
                const value = caseSensitive ? fieldCache.value : fieldCache.lowerValue;
                if (exactMatch && value === searchText) {
                    matchInfoCache.push({
                        row: cacheRecord.row,
                        column: fieldCache.field,
                        index: 0,
                        metadata: new Map([['pinned', (this.grid as any).isRecordPinnedByIndex(i)]])
                    });
                } else if (!exactMatch) {
                    let occurrences = 0;
                    let searchIndex = value.indexOf(searchText);
                    while (searchIndex !== -1) {
                        matchInfoCache.push({
                            row: cacheRecord.row,
                            column: fieldCache.field,
                            index: occurrences++,
                            metadata: new Map([['pinned', (this.grid as any).isRecordPinnedByIndex(i)]])
                        });
                        searchIndex = value.indexOf(searchText, searchIndex + searchText.length);
                    }
                }
            }
        }
        return matchInfoCache;
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
