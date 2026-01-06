import { Pipe, PipeTransform } from '@angular/core';
import { IFormattingViews } from "./calendar";

@Pipe({
    name: 'dayDigit',
    standalone: true
})
export class DayDigitPipe implements PipeTransform {
    public transform(value: string, formatViews: IFormattingViews): string {
        if (!value) {
            return '';
        }

        // strip non-numeric characters that might have been added by the locale formatter (e.g., "25日" -> "25").
        if (formatViews.day) {
            // Use regex to extract the numeric day value.
            // This handles locales that include non-numeric characters (e.g. '25日' in zh-CN).
            // match(/\d+/) is preferred over parseInt() as it robustly finds the digits regardless
            // of their position (prefix/suffix) in the localized string.
            const match = value.match(/\d+/);
            return match ? match[0] : value;
        }

        return value;
    }
}
