import { OverlaySettings } from '../services/public_api';

/** @hidden @internal */
export abstract class IgxActionStripToken {
    public abstract context: any;
    public abstract menuOverlaySettings: OverlaySettings;
    public abstract get hideOnRowLeave(): boolean;

    public abstract show(context?: any): void;
    public abstract hide(): void;
}
