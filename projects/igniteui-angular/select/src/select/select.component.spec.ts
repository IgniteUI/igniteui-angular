import { Component, ViewChild, DebugElement, OnInit, ElementRef, inject, ChangeDetectorRef, DOCUMENT, Injector, ChangeDetectionStrategy, signal, provideZonelessChangeDetection, computed, EnvironmentProviders, Provider, EnvironmentInjector } from '@angular/core';
import { ReactiveNode, SIGNAL } from '@angular/core/primitives/signals';
import { NgStyle } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators, ReactiveFormsModule, NgForm, NgControl } from '@angular/forms';
import { FormField, disabled, form as signalForm, required } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';

import { IGX_DROPDOWN_BASE, IgxDropDownComponent, IgxDropDownItemComponent, ISelectionEventArgs } from '../../../drop-down/src/drop-down/public_api';
import { IgxHintDirective, IgxInputState, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective } from '../../../input-group/src/public_api';
import { IgxSelectComponent, IgxSelectFooterDirective, IgxSelectHeaderDirective } from './select.component';
import { IgxSelectItemComponent } from './select-item.component';
import { HorizontalAlignment, VerticalAlignment, ConnectedPositioningStrategy, AbsoluteScrollStrategy, AutoPositionStrategy, IgxSelectionAPIService, THEME_TOKEN, ThemeToken } from 'igniteui-angular/core';
import { UIInteractions } from '../../../test-utils/ui-interactions.spec';
import { advance, useFakeClock } from '../../../test-utils/helper-utils.spec';
import { countEffectRuns } from '../../../test-utils/effect-runs.spec';
import { IgxButtonDirective } from '../../../directives/src/directives/button/button.directive';
import { IgxToggleDirective } from '../../../directives/src/directives/toggle/toggle.directive';
import { IgxIconComponent, IgxIconService } from 'igniteui-angular/icon';
import { IgxSelectGroupComponent } from './select-group.component';
import { IgxDropDownItemBaseDirective } from '../../../drop-down/src/drop-down/drop-down-item.base';
import { IgxSelectOverlapPositionStrategy } from './select-overlap-positioning-strategy';

const CSS_CLASS_INPUT_GROUP = 'igx-input-group';
const CSS_CLASS_INPUT = 'igx-input-group__input';
const CSS_CLASS_TOGGLE_BUTTON = 'igx-icon';
const CSS_CLASS_DROPDOWN_LIST_SCROLL = 'igx-drop-down__list-scroll';
const CSS_CLASS_DROPDOWN_LIST = 'igx-drop-down';
const CSS_CLASS_DROPDOWN_SELECT_HEADER = 'igx-drop-down__select-header';
const CSS_CLASS_DROPDOWN_SELECT_FOOTER = 'igx-drop-down__select-footer';
const CSS_CLASS_DROPDOWN_LIST_ITEM = 'igx-drop-down__item';
const CSS_CLASS_SELECTED_ITEM = 'igx-drop-down__item--selected';
const CSS_CLASS_DISABLED_ITEM = 'igx-drop-down__item--disabled';
const CSS_CLASS_FOCUSED_ITEM = 'igx-drop-down__item--focused';
const CSS_CLASS_INPUT_GROUP_BOX = 'igx-input-group--box';
const CSS_CLASS_INPUT_GROUP_REQUIRED = 'igx-input-group--required';
const CSS_CLASS_INPUT_GROUP_INVALID = 'igx-input-group--invalid';
const CSS_CLASS_INPUT_GROUP_LABEL = 'igx-input-group__label';
const CSS_CLASS_INPUT_GROUP_BORDER = 'igx-input-group--border';

/** Type-ahead buffer reset delay (`timer(500)` in select-navigation.directive.ts). */
const TYPE_AHEAD_RESET_TIME = 500;

const arrowDownKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
const arrowUpKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
const altArrowDownKeyEvent = new KeyboardEvent('keydown', { altKey: true, key: 'ArrowDown' });
const altArrowUpKeyEvent = new KeyboardEvent('keydown', { altKey: true, key: 'ArrowUp' });
const spaceKeyEvent = new KeyboardEvent('keydown', { key: 'Space' });
const escapeKeyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
const endKeyEvent = new KeyboardEvent('keydown', { key: 'End' });
const homeKeyEvent = new KeyboardEvent('keydown', { key: 'Home' });
// Local copy of the overlay spec helper: importing it from overlay.spec.ts would register
// the whole overlay suite inside this file.
const addScrollDivToElement = (parent: HTMLElement) => {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.width = '100px';
    scrollDiv.style.height = '100px';
    scrollDiv.style.top = '10000px';
    scrollDiv.style.left = '10000px';
    scrollDiv.style.position = 'absolute';
    parent.appendChild(scrollDiv);
};

const tabKeyEvent = new KeyboardEvent('keydown', { key: 'Tab' });
const shiftTabKeysEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });

describe('igxSelect', () => {
    let fixture;
    let select: IgxSelectComponent;
    let inputElement: DebugElement;
    let selectList: DebugElement;
    let selectListWrapper: DebugElement;

    const verifyFocusedItem = focusedItemIndex => {
        const focusedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_FOCUSED_ITEM));
        expect(focusedItems.length).toEqual(1);
        expect(selectList.children[focusedItemIndex].nativeElement.classList.contains(CSS_CLASS_FOCUSED_ITEM)).toBeTruthy();
        expect(select.focusedItem).toBe(select.items[focusedItemIndex]);
        expect(select.items[focusedItemIndex].focused).toBeTruthy();
    };

    const verifySelectedItem = itemIndex => {
        expect(select.input.value).toEqual(select.items[itemIndex].value);
        expect(select.value).toEqual(select.items[itemIndex].value);
        const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
        expect(selectedItems.length).toEqual(1);
        expect(selectList.children[itemIndex].nativeElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeTruthy();
        expect(select.selectedItem).toBe(select.items[itemIndex] as IgxSelectItemComponent);
        expect(select.items[itemIndex].selected).toBeTruthy();
    };

    const verifyOpenCloseEvents = (openEventCounter = 0, closeEventCounter = 0, toggleCallCounter = 0) => {
        expect(select.opening.emit).toHaveBeenCalledTimes(openEventCounter);
        expect(select.opened.emit).toHaveBeenCalledTimes(openEventCounter);
        expect(select.open).toHaveBeenCalledTimes(openEventCounter);
        expect(select.closing.emit).toHaveBeenCalledTimes(closeEventCounter);
        expect(select.closed.emit).toHaveBeenCalledTimes(closeEventCounter);
        expect(select.close).toHaveBeenCalledTimes(closeEventCounter);
        expect(select.toggle).toHaveBeenCalledTimes(toggleCallCounter);
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxSelectSimpleComponent,
                IgxSelectGroupsComponent,
                IgxSelectMiddleComponent,
                IgxSelectTopComponent,
                IgxSelectBottomComponent,
                IgxSelectAffixComponent,
                IgxSelectReactiveFormComponent,
                IgxSelectTemplateFormComponent,
                IgxSelectHeaderFooterComponent,
                IgxSelectCDRComponent,
                IgxSelectWithIdComponent
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        UIInteractions.clearOverlay();
    });

    afterAll(() => {
        UIInteractions.clearOverlay();
    });

    describe('General tests: ', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            select = fixture.componentInstance.select;
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST_SCROLL));
            selectListWrapper = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
        });

        it('should initialize the select component properly', () => {
            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            expect(fixture.componentInstance).toBeDefined();
            expect(select).toBeDefined();
            expect(inputGroup).toBeTruthy();
            expect(select.placeholder).toBeDefined();
            expect(select.value).toBeNull();
            expect(select.disabled).toBeFalsy();
            expect(select.overlaySettings).toBeUndefined();
            expect(select.collapsed).toBeDefined();
            expect(select.collapsed).toBeTruthy();
            select.open();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
        });

        it('should properly accept input properties', () => {
            expect(select.width).toEqual('300px');
            expect(select.height).toEqual('200px');
            expect(select.maxHeight).toEqual('256px');
            expect(select.disabled).toBeFalsy();
            expect(select.placeholder).toEqual('Choose a city');
            expect(select.value).toBeNull();
            // Default type will be set - currently 'box'
            expect(select.type).toEqual('box');
            expect(select.overlaySettings).toBeUndefined();
            expect(select.items).toBeDefined();
            // Reset input values
            select.width = '500px';
            expect(select.width).toEqual('500px');
            select.height = '450px';
            expect(select.height).toEqual('450px');
            select.maxHeight = '300px';
            expect(select.maxHeight).toEqual('300px');
            select.placeholder = 'Your home town';
            expect(select.placeholder).toEqual('Your home town');
            select.value = 'Hamburg';
            expect(select.value).toEqual('Hamburg');
            select.type = 'box';
            expect(select.type).toEqual('box');
            select.items[3].disabled = true;
            expect(select.items[3].disabled).toBeTruthy();
            select.items[10].selected = true;
            expect(select.items[10].selected).toBeTruthy();
            select.items[11].value = 'Milano';
            expect(select.items[11].value).toEqual('Milano');

            const positionSettings = {
                target: select.inputGroup.element.nativeElement,
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Bottom
            };
            const customOverlaySettings = {
                modal: true,
                closeOnOutsideClick: false,
                positionStrategy: new ConnectedPositioningStrategy(positionSettings),
                scrollStrategy: new AbsoluteScrollStrategy()
            };
            select.overlaySettings = customOverlaySettings;
            expect(select.overlaySettings).toBe(customOverlaySettings);

            expect(select.collapsed).toBeTruthy();
            select.toggle();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
            select.disabled = true;
            expect(select.disabled).toBeTruthy();
        });

        it('should use AutoPositionStrategy as the default position strategy', () => {
            // The public overlaySettings input is undefined by default
            expect(select.overlaySettings).toBeUndefined();
            // The internal _overlayDefaults should use AutoPositionStrategy
            expect((select as any)._overlayDefaults.positionStrategy).toBeInstanceOf(AutoPositionStrategy);
            // The merged settings should target the input-group bundle element, not the raw input
            const merged = (select as any).getMergedOverlaySettings();
            const bundleElement = select.inputGroup.element.nativeElement.querySelector('.igx-input-group__bundle');
            expect(merged.target).toBe(bundleElement);
            expect(merged.target).not.toBe(select.getEditElement());
        });

        it('should allow opt-in to IgxSelectOverlapPositionStrategy via overlaySettings', async () => {
            const overlapStrategy = new IgxSelectOverlapPositionStrategy(select);
            select.overlaySettings = { positionStrategy: overlapStrategy };
            expect(select.overlaySettings.positionStrategy).toBeInstanceOf(IgxSelectOverlapPositionStrategy);
            expect((select.overlaySettings.positionStrategy as IgxSelectOverlapPositionStrategy).isItemOverlapPositioning).toBe(true);
            // The merged settings should switch the target to the raw input element
            const merged = (select as any).getMergedOverlaySettings();
            expect(merged.target).toBe(select.getEditElement());

            // The select should still open correctly when using the overlap strategy
            select.open();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            select.close();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        });

        it('should open dropdown on input click', () => {
            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            expect(select.collapsed).toBeTruthy();

            inputGroup.nativeElement.click();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
        });

        it('should close dropdown on item click', async () => {
            const selectedItemEl = selectList.children[2];
            expect(select.collapsed).toBeTruthy();

            select.toggle();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            selectedItemEl.nativeElement.click();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        });

        it('should close dropdown on clicking selected item', async () => {
            vi.spyOn(select.selectionChanging, 'emit');
            select.items[1].selected = true;
            select.open();
            fixture.detectChanges();
            const selectedItemEl = selectList.children[1];
            expect(select.collapsed).toBeFalsy();
            selectedItemEl.nativeElement.click();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();

            select.open();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
            selectedItemEl.nativeElement.click();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
            expect(select.selectionChanging.emit).toHaveBeenCalledTimes(1);
        });

        it('should toggle dropdown on toggle button click', async () => {
            const toggleBtn = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLE_BUTTON));
            expect(select.collapsed).toBeTruthy();

            toggleBtn.nativeElement.click();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            toggleBtn.nativeElement.click();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        });

        it('should toggle dropdown using API methods', async () => {
            select.items[0].selected = true;
            expect(select.collapsed).toBeTruthy();

            select.open();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            select.close();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();

            select.toggle();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            select.toggle();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        });

        it('should not display dropdown list when no select items', async () => {
            fixture.componentInstance.items = [];
            fixture.detectChanges();

            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            inputGroup.nativeElement.click();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
            expect(selectListWrapper.nativeElement.classList.contains('igx-toggle--hidden')).toBeTruthy();
        });

        it('should properly emit opening/closing events on input click', async () => {
            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            const inputBundle = inputGroup.nativeElement.querySelector('.igx-input-group__bundle') as HTMLElement;
            expect(select).toBeTruthy();

            vi.spyOn(select.opening, 'emit');
            vi.spyOn(select.opened, 'emit');
            vi.spyOn(select.closing, 'emit');
            vi.spyOn(select.closed, 'emit');
            vi.spyOn(select, 'toggle');
            vi.spyOn(select, 'open');
            vi.spyOn(select, 'close');

            inputBundle.click();
            await fixture.whenStable();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 0, 1);

            inputBundle.click();
            await fixture.whenStable();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 1, 2);

            select.disabled = true;
            fixture.detectChanges();
            inputBundle.click();
            await fixture.whenStable();
            fixture.detectChanges();

            // No additional calls, because select is disabled
            expect(select.closing.emit).toHaveBeenCalledTimes(1);
            expect(select.closed.emit).toHaveBeenCalledTimes(1);
            expect(select.opening.emit).toHaveBeenCalledTimes(1);
            expect(select.opened.emit).toHaveBeenCalledTimes(1);
        });

        it('should properly emit closing events on item click', async () => {
            const selectedItemEl = selectList.children[2];

            select.toggle();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            vi.spyOn(select.closing, 'emit');
            vi.spyOn(select.closed, 'emit');

            selectedItemEl.nativeElement.click();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.closing.emit).toHaveBeenCalledTimes(1);
            expect(select.closed.emit).toHaveBeenCalledTimes(1);
        });

        it('should properly emit opening/closing events on toggle button click', async () => {
            const toggleBtn = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLE_BUTTON));
            expect(select).toBeTruthy();

            vi.spyOn(select.opening, 'emit');
            vi.spyOn(select.opened, 'emit');
            vi.spyOn(select.closing, 'emit');
            vi.spyOn(select.closed, 'emit');
            vi.spyOn(select, 'toggle');
            vi.spyOn(select, 'open');
            vi.spyOn(select, 'close');

            toggleBtn.nativeElement.click();
            await fixture.whenStable();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 0, 1);

            toggleBtn.nativeElement.click();
            await fixture.whenStable();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 1, 2);
        });

        it('should emit closing events on input blur when closeOnOutsideClick: true (default value)', async () => {
            const dummyInput = fixture.componentInstance.dummyInput.nativeElement;
            vi.spyOn(select.closing, 'emit');
            vi.spyOn(select.closed, 'emit');

            expect(select).toBeDefined();
            select.toggle();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            dummyInput.focus();
            dummyInput.click();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(dummyInput).toEqual(document.activeElement);
            expect(select.collapsed).toBeTruthy();
            expect(select.closing.emit).toHaveBeenCalledTimes(1);
            expect(select.closed.emit).toHaveBeenCalledTimes(1);
        });

        it('should NOT emit closing events on input blur when closeOnOutsideClick: false', async () => {
            const dummyInput = fixture.componentInstance.dummyInput.nativeElement;
            vi.spyOn(select.closing, 'emit');
            vi.spyOn(select.closed, 'emit');

            const customOverlaySettings = {
                closeOnOutsideClick: false
            };
            select.overlaySettings = customOverlaySettings;
            expect(select.overlaySettings).toBe(customOverlaySettings);
            expect(select.collapsed).toBeTruthy();
            fixture.detectChanges();

            expect(select).toBeDefined();
            select.toggle();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            dummyInput.focus();
            dummyInput.click();

            await fixture.whenStable();
            fixture.detectChanges();

            expect(dummyInput).toEqual(document.activeElement);
            expect(select.collapsed).toBeFalsy();
            expect(select.closing.emit).toHaveBeenCalledTimes(0);
            expect(select.closed.emit).toHaveBeenCalledTimes(0);
        });

        it('should render aria attributes properly', async () => {
            const dropdownListElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST_SCROLL));
            const dropdownWrapper = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            const toggleBtn = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLE_BUTTON));
            const labelID = fixture.componentInstance.label1.nativeElement.getAttribute('id');
            expect(inputElement.nativeElement.getAttribute('role')).toEqual('combobox');
            expect(inputElement.nativeElement.getAttribute('aria-haspopup')).toEqual('listbox');
            expect(inputElement.nativeElement.getAttribute('aria-labelledby')).toEqual(labelID);
            expect(dropdownListElement.nativeElement.getAttribute('aria-labelledby')).toEqual(labelID);
            expect(inputElement.nativeElement.getAttribute('aria-required')).toEqual('false');
            expect(inputElement.nativeElement.getAttribute('aria-owns')).toEqual(select.listId);
            expect(inputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
            expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');
            expect(dropdownListElement.nativeElement.getAttribute('role')).toEqual('listbox');
            expect(dropdownWrapper.nativeElement.getAttribute('aria-hidden')).toEqual('true');

            select.toggle();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(inputElement.nativeElement.getAttribute('aria-expanded')).toEqual('true');
            expect(dropdownWrapper.nativeElement.getAttribute('aria-hidden')).toEqual('false');

            select.toggle();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(inputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
            expect(dropdownWrapper.nativeElement.getAttribute('aria-hidden')).toEqual('true');
        });

        it('should render aria attributes on dropdown items properly', () => {
            const selectItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWN_LIST_ITEM));
            selectItems.forEach(item => {
                expect(item.nativeElement.getAttribute('role')).toEqual('option');
                expect(item.nativeElement.getAttribute('aria-selected')).toEqual('false');
                expect(item.nativeElement.getAttribute('aria-disabled')).toEqual('false');
            });
            const selectedItem = select.items[2];
            const disabledItem = select.items[8];
            selectedItem.selected = true;
            disabledItem.disabled = true;
            fixture.detectChanges();
            expect(selectItems[selectedItem.index].nativeElement.getAttribute('aria-selected')).toEqual('true');
            expect(selectItems[disabledItem.index].nativeElement.getAttribute('aria-disabled')).toEqual('true');
        });

        it('should render input type properly', async () => {
            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            // Default type will be set - currently 'box'
            expect(select.type).toEqual('box');
            expect(inputGroup.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_BOX)).toBeTruthy();
            expect(inputGroup.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_BORDER)).toBeFalsy();
            select.type = 'border';
            fixture.detectChanges();
            await fixture.whenStable();
            expect(inputGroup.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_BORDER)).toBeTruthy();
        });

        it('should close dropdown on blur when closeOnOutsideClick: true (default value)', async () => {
            const dummyInput = fixture.componentInstance.dummyInput.nativeElement;
            expect(select.collapsed).toBeTruthy();
            select.toggle();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            dummyInput.focus();
            dummyInput.click();

            await fixture.whenStable();
            fixture.detectChanges();
            expect(dummyInput).toEqual(document.activeElement);
            expect(select.collapsed).toBeTruthy();
        });

        it('should NOT close dropdown on blur when closeOnOutsideClick: false', async () => {
            const dummyInput = fixture.componentInstance.dummyInput.nativeElement;
            const customOverlaySettings = {
                closeOnOutsideClick: false
            };
            select.overlaySettings = customOverlaySettings;
            expect(select.overlaySettings).toBe(customOverlaySettings);
            expect(select.collapsed).toBeTruthy();
            fixture.detectChanges();
            select.toggle();
            expect(select.collapsed).toBeFalsy();

            dummyInput.focus();
            dummyInput.click();

            await fixture.whenStable();
            fixture.detectChanges();
            expect(dummyInput).toEqual(document.activeElement);
            expect(select.collapsed).toBeFalsy();
        });

        it('should set the id attribute when using property binding', () => {
            fixture = TestBed.createComponent(IgxSelectWithIdComponent);
            fixture.detectChanges();

            select = fixture.componentInstance.select;
            fixture.detectChanges();

            const selectElement = fixture.debugElement.query(By.css('igx-select')).nativeElement;
            fixture.detectChanges();

            expect(select).toBeTruthy();
            expect(select.id).toEqual("id1");
            expect(selectElement.getAttribute('id')).toBe('id1');
        });
    });

    describe('Form tests: ', () => {
        it('Should properly initialize when used as a reactive form control - with validators', async () => {
            const fix = TestBed.createComponent(IgxSelectReactiveFormComponent);
            const inputGroupIsRequiredClass = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
            fix.detectChanges();
            const selectComp = fix.componentInstance.select;
            const selectFormReference = fix.componentInstance.reactiveForm.controls.optionsSelect;
            expect(selectFormReference).toBeDefined();
            expect(selectComp).toBeDefined();
            expect(selectComp.selectedItem).toBeUndefined();
            expect(selectComp.value).toEqual('');
            expect(inputGroupIsRequiredClass).toBeDefined();
            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.toggle();
            expect(selectComp.collapsed).toEqual(false);

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.onBlur();

            expect(selectComp.input.valid).toEqual(IgxInputState.INVALID);

            selectComp.selectItem(selectComp.items[4]);
            expect(selectComp.value).toEqual('Option 5');

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.onBlur();

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.value = 'Option 1';

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);
        });

        it('Should properly initialize when used as a reactive form control - without initial validators', async () => {
            const fix = TestBed.createComponent(IgxSelectReactiveFormComponent);
            fix.detectChanges();
            // 1) check if label's --required class and its asterisk are applied
            const dom = fix.debugElement;
            const selectComp = fix.componentInstance.select;
            const formGroup: UntypedFormGroup = fix.componentInstance.reactiveForm;
            inputElement = dom.query(By.css('.' + CSS_CLASS_INPUT));
            let inputGroupIsRequiredClass = dom.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
            let inputGroupInvalidClass = dom.query(By.css('.' + CSS_CLASS_INPUT_GROUP_INVALID));
            // interaction test - expect actual asterisk
            // The only way to get a pseudo elements like :before OR :after is to use getComputedStyle(element [, pseudoElt]),
            // as these are not in the actual DOM
            let asterisk = window.getComputedStyle(dom.query(By.css('.' + CSS_CLASS_INPUT_GROUP_LABEL)).nativeElement, ':after').content;
            expect(asterisk).toBe('"*"');
            expect(inputGroupIsRequiredClass).toBeDefined();
            expect(inputGroupIsRequiredClass).not.toBeNull();
            expect(inputElement.nativeElement.getAttribute('aria-required')).toEqual('true');

            // 2) check that input group's --invalid class is NOT applied
            expect(inputGroupInvalidClass).toBeNull();

            // interaction test - markAsTouched + open&close so the --invalid and --required classes are applied
            fix.debugElement.componentInstance.markAsTouched();
            const inputGroup = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            inputGroup.nativeElement.click();
            const toggleBtn = fix.debugElement.query(By.css('.' + CSS_CLASS_TOGGLE_BUTTON));
            toggleBtn.nativeElement.click();
            await fixture.whenStable();
            fix.detectChanges();
            expect(selectComp.collapsed).toEqual(true);

            inputGroupInvalidClass = dom.query(By.css('.' + CSS_CLASS_INPUT_GROUP_INVALID));
            expect(inputGroupInvalidClass).not.toBeNull();
            expect(inputGroupInvalidClass).not.toBeUndefined();

            inputGroupIsRequiredClass = dom.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
            expect(inputGroupIsRequiredClass).not.toBeNull();
            expect(inputGroupIsRequiredClass).not.toBeUndefined();
            expect(inputElement.nativeElement.getAttribute('aria-required')).toEqual('true');

            // 3) Check if the input group's --invalid and --required classes are removed when validator is dynamically cleared
            fix.componentInstance.removeValidators(formGroup);
            fix.detectChanges();
            await fixture.whenStable();
            expect(inputElement.nativeElement.getAttribute('aria-required')).toEqual('false');

            inputGroupIsRequiredClass = dom.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
            const selectFormReference = fix.componentInstance.reactiveForm.controls.optionsSelect;
            // interaction test - expect no asterisk
            asterisk = window.getComputedStyle(dom.query(By.css('.' + CSS_CLASS_INPUT_GROUP_LABEL)).nativeElement, ':after').content;
            expect(selectFormReference).toBeDefined();
            expect(selectComp).toBeDefined();
            expect(selectComp.selectedItem).toBeUndefined();
            expect(selectComp.value).toEqual('');
            expect(inputGroupIsRequiredClass).toBeNull();
            expect(asterisk).toBe('none');
            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.onBlur();

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.selectItem(selectComp.items[4]);

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            document.documentElement.dispatchEvent(new Event('click'));
            expect(selectComp.collapsed).toEqual(true);

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.onBlur();

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            // Re-add all Validators
            fix.componentInstance.addValidators(formGroup);
            fix.detectChanges();
            expect(inputElement.nativeElement.getAttribute('aria-required')).toEqual('true');

            inputGroupIsRequiredClass = dom.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
            expect(inputGroupIsRequiredClass).toBeDefined();
            expect(inputGroupIsRequiredClass).not.toBeNull();
            expect(inputGroupIsRequiredClass).not.toBeUndefined();
            // interaction test - expect actual asterisk
            asterisk = window.getComputedStyle(dom.query(By.css('.' + CSS_CLASS_INPUT_GROUP_LABEL)).nativeElement, ':after').content;
            expect(asterisk).toBe('"*"');
        });

        it('should update validity state when programmatically setting errors on reactive form controls', async () => {
            const fix = TestBed.createComponent(IgxSelectReactiveFormComponent);
            fix.detectChanges();
            const selectComp = fix.componentInstance.select;
            const formGroup: UntypedFormGroup = fix.componentInstance.reactiveForm;

            // the form control has validators
            formGroup.markAllAsTouched();
            formGroup.get('optionsSelect').setErrors({ error: true });
            fix.detectChanges();

            expect(selectComp.input.valid).toBe(IgxInputState.INVALID);
            expect((selectComp as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_INVALID)).toBe(true);
            expect((selectComp as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_REQUIRED)).toBe(true);

            // remove the validators and set errors
            (fix.componentInstance as IgxSelectReactiveFormComponent).removeValidators(formGroup);
            formGroup.markAsUntouched();
            fix.detectChanges();

            formGroup.markAllAsTouched();
            formGroup.get('optionsSelect').setErrors({ error: true });
            fix.detectChanges();

            // no validator, but there is a set error
            expect(selectComp.input.valid).toBe(IgxInputState.INVALID);
            expect((selectComp as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_INVALID)).toBe(true);
            expect((selectComp as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_REQUIRED)).toBe(false);
        });

        it('should render as INITIAL (not INVALID) after control.disable() when previously invalid', () => {
            const fix = TestBed.createComponent(IgxSelectReactiveFormComponent);
            fix.detectChanges();

            const selectComp = fix.componentInstance.select;
            const control = fix.componentInstance.reactiveForm.controls.optionsSelect;

            // markAsTouched does not emit statusChanges; use updateValueAndValidity() to
            // trigger onStatusChanged while touched=true so the INVALID precondition is established.
            control.markAsTouched();
            control.updateValueAndValidity();
            fix.detectChanges();

            expect(selectComp.input.valid).toEqual(IgxInputState.INVALID);

            control.disable();
            fix.detectChanges();

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);
        });

        it('Should properly initialize when used as a form control - with initial validators', async () => {
            const fix = TestBed.createComponent(IgxSelectTemplateFormComponent);

            let inputGroupIsRequiredClass = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
            fix.detectChanges();
            const selectComp = fix.componentInstance.select;
            const selectFormReference = fix.componentInstance.ngForm.form;
            expect(selectFormReference).toBeDefined();
            expect(selectComp).toBeDefined();
            await fixture.whenStable();
            fix.detectChanges();
            expect(selectComp.selectedItem).toBeUndefined();
            expect(selectComp.value).toBeNull();
            expect(inputGroupIsRequiredClass).toBeDefined();
            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.toggle();
            expect(selectComp.collapsed).toEqual(false);

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.onBlur();

            expect(selectComp.input.valid).toEqual(IgxInputState.INVALID);

            selectComp.selectItem(selectComp.items[4]);
            expect(selectComp.value).toEqual('Option 5');

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.onBlur();
            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.value = 'Option 1';

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            fix.componentInstance.isRequired = false;
            fix.detectChanges();
            inputGroupIsRequiredClass = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
            expect(inputGroupIsRequiredClass).toBeNull();
        });

        it('Should properly initialize when used as a form control - without initial validators', async () => {
            const fix = TestBed.createComponent(IgxSelectTemplateFormComponent);
            fix.componentInstance.isRequired = false;

            let inputGroupIsRequiredClass = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
            fix.detectChanges();
            // The template-driven form registers its controls asynchronously, so let it do that before interacting.
            // Otherwise the registration (with the model's initial `null` value) can run in the middle of the test.
            await fix.whenStable();
            const selectComp = fix.componentInstance.select;
            const selectFormReference = fix.componentInstance.ngForm.form;
            selectFormReference.clearValidators();
            expect(selectFormReference).toBeDefined();
            expect(selectComp).toBeDefined();
            // the form has written the model's initial `null` value
            expect(selectComp.selectedItem).toBeFalsy();
            expect(selectComp.value).toBeNull();
            expect(inputGroupIsRequiredClass).toBeNull();
            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.onBlur();

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.selectItem(selectComp.items[4]);

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            document.documentElement.dispatchEvent(new Event('click'));
            expect(selectComp.collapsed).toEqual(true);

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            selectComp.onBlur();

            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);

            fix.componentInstance.isRequired = true;
            fix.detectChanges();
            inputGroupIsRequiredClass = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP_REQUIRED));
            expect(inputGroupIsRequiredClass).not.toBeNull();
        });

        it('Should have correctly bound focus and blur handlers', () => {
            const fix = TestBed.createComponent(IgxSelectTemplateFormComponent);
            fix.detectChanges();
            select = fix.componentInstance.select;
            const input = fix.debugElement.query(By.css(`.${CSS_CLASS_INPUT}`));

            vi.spyOn(select, 'onFocus');
            vi.spyOn(select, 'onBlur');

            input.triggerEventHandler('focus', {});
            expect(select.onFocus).toHaveBeenCalled();
            expect(select.onFocus).toHaveBeenCalledWith();

            input.triggerEventHandler('blur', {});
            expect(select.onBlur).toHaveBeenCalled();
            expect(select.onFocus).toHaveBeenCalledWith();
        });

        // Bug #6025 Select does not disable in reactive form
        it('Should disable when form is disabled', async () => {
            const fix = TestBed.createComponent(IgxSelectReactiveFormComponent);
            fix.detectChanges();
            const formGroup: UntypedFormGroup = fix.componentInstance.reactiveForm;
            const selectComp = fix.componentInstance.select;
            const inputGroup = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));

            inputGroup.nativeElement.click();
            await fixture.whenStable();
            fix.detectChanges();
            expect(selectComp.collapsed).toBeFalsy();

            selectComp.close();
            fix.detectChanges();

            formGroup.disable();
            await fixture.whenStable();
            fix.detectChanges();

            inputGroup.nativeElement.click();
            await fixture.whenStable();
            fix.detectChanges();
            expect(selectComp.collapsed).toBeTruthy();
        });

        it('should set validity to initial when the form is reset', async () => {
            const fix = TestBed.createComponent(IgxSelectTemplateFormComponent);
            fix.detectChanges();
            await fixture.whenStable();

            const selectComp = fix.componentInstance.select;
            selectComp.onBlur();
            expect(selectComp.input.valid).toEqual(IgxInputState.INVALID);

            fix.componentInstance.ngForm.resetForm();
            await fixture.whenStable();
            expect(selectComp.input.valid).toEqual(IgxInputState.INITIAL);
        });
    });

    describe('Selection tests: ', () => {
        describe('Using simple select component', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxSelectSimpleComponent);
                select = fixture.componentInstance.select;
                fixture.detectChanges();
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST_SCROLL));
            });

            it('should select item with mouse click', async () => {
                let selectedItemIndex = 5;

                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                selectList.children[selectedItemIndex].nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);

                selectedItemIndex = 15;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                selectList.children[selectedItemIndex].nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);
            });

            it('should select item with API selectItem() method', async () => {
                let selectedItemIndex = 15;
                select.selectItem(select.items[selectedItemIndex]);
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);

                selectedItemIndex = 1;
                select.selectItem(select.items[selectedItemIndex]);
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);
            });

            it('should select item on setting value property', async () => {
                let selectedItemIndex = 7;
                select.value = select.items[selectedItemIndex].value.toString();
                fixture.detectChanges();
                await fixture.whenStable();
                verifySelectedItem(selectedItemIndex);

                selectedItemIndex = 12;
                select.value = select.items[selectedItemIndex].value.toString();
                fixture.detectChanges();
                await fixture.whenStable();
                verifySelectedItem(selectedItemIndex);
            });

            it('should select item on setting item\'s selected property', () => {
                let selectedItemIndex = 9;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);

                selectedItemIndex = 14;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);
            });

            it('should select item with ENTER/SPACE keys', async () => {
                let selectedItemIndex = 2;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                inputElement.triggerEventHandler('keydown', spaceKeyEvent);
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);

                selectedItemIndex = 4;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                inputElement.triggerEventHandler('keydown', enterKeyEvent);
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);
            });

            it('should allow single selection only', async () => {
                let selectedItemIndex = 5;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                selectList.children[selectedItemIndex].nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);

                selectedItemIndex = 15;
                select.selectItem(select.items[selectedItemIndex]);
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);

                selectedItemIndex = 8;
                select.value = select.items[selectedItemIndex].value.toString();
                fixture.detectChanges();
                await fixture.whenStable();
                verifySelectedItem(selectedItemIndex);
            });

            it('should clear selection when value property does not match any item', async () => {
                const selectedItemIndex = 5;
                select.value = select.items[selectedItemIndex].value.toString();
                fixture.detectChanges();
                await fixture.whenStable();
                verifySelectedItem(selectedItemIndex);

                select.value = 'Ghost city';
                await fixture.whenStable();
                fixture.detectChanges();
                const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
                expect(selectedItems.length).toEqual(0);
                expect(select.selectedItem).toBeUndefined();
                expect(select.input.value).toEqual('');
            });

            it('should focus first item in dropdown if there is not selected item', async () => {
                const focusedItemIndex = 0;
                const selectedItemIndex = 8;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                verifyFocusedItem(focusedItemIndex);

                selectList.children[selectedItemIndex].nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);
                expect(select.items[focusedItemIndex].focused).toBeFalsy();

                // Unselect selected item
                select.value = '';
                fixture.detectChanges();

                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                verifyFocusedItem(focusedItemIndex);
            });

            it('should populate the input box with the selected item value', async () => {
                let selectedItemIndex = 5;
                let selectedItemValue = select.items[selectedItemIndex].value;

                const checkInputValue = () => {
                    expect(select.selectedItem.value).toEqual(selectedItemValue);
                    expect(select.value).toEqual(selectedItemValue);
                    expect(inputElement.nativeElement.value.toString().trim()).toEqual(selectedItemValue);
                };

                // There is not a selected item initially
                const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
                expect(selectedItems.length).toEqual(0);
                expect(select.value).toBeNull();
                expect(select.input.value).toEqual('');
                expect(inputElement.nativeElement.value).toEqual('');

                // Select item - mouse click
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                selectList.children[selectedItemIndex].nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                checkInputValue();

                // Select item - selectItem method
                selectedItemIndex = 0;
                selectedItemValue = select.items[selectedItemIndex].value;
                select.selectItem(select.items[selectedItemIndex]);
                await fixture.whenStable();
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                checkInputValue();

                // Select item - item selected property
                selectedItemIndex = 12;
                selectedItemValue = select.items[selectedItemIndex].value;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                await fixture.whenStable();
                fixture.detectChanges();
                checkInputValue();

                // Select item - value property
                selectedItemIndex = 8;
                selectedItemValue = select.items[selectedItemIndex].value;
                select.value = select.items[selectedItemIndex].value.toString();
                fixture.detectChanges();
                await fixture.whenStable();
                fixture.detectChanges();
                checkInputValue();
            });

            it('should populate the input with the selected item text', async () => {
                let selectedItemIndex = 0;

                const checkInputValue = () => {
                    expect(select.selectedItem.text).toEqual(select.input.value);
                    expect(inputElement.nativeElement.value.toString().trim()).toEqual(select.selectedItem.text);
                };

                // There is not a selected item initially
                const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
                expect(selectedItems.length).toEqual(0);
                expect(select.value).toBeNull();
                expect(select.input.value).toEqual('');
                expect(inputElement.nativeElement.value).toEqual('');

                // Select item - mouse click
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                selectList.children[selectedItemIndex].nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                checkInputValue();

                // Select item - selectItem method
                selectedItemIndex = 1;
                select.selectItem(select.items[selectedItemIndex]);
                await fixture.whenStable();
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                checkInputValue();

                // Select item - item selected property
                selectedItemIndex = 2;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                await fixture.whenStable();
                fixture.detectChanges();
                checkInputValue();
            });

            it('should not append any text to the input box when no item is selected and value is not set or does not match any item', async () => {
                // There is not a selected item initially
                expect(select.selectedItem).toBeUndefined();
                expect(select.value).toBeNull();
                expect(select.input.value).toEqual('');
                expect(inputElement.nativeElement.textContent).toEqual('');

                select.value = 'Ghost city';
                await fixture.whenStable();
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                expect(select.selectedItem).toBeUndefined();
                expect(select.input.value).toEqual('');
                expect(inputElement.nativeElement.value).toEqual('');
                const selectedItems = fixture.debugElement.nativeElement.querySelectorAll('.' + CSS_CLASS_SELECTED_ITEM);
                expect(selectedItems.length).toEqual(0);
            });

            it('should not append any text to the input box when an item is focused but not selected', async () => {
                let focusedItem = select.items[2];
                let selectedItem: IgxSelectItemComponent = null;
                const navigationStep = focusedItem.index;

                const navigateDropdownItems = async (keydownEvent: KeyboardEvent) => {
                    for (let index = 0; index < navigationStep; index++) {
                        inputElement.triggerEventHandler('keydown', keydownEvent);
                    }
                    await fixture.whenStable();
                    fixture.detectChanges();
                };

                const verifyFocusedItemIsNotSelected = () => {
                    expect(focusedItem.element.nativeElement.classList.contains(CSS_CLASS_FOCUSED_ITEM)).toBeTruthy();
                    expect(focusedItem.element.nativeElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeFalsy();
                    expect(select.focusedItem).toEqual(focusedItem);
                    if (selectedItem) {
                        expect(selectedItem.element.nativeElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeTruthy();
                        expect(select.selectedItem).toEqual(selectedItem);
                        expect(select.value).toEqual(selectedItem.value);
                        expect(select.input.value).toEqual(selectedItem.value);
                    }
                };

                // Focus item when there is not a selected item
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                await navigateDropdownItems(arrowDownKeyEvent);
                expect(select.value).toBeNull();
                expect(select.input.value).toEqual('');
                verifyFocusedItemIsNotSelected();

                // Focus item when there is a selected item
                selectedItem = select.items[13] as IgxSelectItemComponent;
                selectedItem.element.nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                await navigateDropdownItems(arrowUpKeyEvent);
                focusedItem = select.items[selectedItem.index - navigationStep];
                verifyFocusedItemIsNotSelected();

                // Change focused item when there is a selected item
                await navigateDropdownItems(arrowUpKeyEvent);
                focusedItem = select.items[selectedItem.index - navigationStep * 2];
                verifyFocusedItemIsNotSelected();
            });

            it('should not select disabled item', () => {
                const disabledItem = select.items[2];
                disabledItem.disabled = true;
                fixture.detectChanges();
                disabledItem.selected = true;
                fixture.detectChanges();

                expect(select.value).toBeNull();
                expect(select.input.value).toEqual('');
                expect(inputElement.nativeElement.value).toEqual('');
                expect(disabledItem.element.nativeElement.classList.contains(CSS_CLASS_DISABLED_ITEM)).toBeTruthy();
                expect(disabledItem.element.nativeElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeFalsy();
            });

            it('should remove selection if option has been removed', async () => {
                const selectedItemIndex = 2;
                select.items[selectedItemIndex].selected = true;
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);

                fixture.componentInstance.items = [];
                fixture.detectChanges();
                await fixture.whenStable();
                expect(select.selectedItem).toBeUndefined();
            });

            it('should select first match out of duplicated values', async () => {
                fixture.componentInstance.itemTrack = (_item: string, index: number) => index;
                fixture.componentInstance.items = ['Paris', 'London', 'Paris', 'Hamburg', 'London'];
                fixture.detectChanges();

                let selectedItemIndex = 4;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();

                select.items[selectedItemIndex].element.nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);

                const previousItem = select.items[selectedItemIndex];
                selectedItemIndex = 1;
                select.items[selectedItemIndex].element.nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);
                expect(previousItem.focused).toBeFalsy();
            });

            it('should not change selection when setting value to non-existing item', async () => {
                const selectedItemEl = selectList.children[2];
                const selectedItem = select.items[2] as IgxSelectItemComponent;

                inputElement.nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                selectedItemEl.nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                expect(selectedItem.selected).toBeTruthy();
                expect(select.value).toEqual(selectedItem.value);
                expect(select.input.value.toString().trim()).toEqual(selectedItem.value);
                expect(select.selectedItem).toEqual(selectedItem);
                expect(selectedItemEl.nativeElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeTruthy();

                // Throws an error 'Cannot read property disabled of null'
                select.selectItem(null);
                fixture.detectChanges();
                expect(selectedItem.selected).toBeTruthy();
                expect(select.value).toEqual(selectedItem.value);
                expect(select.input.value.toString().trim()).toEqual(selectedItem.value);
                expect(select.selectedItem).toEqual(selectedItem);
                expect(selectedItemEl.nativeElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeTruthy();
                const selectedItems = fixture.debugElement.nativeElement.querySelectorAll('.' + CSS_CLASS_SELECTED_ITEM);
                expect(selectedItems.length).toEqual(1);
            });

            it('should properly emit selectionChanging event on item click', async () => {
                let selectedItemEl = selectList.children[5];
                let selectedItem = select.items[5];
                vi.spyOn(select.selectionChanging, 'emit');
                vi.spyOn(select, 'selectItem');
                const args: ISelectionEventArgs = {
                    oldSelection: <IgxDropDownItemBaseDirective>{},
                    newSelection: selectedItem,
                    cancel: false,
                    owner: select
                };

                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                selectedItemEl.nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                expect(select.selectionChanging.emit).toHaveBeenCalledTimes(1);
                expect(select.selectItem).toHaveBeenCalledTimes(1);
                expect(select.selectionChanging.emit).toHaveBeenCalledWith(args);

                args.oldSelection = selectedItem;
                selectedItem = select.items[10];
                selectedItemEl = selectList.children[10];
                args.newSelection = selectedItem;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                selectedItemEl.nativeElement.click();
                await fixture.whenStable();
                fixture.detectChanges();
                expect(select.selectionChanging.emit).toHaveBeenCalledTimes(2);
                expect(select.selectItem).toHaveBeenCalledTimes(2);
                expect(select.selectionChanging.emit).toHaveBeenCalledWith(args);
            });

            it('should properly emit selectionChanging event on item selected property setting', () => {
                let selectedItem = select.items[3];
                vi.spyOn(select.selectionChanging, 'emit');
                vi.spyOn(select, 'selectItem');
                const args: ISelectionEventArgs = {
                    oldSelection: <IgxDropDownItemBaseDirective>{},
                    newSelection: selectedItem,
                    cancel: false,
                    owner: select
                };

                selectedItem.selected = true;
                fixture.detectChanges();
                expect(select.selectionChanging.emit).toHaveBeenCalledTimes(1);
                expect(select.selectItem).toHaveBeenCalledTimes(1);
                expect(select.selectionChanging.emit).toHaveBeenCalledWith(args);

                args.oldSelection = selectedItem;
                selectedItem = select.items[9];
                selectedItem.selected = true;
                args.newSelection = selectedItem;
                fixture.detectChanges();
                expect(select.selectionChanging.emit).toHaveBeenCalledTimes(2);
                expect(select.selectItem).toHaveBeenCalledTimes(2);
                expect(select.selectionChanging.emit).toHaveBeenCalledWith(args);
            });

            it('should properly emit selectionChanging/close events on key interaction', async () => {
                let selectedItem = select.items[3];
                vi.spyOn(select.opening, 'emit');
                vi.spyOn(select.opened, 'emit');
                vi.spyOn(select.closing, 'emit');
                vi.spyOn(select.closed, 'emit');
                vi.spyOn(select, 'close');
                vi.spyOn(select.selectionChanging, 'emit');
                vi.spyOn(select, 'selectItem');
                const args: ISelectionEventArgs = {
                    oldSelection: <IgxDropDownItemBaseDirective>{},
                    newSelection: selectedItem,
                    cancel: false,
                    owner: select
                };

                const navigateDropdownItems = async (selectEvent: KeyboardEvent) => {
                    inputElement.triggerEventHandler('keydown', altArrowDownKeyEvent);
                    await fixture.whenStable();
                    fixture.detectChanges();
                    for (let itemIndex = 0; itemIndex < selectedItem.index; itemIndex++) {
                        inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                    }
                    inputElement.triggerEventHandler('keydown', selectEvent);
                    await fixture.whenStable();
                    fixture.detectChanges();
                };

                await navigateDropdownItems(enterKeyEvent);
                expect(select.opening.emit).toHaveBeenCalledTimes(1);
                expect(select.opened.emit).toHaveBeenCalledTimes(1);
                expect(select.selectionChanging.emit).toHaveBeenCalledTimes(1);
                expect(select.selectItem).toHaveBeenCalledTimes(1);
                expect(select.selectionChanging.emit).toHaveBeenCalledWith(args);
                expect(select.closing.emit).toHaveBeenCalledTimes(1);
                expect(select.closed.emit).toHaveBeenCalledTimes(1);
                expect(select.close).toHaveBeenCalledTimes(1);

                // Correct event order
                expect(Math.min(...vi.mocked(select.opening.emit).mock.invocationCallOrder)).toBeLessThan(Math.min(...vi.mocked(select.opened.emit).mock.invocationCallOrder));
                expect(Math.min(...vi.mocked(select.opened.emit).mock.invocationCallOrder)).toBeLessThan(Math.min(...vi.mocked(select.selectionChanging.emit).mock.invocationCallOrder));
                expect(Math.min(...vi.mocked(select.selectionChanging.emit).mock.invocationCallOrder)).toBeLessThan(Math.min(...vi.mocked(select.closing.emit).mock.invocationCallOrder));
                expect(Math.min(...vi.mocked(select.closing.emit).mock.invocationCallOrder)).toBeLessThan(Math.min(...vi.mocked(select.closed.emit).mock.invocationCallOrder));

                args.oldSelection = selectedItem;
                selectedItem = select.items[9];
                args.newSelection = selectedItem;
                await navigateDropdownItems(spaceKeyEvent);
                expect(select.opening.emit).toHaveBeenCalledTimes(2);
                expect(select.opened.emit).toHaveBeenCalledTimes(2);
                expect(select.selectionChanging.emit).toHaveBeenCalledTimes(2);
                expect(select.selectItem).toHaveBeenCalledTimes(2);
                expect(select.closing.emit).toHaveBeenCalledTimes(2);
                expect(select.closed.emit).toHaveBeenCalledTimes(2);
                expect(select.close).toHaveBeenCalledTimes(2);
            });

            // it('should properly emit selecting event on value setting', async () => {
            //     spyOn(select.selectionChanging, 'emit');
            //     spyOn(select, 'selectItem').and.callThrough();

            //     select.value = select.items[4].value.toString();
            //     fixture.detectChanges();
            //     await fixture.whenStable();
            //     expect(select.selectionChanging.emit).toHaveBeenCalledTimes(1);
            //     expect(select.selectItem).toHaveBeenCalledTimes(1);
            //     expect(select.selectionChanging.emit).toHaveBeenCalledWith(null);

            //     select.value = 'Padua';
            //     fixture.detectChanges();
            //     expect(select.selectionChanging.emit).toHaveBeenCalledTimes(2);
            //     expect(select.selectItem).toHaveBeenCalledTimes(2);
            //     expect(select.selectionChanging.emit).toHaveBeenCalledWith(null);

            //     // selecting should not be fired when value is set to non-existing item
            //     select.value = 'Ghost city';
            //     fixture.detectChanges();
            //     expect(select.selectionChanging.emit).toHaveBeenCalledTimes(2);
            //     expect(select.selectItem).toHaveBeenCalledTimes(2);
            // });

            it('should properly emit selectionChanging event using selectItem method', () => {
                let selectedItem = select.items[4];
                vi.spyOn(select.selectionChanging, 'emit');
                const args: ISelectionEventArgs = {
                    oldSelection: <IgxDropDownItemBaseDirective>{},
                    newSelection: selectedItem,
                    cancel: false,
                    owner: select
                };

                select.selectItem(selectedItem);
                fixture.detectChanges();
                expect(select.selectionChanging.emit).toHaveBeenCalledTimes(1);
                expect(select.selectionChanging.emit).toHaveBeenCalledWith(args);

                args.oldSelection = selectedItem;
                selectedItem = select.items[14];
                args.newSelection = selectedItem;
                select.selectItem(selectedItem);
                fixture.detectChanges();
                expect(select.selectionChanging.emit).toHaveBeenCalledTimes(2);
                expect(select.selectionChanging.emit).toHaveBeenCalledWith(args);
            });

            it('should not emit selectionChanging when selection does not change', () => {
                const item = select.items[5];
                vi.spyOn(select.selectionChanging, 'emit');
                select.selectItem(item);
                expect(select.selectionChanging.emit).toHaveBeenCalledTimes(1);
                select.selectItem(item);
                expect(select.selectionChanging.emit).toHaveBeenCalledTimes(1);
                select.selectItem(item);
                expect(select.selectionChanging.emit).toHaveBeenCalledTimes(1);
                select.selectItem(item);
                expect(select.selectionChanging.emit).toHaveBeenCalledTimes(1);
            });

            it('should not select header items passed through selectItem method', () => {
                const item = select.items[5];
                vi.spyOn(select.selectionChanging, 'emit');
                expect(select.selectedItem).toBeFalsy();
                item.isHeader = true;
                select.selectItem(item);
                expect(select.selectedItem).toBeFalsy();
                expect(select.selectionChanging.emit).not.toHaveBeenCalled();
            });
        });

        describe('Using more complex select component', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxSelectGroupsComponent);
                select = fixture.componentInstance.select;
                fixture.detectChanges();
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST_SCROLL));
            });

            it('should populate the input with the specified selected item text @input, instead of the selected item element innerText', async () => {
                let selectedItemIndex = 1;
                const groupIndex = 0;
                const groupElement = selectList.children[groupIndex];
                const itemElementToSelect = groupElement.children[selectedItemIndex].nativeElement;

                const checkInputValue = () => {
                    expect(select.selectedItem.text).toEqual(select.input.value);
                    expect(inputElement.nativeElement.value.toString().trim()).toEqual(select.selectedItem.text);
                };

                // There is not a selected item initially
                const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
                expect(selectedItems.length).toEqual(0);
                expect(select.value).toBeNull();
                expect(select.input.value).toEqual('');
                expect(inputElement.nativeElement.value).toEqual('');

                // Select item - mouse click
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                itemElementToSelect.click();
                fixture.detectChanges();
                checkInputValue();

                // Select item - selectItem method
                selectedItemIndex = 2;
                select.selectItem(select.items[selectedItemIndex]);
                await fixture.whenStable();
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                checkInputValue();

                // Select item - item selected property
                selectedItemIndex = 3;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                checkInputValue();
            });

            it('Should populate the input with the selected item element innerText, when text @Input is undefined(not set)', async () => {
                const selectedItemIndex = 2;
                // const groupIndex = 0;
                // const groupElement = selectList.children[groupIndex];
                // const itemElementToSelect = groupElement.children[selectedItemIndex].nativeElement;
                const expectedInputText = 'Paris star';

                const checkInputValue = () => {
                    expect(select.selectedItem.itemText).toEqual(expectedInputText);
                    expect(select.selectedItem.itemText).toEqual(select.input.value);
                    expect(inputElement.nativeElement.value.toString().trim()).toEqual(select.selectedItem.itemText);
                };

                // Select item - no select-item text. Should set item;s element innerText as input value.
                (select.items[selectedItemIndex] as IgxSelectItemComponent).text = undefined;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                await fixture.whenStable();
                checkInputValue();
            });
        });
    });

    describe('Grouped items tests: ', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxSelectGroupsComponent);
            select = fixture.componentInstance.select;
            fixture.detectChanges();
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST_SCROLL));
        });

        it('should select group item and close dropdown with mouse click', async () => {
            const groupIndex = 0;
            const groupElement = selectList.children[groupIndex];
            const selectedItemIndex = 2;
            const selectedItemElement = groupElement.children[selectedItemIndex].nativeElement;

            select.toggle();
            await fixture.whenStable();
            fixture.detectChanges();
            selectedItemElement.click();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.input.value).toEqual(select.items[selectedItemIndex - 1].value);
            expect(select.value).toEqual(select.items[selectedItemIndex - 1].value);
            const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
            expect(selectedItems.length).toEqual(1);
            expect(selectedItemElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeTruthy();
            expect(select.selectedItem).toBe(select.items[selectedItemIndex - 1] as IgxSelectItemComponent);
            expect(select.items[selectedItemIndex - 1].selected).toBeTruthy();
            expect(select.collapsed).toBeTruthy();
        });

        it('should select group item on setting value property', async () => {
            const groupIndex = 1;
            const groupElement = selectList.children[groupIndex];
            const selectedItemIndex = 2;
            const selectedItemElement = groupElement.children[selectedItemIndex].nativeElement;
            const itemIndex = 4;

            select.value = select.items[itemIndex].value.toString();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.input.value).toEqual(select.items[itemIndex].value);
            expect(select.value).toEqual(select.items[itemIndex].value);
            const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
            expect(selectedItems.length).toEqual(1);
            expect(selectedItemElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeTruthy();
            expect(select.selectedItem).toBe(select.items[itemIndex] as IgxSelectItemComponent);
            expect(select.items[itemIndex].selected).toBeTruthy();
        });

        it('should not select on setting value property to group header', async () => {
            const groupIndex = 0;
            const groupElement = selectList.children[groupIndex].nativeElement;

            select.value = fixture.componentInstance.locations[groupIndex].continent;
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.input.value).toEqual('');
            const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
            expect(selectedItems.length).toEqual(0);
            expect(groupElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeFalsy();
            expect(select.selectedItem).toBeUndefined();
        });

        it('should not focus group header in dropdown if there is not selected item', async () => {
            const groupElement = selectList.children[0];
            const focusedItemIndex = 1;
            const focusedItemElement = groupElement.children[focusedItemIndex].nativeElement;

            select.toggle();
            await fixture.whenStable();
            fixture.detectChanges();
            const focusedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_FOCUSED_ITEM));
            expect(focusedItems.length).toEqual(1);
            expect(focusedItemElement.classList.contains(CSS_CLASS_FOCUSED_ITEM)).toBeTruthy();
            expect(select.focusedItem).toBe(select.items[0]);
            expect(select.items[0].focused).toBeTruthy();
            expect(groupElement.nativeElement.classList.contains(CSS_CLASS_FOCUSED_ITEM)).toBeFalsy();
        });
    });

    describe('Key navigation tests: ', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            select = fixture.componentInstance.select;
            fixture.detectChanges();
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST_SCROLL));
        });

        it('should toggle dropdown on ALT+ArrowUp/Down keys interaction', async () => {
            expect(select.collapsed).toBeTruthy();

            inputElement.triggerEventHandler('keydown', altArrowDownKeyEvent);
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            inputElement.triggerEventHandler('keydown', altArrowUpKeyEvent);
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        });

        it('should toggle dropdown on pressing ENTER key', async () => {
            expect(select.collapsed).toBeTruthy();

            inputElement.triggerEventHandler('keydown', enterKeyEvent);
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            inputElement.triggerEventHandler('keydown', enterKeyEvent);
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        });

        it('should toggle dropdown on pressing SPACE key', async () => {
            expect(select.collapsed).toBeTruthy();

            inputElement.triggerEventHandler('keydown', spaceKeyEvent);
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            inputElement.triggerEventHandler('keydown', spaceKeyEvent);
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        });

        it('should close dropdown on pressing ESC/TAB/SHIFT+TAB key', async () => {
            expect(select.collapsed).toBeTruthy();

            select.toggle();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            inputElement.triggerEventHandler('keydown', escapeKeyEvent);
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();

            select.toggle();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
            inputElement.triggerEventHandler('keydown', tabKeyEvent);
            inputElement.nativeElement.dispatchEvent(new Event('blur'));
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();

            select.toggle();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
            inputElement.triggerEventHandler('keydown', shiftTabKeysEvent);
            inputElement.nativeElement.dispatchEvent(new Event('blur'));
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        });

        it('should properly emit opening/closing events on ALT+ArrowUp/Down keys interaction', async () => {
            vi.spyOn(select.opening, 'emit');
            vi.spyOn(select.opened, 'emit');
            vi.spyOn(select.closing, 'emit');
            vi.spyOn(select.closed, 'emit');
            vi.spyOn(select, 'toggle');
            vi.spyOn(select, 'open');
            vi.spyOn(select, 'close');

            inputElement.triggerEventHandler('keydown', altArrowDownKeyEvent);
            await fixture.whenStable();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 0, 1);

            inputElement.triggerEventHandler('keydown', altArrowUpKeyEvent);
            await fixture.whenStable();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 1, 2);
        });

        it('should properly emit opening/closing events on ENTER/ESC key interaction', async () => {
            vi.spyOn(select.opening, 'emit');
            vi.spyOn(select.opened, 'emit');
            vi.spyOn(select.closing, 'emit');
            vi.spyOn(select.closed, 'emit');
            vi.spyOn(select, 'open');
            vi.spyOn(select, 'close');
            vi.spyOn(select, 'toggle');

            inputElement.triggerEventHandler('keydown', enterKeyEvent);
            await fixture.whenStable();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 0, 0);

            inputElement.triggerEventHandler('keydown', escapeKeyEvent);
            await fixture.whenStable();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 1, 0);
        });

        it('should properly emit opening/closing events on SPACE/ESC key interaction', async () => {
            vi.spyOn(select.opening, 'emit');
            vi.spyOn(select.opened, 'emit');
            vi.spyOn(select.closing, 'emit');
            vi.spyOn(select.closed, 'emit');
            vi.spyOn(select, 'open');
            vi.spyOn(select, 'close');
            vi.spyOn(select, 'toggle');

            inputElement.triggerEventHandler('keydown', spaceKeyEvent);
            await fixture.whenStable();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 0, 0);

            inputElement.triggerEventHandler('keydown', escapeKeyEvent);
            await fixture.whenStable();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 1, 0);
        });

        it('should navigate through dropdown items using Up/Down/Home/End keys', () => {
            let currentItemIndex = 0;
            select.toggle();
            fixture.detectChanges();

            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            fixture.detectChanges();
            currentItemIndex++;
            verifyFocusedItem(currentItemIndex);

            currentItemIndex++;
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            fixture.detectChanges();
            verifyFocusedItem(currentItemIndex);

            currentItemIndex = select.items.length - 1;
            inputElement.triggerEventHandler('keydown', endKeyEvent);
            fixture.detectChanges();
            verifyFocusedItem(currentItemIndex);

            currentItemIndex--;
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            fixture.detectChanges();
            verifyFocusedItem(currentItemIndex);

            currentItemIndex--;
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            fixture.detectChanges();
            verifyFocusedItem(currentItemIndex);

            currentItemIndex = 0;
            inputElement.triggerEventHandler('keydown', homeKeyEvent);
            fixture.detectChanges();
            verifyFocusedItem(currentItemIndex);
        });

        it('should navigate through items skipping the disabled ones when dropdown is opened', () => {
            let focusedItemIndex = 1;
            select.items[0].disabled = true;
            select.items[2].disabled = true;
            select.items[3].disabled = true;
            select.items[select.items.length - 1].disabled = true;
            fixture.detectChanges();

            select.toggle();
            fixture.detectChanges();
            verifyFocusedItem(focusedItemIndex);

            // Skip two disabled items
            focusedItemIndex = 4;
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            fixture.detectChanges();
            verifyFocusedItem(focusedItemIndex);

            // Focus the element before the last one as it is disabled
            focusedItemIndex = select.items.length - 2;
            inputElement.triggerEventHandler('keydown', endKeyEvent);
            fixture.detectChanges();
            verifyFocusedItem(focusedItemIndex);

            focusedItemIndex--;
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            fixture.detectChanges();
            verifyFocusedItem(focusedItemIndex);

            // Home key should focus second item since the first one is disabled
            focusedItemIndex = 1;
            inputElement.triggerEventHandler('keydown', homeKeyEvent);
            fixture.detectChanges();
            verifyFocusedItem(focusedItemIndex);
        });

        it('should navigate and select items skipping the disabled ones when dropdown is closed', () => {
            let selectedItemIndex = 1;
            select.items[0].disabled = true;
            select.items[2].disabled = true;
            select.items[3].disabled = true;
            select.items[select.items.length - 1].disabled = true;
            fixture.detectChanges();

            inputElement.nativeElement.focus();
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            fixture.detectChanges();

            verifySelectedItem(selectedItemIndex);

            // Skip two disabled items
            selectedItemIndex = 4;
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            fixture.detectChanges();

            verifySelectedItem(selectedItemIndex);

            // Select item before the last one
            selectedItemIndex = select.items.length - 2;
            select.toggle();
            fixture.detectChanges();
            selectList.children[selectedItemIndex].nativeElement.click();
            fixture.detectChanges();

            // The item before the last one should remain selected
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            fixture.detectChanges();

            verifySelectedItem(selectedItemIndex);
        });

        it('should start navigation from selected item when dropdown is opened', async () => {
            let selectedItem = select.items[4];
            let focusedItemIndex = selectedItem.index + 1;

            select.items[4].selected = true;
            fixture.detectChanges();

            select.toggle();
            await fixture.whenStable();
            fixture.detectChanges();

            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            await fixture.whenStable();
            fixture.detectChanges();
            expect(selectedItem.selected).toBeTruthy();
            verifyFocusedItem(focusedItemIndex);

            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            inputElement.triggerEventHandler('keydown', enterKeyEvent);
            fixture.detectChanges();

            select.toggle();
            await fixture.whenStable();
            fixture.detectChanges();

            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            await fixture.whenStable();
            fixture.detectChanges();
            selectedItem = select.items[7];
            focusedItemIndex = selectedItem.index - 1;
            verifyFocusedItem(focusedItemIndex);
        });

        it('should start navigation from selected item when dropdown is closed', () => {
            let selectedItemIndex = 4;
            select.items[selectedItemIndex].selected = true;
            fixture.detectChanges();

            inputElement.nativeElement.focus();
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            fixture.detectChanges();
            verifySelectedItem(++selectedItemIndex);

            selectedItemIndex = select.items.length - 1;
            select.items[selectedItemIndex].selected = true;

            // Does not wrap selection - arrow down stays on the last item if selected
            fixture.detectChanges();
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);

            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);

            fixture.detectChanges();
            verifySelectedItem(--selectedItemIndex);
            // Does not wrap selection - arrow up stays on the first item if selected
            selectedItemIndex = 0;
            select.items[selectedItemIndex].selected = true;

            fixture.detectChanges();
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);

            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);
        });

        it('should navigate through items using Up/Down keys until there are items when dropdown is opened', () => {
            select.toggle();
            fixture.detectChanges();

            for (let focusedItemIndex = 1; focusedItemIndex < select.items.length; focusedItemIndex++) {
                inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                fixture.detectChanges();
                verifyFocusedItem(focusedItemIndex);
            }

            // Verify the focus stays on the last item
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            fixture.detectChanges();
            verifyFocusedItem(select.items.length - 1);

            for (let focusedItemIndex = select.items.length - 2; focusedItemIndex > -1; focusedItemIndex--) {
                inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
                fixture.detectChanges();
                verifyFocusedItem(focusedItemIndex);
            }

            // Verify the focus stays on the first item
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            fixture.detectChanges();
            verifyFocusedItem(0);
        });

        it('should navigate through items using Up/Down keys until there are items when dropdown is closed', () => {
            for (let itemIndex = 0; itemIndex < select.items.length; itemIndex++) {
                inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                fixture.detectChanges();
                verifySelectedItem(itemIndex);
            }

            // Verify the last item remains selected
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            fixture.detectChanges();
            verifySelectedItem(select.items.length - 1);

            for (let itemIndex = select.items.length - 2; itemIndex > -1; itemIndex--) {
                inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
                fixture.detectChanges();
                verifySelectedItem(itemIndex);
            }

            // Verify the first item remains selected
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            fixture.detectChanges();
            verifySelectedItem(0);
        });

        it('should filter and navigate through items on character key navigation when dropdown is opened', async () => {
            useFakeClock();
            select.open();
            fixture.detectChanges();

            const filteredItemsInxs = fixture.componentInstance.filterCities('pa');
            for (const item of filteredItemsInxs) {
                inputElement.triggerEventHandler('keydown', { key: 'p' });
                await fixture.whenStable();
                fixture.detectChanges();
                inputElement.triggerEventHandler('keydown', { key: 'a' });
                await fixture.whenStable();
                fixture.detectChanges();
                verifyFocusedItem(item);
                await advance(fixture, TYPE_AHEAD_RESET_TIME);
                fixture.detectChanges();
            }
        });

        it('Character key navigation when dropdown is opened should be case insensitive', async () => {
            useFakeClock();
            select.open();
            fixture.detectChanges();

            const filteredItemsInxs = fixture.componentInstance.filterCities('l');
            inputElement.triggerEventHandler('keydown', { key: 'l' });
            await fixture.whenStable();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[0]);
            await advance(fixture, TYPE_AHEAD_RESET_TIME);
            fixture.detectChanges();

            inputElement.triggerEventHandler('keydown', { key: 'L' });
            await fixture.whenStable();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[1]);
        });

        it('Character key navigation when dropdown is opened should wrap selection', async () => {
            useFakeClock();
            select.open();
            fixture.detectChanges();

            const filteredItemsInxs = fixture.componentInstance.filterCities('l');
            for (const item of filteredItemsInxs) {
                inputElement.triggerEventHandler('keydown', { key: 'l' });
                await fixture.whenStable();
                fixture.detectChanges();
                verifyFocusedItem(item);
                await advance(fixture, TYPE_AHEAD_RESET_TIME);
                fixture.detectChanges();
            }
            // Navigate back to the first filtered item to verify that selection is wrapped
            inputElement.triggerEventHandler('keydown', { key: 'l' });
            await fixture.whenStable();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[0]);

        });

        it('should filter and navigate items properly when pressing non-english character', async () => {
            useFakeClock();
            fixture.componentInstance.items = [
                'Berlin',
                'Ãœberherrn',
                'Ð¡Ð¾Ñ„Ð¸Ñ',
                'MÃ¼nchen',
                'Ãœberlingen',
                'Stuttgart',
                'Ð¡Ð¼Ð¾Ð»ÑÐ½',
                'Ãœbersee',
                'Ð‘ÑƒÑ€Ð³Ð°Ñ',
                'Karlsruhe',
                'Ã–stringen'
            ];
            fixture.detectChanges();
            select.open();
            fixture.detectChanges();

            // German characters
            let filteredItemsInxs = fixture.componentInstance.filterCities('Ã¼');
            for (const item of filteredItemsInxs) {
                inputElement.triggerEventHandler('keydown', { key: 'Ã¼' });
                await fixture.whenStable();
                fixture.detectChanges();
                verifyFocusedItem(item);
                await advance(fixture, TYPE_AHEAD_RESET_TIME);
                fixture.detectChanges();
            }

            // Cyrillic characters
            filteredItemsInxs = fixture.componentInstance.filterCities('Ñ');
            for (const item of filteredItemsInxs) {
                inputElement.triggerEventHandler('keydown', { key: 'Ñ' });
                await fixture.whenStable();
                fixture.detectChanges();
                verifyFocusedItem(item);
                await advance(fixture, TYPE_AHEAD_RESET_TIME);
                fixture.detectChanges();
            }
        });

        it('should not change focus when pressing non-matching character and dropdown is opened', async () => {
            useFakeClock();
            select.open();
            await fixture.whenStable();
            fixture.detectChanges();

            const filteredItemsInxs = fixture.componentInstance.filterCities('l');
            inputElement.triggerEventHandler('keydown', { key: 'l' });
            await fixture.whenStable();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[0]);
            await advance(fixture, TYPE_AHEAD_RESET_TIME);
            fixture.detectChanges();

            // Verify that focus is unchanged
            inputElement.triggerEventHandler('keydown', { key: 'w' });
            await fixture.whenStable();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[0]);

        });

        it('should filter and select items on character key navigation when dropdown is closed', async () => {
            useFakeClock();
            const filteredItemsInxs = fixture.componentInstance.filterCities('pa');
            for (const item of filteredItemsInxs) {
                inputElement.triggerEventHandler('keydown', { key: 'p' });
                await fixture.whenStable();
                fixture.detectChanges();
                inputElement.triggerEventHandler('keydown', { key: 'a' });
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(item);
                await advance(fixture, TYPE_AHEAD_RESET_TIME);
                fixture.detectChanges();
            }
        });

        it('character key navigation when dropdown is closed should be case insensitive', async () => {
            useFakeClock();
            const filteredItemsInxs = fixture.componentInstance.filterCities('l');
            inputElement.triggerEventHandler('keydown', { key: 'l' });
            await fixture.whenStable();
            fixture.detectChanges();
            verifySelectedItem(filteredItemsInxs[0]);
            await advance(fixture, TYPE_AHEAD_RESET_TIME);
            fixture.detectChanges();

            inputElement.triggerEventHandler('keydown', { key: 'L' });
            await fixture.whenStable();
            fixture.detectChanges();
            verifySelectedItem(filteredItemsInxs[1]);

        });

        it('character key navigation when dropdown is closed should wrap selection', async () => {
            useFakeClock();
            const filteredItemsInxs = fixture.componentInstance.filterCities('l');
            for (const item of filteredItemsInxs) {
                inputElement.triggerEventHandler('keydown', { key: 'l' });
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(item);
                await advance(fixture, TYPE_AHEAD_RESET_TIME);
                fixture.detectChanges();
            }
            // Navigate back to the first filtered item to verify that selection is wrapped
            inputElement.triggerEventHandler('keydown', { key: 'l' });
            await fixture.whenStable();
            fixture.detectChanges();
            verifySelectedItem(filteredItemsInxs[0]);

        });

        it('should filter and select items properly when pressing non-english characters', async () => {
            useFakeClock();
            fixture.componentInstance.items = [
                'Berlin',
                'Ãœberherrn',
                'Ð¡Ð¾Ñ„Ð¸Ñ',
                'MÃ¼nchen',
                'Ãœberlingen',
                'Stuttgart',
                'Ð¡Ð¼Ð¾Ð»ÑÐ½',
                'Ãœbersee',
                'Ð‘ÑƒÑ€Ð³Ð°Ñ',
                'Karlsruhe',
                'Ã–stringen'
            ];
            fixture.detectChanges();

            // German characters
            let filteredItemsInxs = fixture.componentInstance.filterCities('Ã¼');
            for (const item of filteredItemsInxs) {
                inputElement.triggerEventHandler('keydown', { key: 'Ã¼' });
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(item);
                await advance(fixture, TYPE_AHEAD_RESET_TIME);
                fixture.detectChanges();
            }

            // Cyrillic characters
            filteredItemsInxs = fixture.componentInstance.filterCities('Ñ');
            for (const item of filteredItemsInxs) {
                inputElement.triggerEventHandler('keydown', { key: 'Ñ' });
                await fixture.whenStable();
                fixture.detectChanges();
                verifySelectedItem(item);
                await advance(fixture, TYPE_AHEAD_RESET_TIME);
                fixture.detectChanges();
            }
        });

        it('should not change selection when pressing non-matching character and dropdown is closed', async () => {
            useFakeClock();
            const filteredItemsInxs = fixture.componentInstance.filterCities('l');
            inputElement.triggerEventHandler('keydown', { key: 'l' });
            await fixture.whenStable();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[0]);
            await advance(fixture, TYPE_AHEAD_RESET_TIME);
            fixture.detectChanges();

            // Verify that selection is unchanged
            inputElement.triggerEventHandler('keydown', { key: 'q' });
            await fixture.whenStable();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[0]);
            await advance(fixture, TYPE_AHEAD_RESET_TIME);
            fixture.detectChanges();

            inputElement.triggerEventHandler('keydown', { key: 'l' });
            await fixture.whenStable();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[1]);

        });

        it('Should navigate through items when dropdown is closed and initial value is passed', async () => {
            select.close();
            fixture.detectChanges();
            vi.spyOn(select, 'navigateNext');
            const choices = select.children.toArray();
            select.value = choices[5].value;
            fixture.detectChanges();
            select.input.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            fixture.detectChanges();
            expect(select.navigateNext).toHaveBeenCalled();
            expect(select.value).toEqual(choices[6].value);
        });
    });
    describe('Positioning tests: ', () => {
        describe('IgxSelectOverlapPositionStrategy positioning tests: ', () => {
        const defaultWindowToListOffset = 16;
        const defaultItemLeftPadding = 24;
        const defaultItemTopPadding = 0;
        const defaultItemBottomPadding = 0;
        const defItemFontSize = 14;
        const defInputFontSize = 16;
        let selectedItemIndex: number;
        let listRect: DOMRect;
        let inputRect: DOMRect;
        let selectedItemRect: DOMRect;
        let listTop: number;

        const getBoundingRectangles = () => {
            listRect = selectList.nativeElement.getBoundingClientRect();
            inputRect = inputElement.nativeElement.getBoundingClientRect();
            selectedItemRect = select.items[selectedItemIndex].element.nativeElement.getBoundingClientRect();
        };
        // Verifies that the selected item bounding rectangle is positioned over the input bounding rectangle
        const verifySelectedItemPositioning = (reversed = false) => {
            expect(selectedItemRect.left).toBeCloseTo(inputRect.left - defaultItemLeftPadding, 0);
            const expectedInputItemFontTop = reversed
                ? document.body.getBoundingClientRect().bottom - defaultWindowToListOffset - selectedItemRect.height
                : inputRect.top + defaultItemTopPadding
                    + (inputRect.height - defaultItemBottomPadding - defaultItemTopPadding - defInputFontSize) / 2;
            const expectedSelectItemFontTop = selectedItemRect.top + (selectedItemRect.height - defItemFontSize) / 2;
            expect(Math.abs(expectedSelectItemFontTop - expectedInputItemFontTop)).toBeLessThan(2);
        };
        const verifyListPositioning = () => {
            expect(listRect.left).toBeCloseTo(inputRect.left - defaultItemLeftPadding, 0);
            // check with precision of 2 digits after decimal point, as it is the meaningful portion anyways.
            expect(listRect.top).toBeCloseTo(listTop, 2);
        };

        describe('Ample space to open positioning tests: ', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxSelectMiddleComponent);
                select = fixture.componentInstance.select;
                fixture.detectChanges();
                select.overlaySettings = { positionStrategy: new IgxSelectOverlapPositionStrategy(select) };
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST_SCROLL));
                addScrollDivToElement(fixture.nativeElement);
            });

            it('should display selected item over input and all other items without scroll', async () => {
                selectedItemIndex = 1;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height;
                verifyListPositioning();

                selectedItemIndex = 2;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height * 2;
                verifyListPositioning();

                selectedItemIndex = 0;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top;
                verifyListPositioning();
            });

            it('should scroll and display selected item over input and all other possible items', async () => {
                fixture.componentInstance.items = [
                    'Option 1',
                    'Option 2',
                    'Option 3',
                    'Option 4',
                    'Option 5',
                    'Option 6',
                    'Option 7',
                    'Option 8',
                    'Option 9',
                    'Option 10'
                ];
                fixture.detectChanges();

                selectedItemIndex = 0;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();

                selectedItemIndex = 5;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();

                selectedItemIndex = 9;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();
            });
        });

        describe('Not enough space above to open positioning tests: ', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxSelectTopComponent);
                select = fixture.componentInstance.select;
                fixture.detectChanges();
                select.overlaySettings = { positionStrategy: new IgxSelectOverlapPositionStrategy(select) };
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST_SCROLL));
            });

            it('should display selected item over input when first item is selected', async () => {
                selectedItemIndex = 0;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();
            });

            it('should display selected item over input and possible items above and below when item in the middle of the list is selected', 
            // there is enough scroll left in scroll container so the dropdown is NOT REPOSITIONED below the input
            async () => {
                selectedItemIndex = 3;
                select.items[selectedItemIndex].selected = true;
                (select.element as HTMLElement).style.marginTop = '10px';
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                (select.element as HTMLElement).parentElement.style.marginTop = '10px';
                fixture.detectChanges();
            });

            it('should display selected item and all possible items above when last item is selected', 
            // there is NO enough scroll left in scroll container so the dropdown is REPOSITIONED below the input
            async () => {
                selectedItemIndex = 9;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                getBoundingRectangles();
            });
        });

        describe('Not enough space below to open positioning tests: ', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxSelectBottomComponent);
                select = fixture.componentInstance.select;
                fixture.detectChanges();
                select.overlaySettings = { positionStrategy: new IgxSelectOverlapPositionStrategy(select) };
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST_SCROLL));
            });

            it('should display list with selected item and all possible items after it when first item is selected', async () => {
                selectedItemIndex = 0;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                getBoundingRectangles();
            });
            it('should display selected item and all possible items above and below when item in the middle of the list is selected', 
            // there is NO enough scroll atop the scroll container so the dropdown is REPOSITIONED above the input
            async () => {
                selectedItemIndex = 3;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                getBoundingRectangles();
            });

            it(`should display selected item and all possible items above and position selected item over input
                when item is close to the end of the list is selected`, 
            // there is enough scroll left in scroll container so the dropdown is NOT REPOSITIONED above the input
            async () => {
                selectedItemIndex = 7;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                getBoundingRectangles();
            });
        });

        describe('Document bigger than the visible viewport tests: ', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxSelectMiddleComponent);
                fixture.detectChanges();
                select = fixture.componentInstance.select;
                select.overlaySettings = { positionStrategy: new IgxSelectOverlapPositionStrategy(select) };
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST_SCROLL));
                addScrollDivToElement(fixture.nativeElement);
            });

            it('should correctly reposition the items container when perform horizontal scroll', async () => {
                selectedItemIndex = 1;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                document.documentElement.scrollLeft += 50;
                document.dispatchEvent(new Event('scroll'));
                await fixture.whenStable();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height;
                verifyListPositioning();

                selectedItemIndex = 2;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                document.documentElement.scrollLeft += 50;
                document.dispatchEvent(new Event('scroll'));
                await fixture.whenStable();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height * 2;
                verifyListPositioning();

                selectedItemIndex = 0;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                document.documentElement.scrollLeft += 50;
                document.dispatchEvent(new Event('scroll'));
                await fixture.whenStable();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top;
                verifyListPositioning();
            });

            it('should correctly reposition the items container when perform vertical scroll', async () => {
                selectedItemIndex = 1;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                document.documentElement.scrollTop += 20;
                document.dispatchEvent(new Event('scroll'));
                await fixture.whenStable();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height;
                verifyListPositioning();

                selectedItemIndex = 2;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                document.documentElement.scrollTop += 20;
                document.dispatchEvent(new Event('scroll'));
                await fixture.whenStable();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height * 2;
                verifyListPositioning();

                selectedItemIndex = 0;
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                document.documentElement.scrollTop += 20;
                document.dispatchEvent(new Event('scroll'));
                await fixture.whenStable();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top;
                verifyListPositioning();
            });
        });
        }); // end IgxSelectOverlapPositionStrategy positioning tests

        describe('AutoPositionStrategy positioning tests: ', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxSelectSimpleComponent);
                select = fixture.componentInstance.select;
                fixture.detectChanges();
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST_SCROLL));
            });

            it('should open and close correctly using the default AutoPositionStrategy', async () => {
                expect((select as any)._overlayDefaults.positionStrategy).toBeInstanceOf(AutoPositionStrategy);
                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                expect(select.collapsed).toBeFalsy();

                select.toggle();
                await fixture.whenStable();
                fixture.detectChanges();
                expect(select.collapsed).toBeTruthy();
            });
        });
    });
    describe('EditorProvider', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
        });

        it('Should return correct edit element', () => {
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT)).nativeElement;
            const selectInstance = fixture.componentInstance.select;
            expect(selectInstance.getEditElement()).toEqual(inputElement);
        });
    });
    describe('Header & Footer', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxSelectHeaderFooterComponent);
            fixture.detectChanges();
            select = fixture.componentInstance.select;
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST_SCROLL));
            selectListWrapper = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
        });

        it('Should render header and footer elements where expected', () => {
            const selectHeader = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_SELECT_HEADER));
            const selectFooter = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_SELECT_FOOTER));
            // elements exist
            expect(selectHeader).toBeDefined();
            expect(selectFooter).toBeDefined();
            // elements structure is correct
            expect(selectListWrapper.nativeElement.firstElementChild.classList.contains(CSS_CLASS_DROPDOWN_SELECT_HEADER)).toBe(true);
            expect(selectListWrapper.nativeElement.lastElementChild.classList.contains(CSS_CLASS_DROPDOWN_SELECT_FOOTER)).toBe(true);
            expect(selectList.nativeElement.previousElementSibling.classList.contains(CSS_CLASS_DROPDOWN_SELECT_HEADER)).toBe(true);
            expect(selectList.nativeElement.nextElementSibling.classList.contains(CSS_CLASS_DROPDOWN_SELECT_FOOTER)).toBe(true);
        });

        it('Should NOT render header and footer elements, if template is not defined', async () => {
            select.headerTemplate = null;
            select.footerTemplate = null;
            fixture.detectChanges();
            await fixture.whenStable();
            const selectHeader = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_SELECT_HEADER));
            const selectFooter = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_SELECT_FOOTER));
            // elements do not exist
            expect(selectHeader).toBeNull();
            expect(selectFooter).toBeNull();
            // elements structure is correct
            expect(selectListWrapper.nativeElement.firstElementChild.classList.contains(CSS_CLASS_DROPDOWN_LIST_SCROLL)).toBe(true);
            expect(selectListWrapper.nativeElement.lastElementChild.classList.contains(CSS_CLASS_DROPDOWN_LIST_SCROLL)).toBe(true);
            expect(selectList.nativeElement.previousElementSibling).toBeNull();
            expect(selectList.nativeElement.nextElementSibling).toBeNull();
        });
    });
    describe('Test CDR - Expression changed after it was checked', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxSelectCDRComponent);
            fixture.detectChanges();
        });

        it('Should NOT throw console Warning for "Expression changed after it was checked"', () => {
            let selectCDR = fixture.componentInstance.select;

            expect(selectCDR).toBeDefined();
            expect(selectCDR.value).toBe('ID');

            fixture.componentInstance.render = !fixture.componentInstance.render;
            fixture.detectChanges();
            selectCDR = fixture.componentInstance.select;
            expect(selectCDR).toBeUndefined();

            fixture.componentInstance.render = !fixture.componentInstance.render;
            fixture.detectChanges();
            selectCDR = fixture.componentInstance.select;
            expect(selectCDR).toBeDefined();
            expect(selectCDR.value).toBe('ID');
        });
    });
    describe('Input with input group directives - hint, label, prefix, suffix: ', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxSelectAffixComponent);
            select = fixture.componentInstance.select;
            fixture.detectChanges();
        });

        it('should not open dropdown on hint container click', async () => {
            const hint = fixture.debugElement.query(By.directive(IgxHintDirective));
            const hintContainer: HTMLElement = hint.nativeElement.parentElement;

            expect(select.collapsed).toBeTruthy();
            hintContainer.click();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        });

        it('should not open dropdown on hint element click', () => {
            const hint = fixture.debugElement.query(By.directive(IgxHintDirective));
            expect(select.collapsed).toBeTruthy();
            hint.nativeElement.click();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        });
    });

    describe('Zoneless state updates', () => {
        beforeEach(async () => {
            TestBed.resetTestingModule();
            await TestBed.configureTestingModule({
                imports: [NoopAnimationsModule, IgxSelectComponent],
                providers: [provideZonelessChangeDetection()]
            }).compileComponents();
            fixture = TestBed.createComponent(IgxSelectComponent);
            select = fixture.componentInstance;
            await fixture.whenStable();
        });

        afterEach(() => {
            fixture.destroy();
            // The select overwrites the host id, so TestBed can't remove it.
            fixture.nativeElement.remove();
        });

        it('should render a disabled state set through the forms API without forced change detection', async () => {
            select.setDisabledState(true);
            await fixture.whenStable();
            expect(select.getEditElement().disabled).toBe(true);

            select.setDisabledState(false);
            await fixture.whenStable();
            expect(select.getEditElement().disabled).toBe(false);
        });

        it('should render a placeholder changed through its property without forced change detection', async () => {
            select.placeholder = 'Pick a city';
            await fixture.whenStable();
            expect(select.getEditElement().getAttribute('placeholder')).toBe('Pick a city');
        });

        it('should hand an id set from code to its toggle', async () => {
            select.id = 'code-select';
            await fixture.whenStable();

            const toggle = fixture.debugElement.query(By.directive(IgxToggleDirective)).injector.get(IgxToggleDirective);
            expect(toggle.id).toBe('code-select');
        });
    });

    describe('Zoneless item selection', () => {
        beforeEach(async () => {
            TestBed.resetTestingModule();
            await TestBed.configureTestingModule({
                imports: [NoopAnimationsModule, SignalStateSelectComponent],
                providers: [provideZonelessChangeDetection()]
            }).compileComponents();
            fixture = TestBed.createComponent(SignalStateSelectComponent);
            select = fixture.componentInstance.select;
            await fixture.whenStable();
        });

        it('should render the selected item after a programmatic value change', async () => {
            select.value = 'Varna';
            await fixture.whenStable();

            const [first, second] = select.items.map(item => item.element.nativeElement as HTMLElement);
            expect(second.getAttribute('aria-selected')).toBe('true');
            expect(second.classList.contains('igx-drop-down__item--selected')).toBe(true);
            expect(first.getAttribute('aria-selected')).toBe('false');
        });

        it('should keep the reactive links of its items when the selection changes', async () => {
            // Reads the selected state of every item, as their bindings do in the view that declares them.
            const selected = computed(() => select.items.map(item => item.selected));
            const links = () => {
                const all = new Set<unknown>();
                for (let link = (selected[SIGNAL] as ReactiveNode).producers; link; link = link.nextProducer) {
                    all.add(link);
                }
                return all;
            };
            expect(selected()).toEqual([false, false]);
            const before = links();
            expect(before.size).toBeGreaterThan(0);

            select.value = 'Varna';
            await fixture.whenStable();
            expect(selected()).toEqual([false, true]);

            // The change notifies the reader through the selection's version. A new version would
            // make it re-create every link it made after reading the version, on every selection.
            expect([...links()].filter(link => !before.has(link)).length).toBe(0);
        });

        // These calls read the selection they then write. Made from an effect, they must not make
        // it depend on that selection, or it would run again for as long as it makes them.
        const selectionCalls: [string, (target: IgxSelectComponent) => void, string | undefined][] = [
            ['the value setter', target => target.value = 'Varna', 'Varna'],
            ['writeValue', target => target.writeValue('Varna'), 'Varna'],
            ['selectItem', target => target.selectItem(target.items[1]), 'Varna'],
            ['setSelectedItem', target => target.setSelectedItem(1), 'Varna'],
            ['clearSelection', target => target.clearSelection(), undefined]
        ];
        for (const [description, call, selected] of selectionCalls) {
            it(`should run an effect that calls ${description} once`, async () => {
                select.value = 'Sofia';
                await fixture.whenStable();

                expect(await countEffectRuns(() => call(select))).toBe(1);
                expect(select.selectedItem?.value).toBe(selected);
            });
        }

        it('should run a view effect that sets the value once', async () => {
            expect(await countEffectRuns(() => select.value = 'Varna', fixture.componentRef.injector)).toBe(1);
            expect(select.items[1].element.nativeElement.getAttribute('aria-selected')).toBe('true');
        });

        it('should not run an effect that opened it again when the user moves the focus and picks an item', async () => {
            // open() reads the selection and the focus. An effect that depends on them would move
            // the focus back to the first item and reopen the list after the pick.
            const input = select.getEditElement();
            expect(await countEffectRuns(() => select.open(), undefined, async () => {
                UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input);
                await fixture.whenStable();
                UIInteractions.triggerKeyDownEvtUponElem('Enter', input);
            })).toBe(1);
            expect(select.value).toBe('Varna');
            expect(select.collapsed).toBe(true);
        });

        it('should not run an effect that navigated to the first item again when the selection changes', async () => {
            // While the select is closed, its navigation starts from the selected item it reads.
            select.value = 'Sofia';
            await fixture.whenStable();

            expect(await countEffectRuns(() => select.navigateFirst(), undefined, () => select.value = 'Varna')).toBe(1);
        });

        it('should let a subclass read the focused item as before', async () => {
            select.navigateItem(1);
            await fixture.whenStable();

            expect(IgxSelectSubclassProbe.prototype.focusedItemText.call(select)).toBe('Varna');
        });
    });

    // Renders a host whose select is its `select` member, zoneless, with the providers a test adds.
    const createZoneless = async <T>(host: new (...args: any[]) => T, providers: (Provider | EnvironmentProviders)[] = []) => {
        TestBed.resetTestingModule();
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, host],
            providers: [provideZonelessChangeDetection(), ...providers]
        }).compileComponents();
        fixture = TestBed.createComponent(host);
        select = fixture.componentInstance.select;
        await fixture.whenStable();
    };

    describe('Zoneless projected content', () => {
        afterEach(() => {
            fixture.destroy();
            // The select overwrites the host id, so TestBed can't remove it.
            fixture.nativeElement.remove();
        });

        // The hosts are declared further down the file, so resolve them when the test runs.
        for (const [description, host] of [
            ['its text input', () => SelectItemTextComponent],
            ['its content', () => SelectItemContentComponent]
        ] as const) {
            it(`should show the new label of the selected item when ${description} changes`, async () => {
                await createZoneless<SelectItemTextComponent>(host());
                fixture.componentInstance.value.set(1);
                await fixture.whenStable();
                expect(select.getEditElement().value).toBe('First');

                fixture.componentInstance.label.set('Renamed');
                await fixture.whenStable();

                expect(select.selectedItem.itemText).toBe('Renamed');
                expect(select.getEditElement().value).toBe('Renamed');
            });
        }

        it('should apply a prefix and render a hint projected after initialization', async () => {
            await createZoneless(SelectLateContentComponent);
            const group = () => fixture.nativeElement.querySelector('igx-input-group') as HTMLElement;
            expect(group().classList.contains('igx-input-group--prefixed')).toBe(false);

            fixture.componentInstance.showPrefix.set(true);
            await fixture.whenStable();
            expect(group().classList.contains('igx-input-group--prefixed')).toBe(true);

            fixture.componentInstance.showHint.set(true);
            await fixture.whenStable();
            expect(fixture.nativeElement.querySelector('.igx-input-group__hint')?.textContent).toContain('Pick one');
        });

        it('should apply a prefix projected from the start once its host renders again', async () => {
            // With no value, nothing in the projected content changes after the first render.
            await createZoneless(SelectLabelPrefixComponent);

            fixture.componentInstance.caption.set('Destination city');
            await fixture.whenStable();

            const group = fixture.nativeElement.querySelector('igx-input-group') as HTMLElement;
            expect(group.classList.contains('igx-input-group--prefixed')).toBe(true);
        });

        it('should point aria-labelledby at its projected label after the label id changes', async () => {
            await createZoneless(SelectLabelPrefixComponent);
            const listbox = fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement;
            expect(select.getEditElement().getAttribute('aria-labelledby')).toBe('city-label-1');

            fixture.componentInstance.labelId.set('city-label-2');
            await fixture.whenStable();

            expect(fixture.nativeElement.querySelector('label').id).toBe('city-label-2');
            expect(select.getEditElement().getAttribute('aria-labelledby')).toBe('city-label-2');
            expect(listbox.getAttribute('aria-labelledby')).toBe('city-label-2');
        });

        it('should render group state and labels changed through their public properties', async () => {
            await createZoneless(SelectGroupStateComponent);
            const group = fixture.componentInstance.group as IgxSelectGroupComponent;
            const groupElement = fixture.debugElement.query(By.directive(IgxSelectGroupComponent)).nativeElement as HTMLElement;
            // Unlike the drop-down, the select renders its items while it is closed.
            const itemsDisabled = () => select.items.map(item => item.element.nativeElement.getAttribute('aria-disabled'));
            expect(itemsDisabled()).toEqual(['false', 'false']);

            group.disabled = true;
            group.label = 'Unavailable';
            await fixture.whenStable();

            expect(groupElement.getAttribute('aria-disabled')).toBe('true');
            expect(groupElement.querySelector('label').textContent).toBe('Unavailable');
            expect(itemsDisabled()).toEqual(['true', 'true']);

            group.disabled = false;
            await fixture.whenStable();
            expect(groupElement.getAttribute('aria-disabled')).toBe('false');
            expect(itemsDisabled()).toEqual(['false', 'false']);
        });
    });

    describe('Zoneless theme and icon changes', () => {
        const arrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 8l8 8 8-8z"/></svg>';
        const groupClasses = () => select.inputGroup.element.nativeElement.classList;
        const toggleIcon = () => fixture.nativeElement.querySelector('.igx-input-group__toggle-button igx-icon') as HTMLElement;

        it('should restyle its input group when the theme token changes', async () => {
            await createZoneless(SelectThemeComponent, [{ provide: THEME_TOKEN, useFactory: () => new ThemeToken('material') }]);
            expect(groupClasses().contains('igx-input-group--box')).toBe(true);

            TestBed.inject(THEME_TOKEN).set('fluent');
            await fixture.whenStable();

            expect(groupClasses().contains('igx-input-group--fluent')).toBe(true);
            expect(groupClasses().contains('igx-input-group--box')).toBe(false);
        });

        it('should restyle its input group when the CSS theme around it changes', async () => {
            await createZoneless(SelectThemeComponent);
            expect(groupClasses().contains('igx-input-group--box')).toBe(true);

            fixture.componentInstance.cssTheme.set('fluent');
            await fixture.whenStable();

            expect(groupClasses().contains('igx-input-group--fluent')).toBe(true);
            expect(groupClasses().contains('igx-input-group--box')).toBe(false);
        });

        it('should give its toggle icon the family of the icon its reference points to', async () => {
            await createZoneless(SelectThemeComponent);
            const icons = TestBed.inject(IgxIconService);
            expect(toggleIcon().classList.contains('material-icons')).toBe(true);

            icons.addSvgIconFromText('my-arrow', arrowSvg, 'my-icons');
            icons.setIconRef('input_expand', 'default', { name: 'my-arrow', family: 'my-icons' });
            await fixture.whenStable();

            expect(toggleIcon().classList.contains('my-icons')).toBe(true);
            expect(toggleIcon().classList.contains('material-icons')).toBe(false);
        });

        it('should show a toggle icon SVG that loads after the select renders', async () => {
            await createZoneless(SelectThemeComponent, [provideHttpClient(), provideHttpClientTesting()]);
            const icons = TestBed.inject(IgxIconService);
            icons.addSvgIcon('chevron-down', '/assets/chevron-down.svg', 'brand');
            icons.setIconRef('input_expand', 'default', { name: 'chevron-down', family: 'brand' });
            await fixture.whenStable();
            expect(toggleIcon().querySelector('svg')).toBeNull();

            TestBed.inject(HttpTestingController).expectOne('/assets/chevron-down.svg').flush(arrowSvg);
            // The SVG has to show when the host is checked again at the latest.
            fixture.componentInstance.caption.set('Destination city');
            await fixture.whenStable();

            expect(toggleIcon().querySelector('svg')).not.toBeNull();
        });
    });
});

describe('IgxSelect - Signal Forms', () => {
    let fixture: ComponentFixture<IgxSelectSignalFormComponent>;
    let select: IgxSelectComponent;
    let inputGroup: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, IgxSelectSignalFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IgxSelectSignalFormComponent);
        fixture.detectChanges();
        select = fixture.componentInstance.select;
        inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP)).nativeElement;
    });

    it('should initialize and reflect the required rule', () => {
        expect(inputGroup.classList.contains(CSS_CLASS_INPUT_GROUP_REQUIRED)).toBe(true);
        expect(select.input.nativeElement.getAttribute('aria-required')).toEqual('true');
        expect(select.input.valid).toEqual(IgxInputState.INITIAL);
    });

    it('should become invalid once touched without a value', () => {
        select.onBlur();
        fixture.detectChanges();
        expect(select.input.valid).toEqual(IgxInputState.INVALID);
        expect(inputGroup.classList.contains(CSS_CLASS_INPUT_GROUP_INVALID)).toBe(true);

        fixture.componentInstance.model.set({ option: 'Option 2' });
        fixture.detectChanges();
        select.onBlur();
        fixture.detectChanges();
        expect(select.value).toEqual('Option 2');
        expect(select.input.valid).toEqual(IgxInputState.INITIAL);
        expect(inputGroup.classList.contains(CSS_CLASS_INPUT_GROUP_INVALID)).toBe(false);
    });

    it('should follow the disabled rule', () => {
        fixture.componentInstance.isDisabled.set(true);
        fixture.detectChanges();
        expect(select.disabled).toBe(true);

        fixture.componentInstance.isDisabled.set(false);
        fixture.detectChanges();
        expect(select.disabled).toBe(false);
    });

    it('should follow a conditional required rule while the value stays valid', () => {
        fixture.componentInstance.model.set({ option: 'Option 2' });
        fixture.detectChanges();

        fixture.componentInstance.isRequired.set(false);
        fixture.detectChanges();
        expect(inputGroup.classList.contains(CSS_CLASS_INPUT_GROUP_REQUIRED)).toBe(false);

        fixture.componentInstance.isRequired.set(true);
        fixture.detectChanges();
        expect(inputGroup.classList.contains(CSS_CLASS_INPUT_GROUP_REQUIRED)).toBe(true);
    });
});

describe('igxSelect ControlValueAccessor Unit', () => {
    let select: IgxSelectComponent;
    it('Should correctly implement interface methods', () => {
        const mockSelection = {
            get: vi.fn().mockName("IgxSelectionAPIService.get"),
            set: vi.fn().mockName("IgxSelectionAPIService.set"),
            clear: vi.fn().mockName("IgxSelectionAPIService.clear"),
            delete: vi.fn().mockName("IgxSelectionAPIService.delete"),
            first_item: vi.fn().mockName("IgxSelectionAPIService.first_item")
        };
        const mockCdr = {
            detectChanges: vi.fn().mockName("ChangeDetectorRef.detectChanges")
        };
        const mockNgControl = {
            registerOnChangeCb: vi.fn().mockName("NgControl.registerOnChangeCb"),
            registerOnTouchedCb: vi.fn().mockName("NgControl.registerOnTouchedCb")
        };
        const mockInjector = {
            get: vi.fn().mockName("Injector.get").mockReturnValue(mockNgControl)
        };
        const mockDocument = {
            'defaultView': { getComputedStyle: () => null }
        };

        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule],
            providers: [
                { provide: ElementRef, useValue: null },
                { provide: IgxSelectionAPIService, useValue: mockSelection },
                { provide: ChangeDetectorRef, useValue: mockCdr },
                { provide: DOCUMENT, useValue: mockDocument },
                { provide: Injector, useValue: mockInjector },
                { provide: IGX_DROPDOWN_BASE, useValue: {} },
                // The default token reads the theme from the document body, which the stub lacks.
                { provide: THEME_TOKEN, useValue: {} },
                IgxSelectComponent,
                IgxDropDownItemComponent,
            ]
        });

        // init
        select = TestBed.inject(IgxSelectComponent);
        select.ngOnInit();
        select.registerOnChange(mockNgControl.registerOnChangeCb);
        select.registerOnTouched(mockNgControl.registerOnTouchedCb);
        expect(mockInjector.get).toHaveBeenCalledWith(NgControl, null);

        // writeValue
        expect(select.value).toBeUndefined();
        select.writeValue('test');
        expect(mockSelection.clear).toHaveBeenCalled();
        expect(select.value).toBe('test');

        // setDisabledState
        select.setDisabledState(true);
        expect(select.disabled).toBe(true);
        select.setDisabledState(false);
        expect(select.disabled).toBe(false);

        // OnChange callback
        const item = TestBed.inject(IgxDropDownItemComponent);
        item.value = 'itemValue';
        select.selectItem(item);
        expect(mockSelection.set).toHaveBeenCalledWith(select.id, new Set([item]));
        expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith('itemValue');

        // OnTouched callback
        select.onFocus();
        expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(1);

        select.input = {} as any;
        vi.spyOn(select, 'collapsed', 'get').mockReturnValue(true);
        select.onBlur();
        expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(2);

        // destroy
        select.ngOnDestroy();
        expect(mockSelection.delete).toHaveBeenCalled();
    });

    it('Should correctly handle ngControl validity', () => {
        const formControl = new UntypedFormControl('', Validators.required);
        // NgControl bound to an observable (reactive / template-driven) form control
        const ngControl = {
            control: formControl,
            statusChanges: formControl.statusChanges,
            valueChanges: formControl.valueChanges,
            get valid() {
                return formControl.valid;
            },
            get invalid() {
                return formControl.invalid;
            },
            get pending() {
                return formControl.pending;
            },
            get disabled() {
                return formControl.disabled;
            },
            get touched() {
                return formControl.touched;
            },
            get dirty() {
                return formControl.dirty;
            }
        };
        const mockInjector = {
            get: vi.fn().mockName('Injector.get').mockImplementation((token: unknown) =>
                token === NgControl ? ngControl : TestBed.inject(EnvironmentInjector))
        };
        const mockSelection = {
            get: vi.fn(),
            set: vi.fn(),
            clear: vi.fn(),
            delete: vi.fn(),
            first_item: vi.fn()
        };
        const mockCdr = {
            detectChanges: vi.fn().mockName('ChangeDetectorRef.detectChanges'),
            markForCheck: vi.fn().mockName('ChangeDetectorRef.markForCheck')
        };
        const hostElement = document.createElement('igx-select');
        const inputElement = document.createElement('input');
        const bundleElement = document.createElement('div');

        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule],
            providers: [
                { provide: ElementRef, useValue: new ElementRef(hostElement) },
                { provide: IgxSelectionAPIService, useValue: mockSelection },
                { provide: ChangeDetectorRef, useValue: mockCdr },
                { provide: Injector, useValue: mockInjector },
                { provide: IGX_DROPDOWN_BASE, useValue: {} },
                IgxSelectComponent
            ]
        });

        select = TestBed.inject(IgxSelectComponent);
        select.ngOnInit();
        expect(mockInjector.get).toHaveBeenCalledWith(NgControl, null);

        // The template parts the validity handling works with
        select.input = { valid: IgxInputState.INITIAL, nativeElement: inputElement } as any;
        select.inputGroup = {
            isRequired: false,
            isFocused: false,
            element: { nativeElement: { querySelector: () => bundleElement } }
        } as any;
        const onTouchedSpy = vi.fn();
        select.registerOnTouched(onTouchedSpy);

        // The drop-down base needs its rendered items; only the select's own view init logic is under test
        vi.spyOn(IgxDropDownComponent.prototype, 'ngAfterViewInit').mockImplementation(() => { /* noop */ });
        select.ngAfterViewInit();

        // initial state - required, but not yet validated
        expect(select.inputGroup.isRequired).toBe(true);
        expect(inputElement.getAttribute('aria-required')).toBe('true');
        expect(select.input.valid).toBe(IgxInputState.INITIAL);

        // blur with an invalid control marks the input as invalid
        select.onBlur();
        expect(onTouchedSpy).toHaveBeenCalledTimes(1);
        expect(select.input.valid).toBe(IgxInputState.INVALID);

        // a status change of a touched control updates the state
        formControl.markAsTouched();
        formControl.setValue('Option 1');
        expect(formControl.valid).toBe(true);
        expect(select.input.valid).toBe(IgxInputState.INITIAL);

        // a valid state is only shown while the select is focused
        (select.inputGroup as any).isFocused = true;
        formControl.setValue('Option 2');
        expect(select.input.valid).toBe(IgxInputState.VALID);

        formControl.setValue('');
        expect(formControl.invalid).toBe(true);
        expect(select.input.valid).toBe(IgxInputState.INVALID);

        // blur with a valid control resets the state
        (select.inputGroup as any).isFocused = false;
        formControl.setValue('Option 3');
        select.onBlur();
        expect(select.input.valid).toBe(IgxInputState.INITIAL);

        // programmatic errors are reflected
        formControl.setErrors({ custom: true });
        expect(select.input.valid).toBe(IgxInputState.INVALID);

        // a disabled control is not validated
        formControl.disable();
        expect(select.input.valid).toBe(IgxInputState.INITIAL);
        formControl.enable();
        formControl.setValue('');
        expect(select.input.valid).toBe(IgxInputState.INVALID);

        // removing the required validator resets the required state
        formControl.clearValidators();
        formControl.updateValueAndValidity();
        expect(select.inputGroup.isRequired).toBe(false);
        expect(inputElement.getAttribute('aria-required')).toBe('false');
        expect(select.input.valid).toBe(IgxInputState.INITIAL);

        // a control which is neither touched nor dirty is not validated
        formControl.setValidators(Validators.required);
        formControl.markAsUntouched();
        formControl.markAsPristine();
        formControl.updateValueAndValidity();
        expect(formControl.invalid).toBe(true);
        expect(select.inputGroup.isRequired).toBe(true);
        expect(inputElement.getAttribute('aria-required')).toBe('true');
        expect(select.input.valid).toBe(IgxInputState.INITIAL);

        select.ngOnDestroy();
        // no longer tracking the control status once destroyed
        formControl.markAsTouched();
        formControl.setErrors({ custom: true });
        expect(select.input.valid).toBe(IgxInputState.INITIAL);
    });
});

@Component({
    template: `
    <input class="dummyInput" #dummyInput/>
    <igx-select [style.--ig-size]="'var(--ig-size-large)'" #select [width]="'300px'" [height]="'200px'" [placeholder]="'Choose a city'" [(ngModel)]="value">
        <label igxLabel #simpleLabel>Select Simple Component</label>
        @for (item of items; track itemTrack(item, $index)) {
            <igx-select-item [value]="item" [text]="item">
                {{ item }} {{'Â©'}}
            </igx-select-item>
        }
    </igx-select>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxSelectComponent, IgxSelectItemComponent, IgxLabelDirective]
})
class IgxSelectSimpleComponent {
    @ViewChild('dummyInput')
    public dummyInput: ElementRef;
    @ViewChild('select', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    @ViewChild('simpleLabel', { read: ElementRef, static: true })
    public label1: ElementRef;
    public items: string[] = [
        'New York',
        'Sofia',
        'Istanbul',
        'Paris',
        'Hamburg',
        'Berlin',
        'London',
        'Oslo',
        'Los Angeles',
        'Rome',
        'Madrid',
        'Ottawa',
        'Prague',
        'Padua',
        'Palermo',
        'Palma de Mallorca',
        'Amsterdam'
    ];
    public value = null;

    // returns an array of the filtered items indexes
    public filterCities(startsWith: string) {
        return this.items.map((city, index) => city.toString().toLowerCase().startsWith(startsWith.toLowerCase()) ? index : undefined)
            .filter(x => x);
    }

    public itemTrack = (item: string, _index: number) => item;
}
@Component({
    template: `
    <igx-select [style.--ig-size]="'var(--ig-size-large)'" #select [width]="'300px'" [height]="'500px'" [placeholder]="'Choose location'" [(ngModel)]="value">
        @for (location of locations; track location.continent) {
            <igx-select-item-group [label]="location.continent"> {{location.continent}}
                @for (capital of location.capitals; track capital) {
                    <igx-select-item [value]="capital" [text]="capital">
                        {{ capital }} <igx-icon>star</igx-icon>
                    </igx-select-item>
                }
            </igx-select-item-group>
        }
    </igx-select>
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxSelectComponent, IgxSelectGroupComponent, IgxSelectItemComponent, IgxIconComponent]
})
class IgxSelectGroupsComponent {
    @ViewChild('select', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    public value = null;
    public locations: {
        continent: string;
        capitals: string[];
    }[] = [
        { continent: 'Europe', capitals: ['Berlin', 'London', 'Paris'] },
        { continent: 'South America', capitals: ['Buenos Aires', 'Caracas', 'Lima'] },
        { continent: 'North America', capitals: ['Washington', 'Ottawa', 'Mexico City'] }
    ];
}

@Component({
    template: `
    <div style="width: 2500px; height: 300px;"></div>
    <igx-select [style.--ig-size]="'var(--ig-size-large)'" #select [(ngModel)]="value" >
        @for (item of items; track item) {
            <igx-select-item [value]="item">
                {{ item }}
            </igx-select-item>
        }
    </igx-select>
    <div style="width: 2500px; height: 300px;"></div>
`,
    styles: [':host-context { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxSelectComponent, IgxSelectItemComponent]
})
class IgxSelectMiddleComponent {
    @ViewChild('select', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    public value = null;
    public items: string[] = [
        'Option 1',
        'Option 2',
        'Option 3'
    ];
}
@Component({
    template: `
        <igx-select [style.--ig-size]="'var(--ig-size-large)'" #select [(ngModel)]="value" [ngStyle]="{position:'fixed', top:'20px', left: '30px'}">
            @for (item of items; track item) {
                <igx-select-item [value]="item">
                    {{ item }}
                </igx-select-item>
            }
        </igx-select>
    `,
    selector: 'igx-select-top',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxSelectComponent, IgxSelectItemComponent, NgStyle]
})
class IgxSelectTopComponent {
    @ViewChild('select', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    public value = null;
    public items: string[] = [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
        'Option 5',
        'Option 6',
        'Option 7',
        'Option 8',
        'Option 9',
        'Option 10'
    ];
}
@Component({
    template: `
    <igx-select #select [(ngModel)]="value" [ngStyle]="{position:'fixed', bottom:'20px', left: '30px'}">
        @for (item of items; track item) {
            <igx-select-item [value]="item">
                {{ item }}
            </igx-select-item>
        }
    </igx-select>
    `,
    selector: 'igx-select-bottom',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxSelectComponent, IgxSelectItemComponent, NgStyle]
})
class IgxSelectBottomComponent {
    @ViewChild('select', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    public value = null;
    public items: string[] = [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
        'Option 5',
        'Option 6',
        'Option 7',
        'Option 8',
        'Option 9',
        'Option 10'
    ];
}
@Component({
    template: `
    <igx-select #select [(ngModel)]="value" [ngStyle]="{position:'fixed', top:'20px', left: '30px'}">
        <igx-prefix>
            <igx-icon>favorite</igx-icon>
            <igx-icon>home</igx-icon>
            <igx-icon>search</igx-icon>
        </igx-prefix>
        <igx-suffix>
            <igx-icon>alarm</igx-icon>
        </igx-suffix>
        <igx-hint>I am a Hint</igx-hint>
        @for (item of items; track item) {
            <igx-select-item [value]="item">
                {{ item }}
            </igx-select-item>
        }
    </igx-select>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxSelectComponent, IgxSelectItemComponent, IgxIconComponent, IgxPrefixDirective, IgxSuffixDirective, IgxHintDirective, NgStyle]
})
class IgxSelectAffixComponent {
    @ViewChild('select', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    public value = null;
    public items: string[] = [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
        'Option 5',
        'Option 6',
        'Option 7'
    ];
}

@Component({
    template: `
        <form [formGroup]="reactiveForm" (ngSubmit)="onSubmitReactive()">
            <p>
                <label>First Name:</label>
                <input type="text" formControlName="firstName">
            </p>
            <p>
                <label>Password:</label>
                <input type="password" formControlName="password">
            </p>
            <p>
                <igx-select formControlName="optionsSelect" #selectReactive>
                    <label igxLabel>Sample Label</label>
                    <igx-prefix>
                        <igx-icon>alarm</igx-icon>
                    </igx-prefix>
                    @for (item of items; track item) {
                        <igx-select-item [value]="item">
                            {{ item }}
                        </igx-select-item>
                    }
                </igx-select>
            </p>
            <p>
                <button type="submit" [disabled]="!reactiveForm.valid">Submit</button>
            </p>
        </form>
        `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, IgxSelectComponent, IgxSelectItemComponent, IgxPrefixDirective, IgxLabelDirective, IgxIconComponent]
})
class IgxSelectReactiveFormComponent {
    @ViewChild('selectReactive', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    public reactiveForm: UntypedFormGroup;
    public items: string[] = [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
        'Option 5',
        'Option 6',
        'Option 7'
    ];

    public validationType = {
        firstName: [Validators.required, Validators.pattern('^[\\w\\s/-/(/)]{3,50}$')],
        password: [Validators.required, Validators.maxLength(12)],
        optionsSelect: [Validators.required]
    };

    constructor() {
        const fb = inject(UntypedFormBuilder);

        this.reactiveForm = fb.group({
            firstName: new UntypedFormControl('', Validators.required),
            password: ['', Validators.required],
            optionsSelect: ['', Validators.required]
        });
    }
    public onSubmitReactive() { }

    public removeValidators(form: UntypedFormGroup) {
        for (const key in form.controls) {
            form.get(key).clearValidators();
            form.get(key).updateValueAndValidity();
        }
    }

    public addValidators(form: UntypedFormGroup) {
        for (const key in form.controls) {
            form.get(key).setValidators(this.validationType[key]);
            form.get(key).updateValueAndValidity();
        }
    }

    public markAsTouched() {
        if (!this.reactiveForm.valid) {
            for (const key in this.reactiveForm.controls) {
                if (this.reactiveForm.controls[key]) {
                    this.reactiveForm.controls[key].markAsTouched();
                    this.reactiveForm.controls[key].updateValueAndValidity();
                }
            }
        }
    }
}

@Component({
    template: `
        <form #form="ngForm" (ngSubmit)="onSubmit()">
            <p>

                <igx-select #selectInForm [(ngModel)]="model.option" [required]="isRequired" name="option">
                    <label igxLabel>Sample Label</label>
                    <igx-prefix>
                        <igx-icon>alarm</igx-icon>
                    </igx-prefix>
                    @for (item of items; track item) {
                        <igx-select-item [value]="item">
                            {{ item }}
                        </igx-select-item>
                    }
                </igx-select>
            </p>
            <p>
                <button type="submit" [disabled]="!form.valid">Submit</button>
            </p>
        </form>
        `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxSelectComponent, IgxSelectItemComponent, IgxPrefixDirective, IgxLabelDirective, IgxIconComponent]
})
class IgxSelectTemplateFormComponent {
    @ViewChild('selectInForm', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    @ViewChild(NgForm, { static: true })
    public ngForm: NgForm;

    public isRequired = true;
    public model = {
        option: null
    };
    public items: string[] = [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
        'Option 5',
        'Option 6',
        'Option 7'
    ];

    public onSubmit() { }
}
@Component({
    template: `
        <h4 class="sample-title">Select with ngModel, set items OnInit</h4>
        <igx-select #headerFooterSelect
            required
            [placeholder]="'Pick One'"
            [(ngModel)]="value"
            style="--ig-size: var(--ig-size-medium);">
            <label igxLabel>Sample Label</label>
            <igx-prefix>
                <igx-icon>alarm</igx-icon>
            </igx-prefix>
            <igx-select-item>None</igx-select-item>
            @for (item of items; track item.field) {
                <igx-select-item [value]="item.field">
                    {{ item.field }}
                </igx-select-item>
            }
            <ng-template igxSelectHeader>
                <div class="custom-select-header">iHEADER</div>
            </ng-template>
            <ng-template igxSelectFooter>
                <div class="custom-select-footer">
                    <div>iFOOTER</div>
                    <button type="button" igxButton="contained" (click)="btnClick()">Click Me!</button>
                </div>
            </ng-template>
        </igx-select>
        `,
    styles: [`
        .custom-select-header,
        .custom-select-footer {
            padding: 4px 8px;
            background:  gray;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, .08);
            }
        `],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, IgxSelectComponent, IgxSelectItemComponent, IgxButtonDirective, IgxLabelDirective, IgxPrefixDirective, IgxIconComponent, IgxSelectHeaderDirective, IgxSelectFooterDirective]
})
class IgxSelectHeaderFooterComponent implements OnInit {
    @ViewChild('headerFooterSelect', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    public value = null;
    public items: any[] = [];
    public ngOnInit() {
        for (let i = 1; i < 10; i++) {
            const item = { field: 'opt' + i };
            this.items.push(item);
        }
    }
    public btnClick() {
        alert('Button in footer clicked!');
    }
}

@Component({
    template: `
        <h4>'if' test select for 'expression changed...console Warning'</h4>
        @if (render) {
            <div>
                <igx-select #selectCDR value="ID">
                    <label igxLabel>Column</label>
                    @for (column of columns; track column.field) {
                        <igx-select-item [value]="column.field">
                            {{column.field}}
                        </igx-select-item>
                    }
                </igx-select>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxSelectComponent, IgxSelectItemComponent, IgxLabelDirective]
})
class IgxSelectCDRComponent {
    @ViewChild('selectCDR', { read: IgxSelectComponent, static: false })
    public select: IgxSelectComponent;

    public render = true;
    public columns: Array<any> = [
        { field: 'ID', type: 'string' },
        { field: 'CompanyName', type: 'string' },
        { field: 'ContactName', type: 'string' }
    ];
}

@Component({
    template: `
        <igx-select [id]="'id1'">
            @for (item of items; track item) {
                <igx-select-item [value]="item">
                    {{item}}
                </igx-select-item>
            }
        </igx-select>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxSelectComponent, IgxSelectItemComponent]
})
class IgxSelectWithIdComponent {
    @ViewChild(IgxSelectComponent, { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;

    public items: string[] = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
}


@Component({
    template: `
        <igx-select #select>
            <igx-select-item value="Sofia">Sofia</igx-select-item>
            <igx-select-item value="Varna">Varna</igx-select-item>
        </igx-select>
    `,
    imports: [IgxSelectComponent, IgxSelectItemComponent]
})
class SignalStateSelectComponent {
    @ViewChild('select', { static: true })
    public select: IgxSelectComponent;
}

/** Uses `_focusedItem` the way subclasses could before, so narrowing its type fails to compile. */
class IgxSelectSubclassProbe extends IgxSelectComponent {
    public focusedItemText(): string {
        return this._focusedItem?.itemText;
    }

    public focusIndex(value: string, index: number): void {
        this._focusedItem = { value, index };
    }
}

@Component({
    template: `
        <igx-select #select [value]="value()">
            <igx-select-item [value]="1" [text]="label()">{{ label() }}</igx-select-item>
        </igx-select>
    `,
    imports: [IgxSelectComponent, IgxSelectItemComponent]
})
class SelectItemTextComponent {
    @ViewChild('select', { static: true })
    public select: IgxSelectComponent;

    public label = signal('First');
    public value = signal<number | undefined>(undefined);
}

@Component({
    template: `
        <igx-select #select [value]="value()">
            <igx-select-item [value]="1">{{ label() }}</igx-select-item>
        </igx-select>
    `,
    imports: [IgxSelectComponent, IgxSelectItemComponent]
})
class SelectItemContentComponent {
    @ViewChild('select', { static: true })
    public select: IgxSelectComponent;

    public label = signal('First');
    public value = signal<number | undefined>(undefined);
}

@Component({
    template: `
        <igx-select #select>
            @if (showPrefix()) {
                <igx-prefix>P</igx-prefix>
            }
            @if (showHint()) {
                <igx-hint>Pick one</igx-hint>
            }
            <igx-select-item [value]="1">One</igx-select-item>
        </igx-select>
    `,
    imports: [IgxSelectComponent, IgxSelectItemComponent, IgxPrefixDirective, IgxHintDirective]
})
class SelectLateContentComponent {
    @ViewChild('select', { static: true })
    public select: IgxSelectComponent;

    public showPrefix = signal(false);
    public showHint = signal(false);
}

@Component({
    template: `
        <p>{{ caption() }}</p>
        <igx-select #select>
            <label igxLabel [id]="labelId()">City</label>
            <igx-prefix>P</igx-prefix>
            <igx-select-item [value]="1">One</igx-select-item>
        </igx-select>
    `,
    imports: [IgxSelectComponent, IgxSelectItemComponent, IgxLabelDirective, IgxPrefixDirective]
})
class SelectLabelPrefixComponent {
    @ViewChild('select', { static: true })
    public select: IgxSelectComponent;

    public caption = signal('Destination');
    public labelId = signal('city-label-1');
}

@Component({
    template: `
        <p>{{ caption() }}</p>
        <div [style.--ig-theme]="cssTheme()">
            <igx-select #select>
                <igx-select-item [value]="1">One</igx-select-item>
            </igx-select>
        </div>
    `,
    imports: [IgxSelectComponent, IgxSelectItemComponent]
})
class SelectThemeComponent {
    @ViewChild('select', { static: true })
    public select: IgxSelectComponent;

    public caption = signal('Destination');
    public cssTheme = signal<string | null>(null);
}

@Component({
    template: `
        <igx-select #select>
            <igx-select-item-group label="Available">
                <igx-select-item value="Sofia">Sofia</igx-select-item>
                <igx-select-item value="Varna">Varna</igx-select-item>
            </igx-select-item-group>
        </igx-select>
    `,
    imports: [IgxSelectComponent, IgxSelectGroupComponent, IgxSelectItemComponent]
})
class SelectGroupStateComponent {
    @ViewChild('select', { static: true })
    public select: IgxSelectComponent;

    @ViewChild(IgxSelectGroupComponent, { static: true })
    public group: IgxSelectGroupComponent;
}

@Component({
    template: `
    <igx-select #select [formField]="userForm.option">
        <label igxLabel>Option</label>
        @for (item of items; track item) {
            <igx-select-item [value]="item">{{ item }}</igx-select-item>
        }
    </igx-select>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxSelectComponent, IgxSelectItemComponent, IgxLabelDirective, FormField]
})
class IgxSelectSignalFormComponent {
    @ViewChild('select', { read: IgxSelectComponent, static: true }) public select: IgxSelectComponent;

    public items = ['Option 1', 'Option 2', 'Option 3'];
    public model = signal({ option: '' });
    public isDisabled = signal(false);
    public isRequired = signal(true);
    public userForm = signalForm(this.model, (path) => {
        required(path.option, { when: () => this.isRequired() });
        disabled(path.option, { when: () => this.isDisabled() });
    });
}
