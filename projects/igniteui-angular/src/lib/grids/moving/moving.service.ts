import { Injectable } from '@angular/core';
import { ColumnType } from '../common/grid.interface';

/* mustCoerceToInt */
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
@Injectable({ providedIn: 'root' })
export class IgxColumnMovingService {
    public cancelDrop: boolean;
    public icon: HTMLElement;
    public column: ColumnType;
}
