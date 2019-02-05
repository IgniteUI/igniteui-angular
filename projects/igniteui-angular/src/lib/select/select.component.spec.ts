import { Component, ViewChild, DebugElement } from '@angular/core';
import { async, TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSelectComponent } from './select.component';
import { IgxSelectModule } from './select.component';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { FormsModule } from '@angular/forms';
import { wait } from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';
import { ISelectionEventArgs } from '../drop-down/drop-down.common';
import { IgxSelectItemComponent } from './select-item.component';

const CSS_CLASS_INPUT_GROUP = 'igx-input-group';
const CSS_CLASS_INPUT = 'igx-input-group__input';
const CSS_CLASS_TOGGLE_BUTTON = 'dropdownToggleButton';
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

describe('igxSelect', () => {
    let fixture;
    let select: IgxSelectComponent;
    let inputElement: DebugElement;
    let selectList: DebugElement;
    const verifyFocusedItem = function (focusedItemIndex) {
        const focusedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_FOCUSED_ITEM));
        expect(focusedItems.length).toEqual(1);
        expect(selectList.children[focusedItemIndex].nativeElement.classList.contains(CSS_CLASS_FOCUSED_ITEM)).toBeTruthy();
        expect(select.focusedItem).toBe(select.items[focusedItemIndex]);
        expect(select.items[focusedItemIndex].isFocused).toBeTruthy();
    };
    const verifySelectedItem = function (itemIndex) {
        expect(select.input.value).toEqual(select.items[itemIndex].value);
        expect(select.value).toEqual(select.items[itemIndex].value);
        const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
        expect(selectedItems.length).toEqual(1);
        expect(selectList.children[itemIndex].nativeElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeTruthy();
        expect(select.selectedItem).toBe(select.items[itemIndex] as IgxSelectItemComponent);
        expect(select.items[itemIndex].selected).toBeTruthy();
    };
    const verifyOpenCloseEvents = function (
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
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            select = fixture.componentInstance.select;
            fixture.detectChanges();
        }));
        it('Should initialize the select component properly', fakeAsync(() => {
            select.items[0].selected = true;
            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            expect(fixture.componentInstance).toBeDefined();
            expect(select).toBeDefined();
            expect(inputGroup).toBeTruthy();
            expect(select.placeholder).toBeDefined();
            expect(select.value).toEqual(select.items[0].value);
            expect(select.disabled).toBeFalsy();
            expect(select.overlaySettings).toBeUndefined();
            expect(select.collapsed).toBeDefined();
            expect(select.collapsed).toBeTruthy();
            select.open();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
        }));
        it('Should properly accept input properties', fakeAsync(() => {
            expect(select.width).toEqual('300px');
            expect(select.height).toEqual('200px');
            expect(select.maxHeight).toEqual('256px');
            expect(select.disabled).toBeFalsy();
            expect(select.placeholder).toEqual('Choose a city');
            expect(select.value).toBeUndefined();
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
            select.items[3].disabled = true;
            expect(select.items[3].disabled).toBeTruthy();
            select.items[10].selected = true;
            expect(select.items[10].selected).toBeTruthy();
            select.items[11].value = 'Milano';
            expect(select.items[11].value).toEqual('Milano');
            expect(select.collapsed).toBeTruthy();
            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
            select.disabled = true;
            expect(select.disabled).toBeTruthy();
        }));
        it('Should open dropdown on input click', fakeAsync(() => {
            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            expect(select.collapsed).toBeTruthy();

            inputGroup.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
        }));
        it('Should close dropdown on item click', fakeAsync(() => {
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            const selectedItemEl = selectList.children[2];
            expect(select.collapsed).toBeTruthy();

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            selectedItemEl.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        }));
        it('Should toggle dropdown on toggle button click', fakeAsync(() => {
            const toggleBtn = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLE_BUTTON));
            expect(select.collapsed).toBeTruthy();

            toggleBtn.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            toggleBtn.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        }));
        it('Should toggle dropdown using API methods', fakeAsync(() => {
            select.items[0].selected = true;
            expect(select.collapsed).toBeTruthy();

            select.open();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            select.close();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        }));
        it('Should close on click outside of the component', fakeAsync(() => {
            expect(select.collapsed).toBeTruthy();
            select.toggle();
            tick();
            expect(select.collapsed).toBeFalsy();

            document.documentElement.dispatchEvent(new Event('click'));
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        }));
        it('Should properly emit opening/closing events on input click', fakeAsync(() => {
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
            verifyOpenCloseEvents(1, 0, 1);

            inputGroup.nativeElement.click();
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 1, 2);

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
        fit('Should properly emit closing events on item click', fakeAsync(() => {
            select.items[0].selected = true;
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            const selectedItemEl = selectList.children[2];

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            spyOn(select.onOpening, 'emit');
            spyOn(select.onOpened, 'emit');
            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');
            spyOn(select, 'toggle').and.callThrough();
            spyOn(select, 'open').and.callThrough();
            spyOn(select, 'close').and.callThrough();

            selectedItemEl.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(select.onClosed.emit).toHaveBeenCalledTimes(1);
        }));
        it('Should properly emit opening/closing events on toggle button click', fakeAsync(() => {
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
            verifyOpenCloseEvents(1, 0, 1);

            toggleBtn.nativeElement.click();
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 1, 2);
        }));
        it('Should emit closing events on click outside of the component', fakeAsync(() => {
            select.items[0].selected = true;

            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');

            expect(select).toBeDefined();
            select.toggle();
            tick();
            expect(select.collapsed).toBeFalsy();

            document.documentElement.dispatchEvent(new Event('click'));
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
            expect(select.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(select.onClosed.emit).toHaveBeenCalledTimes(1);
        }));
        it('Should render aria attributes properly', fakeAsync(() => {
            inputElement = fixture.nativeElement.querySelector('.' + CSS_CLASS_INPUT);
            const dropdownListElement = fixture.nativeElement.querySelector('.' + CSS_CLASS_DROPDOWN_LIST);

            expect(inputElement.nativeElement.getAttribute('role')).toEqual('combobox');
            expect(inputElement.nativeElement.getAttribute('aria-haspopup')).toEqual('listbox');
            expect(inputElement.nativeElement.getAttribute('aria-owns')).toEqual('igx-drop-down-0-list');
            expect(inputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
            expect(dropdownListElement.getAttribute('role')).toEqual('listbox');
            expect(dropdownListElement.getAttribute('aria-hidden')).toEqual('true');

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(inputElement.nativeElement.getAttribute('aria-expanded')).toEqual('true');
            expect(dropdownListElement.getAttribute('aria-hidden')).toEqual('false');

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(inputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
            expect(dropdownListElement.getAttribute('aria-hidden')).toEqual('true');
        }));
    });
    describe('Selection tests: ', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            select = fixture.componentInstance.select;
            fixture.detectChanges();
        }));
        it('Should select item with mouse click', fakeAsync(() => {
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let selectedItemIndex = 5;

            select.toggle();
            tick();
            fixture.detectChanges();
            selectList.children[selectedItemIndex].nativeElement.click();
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);

            selectedItemIndex = 15;
            select.toggle();
            tick();
            fixture.detectChanges();
            selectList.children[selectedItemIndex].nativeElement.click();
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);
        }));
        it('Should select item with API selectItem() method', fakeAsync(() => {
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let selectedItemIndex = 15;
            select.selectItem(select.items[selectedItemIndex]);
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);

            selectedItemIndex = 1;
            select.selectItem(select.items[selectedItemIndex]);
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);
        }));
        it('Should select item on setting value property', fakeAsync(() => {
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let selectedItemIndex = 7;
            select.value = select.items[selectedItemIndex].value.toString();
            fixture.detectChanges();
            tick();
            verifySelectedItem(selectedItemIndex);

            selectedItemIndex = 12;
            select.value = select.items[selectedItemIndex].value.toString();
            fixture.detectChanges();
            tick();
            verifySelectedItem(selectedItemIndex);
        }));
        it('Should select item on setting item\'s selected property', () => {
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let selectedItemIndex = 9;
            select.items[selectedItemIndex].selected = true;
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);

            selectedItemIndex = 14;
            select.items[selectedItemIndex].selected = true;
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);
        });
        it('Should select item with ENTER/SPACE keys', fakeAsync(() => {
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let selectedItemIndex = 1;

            select.toggle();
            tick();
            fixture.detectChanges();
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            inputElement.triggerEventHandler('keydown', spaceKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);

            selectedItemIndex = 3;
            select.toggle();
            tick();
            fixture.detectChanges();
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            inputElement.triggerEventHandler('keydown', enterKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);
        }));
        it('Should allow single selection only', fakeAsync(() => {
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let selectedItemIndex = 5;

            const checkItemSelection = function () {
                const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
                expect(selectedItems.length).toEqual(1);
                const currentSelectedItem = select.items[selectedItemIndex] as IgxSelectItemComponent;
                expect(select.selectedItem).toEqual(currentSelectedItem);
                expect(currentSelectedItem.selected).toBeTruthy();
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
            // checkItemSelection();

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
        it('Should focus first item in dropdown if there is not selected item', fakeAsync(() => {
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let focusedItemIndex = 0;
            // verifyFocusedItem(focusedItemIndex);

            let selectedItemIndex = 8;
            select.toggle();
            tick();
            fixture.detectChanges();
            selectList.children[selectedItemIndex].nativeElement.click();
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);
            expect(select.items[focusedItemIndex].isFocused).toBeFalsy();

            select.toggle();
            tick();
            fixture.detectChanges();

            select.items[selectedItemIndex].selected = false;
            tick();
            fixture.detectChanges();

            select.toggle();
            tick();
            fixture.detectChanges();
            // verifyFocusedItem(focusedItemIndex);
        }));
        it('Should populate the input box with the selected item value', fakeAsync(() => {
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let selectedItemIndex = 5;
            let selectedItemValue = select.items[selectedItemIndex].value;

            const checkInputValue = function () {
                expect(select.selectedItem.value).toEqual(selectedItemValue);
                expect(select.value).toEqual(selectedItemValue);
                expect(inputElement.nativeElement.value.toString().trim()).toEqual(selectedItemValue);
            };

            // There is not a selected item initially
            const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
            expect(selectedItems.length).toEqual(0);
            expect(select.value).toBeUndefined();
            expect(select.input.value).toEqual('');
            expect(inputElement.nativeElement.value).toEqual('');

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
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));

                // There is not a selected item initially
                expect(select.selectedItem).toBeUndefined();
                expect(select.value).toBeUndefined();
                expect(select.input.value).toEqual('');
                expect(inputElement.nativeElement.textContent).toEqual('');

                select.value = 'Ghost city';
                tick();
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                expect(select.selectedItem).toBeUndefined();
                expect(select.input.value).toEqual('');
                expect(inputElement.nativeElement.value).toEqual('');
                const selectedItems = fixture.debugElement.nativeElement.querySelectorAll('.' + CSS_CLASS_SELECTED_ITEM);
                expect(selectedItems.length).toEqual(0);
            }));
        it('Should not append any text to the input box when an item is focused but not selected',
            fakeAsync(() => {
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
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
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT)).nativeElement;
            const disabledItem = select.items[2];
            disabledItem.disabled = true;
            fixture.detectChanges();
            disabledItem.selected = true;
            fixture.detectChanges();

            expect(select.value).toBeUndefined();
            expect(select.input.value).toEqual('');
            expect(inputElement.nativeElement.value).toEqual('');
            expect(disabledItem.element.nativeElement.classList.contains(CSS_CLASS_DISABLED_ITEM)).toBeTruthy();
            expect(disabledItem.element.nativeElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeFalsy();
        });
        it('Should remove selection if option has been removed', fakeAsync(() => {
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            const selectedItemIndex = 2;
            select.items[selectedItemIndex].selected = true;
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);

            fixture.componentInstance.items = [];
            fixture.detectChanges();
            tick();
            expect(select.selectedItem).toBeUndefined();
        }));
        it('Should select first match out of duplicated values', async () => {
            // TODO
        });
        it('Should not change selection when setting value to non-existing item', fakeAsync(() => {
            select.items[0].selected = true;
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
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
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
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
        it('Should properly emit onSelection event on item selected property setting', () => {
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
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
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
                inputElement.triggerEventHandler('keydown', altArrowDownKeyEvent);
                tick();
                fixture.detectChanges();
                for (let itemIndex = 0; itemIndex <= selectedItem.index; itemIndex++) {
                    inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                }
                inputElement.triggerEventHandler('keydown', selectEvent);
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
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            select = fixture.componentInstance.select;
            fixture.detectChanges();
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
        }));
        it('Should toggle dropdown on ALT+ArrowUp/Down keys interaction', fakeAsync(() => {
            expect(select.collapsed).toBeTruthy();

            inputElement.triggerEventHandler('keydown', altArrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            inputElement.triggerEventHandler('keydown', altArrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        }));
        it('Should toggle dropdown on pressing ENTER key', fakeAsync(() => {
            expect(select.collapsed).toBeTruthy();

            inputElement.triggerEventHandler('keydown', enterKeyEvent);
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            inputElement.triggerEventHandler('keydown', enterKeyEvent);
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        }));
        it('Should toggle dropdown on pressing SPACE key', fakeAsync(() => {
            expect(select.collapsed).toBeTruthy();

            inputElement.triggerEventHandler('keydown', spaceKeyEvent);
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            inputElement.triggerEventHandler('keydown', spaceKeyEvent);
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        }));
        it('Should close dropdown on pressing ESC key', fakeAsync(() => {
            expect(select.collapsed).toBeTruthy();

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            inputElement.triggerEventHandler('keydown', escapeKeyEvent);
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        }));
        it('Should properly emit opening/closing events on ALT+ArrowUp/Down keys interaction', fakeAsync(() => {
            spyOn(select.onOpening, 'emit');
            spyOn(select.onOpened, 'emit');
            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');
            spyOn(select, 'toggle').and.callThrough();
            spyOn(select, 'open').and.callThrough();
            spyOn(select, 'close').and.callThrough();

            inputElement.triggerEventHandler('keydown', altArrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 0, 1);

            inputElement.triggerEventHandler('keydown', altArrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 1, 2);
        }));
        it('Should properly emit opening/closing events on ENTER/ESC key interaction', fakeAsync(() => {
            spyOn(select.onOpening, 'emit');
            spyOn(select.onOpened, 'emit');
            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');
            spyOn(select, 'open').and.callThrough();
            spyOn(select, 'close').and.callThrough();
            spyOn(select, 'toggle').and.callThrough();

            inputElement.triggerEventHandler('keydown', enterKeyEvent);
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 0, 0);

            inputElement.triggerEventHandler('keydown', escapeKeyEvent);
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 1, 0);
        }));
        it('Should properly emit opening/closing events on SPACE/ESC key interaction', fakeAsync(() => {
            spyOn(select.onOpening, 'emit');
            spyOn(select.onOpened, 'emit');
            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');
            spyOn(select, 'open').and.callThrough();
            spyOn(select, 'close').and.callThrough();
            spyOn(select, 'toggle').and.callThrough();

            inputElement.triggerEventHandler('keydown', spaceKeyEvent);
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 0, 0);

            inputElement.triggerEventHandler('keydown', escapeKeyEvent);
            tick();
            fixture.detectChanges();
            verifyOpenCloseEvents(1, 1, 0);
        }));
        it('Should navigate through dropdown items using Up/Down/Home/End keys', fakeAsync(() => {
            let currentItemIndex = 0;

            select.toggle();
            tick();
            fixture.detectChanges();

            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(currentItemIndex);

            currentItemIndex++;
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(currentItemIndex);

            currentItemIndex = select.items.length - 1;
            inputElement.triggerEventHandler('keydown', endKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(currentItemIndex);

            currentItemIndex--;
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(currentItemIndex);

            currentItemIndex--;
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(currentItemIndex);

            currentItemIndex = 0;
            inputElement.triggerEventHandler('keydown', homeKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(currentItemIndex);
        }));
        it('Should navigate through items skipping the disabled ones when dropdown is opened', fakeAsync(() => {
            let focusedItemIndex = 1;

            select.items[0].disabled = true;
            select.items[2].disabled = true;
            select.items[3].disabled = true;
            select.items[select.items.length - 1].disabled = true;
            fixture.detectChanges();

            select.toggle();
            tick();
            fixture.detectChanges();

            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(focusedItemIndex);

            // Skip two disabled items
            focusedItemIndex = 4;
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(focusedItemIndex);

            // Focus the element before the last one as it is disabled
            focusedItemIndex = select.items.length - 2;
            inputElement.triggerEventHandler('keydown', endKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(focusedItemIndex);

            focusedItemIndex--;
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(focusedItemIndex);

            // Home key should focus second item since the first one is disabled
            focusedItemIndex = 1;
            inputElement.triggerEventHandler('keydown', homeKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(focusedItemIndex);
        }));
        it('Should navigate and select items skipping the disabled ones when dropdown is closed', fakeAsync(() => {
            //select.items[0].selected = true;
            let selectedItemIndex = 1;

            select.items[0].disabled = true;
            select.items[2].disabled = true;
            select.items[3].disabled = true;
            select.items[select.items.length - 1].disabled = true;
            fixture.detectChanges();

            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);

            // Skip two disabled items
            selectedItemIndex = 4;
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);

            // Select item before the last one
            selectedItemIndex = select.items.length - 2;
            tick();
            fixture.detectChanges();
            // The item before the last one should remain selected
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);
        }));
        it('Should start navigation from selected item when dropdown is opened', fakeAsync(() => {
            let selectedItem = select.items[4];
            let focusedItemIndex = selectedItem.index + 1;

            select.selectItem(select.items[4]);
            fixture.detectChanges();

            select.toggle();
            tick();
            fixture.detectChanges();

            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            expect(selectedItem.selected).toBeTruthy();
            verifyFocusedItem(focusedItemIndex);

            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            inputElement.triggerEventHandler('keydown', enterKeyEvent);
            tick();
            fixture.detectChanges();

            select.toggle();
            tick();
            fixture.detectChanges();

            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            selectedItem = select.items[7];
            focusedItemIndex = selectedItem.index - 1;
            verifyFocusedItem(focusedItemIndex);
        }));
        it('Should start navigation from selected item when dropdown is closed', fakeAsync(() => {
            let selectedItemIndex = 4;
            select.items[selectedItemIndex].selected = true;

            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(++selectedItemIndex);

            selectedItemIndex = 10;
            select.items[selectedItemIndex].selected = true;
            fixture.detectChanges();
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(--selectedItemIndex);

            // Arrow down stays on the last item if selected
            selectedItemIndex = select.items.length - 1;
            select.items[selectedItemIndex].selected = true;
            fixture.detectChanges();
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);

            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(--selectedItemIndex);

            // Arrow up stays on the first item if selected
            selectedItemIndex = 0;
            select.items[selectedItemIndex].selected = true;
            fixture.detectChanges();
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);
        }));
        it('Should navigate through items using Up/Down keys until there are items when dropdown is opened', fakeAsync(() => {
            select.items[0].selected = true;

            select.toggle();
            tick();
            fixture.detectChanges();

            for (let focusedItemIndex = 1; focusedItemIndex < select.items.length; focusedItemIndex++) {
                inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                tick();
                fixture.detectChanges();
                verifyFocusedItem(focusedItemIndex);
            }

            // Verify the focus stays on the last item
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(select.items.length - 1);

            for (let focusedItemIndex = select.items.length - 2; focusedItemIndex > -1; focusedItemIndex--) {
                inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
                tick();
                fixture.detectChanges();
                verifyFocusedItem(focusedItemIndex);
            }

            // Verify the focus stays on the first item
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifyFocusedItem(0);
        }));
        it('Should navigate through items using Up/Down keys until there are items when dropdown is closed', fakeAsync(() => {
            select.items[0].selected = true;

            for (let itemIndex = 1; itemIndex < select.items.length; itemIndex++) {
                inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                tick();
                fixture.detectChanges();
                verifySelectedItem(itemIndex);
            }

            // Verify the last item remains selected
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(select.items.length - 1);

            for (let itemIndex = select.items.length - 2; itemIndex > -1; itemIndex--) {
                inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
                tick();
                fixture.detectChanges();
                verifySelectedItem(itemIndex);
            }

            // Verify the first item remains selected
            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(0);
        }));
        it('Should navigate to item which value starts with a certain character by pressing the corresponding key when dropdown is opened',
            fakeAsync(() => {
                // TODO
            }));
        it('Character key navigation when dropdown is opened should be case insensitive', fakeAsync(() => {
            // TODO
        }));
        it('Character key navigation when dropdown is opened should wrap selection',
            fakeAsync(() => {
                // TODO
            }));
        it('Should filter and navigate items properly when pressing foreign character', fakeAsync(() => {
            // TODO
            // test with german/cirillyc letters
        }));
        it('Should not change focus when pressing non-matching character and dropdown is opened', fakeAsync(() => {
            // TODO
        }));
        it('Should select item which value starts with a certain character by pressing the corresponding key when dropdown is closed',
            fakeAsync(() => {
                // TODO
            }));
        it('Character key navigation when dropdown is closed should be case insensitive', fakeAsync(() => {
            // TODO
        }));
        it('Character key navigation when dropdown is closed should wrap selection',
            fakeAsync(() => {
                // TODO
            }));
        it('Should filter and select items properly when pressing foreign character', fakeAsync(() => {
            // TODO
            // test with german letters
        }));
        it('Should not change selection when pressing non-matching character and dropdown is closed', fakeAsync(() => {
            // TODO
            // press q - there is not an item that starts with q
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
        'Amsterdam'];
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
