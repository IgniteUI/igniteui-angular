import {
    AfterContentInit, 
    ContentChildren,
    Directive,
    EventEmitter,
    HostBinding, 
    HostListener, 
    Input, 
    NgModule, 
    OnDestroy, 
    Output, 
    QueryList
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { mkenum } from '../../core/utils';
import { IChangeRadioEventArgs, IgxRadioComponent } from '../../radio/radio.component';
import { IgxDirectionality } from '../../services/direction/directionality';
import { IgxRippleModule } from '../ripple/ripple.directive';

/**
 * Determines the Radio Group alignment
 */
export const RadioGroupAlignment = mkenum({
    horizontal: 'horizontal',
    vertical: 'vertical'
});
export type RadioGroupAlignment = typeof RadioGroupAlignment[keyof typeof RadioGroupAlignment];

let nextId = 0;

/**
 * Radio group directive renders set of radio buttons.
 *
 * @igxModule IgxRadioModule
 *
 * @igxTheme igx-radio-theme
 *
 * @igxKeywords radiogroup, radio, button, input
 *
 * @igxGroup Data Entry & Display
 *
 * @remarks
 * The Ignite UI Radio Group allows the user to select a single option from an available set of options that are listed side by side.
 *
 * @example:
 * ```html
 * <igx-radio-group name="radioGroup">
 *   <igx-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']" value="{{item}}">
 *      {{item}}
 *   </igx-radio>
 * </igx-radio-group>
 * ```
 */
@Directive({
    exportAs: 'igxRadioGroup',
    selector: 'igx-radio-group, [igxRadioGroup]',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxRadioGroupDirective, multi: true }]
})
export class IgxRadioGroupDirective implements AfterContentInit, ControlValueAccessor, OnDestroy {
    private static ngAcceptInputType_required: boolean | '';
    /**
     * Returns reference to the child radio buttons.
     *
     * @example
     * ```typescript
     * let radioButtons =  this.radioGroup.radioButtons;
     * ```
     */
    @ContentChildren(IgxRadioComponent, { descendants: true }) public radioButtons: QueryList<IgxRadioComponent>;

    /**
     * Sets/gets the `value` attribute.
     *
     * @example
     * ```html
     * <igx-radio-group [value] = "'radioButtonValue'"></igx-radio-group>
     * ```
     */
    @Input()
    public get value(): any {
        return this._value;
    }
    public set value(newValue: any) {
        if (this._value !== newValue) {
            this._value = newValue;
            this._selectRadioButton();
        }
    }

    /**
     * Sets/gets the `name` attribute of the radio group component. All child radio buttons inherits this name.
     *
     * @example
     * ```html
     * <igx-radio-group name = "Radio1"></igx-radio-group>
     *  ```
     */
    @Input()
    public get name(): string {
        return this._name;
    }
    public set name(newValue: string) {
        if (this._name !== newValue) {
            this._name = newValue;
            this._setRadioButtonNames();
        }
    }

    /**
     * Sets/gets whether the radio group is required.
     *
     * @remarks
     * If not set, `required` will have value `false`.
     *
     * @example
     * ```html
     * <igx-radio-group [required] = "true"></igx-radio-group>
     * ```
     */
    @Input()
    public get required(): boolean {
        return this._required;
    }
    public set required(value: boolean) {
        this._required = (value as any) === '' || value;
        this._setRadioButtonsRequired();
    }

    /**
     * Sets/gets the selected child radio button.
     *
     * @example
     * ```typescript
     * let selectedButton = this.radioGroup.selected;
     * this.radioGroup.selected = selectedButton;
     * ```
     */
    @Input()
    public get selected() {
        return this._selected;
    }
    public set selected(selected: IgxRadioComponent | null) {
        if (this._selected !== selected) {
            this._selected = selected;
            this.value = selected ? selected.value : null;
        }
    }

    /**
     * An event that is emitted after the radio group `value` is changed.
     *
     * @remarks
     * Provides references to the selected `IgxRadioComponent` and the `value` property as event arguments.
     *
     * @example
     * ```html
     * <igx-radio-group (change)="handler($event)"></igx-radio-group>
     * ```
     */
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public readonly change: EventEmitter<IChangeRadioEventArgs> = new EventEmitter<IChangeRadioEventArgs>();

    /**
     * The css class applied to the component.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-radio-group')
    public cssClass = 'igx-radio-group';

    /**
     * Sets vertical alignment to the radio group, if `alignment` is set to `vertical`.
     * By default the alignment is horizontal.
     *
     * @example
     * ```html
     * <igx-radio-group alignment="vertical"></igx-radio-group>
     * ```
     */
    @HostBinding('class.igx-radio-group--vertical')
    private vertical = false;

    @HostListener('click', ['$event'])
    protected handleClick(event: MouseEvent) {
        event.stopPropagation();
        this.selected.nativeElement.focus();
    }

    @HostListener('keydown', ['$event'])
    protected handleKeyDown(event: KeyboardEvent) {
        const { key } = event;

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            const buttons = this.radioButtons.filter(radio => !radio.disabled);
            const checked = buttons.find((radio) => radio.checked);
            let index = checked ? buttons.indexOf(checked!) : -1;
            const ltr = this._directionality.value === 'ltr';

            switch (key) {
                case 'ArrowUp':
                    index += -1;
                    break;
                case 'ArrowLeft':
                    index += ltr ? -1 : 1;
                    break;
                case 'ArrowRight':
                    index += ltr ? 1 : -1;
                    break;
                default:
                    index += 1;
            }

            if (index < 0) index = buttons.length - 1;
            if (index > buttons.length - 1) index = 0;

            buttons.forEach((radio) => {
                radio.deselect();
                radio.nativeElement.blur();
            });

            buttons[index].focused = true;
            buttons[index].nativeElement.focus();
            buttons[index].select();
            event.preventDefault();
        }
    }

    /**
     * Returns the alignment of the `igx-radio-group`.
     * ```typescript
     * @ViewChild("MyRadioGroup")
     * public radioGroup: IgxRadioGroupDirective;
     * ngAfterViewInit(){
     *    let radioAlignment = this.radioGroup.alignment;
     * }
     * ```
     */
    @Input()
    public get alignment(): RadioGroupAlignment {
        return this.vertical ? RadioGroupAlignment.vertical : RadioGroupAlignment.horizontal;
    }
    /**
     * Allows you to set the radio group alignment.
     * Available options are `RadioGroupAlignment.horizontal` (default) and `RadioGroupAlignment.vertical`.
     * ```typescript
     * public alignment = RadioGroupAlignment.vertical;
     * //..
     * ```
     * ```html
     * <igx-radio-group [alignment]="alignment"></igx-radio-group>
     * ```
     */
    public set alignment(value: RadioGroupAlignment) {
        this.vertical = value === RadioGroupAlignment.vertical;
    }

    /**
     * @hidden
     * @internal
     */
    private _onChangeCallback: (_: any) => void = noop;
    /**
     * @hidden
     * @internal
     */
    private _name = `igx-radio-group-${nextId++}`;
    /**
     * @hidden
     * @internal
     */
    private _value: any = null;
    /**
     * @hidden
     * @internal
     */
    private _selected: IgxRadioComponent | null = null;
    /**
     * @hidden
     * @internal
     */
    private _isInitialized = false;
    /**
     * @hidden
     * @internal
     */
    private _required = false;
    /**
     * @hidden
     * @internal
     */
    private destroy$ = new Subject<boolean>();
    /**
     * @hidden
     * @internal
     */
    private queryChange$ = new Subject();

    /**
     * @hidden
     * @internal
     */
    public ngAfterContentInit() {
        // The initial value can possibly be set by NgModel and it is possible that
        // the OnInit of the NgModel occurs after the OnInit of this class.
        this._isInitialized = true;

        this.radioButtons.changes.pipe(startWith(0), takeUntil(this.destroy$)).subscribe(() => {
            this.queryChange$.next();
            setTimeout(() => this._initRadioButtons());
        });
    }

    /**
     * Sets the "checked" property value on the radio input element.
     *
     * @remarks
     * Checks whether the provided value is consistent to the current radio button.
     * If it is, the checked attribute will have value `true` and selected property will contain the selected `IgxRadioComponent`.
     *
     * @example
     * ```typescript
     * this.radioGroup.writeValue('radioButtonValue');
     * ```
     */
    public writeValue(value: any) {
        this.value = value;
    }

    /**
     * Registers a function called when the control value changes.
     *
     * @hidden
     * @internal
     */
    public registerOnChange(fn: (_: any) => void) {
        this._onChangeCallback = fn;
    }

    /**
     * Registers a function called when the control is touched.
     *
     * @hidden
     * @internal
     */
    public registerOnTouched(fn: () => void) {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.registerOnTouched(fn);
            });
        }
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    constructor(private _directionality: IgxDirectionality) {}

    /**
     * @hidden
     * @internal
     */
    private _initRadioButtons() {
        if (this.radioButtons) {
            const props = { name: this._name, required: this._required };
            this.radioButtons.forEach((button) => {
                Object.assign(button, props);

                if (button.value === this._value) {
                    button.checked = true;
                    this._selected = button;
                }

                button.change.pipe(
                    takeUntil(button.destroy$),
                    takeUntil(this.destroy$),
                    takeUntil(this.queryChange$)
                ).subscribe((ev) => this._selectedRadioButtonChanged(ev));
            });
        }
    }

    /**
     * @hidden
     * @internal
     */
    private _selectedRadioButtonChanged(args: IChangeRadioEventArgs) {
        this.radioButtons.forEach((button) => {
            button.checked = button.id === args.radio.id;
        });

        this._selected = args.radio;
        this._value = args.value;

        if (this._isInitialized) {
            this.change.emit(args);
            this._onChangeCallback(this.value);
        }
    }

    /**
     * @hidden
     * @internal
     */
    private _setRadioButtonNames() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.name = this._name;
            });
        }
    }

    /**
     * @hidden
     * @internal
     */
    private _selectRadioButton() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                if (this._value === null) {
                    // no value - uncheck all radio buttons
                    if (button.checked) {
                        button.checked = false;
                    }
                } else {
                    if (this._value === button.value) {
                        // selected button
                        if (this._selected !== button) {
                            this._selected = button;
                        }

                        if (!button.checked) {
                            button.select();
                        }
                    } else {
                        // non-selected button
                        if (button.checked) {
                            button.checked = false;
                        }
                    }
                }
            });
        }
    }

    /**
     * @hidden
     * @internal
     */
    private _setRadioButtonsRequired() {
        if (this.radioButtons) {
            this.radioButtons.forEach((button) => {
                button.required = this._required;
            });
        }
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxRadioGroupDirective, IgxRadioComponent],
    exports: [IgxRadioGroupDirective, IgxRadioComponent],
    imports: [IgxRippleModule]
})
export class IgxRadioModule {}
