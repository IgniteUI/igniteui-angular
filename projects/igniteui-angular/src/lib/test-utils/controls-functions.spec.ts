import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

const CHIP_REMOVE_BUTTON = '.igx-chip__remove';
const DROP_DOWN_SELECTED_ITEM_CLASS = '.igx-drop-down__item--selected';
const BUTTON_DISABLED_CLASS = 'igx-button--disabled';

export class ControlsFunction {

    public static getChipRemoveButton(chip: HTMLElement): HTMLElement {
       return chip.querySelector(CHIP_REMOVE_BUTTON);
    }

    public static clickChipRemoveButton(chip: HTMLElement) {
        const removeButton = ControlsFunction.getChipRemoveButton(chip);
        removeButton.click();
     }

     public static getDropDownSelectedItem(element: DebugElement): DebugElement {
        return element.query(By.css(DROP_DOWN_SELECTED_ITEM_CLASS));
     }

     public static isButtonEnabled(button: HTMLElement) {
         return !button.classList.contains(BUTTON_DISABLED_CLASS);
     }
}
