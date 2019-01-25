import { AfterViewInit, ChangeDetectorRef, Component, Injectable, NgModule, OnInit, ViewChild, OnDestroy, DebugElement } from '@angular/core';
import { async, TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSelectComponent } from './select.component';
import { IgxSelectModule } from './select.component';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IForOfState } from '../directives/for-of/for_of.directive';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { DefaultSortingStrategy } from '../data-operations/sorting-strategy';
import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxDropDownBase } from '../drop-down/drop-down.base';
import { Navigate, ISelectionEventArgs } from '../drop-down/drop-down.common';
import { IgxDropDownItemBase, DropDownActionKey } from '../drop-down';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { detectChanges } from '@angular/core/src/render3';
import { IgxSelectItemNavigationDirective } from './select-navigation.directive';
import { DebugContext } from '@angular/core/src/view';
import { IgxSelectItemComponent } from './select-item.component';

const CSS_CLASS_INPUT_GROUP = 'igx-input-group';
const CSS_CLASS_INPUT = 'igx-input-group__input';
const CSS_CLASS_TOGGLE_BUTTON = 'dropdownToggleButton';
const CSS_CLASS_DROPDOWN = 'igx-drop-down';
const CSS_CLASS_DROPDOWN_LIST = 'igx-drop-down__list';
const CSS_CLASS_SELECTED_ITEM = 'igx-drop-down__item--selected';
const CSS_CLASS_DISABLED_ITEM = 'igx-drop-down__item--disabled';
const CSS_CLASS_FOCUSED_ITEM = 'igx-drop-down__item--focused';

const arrowDownKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
const arrowUpKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
const altArrowDownKeyEvent = new KeyboardEvent('keydown', { altKey: true, key: 'ArrowDown' });
const altArrowUpKeyEvent = new KeyboardEvent('keydown', { altKey: true, key: 'ArrowUp' });
const spaceKeyEvent = new KeyboardEvent('keydown', { key: 'Space' });
const escapeKeyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
const endKeyEvent = new KeyboardEvent('keydown', { key: 'End' });
const homeKeyEvent = new KeyboardEvent('keydown', { key: 'Home' });
const focusKeyEvent = new KeyboardEvent('keydown', { shiftKey: true, key: 'tab' });

const verifyOpenCloseEvents = function (
    select: IgxSelectComponent,
    openEventCounter = 0,
    closeEventCounter = 0,
    toggleCallCounter = 0
) {
    expect(select.onOpening.emit).toHaveBeenCalledTimes(openEventCounter);
    expect(select.onOpened.emit).toHaveBeenCalledTimes(openEventCounter);
    expect(select.open).toHaveBeenCalledTimes(openEventCounter);
    expect(select.onClosing.emit).toHaveBeenCalledTimes(closeEventCounter);
    expect(select.onClosed.emit).toHaveBeenCalledTimes(closeEventCounter);
    expect(select.close).toHaveBeenCalledTimes(closeEventCounter);
    expect(select.toggle).toHaveBeenCalledTimes(toggleCallCounter);
};

describe('igxSelect', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxSelectSimpleComponent,
                IgxSelectDeafaultEmptyComponent
            ],
            imports: [
                FormsModule,
                IgxSelectModule,
                IgxToggleModule,
                NoopAnimationsModule,
            ]
        }).compileComponents();
    }));

    describe('General tests: ', () => {
        it('Should initialize the select component properly', fakeAsync(() => {
            const fixture: ComponentFixture<IgxSelectSimpleComponent> = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            expect(fixture.componentInstance).toBeDefined();
            expect(select).toBeDefined();
            expect(inputGroup).toBeTruthy();
            expect(select.placeholder).toBeDefined();
            expect(select.value).toBeUndefined();
            expect(select.disabled).toEqual(false);
            // TODO Check overlaySettings property
            // expect(select.overlaySettings).toBeDefined();
            expect(select.collapsed).toBeDefined();
            expect(select.collapsed).toEqual(true);
            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toEqual(false);
        }));
        it('Should properly accept input properties', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            expect(select.width).toEqual('300px');
            expect(select.height).toEqual('200px');
            expect(select.maxHeight).toBeNull();
            expect(select.disabled).toEqual(false);
            expect(select.placeholder).toEqual('Choose a city');
            expect(select.value).toBeUndefined();
            expect(select.items).toBeDefined();
            // Reset input values
            select.width = '500px';
            expect(select.width).toEqual('500px');
            select.height = '450px';
            expect(select.height).toEqual('450px');
            select.maxHeight = '50px';
            expect(select.maxHeight).toEqual('50px');
            select.placeholder = 'Your home town';
            expect(select.placeholder).toEqual('Your home town');
            select.value = 'Hamburg';
            expect(select.value).toEqual('Hamburg');
            select.items[3].disabled = true;
            expect(select.items[3].disabled).toEqual(true);
            select.items[10].isSelected = true;
            expect(select.items[10].isSelected).toEqual(true);
            select.items[11].value = 'Milano';
            expect(select.items[11].value).toEqual('Milano');
            expect(select.collapsed).toEqual(true);
            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toEqual(false);
            select.disabled = true;
            expect(select.disabled).toEqual(true);
        }));
        it('Should properly emit opening/closing events on input click', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            expect(select).toBeTruthy();

            spyOn(select.onOpening, 'emit');
            spyOn(select.onOpened, 'emit');
            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');
            spyOn(select, 'toggle').and.callThrough();
            spyOn(select, 'open').and.callThrough();
            spyOn(select, 'close').and.callThrough();

            inputGroup.nativeElement.click();
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(select, 1, 0, 1);

            inputGroup.nativeElement.click();
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(select, 1, 1, 2);

            select.disabled = true;
            inputGroup.nativeElement.click();
            tick();
            fixture.detectChanges();

            // No additional calls, because select is disabled
            expect(select.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(select.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(select.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(select.onOpened.emit).toHaveBeenCalledTimes(1);
        }));
        it('Should properly emit opening/closing events on toggle button click', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const toggleBtn = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLE_BUTTON));
            expect(select).toBeTruthy();

            spyOn(select.onOpening, 'emit');
            spyOn(select.onOpened, 'emit');
            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');
            spyOn(select, 'toggle').and.callThrough();
            spyOn(select, 'open').and.callThrough();
            spyOn(select, 'close').and.callThrough();

            toggleBtn.nativeElement.click();
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(select, 1, 0, 1);

            toggleBtn.nativeElement.click();
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(select, 1, 1, 2);
        }));
        it('Should close on click outside of the component', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;

            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');

            expect(select).toBeDefined();
            select.toggle();
            tick();
            expect(select.collapsed).toEqual(false);

            document.documentElement.dispatchEvent(new Event('click'));
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toEqual(true);
            expect(select.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(select.onClosed.emit).toHaveBeenCalledTimes(1);
        }));
        fit('Should render aria attributes properly', fakeAsync(() => {
            const fixture: ComponentFixture<IgxSelectSimpleComponent> = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputElement = fixture.nativeElement.querySelector('.' + CSS_CLASS_INPUT);
            const dropdownListElement = fixture.nativeElement.querySelector('.' + CSS_CLASS_DROPDOWN_LIST);

            expect(inputElement.getAttribute('role')).toMatch('combobox');
            expect(inputElement.getAttribute('aria-haspopup')).toMatch('listbox');
            expect(inputElement.getAttribute('aria-owns')).toMatch('igx-drop-down-0-list');
            expect(inputElement.getAttribute('aria-expanded')).toMatch('false');
            expect(dropdownListElement.getAttribute('role')).toMatch('listbox');
            expect(dropdownListElement.getAttribute('aria-hidden')).toMatch('true');

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-expanded')).toMatch('true');
            expect(dropdownListElement.getAttribute('aria-hidden')).toMatch('false');

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-expanded')).toMatch('false');
            expect(dropdownListElement.getAttribute('aria-hidden')).toMatch('true');
        }));
    });
    describe('Selection tests: ', () => {
        it('Should allow single selection only', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let selectedItemIndex = 5;

            const checkItemSelection = function () {
                const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
                expect(selectedItems.length).toEqual(1);
                const currentSelectedItem = select.items[selectedItemIndex] as IgxSelectItemComponent;
                expect(select.selectedItem).toEqual(currentSelectedItem);
                expect(currentSelectedItem.isSelected).toBeTruthy();
                expect(select.selectionValue.toString().trim()).toEqual(currentSelectedItem.value);
                expect(select.value).toEqual(currentSelectedItem.value);
                expect(select.input.value.toString().trim()).toEqual(currentSelectedItem.value);
            };

            select.toggle();
            tick();
            fixture.detectChanges();
            selectList.children[selectedItemIndex].nativeElement.click();
            tick();
            fixture.detectChanges();
            checkItemSelection();

            selectedItemIndex = 15;
            select.selectItem(select.items[selectedItemIndex]);
            tick();
            fixture.detectChanges();
            checkItemSelection();

            // selectedItemIndex = 8;
            // select.value = select.items[selectedItemIndex].value.toString();
            // console.log(select.value);
            // fixture.detectChanges();
            // tick();

            // console.log(select.selectionValue);
            // select.toggle();
            // tick();
            // fixture.detectChanges();
            // checkItemSelection();

            // selectedItemIndex = -1;
            // select.value = 'Ghost city';
            // tick();
            // fixture.detectChanges();
            // checkItemSelection();
        }));
        it('Should populate the input box with the selected item value', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT)).nativeElement;
            const selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let selectedItemIndex = 5;
            let selectedItemValue = select.items[selectedItemIndex].value;

            const checkInputValue = function () {
                expect(select.selectedItem.value).toEqual(selectedItemValue);
                expect(select.value).toEqual(selectedItemValue);
                expect(inputElement.value.toString().trim()).toEqual(selectedItemValue);
            };

            // There is not a selected item initially
            const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
            expect(selectedItems.length).toEqual(0);
            expect(select.value).toBeUndefined();
            expect(select.input.value).toEqual('');
            expect(inputElement.value).toEqual('');

            // Select item - mouse click
            select.toggle();
            tick();
            fixture.detectChanges();
            selectList.children[selectedItemIndex].nativeElement.click();
            tick();
            fixture.detectChanges();
            checkInputValue();

            // Select item - selectItem method
            selectedItemIndex = 0;
            selectedItemValue = select.items[selectedItemIndex].value;
            select.selectItem(select.items[selectedItemIndex]);
            tick();
            fixture.detectChanges();
            select.toggle();
            tick();
            fixture.detectChanges();
            checkInputValue();

            // Select item - item isSelected property
            selectedItemIndex = 12;
            selectedItemValue = select.items[selectedItemIndex].value;
            select.items[selectedItemIndex].isSelected = true;
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            checkInputValue();

            // Select item - value property
            // selectedItemIndex = 8;
            // selectedItemValue = select.items[selectedItemIndex].value;
            // select.value = select.items[selectedItemIndex].value.toString();
            // fixture.detectChanges();
            // tick();
            // fixture.detectChanges();
            // checkInputValue();
        }));
        it('Should not append any text to the input box when no item is selected and value is not set or does not match any item',
            fakeAsync(() => {
                const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
                fixture.detectChanges();
                const select = fixture.componentInstance.select;
                const inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT)).nativeElement;

                // There is not a selected item initially
                expect(select.selectedItem).toBeUndefined();
                expect(select.value).toBeUndefined();
                expect(select.input.value).toEqual('');
                expect(inputElement.textContent).toEqual('');

                select.value = 'Ghost city';
                tick();
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                expect(select.selectedItem).toBeUndefined();
                expect(select.input.value).toEqual('');
                expect(inputElement.value).toEqual('');
                const selectedItems = fixture.debugElement.nativeElement.querySelectorAll('.' + CSS_CLASS_SELECTED_ITEM);
                expect(selectedItems.length).toEqual(0);
            }));
        it('Should not append any text to the input box when an item is focused but not selected',
            fakeAsync(() => {
                const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
                fixture.detectChanges();
                const select = fixture.componentInstance.select;
                const inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                let focusedItem = select.items[2];
                const navigationStep = focusedItem.index + 1;

                const navigateDropdownItems = function (keydownEvent: KeyboardEvent) {
                    for (let index = 0; index < navigationStep; index++) {
                        inputElement.triggerEventHandler('keydown', keydownEvent);
                    }
                    tick();
                    fixture.detectChanges();
                };

                const verifyFocusedItem = function () {
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
                tick();
                fixture.detectChanges();
                navigateDropdownItems(arrowDownKeyEvent);
                const selectedItems = fixture.debugElement.nativeElement.querySelectorAll('.' + CSS_CLASS_SELECTED_ITEM);
                expect(select.value).toBeUndefined();
                expect(select.input.value).toEqual('');
                verifyFocusedItem();

                // Focus item when there is a selected item
                const selectedItem = select.items[13] as IgxSelectItemComponent;
                selectedItem.element.nativeElement.click();
                tick();
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                navigateDropdownItems(arrowUpKeyEvent);
                focusedItem = select.items[selectedItem.index - navigationStep];
                verifyFocusedItem();

                // Change focused item when there is a selected item
                navigateDropdownItems(arrowUpKeyEvent);
                focusedItem = select.items[selectedItem.index - navigationStep * 2];
                verifyFocusedItem();
            }));
        it('Should not select disabled item', () => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT)).nativeElement;

            const disabledItem = select.items[2];
            disabledItem.disabled = true;
            fixture.detectChanges();
            disabledItem.isSelected = true;
            fixture.detectChanges();

            expect(select.value).toBeUndefined();
            expect(select.input.value).toEqual('');
            expect(inputElement.value).toEqual('');
            expect(disabledItem.element.nativeElement.classList.contains(CSS_CLASS_DISABLED_ITEM)).toEqual(true);
            expect(disabledItem.element.nativeElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toEqual(false);
        });
        it('Should select first match out of duplicated values', async () => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT)).nativeElement;

            select.value = 'Paris';
            // tick(200);
            fixture.detectChanges();
            await wait(200);

            // console.log(select.value);

            select.toggle();
            fixture.detectChanges();
            // tick();
            // fixture.detectChanges();
        });
        xit('Should not change selection when setting it to non-existing item', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            const selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            const selectedItemEl = selectList.children[2];
            const selectedItem = select.items[2] as IgxSelectItemComponent;

            inputElement.nativeElement.click();
            tick();
            fixture.detectChanges();
            selectedItemEl.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(selectedItem.isSelected).toBeTruthy();
            expect(select.value).toEqual(selectedItem.value);
            expect(select.input.value.toString().trim()).toEqual(selectedItem.value);
            expect(select.selectedItem).toEqual(selectedItem);
            expect(selectedItemEl.nativeElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeTruthy();

            // Throws an error 'Cannot read property isHeader of null'
            select.selectItem(null);
            fixture.detectChanges();
            expect(selectedItem.isSelected).toBeTruthy();
            expect(select.value).toEqual(selectedItem.value);
            expect(select.input.value.toString().trim()).toEqual(selectedItem.value);
            expect(select.selectedItem).toEqual(selectedItem);
            expect(selectedItemEl.nativeElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeTruthy();
            const selectedItems = fixture.debugElement.nativeElement.querySelectorAll('.' + CSS_CLASS_SELECTED_ITEM);
            expect(selectedItems.length).toEqual(1);
        }));
        it('Should properly emit onSelection event on item click', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let selectedItemEl = selectList.children[5];
            let selectedItem = select.items[5];

            spyOn(select.onSelection, 'emit');
            spyOn(select, 'selectItem').and.callThrough();
            const args: ISelectionEventArgs = {
                oldSelection: undefined,
                newSelection: selectedItem,
                cancel: false
            };

            select.toggle();
            tick();
            fixture.detectChanges();
            selectedItemEl.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(select.selectItem).toHaveBeenCalledTimes(1);
            expect(select.onSelection.emit).toHaveBeenCalledWith(args);

            args.oldSelection = selectedItem;
            selectedItem = select.items[10];
            selectedItemEl = selectList.children[10];
            args.newSelection = selectedItem;
            select.toggle();
            tick();
            fixture.detectChanges();
            selectedItemEl.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.onSelection.emit).toHaveBeenCalledTimes(2);
            expect(select.selectItem).toHaveBeenCalledTimes(2);
            expect(select.onSelection.emit).toHaveBeenCalledWith(args);
        }));
        it('Should properly emit onSelection event on isSelected setting', () => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            let selectedItem = select.items[3];

            spyOn(select.onSelection, 'emit');
            spyOn(select, 'selectItem').and.callThrough();
            const args: ISelectionEventArgs = {
                oldSelection: undefined,
                newSelection: selectedItem,
                cancel: false
            };

            selectedItem.isSelected = true;
            fixture.detectChanges();
            expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(select.selectItem).toHaveBeenCalledTimes(1);
            expect(select.onSelection.emit).toHaveBeenCalledWith(args);

            args.oldSelection = selectedItem;
            selectedItem = select.items[9];
            selectedItem.isSelected = true;
            args.newSelection = selectedItem;
            fixture.detectChanges();
            expect(select.onSelection.emit).toHaveBeenCalledTimes(2);
            expect(select.selectItem).toHaveBeenCalledTimes(2);
            expect(select.onSelection.emit).toHaveBeenCalledWith(args);
        });
        it('Should properly emit onSelection/Close events on key interaction', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputEl = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            let selectedItem = select.items[3];

            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');
            spyOn(select, 'close').and.callThrough();
            spyOn(select.onSelection, 'emit');
            spyOn(select, 'selectItem').and.callThrough();
            const args: ISelectionEventArgs = {
                oldSelection: undefined,
                newSelection: selectedItem,
                cancel: false
            };

            const navigateDropdownItems = function (selectEvent: KeyboardEvent) {
                inputEl.triggerEventHandler('keydown', altArrowDownKeyEvent);
                tick();
                fixture.detectChanges();
                for (let itemIndex = 0; itemIndex <= selectedItem.index; itemIndex++) {
                    inputEl.triggerEventHandler('keydown', arrowDownKeyEvent);
                }
                inputEl.triggerEventHandler('keydown', selectEvent);
                tick();
                fixture.detectChanges();
            };

            navigateDropdownItems(enterKeyEvent);
            expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(select.selectItem).toHaveBeenCalledTimes(1);
            expect(select.onSelection.emit).toHaveBeenCalledWith(args);
            expect(select.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(select.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(select.close).toHaveBeenCalledTimes(1);

            args.oldSelection = selectedItem;
            selectedItem = select.items[9];
            args.newSelection = selectedItem;
            navigateDropdownItems(spaceKeyEvent);
            expect(select.onSelection.emit).toHaveBeenCalledTimes(2);
            expect(select.selectItem).toHaveBeenCalledTimes(2);
            // expect(select.onSelection.emit).toHaveBeenCalledWith(args);
            expect(select.onClosing.emit).toHaveBeenCalledTimes(2);
            expect(select.onClosed.emit).toHaveBeenCalledTimes(2);
            expect(select.close).toHaveBeenCalledTimes(2);
        }));
        it('Should properly emit onSelection event on value setting', () => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;

            spyOn(select.onSelection, 'emit');
            spyOn(select, 'selectItem').and.callThrough();

            select.value = 'Rome';
            fixture.detectChanges();
            // expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
            // expect(select.selectItem).toHaveBeenCalledTimes(1);
            // expect(select.onSelection.emit).toHaveBeenCalledWith(null);

            select.value = 'Padua';
            fixture.detectChanges();
            // expect(select.onSelection.emit).toHaveBeenCalledTimes(2);
            // expect(select.selectItem).toHaveBeenCalledTimes(2);
            // expect(select.onSelection.emit).toHaveBeenCalledWith(null);

            // onSelection should not be fired when value is set to non-existing item
            select.value = 'Ghost city';
            fixture.detectChanges();
            // expect(select.onSelection.emit).toHaveBeenCalledTimes(2);
            // expect(select.selectItem).toHaveBeenCalledTimes(2);
        });
        it('Should properly emit onSelection event using selectItem method', () => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            let selectedItem = select.items[4];

            spyOn(select.onSelection, 'emit');
            const args: ISelectionEventArgs = {
                oldSelection: undefined,
                newSelection: selectedItem,
                cancel: false
            };

            select.selectItem(selectedItem);
            fixture.detectChanges();
            expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(select.onSelection.emit).toHaveBeenCalledWith(args);

            args.oldSelection = selectedItem;
            selectedItem = select.items[14];
            args.newSelection = selectedItem;
            select.selectItem(selectedItem);
            fixture.detectChanges();
            expect(select.onSelection.emit).toHaveBeenCalledTimes(2);
            expect(select.onSelection.emit).toHaveBeenCalledWith(args);
        });
    });
    describe('Key navigation tests: ', () => {
        it('Should properly emit opening/closing events on ALT+ArrowUp/Down keys interaction', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputEl = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));

            spyOn(select.onOpening, 'emit');
            spyOn(select.onOpened, 'emit');
            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');
            spyOn(select, 'toggle').and.callThrough();
            spyOn(select, 'open').and.callThrough();
            spyOn(select, 'close').and.callThrough();

            inputEl.triggerEventHandler('keydown', altArrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(select, 1, 0, 1);

            inputEl.triggerEventHandler('keydown', altArrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(select, 1, 1, 2);
        }));
        it('Should properly emit opening/closing events on ENTER/ESC key interaction', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputEl = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));

            spyOn(select.onOpening, 'emit');
            spyOn(select.onOpened, 'emit');
            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');
            spyOn(select, 'open').and.callThrough();
            spyOn(select, 'close').and.callThrough();
            spyOn(select, 'toggle').and.callThrough();

            inputEl.triggerEventHandler('keydown', enterKeyEvent);
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(select, 1, 0, 0);

            inputEl.triggerEventHandler('keydown', escapeKeyEvent);
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(select, 1, 1, 0);
        }));
        it('Should properly emit opening/closing events on SPACE/ESC key interaction', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputEl = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));

            spyOn(select.onOpening, 'emit');
            spyOn(select.onOpened, 'emit');
            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');
            spyOn(select, 'open').and.callThrough();
            spyOn(select, 'close').and.callThrough();
            spyOn(select, 'toggle').and.callThrough();

            inputEl.triggerEventHandler('keydown', spaceKeyEvent);
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(select, 1, 0, 0);

            inputEl.triggerEventHandler('keydown', escapeKeyEvent);
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(select, 1, 1, 0);
        }));
        it('Should navigate through dropdown items using Up/Down/Home/End keys', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputEl = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            const selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let currentItemIndex = 0;

            const verifyFocusedItem = function () {
                expect(select.focusedItem).toEqual(select.items[currentItemIndex]);
                expect(select.items[currentItemIndex].isFocused).toBeTruthy();
                expect(selectList.children[currentItemIndex].nativeElement.classList.contains(CSS_CLASS_FOCUSED_ITEM)).toBeTruthy();
            };

            select.toggle();
            tick();
            fixture.detectChanges();

            inputEl.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem();

            currentItemIndex++;
            inputEl.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem();

            currentItemIndex = select.items.length - 1;
            inputEl.triggerEventHandler('keydown', endKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem();

            currentItemIndex--;
            inputEl.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem();

            currentItemIndex--;
            inputEl.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem();

            currentItemIndex = 0;
            inputEl.triggerEventHandler('keydown', homeKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem();
        }));
        it('Should navigate through dropdown items skipping the disabled ones', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputEl = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            const selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let focusedItemIndex = 1;

            const verifyFocusedItem = function () {
                const focusedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_FOCUSED_ITEM));
                expect(focusedItems.length).toEqual(1);
                expect(selectList.children[focusedItemIndex].nativeElement.classList.contains(CSS_CLASS_FOCUSED_ITEM)).toBeTruthy();
                expect(select.focusedItem).toEqual(select.items[focusedItemIndex]);
                expect(select.items[focusedItemIndex].isFocused).toBeTruthy();
            };

            select.items[0].disabled = true;
            select.items[2].disabled = true;
            select.items[3].disabled = true;
            select.items[select.items.length - 1].disabled = true;
            fixture.detectChanges();

            select.toggle();
            tick();
            fixture.detectChanges();

            inputEl.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem();

            // Skip two disabled items
            focusedItemIndex = 4;
            inputEl.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem();

            // Focus the element before the last one as it is disabled
            focusedItemIndex = select.items.length - 2;
            inputEl.triggerEventHandler('keydown', endKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem();

            focusedItemIndex--;
            inputEl.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem();

            // Home key should focus second item since the first one is disabled
            focusedItemIndex = 1;
            inputEl.triggerEventHandler('keydown', homeKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem();
        }));
        it('Should start navigation from selected item', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const inputEl = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            const selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let selectedItem = select.items[4];
            let focusedItemIndex = selectedItem.index + 1;

            const verifyFocusedItem = function () {
                expect(selectedItem.isSelected).toEqual(true);
                const focusedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_FOCUSED_ITEM));
                expect(focusedItems.length).toEqual(1);
                expect(selectList.children[focusedItemIndex].nativeElement.classList.contains(CSS_CLASS_FOCUSED_ITEM)).toBeTruthy();
                expect(select.focusedItem).toEqual(select.items[focusedItemIndex]);
                expect(select.items[focusedItemIndex].isFocused).toBeTruthy();
            };

            select.selectItem(select.items[4]);
            fixture.detectChanges();

            select.toggle();
            tick();
            fixture.detectChanges();

            inputEl.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem();

            inputEl.triggerEventHandler('keydown', arrowDownKeyEvent);
            inputEl.triggerEventHandler('keydown', arrowDownKeyEvent);
            inputEl.triggerEventHandler('keydown', enterKeyEvent);
            tick();
            fixture.detectChanges();

            select.toggle();
            tick();
            fixture.detectChanges();

            inputEl.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            selectedItem = select.items[7];
            focusedItemIndex = selectedItem.index - 1;
            verifyFocusedItem();
        }));
    });
    describe('Positioning tests: ', () => {
    });
});

@Component({
    template: `
    <igx-select #select [width]="'300px'" [height]="'200px'" [placeholder]="'Choose a city'" [(ngModel)]="value" >
    <igx-select-item *ngFor="let item of items" [value]="item">
        {{ item }}
    </igx-select-item>
    </igx-select>
`
})
class IgxSelectSimpleComponent {
    @ViewChild('select', { read: IgxSelectComponent })
    public select: IgxSelectComponent;
    // public value: string = 'Hamburg';
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
        'Paris',
        'Amsterdam'];

    // public onSelection(eventArgs: ISelectionEventArgs) {
    //     this.value = eventArgs.newSelection.value;
    // }
}

@Component({
    template: `
    <igx-select #select [(ngModel)]="value" >
    <igx-select-item *ngFor="let item of items" [value]="item">
        {{ item }}
    </igx-select-item>
    </igx-select>
`
})
class IgxSelectDeafaultEmptyComponent {
    @ViewChild('select', { read: IgxSelectComponent })
    public select: IgxSelectComponent;
    public value: string;
    public items: string[] = [
        'Option 1',
        'Option 2',
        'Option 3'];

    public onSelection(eventArgs: ISelectionEventArgs) {
        this.value = eventArgs.newSelection.value;
    }
}
