import { Directive } from '@angular/core';

/**
 * Allows a custom element to be added at the beginning of the combo list.
 *
 * @igxModule IgxComboModule
 * @igxTheme igx-combo-theme
 * @igxKeywords combobox, combo selection
 * @igxGroup Grids & Lists
 *
 * @example
 * <igx-combo>
 *   <ng-template igxComboHeader>
 *      <div class="header-class">Custom header</div>
 *      <img src=""/>
 *   </ng-template>
 * </igx-combo>
 */
@Directive({
    selector: '[igxComboHeader]',
    standalone: true
})
export class IgxComboHeaderDirective { }

/**
 * Allows a custom element to be added at the end of the combo list.
 *
 * @igxModule IgxComboModule
 * @igxTheme igx-combo-theme
 * @igxKeywords combobox, combo selection
 * @igxGroup Grids & Lists
 *
 * @example
 * <igx-combo>
 *   <ng-template igxComboFooter>
 *      <div class="footer-class">Custom footer</div>
 *      <img src=""/>
 *   </ng-template>
 * </igx-combo>
 */
@Directive({
    selector: '[igxComboFooter]',
    standalone: true
})
export class IgxComboFooterDirective { }

/**
 * Allows the combo's items to be modified with a custom template
 *
 * @igxModule IgxComboModule
 * @igxTheme igx-combo-theme
 * @igxKeywords combobox, combo selection
 * @igxGroup Grids & Lists
 *
 * @example
 * <igx-combo>
 *	<ng-template igxComboItem let-display let-key="valueKey">
 *		<div class="item">
 *			<span class="state">State: {{ display[key] }}</span>
 *	 		<span class="region">Region: {{ display.region }}</span>
 *	 	</div>
 *	 </ng-template>
  * </igx-combo>
 */
@Directive({
    selector: '[igxComboItem]',
    standalone: true
})
export class IgxComboItemDirective { }

/**
 * Defines the custom template that will be displayed when the combo's list is empty
 *
 * @igxModule IgxComboModule
 * @igxTheme igx-combo-theme
 * @igxKeywords combobox, combo selection
 * @igxGroup Grids & Lists
 *
 * @example
 *  <igx-combo>
 *      <ng-template igxComboEmpty>
 *          <div class="combo--empty">
 *              There are no items to display
 *          </div>
 *      </ng-template>
 *  </igx-combo>
 */
@Directive({
    selector: '[igxComboEmpty]',
    standalone: true
})
export class IgxComboEmptyDirective { }

/**
 * Defines the custom template that will be used when rendering header items for groups in the combo's list
 *
 * @igxModule IgxComboModule
 * @igxTheme igx-combo-theme
 * @igxKeywords combobox, combo selection
 * @igxGroup Grids & Lists
 *
 * @example
 *  <igx-combo>
 *      <ng-template igxComboHeaderItem let-item let-key="groupKey">
 *          <div class="custom-item--group">Group header for {{ item[key] }}</div>
 *      </ng-template>
 *  </igx-combo>
 */
@Directive({
    selector: '[igxComboHeaderItem]',
    standalone: true
})
export class IgxComboHeaderItemDirective { }

/**
 * Defines the custom template that will be used to display the `ADD` button
 *
 * @remarks To show the `ADD` button, the `allowCustomValues` option must be enabled
 *
 * @igxModule IgxComboModule
 * @igxTheme igx-combo-theme
 * @igxKeywords combobox, combo selection
 * @igxGroup Grids & Lists
 *
 * @example
 * <igx-combo #combo>
 *      <ng-template igxComboAddItem>
 *          <button type="button" class="combo__add-button">
 *              Click to add item
 *          </button>
 *      </ng-template>
 *  </igx-combo>
 */
@Directive({
    selector: '[igxComboAddItem]',
    standalone: true
})
export class IgxComboAddItemDirective { }

/**
 * The custom template that will be used when rendering the combo's toggle button
 *
 * @igxModule IgxComboModule
 * @igxTheme igx-combo-theme
 * @igxKeywords combobox, combo selection
 * @igxGroup Grids & Lists
 *
 * @example
 *  <igx-combo #combo>
 *      <ng-template igxComboToggleIcon let-collapsed>
 *          <igx-icon>{{ collapsed ? 'remove_circle' : 'remove_circle_outline'}}</igx-icon>
 *      </ng-template>
 *  </igx-combo>
 */
@Directive({
    selector: '[igxComboToggleIcon]',
    standalone: true
})
export class IgxComboToggleIconDirective { }

/**
 * Defines the custom template that will be used when rendering the combo's clear icon
 *
 * @igxModule IgxComboModule
 * @igxTheme igx-combo-theme
 * @igxKeywords combobox, combo selection
 * @igxGroup Grids & Lists
 *
 * @example
 *  <igx-combo #combo>
 *      <ng-template igxComboClearIcon>
 *          <igx-icon>clear</igx-icon>
 *      </ng-template>
 *  </igx-combo>
 */
@Directive({
    selector: '[igxComboClearIcon]',
    standalone: true
})
export class IgxComboClearIconDirective { }
