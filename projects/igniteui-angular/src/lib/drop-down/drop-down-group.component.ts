import { Component, Input, HostBinding, booleanAttribute } from '@angular/core';

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
    standalone: true
})
export class IgxDropDownGroupComponent {
    /**
     * @hidden @internal
     */
    public get labelId(): string {
        return `igx-item-group-label-${this._id}`;
    }

    @HostBinding(`attr.aria-labelledby`)
    public get labelledBy(): string {
        return this.labelId;
    }

    /**
     * @hidden @internal
     */
    @HostBinding('attr.role')
    public role = 'group';

    /** @hidden @internal */
    @HostBinding('class.igx-drop-down__group')
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
    @HostBinding(`attr.aria-disabled`)
    @HostBinding('class.igx-drop-down__group--disabled')
    public disabled = false;

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
    public label: string;

    private _id = NEXT_ID++;
}
