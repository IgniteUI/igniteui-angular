import { Injectable } from '@angular/core';
import { IgxGridForOfDirective } from './for_of.directive';
import { VirtualHelperBaseDirective } from './base.helper.component';

@Injectable({
    providedIn: 'root',
})
export class IgxForOfSyncService {

    private _master: Map<string, IgxGridForOfDirective<any, any[]>> = new Map<string, IgxGridForOfDirective<any, any[]>>();

    /**
     * @hidden
     */
    public isMaster(directive: IgxGridForOfDirective<any, any[]>): boolean {
        return this._master.get(directive.igxForScrollOrientation) === directive;
    }

    /**
     * @hidden
     */
    public setMaster(directive: IgxGridForOfDirective<any, any[]>, forced = false) {
        const orientation = directive.igxForScrollOrientation;
        // in case master is not in dom, set a new master
        const isMasterInDom = this._master.get(orientation)?.dc?.instance?._viewContainer.element.nativeElement.isConnected;
        if (!isMasterInDom) {
            forced = true;
        }
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
}

@Injectable({
    providedIn: 'root',
})
export class IgxForOfScrollSyncService {
    private _masterScroll: Map<string, VirtualHelperBaseDirective> = new Map<string, any>();
    public setScrollMaster(dir: string, scroll: VirtualHelperBaseDirective) {
        this._masterScroll.set(dir, scroll);
    }

    public getScrollMaster(dir: string) {
        return this._masterScroll.get(dir);
    }
}
