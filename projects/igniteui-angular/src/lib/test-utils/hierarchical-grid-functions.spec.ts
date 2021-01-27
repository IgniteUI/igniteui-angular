import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxHierarchicalRowComponent } from '../grids/hierarchical-grid/hierarchical-row.component';
import { IgxRowDirective } from '../grids/row.directive';

const HIERARCHICAL_GRID_TAG = 'igx-hierarchical-grid';
const EXPANDER_CLASS = 'igx-grid__hierarchical-expander';
const SCROLL_TBODY_CLASS = 'igx-grid__tbody-scrollbar';

export class HierarchicalGridFunctions {

    /**
     * Gets all hierarchical grid row components as an array of DebugElement
     *
     * @param fix the ComponentFixture to search
     */
    public static getHierarchicalRows(fix: ComponentFixture<any>): DebugElement[] {
        return fix.debugElement.queryAll(By.directive(IgxHierarchicalRowComponent));
    }

    /**
     * Gets all hierarchical grid expanders as an array of DebugElement
     *
     * @param fix the ComponentFixture to search
     */
    public static getExpanders(fix: ComponentFixture<any>): DebugElement[] {
        return fix.debugElement.queryAll(By.css('.' + EXPANDER_CLASS));
    }

    /**
     * Gets the first hierarchical grid expander as an HTMLElement
     *
     * @param fix the ComponentFixture to search
     * @param modifier css search modifier
     */
    public static getExpander(fix: ComponentFixture<any>, modifier?: string): HTMLElement {
        return fix.nativeElement.querySelector(`.${EXPANDER_CLASS}${modifier || ''}`);
    }

    /**
     * Returns if there is an expander element in the specified row
     *
     * @param row the row instance to check for expander
     */
    public static hasExpander(row: IgxRowDirective<any>): boolean {
        return row.nativeElement.children[0].classList.contains(EXPANDER_CLASS);
    }

    /**
     * Returns if the specified element looks like an expander based on specific class affix
     *
     * @param element The element to check
     * @param modifier The modifier to the base class
     */
    public static isExpander(element: HTMLElement, modifier?: string): boolean {
        return element.classList.contains(`${EXPANDER_CLASS}${modifier || ''}`);
    }

    /**
     * Gets the main wrapper element of the vertical scrollbar.
     *
     * @param fix the ComponentFixture to search
     */
    public static getVerticalScrollWrapper(fix: ComponentFixture<any>, gridID): HTMLElement {
        const gridDebugEl = fix.debugElement.query(By.css(HIERARCHICAL_GRID_TAG + `[id='${gridID}'`));
        const scrollWrappers = gridDebugEl.queryAll(By.css('.' + SCROLL_TBODY_CLASS));
        // Return the last element since the scrollbar for the targeted grid is after all children that also have scrollbars
        return scrollWrappers[scrollWrappers.length - 1].nativeElement;
    }
}
