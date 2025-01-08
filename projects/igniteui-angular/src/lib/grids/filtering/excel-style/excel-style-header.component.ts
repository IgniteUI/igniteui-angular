import { Component, Input, booleanAttribute } from '@angular/core';
import { BaseFilteringComponent } from './base-filtering.component';
import { IgxIconComponent } from '../../../icon/icon.component';
import { NgIf, NgClass } from '@angular/common';
import { IgxIconButtonDirective } from '../../../directives/button/icon-button.directive';

/**
 * A component used for presenting Excel style header UI.
 */
@Component({
    selector: 'igx-excel-style-header',
    templateUrl: './excel-style-header.component.html',
    imports: [NgIf, NgClass, IgxIconComponent, IgxIconButtonDirective]
})
export class IgxExcelStyleHeaderComponent {
    /**
     * Sets whether the column pinning icon should be shown in the header.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-excel-style-header [showPinning]="true"></igx-excel-style-header>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public showPinning: boolean;

    /**
     * Sets whether the column selecting icon should be shown in the header.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-excel-style-header [showSelecting]="true"></igx-excel-style-header>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public showSelecting: boolean;

    /**
     * Sets whether the column hiding icon should be shown in the header.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-excel-style-header [showHiding]="true"></igx-excel-style-header>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public showHiding: boolean;

    constructor(public esf: BaseFilteringComponent) { }
}
