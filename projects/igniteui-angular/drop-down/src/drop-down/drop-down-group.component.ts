import { Component, Input, booleanAttribute, ChangeDetectionStrategy, signal } from '@angular/core';

let NEXT_ID = 0;
/**
 * The `<igx-drop-down-item>` is a container intended for row items in
 * a `<igx-drop-down>` container.
 */
@Component({
    selector: 'igx-drop-down-item-group',
    template: `
        <label id="{{labelId}}">{{ label }}</label>
        <ng-content select="igx-drop-down-item"></ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.aria-labelledby]': 'labelledBy',
        '[attr.role]': 'role',
        '[attr.aria-disabled]': 'disabled',
        '[class.igx-drop-down__group]': 'groupClass',
        '[class.igx-drop-down__group--disabled]': 'disabled'
    }
})
export class IgxDropDownGroupComponent {
    /**
     * @hidden @internal
     */
    public get labelId(): string {
        return `igx-item-group-label-${this._id}`;
    }

    public get labelledBy(): string {
        return this.labelId;
    }

    /**
     * @hidden @internal
     */
    public role = 'group';

    /** @hidden @internal */
    public groupClass = true;
    /**
     * Sets/gets if the item group is disabled
     *
     * ```typescript
     * const myDropDownGroup: IgxDropDownGroupComponent = this.dropdownGroup;
     * // get
     * ...
     * const groupState: boolean = myDropDownGroup.disabled;
     * ...
     * //set
     * ...
     * myDropDownGroup,disabled = false;
     * ...
     * ```
     *
     * ```html
     * <igx-drop-down-item-group [label]="'My Items'" [disabled]="true">
     *     <igx-drop-down-item *ngFor="let item of items[index]" [value]="item.value">
     *         {{ item.text }}
     *     </igx-drop-down-item>
     * </igx-drop-down-item-group>
     * ```
     *
     * **NOTE:** All items inside of a disabled drop down group will be treated as disabled
     */
    @Input({ transform: booleanAttribute })
    public get disabled(): boolean {
        return this._disabled();
    }
    public set disabled(value: boolean) {
        this._disabled.set(value);
    }

    /**
     * Sets/gets the label of the item group
     *
     * ```typescript
     * const myDropDownGroup: IgxDropDownGroupComponent = this.dropdownGroup;
     * // get
     * ...
     * const myLabel: string = myDropDownGroup.label;
     * ...
     * // set
     * ...
     * myDropDownGroup.label = 'My New Label';
     * ...
     * ```
     *
     * ```html
     * <igx-drop-down-item-group [label]="'My new Label'">
     *      ...
     * </igx-drop-down-item-group>
     * ```
     */
    @Input()
    public get label(): string {
        return this._label();
    }
    public set label(value: string) {
        this._label.set(value);
    }

    private readonly _disabled = signal(false);
    private readonly _label = signal<string>(undefined!);
    private _id = NEXT_ID++;
}
