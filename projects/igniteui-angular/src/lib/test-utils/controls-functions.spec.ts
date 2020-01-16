import { By } from '@angular/platform-browser';

const CHIP_REMOVE_BUTTON = '.igx-chip__remove';
export class ControlsFunction {

    public static getChipRemoveButton(chip) {
       return chip.querySelector(CHIP_REMOVE_BUTTON);
    }

    public static clickChipRemoveButton(chip) {
        const removeButton = ControlsFunction.getChipRemoveButton(chip);
        removeButton.click();
     }
}
