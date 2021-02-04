import { Injectable } from '@angular/core';
import { IgxColumnComponent } from '../columns/column.component';

/**
 * This enumeration is used to configure whether the drop position is set before or after
 * the target.
 */
export enum DropPosition {
    BeforeDropTarget,
    AfterDropTarget
}


/**
 * @hidden
 * @internal
 */
@Injectable({
    providedIn: 'root',
})
export class IgxColumnMovingService {
    public cancelDrop: boolean;
    public isColumnMoving: boolean;

    private _icon: any;
    private _column: IgxColumnComponent;

    get column(): IgxColumnComponent {
        return this._column;
    }
    set column(val: IgxColumnComponent) {
        if (val) {
            this._column = val;
        }
    }

    get icon(): any {
        return this._icon;
    }
    set icon(val: any) {
        if (val) {
            this._icon = val;
        }
    }
}
