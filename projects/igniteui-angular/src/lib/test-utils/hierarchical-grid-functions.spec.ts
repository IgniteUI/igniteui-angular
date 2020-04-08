import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxHierarchicalRowComponent } from '../grids/hierarchical-grid/hierarchical-row.component';
import { IgxRowDirective } from '../grids/row.directive';

const EXPANDER_CLASS = 'igx-grid__hierarchical-expander';

export class HierarchicalGridFunctions {

    /**
     * Gets all hierarchical grid row components as an array of DebugElement
     * @param fix the ComponentFixture to search
     */
    public static getHierarchicalRows(fix: ComponentFixture<any>): DebugElement[] {
        return fix.debugElement.queryAll(By.directive(IgxHierarchicalRowComponent));
    }

    /**
     * Gets all hierarchical grid expanders as an array of DebugElement
     * @param fix the ComponentFixture to search
     */
    public static getExpanders(fix: ComponentFixture<any>): DebugElement[] {
        return fix.debugElement.queryAll(By.css('.' + EXPANDER_CLASS));
    }

    /**
     * Gets the first hierarchical grid expander as an HTMLElement
     * @param fix the ComponentFixture to search
     * @param modifier css search modifier
     */
    public static getExpander(fix: ComponentFixture<any>, modifier?: string): HTMLElement {
        return fix.nativeElement.querySelector(`.${EXPANDER_CLASS}${modifier || ''}`);
    }

    /**
     * Returns if there is an expander element in the specified row
     * @param row the row instance to check for expander
     */
    public static hasExpander(row: IgxRowDirective<any>): boolean {
        return row.nativeElement.children[0].classList.contains(EXPANDER_CLASS);
    }

    /**
     * Returns if the specified element looks like an expander based on specific class affix
     * @param element The element to check
     * @param modifier The modifier to the base class
     */
    public static isExpander(element: HTMLElement, modifier?: string): boolean {
        return element.classList.contains(`${EXPANDER_CLASS}${modifier || ''}`);
    }
}
