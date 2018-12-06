import { useAnimation } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    ViewChild,
    AfterContentInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxNavigationService, IToggleView } from '../core/navigation';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxDialogActionsDirective, IgxDialogTitleDirective } from './dialog.directives';
import { IgxToggleModule, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { OverlaySettings, GlobalPositionStrategy, NoOpScrollStrategy, PositionSettings } from '../services';
import { slideInBottom, slideOutTop } from '../animations/slide/index';
import { IgxFocusModule } from '../directives/focus/focus.directive';

let DIALOG_ID = 0;
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
@Component({
    selector: 'igx-dialog',
    templateUrl: 'dialog-content.component.html'
})
export class IgxDialogComponent implements IToggleView, OnInit, OnDestroy, AfterContentInit {
    private static NEXT_ID = 1;
    private static readonly DIALOG_CLASS = 'igx-dialog';

    @ViewChild(IgxToggleDirective)
    public toggleRef: IgxToggleDirective;

    /**
    * An @Input property that sets the value of the `id` attribute. If not provided it will be automatically generated.
    *```html
    *<igx-dialog [id]="'igx-dialog-56'" #alert title="Notification" leftButtonLabel="OK" (onLeftButtonSelect)="alert.close()"></igx-dialog>
    *```
    */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-dialog-${DIALOG_ID++}`;

    @Input()
    get isModal() {
        return this._isModal;
    }

    set isModal(val: boolean) {
        this._overlayDefaultSettings.modal = val;
        this._isModal = val;
    }

    /**
    * An @Input property controlling the `title` of the dialog.
    *```html
    *<igx-dialog title="Notification" #alert leftButtonLabel="OK" (onLeftButtonSelect)="alert.close()"></igx-dialog>
    *```
    */
    @Input()
    public title = '';

    /**
     *  An @Input property controlling the `message` of the dialog.
     *```html
     *<igx-dialog message="Your email was sent!" #alert leftButtonLabel="OK" (onLeftButtonSelect)="alert.close()"></igx-dialog>
     *```
     */
    @Input()
    public message = '';

    /**
     * An @Input property to set the `label` of the left button of the dialog.
     *```html
     *<igx-dialog leftButtonLabel="OKAY" #alert title="Notification"  (onLeftButtonSelect)="alert.close()"></igx-dialog>
     *```
     */
    @Input()
    public leftButtonLabel = '';

    /**
     * An @Input property to set the left button `type`. The types are `flat`, `raised` and `fab`.
     * The `flat` type button is a rectangle and doesn't have a shadow. <br>
     * The `raised` type button is also a rectangle but has a shadow. <br>
     * The `fab` type button is a circle with a shadow. <br>
     * The default value is `flat`.
     *```html
     *<igx-dialog leftButtonType="raised" leftButtonLabel="OKAY" #alert (onLeftButtonSelect)="alert.close()"></igx-dialog>
     *```
     */
    @Input()
    public leftButtonType = 'flat';
    /**
     * An @Input property to set the left button color. The property accepts all valid CSS color property values.
     *```html
     *<igx-dialog leftButtonColor="yellow" leftButtonLabel="OKAY" #alert (onLeftButtonSelect)="alert.close()"></igx-dialog>
     *```
     */
    @Input()
    public leftButtonColor = '';

    /**
     * An @Input property to set the left button `background-color`. The property accepts all valid CSS color property values.
     *```html
     *<igx-dialog leftButtonBackgroundColor="black" leftButtonLabel="OKAY" #alert (onLeftButtonSelect)="alert.close()"></igx-dialog>
     *```
     */
    @Input()
    public leftButtonBackgroundColor = '';

    /**
     * An @Input property to set the left button `ripple`. The `ripple` animates a click/tap to a component as a series of fading waves.
     * The property accepts all valid CSS color property values.
     *```html
     *<igx-dialog leftButtonRipple="green" leftButtonLabel="OKAY" #alert (onLeftButtonSelect)="alert.close()"></igx-dialog>
     *```
     */
    @Input()
    public leftButtonRipple = '';

    /**
     * An @Input property to set the `label` of the right button of the dialog.
     *```html
     *<igx-dialog rightButtonLabel="OKAY" #alert title="Notification"  (onLeftButtonSelect)="alert.close()"></igx-dialog>
     *```
     */
    @Input()
    public rightButtonLabel = '';

    /**
     * An @Input property to set the right button `type`. The types are `flat`, `raised` and `fab`.
     * The `flat` type button is a rectangle and doesn't have a shadow. <br>
     * The `raised` type button is also a rectangle but has a shadow. <br>
     * The `fab` type button is a circle with a shadow. <br>
     * The default value is `flat`.
     *```html
     *<igx-dialog rightButtonType="fab" rightButtonLabel="OKAY" #alert (onLeftButtonSelect)="alert.close()"></igx-dialog>
     *```
     */
    @Input()
    public rightButtonType = 'flat';

    /**
     * An @Input property to set the right button `color`. The property accepts all valid CSS color property values.
     *```html
     *<igx-dialog rightButtonColor="yellow" rightButtonLabel="OKAY" #alert (onLeftButtonSelect)="alert.close()"></igx-dialog>
     *```
     */
    @Input()
    public rightButtonColor = '';

    /**
     * An @Input property to set the right button `background-color`. The property accepts all valid CSS color property values.
     *```html
     *<igx-dialog rightButtonBackgroundColor="black" rightButtonLabel="OKAY" #alert (onLeftButtonSelect)="alert.close()"></igx-dialog>
     *```
     */
    @Input()
    public rightButtonBackgroundColor = '';

    /**
     * An @Input property to set the right button `ripple`.
     *```html
     *<igx-dialog rightButtonRipple="green" rightButtonLabel="OKAY" #alert (onLeftButtonSelect)="alert.close()"></igx-dialog>
     *```
     */
    @Input()
    public rightButtonRipple = '';

    /**
     * An @Input property that allows you to enable the "close on click outside the dialog". By default it's disabled.
     *```html
     *<igx-dialog closeOnOutsideSelect="true" leftButtonLabel="Cancel" (onLeftButtonSelect)="dialog.close()"
     *rightButtonLabel="OK" rightButtonRipple="#4CAF50" (onRightButtonSelect)="onDialogOKSelected($event)">
     *</igx-dialog>
     *```
     */
    @Input()
    get closeOnOutsideSelect() {
        return this._closeOnOutsideSelect;
    }

    set closeOnOutsideSelect(val: boolean) {
        this._overlayDefaultSettings.closeOnOutsideClick = val;
        this._closeOnOutsideSelect = val;
    }

    /**
     * An event that is emitted when the dialog is opened.
     *```html
     *<igx-dialog (onOpen)="onDialogOpenHandler($event)" (onLeftButtonSelect)="dialog.close()" rightButtonLabel="OK">
     *</igx-dialog>
     *```
     */
    @Output()
    public onOpen = new EventEmitter<IDialogEventArgs>();

    /**
     * An event that is emitted when the dialog is closed.
     *```html
     *<igx-dialog (onClose)="onDialogCloseHandler($event)" title="Confirmation" leftButtonLabel="Cancel" rightButtonLabel="OK">
     *</igx-dialog>
     *```
     */
    @Output()
    public onClose = new EventEmitter<IDialogEventArgs>();

    /**
     * An event that is emitted when the left button is clicked.
     *```html
     *<igx-dialog (onLeftButtonSelect)="onDialogOKSelected($event)" #dialog leftButtonLabel="OK" rightButtonLabel="Cancel">
     *</igx-dialog>
     *```
     */
    @Output()
    public onLeftButtonSelect = new EventEmitter<IDialogEventArgs>();

    /**
     * An event that is emitted when the right button is clicked.
     * ```html
     *<igx-dialog (onRightButtonSelect)="onDialogOKSelected($event)"
     *#dialog title="Confirmation" (onLeftButtonSelect)="dialog.close()" rightButtonLabel="OK"
     *rightButtonRipple="#4CAF50" closeOnOutsideSelect="true">
     *</igx-dialog>
     *```
     */
    @Output()
    public onRightButtonSelect = new EventEmitter<IDialogEventArgs>();

    private _animaitonSettings: PositionSettings = {
        openAnimation: useAnimation(slideInBottom, {params: {fromPosition: 'translateY(100%)'}}),
        closeAnimation: useAnimation(slideOutTop, {params: {toPosition: 'translateY(-100%)'}})
    };

    private _overlayDefaultSettings: OverlaySettings;
    private _closeOnOutsideSelect = false;
    private _isModal = true;
    protected destroy$ = new Subject<boolean>();

    /**
     * @hidden
     */
    public get element() {
        return this.elementRef.nativeElement;
    }

    /**
     * The default `tabindex` attribute for the component
     *
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = -1;

    private _titleId: string;

    /**
     * Returns the value of state. Possible state values are "open" or "close".
     *```typescript
     *@ViewChild("MyDialog")
     *public dialog: IgxDialogComponent;
     *ngAfterViewInit() {
     *    let dialogState = this.dialog.state;
     *}
     *```
     */
    get state(): string {
        return this.isOpen ? 'open' : 'close';
    }

    /**
     * Returns whether the dialog is visible to the end user.
     *```typescript
     *@ViewChild("MyDialog")
     *public dialog: IgxDialogComponent;
     *ngAfterViewInit() {
     *    let dialogOpen = this.dialog.isOpen;
     *}
     * ```
     */
    @Input()
    get isOpen() {
        return !this.toggleRef.collapsed;
    }

    @HostBinding('class.igx-dialog--hidden')
    get isCollapsed() {
        return this.toggleRef.collapsed;
    }

    /**
     *Returns the value of the role of the dialog. The valid values are `dialog`, `alertdialog`, `alert`.
     *```typescript
     *@ViewChild("MyDialog")
     *public dialog: IgxDialogComponent;
     *ngAfterViewInit() {
     *    let dialogRole = this.dialog.role;
     *}
     * ```
     */
    @Input()
    get role() {
        if (this.leftButtonLabel !== '' && this.rightButtonLabel !== '') {
            return 'dialog';
        } else if (
            this.leftButtonLabel !== '' ||
            this.rightButtonLabel !== ''
        ) {
            return 'alertdialog';
        } else {
            return 'alert';
        }
    }

    /**
     *Returns the value of the title id.
     *```typescript
     *@ViewChild("MyDialog")
     *public dialog: IgxDialogComponent;
     *ngAfterViewInit() {
     *    let dialogTitle = this.dialog.titleId;
     *}
     * ```
     */
    @Input()
    get titleId() {
        return this._titleId;
    }

    constructor(
        private elementRef: ElementRef,
        @Optional() private navService: IgxNavigationService
    ) {
        this._titleId = IgxDialogComponent.NEXT_ID++ + '_title';

        this._overlayDefaultSettings = {
            positionStrategy: new GlobalPositionStrategy(this._animaitonSettings),
            scrollStrategy: new NoOpScrollStrategy(),
            modal: this.isModal,
            closeOnOutsideClick: this.closeOnOutsideSelect
        };
    }

    ngAfterContentInit() {
        this.toggleRef.onClosing.pipe(takeUntil(this.destroy$)).subscribe(() => this.emitCloseFromDialog());
    }

    private emitCloseFromDialog() {
        this.onClose.emit({ dialog: this, event: null });
    }

    /**
     * A method that opens the dialog.
     * @memberOf {@link IgxDialogComponent}
     *```html
     *<button (click)="dialog.open() igxButton="raised" igxButtonColor="white" igxRipple="white">Trigger Dialog</button>
     *<igx-dialog #dialog></igx-dialog>
     *```
     */
    public open(overlaySettings: OverlaySettings = this._overlayDefaultSettings) {
        if (this.isOpen) {
            return;
        }

        this.toggleRef.open(overlaySettings);
        this.onOpen.emit({ dialog: this, event: null });
    }

    /**
     *A method that that closes the dialog.
     *@memberOf {@link IgxDialogComponent}
     *```html
     *<button (click)="dialog.close() igxButton="raised" igxButtonColor="white" igxRipple="white">Trigger Dialog</button>
     *<igx-dialog #dialog></igx-dialog>
     *```
     */
    public close() {
        if (!this.isOpen) {
            return;
        }
        // `onClose` will emit from `toggleRef.onClosing` subscription
        this.toggleRef.close();
    }


    /**
     * A method that opens/closes the dialog.
     *@memberOf {@link IgxDialogComponent}
     *```html
     *<button (click)="dialog.toggle() igxButton="raised" igxButtonColor="white" igxRipple="white">Trigger Dialog</button>
     *<igx-dialog #dialog></igx-dialog>
     *```
     */
    public toggle() {
        this.isOpen ? this.close() : this.open();
    }

    /**
     * @hidden
     */
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

    /**
     * @hidden
     */
    public onInternalLeftButtonSelect(event) {
        this.onLeftButtonSelect.emit({ dialog: this, event });
    }

    /**
     * @hidden
     */
    public onInternalRightButtonSelect(event) {
        this.onRightButtonSelect.emit({ dialog: this, event });
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        if (this.navService && this.id) {
            this.navService.add(this.id, this);
        }
    }
    /**
     * @hidden
     */
    public ngOnDestroy() {
        if (this.navService && this.id) {
            this.navService.remove(this.id);
        }

    }

}

export interface IDialogEventArgs {
    dialog: IgxDialogComponent;
    event: Event;
}

/**
 * The IgxDialogComponent provides {@link IgxDialogComponent} inside your application.
 */

@NgModule({
    declarations: [IgxDialogComponent, IgxDialogTitleDirective, IgxDialogActionsDirective],
    exports: [IgxDialogComponent, IgxDialogTitleDirective, IgxDialogActionsDirective],
    imports: [CommonModule, IgxToggleModule, IgxButtonModule, IgxRippleModule, IgxFocusModule]
})
export class IgxDialogModule { }
