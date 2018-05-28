import { AnimationEvent } from "@angular/animations";
import { EventEmitter, NgZone } from "@angular/core";
export declare class IgxSnackbarComponent {
    private zone;
    id: string;
    message: string;
    isVisible: boolean;
    autoHide: boolean;
    displayTime: number;
    actionText?: string;
    onAction: EventEmitter<IgxSnackbarComponent>;
    animationStarted: EventEmitter<AnimationEvent>;
    animationDone: EventEmitter<AnimationEvent>;
    private timeoutId;
    constructor(zone: NgZone);
    show(): void;
    hide(): void;
    triggerAction(): void;
    snackbarAnimationStarted(evt: AnimationEvent): void;
    snackbarAnimationDone(evt: AnimationEvent): void;
}
export declare class IgxSnackbarModule {
}
