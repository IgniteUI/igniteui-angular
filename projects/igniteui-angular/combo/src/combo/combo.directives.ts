import { Directive } from '@angular/core';

/**
 * Allows a custom element to be added at the beginning of the combo list.
 */
@Directive({
    selector: '[igxComboHeader]',
    standalone: true
})
export class IgxComboHeaderDirective { }

/**
 * Allows a custom element to be added at the end of the combo list.
 */
@Directive({
    selector: '[igxComboFooter]',
    standalone: true
})
export class IgxComboFooterDirective { }

/**
 * Allows the combo's items to be modified with a custom template
 */
@Directive({
    selector: '[igxComboItem]',
    standalone: true
})
export class IgxComboItemDirective { }

/**
 * Defines the custom template that will be displayed when the combo's list is empty
 */
@Directive({
    selector: '[igxComboEmpty]',
    standalone: true
})
export class IgxComboEmptyDirective { }

/**
 * Defines the custom template that will be used when rendering header items for groups in the combo's list
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
 */
@Directive({
    selector: '[igxComboAddItem]',
    standalone: true
})
export class IgxComboAddItemDirective { }

/**
 * The custom template that will be used when rendering the combo's toggle button
 */
@Directive({
    selector: '[igxComboToggleIcon]',
    standalone: true
})
export class IgxComboToggleIconDirective { }

/**
 * Defines the custom template that will be used when rendering the combo's clear icon
 */
@Directive({
    selector: '[igxComboClearIcon]',
    standalone: true
})
export class IgxComboClearIconDirective { }
