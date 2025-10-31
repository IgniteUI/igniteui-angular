import { OverlaySettings } from 'igniteui-angular/core';
import { QueryList } from '@angular/core';

/* csSuppress */
/** @hidden @internal */
export abstract class IgxActionStripToken {
    public abstract context: any;
    public abstract menuOverlaySettings: OverlaySettings;
    public abstract get hideOnRowLeave(): boolean;

    public abstract show(context?: any): void;
    public abstract hide(): void;
}

/* csSuppress */
/**
 * Abstract class defining the contract for components that provide actions to the action strip.
 * This allows the action strip to remain standalone and not be aware of specific implementations.
 * @hidden @internal
 */
export abstract class IgxActionStripActionsToken {
    public abstract asMenuItems: boolean;
    public abstract buttons: QueryList<any>;
    public abstract strip: any | null;
}
