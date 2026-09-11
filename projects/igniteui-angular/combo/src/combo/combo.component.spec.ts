import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, DebugElement, ElementRef, Injectable, Injector, OnDestroy, OnInit, ViewChild, inject, ChangeDetectionStrategy, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import {
    FormsModule, NgForm, NgModel, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { IgxSelectionAPIService } from 'igniteui-angular/core';
import { IBaseCancelableBrowserEventArgs } from 'igniteui-angular/core';
import { SortingDirection } from '../../../core/src/data-operations/sorting-strategy';
import { IForOfState } from '../../../directives/src/directives/for-of/for_of.directive';
import { IgxInputState } from '../../../input-group/src/public_api';
import { IGX_INPUT_GROUP_TYPE, IgxLabelDirective } from '../../../input-group/src/public_api';
import { AbsoluteScrollStrategy, ConnectedPositioningStrategy } from 'igniteui-angular/core';
import { ComboResourceStringsEN, changei18n } from 'igniteui-angular/core';
import { IgxComboAddItemComponent } from './combo-add-item.component';
import { IgxComboDropDownComponent } from './combo-dropdown.component';
import { IgxComboItemComponent } from './combo-item.component';
import { IComboFilteringOptions, IGX_COMBO_COMPONENT } from './combo.common';
import {
    IComboItemAdditionEvent, IComboSearchInputEventArgs, IComboSelectionChangedEventArgs, IComboSelectionChangingEventArgs, IgxComboComponent
} from './combo.component';
import { IgxComboFooterDirective, IgxComboHeaderDirective, IgxComboItemDirective } from './combo.directives';
import { IgxComboFilteringPipe, comboIgnoreDiacriticsFilter } from './combo.pipes';
import { IgxDropDownItemBaseDirective } from '../../../drop-down/src/drop-down/drop-down-item.base';
import { UIInteractions, wait } from 'igniteui-angular/test-utils/ui-interactions.spec';
import { IgxComboAPIService } from './combo.api';

const CSS_CLASS_COMBO = 'igx-combo';
const CSS_CLASS_COMBO_DROPDOWN = 'igx-combo__drop-down';
const CSS_CLASS_DROPDOWN = 'igx-drop-down';
const CSS_CLASS_DROPDOWNLIST_SCROLL = 'igx-drop-down__list-scroll';
const CSS_CLASS_CONTENT = 'igx-combo__content';
const CSS_CLASS_CONTAINER = 'igx-vs__content';
const CSS_CLASS_DROPDOWNLISTITEM = 'igx-drop-down__item';
const CSS_CLASS_TOGGLEBUTTON = 'igx-combo__toggle-button';
const CSS_CLASS_CLEARBUTTON = 'igx-combo__clear-button';
const CSS_CLASS_ADDBUTTON = 'igx-combo__add-item';
const CSS_CLASS_SELECTED = 'igx-drop-down__item--selected';
const CSS_CLASS_FOCUSED = 'igx-drop-down__item--focused';
const CSS_CLASS_HEADERITEM = 'igx-drop-down__header';
const CSS_CLASS_SCROLLBAR_VERTICAL = 'igx-virtual-scroll';
const CSS_CLASS_INPUTGROUP = 'igx-input-group';
const CSS_CLASS_COMBO_INPUTGROUP = 'igx-input-group__input';
const CSS_CLASS_INPUTGROUP_BUNDLE = 'igx-input-group__bundle';
const CSS_CLASS_INPUTGROUP_REQUIRED = 'igx-input-group--required';
const CSS_CLASS_INPUTGROUP_LABEL = 'igx-input-group__label';
const CSS_CLASS_SEARCHINPUT = 'input[name=\'searchInput\']';
const CSS_CLASS_HEADER = 'header-class';
const CSS_CLASS_FOOTER = 'footer-class';
const CSS_CLASS_INPUT_GROUP_REQUIRED = 'igx-input-group--required';
const CSS_CLASS_INPUT_GROUP_INVALID = 'igx-input-group--invalid';
const CSS_CLASS_EMPTY = 'igx-combo__empty';
const CSS_CLASS_ITEM_CHECKBOX = 'igx-combo__checkbox';
const CSS_CLASS_ITME_CHECKBOX_CHECKED = 'igx-checkbox--checked';
const defaultDropdownItemHeight = 40;
const defaultDropdownItemMaxHeight = 240;

describe('igxCombo', () => {
    let fixture: ComponentFixture<any>;
    let combo: IgxComboComponent;
    let input: DebugElement;

    describe('Unit tests: ', () => {
        const data = ['Item1', 'Item2', 'Item3', 'Item4', 'Item5', 'Item6', 'Item7'];
        const complexData = [
            { country: 'UK', city: 'London' },
            { country: 'France', city: 'Paris' },
            { country: 'Germany', city: 'Berlin' },
            { country: 'Bulgaria', city: 'Sofia' },
            { country: 'Austria', city: 'Vienna' },
            { country: 'Spain', city: 'Madrid' },
            { country: 'Italy', city: 'Rome' }
        ];
        const elementRef = { nativeElement: null };
        const mockSelection: {
            [key: string]: jasmine.Spy;
        } = jasmine.createSpyObj('IgxSelectionAPIService', ['get', 'set', 'add_items', 'select_items', 'delete']);
        const mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);
        const mockComboService = jasmine.createSpyObj('IgxComboAPIService', ['register', 'clear']);
        const mockNgControl = jasmine.createSpyObj('NgControl', ['registerOnChangeCb', 'registerOnTouchedCb']);
        const mockInjector = jasmine.createSpyObj('Injector', ['get']);
        mockInjector.get.and.returnValue(mockNgControl);
        mockSelection.get.and.returnValue(new Set([]));
        jasmine.getEnv().allowRespy(true);

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [IgxComboComponent, NoopAnimationsModule],
                providers: [
                    { provide: ElementRef, useValue: elementRef },
                    { provide: ChangeDetectorRef, useValue: mockCdr },
                    { provide: IgxSelectionAPIService, useValue: mockSelection },
                    { provide: IgxComboAPIService, useValue: mockComboService },
                    { provide: IGX_INPUT_GROUP_TYPE, useValue: null },
                    { provide: Injector, useValue: mockInjector }
                ]
            })
                .overrideComponent(IgxComboComponent, {
                    set: {
                        providers: [
                            { provide: IgxComboAPIService, useValue: mockComboService },
                            { provide: IGX_COMBO_COMPONENT, useExisting: IgxComboComponent }
                        ]
                    }
                })
                .compileComponents();

            fixture = TestBed.createComponent(IgxComboComponent);
            combo = fixture.componentInstance;

            const dropdown = (combo as any).dropdown;
            if (dropdown) {
                (dropdown as any).virtDir = {
                    getScroll: () => ({
                        removeEventListener: () => { }
                    })
                };
            }
        });

        afterAll(() => {
            jasmine.getEnv().allowRespy(false);
        });

        it('should correctly implement interface methods - ControlValueAccessor ', () => {
            combo.ngOnInit();
            expect(combo['ngControl']).toBeDefined();
            combo.registerOnChange(mockNgControl.registerOnChangeCb);
            combo.registerOnTouched(mockNgControl.registerOnTouchedCb);

            // writeValue
            expect(combo.displayValue).toEqual('');
            mockSelection.get.and.returnValue(new Set(['test']));
            spyOnProperty(combo, 'isRemote').and.returnValue(false);
            combo.writeValue(['test']);
            expect(mockNgControl.registerOnChangeCb).not.toHaveBeenCalled();
            expect(mockSelection.select_items).toHaveBeenCalledWith(combo.id, ['test'], true);
            expect(combo.displayValue).toEqual('test');
            expect(combo.value).toEqual(['test']);

            // setDisabledState
            combo.setDisabledState(true);
            expect(combo.disabled).toBe(true);
            combo.setDisabledState(false);
            expect(combo.disabled).toBe(false);

            // OnChange callback
            mockSelection.add_items.and.returnValue(new Set(['simpleValue']));
            combo.select(['simpleValue']);
            expect(mockSelection.add_items).toHaveBeenCalledWith(combo.id, ['simpleValue'], undefined);
            expect(mockSelection.select_items).toHaveBeenCalledWith(combo.id, ['simpleValue'], true);
            expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith(['simpleValue']);

            // OnTouched callback
            spyOnProperty(combo, 'collapsed').and.returnValue(true);
            spyOnProperty(combo, 'valid', 'set');

            combo.onBlur();
            expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(1);
        });
        it('should properly call dropdown methods on toggle', () => {
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['open', 'close', 'toggle']);
            combo.ngOnInit();
            combo.dropdown = dropdown;
            dropdown.collapsed = true;

            combo.open();
            dropdown.collapsed = false;
            expect(combo.dropdown.open).toHaveBeenCalledTimes(1);
            expect(combo.collapsed).toBe(false);

            combo.close();
            dropdown.collapsed = true;
            expect(combo.dropdown.close).toHaveBeenCalledTimes(1);
            expect(combo.collapsed).toBe(true);

            combo.toggle();
            dropdown.collapsed = false;
            expect(combo.dropdown.toggle).toHaveBeenCalledTimes(1);
            expect(combo.collapsed).toBe(false);
        });
        it(`should not focus search input when property autoFocusSearch=false`, () => {

            const dropdownContainer = { nativeElement: { focus: () => { } } };
            combo['dropdownContainer'] = dropdownContainer;
            spyOn(combo, 'focusSearchInput');

            combo.autoFocusSearch = false;
            combo.handleOpened();
            expect(combo.focusSearchInput).toHaveBeenCalledTimes(0);

            combo.autoFocusSearch = true;
            combo.handleOpened();
            expect(combo.focusSearchInput).toHaveBeenCalledTimes(1);

            combo.autoFocusSearch = false;
            combo.handleOpened();
            expect(combo.focusSearchInput).toHaveBeenCalledTimes(1);
        });
        it('should call dropdown toggle with correct overlaySettings', () => {

            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['toggle']);
            combo.ngOnInit();
            combo.dropdown = dropdown;
            const defaultSettings = (combo as any)._overlaySettings;
            combo.toggle();
            expect(combo.dropdown.toggle).toHaveBeenCalledWith(defaultSettings || {});
            const newSettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: new AbsoluteScrollStrategy()
            };
            combo.overlaySettings = newSettings;
            const expectedSettings = Object.assign({}, defaultSettings, newSettings);
            combo.toggle();
            expect(combo.dropdown.toggle).toHaveBeenCalledWith(expectedSettings);
        });
        it('should properly get/set displayKey', () => {

            combo.ngOnInit();
            combo.valueKey = 'field';
            expect(combo.displayKey).toEqual(combo.valueKey);
            combo.displayKey = 'region';
            expect(combo.displayKey).toEqual('region');
            expect(combo.displayKey === combo.valueKey).toBeFalsy();
        });
        it('should properly call "writeValue" method', () => {

            combo.ngOnInit();
            combo.data = data;
            mockSelection.select_items.calls.reset();
            spyOnProperty(combo, 'isRemote').and.returnValue(false);
            combo.writeValue(['EXAMPLE']);
            expect(mockSelection.select_items).toHaveBeenCalledTimes(1);

            // Calling "select_items" through the writeValue accessor should clear the previous values;
            // Select items is called with the invalid value and it is written in selection, though no item is selected
            // Controlling the selection is up to the user
            expect(mockSelection.select_items).toHaveBeenCalledWith(combo.id, ['EXAMPLE'], true);
            combo.writeValue(combo.data[0]);
            // When value key is specified, the item's value key is stored in the selection
            expect(mockSelection.select_items).toHaveBeenCalledWith(combo.id, [], true);
        });
        it('should emit owner on `opening` and `closing`', () => {

            combo.ngOnInit();
            spyOn(combo.opening, 'emit').and.callThrough();
            spyOn(combo.closing, 'emit').and.callThrough();
            const mockObj = {};
            const mockEvent = new Event('mock');
            const inputEvent: IBaseCancelableBrowserEventArgs = {
                cancel: false,
                owner: mockObj,
                event: mockEvent
            };
            combo.comboInput = {
                nativeElement: {
                    focus: () => { }
                }
            } as any;
            combo.handleOpening(inputEvent);
            const expectedCall: IBaseCancelableBrowserEventArgs = { owner: combo, event: inputEvent.event, cancel: inputEvent.cancel };
            expect(combo.opening.emit).toHaveBeenCalledWith(expectedCall);
            combo.handleClosing(inputEvent);
            expect(combo.closing.emit).toHaveBeenCalledWith(expectedCall);
            let sub = combo.opening.subscribe((e: IBaseCancelableBrowserEventArgs) => {
                e.cancel = true;
            });
            combo.handleOpening(inputEvent);
            expect(inputEvent.cancel).toEqual(true);
            sub.unsubscribe();
            inputEvent.cancel = false;

            sub = combo.closing.subscribe((e: IBaseCancelableBrowserEventArgs) => {
                e.cancel = true;
            });
            combo.handleClosing(inputEvent);
            expect(inputEvent.cancel).toEqual(true);
            sub.unsubscribe();
        });
        it('should not throw error when setting data to null', () => {

            combo.ngOnInit();
            let errorMessage = '';
            try {
                combo.data = null;
            } catch (ex) {
                errorMessage = ex.message;
            }
            expect(errorMessage).toBe('');
            expect(combo.data).not.toBeUndefined();
            expect(combo.data).not.toBeNull();
            expect(combo.data.length).toBe(0);
        });
        it('should not throw error when setting data to undefined', () => {

            combo.ngOnInit();
            let errorMessage = '';
            try {
                combo.data = undefined;
            } catch (ex) {
                errorMessage = ex.message;
            }
            expect(errorMessage).toBe('');
            expect(combo.data).not.toBeUndefined();
            expect(combo.data).not.toBeNull();
            expect(combo.data.length).toBe(0);
        });
        it('should properly handleInputChange', () => {

            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            combo.comboInput = {
                value: '',
            } as any;
            combo.disableFiltering = false;
            const matchSpy = spyOn<any>(combo, 'checkMatch').and.callThrough();
            spyOn(combo.searchInputUpdate, 'emit');

            combo.handleInputChange();
            expect(matchSpy).toHaveBeenCalledTimes(1);
            expect(combo.searchInputUpdate.emit).toHaveBeenCalledTimes(0);

            const args = {
                searchText: 'Fake',
                owner: combo,
                cancel: false
            };
            combo.handleInputChange('Fake');
            expect(matchSpy).toHaveBeenCalledTimes(2);
            expect(combo.searchInputUpdate.emit).toHaveBeenCalledTimes(1);
            expect(combo.searchInputUpdate.emit).toHaveBeenCalledWith(args);

            args.searchText = '';
            combo.handleInputChange('');
            expect(matchSpy).toHaveBeenCalledTimes(3);
            expect(combo.searchInputUpdate.emit).toHaveBeenCalledTimes(2);
            expect(combo.searchInputUpdate.emit).toHaveBeenCalledWith(args);

            combo.disableFiltering = true;
            combo.handleInputChange();
            expect(matchSpy).toHaveBeenCalledTimes(4);
            expect(combo.searchInputUpdate.emit).toHaveBeenCalledTimes(2);
        });
        it('should be able to cancel searchInputUpdate', () => {

            combo.ngOnInit();
            combo.data = data;
            combo.disableFiltering = false;
            combo.searchInputUpdate.subscribe((e) => {
                e.cancel = true;
            });
            const matchSpy = spyOn<any>(combo, 'checkMatch').and.callThrough();
            spyOn(combo.searchInputUpdate, 'emit').and.callThrough();

            combo.handleInputChange('Item1');
            expect(combo.searchInputUpdate.emit).toHaveBeenCalledTimes(1);
            expect(matchSpy).toHaveBeenCalledTimes(1);
        });
        it('should not open on click if combo is disabled', () => {

            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['open', 'close', 'toggle']);
            const spyObj = jasmine.createSpyObj('event', ['stopPropagation', 'preventDefault']);
            combo.ngOnInit();
            combo.dropdown = dropdown;
            dropdown.collapsed = true;

            combo.disabled = true;
            combo.onClick(spyObj);
            expect(combo.dropdown.collapsed).toBeTruthy();
        });
        it('should delete the selection on destroy', () => {
            combo.ngOnDestroy();
            expect(mockComboService.clear).toHaveBeenCalled();
            expect(mockSelection.delete).toHaveBeenCalled();
        });

        describe('Combo selection API unit tests: ', () => {
            let selectionService: IgxSelectionAPIService;
            beforeEach(() => {
                selectionService = new IgxSelectionAPIService();
                TestBed.resetTestingModule();

                TestBed.configureTestingModule({
                    imports: [IgxComboComponent, NoopAnimationsModule],
                    providers: [
                        { provide: ElementRef, useValue: elementRef },
                        { provide: ChangeDetectorRef, useValue: mockCdr },
                        { provide: IgxSelectionAPIService, useValue: selectionService },
                        { provide: IgxComboAPIService, useValue: mockComboService },
                        { provide: IGX_INPUT_GROUP_TYPE, useValue: null },
                        { provide: Injector, useValue: mockInjector }
                    ]
                }).compileComponents();

                fixture = TestBed.createComponent(IgxComboComponent);
                combo = fixture.componentInstance;

                const dropdown = (combo as any).dropdown;
                if (dropdown) {
                    (dropdown as any).virtDir = {
                        getScroll: () => ({ removeEventListener: () => { } })
                    };
                }
            });

            it('should select items through setSelctedItem method', () => {
                const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
                combo.ngOnInit();
                combo.data = complexData;
                combo.valueKey = 'country';
                combo.dropdown = dropdown;
                spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);

                const selectedItems = [combo.data[0]];
                const selectedValues = [combo.data[0].country];
                combo.setSelectedItem('UK', true);
                expect(combo.selection).toEqual(selectedItems);
                expect(combo.value).toEqual(selectedValues);
                combo.setSelectedItem('Germany', true);
                selectedItems.push(combo.data[2]);
                selectedValues.push(combo.data[2].country);
                expect(combo.selection).toEqual(selectedItems);
                expect(combo.value).toEqual(selectedValues);
                selectedItems.pop();
                selectedValues.pop();
                combo.setSelectedItem('Germany', false);
                expect(combo.selection).toEqual(selectedItems);
                expect(combo.value).toEqual(selectedValues);
                selectedItems.pop();
                selectedValues.pop();
                combo.setSelectedItem('UK', false);
                expect(combo.selection).toEqual(selectedItems);
                expect(combo.value).toEqual(selectedValues);

                combo.valueKey = null;
                selectedItems.push(combo.data[5]);
                combo.setSelectedItem(combo.data[5], true);
                expect(combo.selection).toEqual(selectedItems);
                expect(combo.value).toEqual(selectedItems);
                selectedItems.push(combo.data[1]);
                combo.setSelectedItem(combo.data[1], true);
                expect(combo.selection).toEqual(selectedItems);
                expect(combo.value).toEqual(selectedItems);
                selectedItems.pop();
                combo.setSelectedItem(combo.data[1], false);
                expect(combo.selection).toEqual(selectedItems);
                expect(combo.value).toEqual(selectedItems);
            });
            it('should set selectedItems correctly on selectItems method call', () => {
                const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
                combo.ngOnInit();
                combo.data = data;
                combo.dropdown = dropdown;
                spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);

                combo.select([], false);
                expect(combo.selection).toEqual([]);
                expect(combo.value).toEqual([]);
                combo.select([], true);
                expect(combo.selection).toEqual([]);
                expect(combo.value).toEqual([]);
                const selectedItems = combo.data.slice(0, 3);
                combo.select(combo.data.slice(0, 3), true);
                expect(combo.selection).toEqual(selectedItems);
                expect(combo.value).toEqual(selectedItems);
                combo.select([], false);
                expect(combo.selection).toEqual(selectedItems);
                expect(combo.value).toEqual(selectedItems);
                selectedItems.push(combo.data[3]);
                combo.select([combo.data[3]], false);
                expect(combo.selection).toEqual(combo.data.slice(0, 4));
                expect(combo.value).toEqual(combo.data.slice(0, 4));
                combo.select([], true);
                expect(combo.selection).toEqual([]);
                expect(combo.value).toEqual([]);
            });
            it('should fire selectionChanging event on item selection', () => {
                const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
                combo.ngOnInit();
                combo.data = data;
                combo.dropdown = dropdown;
                spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
                spyOn(combo.selectionChanging, 'emit');

                let oldValue = [];
                let newValue = [combo.data[1], combo.data[5], combo.data[6]];

                let oldSelection = [];
                let newSelection = [combo.data[1], combo.data[5], combo.data[6]];

                combo.select(newSelection);
                expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(1);
                expect(combo.selectionChanging.emit).toHaveBeenCalledWith({
                    oldValue,
                    newValue,
                    oldSelection,
                    newSelection,
                    added: newSelection,
                    removed: [],
                    event: undefined,
                    owner: combo,
                    displayText: `${newSelection.join(', ')}`,
                    cancel: false
                });

                let newItem = combo.data[3];
                combo.select([newItem]);
                oldValue = [...newValue];
                newValue.push(newItem);
                oldSelection = [...newSelection];
                newSelection.push(newItem);
                expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(2);
                expect(combo.selectionChanging.emit).toHaveBeenCalledWith({
                    oldValue,
                    newValue,
                    oldSelection,
                    newSelection,
                    removed: [],
                    added: [combo.data[3]],
                    event: undefined,
                    owner: combo,
                    displayText: `${newSelection.join(', ')}`,
                    cancel: false
                });

                oldValue = [...newValue];
                newValue = [combo.data[0]];
                oldSelection = [...newSelection];
                newSelection = [combo.data[0]];
                combo.select(newSelection, true);
                expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(3);
                expect(combo.selectionChanging.emit).toHaveBeenCalledWith({
                    oldValue,
                    newValue,
                    oldSelection,
                    newSelection,
                    removed: oldSelection,
                    added: newSelection,
                    event: undefined,
                    owner: combo,
                    displayText: `${newSelection.join(', ')}`,
                    cancel: false
                });

                oldValue = [...newValue];
                newValue = [];
                oldSelection = [...newSelection];
                newSelection = [];
                newItem = combo.data[0];
                combo.deselect([newItem]);
                expect(combo.selection.length).toEqual(0);
                expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(4);
                expect(combo.selectionChanging.emit).toHaveBeenCalledWith({
                    oldValue,
                    newValue,
                    oldSelection,
                    newSelection,
                    removed: [combo.data[0]],
                    added: [],
                    event: undefined,
                    owner: combo,
                    displayText: `${newSelection.join(', ')}`,
                    cancel: false
                });
            });
            it('should properly emit added and removed values in change event on single value selection', () => {
                const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
                combo.ngOnInit();
                combo.data = complexData;
                combo.valueKey = 'country';
                combo.dropdown = dropdown;
                spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
                const selectionSpy = spyOn(combo.selectionChanging, 'emit');
                const expectedResults: IComboSelectionChangingEventArgs = {
                    newValue: [combo.data[0][combo.valueKey]],
                    oldValue: [],
                    newSelection: [combo.data[0]],
                    oldSelection: [],
                    added: [combo.data[0]],
                    removed: [],
                    event: undefined,
                    owner: combo,
                    displayText: `${combo.data[0][combo.displayKey]}`,
                    cancel: false
                };
                combo.select([combo.data[0][combo.valueKey]]);
                expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
                Object.assign(expectedResults, {
                    newValue: [],
                    oldValue: [combo.data[0][combo.valueKey]],
                    newSelection: [],
                    oldSelection: [combo.data[0]],
                    added: [],
                    displayText: '',
                    removed: [combo.data[0]]
                });
                combo.deselect([combo.data[0][combo.valueKey]]);
                expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
            });
            it('should properly emit added and removed values in change event on multiple values selection', () => {
                const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
                combo.ngOnInit();
                combo.data = complexData;
                combo.valueKey = 'country';
                combo.displayKey = 'city';
                combo.dropdown = dropdown;
                spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
                const selectionSpy = spyOn(combo.selectionChanging, 'emit');

                let oldSelection = [];
                let newSelection = [combo.data[0], combo.data[1], combo.data[2]];
                combo.select(newSelection.map(e => e[combo.valueKey]));
                const expectedResults: IComboSelectionChangingEventArgs = {
                    newValue: newSelection.map(e => e[combo.valueKey]),
                    oldValue: [],
                    newSelection: newSelection,
                    oldSelection,
                    added: newSelection,
                    removed: [],
                    event: undefined,
                    owner: combo,
                    displayText: `${newSelection.map(entry => entry[combo.displayKey]).join(', ')}`,
                    cancel: false
                };
                expect(selectionSpy).toHaveBeenCalledWith(expectedResults);

                oldSelection = [...newSelection];
                newSelection = [combo.data[1], combo.data[2]];
                combo.deselect([combo.data[0][combo.valueKey]]);
                Object.assign(expectedResults, {
                    newValue: newSelection.map(e => e[combo.valueKey]),
                    oldValue: oldSelection.map(e => e[combo.valueKey]),
                    newSelection,
                    oldSelection,
                    added: [],
                    displayText: newSelection.map(e => e[combo.displayKey]).join(', '),
                    removed: [combo.data[0]]
                });
                expect(selectionSpy).toHaveBeenCalledWith(expectedResults);

                oldSelection = [...newSelection];
                newSelection = [combo.data[4], combo.data[5], combo.data[6]];
                combo.select(newSelection.map(e => e[combo.valueKey]), true);
                Object.assign(expectedResults, {
                    newValue: newSelection.map(e => e[combo.valueKey]),
                    oldValue: oldSelection.map(e => e[combo.valueKey]),
                    newSelection,
                    oldSelection,
                    added: newSelection,
                    displayText: newSelection.map(e => e[combo.displayKey]).join(', '),
                    removed: oldSelection
                });
                expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
            });
            it('should emit selectionChanged after selectionChanging with the committed state', () => {
                const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
                combo.ngOnInit();
                combo.data = data;
                combo.dropdown = dropdown;
                spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);

                const callOrder: string[] = [];
                spyOn(combo.selectionChanging, 'emit').and.callFake(() => callOrder.push('changing'));
                spyOn(combo.selectionChanged, 'emit').and.callFake(() => callOrder.push('changed'));

                const selectedItems = [combo.data[1], combo.data[5]];
                combo.select(selectedItems);

                expect(callOrder).toEqual(['changing', 'changed']);
                expect(combo.selectionChanged.emit).toHaveBeenCalledTimes(1);
                expect(combo.selectionChanged.emit).toHaveBeenCalledWith({
                    oldValue: [],
                    newValue: selectedItems,
                    oldSelection: [],
                    newSelection: selectedItems,
                    added: selectedItems,
                    removed: [],
                    event: undefined,
                    owner: combo,
                    displayText: selectedItems.join(', ')
                } satisfies IComboSelectionChangedEventArgs);
            });
            it('should not emit selectionChanged when selectionChanging is canceled', () => {
                const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
                combo.ngOnInit();
                combo.data = data;
                combo.dropdown = dropdown;
                spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);

                spyOn(combo.selectionChanging, 'emit').and.callFake((args: IComboSelectionChangingEventArgs) => {
                    args.cancel = true;
                });
                spyOn(combo.selectionChanged, 'emit');

                combo.select([combo.data[1], combo.data[5]]);

                expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(1);
                expect(combo.selectionChanged.emit).not.toHaveBeenCalled();
                expect(combo.selection).toEqual([]);
                expect(combo.value).toEqual([]);
            });
            it('should emit selectionChanged with the actual committed state when selectionChanging modifies newValue', () => {
                const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
                combo.ngOnInit();
                combo.data = data;
                combo.dropdown = dropdown;
                spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);

                spyOn(combo.selectionChanging, 'emit').and.callFake((args: IComboSelectionChangingEventArgs) => {
                    args.newValue = [combo.data[2], combo.data[4]];
                    args.displayText = `${combo.data[2]}, ${combo.data[4]}`;
                });

                spyOn(combo.selectionChanged, 'emit');

                combo.select([combo.data[0], combo.data[1]]);

                expect(combo.selection).toEqual([combo.data[2], combo.data[4]]);
                expect(combo.value).toEqual([combo.data[2], combo.data[4]]);
                expect(combo.selectionChanged.emit).toHaveBeenCalledWith({
                    oldValue: [],
                    newValue: [combo.data[2], combo.data[4]],
                    oldSelection: [],
                    newSelection: [combo.data[2], combo.data[4]],
                    added: [combo.data[2], combo.data[4]],
                    removed: [],
                    event: undefined,
                    owner: combo,
                    displayText: `${combo.data[2]}, ${combo.data[4]}`
                } satisfies IComboSelectionChangedEventArgs);
            });
            it('should emit onSelectonChange event on select/deselect ALL items method call', () => {
                const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
                combo.ngOnInit();
                combo.data = data;
                combo.dropdown = dropdown;
                spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
                spyOn(combo.selectionChanging, 'emit');

                combo.selectAllItems(true);
                expect(combo.selection).toEqual(data);
                expect(combo.value).toEqual(data);
                expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(1);
                expect(combo.selectionChanging.emit).toHaveBeenCalledWith({
                    oldValue: [],
                    newValue: data,
                    oldSelection: [],
                    newSelection: data,
                    added: data,
                    removed: [],
                    owner: combo,
                    event: undefined,
                    displayText: `${combo.data.join(', ')}`,
                    cancel: false
                });

                combo.deselectAllItems(true);
                expect(combo.selection).toEqual([]);
                expect(combo.value).toEqual([]);
                expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(2);
                expect(combo.selectionChanging.emit).toHaveBeenCalledWith({
                    oldValue: data,
                    newValue: [],
                    oldSelection: data,
                    newSelection: [],
                    added: [],
                    removed: data,
                    owner: combo,
                    event: undefined,
                    displayText: '',
                    cancel: false
                });
            });
            it('should properly handle selection manipulation through selectionChanging emit', () => {
                const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
                combo.ngOnInit();
                combo.data = data;
                combo.dropdown = dropdown;
                spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
                spyOn(combo.selectionChanging, 'emit').and.callFake((event: IComboSelectionChangingEventArgs) => event.newValue = []);
                // No items are initially selected
                expect(combo.selection).toEqual([]);
                // Select the first 5 items
                combo.select(combo.data.splice(0, 5));
                // selectionChanging fires and overrides the selection to be [];
                expect(combo.selection).toEqual([]);
            });
            it('should not clear value when combo is disabled', () => {
                const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
                const spyObj = jasmine.createSpyObj('event', ['stopPropagation']);
                combo.ngOnInit();
                combo.data = data;
                combo.dropdown = dropdown;
                combo.disabled = true;
                spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);

                const item = combo.data.slice(0, 1);
                combo.select(item, true);
                combo.handleClearItems(spyObj);
                expect(combo.displayValue).toEqual(item[0]);
            });
            it('should allow canceling and overwriting of item addition', fakeAsync(() => {
                const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
                const mockScroll = jasmine.createSpyObj('virtualScroll', { scrollToIndex: Promise.resolve() });
                const mockInput = jasmine.createSpyObj('mockInput', [], {
                    nativeElement: jasmine.createSpyObj('mockElement', ['focus'])
                });
                spyOn(combo.addition, 'emit').and.callThrough();
                const subParams: { cancel: boolean; newValue: string; modify: boolean } = {
                    cancel: false,
                    modify: false,
                    newValue: 'mockValue'
                };
                const sub = combo.addition.subscribe((e) => {
                    if (subParams.cancel) {
                        e.cancel = true;
                    }
                    if (subParams.modify) {
                        e.addedItem = subParams.newValue;
                    }
                });

                combo.ngOnInit();
                combo.data = ['Item 1', 'Item 2', 'Item 3'];
                combo.dropdown = dropdown;
                combo.searchInput = mockInput;
                (combo as any).virtualScrollContainer = mockScroll;
                let mockAddParams: IComboItemAdditionEvent = {
                    cancel: false,
                    owner: combo,
                    addedItem: 'Item 99',
                    newCollection: ['Item 1', 'Item 2', 'Item 3', 'Item 99'],
                    oldCollection: ['Item 1', 'Item 2', 'Item 3']
                };


                // handle addition

                combo.searchValue = 'Item 99';
                combo.addItemToCollection();
                tick();
                expect(combo.data.length).toEqual(4);
                expect(combo.addition.emit).toHaveBeenCalledWith(mockAddParams);
                expect(combo.addition.emit).toHaveBeenCalledTimes(1);
                expect(mockScroll.scrollToIndex).toHaveBeenCalledTimes(1);
                expect(combo.searchInput.nativeElement.focus).toHaveBeenCalledTimes(1);
                expect(combo.data[combo.data.length - 1]).toBe('Item 99');
                expect(selectionService.get(combo.id).size).toBe(1);
                expect([...selectionService.get(combo.id)][0]).toBe('Item 99');

                // cancel
                subParams.cancel = true;
                mockAddParams = {
                    cancel: true,
                    owner: combo,
                    addedItem: 'Item 99',
                    newCollection: ['Item 1', 'Item 2', 'Item 3', 'Item 99', 'Item 99'],
                    oldCollection: ['Item 1', 'Item 2', 'Item 3', 'Item 99']
                };

                combo.searchValue = 'Item 99';
                combo.addItemToCollection();
                tick();
                expect(combo.addition.emit).toHaveBeenCalledWith(mockAddParams);
                expect(combo.addition.emit).toHaveBeenCalledTimes(2);
                expect(mockScroll.scrollToIndex).toHaveBeenCalledTimes(1);
                expect(combo.searchInput.nativeElement.focus).toHaveBeenCalledTimes(1);
                expect(combo.data.length).toEqual(4);
                expect(combo.data[combo.data.length - 1]).toBe('Item 99');
                expect(selectionService.get(combo.id).size).toBe(1);
                expect([...selectionService.get(combo.id)][0]).toBe('Item 99');

                // overwrite
                subParams.modify = true;
                subParams.cancel = false;
                mockAddParams = {
                    cancel: false,
                    owner: combo,
                    addedItem: 'mockValue',
                    newCollection: ['Item 1', 'Item 2', 'Item 3', 'Item 99', 'Item 99'],
                    oldCollection: ['Item 1', 'Item 2', 'Item 3', 'Item 99']
                };

                combo.searchValue = 'Item 99';
                combo.addItemToCollection();
                tick();
                expect(combo.addition.emit).toHaveBeenCalledWith(mockAddParams);
                expect(combo.addition.emit).toHaveBeenCalledTimes(3);
                expect(mockScroll.scrollToIndex).toHaveBeenCalledTimes(2);
                expect(combo.searchInput.nativeElement.focus).toHaveBeenCalledTimes(2);
                expect(combo.data.length).toEqual(5);
                expect(combo.data[combo.data.length - 1]).toBe(subParams.newValue);
                expect(selectionService.get(combo.id).size).toBe(2);
                expect([...selectionService.get(combo.id)][1]).toBe(subParams.newValue);
                sub.unsubscribe();
            }));
        });
    });

    describe('Combo feature tests: ', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxComboSampleComponent,
                    IgxComboInContainerTestComponent,
                    IgxComboRemoteDataComponent,
                    ComboModelBindingComponent,
                    IgxComboBindingDataAfterInitComponent,
                    IgxComboFormComponent,
                    IgxComboInTemplatedFormComponent,
                ]
            }).compileComponents();
        }));

        describe('Initialization and rendering tests: ', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxComboSampleComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
                input = fixture.debugElement.query(By.css(`.${CSS_CLASS_COMBO_INPUTGROUP}`));
            });
            it('should initialize the combo component properly', () => {
                const toggleButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLEBUTTON));
                expect(fixture.componentInstance).toBeDefined();
                expect(combo).toBeDefined();
                expect(combo.collapsed).toBeDefined();
                expect(combo.collapsed).toBeTruthy();
                expect(input).toBeDefined();
                expect(toggleButton).toBeDefined();
                expect(combo.searchInput).toBeDefined();
                expect(combo.placeholder).toBeDefined();
            });
            it('should initialize input properties properly', () => {
                expect(combo.data).toBeDefined();
                expect(combo.valueKey).toEqual('field');
                expect(combo.displayKey).toEqual('field');
                expect(combo.groupKey).toEqual('region');
                expect(combo.width).toEqual('400px');
                expect(combo.placeholder).toEqual('Location');
                expect(combo.disableFiltering).toEqual(false);
                expect(combo.allowCustomValues).toEqual(false);
                expect(combo.cssClass).toEqual(CSS_CLASS_COMBO);
                expect(combo.type).toEqual('box');
            });
            it('should apply all appropriate classes on combo initialization', () => {
                const comboComponent = fixture.nativeElement.querySelector(CSS_CLASS_COMBO);
                expect(comboComponent).not.toBeNull();
                expect(comboComponent.classList.contains(CSS_CLASS_COMBO)).toBeTruthy();
                expect(comboComponent.childElementCount).toEqual(2);

                // Children [1] refers to .igx-combo__drop-down
                const comboDropDown = comboComponent.children[1];
                expect(comboDropDown.classList.contains(CSS_CLASS_COMBO_DROPDOWN)).toBeTruthy();

                // Children [0] refers to .igx-drop-down
                expect(comboDropDown.children[0].classList.contains(CSS_CLASS_DROPDOWN)).toBeTruthy();
                expect(comboDropDown.childElementCount).toEqual(1);

                const dropDown = comboDropDown.children[0];
                const dropDownScrollList = dropDown.children[0];
                expect(dropDownScrollList.classList.contains(CSS_CLASS_DROPDOWNLIST_SCROLL)).toBeTruthy();
                expect(dropDown.classList.contains('igx-toggle--hidden')).toBeTruthy();
                expect(dropDownScrollList.childElementCount).toEqual(0);
            });
            it('should render aria attributes properly', fakeAsync(() => {
                expect(input.nativeElement.getAttribute('role')).toEqual('combobox');
                expect(input.nativeElement.getAttribute('aria-haspopup')).toEqual('listbox');
                expect(input.nativeElement.getAttribute('aria-expanded')).toMatch('false');
                expect(input.nativeElement.getAttribute('aria-controls')).toEqual(combo.dropdown.listId);
                expect(input.nativeElement.getAttribute('aria-labelledby')).toEqual(combo.placeholder);
                expect(input.nativeElement.getAttribute('aria-label')).toEqual('No options selected');

                const dropdown = fixture.debugElement.query(By.css(`div[role="listbox"]`));
                expect(dropdown.nativeElement.getAttribute('aria-labelledby')).toEqual(combo.placeholder);

                combo.open();
                tick();
                fixture.detectChanges();

                const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
                expect(searchInput.nativeElement.getAttribute('role')).toEqual('searchbox');
                expect(searchInput.nativeElement.getAttribute('aria-label')).toEqual('search');
                expect(searchInput.nativeElement.getAttribute('aria-autocomplete')).toEqual('list');

                const list = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                expect(list.nativeElement.getAttribute('aria-multiselectable')).toEqual('true');
                expect(list.nativeElement.getAttribute('aria-activedescendant')).toEqual(null);

                UIInteractions.triggerEventHandlerKeyDown('ArrowDown', list);
                tick();
                fixture.detectChanges();
                expect(list.nativeElement.getAttribute('aria-activedescendant')).toEqual(combo.dropdown.focusedItem.id);

                combo.select(['Illinois', 'Mississippi', 'Ohio']);
                fixture.detectChanges();
                expect(input.nativeElement.getAttribute('aria-label')).toEqual('Selected options');
            }));
            it('should render aria-expanded attribute properly', fakeAsync(() => {
                expect(input.nativeElement.getAttribute('aria-expanded')).toMatch('false');
                combo.open();
                tick();
                fixture.detectChanges();
                expect(input.nativeElement.getAttribute('aria-expanded')).toMatch('true');
                combo.close();
                tick();
                fixture.detectChanges();
                expect(input.nativeElement.getAttribute('aria-expanded')).toMatch('false');
            }));
            it('should render placeholder values for inputs properly', () => {
                combo.toggle();
                fixture.detectChanges();
                expect(combo.collapsed).toBeFalsy();
                expect(combo.placeholder).toEqual('Location');
                expect(combo.comboInput.nativeElement.placeholder).toEqual('Location');

                expect(combo.searchInput.nativeElement.placeholder).toEqual('Enter a Search Term');

                combo.searchPlaceholder = 'Filter';
                fixture.detectChanges();
                expect(combo.searchPlaceholder).toEqual('Filter');
                expect(combo.searchInput.nativeElement.placeholder).toEqual('Filter');

                combo.disableFiltering = true;
                fixture.detectChanges();
                expect(combo.searchPlaceholder).toEqual('Filter');

                combo.placeholder = 'States';
                fixture.detectChanges();
                expect(combo.placeholder).toEqual('States');
                expect(combo.comboInput.nativeElement.placeholder).toEqual('States');
            });
            it('should render dropdown list and item height properly', fakeAsync(() => {
                // NOTE: Minimum itemHeight is 2 rem, per Material Design Guidelines (for mobile only)
                let itemHeight = defaultDropdownItemHeight;
                let itemMaxHeight = defaultDropdownItemMaxHeight;
                fixture.componentInstance.size = "large";
                fixture.detectChanges();
                combo.toggle();
                tick();
                fixture.detectChanges();
                const dropdownItems = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`));
                const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));

                const verifyDropdownItemHeight = () => {
                    expect(dropdownItems[0].nativeElement.clientHeight).toEqual(itemHeight);
                    expect(dropdownList.nativeElement.clientHeight).toEqual(itemMaxHeight);
                };
                verifyDropdownItemHeight();

                itemHeight = 48;
                itemMaxHeight = 480;
                combo.itemHeight = itemHeight;
                tick();
                fixture.detectChanges();
                verifyDropdownItemHeight();

                itemMaxHeight = 438;
                combo.itemsMaxHeight = 438;
                tick();
                fixture.detectChanges();
                verifyDropdownItemHeight();

                itemMaxHeight = 1171;
                combo.itemsMaxHeight = 1171;
                tick();
                fixture.detectChanges();
                verifyDropdownItemHeight();

                itemHeight = 83;
                combo.itemHeight = 83;
                tick();
                fixture.detectChanges();
                verifyDropdownItemHeight();
            }));
            it('should render grouped items properly', async () => {
                let dropdownContainer;
                let dropdownItems;
                combo.toggle();
                await wait();
                fixture.detectChanges();

                const checkGroupedItemsClass = () => {
                    fixture.detectChanges();
                    dropdownContainer = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                    dropdownItems = dropdownContainer.querySelectorAll('igx-combo-item');
                    expect(dropdownItems.length).toBeGreaterThan(0);
                    Array.from(dropdownItems).forEach((item) => {
                        const itemElement = item as HTMLElement;
                        const hasClass = itemElement.classList.contains(CSS_CLASS_DROPDOWNLISTITEM) ||
                                         itemElement.classList.contains(CSS_CLASS_HEADERITEM);
                        expect(hasClass).toBeTruthy();
                    });
                };

                // Check initial state
                checkGroupedItemsClass();

                // Scroll through the list in chunks and verify items
                for (let scrollIndex = 10; scrollIndex < combo.data.length; scrollIndex += 10) {
                    await combo.virtualScrollContainer.scrollToIndex(scrollIndex);
                    await combo.virtualScrollContainer.layoutComplete;
                    checkGroupedItemsClass();
                }
            });
            it('should render selected items properly', () => {
                combo.toggle();
                fixture.detectChanges();

                const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
                const dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);


                expect(dropdownItems[1].classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
                expect(dropdownItems[3].classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();

                combo.select(['Illinois', 'Ohio']);
                fixture.detectChanges();
                expect(dropdownItems[1].classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
                expect(dropdownItems[3].classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();

                combo.deselect(['Ohio']);
                fixture.detectChanges();
                expect(dropdownItems[1].classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
            });
            it('should render focused items properly', () => {
                const dropdown = combo.dropdown;
                combo.toggle();
                fixture.detectChanges();

                dropdown.navigateItem(2); // Componenent is virtualized, so this will focus the ACTUAL 3rd item
                fixture.detectChanges();

                const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
                const dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
                const focusedItem_1 = dropdownItems[1];
                expect(focusedItem_1.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();

                // Change focus
                dropdown.navigateItem(4);
                fixture.detectChanges();
                const focusedItem_2 = dropdownItems[3];
                expect(focusedItem_2.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
                expect(focusedItem_1.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
            });
            it(`should not render search input if 'allowCustomValues' is false and 'disableFiltering' is true`, () => {
                combo.allowCustomValues = false;
                combo.disableFiltering = true;
                expect(combo.displaySearchInput).toBeFalsy();
                combo.toggle();
                fixture.detectChanges();
                expect(combo.searchInput).toBeFalsy();
            });
            it('should focus search input', fakeAsync(() => {
                combo.toggle();
                tick();
                fixture.detectChanges();
                expect(document.activeElement).toEqual(combo.searchInput.nativeElement);
            }));
            it('should not focus search input, when autoFocusSearch=false', fakeAsync(() => {
                combo.autoFocusSearch = false;
                combo.toggle();
                tick();
                fixture.detectChanges();
                expect(document.activeElement).not.toEqual(combo.searchInput.nativeElement);
            }));
            it('should properly initialize templates', () => {
                expect(combo).toBeDefined();
                expect(combo.footerTemplate).toBeDefined();
                expect(combo.headerTemplate).toBeDefined();
                expect(combo.itemTemplate).toBeDefined();
                expect(combo.addItemTemplate).toBeUndefined();
                expect(combo.headerItemTemplate).toBeUndefined();
            });
            it('should properly render header and footer templates', () => {
                const getElement = (cssClass: string): HTMLElement | null =>
                    fixture.debugElement.query(By.css(`.${cssClass}`))?.nativeElement || null;

                const assertElementHierarchy = (
                    element: HTMLElement | null,
                    expectedParentClass: string,
                    expectedGrandparentClass: string,
                    label: string
                ) => {
                    expect(element).withContext(`${label} should be rendered`).not.toBeNull();

                    const parent = element!.parentElement;
                    expect(parent).withContext(`${label} should have a parent element`).not.toBeNull();
                    expect(parent!.classList.contains(expectedParentClass))
                        .withContext(`${label} parent should have class '${expectedParentClass}'`).toBeTrue();

                    const grandparent = parent!.parentElement;
                    expect(grandparent).withContext(`${label} should have a grandparent element`).not.toBeNull();
                    expect(grandparent!.classList.contains(expectedGrandparentClass))
                        .withContext(`${label} grandparent should have class '${expectedGrandparentClass}'`).toBeTrue();
                };

                // Before opening the combo, header and footer should not be present
                expect(getElement(CSS_CLASS_HEADER)).withContext('Header should not be present before opening').toBeNull();
                expect(getElement(CSS_CLASS_FOOTER)).withContext('Footer should not be present before opening').toBeNull();

                // Open combo and check templates
                combo.toggle();
                fixture.detectChanges();

                expect(combo.headerTemplate).withContext('Header template should be defined').toBeDefined();
                expect(combo.footerTemplate).withContext('Footer template should be defined').toBeDefined();

                // Validate Header
                const headerElement = getElement(CSS_CLASS_HEADER);
                assertElementHierarchy(headerElement, 'igx-combo', CSS_CLASS_DROPDOWNLIST_SCROLL, 'Header');
                expect(headerElement!.textContent?.trim()).toBe('This is a header');

                // Validate Footer
                const footerElement = getElement(CSS_CLASS_FOOTER);
                assertElementHierarchy(footerElement, 'igx-combo', CSS_CLASS_DROPDOWNLIST_SCROLL, 'Footer');
                expect(footerElement!.textContent?.trim()).toBe('This is a footer');
            });
            it('should render case-sensitive icon properly', () => {
                combo.showSearchCaseIcon = true;
                fixture.detectChanges();
                combo.toggle();
                fixture.detectChanges();

                let caseSensitiveIcon = fixture.debugElement.query(By.css('igx-icon[name=\'case-sensitive\']'));
                expect(caseSensitiveIcon).toBeDefined();

                combo.toggle();
                fixture.detectChanges();
                combo.showSearchCaseIcon = false;
                fixture.detectChanges();
                combo.toggle();
                fixture.detectChanges();

                caseSensitiveIcon = fixture.debugElement.query(By.css('igx-icon[name=\'case-sensitive\']'));
                expect(caseSensitiveIcon).toBeNull();
            });
            it('should render the combo component with the id set and not throw an error', () => {
                fixture = TestBed.createComponent(ComboWithIdComponent);
                fixture.detectChanges();

                combo = fixture.componentInstance.combo;
                fixture.detectChanges();

                expect(combo).toBeTruthy();
                expect(combo.id).toEqual("id1");
                fixture.detectChanges();

                const errorSpy = spyOn(console, 'error');
                fixture.detectChanges();

                expect(errorSpy).not.toHaveBeenCalled();
            });
            it('should properly assign the resource string to the aria-label of the clear button', () => {
                combo.toggle();
                fixture.detectChanges();

                combo.select(['Illinois', 'Mississippi', 'Ohio']);
                fixture.detectChanges();

                const clearBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
                expect(clearBtn.nativeElement.ariaLabel).toEqual('Clear Selection');
            });
        });
        describe('Positioning tests: ', () => {
            let containerElement: any;
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
                containerElement = fixture.debugElement.query(By.css('.comboContainer')).nativeElement;
            });
            it('should adjust combo width to the container element width when set to 100%', fakeAsync(() => {
                const containerWidth = 500;
                const comboWrapper = fixture.debugElement.query(By.css(CSS_CLASS_COMBO)).nativeElement;
                let containerElementWidth = containerElement.getBoundingClientRect().width;
                let wrapperWidth = comboWrapper.getBoundingClientRect().width;
                expect(containerElementWidth).toBeCloseTo(containerWidth, 1);
                expect(containerElementWidth).toBeCloseTo(wrapperWidth, 1);

                combo.toggle();
                tick();
                fixture.detectChanges();
                const inputElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP_BUNDLE}`)).nativeElement;
                const dropDownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
                containerElementWidth = containerElement.getBoundingClientRect().width;
                wrapperWidth = comboWrapper.getBoundingClientRect().width;
                const inputWidth = inputElement.getBoundingClientRect().width;
                const dropDownWidth = dropDownElement.getBoundingClientRect().width;
                expect(containerElementWidth).toEqual(wrapperWidth);
                expect(dropDownWidth).toEqual(containerElementWidth);
                expect(inputWidth).toEqual(containerElementWidth);
            }));
            it('should render combo width properly when placed in container', fakeAsync(() => {
                let comboWidth = '300px';
                const containerWidth = '500px';
                combo.width = comboWidth;
                fixture.detectChanges();

                let comboWrapper = fixture.debugElement.query(By.css(CSS_CLASS_COMBO)).nativeElement;
                let containerElementWidth = containerElement.style.width;
                let wrapperWidth = comboWrapper.style.width;
                expect(containerElementWidth).toEqual(containerWidth);
                expect(wrapperWidth).toEqual(comboWidth);

                combo.toggle();
                tick();
                fixture.detectChanges();

                let inputElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP_BUNDLE}`)).nativeElement;
                let dropDownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
                containerElementWidth = containerElement.style.width;
                wrapperWidth = comboWrapper.style.width;
                let inputWidth = inputElement.getBoundingClientRect().width + 'px';
                let dropDownWidth = dropDownElement.getBoundingClientRect().width + 'px';
                expect(containerElementWidth).toEqual(containerWidth);
                expect(wrapperWidth).toEqual(comboWidth);
                expect(dropDownWidth).toEqual(comboWidth);
                expect(inputWidth).toEqual(comboWidth);

                combo.toggle();
                tick();
                fixture.detectChanges();

                comboWidth = '700px';
                combo.width = comboWidth;
                fixture.detectChanges();

                combo.toggle();
                tick();
                fixture.detectChanges();

                comboWrapper = fixture.debugElement.query(By.css(CSS_CLASS_COMBO)).nativeElement;
                inputElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP_BUNDLE}`)).nativeElement;
                dropDownElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
                containerElementWidth = containerElement.style.width;
                wrapperWidth = comboWrapper.style.width;
                inputWidth = inputElement.getBoundingClientRect().width + 'px';
                dropDownWidth = dropDownElement.getBoundingClientRect().width + 'px';
                expect(containerElementWidth).toEqual(containerWidth);
                expect(wrapperWidth).toEqual(comboWidth);
                expect(dropDownWidth).toEqual(comboWidth);
                expect(inputWidth).toEqual(comboWidth);
            }));
        });
        describe('Binding to primitive array tests: ', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
            });

            it('should bind combo data to array of primitive data', () => {
                const data = [...fixture.componentInstance.citiesData];
                const comboData = combo.data;
                expect(comboData).toEqual(data);
            });
            it('should remove undefined from array of primitive data', () => {
                combo.data = ['New York', 'Sofia', undefined, 'Istanbul', 'Paris'];

                expect(combo.data).toEqual(['New York', 'Sofia', 'Istanbul', 'Paris']);
            });
            it('should render empty template when combo data source is not set', () => {
                combo.data = [];
                fixture.detectChanges();

                combo.toggle();
                fixture.detectChanges();

                const emptyStateElement = fixture.debugElement.query(By.css('.igx-combo__empty'))?.nativeElement;
                expect(emptyStateElement).withContext('Empty state element should be present').not.toBeNull();
                expect(emptyStateElement.textContent?.trim())
                    .withContext('Empty state text should match')
                    .toEqual('The list is empty');
            });
            it('should bind combo data properly when changing data source runtime', () => {
                const newData = ['Item 1', 'Item 2'];
                const data = [...fixture.componentInstance.citiesData];
                expect(combo.data).toEqual(data);
                combo.data = newData;
                fixture.detectChanges();
                expect(combo.data).toEqual(newData);
            });
        });
        describe('Binding to object array tests: ', () => {
            it('should bind combo data to array of objects', () => {
                fixture = TestBed.createComponent(IgxComboSampleComponent);
                fixture.detectChanges();
                const data = [...fixture.componentInstance.items];
                combo = fixture.componentInstance.combo;
                const comboData = combo.data;
                expect(comboData).toEqual(data);
            });
        });
        describe('Binding to remote data tests: ', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxComboRemoteDataComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.instance;
            });
            it('should bind combo data to remote service data', async () => {
                let productIndex = 0;

                const verifyComboData = () => {
                    fixture.detectChanges();
                    let ind = combo.virtualizationState.startIndex;
                    for (let itemIndex = 0; itemIndex < 10; itemIndex++) {
                        expect(combo.data[itemIndex].id).toEqual(ind);
                        expect(combo.data[itemIndex].product).toEqual('Product ' + ind);
                        const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
                        const dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
                        expect(dropdownItems[itemIndex].innerText.trim()).toEqual('Product ' + ind);
                        ind++;
                    }
                };

                combo.toggle();
                fixture.detectChanges();
                verifyComboData();
                expect(combo.virtualizationState.startIndex).toEqual(productIndex);

                const expectIndexInWindow = (index: number) => {
                    const { startIndex, chunkSize } = combo.virtualizationState;
                    expect(index).toBeGreaterThanOrEqual(startIndex);
                    expect(index).toBeLessThanOrEqual(startIndex + chunkSize - 1);
                };

                productIndex = 42;
                await combo.virtualScrollContainer.scrollToIndex(productIndex);
                fixture.detectChanges();
                verifyComboData();
                expectIndexInWindow(productIndex);

                productIndex = 485;
                await combo.virtualScrollContainer.scrollToIndex(productIndex);
                fixture.detectChanges();
                verifyComboData();
                expectIndexInWindow(productIndex);

                productIndex = 873;
                await combo.virtualScrollContainer.scrollToIndex(productIndex);
                fixture.detectChanges();
                verifyComboData();

                productIndex = 649;
                await combo.virtualScrollContainer.scrollToIndex(productIndex);
                fixture.detectChanges();
                verifyComboData();
            });
            it('should bind combo data to remote data and clear selection properly', async () => {
                let selectedItems = [combo.data[0], combo.data[1]];
                const spyObj = jasmine.createSpyObj('event', ['stopPropagation']);
                combo.toggle();
                combo.select([selectedItems[0][combo.valueKey], selectedItems[1][combo.valueKey]]);
                expect(combo.displayValue).toEqual(`${selectedItems[0][combo.displayKey]}, ${selectedItems[1][combo.displayKey]}`);
                expect(combo.selection).toEqual([selectedItems[0], selectedItems[1]]);
                expect(combo.value).toEqual([selectedItems[0][combo.valueKey], selectedItems[1][combo.valueKey]]);
                // Clear items while they are in view
                combo.handleClearItems(spyObj);
                expect(combo.selection).toEqual([]);
                expect(combo.displayValue).toEqual('');
                expect(combo.value).toEqual([]);
                selectedItems = [combo.data[2], combo.data[3]];
                combo.select([selectedItems[0][combo.valueKey], selectedItems[1][combo.valueKey]]);
                expect(combo.displayValue).toEqual(`${selectedItems[0][combo.displayKey]}, ${selectedItems[1][combo.displayKey]}`);

                // Scroll selected items out of view
                await combo.virtualScrollContainer.scrollToIndex(40);
                fixture.detectChanges();
                combo.handleClearItems(spyObj);
                expect(combo.selection).toEqual([]);
                expect(combo.value).toEqual([]);
                expect(combo.displayValue).toEqual('');
                combo.select([combo.data[7][combo.valueKey]]);
                expect(combo.displayValue).toEqual(combo.data[7][combo.displayKey]);
            });
            it('should add selected items to the input when data is loaded', async () => {
                expect(combo.selection.length).toEqual(0);
                expect(combo.value).toEqual([]);

                // current combo data - id: 0 - 9
                // select item that is not present in the data source yet should be added as partial item
                combo.select([9, 19]);
                expect(combo.selection.length).toEqual(2);
                expect(combo.value.length).toEqual(2);

                const loaded = (id: number) => combo.data.find(item => item[combo.valueKey] === id);

                const firstItem = loaded(9);
                expect(firstItem).toBeDefined();
                expect(combo.displayValue).toEqual(firstItem[combo.displayKey]);

                combo.toggle();

                // scroll to second selected item
                await combo.virtualScrollContainer.scrollToIndex(19);
                fixture.detectChanges();

                const secondItem = loaded(19);
                expect(secondItem).toBeDefined();
                expect(combo.displayValue).toEqual(`${firstItem[combo.displayKey]}, ${secondItem[combo.displayKey]}`);
            });
            it('should fire selectionChanging event with partial data for items out of view', async () => {
                const selectionSpy = spyOn(combo.selectionChanging, 'emit').and.callThrough();
                const valueKey = combo.valueKey;

                combo.toggle();
                combo.select([combo.data[0][valueKey], combo.data[1][valueKey]]);

                const expectedResults: IComboSelectionChangingEventArgs = {
                    newValue: [combo.data[0][valueKey], combo.data[1][valueKey]],
                    oldValue: [],
                    newSelection: [combo.data[0], combo.data[1]],
                    oldSelection: [],
                    added: [combo.data[0], combo.data[1]],
                    removed: [],
                    event: undefined,
                    owner: combo,
                    displayText: `${combo.data[0][combo.displayKey]}, ${combo.data[1][combo.displayKey]}`,
                    cancel: false
                };
                expect(selectionSpy).toHaveBeenCalledWith(expectedResults);

                // Scroll selected items out of view
                await combo.virtualScrollContainer.scrollToIndex(40);
                fixture.detectChanges();

                // The first two records of the page it landed on; the earlier two are partial.
                const added = [combo.data[0], combo.data[1]];
                const partial = [{ [valueKey]: 0 }, { [valueKey]: 1 }];
                combo.select([added[0][valueKey], added[1][valueKey]]);

                Object.assign(expectedResults, {
                    newValue: [0, 1, added[0][valueKey], added[1][valueKey]],
                    oldValue: [0, 1],
                    newSelection: [...partial, ...added],
                    oldSelection: partial,
                    added,
                    removed: [],
                    event: undefined,
                    owner: combo,
                    displayText: `Product 0, Product 1, ${added[0][combo.displayKey]}, ${added[1][combo.displayKey]}`,
                    cancel: false
                });

                expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
            });
        });
        describe('Binding to remote data with request cancellation: ', () => {
            let host: IgxComboDeferredRemoteComponent;

            const settle = async () => {
                fixture.detectChanges();
                await combo.virtualScrollContainer.layoutComplete;
                await fixture.whenStable();
                fixture.detectChanges();
            };

            beforeEach(async () => {
                fixture = TestBed.createComponent(IgxComboDeferredRemoteComponent);
                fixture.detectChanges();
                host = fixture.componentInstance;
                combo = host.instance;

                // The first page, so the list starts from a loaded window.
                host.service.complete(host.service.requests[0]);
                await settle();
            });

            it('should keep the latest page after the previous request is cancelled', async () => {
                combo.toggle();
                await settle();

                // A: scrolled to one window, its request left unanswered.
                await combo.virtualScrollContainer.scrollToIndex(400);
                await settle();
                const requestA = host.service.requests[host.service.requests.length - 1];
                expect(requestA.state.startIndex).toBeGreaterThan(0);

                // B: scrolled somewhere else, which drops the request still in flight.
                await combo.virtualScrollContainer.scrollToIndex(800);
                await settle();
                const requestB = host.service.requests[host.service.requests.length - 1];

                expect(requestB).not.toBe(requestA);
                expect(requestA.subject.observed).toBeFalse();
                expect(requestB.subject.observed).toBeTrue();

                host.service.complete(requestB);
                await settle();

                const rangeOf = (state: IForOfState) => ({
                    start: state.startIndex,
                    end: state.startIndex + (state.chunkSize || 10) - 1
                });
                const rowText = () => Array.from(
                    fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement
                        .querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`)
                ).map((row: HTMLElement) => row.textContent.trim());

                const windowB = rangeOf(requestB.state);
                expect(combo.virtualizationState.startIndex).toEqual(requestB.state.startIndex);
                expect(combo.data[0].id).toEqual(windowB.start);
                expect(combo.data.every(record =>
                    record.id >= windowB.start && record.id <= windowB.end)).toBeTrue();

                const renderedAfterB = rowText();
                expect(renderedAfterB.length).toBeGreaterThan(0);
                renderedAfterB.forEach(text => {
                    const id = Number(text.replace('Product ', ''));
                    expect(id).toBeGreaterThanOrEqual(windowB.start);
                    expect(id).toBeLessThanOrEqual(windowB.end);
                });

                // Emitting from the cancelled request must not affect the bound data or rows.
                host.service.complete(requestA);
                await settle();

                expect(combo.virtualizationState.startIndex).toEqual(requestB.state.startIndex);
                expect(combo.data[0].id).toEqual(windowB.start);
                expect(rowText()).toEqual(renderedAfterB);
            });

            it('should leave the loaded page where it is until a response arrives', async () => {
                combo.toggle();
                await settle();

                expect(combo.virtualScrollContainer.dataWindow().startIndex).toBe(0);

                await combo.virtualScrollContainer.scrollToIndex(400);
                await settle();

                const request = host.service.requests[host.service.requests.length - 1];
                expect(request.state.startIndex).toBeGreaterThan(300);

                // Nothing has answered it, so the records bound are still the first page.
                const window = combo.virtualScrollContainer.dataWindow();
                expect(window.startIndex).toBe(0);
                expect(window.items[0].id).toBe(0);

                // The rows the viewport wants have no records behind them, so none render.
                const rows = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`))
                    .nativeElement.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
                expect(rows.length).toBe(0);
            });

            it('should not ask again for a range the loaded page already covers', async () => {
                // A fresh list whose first page is long enough to fill the viewport and
                // its over-scan before the list is ever shown.
                fixture = TestBed.createComponent(IgxComboDeferredRemoteComponent);
                fixture.detectChanges();
                host = fixture.componentInstance;
                combo = host.instance;
                host.service.complete(host.service.requests[0], 50);
                await settle();

                expect(combo.data.length).toBe(50);

                // Only the page the host asked for itself: the list has nothing left to want.
                expect(host.service.requests.length).toBe(1);

                combo.toggle();
                await settle();

                expect(host.service.requests.length).toBe(1);
            });

            it('should keep the window inside a total that has shrunk', async () => {
                combo.toggle();
                await settle();

                await combo.virtualScrollContainer.scrollToIndex(400);
                await settle();
                host.service.complete(host.service.requests[host.service.requests.length - 1]);
                await settle();

                expect(combo.virtualizationState.startIndex).toBeGreaterThan(300);

                // The collection turns out to be far smaller than it had reported.
                combo.totalItemCount = 100;
                await settle();

                expect(combo.virtualizationState.startIndex).toBeLessThan(100);

                const window = combo.virtualScrollContainer.dataWindow();
                expect(window.totalCount).toBe(100);
                expect(window.startIndex + window.items.length).toBeLessThanOrEqual(window.totalCount);

                // The scrollbar spans the collection that is left, not the one it replaced.
                const scroll = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
                const track = scroll.querySelector('.igx-vs__track') as HTMLElement;
                expect(Number.parseFloat(track.style.height)).toBe(100 * 40);

                // The records loaded are past the end of what is left, so they are not the
                // last page and nothing stands in for them until a valid page arrives.
                expect(scroll.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`).length).toBe(0);
            });
        });

        describe('Binding to remote data without a zone: ', () => {
            let host: IgxComboZonelessRemoteComponent;

            const settle = async () => {
                await fixture.whenStable();
                await combo.virtualScrollContainer.layoutComplete;
                await fixture.whenStable();
            };

            const rows = () => Array.from(fixture.debugElement
                .query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement
                .querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`)) as HTMLElement[];

            const rowAt = (row: HTMLElement) =>
                Number(row.closest('[data-vs-index]')!.getAttribute('data-vs-index'));

            beforeEach(async () => {
                TestBed.resetTestingModule();
                await TestBed.configureTestingModule({
                    imports: [NoopAnimationsModule, IgxComboZonelessRemoteComponent],
                    providers: [provideZonelessChangeDetection()]
                }).compileComponents();

                fixture = TestBed.createComponent(IgxComboZonelessRemoteComponent);
                host = fixture.componentInstance;
                combo = host.instance;
                await fixture.whenStable();

                host.data.set(host.page(0, 50));
                combo.totalItemCount = 1000;
                await settle();

                combo.open();
                await settle();
            });

            it('should drop a reply to a range the list has already left', async () => {
                await combo.virtualScrollContainer.scrollToIndex(400);
                await settle();

                const away = host.requests[host.requests.length - 1];
                expect(away.startIndex).toBeGreaterThan(300);

                // Coming back asks for what is in view, which supersedes the request that
                // is still in flight - the cancellation the consumer already implements.
                await combo.virtualScrollContainer.scrollToIndex(0);
                await settle();

                const back = host.requests[host.requests.length - 1];
                expect(back).not.toBe(away);
                expect(back.startIndex).toBe(0);
                expect(away.response.observed).toBeFalse();

                // The abandoned reply arrives first and has to change nothing.
                host.complete(away);
                await settle();

                expect(combo.data[0].id).toBe(0);

                host.complete(back);
                await settle();

                expect(rows().length).toBeGreaterThan(0);
                rows().forEach(row => expect(row.textContent.trim()).toBe(`Product ${rowAt(row)}`));
            });

            it('should render a grouped page whose rows exceed the remote record count', async () => {
                host.groupKey.set('category');
                host.data.set(host.page(0, 10));
                combo.totalItemCount = 10;
                await settle();

                // Every record is loaded; the two headers grouping adds are rows, not
                // records, and must not count against the size of the collection.
                expect(combo.data.length).toBe(10);

                // Grouping reorders the records, so every one of them is on screen rather
                // than each sitting at the index its id would suggest.
                const texts = rows().map(row => row.textContent.trim());
                expect(texts.length).toBe(10);
                for (let id = 0; id < 10; id++) {
                    expect(texts).toContain(`Product ${id}`);
                }

                const headers = fixture.debugElement
                    .query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement
                    .querySelectorAll(`.${CSS_CLASS_HEADERITEM}`);
                expect(headers.length).toBeGreaterThan(0);
            });

            for (const total of [100, 2000]) {
                it(`should render a remote total of ${total} without rebinding the page`, async () => {
                    const data = combo.data;
                    const state = { ...combo.virtualizationState };

                    combo.totalItemCount = total;
                    await settle();

                    expect(combo.data).toBe(data);
                    expect(combo.virtualizationState).toEqual(state);
                    expect(combo.virtualScrollContainer.dataWindow().totalCount).toBe(total);
                    const track = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`))
                        .nativeElement.querySelector('.igx-vs__track') as HTMLElement;
                    expect(Number.parseFloat(track.style.height)).toBe(total * 40);
                });
            }

            it('should preserve grouped records at the end of a partially valid remote page', async () => {
                host.groupKey.set('category');
                await settle();
                await combo.virtualScrollContainer.scrollToIndex(80);
                await settle();

                const request = host.requests[host.requests.length - 1];
                host.complete(request, 50);
                await settle();
                const data = combo.data;

                // Only the total changes: records before 100 remain valid, including the
                // last one after grouping has added its headers and reordered the page.
                combo.totalItemCount = 100;
                await settle();

                expect(combo.data).toBe(data);
                const window = combo.virtualScrollContainer.dataWindow();
                const records = window.items.filter(item => !item.isHeader);
                expect(records.map(item => item.id).sort((a, b) => a - b)).toEqual(
                    host.page(request.startIndex, 100 - request.startIndex).map(item => item.id));
                expect(window.items.filter(item => item.isHeader).length).toBe(2);

                await combo.virtualScrollContainer.scrollToIndex(window.startIndex + window.items.length - 1);
                await settle();

                expect(rows().map(row => row.textContent.trim())).toContain('Product 99');
                for (const row of rows()) {
                    expect(row.textContent.trim()).toBe(window.items[rowAt(row) - window.startIndex].product);
                }
            });

            it('should keep the part of a page that is still inside a shrunken total', async () => {
                await combo.virtualScrollContainer.scrollToIndex(80);
                await settle();

                const request = host.requests[host.requests.length - 1];
                expect(request.startIndex).toBeLessThan(80);

                host.complete(request, 50);
                await settle();

                // The collection turns out to hold 100 records. The page reaches past that,
                // but the records in view are still inside it. The consumer publishes the
                // new total with the page it already has, in one action.
                combo.totalItemCount = 100;
                host.data.set(host.page(request.startIndex, 50));
                await settle();

                expect(rows().length).toBeGreaterThan(0);
                rows().forEach(row => {
                    expect(rowAt(row)).toBeLessThan(100);
                    expect(row.textContent.trim()).toBe(`Product ${rowAt(row)}`);
                });
            });

            it('should show accepted filter results from the start of the collection', async () => {
                await combo.virtualScrollContainer.scrollToIndex(400);
                await settle();
                host.complete(host.requests[host.requests.length - 1]);
                await settle();

                expect(combo.data[0].id).toBeGreaterThan(300);

                // Searching loads its own page, outside the scrolling request flow.
                host.disableFiltering.set(false);
                await settle();

                const search = fixture.debugElement
                    .query(By.css(CSS_CLASS_SEARCHINPUT)).nativeElement as HTMLInputElement;
                search.value = 'Product';
                search.dispatchEvent(new Event('input', { bubbles: true }));
                await settle();

                expect(host.searches.length).toBe(1);
                expect(combo.data[0].id).toBe(0);

                // Those records are the head of the collection, not the page left behind.
                expect(rows().length).toBeGreaterThan(0);
                rows().forEach(row => expect(row.textContent.trim()).toBe(`Product ${rowAt(row)}`));
            });

            it('should stop showing records the collection no longer has', async () => {
                await combo.virtualScrollContainer.scrollToIndex(400);
                await settle();
                host.complete(host.requests[host.requests.length - 1]);
                await settle();

                expect(combo.data[0].id).toBeGreaterThan(300);
                expect(rows().length).toBeGreaterThan(0);

                // The collection turns out to hold 100 records; the loaded ones are past it.
                combo.totalItemCount = 100;
                await settle();

                expect(rows().length).toBe(0);
                expect(combo.virtualizationState.startIndex).toBeLessThan(100);

                // The position it settles on is asked for, and what arrives shows there.
                const request = host.requests[host.requests.length - 1];
                expect(request.startIndex).toBeLessThan(100);

                host.complete(request);
                await settle();

                expect(rows().length).toBeGreaterThan(0);
                rows().forEach(row => expect(row.textContent.trim()).toBe(`Product ${rowAt(row)}`));
            });
        });

        describe('Binding to ngModel tests: ', () => {
            let component: ComboModelBindingComponent;
            beforeEach(() => {
                fixture = TestBed.createComponent(ComboModelBindingComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
                component = fixture.componentInstance;
            });
            it('should properly bind to object value w/ valueKey', fakeAsync(() => {
                combo.valueKey = 'id';
                component.selectedItems = [0, 2];
                fixture.detectChanges();
                tick();
                expect(combo.selection).toEqual([combo.data[0], combo.data[2]]);
                expect(combo.value).toEqual([combo.data[0][combo.valueKey], combo.data[2][combo.valueKey]]);
                combo.select([combo.data[4][combo.valueKey]]);
                fixture.detectChanges();
                expect(component.selectedItems).toEqual([0, 2, 4]);
            }));
            it('should properly bind to object value w/o valueKey', fakeAsync(() => {
                component.selectedItems = [component.items[0], component.items[2]];
                fixture.detectChanges();
                tick();
                expect(combo.selection).toEqual([combo.data[0], combo.data[2]]);
                expect(combo.value).toEqual([combo.data[0], combo.data[2]]);
                combo.select([combo.data[4]]);
                fixture.detectChanges();
                expect(component.selectedItems).toEqual([combo.data[0], combo.data[2], combo.data[4]]);
            }));
            it('should properly bind to values w/o valueKey', fakeAsync(() => {
                component.items = ['One', 'Two', 'Three', 'Four', 'Five'];
                component.selectedItems = ['One', 'Two'];
                fixture.detectChanges();
                tick();
                const data = fixture.componentInstance.items;
                expect(combo.selection).toEqual(component.selectedItems);
                expect(combo.value).toEqual(component.selectedItems);
                combo.select([...data].splice(1, 3), true);
                fixture.detectChanges();
                expect(fixture.componentInstance.selectedItems).toEqual([...data].splice(1, 3));
            }));
        });
        describe('Dropdown tests: ', () => {
            describe('complex data dropdown: ', () => {
                let dropdown: IgxComboDropDownComponent;
                beforeEach(() => {
                    fixture = TestBed.createComponent(IgxComboSampleComponent);
                    fixture.detectChanges();
                    combo = fixture.componentInstance.combo;
                    dropdown = combo.dropdown;
                    input = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
                });
                it('should properly call dropdown navigatePrev method', fakeAsync(() => {
                    expect(dropdown.focusedItem).toBeFalsy();
                    expect(dropdown.focusedItem).toEqual(null);
                    expect(combo.collapsed).toBeTruthy();
                    combo.toggle();
                    tick();
                    fixture.detectChanges();
                    expect(document.activeElement).toEqual(combo.searchInput.nativeElement);
                    expect(combo.collapsed).toBeFalsy();
                    combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'ArrowDown'));
                    fixture.detectChanges();
                    expect(dropdown.focusedItem).toBeTruthy();
                    expect(dropdown.focusedItem.itemIndex).toEqual(0);
                    expect(combo.virtualizationState.startIndex).toEqual(0);
                    dropdown.navigatePrev();
                    tick();
                    fixture.detectChanges();
                    expect(document.activeElement).toEqual(combo.searchInput.nativeElement);
                    combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'ArrowDown'));
                    fixture.detectChanges();
                    expect(dropdown.focusedItem).toBeTruthy();
                    expect(dropdown.focusedItem.itemIndex).toEqual(0);
                    dropdown.navigateNext();
                    tick();
                    fixture.detectChanges();
                    expect(dropdown.focusedItem).toBeTruthy();
                    expect(dropdown.focusedItem.itemIndex).toEqual(1);
                    expect(combo.virtualizationState.startIndex).toEqual(0);
                    spyOn(dropdown, 'navigatePrev').and.callThrough();
                    dropdown.navigatePrev();
                    tick();
                    expect(dropdown.focusedItem).toBeTruthy();
                    expect(dropdown.focusedItem.itemIndex).toEqual(0);
                    expect(combo.virtualizationState.startIndex).toEqual(0);
                    expect(dropdown.navigatePrev).toHaveBeenCalledTimes(1);
                }));
                it('should properly call dropdown navigateNext with virtual items', (async () => {
                    expect(combo).toBeDefined();
                    expect(dropdown).toBeDefined();
                    expect(dropdown.focusedItem).toBeFalsy();
                    expect(combo.virtualScrollContainer).toBeDefined();
                    combo.allowCustomValues = true;
                    const mockClick = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
                    const virtualMockUP = spyOn<any>(dropdown, 'navigatePrev').and.callThrough();
                    const virtualMockDOWN = spyOn<any>(dropdown, 'navigateNext').and.callThrough();
                    expect(dropdown.focusedItem).toEqual(null);
                    expect(combo.collapsed).toBeTruthy();
                    combo.toggle();
                    await wait();
                    fixture.detectChanges();
                    expect(combo.collapsed).toBeFalsy();
                    await combo.virtualScrollContainer.scrollToIndex(51);
                    fixture.detectChanges();
                    const items = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`));
                    const lastItem = items[items.length - 1].componentInstance;
                    expect(lastItem).toBeDefined();
                    lastItem.clicked(mockClick);
                    fixture.detectChanges();
                    expect(dropdown.focusedItem).toEqual(lastItem);
                    dropdown.navigateItem(-1);
                    fixture.detectChanges();
                    expect(virtualMockDOWN).toHaveBeenCalledTimes(0);
                    lastItem.clicked(mockClick);
                    fixture.detectChanges();
                    expect(dropdown.focusedItem).toEqual(lastItem);
                    dropdown.navigateNext();
                    fixture.detectChanges();
                    expect(virtualMockDOWN).toHaveBeenCalledTimes(1);
                    combo.searchValue = 'New';
                    combo.handleInputChange();
                    fixture.detectChanges();
                    await combo.virtualScrollContainer.layoutComplete;
                    const addItemButton = fixture.debugElement.query(By.directive(IgxComboAddItemComponent));
                    addItemButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                    fixture.detectChanges();
                    // After `Add Item` is clicked, the input is focused and the item is added to the list
                    expect(dropdown.focusedItem).toEqual(null);
                    expect(document.activeElement).toEqual(combo.searchInput.nativeElement);
                    expect(combo.customValueFlag).toBeFalsy();
                    expect(combo.searchInput.nativeElement.value).toBeTruthy();

                    // TEST move from first item
                    const firstItem = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[0].componentInstance;
                    firstItem.clicked(mockClick);
                    fixture.detectChanges();
                    expect(dropdown.focusedItem).toEqual(firstItem);
                    expect(dropdown.focusedItem.itemIndex).toEqual(0);
                    dropdown.navigateFirst();
                    fixture.detectChanges();
                    dropdown.navigatePrev();
                    fixture.detectChanges();
                    // Called once manually and called once more, because item @ index 0 is a header
                    expect(virtualMockUP).toHaveBeenCalledTimes(2);
                    expect(dropdown.focusedItem).toBeNull();
                }));
                it('should properly get the first focusable item when focusing the component list', () => {
                    const expectedItemText = 'State: MichiganRegion: East North Central';
                    combo.toggle();
                    fixture.detectChanges();
                    combo.dropdown.onFocus();
                    fixture.detectChanges();
                    (document.getElementsByClassName(CSS_CLASS_CONTENT)[0] as HTMLElement).focus();
                    expect(combo.dropdown.focusedItem.element.nativeElement.textContent.trim()).toEqual(expectedItemText);
                });
                it('should focus item when onFocus and onBlur are called', () => {
                    expect(dropdown.focusedItem).toEqual(null);
                    dropdown.toggle();
                    fixture.detectChanges();
                    expect(dropdown.items).toBeDefined();
                    expect(dropdown.items.length).toBeGreaterThan(0);
                    expect(dropdown.items.length).toBeLessThan(combo.data.length);
                    dropdown.onFocus();
                    expect(dropdown.focusedItem).toEqual(dropdown.items[0]);
                    expect(dropdown.focusedItem.focused).toEqual(true);
                    dropdown.onFocus();
                    dropdown.onBlur();
                    expect(dropdown.focusedItem).toEqual(null);
                    dropdown.onBlur();
                });
                it('should properly handle dropdown.focusItem', fakeAsync(() => {
                    combo.toggle();
                    tick();
                    fixture.detectChanges();
                    const virtualSpyUP = spyOn(dropdown, 'navigatePrev');
                    const virtualSpyDOWN = spyOn(dropdown, 'navigateNext');
                    spyOn(IgxComboDropDownComponent.prototype, 'navigateItem').and.callThrough();
                    dropdown.navigateItem(0);
                    fixture.detectChanges();
                    expect(IgxComboDropDownComponent.prototype.navigateItem).toHaveBeenCalledTimes(1);
                    dropdown.navigatePrev();
                    expect(IgxComboDropDownComponent.prototype.navigateItem).toHaveBeenCalledTimes(1);
                    dropdown.navigateItem(dropdown.items.length - 1);
                    dropdown.navigateNext();
                    expect(IgxComboDropDownComponent.prototype.navigateItem).toHaveBeenCalledTimes(2);
                    expect(virtualSpyDOWN).toHaveBeenCalled();
                    expect(virtualSpyUP).toHaveBeenCalled();
                }));
                it('should handle keyboard events', fakeAsync(() => {
                    combo.toggle();
                    tick();
                    fixture.detectChanges();
                    spyOn(combo, 'selectAllItems');
                    spyOn(combo, 'toggle');
                    spyOn(combo.dropdown, 'onFocus').and.callThrough();
                    combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'A'));
                    combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', null));
                    expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
                    expect(combo.dropdown.onFocus).toHaveBeenCalledTimes(0);
                    combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'Enter'));
                    expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
                    spyOnProperty(combo, 'filteredData', 'get').and.returnValue([1]);
                    combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'Enter'));
                    expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
                    combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'ArrowDown'));
                    expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
                    // expect(combo.dropdown.onFocus).toHaveBeenCalledTimes(1);
                    combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'Escape'));
                    expect(combo.toggle).toHaveBeenCalledTimes(1);
                }));
                it('should toggle combo dropdown on toggle button click', fakeAsync(() => {
                    spyOn(combo, 'toggle').and.callThrough();
                    input.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                    tick();
                    fixture.detectChanges();
                    expect(combo.collapsed).toEqual(false);
                    expect(combo.toggle).toHaveBeenCalledTimes(1);
                    expect(document.activeElement).toEqual(combo.searchInput.nativeElement);

                    input.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                    tick();
                    fixture.detectChanges();
                    expect(combo.collapsed).toEqual(true);
                    expect(combo.toggle).toHaveBeenCalledTimes(2);
                }));
                it('should toggle dropdown list with arrow down/up keys', fakeAsync(() => {
                    spyOn(combo, 'open').and.callThrough();
                    spyOn(combo, 'close').and.callThrough();

                    combo.onArrowDown(UIInteractions.getKeyboardEvent('keydown', 'ArrowDown'));
                    tick();
                    fixture.detectChanges();
                    expect(combo.open).toHaveBeenCalledTimes(1);

                    combo.onArrowDown(UIInteractions.getKeyboardEvent('keydown', 'ArrowDown', true));
                    tick();
                    fixture.detectChanges();
                    expect(combo.collapsed).toEqual(false);
                    expect(combo.open).toHaveBeenCalledTimes(2);

                    combo.handleKeyDown(UIInteractions.getKeyboardEvent('keydown', 'ArrowUp'));
                    tick();
                    fixture.detectChanges();
                    expect(combo.close).toHaveBeenCalledTimes(1);

                    combo.handleKeyDown(UIInteractions.getKeyboardEvent('keydown', 'ArrowUp', true));
                    fixture.detectChanges();
                    tick();
                    expect(combo.close).toHaveBeenCalledTimes(2);
                }));
                it('should select/focus dropdown list items with space/up and down arrow keys', async () => {
                    let selectedItemsCount = 0;
                    combo.toggle();
                    fixture.detectChanges();
                    await combo.virtualScrollContainer.layoutComplete;
                    fixture.detectChanges();

                    const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
                    const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                    const rowAt = (index: number) =>
                        dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`)[index];
                    let focusedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_FOCUSED}`);
                    let selectedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_SELECTED}`);
                    expect(focusedItems.length).toEqual(0);
                    expect(selectedItems.length).toEqual(0);

                    const focusAndVerifyItem = async (itemIndex: number, key: string) => {
                        UIInteractions.triggerEventHandlerKeyDown(key, dropdownContent);
                        // Manual change detection: render what the keyboard event updated.
                        fixture.detectChanges();
                        await combo.virtualScrollContainer.layoutComplete;
                        fixture.detectChanges();
                        focusedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_FOCUSED}`);
                        expect(focusedItems.length).toEqual(1);
                        expect(focusedItems[0]).toEqual(rowAt(itemIndex));
                    };

                    const selectAndVerifyItem = async (itemIndex: number) => {
                        UIInteractions.triggerEventHandlerKeyDown('Space', dropdownContent);
                        fixture.detectChanges();
                        await combo.virtualScrollContainer.layoutComplete;
                        fixture.detectChanges();
                        selectedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_SELECTED}`);
                        expect(selectedItems.length).toEqual(selectedItemsCount);
                        expect(selectedItems).toContain(rowAt(itemIndex));
                    };

                    await focusAndVerifyItem(0, 'ArrowDown');
                    selectedItemsCount++;
                    await selectAndVerifyItem(0);

                    for (let index = 1; index < 5; index++) {
                        await focusAndVerifyItem(index, 'ArrowDown');
                    }
                    selectedItemsCount++;
                    await selectAndVerifyItem(4);

                    for (let index = 3; index >= 2; index--) {
                        await focusAndVerifyItem(index, 'ArrowUp');
                    }
                    selectedItemsCount++;
                    await selectAndVerifyItem(2);
                });
                it('should properly navigate using HOME/END key', (async () => {
                    let firstVisibleItem: Element;
                    combo.toggle();
                    await wait();
                    fixture.detectChanges();
                    const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                    const scrollbar = fixture.debugElement.query(By.css(`.${CSS_CLASS_SCROLLBAR_VERTICAL}`)).nativeElement as HTMLElement;
                    expect(scrollbar.scrollTop).toEqual(0);
                    // Scroll to bottom;
                    UIInteractions.triggerEventHandlerKeyDown('End', dropdownContent);
                    await combo.virtualScrollContainer.layoutComplete;
                    fixture.detectChanges();
                    // Content was scrolled to bottom
                    expect(scrollbar.scrollHeight - scrollbar.scrollTop - scrollbar.clientHeight).toBeLessThan(1);

                    // Scroll to top
                    UIInteractions.triggerEventHandlerKeyDown('Home', dropdownContent);
                    await combo.virtualScrollContainer.layoutComplete;
                    fixture.detectChanges();
                    const dropdownContainer: HTMLElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                    firstVisibleItem = dropdownContainer.querySelector(`.${CSS_CLASS_DROPDOWNLISTITEM}` + ':first-child');
                    // Container is scrolled to top
                    expect(scrollbar.scrollTop - 32).toBeLessThan(1);

                    // First item is focused
                    expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownContent);
                    fixture.detectChanges();
                    firstVisibleItem = dropdownContainer.querySelector(`.${CSS_CLASS_DROPDOWNLISTITEM}` + ':first-child');

                    // Scroll has not change
                    expect(scrollbar.scrollTop - 32).toBeLessThan(1);
                    // First item is no longer focused
                    expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
                    UIInteractions.triggerEventHandlerKeyDown('Home', dropdownContent);
                    fixture.detectChanges();
                    expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
                }));
                it('should close the dropdown list on pressing Tab key and focus the next focusable element', fakeAsync(() => {
                    combo.toggle();
                    fixture.detectChanges();

                    const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                    const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
                    UIInteractions.triggerEventHandlerKeyDown('Tab', dropdownContent);
                    tick();
                    fixture.detectChanges();
                    expect(combo.collapsed).toBeTruthy();

                    combo.toggle();
                    fixture.detectChanges();
                    expect(combo.collapsed).toBeFalsy();

                    let focusedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_FOCUSED}`);
                    let selectedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_SELECTED}`);
                    expect(focusedItems.length).toEqual(0);
                    expect(selectedItems.length).toEqual(0);

                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownContent);
                    fixture.detectChanges();
                    focusedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_FOCUSED}`);
                    expect(focusedItems.length).toEqual(1);

                    UIInteractions.triggerEventHandlerKeyDown('Tab', dropdownContent);
                    tick();
                    fixture.detectChanges();
                    expect(combo.collapsed).toBeTruthy();
                    expect(document.activeElement).not.toEqual(combo.comboInput.nativeElement);

                    combo.toggle();
                    fixture.detectChanges();
                    expect(combo.collapsed).toBeFalsy();

                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownContent);
                    fixture.detectChanges();
                    focusedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_FOCUSED}`);
                    expect(focusedItems.length).toEqual(1);

                    UIInteractions.triggerEventHandlerKeyDown('Space', dropdownContent);
                    fixture.detectChanges();
                    selectedItems = dropdownList.querySelectorAll(`.${CSS_CLASS_SELECTED}`);
                    expect(selectedItems.length).toEqual(1);

                    UIInteractions.triggerEventHandlerKeyDown('Tab', dropdownContent);
                    tick();
                    fixture.detectChanges();
                    expect(combo.collapsed).toBeTruthy();
                    expect(document.activeElement).not.toEqual(combo.comboInput.nativeElement);
                }));
                it('should clear the selection and preserve the focus when the combo is collapsed and Escape key is pressed', fakeAsync(() => {
                    combo.comboInput.nativeElement.focus();
                    fixture.detectChanges();
                    expect(document.activeElement).toEqual(combo.comboInput.nativeElement);

                    combo.select([combo.data[0][combo.valueKey]]);
                    expect(combo.selection.length).toEqual(1);
                    fixture.detectChanges();

                    combo.onEscape(UIInteractions.getKeyboardEvent('keydown', 'Escape'));
                    tick();
                    fixture.detectChanges();
                    expect(document.activeElement).toEqual(combo.comboInput.nativeElement);
                    expect(combo.selection.length).toEqual(0);
                }));
                it('should stop Escape keydown event propagation when the dropdown is open', fakeAsync(() => {
                    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
                    spyOn(escapeEvent, 'stopPropagation');

                    combo.comboInput.nativeElement.focus();
                    fixture.detectChanges();

                    combo.toggle();
                    fixture.detectChanges();
                    expect(combo.collapsed).toBeFalsy();

                    combo.onEscape(escapeEvent);
                    tick();
                    fixture.detectChanges();

                    expect(escapeEvent.stopPropagation).toHaveBeenCalled();
                }));
                it('should stop Escape key propagation when the combo is collapsed and has a selection', fakeAsync(() => {
                    combo.comboInput.nativeElement.focus();
                    fixture.detectChanges();

                    combo.select([combo.data[0][combo.valueKey]]);
                    expect(combo.selection.length).toEqual(1);
                    fixture.detectChanges();

                    const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
                    const stopPropSpy = spyOn(keyEvent, 'stopPropagation');

                    combo.onEscape(keyEvent);
                    tick();
                    fixture.detectChanges();

                    expect(stopPropSpy).toHaveBeenCalledTimes(1);
                }));
                it('should close the combo and preserve the focus when Escape key is pressed', fakeAsync(() => {
                    combo.comboInput.nativeElement.focus();
                    fixture.detectChanges();
                    expect(document.activeElement).toEqual(combo.comboInput.nativeElement);

                    combo.toggle();
                    fixture.detectChanges();
                    expect(combo.collapsed).toBeFalsy();

                    const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));

                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownContent);
                    fixture.detectChanges();

                    UIInteractions.triggerEventHandlerKeyDown('Escape', dropdownContent);
                    fixture.detectChanges();
                    expect(document.activeElement).toEqual(combo.comboInput.nativeElement);

                    tick();
                    fixture.detectChanges();
                    expect(combo.collapsed).toBeTruthy();
                }));
            });
            describe('primitive data dropdown: ', () => {
                it('should properly navigate with HOME/END keys when no virtScroll is necessary', async () => {
                    fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
                    fixture.detectChanges();
                    combo = fixture.componentInstance.combo;
                    input = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
                    let firstVisibleItem: Element;
                    combo.toggle();
                    await wait();
                    fixture.detectChanges();
                    const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                    const scrollbar = fixture.debugElement.query(By.css(`.${CSS_CLASS_SCROLLBAR_VERTICAL}`))
                        .nativeElement as HTMLElement;
                    expect(scrollbar.scrollTop).toEqual(0);
                    // Scroll to bottom;
                    UIInteractions.triggerEventHandlerKeyDown('End', dropdownContent);
                    await combo.virtualScrollContainer.layoutComplete;
                    fixture.detectChanges();
                    // Content was scrolled to bottom
                    expect(scrollbar.scrollHeight - scrollbar.scrollTop - scrollbar.clientHeight).toBeLessThan(1);

                    // Scroll to top
                    UIInteractions.triggerEventHandlerKeyDown('Home', dropdownContent);
                    await combo.virtualScrollContainer.layoutComplete;
                    fixture.detectChanges();
                    const dropdownContainer: HTMLElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                    firstVisibleItem = dropdownContainer.querySelector(`.${CSS_CLASS_DROPDOWNLISTITEM}` + ':first-child');
                    // Container is scrolled to top
                    expect(scrollbar.scrollTop).toEqual(0);

                    // First item is focused
                    expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
                    UIInteractions.triggerEventHandlerKeyDown('ArrowDown', dropdownContent);
                    fixture.detectChanges();
                    firstVisibleItem = dropdownContainer.querySelector(`.${CSS_CLASS_DROPDOWNLISTITEM}` + ':first-child');

                    // Scroll has not change
                    expect(scrollbar.scrollTop).toEqual(0);
                    // First item is no longer focused
                    expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
                    UIInteractions.triggerEventHandlerKeyDown('Home', dropdownContent);
                    fixture.detectChanges();
                    expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
                });
            });
        });
        describe('Virtualization tests: ', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxComboSampleComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
            });
            it('should properly return a reference to the VirtScrollContainer', () => {
                expect(combo.dropdown.element).toBeDefined();
                const mockScroll = spyOnProperty<any>(combo.dropdown, 'scrollContainer', 'get').and.callThrough();
                const mockFunc = () => mockScroll();
                expect(mockFunc).toThrow();
                combo.toggle();
                fixture.detectChanges();
                expect(combo.dropdown.element).toBeDefined();
                expect(mockFunc).toBeDefined();
            });
            it('should restore position of dropdown scroll after opening', async () => {
                const scroller = () => fixture.debugElement.query(By.css('igx-virtual-scroll')).nativeElement;
                spyOn(combo.dropdown, 'onToggleOpening').and.callThrough();
                spyOn(combo.dropdown, 'onToggleOpened').and.callThrough();
                spyOn(combo.dropdown, 'onToggleClosing').and.callThrough();
                spyOn(combo.dropdown, 'onToggleClosed').and.callThrough();
                combo.toggle();
                await wait();
                fixture.detectChanges();
                expect(combo.collapsed).toEqual(false);
                expect(combo.dropdown.onToggleOpening).toHaveBeenCalledTimes(1);
                expect(combo.dropdown.onToggleOpened).toHaveBeenCalledTimes(1);
                let vContainerScrollHeight = scroller().scrollHeight;
                expect(scroller().scrollTop).toEqual(0);
                const itemHeight = parseFloat(combo.dropdown.children.first.element.nativeElement.getBoundingClientRect().height);
                expect(vContainerScrollHeight).toBeGreaterThan(itemHeight);
                scroller().scrollTop = Math.floor(vContainerScrollHeight / 2);
                await combo.virtualScrollContainer.layoutComplete;
                fixture.detectChanges();
                expect(scroller().scrollTop).toBeGreaterThan(0);
                UIInteractions.simulateClickEvent(document.documentElement);
                await wait();
                fixture.detectChanges();
                expect(combo.collapsed).toEqual(true);
                expect(combo.dropdown.onToggleClosing).toHaveBeenCalledTimes(1);
                expect(combo.dropdown.onToggleClosed).toHaveBeenCalledTimes(1);
                combo.toggle();
                await wait();
                fixture.detectChanges();
                expect(combo.collapsed).toEqual(false);
                expect(combo.dropdown.onToggleOpening).toHaveBeenCalledTimes(2);
                expect(combo.dropdown.onToggleOpened).toHaveBeenCalledTimes(2);
                vContainerScrollHeight = scroller().scrollHeight;
                expect(scroller().scrollTop).toEqual(vContainerScrollHeight / 2);
            });
            it('should display vertical scrollbar properly', async () => {
                combo.toggle();
                await wait();
                fixture.detectChanges();
                const scrollbarContainer = fixture.debugElement
                    .query(By.css(`.${CSS_CLASS_SCROLLBAR_VERTICAL}`))
                    .nativeElement as HTMLElement;
                let hasScrollbar = scrollbarContainer.scrollHeight > scrollbarContainer.clientHeight;
                expect(hasScrollbar).toBeTruthy();

                combo.data = [{ field: 'Mid-Atlantic', region: 'New Jersey' }, { field: 'Mid-Atlantic', region: 'New York' }];
                fixture.detectChanges();
                combo.toggle();
                await wait();
                fixture.detectChanges();
                hasScrollbar = scrollbarContainer.scrollHeight > scrollbarContainer.clientHeight;
                expect(hasScrollbar).toBeFalsy();
            });
            it('should preserve selection on scrolling', async () => {
                combo.toggle();
                await wait();
                fixture.detectChanges();
                const scrollbar = fixture.debugElement.query(By.css(`.${CSS_CLASS_SCROLLBAR_VERTICAL}`)).nativeElement as HTMLElement;
                expect(scrollbar.scrollTop).toEqual(0);

                await combo.virtualScrollContainer.scrollToIndex(12);
                fixture.detectChanges();
                let selectedItem = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[1];
                selectedItem.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(selectedItem.classes[CSS_CLASS_SELECTED]).toEqual(true);
                const selectedItemText = selectedItem.nativeElement.textContent;

                const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                UIInteractions.triggerEventHandlerKeyDown('End', dropdownContent);
                await combo.virtualScrollContainer.layoutComplete;
                fixture.detectChanges();
                // Content was scrolled to bottom
                expect(scrollbar.scrollHeight - scrollbar.scrollTop - scrollbar.clientHeight).toBeLessThan(1);

                await combo.virtualScrollContainer.scrollToIndex(4);
                fixture.detectChanges();
                selectedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_SELECTED}`));
                expect(selectedItem.nativeElement.textContent).toEqual(selectedItemText);

                combo.toggle();
                await wait(10);
                fixture.detectChanges();
                expect(combo.collapsed).toBeTruthy();
                combo.toggle();
                await wait(10);
                fixture.detectChanges();
                expect(combo.collapsed).toBeFalsy();
                selectedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_SELECTED}`));
                expect(selectedItem.nativeElement.textContent).toEqual(selectedItemText);
            });
        });
        describe('Selection tests: ', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxComboSampleComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
                input = fixture.debugElement.query(By.css(`.${CSS_CLASS_COMBO_INPUTGROUP}`));
            });
            const simulateComboItemClick = (itemIndex: number, isHeader = false) => {
                const itemClass = isHeader ? CSS_CLASS_HEADERITEM : CSS_CLASS_DROPDOWNLISTITEM;
                const dropdownItem = fixture.debugElement.queryAll(By.css('.' + itemClass))[itemIndex];
                dropdownItem.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
            };
            const simulateComboItemCheckboxClick = (itemIndex: number, isHeader = false) => {
                const itemClass = isHeader ? CSS_CLASS_HEADERITEM : CSS_CLASS_DROPDOWNLISTITEM;
                const dropdownItem = fixture.debugElement.queryAll(By.css('.' + itemClass))[itemIndex];
                const itemCheckbox = dropdownItem.query(By.css('.' + CSS_CLASS_ITEM_CHECKBOX));
                itemCheckbox.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
            };
            it('should append/remove selected items to the input in their selection order', () => {
                let expectedOutput = 'Illinois';
                combo.select(['Illinois']);
                fixture.detectChanges();
                expect(input.nativeElement.value).toEqual(expectedOutput);

                expectedOutput += ', Mississippi';
                combo.select(['Mississippi']);
                fixture.detectChanges();
                expect(input.nativeElement.value).toEqual(expectedOutput);

                expectedOutput += ', Ohio';
                combo.select(['Ohio']);
                fixture.detectChanges();
                expect(input.nativeElement.value).toEqual(expectedOutput);

                expectedOutput += ', Arkansas';
                combo.select(['Arkansas']);
                fixture.detectChanges();
                expect(input.nativeElement.value).toEqual(expectedOutput);

                expectedOutput = 'Illinois, Mississippi, Arkansas';
                combo.deselect(['Ohio']);
                fixture.detectChanges();
                expect(input.nativeElement.value).toEqual(expectedOutput);

                expectedOutput += ', Florida';
                combo.select(['Florida'], false);
                fixture.detectChanges();
                expect(input.nativeElement.value).toEqual(expectedOutput);

                expectedOutput = 'Mississippi, Arkansas, Florida';
                combo.deselect(['Illinois']);
                fixture.detectChanges();
                expect(input.nativeElement.value).toEqual(expectedOutput);
            });
            it('should dismiss all selected items by pressing clear button', () => {
                const expectedOutput = 'Ohio, Indiana';
                combo.select(['Ohio', 'Indiana']);
                fixture.detectChanges();
                expect(input.nativeElement.value).toEqual(expectedOutput);
                combo.toggle();
                fixture.detectChanges();
                expect(combo.dropdown.items[1].selected).toBeTruthy();
                expect(combo.dropdown.items[4].selected).toBeTruthy();

                const clearBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
                clearBtn.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();

                expect(input.nativeElement.value).toEqual('');
                expect(combo.selection.length).toEqual(0);
                expect(combo.value.length).toEqual(0);
                combo.toggle();
                fixture.detectChanges();
                expect(combo.dropdown.items[1].selected).toBeFalsy();
                expect(combo.dropdown.items[4].selected).toBeFalsy();
            });
            it('should show/hide clear button after selecting/deselecting items', () => {
                // This is a workaround for issue github.com/angular/angular/issues/14235
                // Expecting existing DebugElement toBeFalsy creates circular reference in Jasmine
                expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toBeFalsy();

                // Open dropdown and select an item
                combo.select(['Maryland']);
                fixture.detectChanges();
                expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toEqual(1);

                combo.deselect(['Maryland']);
                fixture.detectChanges();
                expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toEqual(0);

                combo.select(['Oklahome']);
                fixture.detectChanges();
                expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toEqual(1);

                combo.select(['Wisconsin']);
                fixture.detectChanges();
                expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toEqual(1);

                // Clear selected items
                const clearButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
                clearButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                fixture.detectChanges();
                expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toBeFalsy();
            });
            it('should default disableClear to false', () => {
                expect(combo.disableClear).toBe(false);
            });
            it('should hide the clear button when disableClear is true and items are selected', () => {
                combo.select(['Maryland']);
                fixture.detectChanges();
                // Verify the clear button is visible before setting disableClear
                expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toBe(1);

                combo.disableClear = true;
                fixture.detectChanges();
                expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toBe(0);
            });
            it('should show the clear button when disableClear is false (default) and items are selected', () => {
                combo.select(['Maryland']);
                fixture.detectChanges();
                expect(combo.disableClear).toBe(false);
                expect(fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_CLEARBUTTON}`)).length).toBe(1);
            });
            it('should select/deselect item on check/uncheck', () => {
                const dropdown = combo.dropdown;
                spyOn(combo.selectionChanging, 'emit').and.callThrough();
                combo.toggle();
                fixture.detectChanges();

                const selectedItem_1 = dropdown.items[1];
                simulateComboItemClick(1);
                expect(combo.selection[0]).toEqual(selectedItem_1.value);
                expect(combo.value[0]).toEqual(selectedItem_1.value[combo.valueKey]);
                expect(selectedItem_1.selected).toBeTruthy();
                expect(selectedItem_1.element.nativeElement.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
                expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(1);
                expect(combo.selectionChanging.emit).toHaveBeenCalledWith(
                    {
                        newValue: [selectedItem_1.value[combo.valueKey]],
                        oldValue: [],
                        newSelection: [selectedItem_1.value],
                        oldSelection: [],
                        added: [selectedItem_1.value],
                        removed: [],
                        event: UIInteractions.getMouseEvent('click'),
                        owner: combo,
                        displayText: selectedItem_1.value[combo.valueKey],
                        cancel: false
                    });

                const selectedItem_2 = dropdown.items[4];
                simulateComboItemClick(4);
                expect(combo.selection[1]).toEqual(selectedItem_2.value);
                expect(combo.value[1]).toEqual(selectedItem_2.value[combo.valueKey]);
                expect(selectedItem_2.selected).toBeTruthy();
                expect(selectedItem_2.element.nativeElement.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
                expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(2);
                expect(combo.selectionChanging.emit).toHaveBeenCalledWith(
                    {
                        newValue: [selectedItem_1.value[combo.valueKey], selectedItem_2.value[combo.valueKey]],
                        oldValue: [selectedItem_1.value[combo.valueKey]],
                        newSelection: [selectedItem_1.value, selectedItem_2.value],
                        oldSelection: [selectedItem_1.value],
                        added: [selectedItem_2.value],
                        removed: [],
                        event: UIInteractions.getMouseEvent('click'),
                        owner: combo,
                        displayText: selectedItem_1.value[combo.valueKey] + ', ' + selectedItem_2.value[combo.valueKey],
                        cancel: false
                    });

                // Unselecting an item
                const unselectedItem = dropdown.items[1];
                simulateComboItemClick(1);
                expect(combo.selection.length).toEqual(1);
                expect(unselectedItem.selected).toBeFalsy();
                expect(unselectedItem.element.nativeElement.classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
                expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(3);
                expect(combo.selectionChanging.emit).toHaveBeenCalledWith(
                    {
                        newValue: [selectedItem_2.value[combo.valueKey]],
                        oldValue: [selectedItem_1.value[combo.valueKey], selectedItem_2.value[combo.valueKey]],
                        newSelection: [selectedItem_2.value],
                        oldSelection: [selectedItem_1.value, selectedItem_2.value],
                        added: [],
                        removed: [unselectedItem.value],
                        event: UIInteractions.getMouseEvent('click'),
                        owner: combo,
                        displayText: selectedItem_2.value[combo.valueKey],
                        cancel: false
                    });
            });
            it('should not be able to select group header', () => {
                spyOn(combo.selectionChanging, 'emit').and.callThrough();
                combo.toggle();
                fixture.detectChanges();

                simulateComboItemClick(0, true);
                expect(combo.selection.length).toEqual(0);
                expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(0);
            });
            it('should select falsy values except "undefined"', () => {
                combo.valueKey = 'value';
                combo.displayKey = 'field';
                combo.data = [
                    { field: '0', value: 0 },
                    { field: 'false', value: false },
                    { field: '', value: '' },
                    { field: 'null', value: null },
                    { field: 'NaN', value: NaN },
                    { field: 'undefined', value: undefined },
                ];

                combo.open();
                fixture.detectChanges();
                const item1 = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`));
                expect(item1).toBeDefined();

                item1.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.displayValue).toEqual('0');
                expect(combo.value).toEqual([0]);
                expect(combo.selection).toEqual([{ field: '0', value: 0 }]);

                combo.open();
                fixture.detectChanges();
                const item2 = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[1];
                expect(item2).toBeDefined();

                item2.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.displayValue).toEqual('0, false');
                expect(combo.value).toEqual([0, false]);
                expect(combo.selection).toEqual([{ field: '0', value: 0 }, { field: 'false', value: false }]);

                combo.open();
                fixture.detectChanges();
                const item3 = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[2];
                expect(item3).toBeDefined();

                item3.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.displayValue).toEqual('0, false, ');
                expect(combo.value).toEqual([0, false, '']);
                expect(combo.selection).toEqual([{ field: '0', value: 0 }, { field: 'false', value: false }, { field: '', value: '' }]);

                combo.open();
                fixture.detectChanges();
                const item4 = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[3];
                expect(item4).toBeDefined();

                item4.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.displayValue).toEqual('0, false, , null');
                expect(combo.value).toEqual([0, false, '', null]);
                expect(combo.selection).toEqual([{ field: '0', value: 0 }, { field: 'false', value: false }, { field: '', value: '' }, { field: 'null', value: null }]);

                combo.open();
                fixture.detectChanges();
                const item5 = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[4];
                expect(item5).toBeDefined();

                item5.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.displayValue).toEqual('0, false, , null, NaN');
                expect(combo.value).toEqual([0, false, '', null, NaN]);
                expect(combo.selection).toEqual([{ field: '0', value: 0 }, { field: 'false', value: false },
                { field: '', value: '' }, { field: 'null', value: null }, { field: 'NaN', value: NaN }]);

                combo.open();
                fixture.detectChanges();
                const item6 = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[5];
                expect(item6).toBeDefined();

                item6.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.displayValue).toEqual('0, false, , null, NaN');
                expect(combo.value).toEqual([0, false, '', null, NaN]);
                expect(combo.selection).toEqual([{ field: '0', value: 0 }, { field: 'false', value: false },
                { field: '', value: '' }, { field: 'null', value: null }, { field: 'NaN', value: NaN }]);
            });
            it('should select falsy values except "undefined" with "writeValue" method', () => {
                combo.valueKey = 'value';
                combo.displayKey = 'field';
                combo.data = [
                    { field: '0', value: 0 },
                    { field: 'false', value: false },
                    { field: 'empty', value: '' },
                    { field: 'null', value: null },
                    { field: 'NaN', value: NaN },
                    { field: 'undefined', value: undefined },
                ];

                combo.writeValue([0]);
                expect(combo.selection).toEqual([{ field: '0', value: 0 }]);
                expect(combo.value).toEqual([0]);
                expect(combo.displayValue).toEqual('0');

                combo.writeValue([false]);
                expect(combo.selection).toEqual([{ field: 'false', value: false }]);
                expect(combo.value).toEqual([false]);
                expect(combo.displayValue).toEqual('false');

                combo.writeValue(['']);
                expect(combo.selection).toEqual([{ field: 'empty', value: '' }]);
                expect(combo.value).toEqual(['']);
                expect(combo.displayValue).toEqual('empty');

                combo.writeValue([null]);
                expect(combo.selection).toEqual([{ field: 'null', value: null }]);
                expect(combo.value).toEqual([null]);
                expect(combo.displayValue).toEqual('null');

                combo.writeValue([NaN]);
                expect(combo.selection).toEqual([{ field: 'NaN', value: NaN }]);
                expect(combo.value).toEqual([NaN]);
                expect(combo.displayValue).toEqual('NaN');

                // should not select undefined
                combo.writeValue([undefined]);
                expect(combo.selection).toEqual([]);
                expect(combo.value).toEqual([]);
                expect(combo.displayValue).toEqual('');
            });
            it('should select values that have spaces as prefixes/suffixes', fakeAsync(() => {
                combo.displayKey = combo.valueKey = 'value';
                combo.data = [
                    { value: "Mississippi " }
                ];
                const dropdown = combo.dropdown;

                dropdown.toggle();
                tick();
                fixture.detectChanges();
                const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));

                UIInteractions.simulateTyping('Mississippi ', input);
                // combo.searchValue = 'My New Custom Item';
                // combo.handleInputChange();
                fixture.detectChanges();

                combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'ArrowDown'));
                fixture.detectChanges();
                tick();
                fixture.detectChanges();
                UIInteractions.triggerEventHandlerKeyDown('Space', dropdownContent);
                tick();
                fixture.detectChanges();
                combo.toggle();
                tick();
                fixture.detectChanges();
                combo.onBlur();
                tick();
                fixture.detectChanges();
                expect(combo.displayValue).toEqual('Mississippi ');
            }));
            it('should prevent selection when selectionChanging is cancelled', () => {
                spyOn(combo.selectionChanging, 'emit').and.callFake((event: IComboSelectionChangingEventArgs) => event.cancel = true);
                combo.toggle();
                fixture.detectChanges();

                const dropdownFirstItem = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[0].nativeElement;
                const itemCheckbox = dropdownFirstItem.querySelectorAll(`.${CSS_CLASS_ITEM_CHECKBOX}`);

                simulateComboItemCheckboxClick(0);
                expect(combo.selection.length).toEqual(0);
                expect(itemCheckbox[0].classList.contains(CSS_CLASS_ITME_CHECKBOX_CHECKED)).toBeFalsy();

                simulateComboItemClick(0);
                expect(combo.selection.length).toEqual(0);
                expect(itemCheckbox[0].classList.contains(CSS_CLASS_ITME_CHECKBOX_CHECKED)).toBeFalsy();
            });
            it('should prevent registration of remote entries when selectionChanging is cancelled', () => {
                fixture = TestBed.createComponent(IgxComboRemoteDataComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.instance;

                spyOn(combo.selectionChanging, 'emit').and.callFake((event: IComboSelectionChangingEventArgs) => event.cancel = true);
                combo.toggle();
                fixture.detectChanges();

                simulateComboItemClick(0);
                expect(combo.selection.length).toEqual(0);
                expect((combo as any)._remoteSelection[0]).toBeUndefined();
            });
            it('should add predefined selection to the input when data is bound after initialization', fakeAsync(() => {
                fixture = TestBed.createComponent(IgxComboBindingDataAfterInitComponent);
                fixture.detectChanges();
                input = fixture.debugElement.query(By.css(`.${CSS_CLASS_COMBO_INPUTGROUP}`));
                let expectedOutput = '';
                expect(input.nativeElement.value).toEqual(expectedOutput);
                tick(1000);
                fixture.detectChanges();

                expectedOutput = 'One';
                expect(input.nativeElement.value).toEqual(expectedOutput);
            }));
            it('should display custom displayText on selection/deselection', () => {
                combo.valueKey = 'key';
                combo.displayKey = 'value';
                combo.data = [
                    { key: 1, value: 'One' },
                    { key: 2, value: 'Two' },
                    { key: 3, value: 'Three' },
                ];

                spyOn(combo.selectionChanging, 'emit').and.callFake(
                    (event: IComboSelectionChangingEventArgs) => event.displayText = `Selected Count: ${event.newSelection.length}`);

                combo.select([1]);
                fixture.detectChanges();

                expect(combo.selection).toEqual([{ key: 1, value: 'One' }]);
                expect(combo.value).toEqual([1]);
                expect(combo.displayValue).toEqual('Selected Count: 1');

                combo.deselect([1]);

                expect(combo.selection).toEqual([]);
                expect(combo.value).toEqual([]);
                expect(combo.displayValue).toEqual('Selected Count: 0');
            });
            it('should handle selection for combo with array type value key correctly - issue #14103', () => {
                fixture = TestBed.createComponent(ComboArrayTypeValueKeyComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
                input = fixture.debugElement.query(By.css(`.${CSS_CLASS_COMBO_INPUTGROUP}`));
                const items = fixture.componentInstance.items;
                expect(combo).toBeDefined();

                const selectionSpy = spyOn(combo.selectionChanging, 'emit');
                let expectedResults: IComboSelectionChangingEventArgs = {
                    newValue: [combo.data[1][combo.valueKey]],
                    oldValue: [],
                    newSelection: [combo.data[1]],
                    oldSelection: [],
                    added: [combo.data[1]],
                    removed: [],
                    event: undefined,
                    owner: combo,
                    displayText: `${combo.data[1][combo.displayKey]}`,
                    cancel: false
                };

                let expectedDisplayText = items[1][combo.displayKey];
                combo.select([fixture.componentInstance.items[1].value]);
                fixture.detectChanges();

                expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
                expect(input.nativeElement.value).toEqual(expectedDisplayText);

                expectedDisplayText = `${items[1][combo.displayKey]}, ${items[2][combo.displayKey]}`;
                expectedResults = {
                    newValue: [combo.data[1][combo.valueKey], combo.data[2][combo.valueKey]],
                    oldValue: [combo.data[1][combo.valueKey]],
                    newSelection: [combo.data[1], combo.data[2]],
                    oldSelection: [combo.data[1]],
                    added: [combo.data[2]],
                    removed: [],
                    event: undefined,
                    owner: combo,
                    displayText: expectedDisplayText,
                    cancel: false
                };

                combo.select([items[2].value]);
                fixture.detectChanges();

                expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
                expect(input.nativeElement.value).toEqual(expectedDisplayText);
            });
        });
        describe('Grouping tests: ', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxComboSampleComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
                input = fixture.debugElement.query(By.css(`.${CSS_CLASS_COMBO_INPUTGROUP}`));
            });
            it('should group items correctly', fakeAsync(() => {
                combo.toggle();
                tick();
                fixture.detectChanges();
                expect(combo.groupKey).toEqual('region');
                expect(combo.dropdown.items[0].value.field === combo.data[0].field).toBeFalsy();
                const listItems = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`));
                const listHeaders = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_HEADERITEM}`));
                expect(listItems.length).toBeGreaterThan(0);
                expect(listHeaders.length).toBeGreaterThan(0);
                expect(listHeaders[0].nativeElement.innerHTML).toContain('East North Central');

                combo.groupKey = '';
                fixture.detectChanges();
                // First item is regular item
                expect(combo.dropdown.items[0].value).toEqual(combo.data[0]);
            }));
            it('should properly handle click events on disabled/header items', fakeAsync(() => {
                spyOn(combo.dropdown, 'selectItem').and.callThrough();
                combo.toggle();
                tick();
                fixture.detectChanges();
                expect(combo.collapsed).toBeFalsy();
                expect(combo.dropdown.headers).toBeDefined();
                expect(combo.dropdown.headers.length).toEqual(2);
                (combo.dropdown.headers[0] as IgxComboItemComponent).clicked(null);
                fixture.detectChanges();

                const mockObj = jasmine.createSpyObj('nativeElement', ['focus']);
                spyOnProperty(combo.dropdown, 'focusedItem', 'get').and.returnValue({ element: { nativeElement: mockObj } } as IgxDropDownItemBaseDirective);
                (combo.dropdown.headers[0] as IgxComboItemComponent).clicked(null);
                fixture.detectChanges();
                expect(mockObj.focus).not.toHaveBeenCalled(); // Focus only if `allowItemFocus === true`

                combo.dropdown.items[0].clicked(null);
                fixture.detectChanges();
                expect(document.activeElement).toEqual(combo.searchInput.nativeElement);
            }));
            it('should properly add items to the defaultFallbackGroup', () => {
                combo.allowCustomValues = true;
                combo.toggle();
                fixture.detectChanges();
                const fallBackGroup = combo.defaultFallbackGroup;
                const initialDataLength = combo.data.length + 0;
                expect(combo.filteredData.filter((e) => e[combo.groupKey] === undefined)).toEqual([]);
                combo.searchValue = 'My Custom Item 1';
                combo.addItemToCollection();
                combo.searchValue = 'My Custom Item 2';
                combo.addItemToCollection();
                combo.searchValue = 'My Custom Item 3';
                combo.addItemToCollection();
                const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
                UIInteractions.triggerInputEvent(searchInput, 'My Custom Item');
                fixture.detectChanges();
                expect(combo.data.length).toEqual(initialDataLength + 3);
                expect(combo.dropdown.items.length).toEqual(4); // Add Item button is included
                expect(combo.dropdown.headers.length).toEqual(1);
                expect(combo.dropdown.headers[0].element.nativeElement.textContent?.trim()).toEqual(fallBackGroup);
            });
            it('should sort groups correctly', () => {
                combo.groupSortingDirection = SortingDirection.Asc;
                combo.toggle();
                fixture.detectChanges();
                expect(combo.dropdown.headers[0].element.nativeElement.textContent?.trim()).toEqual('East North Central');

                combo.groupSortingDirection = SortingDirection.Desc;
                combo.toggle();
                fixture.detectChanges();
                expect(combo.dropdown.headers[0].element.nativeElement.textContent?.trim()).toEqual('West South Cent');

                combo.groupSortingDirection = SortingDirection.None;
                combo.toggle();
                fixture.detectChanges();
                expect(combo.dropdown.headers[0].element.nativeElement.textContent?.trim()).toEqual('New England')
            });
            it('should sort groups with diacritics correctly', async () => {
                combo.data = [
                    { field: "Alaska", region: "Méxícó" },
                    { field: "California", region: "Méxícó" },
                    { field: "Michigan", region: "Ángel" },
                    { field: "Ohio", region: "Ángel" },
                    { field: "Iowa", region: "México" },
                    { field: "Kansas", region: "México" },
                    { field: "Wisconsin", region: "Boris" },
                ];
                combo.groupSortingDirection = SortingDirection.Asc;
                combo.toggle();
                await wait();
                fixture.detectChanges();

                const groupOrder = () => combo.virtualScrollContainer.dataWindow()!.items
                    .filter((item: any) => item?.isHeader)
                    .map((item: any) => item[combo.groupKey]);

                // All four groups, not the three the viewport used to happen to show.
                expect(groupOrder()).toEqual(['Ángel', 'Boris', 'México', 'Méxícó']);

                combo.groupSortingDirection = SortingDirection.Desc;
                fixture.detectChanges();
                expect(groupOrder()).toEqual(['Méxícó', 'México', 'Boris', 'Ángel']);

                combo.groupSortingDirection = SortingDirection.None;
                fixture.detectChanges();
                expect(groupOrder()).toEqual(['Méxícó', 'Ángel', 'México', 'Boris']);
            });
        });
        describe('Filtering tests: ', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(IgxComboSampleComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
                input = fixture.debugElement.query(By.css(`.${CSS_CLASS_COMBO_INPUTGROUP}`));
            });
            it('should properly get/set filteredData', () => {
                combo.toggle();
                fixture.detectChanges();
                const initialData = [...combo.filteredData];
                expect(combo.searchValue).toEqual('');

                const filterSpy = spyOn(IgxComboFilteringPipe.prototype, 'transform').and.callThrough();
                combo.searchValue = 'New ';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(filterSpy).toHaveBeenCalledTimes(1);
                expect(combo.filteredData.length).toBeLessThan(initialData.length);

                const firstFilter = [...combo.filteredData];
                combo.searchValue += '  ';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(combo.filteredData.length).toBeLessThan(initialData.length);
                expect(filterSpy).toHaveBeenCalledTimes(2);

                combo.searchValue = '';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(combo.filteredData.length).toEqual(initialData.length);
                expect(combo.filteredData.length).toBeGreaterThan(firstFilter.length);
                expect(filterSpy).toHaveBeenCalledTimes(3);
                expect(combo.filteredData.length).toEqual(initialData.length);
            });
            it('should properly select/deselect filteredData', () => {
                combo.toggle();
                fixture.detectChanges();
                const initialData = [...combo.filteredData];
                expect(combo.searchValue).toEqual('');

                const filterSpy = spyOn(IgxComboFilteringPipe.prototype, 'transform').and.callThrough();
                combo.searchValue = 'New ';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(filterSpy).toHaveBeenCalledTimes(1);
                expect(combo.filteredData.length).toBeLessThan(initialData.length);
                expect(combo.filteredData.length).toEqual(4);

                combo.selectAllItems();
                fixture.detectChanges();
                expect(combo.selection.length).toEqual(4);

                combo.selectAllItems(true);
                fixture.detectChanges();
                expect(combo.selection.length).toEqual(51);

                combo.deselectAllItems();
                fixture.detectChanges();
                expect(combo.selection.length).toEqual(47);

                combo.deselectAllItems(true);
                fixture.detectChanges();
                expect(combo.selection.length).toEqual(0);
            });
            it('should properly handle addItemToCollection calls (Complex data)', () => {
                const initialData = [...combo.data];
                expect(combo.searchValue).toEqual('');
                combo.addItemToCollection();
                fixture.detectChanges();
                expect(initialData).toEqual(combo.data);
                expect(combo.data.length).toEqual(initialData.length);
                combo.searchValue = 'myItem';
                fixture.detectChanges();
                spyOn(combo.addition, 'emit').and.callThrough();
                combo.addItemToCollection();
                fixture.detectChanges();
                expect(initialData.length).toBeLessThan(combo.data.length);
                expect(combo.data.length).toEqual(initialData.length + 1);
                expect(combo.addition.emit).toHaveBeenCalledTimes(1);
                expect(combo.data[combo.data.length - 1]).toEqual({
                    field: 'myItem',
                    region: 'Other'
                });
                combo.addition.subscribe((e) => {
                    e.addedItem.region = 'exampleRegion';
                });
                combo.searchValue = 'myItem2';
                fixture.detectChanges();
                combo.addItemToCollection();
                fixture.detectChanges();
                expect(initialData.length).toBeLessThan(combo.data.length);
                expect(combo.data.length).toEqual(initialData.length + 2);
                expect(combo.addition.emit).toHaveBeenCalledTimes(2);
                expect(combo.data[combo.data.length - 1]).toEqual({
                    field: 'myItem2',
                    region: 'exampleRegion'
                });
                combo.toggle();
                fixture.detectChanges();
                expect(combo.collapsed).toEqual(false);
                expect(combo.searchInput).toBeDefined();
                combo.searchValue = 'myItem3';
                combo.addItemToCollection();
                fixture.detectChanges();
                expect(initialData.length).toBeLessThan(combo.data.length);
                expect(combo.data.length).toEqual(initialData.length + 3);
                expect(combo.addition.emit).toHaveBeenCalledTimes(3);
                expect(combo.data[combo.data.length - 1]).toEqual({
                    field: 'myItem3',
                    region: 'exampleRegion'
                });
            });
            it('should properly handle addItemToCollection calls (Primitive data)', () => {
                combo.data = ['Item1', 'Item2', 'Item3'];
                combo.groupKey = null;
                combo.valueKey = null;
                fixture.detectChanges();
                const initialData = [...combo.data];
                expect(combo.searchValue).toEqual('');
                combo.addItemToCollection();
                fixture.detectChanges();
                expect(initialData).toEqual(combo.data);
                expect(combo.data.length).toEqual(initialData.length);
                combo.searchValue = 'myItem';
                fixture.detectChanges();
                spyOn(combo.addition, 'emit').and.callThrough();
                combo.addItemToCollection();
                fixture.detectChanges();
                expect(initialData.length).toBeLessThan(combo.data.length);
                expect(combo.data.length).toEqual(initialData.length + 1);
                expect(combo.addition.emit).toHaveBeenCalledTimes(1);
                expect(combo.data[combo.data.length - 1]).toEqual('myItem');
            });

            it('should support filtering strings containing diacritic characters', fakeAsync(() => {
                combo.filterFunction = comboIgnoreDiacriticsFilter;
                combo.displayKey = null;
                combo.valueKey = null;
                combo.groupKey = null;
                combo.filteringOptions = { caseSensitive: false, filteringKey: undefined };
                combo.data = ['José', 'Óscar', 'Ángel', 'Germán', 'Niño', 'México', 'Méxícó', 'Mexico', 'Köln', 'München'];
                combo.toggle();
                tick();
                fixture.detectChanges();

                const searchInput = fixture.debugElement.query(By.css(`input[name="searchInput"]`));

                const verifyFilteredItems = (term: string, expected: number) => {
                    UIInteractions.triggerInputEvent(searchInput, term);
                    fixture.detectChanges();
                    const list = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                    const items = list.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
                    expect(items.length).toEqual(expected);
                };

                verifyFilteredItems('jose', 1);
                verifyFilteredItems('mexico', 3);
                verifyFilteredItems('o', 7);
                verifyFilteredItems('é', 7);
            }));

            it('should filter the dropdown items when typing in the search input', fakeAsync(() => {
                let dropdownList;
                let dropdownItems;
                let expectedValues = combo.data.filter(data => data.field.toLowerCase().includes('m'));

                const checkFilteredItems = (listItems: HTMLElement[]) => {
                    listItems.forEach((el) => {
                        const itemText: string = el.textContent.trim();
                        expect(expectedValues.find(item => 'State: ' + item.field + 'Region: ' + item.region === itemText)).toBeDefined();
                    });
                };

                combo.toggle();
                tick();
                fixture.detectChanges();
                const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
                const verifyFilteredItems = (inputValue: string) => {
                    UIInteractions.triggerInputEvent(searchInput, inputValue);
                    fixture.detectChanges();

                    const matches = combo.data.filter(item =>
                        item.field.toLowerCase().includes(inputValue.toLowerCase()));
                    expect(combo.filteredData).toEqual(matches);

                    dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                    dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);

                    // Every rendered row is one of the matches; how many fit is the viewport's business.
                    if (matches.length === 0) {
                        expect(dropdownItems.length).toEqual(0);
                    } else {
                        expect(dropdownItems.length).toBeGreaterThan(0);
                        Array.from(dropdownItems).forEach((row: HTMLElement) => {
                            const text = row.textContent.trim();
                            expect(matches.some(m => text.includes(m.field))).toBeTrue();
                        });
                    }
                };
                verifyFilteredItems('M');

                verifyFilteredItems('Mi');
                expectedValues = expectedValues.filter(data => data.field.toLowerCase().includes('mi'));
                checkFilteredItems(dropdownItems);

                verifyFilteredItems('Mis');
                expectedValues = expectedValues.filter(data => data.field.toLowerCase().includes('mis'));
                checkFilteredItems(dropdownItems);

                verifyFilteredItems('Mist');
            }));
            it('should display empty list when the search query does not match any item', () => {
                let dropDownContainer: HTMLElement;
                let listItems;
                combo.toggle();
                fixture.detectChanges();

                const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
                UIInteractions.triggerInputEvent(searchInput, 'P');
                fixture.detectChanges();
                dropDownContainer = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                listItems = dropDownContainer.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
                expect(listItems.length).toEqual(3);
                let emptyTemplate = fixture.debugElement.query(By.css('.' + CSS_CLASS_EMPTY));
                expect(emptyTemplate).toBeNull();

                UIInteractions.triggerInputEvent(searchInput, 'Pat');
                fixture.detectChanges();
                dropDownContainer = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                listItems = dropDownContainer.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
                expect(listItems.length).toEqual(0);
                emptyTemplate = fixture.debugElement.query(By.css('.' + CSS_CLASS_EMPTY));
                expect(emptyTemplate).not.toBeNull();
            });
            it('should fire searchInputUpdate event when typing in the search box ', () => {
                let timesFired = 0;
                spyOn(combo.searchInputUpdate, 'emit').and.callThrough();
                combo.toggle();
                fixture.detectChanges();
                const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));

                const verifyOnSearchInputEventIsFired = (inputValue: string) => {
                    UIInteractions.triggerInputEvent(searchInput, inputValue);
                    fixture.detectChanges();
                    timesFired++;
                    expect(combo.searchInputUpdate.emit).toHaveBeenCalledTimes(timesFired);
                };

                verifyOnSearchInputEventIsFired('M');
                verifyOnSearchInputEventIsFired('Mi');
                verifyOnSearchInputEventIsFired('Miss');
                verifyOnSearchInputEventIsFired('Misso');
            });
            it('should restore the initial combo dropdown list after clearing the search input', fakeAsync(() => {
                let dropdownList;
                let dropdownItems;
                combo.toggle();
                tick();
                fixture.detectChanges();
                const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));

                const verifyFilteredItems = (inputValue: string, expectedFilteredItemsNumber: number) => {
                    UIInteractions.triggerInputEvent(searchInput, inputValue);
                    fixture.detectChanges();
                    dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                    dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);

                    expect(combo.filteredData.length).toEqual(expectedFilteredItemsNumber);
                    // A window over the collection, so it renders some of it, not all of it.
                    expect(dropdownItems.length).toBeGreaterThan(0);
                    expect(dropdownItems.length).toBeLessThanOrEqual(expectedFilteredItemsNumber);
                };

                verifyFilteredItems('M', 15);
                verifyFilteredItems('Mi', 5);
                verifyFilteredItems('M', 15);
                combo.filteredData.forEach((item) => expect(combo.data).toContain(item));
            }));
            it('should clear the search input and close the dropdown list on pressing ESC key', fakeAsync(() => {
                combo.toggle();
                fixture.detectChanges();

                const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
                UIInteractions.triggerInputEvent(searchInput, 'P');
                fixture.detectChanges();
                const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                const dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
                expect(dropdownItems.length).toEqual(3);

                UIInteractions.triggerEventHandlerKeyUp('Escape', searchInput);
                tick();
                fixture.detectChanges();
                expect(combo.collapsed).toBeTruthy();
                expect(searchInput.nativeElement.textContent).toEqual('');
            }));
            it('should not display group headers when no results are filtered for a group', () => {
                const filteredItems: { [index: string]: any } = combo.data.reduce((filteredArray, item) => {
                    if (item.field.toLowerCase().trim().includes('mi')) {
                        (filteredArray[item['region']] = filteredArray[item['region']] || []).push(item);
                    }
                    return filteredArray;
                }, {});
                combo.toggle();
                fixture.detectChanges();
                const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
                UIInteractions.triggerInputEvent(searchInput, 'Mi');
                fixture.detectChanges();
                const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                const listHeaders: NodeListOf<HTMLElement> = dropdownList.querySelectorAll(`.${CSS_CLASS_HEADERITEM}`);
                expect(listHeaders.length).toEqual(Object.keys(filteredItems).length);
                const headers = Array.prototype.map.call(listHeaders, (item) => item.textContent.trim());
                Object.keys(filteredItems).forEach(key => expect(headers).toContain(key));
            });
            it('should dismiss the input text when clear button is being pressed and custom values are enabled', () => {
                combo.allowCustomValues = true;
                fixture.detectChanges();
                combo.toggle();
                fixture.detectChanges();
                expect(combo.selection).toEqual([]);
                expect(combo.displayValue).toEqual('');
                expect(combo.value).toEqual([]);
                expect(combo.comboInput.nativeElement.value).toEqual('');

                combo.searchValue = 'New ';
                fixture.detectChanges();
                expect(combo.isAddButtonVisible()).toEqual(true);
                const addItemButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_ADDBUTTON}`));
                expect(addItemButton.nativeElement).toBeDefined();

                addItemButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.selection).toEqual([{ field: 'New ', region: 'Other' }]);
                expect(combo.value).toEqual(['New ']);
                expect(combo.comboInput.nativeElement.value).toEqual('New ');

                const clearButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
                clearButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.selection).toEqual([]);
                expect(combo.value).toEqual([]);
                expect(combo.comboInput.nativeElement.value).toEqual('');
            });
            it('should remove ADD button when search value matches an already selected item and custom values are enabled ', () => {
                combo.allowCustomValues = true;
                fixture.detectChanges();
                combo.toggle();
                fixture.detectChanges();

                let addItemButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_ADDBUTTON}`));
                expect(addItemButton).toEqual(null);
                const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
                UIInteractions.triggerInputEvent(searchInput, 'New');
                fixture.detectChanges();
                expect(combo.searchValue).toEqual('New');
                addItemButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_ADDBUTTON}`));
                expect(addItemButton === null).toBeFalsy();

                UIInteractions.triggerInputEvent(searchInput, 'New York');
                fixture.detectChanges();
                expect(combo.searchValue).toEqual('New York');
                addItemButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_ADDBUTTON}`));
                expect(addItemButton).toEqual(null);
            });
            it(`should handle enter keydown on "Add Item" properly`, () => {
                combo.allowCustomValues = true;
                fixture.detectChanges();
                combo.toggle();
                fixture.detectChanges();

                combo.searchValue = 'My New Custom Item';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(combo.collapsed).toBeFalsy();
                expect(combo.displayValue).toEqual('');
                expect(combo.isAddButtonVisible()).toBeTruthy();

                combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'ArrowDown'));
                fixture.detectChanges();
                const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                UIInteractions.triggerEventHandlerKeyDown('Space', dropdownContent);
                fixture.detectChanges();
                expect(combo.collapsed).toBeFalsy();
                expect(combo.displayValue).toEqual('');
                expect(combo.isAddButtonVisible()).toBeTruthy();

                UIInteractions.triggerEventHandlerKeyDown('Enter', dropdownContent);
                fixture.detectChanges();
                expect(combo.collapsed).toBeFalsy();
                expect(combo.displayValue).toEqual('My New Custom Item');
            });
            it(`should handle click on "Add Item" properly`, () => {
                combo.allowCustomValues = true;
                fixture.detectChanges();
                combo.toggle();
                fixture.detectChanges();
                combo.searchValue = 'My New Custom Item';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(combo.collapsed).toBeFalsy();
                expect(combo.displayValue).toEqual('');
                expect(combo.isAddButtonVisible()).toBeTruthy();

                combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'ArrowDown'));
                fixture.detectChanges();
                const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                UIInteractions.triggerEventHandlerKeyDown('Space', dropdownContent);
                fixture.detectChanges();
                // SPACE does not add item to collection
                expect(combo.collapsed).toBeFalsy();
                expect(combo.displayValue).toEqual('');

                const focusedItem = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOCUSED}`));
                focusedItem.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.collapsed).toBeFalsy();
                expect(combo.displayValue).toEqual('My New Custom Item');
            });
            it('should enable/disable filtering at runtime', fakeAsync(() => {
                combo.open(); // Open combo - all data items are in filteredData
                tick();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0);

                const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
                searchInput.nativeElement.value = 'Not-available item';
                searchInput.triggerEventHandler('input', { target: searchInput.nativeElement });
                tick();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toEqual(0); // No items are available because of filtering

                combo.close(); // Filter is cleared on close
                tick();
                fixture.detectChanges();
                combo.disableFiltering = true; // Filtering is disabled
                fixture.detectChanges();
                combo.open(); // All items are visible since filtering is disabled
                tick();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0); // All items are visible since filtering is disabled

                combo.searchValue = 'Not-available item';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0); // All items are visible since filtering is disabled

                combo.close(); // Filter is cleared on close
                tick();
                fixture.detectChanges();
                combo.disableFiltering = false; // Filtering is re-enabled
                fixture.detectChanges();
                combo.open(); // Filter is cleared on open
                tick();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0);
            }));
            it(`should properly display "Add Item" button when filtering is off`, () => {
                combo.allowCustomValues = true;
                combo.disableFiltering = true;
                fixture.detectChanges();
                expect(combo.isAddButtonVisible()).toEqual(false);

                combo.toggle();
                fixture.detectChanges();
                expect(combo.collapsed).toEqual(false);
                expect(combo.searchInput.nativeElement.placeholder).toEqual('Add Item');
                const searchInput = fixture.debugElement.query(By.css(CSS_CLASS_SEARCHINPUT));
                UIInteractions.triggerInputEvent(searchInput, combo.data[2].field);
                fixture.detectChanges();
                expect(combo.isAddButtonVisible()).toEqual(false);

                UIInteractions.triggerInputEvent(searchInput, combo.searchValue.substring(0, 2));
                fixture.detectChanges();
                expect(combo.isAddButtonVisible()).toEqual(true);
            });
            it('should be able to toggle search case sensitivity', () => {
                combo.showSearchCaseIcon = true;
                fixture.detectChanges();
                combo.toggle();
                fixture.detectChanges();

                const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
                UIInteractions.triggerInputEvent(searchInput, 'M');
                fixture.detectChanges();
                expect([...combo.filteredData]).toEqual(combo.data.filter(e => e['field'].toLowerCase().includes('m')));

                combo.toggleCaseSensitive();
                fixture.detectChanges();
                expect([...combo.filteredData]).toEqual(combo.data.filter(e => e['field'].includes('M')));
            });
            it('Should NOT filter the data when searchInputUpdate is canceled', () => {
                const cancelSub = combo.searchInputUpdate.subscribe((event: IComboSearchInputEventArgs) => event.cancel = true);
                combo.toggle();
                fixture.detectChanges();
                const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
                UIInteractions.triggerInputEvent(searchInput, 'Test');
                fixture.detectChanges();
                expect(combo.filteredData.length).toEqual(combo.data.length);
                expect(combo.searchValue).toEqual('Test');
                cancelSub.unsubscribe();
            });
            it('Should filter the data when custom filterFunction is provided', fakeAsync(() => {
                combo.open();
                tick();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0);

                combo.searchValue = 'new england';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toEqual(0);

                combo.close();
                tick();
                fixture.detectChanges();
                combo.filteringOptions = { caseSensitive: false, filteringKey: combo.groupKey };
                combo.filterFunction = (collection: any[], searchValue: any, filteringOptions: IComboFilteringOptions): any[] => {
                    if (!collection) return [];
                    if (!searchValue) return collection;
                    const searchTerm = filteringOptions.caseSensitive ? searchValue.trim() : searchValue.toLowerCase().trim();
                    return collection.filter(i => filteringOptions.caseSensitive ?
                        i[filteringOptions.filteringKey]?.includes(searchTerm) :
                        i[filteringOptions.filteringKey]?.toString().toLowerCase().includes(searchTerm))
                }
                combo.open();
                tick();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0);

                combo.searchValue = 'new england';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0);

                combo.filterFunction = undefined;
                combo.filteringOptions = undefined;
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toEqual(0);
            }));
            it('Should update filtering when custom filterFunction is provided and filteringOptions.caseSensitive is changed', fakeAsync(() => {
                combo.open();
                tick();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0);

                combo.searchValue = 'new england';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toEqual(0);

                combo.close();
                tick();
                fixture.detectChanges();
                combo.filteringOptions = { caseSensitive: false, filteringKey: combo.groupKey };
                combo.filterFunction = (collection: any[], searchValue: any, filteringOptions: IComboFilteringOptions): any[] => {
                    if (!collection) return [];
                    if (!searchValue) return collection;
                    const searchTerm = filteringOptions.caseSensitive ? searchValue.trim() : searchValue.toLowerCase().trim();
                    return collection.filter(i => filteringOptions.caseSensitive ?
                        i[filteringOptions.filteringKey]?.includes(searchTerm) :
                        i[filteringOptions.filteringKey]?.toString().toLowerCase().includes(searchTerm))
                }
                combo.open();
                tick();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0);

                combo.searchValue = 'new england';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0);

                combo.filteringOptions = Object.assign({}, combo.filteringOptions, { caseSensitive: true });
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toEqual(0);
            }));
            it('Should update filtering when custom filteringOptions are provided', fakeAsync(() => {
                combo.open();
                tick();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0);

                combo.searchValue = 'new england';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toEqual(0);

                combo.close();
                tick();
                fixture.detectChanges();
                combo.filteringOptions = { caseSensitive: false, filteringKey: combo.groupKey };
                combo.open();
                tick();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0);

                combo.searchValue = 'new england';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0);

                combo.searchValue = 'value not in the list';
                combo.handleInputChange();
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toEqual(0);

                combo.disableFiltering = true;
                fixture.detectChanges();
                expect(combo.dropdown.items.length).toBeGreaterThan(0);
            }));
        });
        describe('Form control tests: ', () => {
            describe('Reactive form tests: ', () => {
                beforeEach(() => {
                    fixture = TestBed.createComponent(IgxComboFormComponent);
                    fixture.detectChanges();
                    combo = fixture.componentInstance.combo;
                    input = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
                });

                it('should properly initialize when used as a form control', () => {
                    expect(combo).toBeDefined();
                    const comboFormReference = fixture.componentInstance.reactiveForm.controls.townCombo;
                    expect(comboFormReference).toBeDefined();
                    expect(combo.selection).toEqual(comboFormReference.value);
                    expect(combo.value).toEqual(comboFormReference.value);
                    expect(combo.selection.length).toEqual(1);
                    expect(combo.selection[0].field).toEqual('Connecticut');
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                    const clearButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
                    clearButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                    fixture.detectChanges();
                    expect(combo.valid).toEqual(IgxInputState.INVALID);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

                    combo.onBlur();
                    fixture.detectChanges();
                    expect(combo.valid).toEqual(IgxInputState.INVALID);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

                    combo.select([combo.dropdown.items[0], combo.dropdown.items[1]]);
                    expect(combo.valid).toEqual(IgxInputState.VALID);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.VALID);

                    combo.onBlur();
                    fixture.detectChanges();
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                });

                it('should properly initialize when used as a form control - without validators', () => {
                    const form: UntypedFormGroup = fixture.componentInstance.reactiveForm;
                    form.controls.townCombo.validator = null;
                    expect(combo).toBeDefined();
                    const comboFormReference = fixture.componentInstance.reactiveForm.controls.townCombo;
                    expect(comboFormReference).toBeDefined();
                    expect(combo.selection).toEqual(comboFormReference.value);
                    expect(combo.value).toEqual(comboFormReference.value);
                    expect(combo.selection.length).toEqual(1);
                    expect(combo.selection[0].field).toEqual('Connecticut');
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                    const clearButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
                    clearButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                    fixture.detectChanges();
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);

                    combo.onBlur();
                    fixture.detectChanges();
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);

                    combo.select([combo.dropdown.items[0], combo.dropdown.items[1]]);
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);

                    combo.onBlur();
                    fixture.detectChanges();
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                });

                it('should be possible to be enabled/disabled when used as a form control', () => {
                    const form = fixture.componentInstance.reactiveForm;
                    const comboFormReference = form.controls.townCombo;
                    expect(comboFormReference).toBeDefined();
                    expect(combo.disabled).toBeFalsy();
                    expect(comboFormReference.disabled).toBeFalsy();
                    spyOn(combo, 'onClick');
                    spyOn(combo, 'setDisabledState').and.callThrough();
                    combo.comboInput.nativeElement.click();
                    fixture.detectChanges();
                    expect(combo.onClick).toHaveBeenCalledTimes(1);
                    combo.comboInput.nativeElement.blur();

                    // Disabling the form disables all of the controls in it
                    form.disable();
                    fixture.detectChanges();
                    expect(comboFormReference.disabled).toBeTruthy();
                    expect(combo.disabled).toBeTruthy();
                    expect(combo.setDisabledState).toHaveBeenCalledTimes(1);

                    // Disabled form controls don't handle click events
                    combo.comboInput.nativeElement.click();
                    fixture.detectChanges();
                    expect(combo.onClick).toHaveBeenCalledTimes(1);
                    combo.comboInput.nativeElement.blur();

                    // Can enabling the form re-enables all of the controls in it
                    form.enable();
                    fixture.detectChanges();
                    expect(comboFormReference.disabled).toBeFalsy();
                    expect(combo.disabled).toBeFalsy();
                });

                it('should render as INITIAL after control.disable() and touched/dirty', () => {
                    const form = fixture.componentInstance.reactiveForm;
                    const control = form.controls.townCombo;

                    combo.select([combo.data.at(0)], true);
                    fixture.detectChanges();

                    control.markAsTouched();
                    fixture.detectChanges();

                    expect(combo.valid).toEqual(IgxInputState.INITIAL);

                    control.disable();
                    fixture.detectChanges();

                    expect(combo.disabled).toBe(true);
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                });

                it('should render as INITIAL (not INVALID) after control.disable() and previously invalid', () => {
                    const form = fixture.componentInstance.reactiveForm;
                    const control = form.controls.townCombo;

                    // markAsTouched must come BEFORE setValue: markAsTouched does not emit
                    // statusChanges, so onStatusChanged must see touched=true at the moment
                    // statusChanges fires from setValue.
                    control.markAsTouched();
                    control.setValue([]);
                    fixture.detectChanges();

                    expect(combo.valid).toEqual(IgxInputState.INVALID);

                    control.disable();
                    fixture.detectChanges();

                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                });

                it('should change value when addressed as a form control', () => {
                    expect(combo).toBeDefined();
                    const form = fixture.componentInstance.reactiveForm;
                    const comboFormReference = form.controls.townCombo;
                    expect(comboFormReference).toBeDefined();
                    expect(combo.selection).toEqual(comboFormReference.value);
                    expect(combo.value).toEqual(comboFormReference.value);

                    // Form -> Combo
                    comboFormReference.setValue([{ field: 'Missouri', region: 'West North Central' }]);
                    fixture.detectChanges();
                    expect(combo.selection).toEqual([{ field: 'Missouri', region: 'West North Central' }]);
                    expect(combo.value).toEqual([{ field: 'Missouri', region: 'West North Central' }]);

                    // Combo -> Form
                    combo.select([{ field: 'South Carolina', region: 'South Atlantic' }], true);
                    fixture.detectChanges();
                    expect(comboFormReference.value).toEqual([{ field: 'South Carolina', region: 'South Atlantic' }]);
                });

                it('should properly submit values when used as a form control', () => {
                    expect(combo).toBeDefined();
                    const form = fixture.componentInstance.reactiveForm;
                    const comboFormReference = form.controls.townCombo;
                    expect(comboFormReference).toBeDefined();
                    expect(combo.selection).toEqual(comboFormReference.value);
                    expect(form.status).toEqual('INVALID');
                    form.controls.password.setValue('TEST');
                    form.controls.firstName.setValue('TEST');

                    spyOn(console, 'log');
                    fixture.detectChanges();
                    expect(form.status).toEqual('VALID');
                    fixture.debugElement.query(By.css('button')).triggerEventHandler('click', UIInteractions.simulateClickAndSelectEvent);
                });

                it('should add/remove asterisk when setting validators dynamically', () => {
                    let inputGroupIsRequiredClass = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP_REQUIRED));
                    let asterisk = window.getComputedStyle(fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP_LABEL)).nativeElement, ':after').content;
                    expect(asterisk).toBe('"*"');
                    expect(inputGroupIsRequiredClass).toBeDefined();

                    fixture.componentInstance.reactiveForm.controls.townCombo.clearValidators();
                    fixture.componentInstance.reactiveForm.controls.townCombo.updateValueAndValidity();
                    fixture.detectChanges();
                    inputGroupIsRequiredClass = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP_REQUIRED));
                    asterisk = window.getComputedStyle(fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP_LABEL)).nativeElement, ':after').content;
                    expect(asterisk).toBe('none');
                    expect(inputGroupIsRequiredClass).toBeNull();

                    fixture.componentInstance.reactiveForm.controls.townCombo.setValidators(Validators.required);
                    fixture.componentInstance.reactiveForm.controls.townCombo.updateValueAndValidity();
                    fixture.detectChanges();
                    inputGroupIsRequiredClass = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP_REQUIRED));
                    asterisk = window.getComputedStyle(fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP_LABEL)).nativeElement, ':after').content;
                    expect(asterisk).toBe('"*"');
                    expect(inputGroupIsRequiredClass).toBeDefined();
                });

                it('Should update validity state when programmatically setting errors on reactive form controls', fakeAsync(() => {
                    const form = fixture.componentInstance.reactiveForm;

                    form.markAllAsTouched();
                    form.get('townCombo').setErrors({ error: true });
                    fixture.detectChanges();

                    expect((combo as any).comboInput.valid).toBe(IgxInputState.INVALID);
                    expect((combo as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_INVALID)).toBe(true);
                    expect((combo as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_REQUIRED)).toBe(true);

                    // remove the validators and set errors
                    form.get('townCombo').clearValidators();
                    form.markAsUntouched();
                    fixture.detectChanges();

                    form.markAllAsTouched();
                    form.get('townCombo').setErrors({ error: true });
                    fixture.detectChanges();

                    // no validator, but there is a set error
                    expect((combo as any).comboInput.valid).toBe(IgxInputState.INVALID);
                    expect((combo as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_INVALID)).toBe(true);
                    expect((combo as any).inputGroup.element.nativeElement.classList.contains(CSS_CLASS_INPUT_GROUP_REQUIRED)).toBe(false);
                }));
            });

            describe('Template form tests: ', () => {
                let inputGroupRequired: DebugElement;
                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(IgxComboInTemplatedFormComponent);
                    fixture.detectChanges();
                    combo = fixture.componentInstance.testCombo;
                    input = fixture.debugElement.query(By.css(`${CSS_CLASS_INPUTGROUP} input`));
                    inputGroupRequired = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP_REQUIRED}`));
                }));
                it('should properly initialize when used in a template form control', () => {
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                    expect(inputGroupRequired).toBeDefined();
                    combo.onBlur();
                    fixture.detectChanges();
                    expect(combo.valid).toEqual(IgxInputState.INVALID);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

                    input.triggerEventHandler('focus', {});
                    combo.selectAllItems();
                    fixture.detectChanges();
                    expect(combo.valid).toEqual(IgxInputState.VALID);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.VALID);

                    const clearButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
                    clearButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                    fixture.detectChanges();
                    expect(combo.valid).toEqual(IgxInputState.INVALID);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);
                });
                it('should properly init with empty array and handle consecutive model changes', fakeAsync(() => {
                    const model = fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel);
                    fixture.componentInstance.values = [];
                    fixture.detectChanges();
                    tick();
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                    expect(model.valid).toBeFalse();
                    expect(model.dirty).toBeFalse();
                    expect(model.touched).toBeFalse();

                    fixture.componentInstance.values = ['Missouri'];
                    fixture.detectChanges();
                    tick();
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.selection).toEqual([{ field: 'Missouri', region: 'West North Central' }]);
                    expect(combo.value).toEqual(['Missouri']);
                    expect(combo.displayValue).toEqual('Missouri');
                    expect(model.valid).toBeTrue();
                    expect(model.touched).toBeFalse();

                    fixture.componentInstance.values = ['Missouri', 'Missouri'];
                    fixture.detectChanges();
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.selection).toEqual([{ field: 'Missouri', region: 'West North Central' }]);
                    expect(combo.value).toEqual(['Missouri']);
                    expect(combo.displayValue).toEqual('Missouri');
                    expect(model.valid).toBeTrue();
                    expect(model.touched).toBeFalse();

                    fixture.componentInstance.values = null;
                    fixture.detectChanges();
                    tick();
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.selection).toEqual([]);
                    expect(combo.value).toEqual([]);
                    expect(combo.displayValue).toEqual('');
                    expect(model.valid).toBeFalse();
                    expect(model.touched).toBeFalse();
                    expect(model.dirty).toBeFalse();

                    combo.onBlur();
                    fixture.detectChanges();
                    expect(combo.valid).toEqual(IgxInputState.INVALID);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);
                    expect(model.valid).toBeFalse();
                    expect(model.touched).toBeTrue();
                    expect(model.dirty).toBeFalse();

                    fixture.componentInstance.values = ['New Jersey'];
                    fixture.detectChanges();
                    tick();
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.selection).toEqual([{ field: 'New Jersey', region: 'Mid-Atlan' }]);
                    expect(combo.value).toEqual(['New Jersey']);
                    expect(combo.displayValue).toEqual('New Jersey');
                    expect(model.valid).toBeTrue();
                    expect(model.touched).toBeTrue();
                    expect(model.dirty).toBeFalse();
                }));
                it('should have correctly bound blur handler', () => {
                    spyOn(combo, 'onBlur');

                    input.triggerEventHandler('blur', {});
                    expect(combo.onBlur).toHaveBeenCalled();
                    expect(combo.onBlur).toHaveBeenCalledWith();
                });
                it('should set validity to initial when the form is reset', fakeAsync(() => {
                    combo.onBlur();
                    fixture.detectChanges();
                    expect(combo.valid).toEqual(IgxInputState.INVALID);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

                    fixture.componentInstance.form.resetForm();
                    tick();
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                }));
                it('should mark as touched and invalid when combo is focused, dropdown appears, and user clicks away without selection', fakeAsync(() => {
                    const ngModel = fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel);
                    expect(combo.valid).toEqual(IgxInputState.INITIAL);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                    expect(ngModel.touched).toBeFalse();

                    combo.open();
                    input.triggerEventHandler('focus', {});
                    fixture.detectChanges();
                    expect(ngModel.touched).toBeFalse();
                    combo.searchInput.nativeElement.focus();
                    fixture.detectChanges();
                    const documentClickEvent = new MouseEvent('click', { bubbles: true });
                    document.body.dispatchEvent(documentClickEvent);
                    fixture.detectChanges();
                    tick();
                    document.body.focus();
                    fixture.detectChanges();
                    tick();
                    expect(combo.valid).toEqual(IgxInputState.INVALID);
                    expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);
                    expect(ngModel.touched).toBeTrue();
                }));
            });
        });

        describe('Zoneless', () => {
            beforeEach(async () => {
                TestBed.resetTestingModule();
                await TestBed.configureTestingModule({
                    imports: [
                        NoopAnimationsModule,
                        IgxComboSampleComponent,
                    ],
                    providers: [
                        provideZonelessChangeDetection(),
                    ]
                }).compileComponents();

                fixture = TestBed.createComponent(IgxComboSampleComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.combo;
            });

            it('should render the focused item after a keyboard event without a forced check', async () => {
                combo.open();
                await fixture.whenStable();
                await combo.virtualScrollContainer.layoutComplete;
                await fixture.whenStable();

                const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                dropdownContent.nativeElement.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

                // Nothing is forced here: the component has to ask for the render itself.
                await fixture.whenStable();

                const focused = fixture.debugElement.nativeElement
                    .querySelectorAll(`.${CSS_CLASS_FOCUSED}`);
                expect(focused.length).toEqual(1);
                expect(combo.dropdown.focusedItem).toBeTruthy();
                expect(focused[0]).toBe(combo.dropdown.focusedItem.element.nativeElement);
                expect(focused[0].getAttribute('role')).toBe('option');
                const viewport = focused[0].closest('igx-virtual-scroll');
                expect(viewport.getAttribute('role')).toBe('presentation');
                expect(viewport.closest('[role="listbox"]').id).toBe(combo.dropdown.listId);
                expect(dropdownContent.nativeElement.getAttribute('aria-activedescendant')).toBe(focused[0].id);
            });

            it('should not reproduce NG0100 when virtualized combo items update on scroll - issue #17310', fakeAsync(() => {
                combo.open();
                tick();
                fixture.detectChanges();

                const scrollEl = fixture.debugElement.query(By.css('igx-virtual-scroll')).nativeElement;
                expect(scrollEl).toBeTruthy();

                scrollEl.scrollTop = 300;
                scrollEl.dispatchEvent(new Event('scroll'));
                tick(100);

                expect(() => {

                    fixture.detectChanges();
                }).not.toThrowError(/NG0100|ExpressionChangedAfterItHasBeenCheckedError/);
            }));

            it('should not reproduce NG0100 related to active descendant on scroll - issue #17310', fakeAsync(() => {
                combo.toggle();
                tick();
                fixture.detectChanges();

                const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
                dropdownContent.triggerEventHandler('focus', {});
                tick();
                fixture.detectChanges();

                const activeDescendantId = combo.dropdown.activeDescendant;
                expect(activeDescendantId).toBeTruthy();

                fixture.detectChanges();

                expect(() => {
                    const scrollEl = fixture.debugElement.query(By.css('igx-virtual-scroll')).nativeElement;
                    scrollEl.scrollTop = 1000;
                    scrollEl.dispatchEvent(new Event('scroll'));

                    tick(100);
                    fixture.detectChanges();
                }).not.toThrowError(/NG0100|ExpressionChangedAfterItHasBeenCheckedError/);
            }));
        });
    });

    describe('Selection lookup', () => {
        beforeEach(async () => {
            TestBed.resetTestingModule();
            await TestBed.configureTestingModule({
                imports: [NoopAnimationsModule, IgxComboComponent],
                providers: [provideZonelessChangeDetection()]
            }).compileComponents();
            fixture = TestBed.createComponent(IgxComboComponent);
            fixture.componentRef.setInput('valueKey', 'id');
            fixture.componentRef.setInput('displayKey', 'label');
            combo = fixture.componentInstance;
            await fixture.whenStable();
        });

        afterEach(() => {
            fixture.destroy();
            // The combo replaces TestBed's root ID with its own, so TestBed cannot
            // find this host during root-element cleanup.
            fixture.nativeElement.remove();
        });

        for (const keys of [[19995, 19996, 19997, 19998, 19999], [20001, 20002, 20003, 20004, 20005]]) {
            it(`should resolve ${keys[0] < 20000 ? 'loaded keys without rescanning' : 'missing keys in one shared scan'}`, async () => {
                let reads = 0;
                const records = Array.from({ length: 20000 }, (_, id) => ({
                    get id() {
                        reads++;
                        return id;
                    },
                    label: `Product ${id}`
                }));
                fixture.componentRef.setInput('data', records);
                await fixture.whenStable();
                combo.select(keys);
                await fixture.whenStable();

                // Isolate the synchronous hook from rendering. Loaded keys must not scan
                // the collection again; missing keys may share one fallback scan.
                reads = 0;
                combo.ngDoCheck();
                expect(reads).toBeLessThanOrEqual(keys[0] < records.length ? keys.length * 3 : records.length);
                expect(combo.value).toEqual(keys);
                expect(combo.selection).toEqual(keys.map(id => records[id] ?? { id }));
            });
        }

        it('should not rescan a loaded selection while scrolling', async () => {
            let reads = 0;
            const records = Array.from({ length: 20000 }, (_, id) => ({
                get id() {
                    reads++;
                    return id;
                },
                label: `Product ${id}`
            }));
            fixture.componentRef.setInput('data', records);
            fixture.componentRef.setInput('itemHeight', 40);
            fixture.componentRef.setInput('itemsMaxHeight', 400);
            await fixture.whenStable();
            const keys = [19995, 19996, 19997, 19998, 19999];
            combo.select(keys);
            combo.open();
            await fixture.whenStable();
            await combo.virtualScrollContainer.scrollToIndex(19950);
            await fixture.whenStable();
            await combo.virtualScrollContainer.layoutComplete;
            await fixture.whenStable();

            reads = 0;
            await combo.virtualScrollContainer.scrollToIndex(19900);
            await fixture.whenStable();
            await combo.virtualScrollContainer.layoutComplete;
            await fixture.whenStable();

            // Includes real rendering work, but must not walk all 20,000 records.
            expect(reads).toBeLessThan(1000);
            expect(combo.value).toEqual(keys);
            expect(combo.dropdown.items.some(item => item.value.id === 19900)).toBeTrue();
        });

        it('should stop scanning once all selected keys have been found', async () => {
            fixture.componentRef.setInput('data', [{ id: 10 }, { id: 50 }]);
            await fixture.whenStable();
            combo.select([50, 10]);
            await fixture.whenStable();

            let reads = 0;
            const records = Array.from({ length: 20000 }, (_, id) => ({
                get id() {
                    reads++;
                    return id;
                },
                label: `Product ${id}`
            }));
            fixture.componentRef.setInput('data', records);
            reads = 0;

            expect(combo.selection).toEqual([records[50], records[10]]);
            expect(reads).toBe(51);
            await fixture.whenStable();
        });

        it('should not scan the collection for an empty selection', async () => {
            let reads = 0;
            const records = Array.from({ length: 20000 }, (_, id) => ({
                get id() {
                    reads++;
                    return id;
                },
                label: `Product ${id}`
            }));
            fixture.componentRef.setInput('data', records);
            await fixture.whenStable();

            expect(combo.selection).toEqual([]);
            // Rendering may inspect visible items, but must not scan all 20,000 records.
            expect(reads).toBeLessThan(1000);
        });

        it('should resolve selection only once in ngDoCheck', async () => {
            fixture.componentRef.setInput('data', [{ id: 1, label: 'First' }]);
            await fixture.whenStable();
            combo.select([1]);
            await fixture.whenStable();
            const selection = spyOnProperty(combo, 'selection').and.callThrough();

            combo.ngDoCheck();

            expect(selection).toHaveBeenCalledTimes(1);
        });

        it('should use the first deeply equal object key even when another is the same reference', async () => {
            const first = { id: { key: 1 }, label: 'First' };
            const second = { id: { key: 1 }, label: 'Second' };
            fixture.componentRef.setInput('data', [first, second]);
            await fixture.whenStable();
            combo.select([second.id]);
            await fixture.whenStable();

            expect(combo.selection[0]).toBe(first);
        });

        it('should preserve deep equality between primitive and boxed keys', async () => {
            const first = { id: Object(1), label: 'First' };
            const second = { id: 1, label: 'Second' };
            fixture.componentRef.setInput('data', [first, second]);
            await fixture.whenStable();
            combo.select([1]);
            await fixture.whenStable();

            expect(combo.selection[0]).toBe(first);
        });

        it('should not change selection when a bound record key changes in place', async () => {
            const records = [{ id: 1, label: 'First' }, { id: 2, label: 'Second' }];
            fixture.componentRef.setInput('data', records);
            await fixture.whenStable();
            combo.select([1]);
            await fixture.whenStable();

            records[0].id = 3;
            combo.ngDoCheck();

            expect(combo.selection).toEqual([{ id: 1 }]);
            expect(combo.value).toEqual([1]);
        });

        it('should resolve a replacement in the exposed data array', async () => {
            fixture.componentRef.setInput('data', [{ id: 1, label: 'First' }]);
            await fixture.whenStable();
            combo.select([1]);
            await fixture.whenStable();
            const replacement = { id: 1, label: 'Replacement' };

            combo.data![0] = replacement;

            expect(combo.selection[0]).toBe(replacement);
        });

        it('should find a missing key when an unselected record changes to it', async () => {
            const records = [{ id: 1, label: 'First' }, { id: 2, label: 'Second' }];
            fixture.componentRef.setInput('data', records);
            await fixture.whenStable();
            combo.select([3]);
            await fixture.whenStable();
            expect(combo.selection).toEqual([{ id: 3 }]);

            records[1].id = 3;

            expect(combo.selection[0]).toBe(records[1]);
        });

        it('should take an earlier duplicate key once the data is bound again', async () => {
            const records = [{ id: 2, label: 'Earlier' }, { id: 1, label: 'Selected' }];
            fixture.componentRef.setInput('data', records);
            await fixture.whenStable();
            combo.select([1]);
            await fixture.whenStable();
            expect(combo.selection[0]).toBe(records[1]);

            // An earlier record takes the key in place. The match already found still
            // holds its index and its key, so it stands until the data is bound again -
            // the documented limit of the lookup.
            records[0].id = 1;
            expect(combo.selection[0]).toBe(records[1]);

            fixture.componentRef.setInput('data', [...records]);
            await fixture.whenStable();

            expect(combo.selection[0].label).toBe('Earlier');
        });

        it('should take an earlier boxed key once the data is bound again', async () => {
            const records = [{ id: 2 as any, label: 'Earlier' }, { id: 1, label: 'Selected' }];
            fixture.componentRef.setInput('data', records);
            await fixture.whenStable();
            combo.select([1]);
            await fixture.whenStable();
            expect(combo.selection[0]).toBe(records[1]);

            records[0].id = Object(1);
            expect(combo.selection[0]).toBe(records[1]);

            fixture.componentRef.setInput('data', [...records]);
            await fixture.whenStable();

            // A boxed key is deeply equal to the primitive that was asked for, so the
            // earlier record wins on the pass that resolves it.
            expect(combo.selection[0].label).toBe('Earlier');
        });

        it('should refresh a previously missing key when a new page arrives', async () => {
            fixture.componentRef.setInput('data', [{ id: 1, label: 'First' }]);
            await fixture.whenStable();
            combo.select([2]);
            await fixture.whenStable();
            expect(combo.selection).toEqual([{ id: 2 }]);

            const second = { id: 2, label: 'Second' };
            fixture.componentRef.setInput('data', [second]);
            await fixture.whenStable();

            expect(combo.selection[0]).toBe(second);
            expect((combo.getEditElement() as HTMLInputElement).value).toBe('Second');
        });
    });

    describe('Resource Strings', () => {
        let fix: ComponentFixture<IgxComboSampleComponent>;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [NoopAnimationsModule, IgxComboSampleComponent]
            }).compileComponents();
        }));

        beforeEach(() => {
            fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
        });

        it('should return full resource strings when partial resourceStrings are set', () => {
            combo = fix.componentInstance.combo;

            combo.resourceStrings = { igx_combo_empty_message: 'Nothing here' };
            fix.detectChanges();

            expect(combo.resourceStrings.igx_combo_empty_message).toBe('Nothing here');
            expect(combo.resourceStrings.igx_combo_filter_search_placeholder).toBe('Enter a Search Term');
            expect(combo.resourceStrings.igx_combo_clearItems_placeholder).toBe('Clear Selection');
        });

        it('should update non-overridden resource strings when global i18n changes', () => {
            combo = fix.componentInstance.combo;

            combo.resourceStrings = { igx_combo_empty_message: 'Custom Empty' };
            fix.detectChanges();

            try {
                changei18n({ igx_combo_filter_search_placeholder: 'Suchen...' });
                fix.detectChanges();

                expect(combo.resourceStrings.igx_combo_empty_message).toBe('Custom Empty');
                expect(combo.resourceStrings.igx_combo_filter_search_placeholder).toBe('Suchen...');
                expect(combo.resourceStrings.igx_combo_clearItems_placeholder).toBe('Clear Selection');
            } finally {
                changei18n(ComboResourceStringsEN);
            }
        });
    });
});

@Component({
    template: `
    <igx-combo #combo [placeholder]="'Location'" [data]='items'
        [disableFiltering]='false' [valueKey]="'field'" [groupKey]="'region'" [width]="'400px'"
        (selectionChanging)="selectionChanging($event)" [style.--ig-size]="'var(--ig-size-' + size + ')'">
        <ng-template igxComboItem let-display let-key="valueKey">
            <div class="state-card--simple">
                <span class="small-red-circle"></span>
                <div class="display-value--main">State: {{display[key]}}</div>
                <div class="display-value--sub">Region: {{display.region}}</div>
            </div>
        </ng-template>
        <ng-template igxComboHeader>
            <div class="header-class">This is a header</div>
        </ng-template>
        <ng-template igxComboFooter>
            <div class="footer-class">This is a footer</div>
        </ng-template>
    </igx-combo>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxComboComponent, IgxComboItemDirective, IgxComboHeaderDirective, IgxComboFooterDirective]
})
class IgxComboSampleComponent {
    public elementRef = inject(ElementRef);

    /**
     * TODO
     * Test that use this component should properly call `selectItems` method
     * IF a `valueKey` is defined, calls should be w/ the items' valueKey property value
     * IF no `valueKey` is defined, calls should be w/ object references to the items
     */
    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;

    public items = [];
    public initData = [];
    public size = 'medium';

    constructor() {

        const division = {
            'New England 01': ['Connecticut', 'Maine', 'Massachusetts'],
            'New England 02': ['New Hampshire', 'Rhode Island', 'Vermont'],
            'Mid-Atlantic': ['New Jersey', 'New York', 'Pennsylvania'],
            'East North Central 02': ['Michigan', 'Ohio', 'Wisconsin'],
            'East North Central 01': ['Illinois', 'Indiana'],
            'West North Central 01': ['Missouri', 'Nebraska', 'North Dakota', 'South Dakota'],
            'West North Central 02': ['Iowa', 'Kansas', 'Minnesota'],
            'South Atlantic 01': ['Delaware', 'Florida', 'Georgia', 'Maryland'],
            'South Atlantic 02': ['North Carolina', 'South Carolina', 'Virginia'],
            'South Atlantic 03': ['District of Columbia', 'West Virginia'],
            'East South Central 01': ['Alabama', 'Kentucky'],
            'East South Central 02': ['Mississippi', 'Tennessee'],
            'West South Central': ['Arkansas', 'Louisiana', 'Oklahome', 'Texas'],
            Mountain: ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
            'Pacific 01': ['Alaska', 'California'],
            'Pacific 02': ['Hawaii', 'Oregon', 'Washington']
        };
        const keys = Object.keys(division);
        for (const key of keys) {
            division[key].map((e) => {
                this.items.push({
                    field: e,
                    region: key.substring(0, key.length - 3)
                });
            });
        }

        this.initData = this.items;
    }

    public selectionChanging() {
    }
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
            <igx-combo #comboReactive formControlName="townCombo"
                class="input-container" [disableFiltering]="false" placeholder="Location(s)"
                [data]="items" [displayKey]="'field'" [groupKey]="'region'">
                <label igxLabel>Town</label>
            </igx-combo>
        </p>
        <p>
            <button type="submit" [disabled]="!reactiveForm.valid">Submit</button>
        </p>
    </form>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxComboComponent, IgxLabelDirective, ReactiveFormsModule]
})
class IgxComboFormComponent {
    @ViewChild('comboReactive', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public items = [];

    public get valuesTemplate() {
        return this.combo.selection;
    }
    public set valuesTemplate(values: any[]) {
        this.combo.select(values);
    }

    public reactiveForm: UntypedFormGroup;

    constructor() {
        const fb = inject(UntypedFormBuilder);


        const division = {
            'New England 01': ['Connecticut', 'Maine', 'Massachusetts'],
            'New England 02': ['New Hampshire', 'Rhode Island', 'Vermont'],
            'Mid-Atlantic': ['New Jersey', 'New York', 'Pennsylvania'],
            'East North Central 02': ['Michigan', 'Ohio', 'Wisconsin'],
            'East North Central 01': ['Illinois', 'Indiana'],
            'West North Central 01': ['Missouri', 'Nebraska', 'North Dakota', 'South Dakota'],
            'West North Central 02': ['Iowa', 'Kansas', 'Minnesota'],
            'South Atlantic 01': ['Delaware', 'Florida', 'Georgia', 'Maryland'],
            'South Atlantic 02': ['North Carolina', 'South Carolina', 'Virginia', 'District of Columbia', 'West Virginia'],
            'South Atlantic 03': ['District of Columbia', 'West Virginia'],
            'East South Central 01': ['Alabama', 'Kentucky'],
            'East South Central 02': ['Mississippi', 'Tennessee'],
            'West South Central': ['Arkansas', 'Louisiana', 'Oklahome', 'Texas'],
            Mountain: ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
            'Pacific 01': ['Alaska', 'California'],
            'Pacific 02': ['Hawaii', 'Oregon', 'Washington']
        };
        const keys = Object.keys(division);
        for (const key of keys) {
            division[key].map((e) => {
                this.items.push({
                    field: e,
                    region: key.substring(0, key.length - 3)
                });
            });
        }

        this.reactiveForm = fb.group({
            firstName: new UntypedFormControl('', Validators.required),
            password: ['', Validators.required],
            townCombo: [[this.items[0]], Validators.required]
        });
    }
    public onSubmitReactive() { }

    public onSubmitTemplateBased() { }
}

@Component({
    template: `
    <form #form="ngForm">
        <igx-combo #testCombo #testComboNgModel="ngModel" class="input-container" [placeholder]="'Locations'"
            name="anyName" required [(ngModel)]="values"
            [data]="items" [disableFiltering]="disableFilteringFlag"
            [displayKey]="'field'" [valueKey]="'field'"
            [groupKey]="'field' ? 'region' : ''" [width]="'100%'">
            <label igxLabel>Combo Label</label>
        </igx-combo>
    </form>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxComboComponent, IgxLabelDirective, FormsModule]
})
class IgxComboInTemplatedFormComponent {
    @ViewChild('testCombo', { read: IgxComboComponent, static: true })
    public testCombo: IgxComboComponent;
    @ViewChild('form')
    public form: NgForm;
    public items: any[] = [];
    public values: Array<any>;

    constructor() {
        const division = {
            'New England 01': ['Connecticut', 'Maine', 'Massachusetts'],
            'New England 02': ['New Hampshire', 'Rhode Island', 'Vermont'],
            'Mid-Atlantic': ['New Jersey', 'New York', 'Pennsylvania'],
            'East North Central 02': ['Michigan', 'Ohio', 'Wisconsin'],
            'East North Central 01': ['Illinois', 'Indiana'],
            'West North Central 01': ['Missouri', 'Nebraska', 'North Dakota', 'South Dakota'],
            'West North Central 02': ['Iowa', 'Kansas', 'Minnesota'],
            'South Atlantic 01': ['Delaware', 'Florida', 'Georgia', 'Maryland'],
            'South Atlantic 02': ['North Carolina', 'South Carolina', 'Virginia'],
            'South Atlantic 03': ['District of Columbia', 'West Virginia'],
            'East South Central 01': ['Alabama', 'Kentucky'],
            'East South Central 02': ['Mississippi', 'Tennessee'],
            'West South Central': ['Arkansas', 'Louisiana', 'Oklahome', 'Texas'],
            Mountain: ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
            'Pacific 01': ['Alaska', 'California'],
            'Pacific 02': ['Hawaii', 'Oregon', 'Washington']
        };
        const keys = Object.keys(division);
        for (const key of keys) {
            division[key].map((e) => {
                this.items.push({
                    field: e,
                    region: key.substring(0, key.length - 3)
                });
            });
        }
    }
}
@Injectable()
export class LocalService {
    public getData() {
        const fakeData = new Observable(obs => {
            setTimeout(() => {
                obs.next(this.generateData());
                obs.complete();
            }, 3000);
        });
        return fakeData;
    }

    private generateData() {
        const dummyData = [];
        for (let i = 1; i <= 20; i++) {
            dummyData.push({ id: i, product: 'Product ' + i });
        }
        return dummyData;
    }
}

@Injectable()
export class DeferredRemoteDataService {
    /** Every request made so far, in order, each waiting for the test to answer it. */
    public readonly requests: { state: IForOfState; subject: Subject<any[]> }[] = [];

    private readonly source = Array.from({ length: 1000 },
        (_, id) => ({ id, product: `Product ${id}` }));

    public getData(state: IForOfState): Observable<any[]> {
        const subject = new Subject<any[]>();
        this.requests.push({ state: { ...state }, subject });
        return subject.asObservable();
    }

    /** Answers one pending request, by default with the page its own state asked for. */
    public complete(request: { state: IForOfState; subject: Subject<any[]> }, count?: number): void {
        const size = count ?? request.state.chunkSize ?? 10;
        const start = request.state.startIndex;
        request.subject.next(this.source.slice(start, start + size));
        request.subject.complete();
    }
}

@Component({
    template: `
    <igx-combo #combo [placeholder]="'Products'" [data]="data" (dataPreLoad)="dataLoading($event)"
        [itemsMaxHeight]='400' [itemHeight]='40' [valueKey]="'id'" [displayKey]="'product'" [width]="'400px'">
    </igx-combo>
    `,
    providers: [DeferredRemoteDataService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxComboComponent]
})
export class IgxComboDeferredRemoteComponent implements AfterViewInit, OnDestroy {
    public service = inject(DeferredRemoteDataService);
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public instance: IgxComboComponent;

    public data: any[] = [];

    private pending: Subscription | null = null;

    public ngAfterViewInit() {
        this.request({ startIndex: 0, chunkSize: 10 });
    }

    /** The documented pattern: answer the window the event carries, drop the one in flight. */
    public dataLoading(state: IForOfState) {
        this.request(state);
    }

    public ngOnDestroy() {
        this.pending?.unsubscribe();
        this.cdr.detach();
    }

    private request(state: IForOfState) {
        this.pending?.unsubscribe();
        this.pending = this.service.getData(state).subscribe(page => {
            this.data = page;
            this.instance.totalItemCount = 1000;
            this.cdr.detectChanges();
        });
    }
}

@Component({
    template: `
    <igx-combo #combo [data]="data()" [valueKey]="'id'" [displayKey]="'product'"
        [groupKey]="groupKey()" [disableFiltering]="disableFiltering()" [filterFunction]="keepAll"
        [itemsMaxHeight]='400' [itemHeight]='40' [width]="'400px'"
        (dataPreLoad)="request($event)" (searchInputUpdate)="search($event)">
    </igx-combo>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxComboComponent]
})
export class IgxComboZonelessRemoteComponent implements OnDestroy {
    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public instance: IgxComboComponent;

    public data = signal<any[]>([]);
    public requests: { startIndex: number; chunkSize: number; response: Subject<any[]> }[] = [];
    public searches: string[] = [];
    public groupKey = signal<string>(undefined);
    public disableFiltering = signal(true);

    private pending: Subscription | null = null;

    /** Filtering belongs to the consumer here, so the combo keeps what it is given. */
    public keepAll = (collection: any[]) => collection;

    public page(start: number, count: number) {
        return Array.from({ length: count }, (_, index) => ({
            id: start + index,
            product: `Product ${start + index}`,
            category: `Group ${(start + index) % 2}`
        }));
    }

    /** The search path loads its own page, outside the scrolling request flow. */
    public search(args: { searchText: string }) {
        this.searches.push(args.searchText);
        this.pending?.unsubscribe();
        this.pending = null;
        this.data.set(this.page(0, 20));
    }

    /** The documented pattern: answer the latest request, drop the one still in flight. */
    public request(state: IForOfState) {
        this.pending?.unsubscribe();
        const request = { startIndex: state.startIndex, chunkSize: state.chunkSize, response: new Subject<any[]>() };
        this.requests.push(request);
        this.pending = request.response.subscribe(page => this.data.set(page));
    }

    public complete(request: { startIndex: number; chunkSize: number; response: Subject<any[]> }, count?: number) {
        request.response.next(this.page(request.startIndex, count ?? request.chunkSize));
        request.response.complete();
    }

    public ngOnDestroy() {
        this.pending?.unsubscribe();
    }
}

@Component({
    template: `
    <label id="mockID">Combo Label</label>
    <igx-combo #combo [placeholder]="'Products'" [data]='items' [itemsMaxHeight]='400'
        [itemHeight]='40' [valueKey]="'id'" [displayKey]="'product'" [width]="'400px'"
        [ariaLabelledBy]="'mockID'">
    </igx-combo>
    `,
    providers: [LocalService],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxComboComponent]
})
export class IgxComboBindingTestComponent {
    private localService = inject(LocalService);


    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;

    public items = [];
    constructor() {
        this.localService.getData().subscribe(
            (data: any[]) => {
                this.items = data;
            }
        );
    }
}
@Component({
    template: `
    <div class="comboContainer" [style.width]="'500px'">
        <igx-combo #combo placeholder="Location(s)"
            [data]="citiesData"
            [allowCustomValues]="true"
            [disableFiltering]="false">
        </igx-combo>
    </div>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxComboComponent]
})
class IgxComboInContainerTestComponent {
    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;

    public citiesData: string[] = [
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
        'Palma de Mallorca'];
}

@Injectable()
export class RemoteDataService {
    public records: Observable<any[]>;
    private _records: BehaviorSubject<any[]>;
    private dataStore: any[];
    private initialData: any[];

    constructor() {
        this.dataStore = [];
        this._records = new BehaviorSubject([]);
        this.records = this._records.asObservable();
        this.initialData = this.generateInitialData(0, 1000);
    }

    public getData(data?: IForOfState, cb?: (any) => void): any {
        const size = data.chunkSize === 0 ? 10 : data.chunkSize;
        this.dataStore = this.generateData(data.startIndex, data.startIndex + size);
        this._records.next(this.dataStore);
        const count = 1000;
        if (cb) {
            cb(count);
        }
    }

    public generateData(start, end) {
        return this.initialData.slice(start, end);
    }

    public generateInitialData(start, end) {
        const data = [];
        for (let i = start; i < end; i++) {
            data.push({ id: i, product: 'Product ' + i });
        }
        return data;
    }
}
@Component({
    template: `
    <label id="mockID">Combo Label</label>
    <igx-combo #combo [placeholder]="'Products'" [data]="data | async" (dataPreLoad)="dataLoading($event)" [itemsMaxHeight]='400'
        [itemHeight]='40' [valueKey]="'id'" [displayKey]="'product'" [width]="'400px'"
        [ariaLabelledBy]="'mockID'">
    </igx-combo>
    `,
    providers: [RemoteDataService],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxComboComponent, AsyncPipe]
})
export class IgxComboRemoteDataComponent implements OnInit, AfterViewInit, OnDestroy {
    private remoteDataService = inject(RemoteDataService);
    public cdr = inject(ChangeDetectorRef);

    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public instance: IgxComboComponent;
    public data;
    public ngOnInit(): void {
        this.data = this.remoteDataService.records;
    }

    public ngAfterViewInit() {
        this.remoteDataService.getData(this.instance.virtualizationState, (count) => {
            this.instance.totalItemCount = count;
            this.cdr.detectChanges();
        });
    }

    public dataLoading(evt) {
        this.remoteDataService.getData(evt, () => {
            this.cdr.detectChanges();
        });
    }

    public ngOnDestroy() {
        this.cdr.detach();
    }
}

@Component({
    template: `<igx-combo [(ngModel)]="selectedItems" [data]="items"></igx-combo>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxComboComponent, FormsModule]
})
export class ComboModelBindingComponent implements OnInit {
    @ViewChild(IgxComboComponent, { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public items: any[];
    public selectedItems: any[];

    public ngOnInit() {
        this.items = [{ text: 'One', id: 0 }, { text: 'Two', id: 1 }, { text: 'Three', id: 2 },
        { text: 'Four', id: 3 }, { text: 'Five', id: 4 }];
    }
}

@Component({
    template: `
        <igx-combo [(ngModel)]="selectedItems" [data]="items" [valueKey]="'id'" [displayKey]="'text'"></igx-combo>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxComboComponent, FormsModule]
})
export class IgxComboBindingDataAfterInitComponent implements AfterViewInit {
    private cdr = inject(ChangeDetectorRef);

    public items: any[] = [];
    public selectedItems: any[] = [0];

    public ngAfterViewInit() {
        setTimeout(() => {
            this.items = [{ text: 'One', id: 0 }, { text: 'Two', id: 1 }, { text: 'Three', id: 2 },
            { text: 'Four', id: 3 }, { text: 'Five', id: 4 }];
            this.cdr.detectChanges();
        }, 1000);
    }
}

@Component({
    template: `
        <igx-combo [data]="items" valueKey="value" displayKey="item"></igx-combo>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxComboComponent]
})
export class ComboArrayTypeValueKeyComponent {
    @ViewChild(IgxComboComponent, { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public items: any[] = [];

    constructor() {
        this.items = [
            {
                item: "Item1",
                value: [1, 2, 3]
            },
            {
                item: "Item2",
                value: [4, 5, 6]
            },
            {
                item: "Item3",
                value: [7, 8, 9]
            }
        ];
    }
}

@Component({
    template: `
        <igx-combo id="id1" [data]="items" valueKey="value" displayKey="item"></igx-combo>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxComboComponent]
})
export class ComboWithIdComponent {
    @ViewChild(IgxComboComponent, { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public items: any[] = [];

    constructor() {
        this.items = [
            {
                item: "Item1",
                value: "Option1"
            },
            {
                item: "Item2",
                value: "Option2"
            },
            {
                item: "Item3",
                value: "Option3",
            }
        ];
    }
}
