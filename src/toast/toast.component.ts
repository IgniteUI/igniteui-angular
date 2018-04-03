import { animate, state, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Optional,
    Output
} from "@angular/core";
import { IgxNavigationService, IToggleView } from "../core/navigation";

/**
 * IgxToast provides information and warning messages. They could not be dismissed, are non-interactive and can appear
 * on top, middle and the bottom of the screen.
 * ```
 * <igx-toast (event output bindings) [input bindings]>
 * </igx-toast>
 * ```
 */
@Component({
    animations: [
        trigger("animate", [
            state("show", style({
                opacity: 1
            })),
            transition("* => show", animate(".20s ease")),
            transition("show => *", animate(".40s ease-out"))
        ])
    ],
    selector: "igx-toast",
    templateUrl: "toast.component.html"
})
export class IgxToastComponent implements IToggleView, OnInit, OnDestroy {
    public readonly CSS_CLASSES = {
        IGX_TOAST_BOTTOM: "igx-toast--bottom",
        IGX_TOAST_MIDDLE: "igx-toast--middle",
        IGX_TOAST_TOP: "igx-toast--top"
    };

    /**
     * Identifier of the component
     * @type {string}
     */
    @Input() public id: string;

    /**
     * Event is thrown prior toast is shown
     * @type {EventEmitter}
     */
    @Output()
    public onShowing = new EventEmitter<IgxToastComponent>();

    /**
     * Event is shown when toast is shown
     * @type {EventEmitter}
     */
    @Output()
    public onShown = new EventEmitter<IgxToastComponent>();

    /**
     * Event is thrown prior toast hidden
     * @type {EventEmitter}
     */
    @Output()
    public onHiding = new EventEmitter<IgxToastComponent>();

    /**
     * Event is thrown when toast hidden
     * @type {EventEmitter}
     */
    @Output()
    public onHidden = new EventEmitter<IgxToastComponent>();

    @Input()
    public role = "alert";
    /**
     * Sets if the IgxToast component will be hidden after shown
     * Default value is true
     * @type {number}
     */
    @Input()
    public autoHide = true;

    /**
     * The duration of time span in ms which the IgxToast component will be visible
     * after it is being shown.
     * Default value is 4000
     * @type {number}
     */
    @Input()
    public displayTime = 4000;

    /**
     * The IgxToast component visual state state
     * @type {boolean}
     */
    @Input()
    public isVisible = false;

    /**
     * The message that will be shown message by the IgxToast component
     * @type {string}
     */
    @Input()
    public message: string;

    /**
     * Specifies the position of the IgxToast component. Possible options are IgxToastPosition.Top,
     * IgxToastPosition.Middle, IgxToastPosition.Bottom
     * @type {IgxToastPosition}
     */
    @Input()
    public position: IgxToastPosition = IgxToastPosition.Bottom;

    /**
     * Return the nativeElement of the component
     */
    public get element() {
        return this.elementRef.nativeElement;
    }

    private timeoutId;

    constructor(
        private elementRef: ElementRef,
        @Optional() private navService: IgxNavigationService) { }

    /**
     * Shows the IgxToast component and hides it after some time span
     * if autoHide is enabled
     */
    public show(): void {
        clearInterval(this.timeoutId);
        this.onShowing.emit(this);
        this.isVisible = true;

        if (this.autoHide) {
            this.timeoutId = setTimeout(() => {
                this.hide();
            }, this.displayTime);
        }

        this.onShown.emit(this);
    }

    /**
     * Hides the IgxToast component
     */
    public hide(): void {
        this.onHiding.emit(this);
        this.isVisible = false;
        this.onHidden.emit(this);

        clearInterval(this.timeoutId);
    }

    /**
     * Wraps @show() method due @IToggleView interface implementation.
     */
    public open() {
        this.show();
    }

    /**
     * Wraps @hide() method due @IToggleView interface implementation.
     */
    public close() {
        this.hide();
    }

    /**
     * Invoke @close() or @open() method depending on the state of the component.
     */
    public toggle() {
        this.isVisible ? this.close() : this.open();
    }

    public mapPositionToClassName(): any {
        if (this.position === IgxToastPosition.Top) {
            return this.CSS_CLASSES.IGX_TOAST_TOP;
        }

        if (this.position === IgxToastPosition.Middle) {
            return this.CSS_CLASSES.IGX_TOAST_MIDDLE;
        }

        if (this.position === IgxToastPosition.Bottom) {
            return this.CSS_CLASSES.IGX_TOAST_BOTTOM;
        }
    }

    public ngOnInit() {
        if (this.navService && this.id) {
            this.navService.add(this.id, this);
        }
    }

    public ngOnDestroy() {
        if (this.navService && this.id) {
            this.navService.remove(this.id);
        }
    }
}

/**
 * Enumeration for toast position
 * Can be:
 * Bottom
 * Middle
 * Top
 */
export enum IgxToastPosition {
    Bottom,
    Middle,
    Top
}

@NgModule({
    declarations: [IgxToastComponent],
    exports: [IgxToastComponent],
    imports: [CommonModule]
})
export class IgxToastModule { }
