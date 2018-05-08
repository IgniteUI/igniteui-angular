import { transition, trigger, useAnimation } from "@angular/animations";
import { CommonModule } from "@angular/common";
import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    ViewChild
} from "@angular/core";

import { EaseOut } from "../animations/easings";
import { fadeIn, fadeOut, slideInBottom } from "../animations/main";
import { IgxNavigationService, IToggleView } from "../core/navigation";
import { IgxButtonModule } from "../directives/button/button.directive";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
/**
 * **Ignite UI for Angular Dialog Window** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/dialog.html)
 *
 * The Ignite UI Dialog Window presents a dialog window to the user which can simply display messages or display
 * more complicated visuals such as a user sign-in form.  It also provides a right and left button
 * which can be used for custom actions.
 *
 * Example:
 * ```html
 * <button (click)="form.open()">Show Dialog</button>
 * <igx-dialog #form title="Sign In" rightButtonLabel="OK">
 *   <div>
 *     <input type="text" igxInput/>
 *     <label igxLabel>Username</label>
 *   </div>
 *   <div>
 *     <input type="password" igxInput/>
 *     <label igxLabel>Password</label>
 *   </div>
 * </igx-dialog>
 * ```
 */
let DIALOG_ID = 0;
@Component({
    animations: [
        trigger("fadeInOut", [
            transition("void => open", useAnimation(fadeIn)),
            transition("open => void", useAnimation(fadeOut))
        ]),
        trigger("slideIn", [
            transition("void => open", useAnimation(slideInBottom))
        ])
    ],
    selector: "igx-dialog",
    templateUrl: "dialog-content.component.html"
})
export class IgxDialogComponent implements IToggleView, OnInit, OnDestroy {
    private static NEXT_ID = 1;
    private static readonly DIALOG_CLASS = "igx-dialog";

    @HostBinding("attr.id")
    @Input()
    public id = `igx-dialog-${DIALOG_ID++}`;

    @Input()
    public title = "";
    @Input()
    public message = "";

    @Input()
    public leftButtonLabel = "";
    @Input()
    public leftButtonType = "flat";
    @Input()
    public leftButtonColor = "";
    @Input()
    public leftButtonBackgroundColor = "";
    @Input()
    public leftButtonRipple = "";

    @Input()
    public rightButtonLabel = "";
    @Input()
    public rightButtonType = "flat";
    @Input()
    public rightButtonColor = "";
    @Input()
    public rightButtonBackgroundColor = "";
    @Input()
    public rightButtonRipple = "";

    @Input()
    public closeOnOutsideSelect = false;

    @Output()
    public onOpen = new EventEmitter<IDialogEventArgs>();
    @Output()
    public onClose = new EventEmitter<IDialogEventArgs>();

    @Output()
    public onLeftButtonSelect = new EventEmitter<IDialogEventArgs>();
    @Output()
    public onRightButtonSelect = new EventEmitter<IDialogEventArgs>();

    public get element() {
        return this.elementRef.nativeElement;
    }

    /**
     * The default `tabindex` attribute for the component
     *
     * @hidden
     */
    @HostBinding("attr.tabindex")
    public tabindex = -1;

    private _isOpen = false;
    private _titleId: string;
    private _state: string;

    get state(): string {
        return this._state;
    }

    @Input()
    get isOpen() {
        return this._isOpen;
    }

    @Input()
    get role() {
        if (this.leftButtonLabel !== "" && this.rightButtonLabel !== "") {
            return "dialog";
        } else if (
            this.leftButtonLabel !== "" ||
            this.rightButtonLabel !== ""
        ) {
            return "alertdialog";
        } else {
            return "alert";
        }
    }

    @Input()
    get titleId() {
        return this._titleId;
    }

    constructor(
        private elementRef: ElementRef,
        @Optional() private navService: IgxNavigationService
    ) {
        this._titleId = IgxDialogComponent.NEXT_ID++ + "_title";
    }

    public open() {
        if (this.isOpen) {
            return;
        }

        this.toggleState("open");
        this.onOpen.emit({ dialog: this, event: null });
    }

    public close() {
        if (!this.isOpen) {
            return;
        }

        this.toggleState("close");
        this.onClose.emit({ dialog: this, event: null });
    }

    public toggle() {
        this.isOpen ? this.close() : this.open();
    }

    public onDialogSelected(event) {
        event.stopPropagation();
        if (
            this.isOpen &&
            this.closeOnOutsideSelect &&
            event.target.classList.contains(IgxDialogComponent.DIALOG_CLASS)
        ) {
            this.close();
        }
    }

    public onInternalLeftButtonSelect(event) {
        this.onLeftButtonSelect.emit({ dialog: this, event });
    }

    public onInternalRightButtonSelect(event) {
        this.onRightButtonSelect.emit({ dialog: this, event });
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

    private toggleState(state: string): void {
        this._state = state;
        this._isOpen = state === "open" ? true : false;
    }
}

export interface IDialogEventArgs {
    dialog: IgxDialogComponent;
    event: Event;
}

@NgModule({
    declarations: [IgxDialogComponent],
    exports: [IgxDialogComponent],
    imports: [CommonModule, IgxButtonModule, IgxRippleModule]
})
export class IgxDialogModule { }
