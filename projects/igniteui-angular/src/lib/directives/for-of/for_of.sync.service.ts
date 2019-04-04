import { Injectable } from '@angular/core';
import { IgxGridForOfDirective } from './for_of.directive';

@Injectable({
    providedIn: 'root',
})
export class IgxForOfSyncService {

    private _master: Map<string, IgxGridForOfDirective<any>>;

    constructor() {
        this.resetMaster();
    }

    /**
     * @hidden
     */
    public isMaster(directive: IgxGridForOfDirective<any>): boolean {
        return this._master[directive.igxForScrollOrientation] === directive;
    }

    /**
     * @hidden
     */
    public setMaster(directive: IgxGridForOfDirective<any>) {
        if (!this._master[directive.igxForScrollOrientation]) {
            this._master[directive.igxForScrollOrientation] = directive;
        }
    }

    /**
     * @hidden
     */
    public resetMaster() {
        this._master = new Map<string, IgxGridForOfDirective<any>>([
            ['horizontal', null],
            ['vertical', null]
        ]);
    }

    /**
     * @hidden
     */
    public sizesCache(dir: string): number[] {
        return this._master[dir].sizesCache;
    }

    /**
     * @hidden
     */
    public chunkSize(dir: string): number {
        return this._master[dir].state.chunkSize;
    }
}
