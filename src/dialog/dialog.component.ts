import { transition, trigger, useAnimation } from "@angular/animations";
import { CommonModule } from "@angular/common";
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";

import { EaseOut } from "../animations/easings";
import { fadeIn, fadeOut, slideInBottom } from "../animations/main";
import { IgxButtonModule } from "../directives/button/button.directive";
import { IToggleView } from "../core/navigation";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxNavigationService } from "../core/navigation/nav-service";

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
    encapsulation: ViewEncapsulation.None,
    selector: "igx-dialog",
    styleUrls: ["./dialog.component.scss"],
    templateUrl: "dialog-content.component.html"
})
export class IgxDialog implements IToggleView, OnInit, OnDestroy {
    private static NEXT_ID = 1;
    private static readonly DIALOG_CLASS = "igx-dialog";

    @Input()
    public id: string;
    @Input() public title = "";
    @Input() public message = "";

    @Input()
    public title: string = "";
    @Input()
    public message: string = "";

    @Input() public rightButtonLabel = "";
    @Input() public rightButtonType = "flat";
    @Input() public rightButtonColor = "";
    @Input() public rightButtonBackgroundColor = "";
    @Input() public rightButtonRipple = "";
    @Input()
    public leftButtonLabel: string = "";
    @Input()
    public leftButtonType: string = "flat";
    @Input()
    public leftButtonColor: string = "";
    @Input()
    public leftButtonBackgroundColor: string = "";
    @Input()
    public leftButtonRipple: string = "";

    @Input() public closeOnOutsideSelect: boolean = false;
    public rightButtonLabel: string = "";
    @Input()
    public rightButtonType: string = "flat";
    @Input()
    public rightButtonColor: string = "";
    @Input()
    public rightButtonBackgroundColor: string = "";
    @Input()
    public rightButtonRipple: string = "";

    @Input()
    public closeOnOutsideSelect: boolean = false;

    @Output()
    public onOpen = new EventEmitter();
    @Output()
    public onClose = new EventEmitter();

    @Output()
    public onLeftButtonSelect = new EventEmitter();
    @Output()
    public onRightButtonSelect = new EventEmitter();

    @ViewChild("dialog") public dialogEl: ElementRef;

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

    constructor(private elementRef: ElementRef, private navigationService: IgxNavigationService) {
        this._titleId = IgxDialogComponent.NEXT_ID++ + "_title";
    }

    public get element() {
        return this.elementRef.nativeElement;
    }

    public open() {
        if (this.isOpen) {
            return;
        }

        this.toggleState("open");
        this.onOpen.emit(this);
    }

    public close() {
        if (!this.isOpen) {
            return;
        }

        this.toggleState("close");
        this.onClose.emit(this);
    }

    public toggle() {
        this._isOpen ? this.close() : this.open();
    }

    public onDialogSelected(event) {
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
        if (this.navigationService && this.id) {
            this.navigationService.add(this.id, this);
        }
    }

    public ngOnDestroy() {
        if (this.navigationService && this.id) {
            this.navigationService.remove(this.id);
        }
    }

    private toggleState(state: string): void {
        this._state = state;
        this._isOpen = state === "open" ? true : false;
    }
}

@NgModule({
    declarations: [IgxDialogComponent],
    exports: [IgxDialogComponent],
    imports: [CommonModule, IgxButtonModule, IgxRippleModule]
})
export class IgxDialogModule { }
