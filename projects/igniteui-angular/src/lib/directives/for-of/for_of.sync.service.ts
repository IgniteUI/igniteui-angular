import { Injectable, Component } from '@angular/core';
import { IgxGridForOfDirective } from './for_of.directive';
import { VirtualHelperBase } from './base.helper.component';

@Injectable({
    providedIn: 'root',
})
export class IgxForOfSyncService {

    private _master: Map<string, IgxGridForOfDirective<any>> = new Map<string, IgxGridForOfDirective<any>>();
    private _masterScroll: Map<string, VirtualHelperBase> = new Map<string, any>();

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

    public setScrollMaster(dir: string, scroll: VirtualHelperBase) {
        this._masterScroll.set(dir, scroll);
    }

    public getScrollMaster(dir: string) {
        return this._masterScroll.get(dir);
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
}
