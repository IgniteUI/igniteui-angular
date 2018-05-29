import { Injectable } from "@angular/core";

@Injectable()
export class IgxVerticallScrollService {
    private _state: boolean;

    public get needsVerticalScroll(): boolean {
        return this._state;
    }
    public set needsVerticalScroll(val: boolean) {
        this._state = val;
    }
}
