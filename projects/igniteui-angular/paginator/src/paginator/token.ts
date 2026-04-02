import { EventEmitter } from '@angular/core';

/** @hidden @internal */
export abstract class IgxPaginatorToken {
    public abstract page: number;
    public abstract perPage: number;
    public abstract totalRecords: number;

    public abstract pageChange: EventEmitter<number>;

    public abstract paginate(val: number): void
}
