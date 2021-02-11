import { By } from '@angular/platform-browser';
import { UIInteractions } from './ui-interactions.spec';

export const PAGER_BUTTONS = '.igx-paginator__pager > button';
export const BUTTON_DISABLED_CLASS = 'igx-button--disabled';
export const PAGER_CLASS = '.igx-paginator__pager';

export class PaginatorFunctions {
    public static getPagingButtons(parent) {
        return parent.querySelectorAll(PAGER_BUTTONS);
    }

    public static clickPagingButton(parent, buttonIndex: number) {
        const pagingButtons = PaginatorFunctions.getPagingButtons(parent);
        pagingButtons[buttonIndex].dispatchEvent(new Event('click'));
    }

    public static navigateToFirstPage(parent) {
        PaginatorFunctions.clickPagingButton(parent, 0);
    }

    public static navigateToPrevPage(parent) {
        PaginatorFunctions.clickPagingButton(parent, 1);
    }

    public static navigateToNextPage(parent) {
        PaginatorFunctions.clickPagingButton(parent, 2);
    }

    public static navigateToLastPage(parent) {
        PaginatorFunctions.clickPagingButton(parent, 3);
    }

    public static clickOnPageSelectElement(fix) {
        const select = PaginatorFunctions.getPageSelectElement(fix);
        UIInteractions.simulateClickEvent(select);
    }

    public static getPageSelectElement(fix) {
        return fix.debugElement.query(By.css('igx-select')).nativeElement;
    }
}
