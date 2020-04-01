import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxHierarchicalRowComponent } from '../grids/hierarchical-grid';

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
}
