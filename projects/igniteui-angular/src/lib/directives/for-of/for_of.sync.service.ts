import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class IgxForOfSyncService {

    protected _sizesCache: Map<string, number[]> = new Map<string, number[]>([['vertical', []], ['horizontal', []]]);
    protected _chunkSize: Map<string, Map<number, number>> = new Map<string, Map<number, number>>([
        ['horizontal', new Map<number, number>([[0, 0]])],
        ['vertical', new Map<number, number>([[0, 0]])]]
    );

    public get sizesCache(): Map<string, number[]> {
        return this._sizesCache;
    }
    public set sizesCache(value: Map<string, number[]>) {
        this._sizesCache = value;
    }

    public get chunkSize(): Map<string, Map<number, number>> {
        return this._chunkSize;
    }
    public set chunkSize(value: Map<string, Map<number, number>>) {
        this._chunkSize = value;
    }
}
