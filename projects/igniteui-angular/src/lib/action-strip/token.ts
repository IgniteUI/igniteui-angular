import { QueryList } from '@angular/core';
import { OverlaySettings } from '../services/public_api';
import { IgxGridActionsBaseDirective } from './grid-actions/grid-actions-base.directive';

/* csSuppress */
/** @hidden @internal */
export abstract class IgxActionStripToken {
    public abstract context: any;
    public abstract menuOverlaySettings: OverlaySettings;
    public abstract actionButtons: QueryList<IgxGridActionsBaseDirective>;
    public abstract get hideOnRowLeave(): boolean;

    public abstract show(context?: any): void;
    public abstract hide(): void;
}
