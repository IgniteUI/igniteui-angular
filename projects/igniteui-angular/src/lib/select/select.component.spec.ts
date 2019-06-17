import { IgxInputState } from './../directives/input/input.directive';
import { Component, ViewChild, DebugElement, OnInit } from '@angular/core';
import { async, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { FormsModule, FormGroup, FormBuilder, FormControl, Validators, ReactiveFormsModule, NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxDropDownModule } from '../drop-down/index';
import { IgxIconModule } from '../icon/index';
import { IgxInputGroupModule } from '../input-group/index';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSelectComponent} from './select.component';
import { IgxSelectItemComponent } from './select-item.component';
import { ISelectionEventArgs } from '../drop-down/drop-down.common';
import { IgxToggleModule, IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import { configureTestSuite } from '../test-utils/configure-suite';
import { HorizontalAlignment, VerticalAlignment, ConnectedPositioningStrategy, AbsoluteScrollStrategy } from '../services';
import { IgxSelectModule } from './select.module';
import { wait } from '../test-utils/ui-interactions.spec';

const CSS_CLASS_INPUT_GROUP = 'igx-input-group';
const CSS_CLASS_INPUT = 'igx-input-group__input';
const CSS_CLASS_TOGGLE_BUTTON = 'igx-icon';
const CSS_CLASS_DROPDOWN_LIST = 'igx-drop-down__list--select';
const CSS_CLASS_DROPDOWN_LIST_ITEM = 'igx-drop-down__item';
const CSS_CLASS_SELECTED_ITEM = 'igx-drop-down__item--selected';
const CSS_CLASS_DISABLED_ITEM = 'igx-drop-down__item--disabled';
const CSS_CLASS_FOCUSED_ITEM = 'igx-drop-down__item--focused';
const CSS_CLASS_INPUT_GROUP_BOX = 'igx-input-group--box';
const CSS_CLASS_INPUT_GROUP_BORDER = 'igx-input-group--border';
const CSS_CLASS_INPUT_GROUP_COMFORTABLE = 'igx-input-group--comfortable';
const CSS_CLASS_INPUT_GROUP_COSY = 'igx-input-group--cosy';
const CSS_CLASS_INPUT_GROUP_COMPACT = 'igx-input-group--compact';

const arrowDownKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
const arrowUpKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
const altArrowDownKeyEvent = new KeyboardEvent('keydown', { altKey: true, key: 'ArrowDown' });
const altArrowUpKeyEvent = new KeyboardEvent('keydown', { altKey: true, key: 'ArrowUp' });
const spaceKeyEvent = new KeyboardEvent('keydown', { key: 'Space' });
const escapeKeyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
const endKeyEvent = new KeyboardEvent('keydown', { key: 'End' });
const homeKeyEvent = new KeyboardEvent('keydown', { key: 'Home' });
const tabKeyEvent = new KeyboardEvent('keydown', { key: 'Tab' });
const shiftTabKeysEvent = new KeyboardEvent('keydown', { 'key': 'Tab', shiftKey: true });

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
                IgxSelectGroupsComponent,
                IgxSelectMiddleComponent,
                IgxSelectTopComponent,
                IgxSelectBottomComponent,
                IgxSelectAffixComponent,
                IgxSelectReactiveFormComponent,
                IgxSelectTemplateFormComponent
            ],
            imports: [
                FormsModule,
                ReactiveFormsModule,
                IgxDropDownModule,
                IgxIconModule,
                IgxInputGroupModule,
                IgxSelectModule,
                IgxToggleModule,
                NoopAnimationsModule
            ]
        }).compileComponents();
    }));

    describe('General tests: ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            select = fixture.componentInstance.select;
            fixture.detectChanges();
            tick();
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
        }));
        it('should initialize the select component properly', fakeAsync(() => {
            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            expect(fixture.componentInstance).toBeDefined();
            expect(select).toBeDefined();
            expect(inputGroup).toBeTruthy();
            expect(select.placeholder).toBeDefined();
            expect(select.value).toBeUndefined();
            expect(select.disabled).toBeFalsy();
            expect(select.overlaySettings).toBeUndefined();
            expect(select.collapsed).toBeDefined();
            expect(select.collapsed).toBeTruthy();
            select.open();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
        }));
        it('should properly accept input properties', fakeAsync(() => {
            expect(select.width).toEqual('300px');
            expect(select.height).toEqual('200px');
            expect(select.maxHeight).toEqual('256px');
            expect(select.disabled).toBeFalsy();
            expect(select.placeholder).toEqual('Choose a city');
            expect(select.value).toBeUndefined();
            expect(select.type).toEqual('line');
            expect(select.displayDensity).toEqual('comfortable');
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
            select.displayDensity = 'compact';
            expect(select.displayDensity).toEqual('compact');
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
                positionStrategy: new ConnectedPositioningStrategy(
                    positionSettings
                ),
                scrollStrategy: new AbsoluteScrollStrategy()
            };
            select.overlaySettings = customOverlaySettings;
            expect(select.overlaySettings).toBe(customOverlaySettings);

            expect(select.collapsed).toBeTruthy();
            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
            select.disabled = true;
            expect(select.disabled).toBeTruthy();
        }));
        it('should open dropdown on input click', fakeAsync(() => {
            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            expect(select.collapsed).toBeTruthy();

            inputGroup.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
        }));
        it('should close dropdown on item click', fakeAsync(() => {
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
        it('should close dropdown on clicking selected item', fakeAsync(() => {
            spyOn(select.onSelection, 'emit');
            select.items[1].selected = true;
            select.open();
            fixture.detectChanges();
            const selectedItemEl = selectList.children[1];
            expect(select.collapsed).toBeFalsy();
            selectedItemEl.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();

            select.open();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
            selectedItemEl.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
            expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
        }));
        it('should toggle dropdown on toggle button click', fakeAsync(() => {
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
        it('should toggle dropdown using API methods', fakeAsync(() => {
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
        it('should not display dropdown list when no select items', fakeAsync(() => {
            fixture.componentInstance.items = [];
            fixture.detectChanges();

            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            inputGroup.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
            expect(selectList.nativeElement.classList.contains('igx-toggle--hidden')).toBeTruthy();
        }));
        it('should properly emit opening/closing events on input click', fakeAsync(() => {
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
        it('should properly emit closing events on item click', fakeAsync(() => {
            const selectedItemEl = selectList.children[2];

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');

            selectedItemEl.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(select.onClosed.emit).toHaveBeenCalledTimes(1);
        }));
        it('should properly emit opening/closing events on toggle button click', fakeAsync(() => {
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
        it('should emit closing events on input blur', fakeAsync(() => {
            spyOn(select.onClosing, 'emit');
            spyOn(select.onClosed, 'emit');

            expect(select).toBeDefined();
            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            inputElement.nativeElement.dispatchEvent(new Event('blur'));
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
            expect(select.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(select.onClosed.emit).toHaveBeenCalledTimes(1);
        }));
        it('should render aria attributes properly', fakeAsync(() => {
            const dropdownListElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            const toggleBtn = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLE_BUTTON));
            expect(inputElement.nativeElement.getAttribute('role')).toEqual('combobox');
            expect(inputElement.nativeElement.getAttribute('aria-haspopup')).toEqual('listbox');
            expect(inputElement.nativeElement.getAttribute('aria-owns')).toEqual(select.listId);
            expect(inputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
            expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');
            expect(dropdownListElement.nativeElement.getAttribute('role')).toEqual('listbox');
            expect(dropdownListElement.nativeElement.getAttribute('aria-hidden')).toEqual('true');

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(inputElement.nativeElement.getAttribute('aria-expanded')).toEqual('true');
            expect(dropdownListElement.nativeElement.getAttribute('aria-hidden')).toEqual('false');

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(inputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
            expect(dropdownListElement.nativeElement.getAttribute('aria-hidden')).toEqual('true');
        }));
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
        it('should render input type properly', () => {
            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            // Default type is 'line'
            expect(select.type).toEqual('line');
            expect(inputGroup.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_BOX)).toBeFalsy();
            expect(inputGroup.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_BORDER)).toBeFalsy();
            select.type = 'box';
            fixture.detectChanges();
            expect(inputGroup.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_BOX)).toBeTruthy();
            select.type = 'border';
            fixture.detectChanges();
            expect(inputGroup.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_BORDER)).toBeTruthy();
        });
        it('should render display density properly', () => {
            const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
            // Default display density is 'comfortable'
            expect(select.displayDensity).toEqual('comfortable');
            expect(inputGroup.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_COMFORTABLE)).toBeTruthy();
            select.displayDensity = 'cosy';
            fixture.detectChanges();
            expect(inputGroup.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_COSY)).toBeTruthy();
            select.displayDensity = 'compact';
            fixture.detectChanges();
            expect(inputGroup.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_COMPACT)).toBeTruthy();
        });
        it('should close dropdown on blur', fakeAsync(() => {
            expect(select.collapsed).toBeTruthy();

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            inputElement.nativeElement.dispatchEvent(new Event('blur'));
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        }));
    });
    describe('Form tests: ', () => {
        it('Should properly initialize when used as a reactive form control - with validators', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxSelectReactiveFormComponent);
            fix.detectChanges();
            const selectComp = fix.componentInstance.select;
            const selectFormReference = fix.componentInstance.reactiveForm.controls.optionsSelect;
            expect(selectFormReference).toBeDefined();
            expect(selectComp).toBeDefined();
            expect(selectComp.selectedItem).toBeUndefined();
            expect(selectComp.value).toEqual('');
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
        }));
        it('Should properly initialize when used as a reactive form control - without validators', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxSelectReactiveFormComponent);
            fix.detectChanges();
            const selectComp = fix.componentInstance.select;
            const formGroup: FormGroup = fix.componentInstance.reactiveForm;
            fix.componentInstance.removeValidators(formGroup);
            const selectFormReference = fix.componentInstance.reactiveForm.controls.optionsSelect;
            expect(selectFormReference).toBeDefined();
            expect(selectComp).toBeDefined();
            expect(selectComp.selectedItem).toBeUndefined();
            expect(selectComp.value).toEqual('');
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

        }));

        it('Should properly initialize when used as a form control - with validators', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxSelectTemplateFormComponent);
            fix.detectChanges();
            const selectComp = fix.componentInstance.select;
            const selectFormReference = fix.componentInstance.ngForm.form;
            expect(selectFormReference).toBeDefined();
            expect(selectComp).toBeDefined();
            tick();
            fix.detectChanges();
            expect(selectComp.selectedItem).toBeUndefined();
            expect(selectComp.value).toBeNull();
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
        }));
        it('Should properly initialize when used as a form control - without validators', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxSelectTemplateFormComponent);
            fix.detectChanges();
            const selectComp = fix.componentInstance.select;
            const selectFormReference = fix.componentInstance.ngForm.form;
            selectFormReference.clearValidators();
            selectComp.required = false;

            expect(selectFormReference).toBeDefined();
            expect(selectComp).toBeDefined();
            expect(selectComp.selectedItem).toBeUndefined();
            expect(selectComp.value).toBeUndefined();
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
        }));
    });
    describe('Selection tests: ', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            select = fixture.componentInstance.select;
            fixture.detectChanges();
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
        }));
        it('should select item with mouse click', fakeAsync(() => {
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
        it('should select item with API selectItem() method', fakeAsync(() => {
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
        it('should select item on setting value property', fakeAsync(() => {
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
        it('should select item with ENTER/SPACE keys', fakeAsync(() => {
            let selectedItemIndex = 2;
            select.toggle();
            tick();
            fixture.detectChanges();
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            inputElement.triggerEventHandler('keydown', spaceKeyEvent);
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);

            selectedItemIndex = 4;
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
        it('should allow single selection only', fakeAsync(() => {
            let selectedItemIndex = 5;
            select.toggle();
            tick();
            fixture.detectChanges();
            selectList.children[selectedItemIndex].nativeElement.click();
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);

            selectedItemIndex = 15;
            select.selectItem(select.items[selectedItemIndex]);
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);

            selectedItemIndex = 8;
            select.value = select.items[selectedItemIndex].value.toString();
            fixture.detectChanges();
            tick();
            verifySelectedItem(selectedItemIndex);
        }));
        it('should clear selection when value property does not match any item', fakeAsync(() => {
            const selectedItemIndex = 5;
            select.value = select.items[selectedItemIndex].value.toString();
            fixture.detectChanges();
            tick();
            verifySelectedItem(selectedItemIndex);

            select.value = 'Ghost city';
            tick();
            fixture.detectChanges();
            const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
            expect(selectedItems.length).toEqual(0);
            expect(select.selectedItem).toBeUndefined();
            expect(select.input.value).toEqual('');
        }));
        it('should focus first item in dropdown if there is not selected item', fakeAsync(() => {
            const focusedItemIndex = 0;
            const selectedItemIndex = 8;
            select.toggle();
            tick();
            fixture.detectChanges();
            verifyFocusedItem(focusedItemIndex);

            selectList.children[selectedItemIndex].nativeElement.click();
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);
            expect(select.items[focusedItemIndex].isFocused).toBeFalsy();

            // Unselect selected item
            select.value = '';
            fixture.detectChanges();

            select.toggle();
            tick();
            fixture.detectChanges();
            verifyFocusedItem(focusedItemIndex);
        }));
        it('should populate the input box with the selected item value', fakeAsync(() => {
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
            selectedItemIndex = 8;
            selectedItemValue = select.items[selectedItemIndex].value;
            select.value = select.items[selectedItemIndex].value.toString();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            checkInputValue();
        }));
        it('should not append any text to the input box when no item is selected and value is not set or does not match any item',
            fakeAsync(() => {
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
        it('should not append any text to the input box when an item is focused but not selected',
            fakeAsync(() => {
                let focusedItem = select.items[2];
                const navigationStep = focusedItem.index;

                const navigateDropdownItems = function (keydownEvent: KeyboardEvent) {
                    for (let index = 0; index < navigationStep; index++) {
                        inputElement.triggerEventHandler('keydown', keydownEvent);
                    }
                    tick();
                    fixture.detectChanges();
                };

                const verifyFocusedItemIsNotSelected = function () {
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
                verifyFocusedItemIsNotSelected();

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
                verifyFocusedItemIsNotSelected();

                // Change focused item when there is a selected item
                navigateDropdownItems(arrowUpKeyEvent);
                focusedItem = select.items[selectedItem.index - navigationStep * 2];
                verifyFocusedItemIsNotSelected();
            }));
        it('should not select disabled item', () => {
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
        it('should remove selection if option has been removed', fakeAsync(() => {
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
        it('should select first match out of duplicated values', fakeAsync(() => {
            fixture.componentInstance.items = ['Paris', 'London', 'Paris', 'Hamburg', 'London'];
            fixture.detectChanges();

            let selectedItemIndex = 4;
            select.toggle();
            tick();
            fixture.detectChanges();

            select.items[selectedItemIndex].element.nativeElement.click();
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);

            const previousItem = select.items[selectedItemIndex];
            selectedItemIndex = 1;
            select.items[selectedItemIndex].element.nativeElement.click();
            tick();
            fixture.detectChanges();
            verifySelectedItem(selectedItemIndex);
            expect(previousItem.focused).toBeFalsy();
        }));
        it('should not change selection when setting value to non-existing item', fakeAsync(() => {
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

            // Throws an error 'Cannot read property disabled of null'
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
        it('should properly emit onSelection event on item click', fakeAsync(() => {
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
        it('should properly emit onSelection event on item selected property setting', () => {
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
        it('should properly emit onSelection/Close events on key interaction', fakeAsync(() => {
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
                for (let itemIndex = 0; itemIndex < selectedItem.index; itemIndex++) {
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
        it('should properly emit onSelection event on value setting', fakeAsync(() => {
            spyOn(select.onSelection, 'emit');
            spyOn(select, 'selectItem').and.callThrough();

            // select.value = select.items[4].value.toString();
            // fixture.detectChanges();
            // tick();
            // expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
            // expect(select.selectItem).toHaveBeenCalledTimes(1);
            // expect(select.onSelection.emit).toHaveBeenCalledWith(null);

            // select.value = 'Padua';
            // fixture.detectChanges();
            // expect(select.onSelection.emit).toHaveBeenCalledTimes(2);
            // expect(select.selectItem).toHaveBeenCalledTimes(2);
            // expect(select.onSelection.emit).toHaveBeenCalledWith(null);

            // // onSelection should not be fired when value is set to non-existing item
            // select.value = 'Ghost city';
            // fixture.detectChanges();
            // expect(select.onSelection.emit).toHaveBeenCalledTimes(2);
            // expect(select.selectItem).toHaveBeenCalledTimes(2);
        }));
        it('should properly emit onSelection event using selectItem method', () => {
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

        it('should not emit onSelection when selection does not change', () => {
            const item = select.items[5];
            spyOn(select.onSelection, 'emit');
            select.selectItem(item);
            expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
            select.selectItem(item);
            expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
            select.selectItem(item);
            expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
            select.selectItem(item);
            expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
        });

        it('should not select header items passed through selectItem method', () => {
            const item = select.items[5];
            spyOn(select.onSelection, 'emit');
            expect(select.selectedItem).toBeFalsy();
            item.isHeader = true;
            select.selectItem(item);
            expect(select.selectedItem).toBeFalsy();
            expect(select.onSelection.emit).not.toHaveBeenCalled();
        });
    });
    describe('Grouped items tests: ', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxSelectGroupsComponent);
            select = fixture.componentInstance.select;
            fixture.detectChanges();
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
        }));
        it('should select group item and close dropdown with mouse click', fakeAsync(() => {
            const groupIndex = 0;
            const groupElement = selectList.children[groupIndex];
            const selectedItemIndex = 2;
            const selectedItemElement = groupElement.children[selectedItemIndex].nativeElement;

            select.toggle();
            tick();
            fixture.detectChanges();
            selectedItemElement.click();
            tick();
            fixture.detectChanges();
            expect(select.input.value).toEqual(select.items[selectedItemIndex - 1].value);
            expect(select.value).toEqual(select.items[selectedItemIndex - 1].value);
            const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
            expect(selectedItems.length).toEqual(1);
            expect(selectedItemElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeTruthy();
            expect(select.selectedItem).toBe(select.items[selectedItemIndex - 1] as IgxSelectItemComponent);
            expect(select.items[selectedItemIndex - 1].selected).toBeTruthy();
            expect(select.collapsed).toBeTruthy();
        }));
        it('should select group item on setting value property', fakeAsync(() => {
            const groupIndex = 1;
            const groupElement = selectList.children[groupIndex];
            const selectedItemIndex = 2;
            const selectedItemElement = groupElement.children[selectedItemIndex].nativeElement;
            const itemIndex = 4;

            select.value = select.items[itemIndex].value.toString();
            tick();
            fixture.detectChanges();
            expect(select.input.value).toEqual(select.items[itemIndex].value);
            expect(select.value).toEqual(select.items[itemIndex].value);
            const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
            expect(selectedItems.length).toEqual(1);
            expect(selectedItemElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeTruthy();
            expect(select.selectedItem).toBe(select.items[itemIndex] as IgxSelectItemComponent);
            expect(select.items[itemIndex].selected).toBeTruthy();
        }));
        it('should not select on setting value property to group header', fakeAsync(() => {
            const groupIndex = 0;
            const groupElement = selectList.children[groupIndex].nativeElement;

            select.value = fixture.componentInstance.locations[groupIndex].continent;
            tick();
            fixture.detectChanges();
            expect(select.input.value).toEqual('');
            const selectedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_SELECTED_ITEM));
            expect(selectedItems.length).toEqual(0);
            expect(groupElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toBeFalsy();
            expect(select.selectedItem).toBeUndefined();
        }));
        it('should not focus group header in dropdown if there is not selected item', fakeAsync(() => {
            const groupElement = selectList.children[0];
            const focusedItemIndex = 1;
            const focusedItemElement = groupElement.children[focusedItemIndex].nativeElement;

            select.toggle();
            tick();
            fixture.detectChanges();
            const focusedItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_FOCUSED_ITEM));
            expect(focusedItems.length).toEqual(1);
            expect(focusedItemElement.classList.contains(CSS_CLASS_FOCUSED_ITEM)).toBeTruthy();
            expect(select.focusedItem).toBe(select.items[0]);
            expect(select.items[0].isFocused).toBeTruthy();
            expect(groupElement.nativeElement.classList.contains(CSS_CLASS_FOCUSED_ITEM)).toBeFalsy();
        }));
    });
    describe('Key navigation tests: ', () => {
        beforeEach(async(() => {
            fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            select = fixture.componentInstance.select;
            fixture.detectChanges();
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
            selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
        }));
        it('should toggle dropdown on ALT+ArrowUp/Down keys interaction', fakeAsync(() => {
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
        it('should toggle dropdown on pressing ENTER key', fakeAsync(() => {
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
        it('should toggle dropdown on pressing SPACE key', fakeAsync(() => {
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
        it('should close dropdown on pressing ESC/TAB/SHIFT+TAB key', fakeAsync(() => {
            expect(select.collapsed).toBeTruthy();

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();

            inputElement.triggerEventHandler('keydown', escapeKeyEvent);
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
            inputElement.triggerEventHandler('keydown', tabKeyEvent);
            inputElement.nativeElement.dispatchEvent(new Event('blur'));
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();

            select.toggle();
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeFalsy();
            inputElement.triggerEventHandler('keydown', shiftTabKeysEvent);
            inputElement.nativeElement.dispatchEvent(new Event('blur'));
            tick();
            fixture.detectChanges();
            expect(select.collapsed).toBeTruthy();
        }));
        it('should properly emit opening/closing events on ALT+ArrowUp/Down keys interaction', fakeAsync(() => {
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
        it('should properly emit opening/closing events on ENTER/ESC key interaction', fakeAsync(() => {
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
        it('should properly emit opening/closing events on SPACE/ESC key interaction', fakeAsync(() => {
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
        it('should navigate through dropdown items using Up/Down/Home/End keys', fakeAsync(() => {
            let currentItemIndex = 0;
            select.toggle();
            tick();
            fixture.detectChanges();

            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            tick();
            fixture.detectChanges();
            currentItemIndex++;
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
        it('should navigate through items skipping the disabled ones when dropdown is opened', fakeAsync(() => {
            let focusedItemIndex = 1;
            select.items[0].disabled = true;
            select.items[2].disabled = true;
            select.items[3].disabled = true;
            select.items[select.items.length - 1].disabled = true;
            fixture.detectChanges();

            select.toggle();
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
        it('should navigate and select items skipping the disabled ones when dropdown is closed', (done) => {
            let selectedItemIndex = 1;
            select.items[0].disabled = true;
            select.items[2].disabled = true;
            select.items[3].disabled = true;
            select.items[select.items.length - 1].disabled = true;
            fixture.detectChanges();
            inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
            setTimeout(() => {
                fixture.detectChanges();
                verifySelectedItem(selectedItemIndex);

                // Skip two disabled items
                selectedItemIndex = 4;
                inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                setTimeout(() => {
                    fixture.detectChanges();
                    verifySelectedItem(selectedItemIndex);

                    // Select item before the last one
                    selectedItemIndex = select.items.length - 2;
                    select.toggle();
                    fixture.detectChanges();
                    selectList.children[selectedItemIndex].nativeElement.click();
                    setTimeout(() => {
                        fixture.detectChanges();
                        // The item before the last one should remain selected
                        inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                        setTimeout(() => {
                            fixture.detectChanges();
                            verifySelectedItem(selectedItemIndex);
                            done();
                        }, 5);
                    }, 5);
                }, 5);
            }, 5);
        });
        it('should start navigation from selected item when dropdown is opened', fakeAsync(() => {
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
        it('should start navigation from selected item when dropdown is closed', (done) => {
            let selectedItemIndex = 4;
            select.toggle();
            fixture.detectChanges();
            selectList.children[selectedItemIndex].nativeElement.click();
            setTimeout(() => {
                fixture.detectChanges();
                inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                setTimeout(() => {
                    fixture.detectChanges();
                    verifySelectedItem(++selectedItemIndex);
                    selectedItemIndex = select.items.length - 1;
                    select.toggle();
                    fixture.detectChanges();
                    selectList.children[selectedItemIndex].nativeElement.click();
                    setTimeout(() => {
                        // Does not wrap selection - arrow down stays on the last item if selected
                        fixture.detectChanges();
                        inputElement.triggerEventHandler('keydown', arrowDownKeyEvent);
                        setTimeout(() => {
                            fixture.detectChanges();
                            verifySelectedItem(selectedItemIndex);
                            inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
                            setTimeout(() => {
                                fixture.detectChanges();
                                verifySelectedItem(--selectedItemIndex);
                                // Does not wrap selection - arrow up stays on the first item if selected
                                selectedItemIndex = 0;
                                select.toggle();
                                fixture.detectChanges();
                                selectList.children[selectedItemIndex].nativeElement.click();
                                setTimeout(() => {
                                    fixture.detectChanges();
                                    inputElement.triggerEventHandler('keydown', arrowUpKeyEvent);
                                    setTimeout(() => {
                                        fixture.detectChanges();
                                        verifySelectedItem(selectedItemIndex);
                                        done();
                                    }, 5);
                                }, 5);
                            }, 5);
                        }, 5);
                    }, 5);
                }, 5);
            }, 5);
        });
        it('should navigate through items using Up/Down keys until there are items when dropdown is opened', fakeAsync(() => {
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
        it('should navigate through items using Up/Down keys until there are items when dropdown is closed', fakeAsync(() => {
            for (let itemIndex = 0; itemIndex < select.items.length; itemIndex++) {
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
        it('should filter and navigate through items on character key navigation when dropdown is opened',
            fakeAsync(() => {
                select.open();
                tick();
                fixture.detectChanges();

                const filteredItemsInxs = fixture.componentInstance.filterCities('pa');
                for (let index = 0; index < filteredItemsInxs.length; index++) {
                    inputElement.triggerEventHandler('keyup', { key: 'p' });
                    tick();
                    fixture.detectChanges();
                    inputElement.triggerEventHandler('keyup', { key: 'a' });
                    tick();
                    fixture.detectChanges();
                    verifyFocusedItem(filteredItemsInxs[index]);
                    tick(500);
                    fixture.detectChanges();
                }
            }));
        it('Character key navigation when dropdown is opened should be case insensitive', fakeAsync(() => {
            select.open();
            tick();
            fixture.detectChanges();

            const filteredItemsInxs = fixture.componentInstance.filterCities('l');
            inputElement.triggerEventHandler('keyup', { key: 'l' });
            tick();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[0]);
            tick(500);
            fixture.detectChanges();

            inputElement.triggerEventHandler('keyup', { key: 'L' });
            tick();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[1]);
            tick(500);
            fixture.detectChanges();
        }));
        it('Character key navigation when dropdown is opened should wrap selection',
            fakeAsync(() => {
                select.open();
                tick();
                fixture.detectChanges();

                const filteredItemsInxs = fixture.componentInstance.filterCities('l');
                for (let index = 0; index < filteredItemsInxs.length; index++) {
                    inputElement.triggerEventHandler('keyup', { key: 'l' });
                    tick();
                    fixture.detectChanges();
                    verifyFocusedItem(filteredItemsInxs[index]);
                    tick(500);
                    fixture.detectChanges();
                }
                // Navigate back to the first filtered item to verify that selection is wrapped
                inputElement.triggerEventHandler('keyup', { key: 'l' });
                tick();
                fixture.detectChanges();
                verifyFocusedItem(filteredItemsInxs[0]);
                tick(500);
                fixture.detectChanges();
            }));
        it('should filter and navigate items properly when pressing non-english character', fakeAsync(() => {
            fixture.componentInstance.items = [
                'Berlin',
                'Überherrn',
                'София',
                'München',
                'Überlingen',
                'Stuttgart',
                'Смолян',
                'Übersee',
                'Бургас',
                'Karlsruhe',
                'Östringen'];
            fixture.detectChanges();
            select.open();
            tick();
            fixture.detectChanges();

            // German characters
            let filteredItemsInxs = fixture.componentInstance.filterCities('ü');
            for (let index = 0; index < filteredItemsInxs.length; index++) {
                inputElement.triggerEventHandler('keyup', { key: 'ü' });
                tick();
                fixture.detectChanges();
                verifyFocusedItem(filteredItemsInxs[index]);
                tick(500);
                fixture.detectChanges();
            }

            // Ciryllic characters
            filteredItemsInxs = fixture.componentInstance.filterCities('с');
            for (let index = 0; index < filteredItemsInxs.length; index++) {
                inputElement.triggerEventHandler('keyup', { key: 'с' });
                tick();
                fixture.detectChanges();
                verifyFocusedItem(filteredItemsInxs[index]);
                tick(500);
                fixture.detectChanges();
            }
        }));
        it('should not change focus when pressing non-matching character and dropdown is opened', fakeAsync(() => {
            select.open();
            tick();
            fixture.detectChanges();

            const filteredItemsInxs = fixture.componentInstance.filterCities('l');
            inputElement.triggerEventHandler('keyup', { key: 'l' });
            tick();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[0]);
            tick(500);
            fixture.detectChanges();

            // Verify that focus is unchanged
            inputElement.triggerEventHandler('keyup', { key: 'w' });
            tick();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[0]);
            tick(500);
            fixture.detectChanges();
        }));
        it('should filter and select items on character key navigation when dropdown is closed',
            fakeAsync(() => {
                const filteredItemsInxs = fixture.componentInstance.filterCities('pa');
                for (let index = 0; index < filteredItemsInxs.length; index++) {
                    inputElement.triggerEventHandler('keyup', { key: 'p' });
                    tick();
                    fixture.detectChanges();
                    inputElement.triggerEventHandler('keyup', { key: 'a' });
                    tick();
                    fixture.detectChanges();
                    verifySelectedItem(filteredItemsInxs[index]);
                    tick(500);
                    fixture.detectChanges();
                }
            }));
        it('character key navigation when dropdown is closed should be case insensitive', fakeAsync(() => {
            const filteredItemsInxs = fixture.componentInstance.filterCities('l');
            inputElement.triggerEventHandler('keyup', { key: 'l' });
            tick();
            fixture.detectChanges();
            verifySelectedItem(filteredItemsInxs[0]);
            tick(500);
            fixture.detectChanges();

            inputElement.triggerEventHandler('keyup', { key: 'L' });
            tick();
            fixture.detectChanges();
            verifySelectedItem(filteredItemsInxs[1]);
            tick(500);
            fixture.detectChanges();
        }));
        it('character key navigation when dropdown is closed should wrap selection',
            fakeAsync(() => {
                const filteredItemsInxs = fixture.componentInstance.filterCities('l');
                for (let index = 0; index < filteredItemsInxs.length; index++) {
                    inputElement.triggerEventHandler('keyup', { key: 'l' });
                    tick();
                    fixture.detectChanges();
                    verifySelectedItem(filteredItemsInxs[index]);
                    tick(500);
                    fixture.detectChanges();
                }
                // Navigate back to the first filtered item to verify that selection is wrapped
                inputElement.triggerEventHandler('keyup', { key: 'l' });
                tick();
                fixture.detectChanges();
                verifySelectedItem(filteredItemsInxs[0]);
                tick(500);
                fixture.detectChanges();
            }));
        it('should filter and select items properly when pressing non-english characters', fakeAsync(() => {
            fixture.componentInstance.items = [
                'Berlin',
                'Überherrn',
                'София',
                'München',
                'Überlingen',
                'Stuttgart',
                'Смолян',
                'Übersee',
                'Бургас',
                'Karlsruhe',
                'Östringen'];
            fixture.detectChanges();

            // German characters
            let filteredItemsInxs = fixture.componentInstance.filterCities('ü');
            for (let index = 0; index < filteredItemsInxs.length; index++) {
                inputElement.triggerEventHandler('keyup', { key: 'ü' });
                tick();
                fixture.detectChanges();
                verifySelectedItem(filteredItemsInxs[index]);
                tick(500);
                fixture.detectChanges();
            }

            // Ciryllic characters
            filteredItemsInxs = fixture.componentInstance.filterCities('с');
            for (let index = 0; index < filteredItemsInxs.length; index++) {
                inputElement.triggerEventHandler('keyup', { key: 'с' });
                tick();
                fixture.detectChanges();
                verifySelectedItem(filteredItemsInxs[index]);
                tick(500);
                fixture.detectChanges();
            }
        }));
        it('should not change selection when pressing non-matching character and dropdown is closed', fakeAsync(() => {
            const filteredItemsInxs = fixture.componentInstance.filterCities('l');
            inputElement.triggerEventHandler('keyup', { key: 'l' });
            tick();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[0]);
            tick(500);
            fixture.detectChanges();

            // Verify that selection is unchanged
            inputElement.triggerEventHandler('keyup', { key: 'q' });
            tick();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[0]);
            tick(500);
            fixture.detectChanges();

            inputElement.triggerEventHandler('keyup', { key: 'l' });
            tick();
            fixture.detectChanges();
            verifyFocusedItem(filteredItemsInxs[1]);
            tick(500);
            fixture.detectChanges();
        }));

        it('Should navigate through items when dropdown is closed and initial value is passed', fakeAsync(() => {
            select.close();
            tick();
            fixture.detectChanges();
            spyOn(select, 'navigateNext').and.callThrough();
            const choices = select.children.toArray();
            select.value = choices[5].value;
            tick();
            fixture.detectChanges();
            select.input.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            tick();
            fixture.detectChanges();
            expect(select.navigateNext).toHaveBeenCalled();
            expect(select.value).toEqual(choices[6].value);
        }));
    });
    describe('Positioning tests: ', () => {
        const defaultWindowToListOffset = 5;
        const defaultItemLeftPadding = 16;
        const defaultItemTopPadding = 8;
        const defaultItemBottomPadding = 8;
        const defaultIconWidth = 24;
        const defaultTextIdent = 8;
        let visibleItems = 5;
        let hasScroll = true;
        let selectedItemIndex: number;
        let listRect: DOMRect;
        let inputRect: DOMRect;
        let selectedItemRect: DOMRect;
        let listTop: number;
        let listBottom: number;

        const getBoundingRectangles = function () {
            listRect = selectList.nativeElement.getBoundingClientRect();
            inputRect = inputElement.nativeElement.getBoundingClientRect();
            selectedItemRect = select.items[selectedItemIndex].element.nativeElement.getBoundingClientRect();
        };
        // Verifies that the selected item bounding rectangle is positioned over the input bounding rectangle
        const verifySelectedItemPositioning = function (reversed = false) {
            expect(selectedItemRect.left).toBeCloseTo(inputRect.left - defaultItemLeftPadding, 0);
            const expectedItemTop = reversed ? document.body.getBoundingClientRect().bottom - defaultWindowToListOffset -
                selectedItemRect.height :
                inputRect.top - defaultItemTopPadding;
            expect(selectedItemRect.top).toBeCloseTo(expectedItemTop, 0);
            const expectedItemBottom = reversed ? document.body.getBoundingClientRect().bottom - defaultWindowToListOffset :
                inputRect.bottom + defaultItemBottomPadding;
            expect(selectedItemRect.bottom).toBeCloseTo(expectedItemBottom, 0);
            expect(selectedItemRect.width).toEqual(selectList.nativeElement.scrollWidth);
        };
        const verifyListPositioning = function () {
            expect(listRect.left).toBeCloseTo(inputRect.left - defaultItemLeftPadding, 0);
            expect(listRect.top).toEqual(listTop);
            expect(listRect.bottom).toEqual(listBottom);
            expect(listRect.width).toBeCloseTo(inputRect.width + defaultIconWidth + defaultItemLeftPadding * 2, 0);
            const listHeight = hasScroll ? selectedItemRect.height * visibleItems + defaultItemTopPadding + defaultItemBottomPadding :
                selectedItemRect.height * visibleItems;
            expect(listRect.height).toEqual(listHeight);
        };

        describe('Ample space to open positioning tests: ', () => {
            beforeEach(async(() => {
                fixture = TestBed.createComponent(IgxSelectMiddleComponent);
                select = fixture.componentInstance.select;
                fixture.detectChanges();
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            }));
            it('should display selected item over input and all other items without scroll', fakeAsync(() => {
                hasScroll = false;
                visibleItems = 3;
                selectedItemIndex = 1;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height;
                listBottom = selectedItemRect.bottom + selectedItemRect.height;
                verifyListPositioning();

                selectedItemIndex = 2;
                select.toggle();
                tick();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height * 2;
                listBottom = selectedItemRect.bottom;
                verifyListPositioning();

                selectedItemIndex = 0;
                select.toggle();
                tick();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top;
                listBottom = selectedItemRect.bottom + selectedItemRect.height * 2;
                verifyListPositioning();
            }));
            it('should scroll and display selected item over input and all other possible items', fakeAsync(() => {
                visibleItems = 5;
                hasScroll = true;
                fixture.componentInstance.items = [
                    'Option 1',
                    'Option 2',
                    'Option 3',
                    'Option 4',
                    'Option 5',
                    'Option 6',
                    'Option 7'];
                fixture.detectChanges();

                selectedItemIndex = 3;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height * 2 - defaultItemTopPadding;
                listBottom = selectedItemRect.bottom + selectedItemRect.height * 2 + defaultItemBottomPadding;
                verifyListPositioning();

                selectedItemIndex = 6;
                select.toggle();
                tick();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height * 4 - defaultItemBottomPadding - defaultItemTopPadding;
                listBottom = selectedItemRect.bottom;
                verifyListPositioning();

                selectedItemIndex = 0;
                select.toggle();
                tick();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top;
                listBottom = selectedItemRect.bottom + selectedItemRect.height * 4 + defaultItemTopPadding + defaultItemBottomPadding;
                verifyListPositioning();
            }));
        });
        describe('Not enough space above to open positioning tests: ', () => {
            beforeEach(async(() => {
                fixture = TestBed.createComponent(IgxSelectTopComponent);
                select = fixture.componentInstance.select;
                fixture.detectChanges();
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
                visibleItems = 5;
                hasScroll = true;
            }));
            it('should display selected item over input when first item is selected',
                fakeAsync(() => {
                    selectedItemIndex = 0;
                    select.items[selectedItemIndex].selected = true;
                    fixture.detectChanges();
                    select.toggle();
                    tick();
                    fixture.detectChanges();
                    getBoundingRectangles();
                    verifySelectedItemPositioning();
                    listTop = selectedItemRect.top;
                    listBottom = selectedItemRect.bottom + selectedItemRect.height * 4 + defaultItemTopPadding + defaultItemBottomPadding;
                    verifyListPositioning();
                }));
            it('should display selected item over input and possible items above and below when item in the middle of the list is selected',
                fakeAsync(() => {
                    selectedItemIndex = 1;
                    select.items[selectedItemIndex].selected = true;
                    fixture.detectChanges();
                    select.toggle();
                    tick();
                    fixture.detectChanges();
                    getBoundingRectangles();
                    verifySelectedItemPositioning();
                    listTop = document.body.getBoundingClientRect().top + defaultWindowToListOffset;
                    listBottom = document.body.getBoundingClientRect().top + defaultWindowToListOffset + listRect.height;
                    verifyListPositioning();
                }));
            it('should display selected item and all possible items above when last item is selected',
                fakeAsync(() => {
                    selectedItemIndex = 6;
                    select.items[selectedItemIndex].selected = true;
                    fixture.detectChanges();
                    select.toggle();
                    tick();
                    fixture.detectChanges();
                    getBoundingRectangles();
                    listTop = selectedItemRect.top - selectedItemRect.height * 4 - defaultItemBottomPadding - defaultItemTopPadding;
                    listBottom = selectedItemRect.bottom;
                    verifyListPositioning();
                }));
        });
        describe('Not enough space below to open positioning tests: ', () => {
            beforeEach(async(() => {
                fixture = TestBed.createComponent(IgxSelectBottomComponent);
                select = fixture.componentInstance.select;
                fixture.detectChanges();
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
                visibleItems = 5;
                hasScroll = true;
            }));
            it('should display list with selected item and all possible items after it when first item is selected',
                fakeAsync(() => {
                    selectedItemIndex = 0;
                    select.items[selectedItemIndex].selected = true;
                    fixture.detectChanges();
                    select.toggle();
                    tick();
                    fixture.detectChanges();
                    getBoundingRectangles();
                    listTop = inputRect.bottom - selectedItemRect.height * 5 - defaultItemTopPadding - defaultItemBottomPadding;
                    listBottom = inputRect.bottom;
                    verifyListPositioning();
                }));
            it('should display selected item and all possible items above and below when item in the middle of the list is selected',
                fakeAsync(() => {
                    selectedItemIndex = 3;
                    select.items[selectedItemIndex].selected = true;
                    fixture.detectChanges();
                    select.toggle();
                    tick();
                    fixture.detectChanges();
                    getBoundingRectangles();
                    listTop = document.body.getBoundingClientRect().bottom - defaultWindowToListOffset -
                        selectedItemRect.height * 5 - defaultItemBottomPadding - defaultItemTopPadding;
                    listBottom = document.body.getBoundingClientRect().bottom - defaultWindowToListOffset;
                    verifyListPositioning();
                }));
            // tslint:disable-next-line:max-line-length
            it('should display list with selected item and all items before it and position selected item over input when last item is selected',
                fakeAsync(() => {
                    selectedItemIndex = 6;
                    select.items[selectedItemIndex].selected = true;
                    fixture.detectChanges();
                    select.toggle();
                    tick();
                    fixture.detectChanges();
                    getBoundingRectangles();
                    verifySelectedItemPositioning(true);
                    listTop = document.body.getBoundingClientRect().bottom - defaultWindowToListOffset - listRect.height;
                    listBottom = document.body.getBoundingClientRect().bottom - defaultWindowToListOffset;
                    verifyListPositioning();
                }));
        });
        describe('Input with affixes positioning tests: ', () => {
            const calculatePrefixesWidth = function () {
                let prefixesWidth = 0;
                const prefixes = fixture.debugElement.query(By.css('igx-prefix')).children;
                Array.from(prefixes).forEach((prefix: DebugElement) => {
                    const prefixRect = prefix.nativeElement.getBoundingClientRect();
                    prefixesWidth += prefixRect.width;
                });
                return prefixesWidth;
            };
            beforeEach(async(() => {
                fixture = TestBed.createComponent(IgxSelectAffixComponent);
                select = fixture.componentInstance.select;
                fixture.detectChanges();
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
                visibleItems = 5;
                hasScroll = true;
            }));
            it('should ident option text to the input text',
                fakeAsync(() => {
                    selectedItemIndex = 0;
                    const inputGroup = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT_GROUP));
                    const inputGroupRect = inputGroup.nativeElement.getBoundingClientRect();
                    select.items[selectedItemIndex].selected = true;
                    fixture.detectChanges();
                    select.toggle();
                    tick();
                    fixture.detectChanges();
                    getBoundingRectangles();
                    expect(inputGroupRect.left + calculatePrefixesWidth() + defaultTextIdent).
                        toEqual(selectedItemRect.left + defaultItemLeftPadding);
                }));
        });
        describe('Document bigger than the visible viewport tests: ', () => {
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxSelectMiddleComponent);
                select = fixture.componentInstance.select;
                fixture.detectChanges();
                tick();
                inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            }));
            it('should correctly reposition the items container when perform horizontal scroll', fakeAsync(() => {
                hasScroll = false;
                visibleItems = 3;
                selectedItemIndex = 1;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                document.documentElement.scrollLeft += 50;
                document.dispatchEvent(new Event('scroll'));
                tick();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height;
                listBottom = selectedItemRect.bottom + selectedItemRect.height;
                verifyListPositioning();

                selectedItemIndex = 2;
                select.toggle();
                tick();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                document.documentElement.scrollLeft += 50;
                document.dispatchEvent(new Event('scroll'));
                tick();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height * 2;
                listBottom = selectedItemRect.bottom;
                verifyListPositioning();

                selectedItemIndex = 0;
                select.toggle();
                tick();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                document.documentElement.scrollLeft += 50;
                document.dispatchEvent(new Event('scroll'));
                tick();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top;
                listBottom = selectedItemRect.bottom + selectedItemRect.height * 2;
                verifyListPositioning();
            }));
            it('should correctly reposition the items container when perform vertical scroll', fakeAsync(() => {
                hasScroll = false;
                visibleItems = 3;
                selectedItemIndex = 1;
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                document.documentElement.scrollTop += 20;
                document.dispatchEvent(new Event('scroll'));
                tick();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height;
                listBottom = selectedItemRect.bottom + selectedItemRect.height;
                verifyListPositioning();

                selectedItemIndex = 2;
                select.toggle();
                tick();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                document.documentElement.scrollTop += 20;
                document.dispatchEvent(new Event('scroll'));
                tick();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top - selectedItemRect.height * 2;
                listBottom = selectedItemRect.bottom;
                verifyListPositioning();

                selectedItemIndex = 0;
                select.toggle();
                tick();
                fixture.detectChanges();
                select.items[selectedItemIndex].selected = true;
                fixture.detectChanges();
                select.toggle();
                tick();
                fixture.detectChanges();
                document.documentElement.scrollTop += 20;
                document.dispatchEvent(new Event('scroll'));
                tick();
                getBoundingRectangles();
                verifySelectedItemPositioning();
                listTop = selectedItemRect.top;
                listBottom = selectedItemRect.bottom + selectedItemRect.height * 2;
                verifyListPositioning();
            }));
        });
    });
    describe('EditorProvider', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            tick();
        }));
        it('Should return correct edit element', () => {
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT)).nativeElement;
            const selectInstance = fixture.componentInstance.select;
            expect(selectInstance.getEditElement()).toEqual(inputElement);
        });
    });
});

@Component({
    template: `
    <igx-select #select [width]="'300px'" [height]="'200px'" [placeholder]="'Choose a city'" [(ngModel)]="value">
    <igx-select-item *ngFor="let item of items" [value]="item">
        {{ item }}
    </igx-select-item>
    </igx-select>
`
})
class IgxSelectSimpleComponent {
    @ViewChild('select', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
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

    // returns an array of the filtered items indexes
    public filterCities(startsWith: string) {
        return this.items.map((city, index) => city.toString().toLowerCase().startsWith(startsWith.toLowerCase()) ? index : undefined)
            .filter(x => x);
    }
}
@Component({
    template: `
    <igx-select #select [width]="'300px'" [height]="'500px'" [placeholder]="'Choose location'" [(ngModel)]="value">
    <igx-select-item-group *ngFor="let location of locations" [label]="location.continent"> {{location.continent}}
            <igx-select-item *ngFor="let capital of location.capitals" [value]="capital">
                {{ capital }}
            </igx-select-item>
    </igx-select-item-group>
    </igx-select>
`
})
class IgxSelectGroupsComponent {
    @ViewChild('select', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    public locations: {
        continent: string,
        capitals: string[]
    }[] = [
            { continent: 'Europe', capitals: ['Berlin', 'London', 'Paris'] },
            { continent: 'South America', capitals: ['Buenos Aires', 'Caracas', 'Lima'] },
            { continent: 'North America', capitals: ['Washington', 'Ottawa', 'Mexico City'] }
        ];
}

@Component({
    template: `
    <div style="width: 2500px; height: 400px;"></div>
        <igx-select #select [(ngModel)]="value" >
        <igx-select-item *ngFor="let item of items" [value]="item">
            {{ item }}
        </igx-select-item>
        </igx-select>
    <div style="width: 2500px; height: 400px;"></div>
`,
    styles: [':host-context { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }']
})
class IgxSelectMiddleComponent {
    @ViewChild('select', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    public items: string[] = [
        'Option 1',
        'Option 2',
        'Option 3'];
}
@Component({
    template: `
    <igx-select #select [(ngModel)]="value" [ngStyle]="{position:'fixed', top:'20px', left: '30px'}">
    <igx-select-item *ngFor="let item of items" [value]="item">
        {{ item }}
    </igx-select-item>
    </igx-select>
`
})
class IgxSelectTopComponent {
    @ViewChild('select', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    public items: string[] = [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
        'Option 5',
        'Option 6',
        'Option 7'];
}
@Component({
    template: `
    <igx-select #select [(ngModel)]="value" [ngStyle]="{position:'fixed', bottom:'20px', left: '30px'}">
    <igx-select-item *ngFor="let item of items" [value]="item">
        {{ item }}
    </igx-select-item>
    </igx-select>
`
})
class IgxSelectBottomComponent {
    @ViewChild('select', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    public items: string[] = [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
        'Option 5',
        'Option 6',
        'Option 7'];
}
@Component({
    template: `
    <igx-select #select [(ngModel)]="value" [ngStyle]="{position:'fixed', top:'20px', left: '30px'}">
    <igx-prefix igxPrefix>
            <igx-icon fontSet="material">favorite</igx-icon>
            <igx-icon fontSet="material">home</igx-icon>
            <igx-icon fontSet="material">search</igx-icon>
        </igx-prefix>
        <igx-suffix>
            <igx-icon fontSet="material">alarm</igx-icon>
        </igx-suffix>
    <igx-select-item *ngFor="let item of items" [value]="item">
        {{ item }}
    </igx-select-item>
    </igx-select>
`
})
class IgxSelectAffixComponent {
    @ViewChild('select', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    public items: string[] = [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
        'Option 5',
        'Option 6',
        'Option 7'];
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
        <igx-prefix igxPrefix>
            <igx-icon fontSet="material">alarm</igx-icon>
        </igx-prefix>
        <igx-select-item *ngFor="let item of items; let inx=index" [value]="item">
            {{ item }}
        </igx-select-item>
    </igx-select>
    </p>
    <p>
    <button type="submit" [disabled]="!reactiveForm.valid">Submit</button>
    </p>
</form>
`
})
class IgxSelectReactiveFormComponent {
    @ViewChild('selectReactive', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    reactiveForm: FormGroup;
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
        'firstName': new FormControl(Validators.required, Validators.pattern('^[\\w\\s/-/(/)]{3,50}$')),
        'password': [Validators.required, Validators.maxLength(12)],
        'optionsSelect': [Validators.required]
    };

    constructor(fb: FormBuilder) {
        this.reactiveForm = fb.group({
            'firstName': new FormControl('', Validators.required),
            'password': ['', Validators.required],
            'optionsSelect': ['', Validators.required]
        });
    }
    onSubmitReactive() { }

    public removeValidators(form: FormGroup) {
        // tslint:disable-next-line:forin
        for (const key in form.controls) {
            form.get(key).clearValidators();
            form.get(key).updateValueAndValidity();
        }
    }

    public addValidators(form: FormGroup) {
        // tslint:disable-next-line:forin
        for (const key in form.controls) {
            form.get(key).setValidators(this.validationType[key]);
            form.get(key).updateValueAndValidity();
        }
    }
}

@Component({
    template: `
    <form #form="ngForm" (ngSubmit)="onSubmit()">
    <p>
    <igx-select #selectInForm [(ngModel)]="model.option" [required]="true" name="option">
        <label igxLabel>Sample Label</label>
        <igx-prefix igxPrefix>
            <igx-icon fontSet="material">alarm</igx-icon>
        </igx-prefix>
        <igx-select-item *ngFor="let item of items; let inx=index" [value]="item">
            {{ item }}
        </igx-select-item>
    </igx-select>
    </p>
    <p>
    <button type="submit" [disabled]="!form.valid">Submit</button>
    </p>
</form>
`
})
class IgxSelectTemplateFormComponent {
    @ViewChild('selectInForm', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    @ViewChild(NgForm, { static: true }) ngForm: NgForm;

    model = {
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

    onSubmit() { }
}

