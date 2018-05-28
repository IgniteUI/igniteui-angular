import { EventEmitter } from "@angular/core";
export declare class IgxNavbarComponent {
    private static NEXT_ID;
    private isVisible;
    id: string;
    isActionButtonVisible: boolean;
    actionButtonIcon: string;
    title: string;
    onAction: EventEmitter<IgxNavbarComponent>;
    titleId: string;
    _triggerAction(): void;
}
export declare class IgxNavbarModule {
}
