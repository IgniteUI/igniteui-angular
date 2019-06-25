import { Injectable } from '@angular/core';
import { IgxGridForOfDirective } from './for_of.directive';

@Injectable({
    providedIn: 'root',
})
export class IgxForOfSyncService {

    private _master: Map<string, IgxGridForOfDirective<any>> = new Map<string, IgxGridForOfDirective<any>>();

    /**
     * @hidden
     */
    public isMaster(directive: IgxGridForOfDirective<any>): boolean {
        return this._master.get(directive.igxForScrollOrientation) === directive;
    }

    /**
     * @hidden
     */
    public setMaster(directive: IgxGridForOfDirective<any>, forced = false) {
        const orientation = directive.igxForScrollOrientation;
        if (orientation && (forced || !this._master.has(orientation))) {
            this._master.set(orientation, directive);
        }
    }

    /**
     * @hidden
     */
    public resetMaster() {
        this._master.clear();
    }

    /**
     * @hidden
     */
    public sizesCache(dir: string): number[] {
        return this._master.get(dir).sizesCache;
    }

    /**
     * @hidden
     */
    public chunkSize(dir: string): number {
        return this._master.get(dir).state.chunkSize;
    }

    /**
     * @hidden
     */
    public scrollPosition(dir: string): number {
        return this._master.get(dir).scrollPosition;
    }
}
