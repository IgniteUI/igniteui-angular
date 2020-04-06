import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { UIInteractions } from './ui-interactions.spec';
import { IgxChipComponent } from '../chips/chip.component';

const CHIP_REMOVE_BUTTON = '.igx-chip__remove';
const DROP_DOWN_SELECTED_ITEM_CLASS = '.igx-drop-down__item--selected';
const DROP_DOWN_SCROLL_CLASS = '.igx-drop-down__list-scroll';
const DROP_DOWN__ITEM_CLASS = '.igx-drop-down__item';
const BUTTON_SELECTED_CLASS = 'igx-button-group__item--selected';
const CHECKBOX_CHECKED_CLASS = 'igx-checkbox--checked';
const CHECKBOX_IND_CLASS = 'igx-checkbox--indeterminate';

export const BUTTON_DISABLED_CLASS = 'igx-button--disabled';
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

     public static clickDropDownItem(fix: ComponentFixture<any>, index: number) {
      const list: HTMLElement = fix.nativeElement.querySelector(DROP_DOWN_SCROLL_CLASS);
      const items = list.querySelectorAll(DROP_DOWN__ITEM_CLASS);
      const item = items.item(index);
      UIInteractions.simulateClickEvent(item);
      fix.detectChanges();
   }

     public static verifyButtonIsSelected(element: HTMLElement, selected: boolean = true) {
      expect(element.classList.contains(BUTTON_SELECTED_CLASS)).toEqual(selected);
   }

   public static verifyButtonIsDisabled(element: HTMLElement, disabled: boolean = true) {
      expect(element.classList.contains(BUTTON_DISABLED_CLASS)).toEqual(disabled);
   }

   public static verifyCheckboxState(element: HTMLElement, checked: boolean = true, indeterminate = false) {
      expect(element.classList.contains(CHECKBOX_CHECKED_CLASS)).toEqual(checked);
      expect(element.classList.contains(CHECKBOX_IND_CLASS)).toEqual(indeterminate);
   }
}
