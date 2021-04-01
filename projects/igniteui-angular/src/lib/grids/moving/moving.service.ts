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
@Injectable({ providedIn: 'root' })
export class IgxColumnMovingService {
    public cancelDrop: boolean;
    public icon: HTMLElement;
    public column: IgxColumnComponent;
}
