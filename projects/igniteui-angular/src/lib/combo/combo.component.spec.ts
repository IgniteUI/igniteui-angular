import { AfterViewInit, ChangeDetectorRef, Component, Injectable, OnInit, ViewChild, OnDestroy, EventEmitter, DebugElement } from '@angular/core';
import { async, TestBed, tick, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxToggleModule, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxComboItemComponent } from './combo-item.component';
import { IgxComboComponent, IgxComboModule, IComboSelectionChangeEventArgs, IgxComboState } from './combo.component';
import { IgxComboDropDownComponent } from './combo-dropdown.component';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule, FormsModule, NgControl } from '@angular/forms';
import { IForOfState } from '../directives/for-of/for_of.directive';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxDropDownItemBaseDirective } from '../drop-down/drop-down-item.base';
import { DisplayDensity, DisplayDensityToken } from '../core/density';
import { AbsoluteScrollStrategy, ConnectedPositioningStrategy } from '../services/index';
import { IgxInputState } from '../directives/input/input.directive';
import { IgxComboFilteringPipe } from './combo.pipes';
import { IgxComboAddItemComponent } from './combo-add-item.component';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxDropDownComponent, ISelectionEventArgs } from '../drop-down';
import { IgxComboBase } from './combo.common';
import { IgxSelectionAPIService } from '../core/selection';
import { DataGenerator } from '../data-operations/test-util/data-generator';
import { ISelectTabEventArgs } from '../tabbar/tabbar.component';
import { IgxComboAPIService } from './combo.api';
import { isNewExpression } from 'typescript';

const CSS_CLASS_COMBO = 'igx-combo';
const CSS_CLASS_COMBO_DROPDOWN = 'igx-combo__drop-down';
const CSS_CLASS_DROPDOWN = 'igx-drop-down';
const CSS_CLASS_DROPDOWNLIST = 'igx-drop-down__list';
const CSS_CLASS_DROPDOWNLIST_SCROLL = 'igx-drop-down__list-scroll';
const CSS_CLASS_CONTENT = 'igx-combo__content';
const CSS_CLASS_CONTAINER = 'igx-display-container';
const CSS_CLASS_DROPDOWNLISTITEM = 'igx-drop-down__item';
const CSS_CLASS_DROPDOWNBUTTON = 'igx-combo__toggle-button';
const CSS_CLASS_CLEARBUTTON = 'igx-combo__clear-button';
const CSS_CLASS_ADDBUTTON = 'igx-combo__add-item';
const CSS_CLASS_CHECK_GENERAL = 'igx-combo__checkbox';
const CSS_CLASS_CHECKBOX = 'igx-checkbox';
const CSS_CLASS_CHECKBOX_LABEL = 'igx-checkbox__composite';
const CSS_CLASS_CHECKED = 'igx-checkbox--checked';
const CSS_CLASS_TOGGLE = 'igx-toggle';
const CSS_CLASS_SELECTED = 'igx-drop-down__item--selected';
const CSS_CLASS_FOCUSED = 'igx-drop-down__item--focused';
const CSS_CLASS_HEADERITEM = 'igx-drop-down__header';
const CSS_CLASS_SCROLLBAR_VERTICAL = 'igx-vhelper--vertical';
const CSS_CLASS_INPUTGROUP = 'igx-input-group';
const CSS_CLASS_COMBO_INPUTGROUP = 'igx-input-group__input';
const CSS_CLASS_COMBO_INPUT = 'igx-combo-input';
const CSS_CLASS_INPUTGROUP_WRAPPER = 'igx-input-group__wrapper';
const CSS_CLASS_INPUTGROUP_BUNDLE = 'igx-input-group__bundle';
const CSS_CLASS_INPUTGROUP_MAINBUNDLE = 'igx-input-group__bundle-main';
const CSS_CLASS_INPUTGROUP_REQUIRED = 'igx-input-group--required';
const CSS_CLASS_INPUTGROUP_BORDER = 'igx-input-group__border';
const CSS_CLASS_HEADER = 'header-class';
const CSS_CLASS_FOOTER = 'footer-class';
const CSS_CLASS_ITEM = 'igx-drop-down__item';
const CSS_CLASS_ITEM_COSY = 'igx-drop-down__item--cosy';
const CSS_CLASS_ITEM_COMPACT = 'igx-drop-down__item--compact';
const CSS_CLASS_HEADER_ITEM = 'igx-drop-down__header';
const CSS_CLASS_HEADER_COSY = 'igx-drop-down__header--cosy';
const CSS_CLASS_HEADER_COMPACT = 'igx-drop-down__header--compact';
const CSS_CLASS_INPUT_COSY = 'igx-input-group--cosy';
const CSS_CLASS_INPUT_COMPACT = 'igx-input-group--compact';
const CSS_CLASS_INPUT_COMFORTABLE = 'igx-input-group--comfortable';
const defaultDropdownItemHeight = 40;
const defaultDropdownItemMaxHeight = 400;
const enterKeydownEvent = new KeyboardEvent('keydown', { key: 'Enter' });
const spaceKeydownEvent = new KeyboardEvent('keydown', { key: 'Space' });
const homeKeydownEvent = new KeyboardEvent('keydown', { key: 'Home' });
const endKeydownEvent = new KeyboardEvent('keydown', { key: 'End' });
const clickEvent = new MouseEvent('click');

const fiftyItems = Array.apply(null, { length: 50 }).map((e, i) => ({
    value: i,
    name: `Item ${i + 1}`
}));

describe('igxCombo', () => {
    let fixture;
    let combo: IgxComboComponent;
    let input: DebugElement;
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxComboTestComponent,
                IgxComboTestDataComponent,
                IgxComboSampleComponent,
                IgxComboInputTestComponent,
                IgxComboScrollTestComponent,
                IgxComboBindingTestComponent,
                IgxComboRemoteDataComponent,
                IgxComboEmptyTestComponent,
                IgxComboInContainerTestComponent,
                IgxComboFormComponent,
                SimpleBindComboComponent,
                ComboModelBindingComponent,
                ComboModelBinding2Component,
                DensityParentComponent,
                DensityInputComponent,
                IgxComboInTemplatedFormComponent
            ],
            imports: [
                IgxComboModule,
                NoopAnimationsModule,
                IgxToggleModule,
                ReactiveFormsModule,
                FormsModule
            ]
        }).compileComponents();
    }));

    describe('Unit tests: ', () => {
        const data = ['Item1', 'Item2', 'Item3', 'Item4', 'Item5', 'Item6', 'Item7'];
        const mockSelection: {
            [key: string]: jasmine.Spy
        } = jasmine.createSpyObj('IgxSelectionAPIService', ['get', 'set', 'add_items', 'select_items']);
        const mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);
        const mockComboService = jasmine.createSpyObj('IgxComboAPIService', ['register']);
        const mockNgControl = jasmine.createSpyObj('NgControl', ['registerOnChangeCb', 'registerOnTouchedCb']);
        const mockInjector = jasmine.createSpyObj('Injector', {
            'get': mockNgControl
        });
        mockSelection.get.and.returnValue(new Set([]));
        // const comboDropdown = new IgxComboDropDownComponent({ nativeElement: null },
        //     mockCdr, mockSelection as any, combo as IgxComboBase, mockComboService, null);
        // const mockOverlayService = jasmine.createSpyObj('IgxOverlayService', ['getOverlayById', 'show']);
        // mockOverlayService.getOverlayById.and.callFake(function() {
        //     return 1001;
        //   });
        // const toggleDirective = new IgxToggleDirective({ nativeElement: null }, mockCdr, mockOverlayService, null);
        // (comboDropdown as any).toggleDirective = toggleDirective;
        // spyOnProperty((combo.dropdown as any).toggleDirective, 'collapsed', 'get').and.callThrough();
        // spyOnProperty(combo.dropdown, 'collapsed', 'get').and.callThrough();
        it('should properly call dropdown methods on toggle', () => {
            combo = new IgxComboComponent({ nativeElement: null }, mockCdr, mockSelection as any, mockComboService, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['open', 'close', 'toggle']);
            combo.ngOnInit();
            combo.dropdown = dropdown;
            dropdown.collapsed = true;
            spyOn(combo.dropdown, 'close');
            spyOn(combo.dropdown, 'open');
            spyOn(combo.dropdown, 'toggle');

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
        it('should call dropdown toggle with correct overlaySettings', () => {
            combo = new IgxComboComponent({ nativeElement: null }, mockCdr, mockSelection as any, mockComboService, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['toggle']);
            combo.ngOnInit();
            combo.dropdown = dropdown;
            const defaultSettings = (combo as any)._overlaySettings;
            spyOn(combo.dropdown, 'toggle');
            combo.toggle();
            expect(combo.dropdown.toggle).toHaveBeenCalledWith(defaultSettings);
            const newSettings = {
                positionStrategy: new ConnectedPositioningStrategy(),
                scrollStrategy: new AbsoluteScrollStrategy()
            };
            combo.overlaySettings = newSettings;
            const expectedSettings = Object.assign({}, defaultSettings, newSettings);
            combo.toggle();
            expect(combo.dropdown.toggle).toHaveBeenCalledWith(expectedSettings);
        });
        it('should properly call "writeValue" method', () => {
            combo = new IgxComboComponent({ nativeElement: null }, mockCdr, mockSelection as any, mockComboService, null, mockInjector);
            combo.ngOnInit();
            combo.data = data;
            spyOn(combo, 'selectItems');
            combo.writeValue(['EXAMPLE']);
            expect(combo.selectItems).toHaveBeenCalledTimes(1);

            // Calling "SelectItems" through the writeValue accessor should clear the previous values;
            // Select items is called with the invalid value and it is written in selection, though no item is selected
            // Controlling the selection is up to the user
            expect(combo.selectItems).toHaveBeenCalledWith(['EXAMPLE'], true);
            combo.writeValue(combo.data[0]);
            // When value key is specified, the item's value key is stored in the selection
            expect(combo.selectItems).toHaveBeenCalledWith(combo.data[0], true);
        });
        it('should set selectedItems correctly on selectItems method call', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent({ nativeElement: null }, mockCdr, selectionService, mockComboService, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);

            combo.selectItems([], false);
            expect(combo.selectedItems()).toEqual([]);
            combo.selectItems([], true);
            expect(combo.selectedItems()).toEqual([]);
            const selectedItems = combo.data.slice(0, 3);
            combo.selectItems(combo.data.slice(0, 3), true);
            expect(combo.selectedItems()).toEqual(selectedItems);
            combo.selectItems([], false);
            expect(combo.selectedItems()).toEqual(selectedItems);
            selectedItems.push(combo.data[3]);
            combo.selectItems([combo.data[3]], false);
            expect(combo.selectedItems()).toEqual(combo.data.slice(0, 4));
            combo.selectItems([], true);
            expect(combo.selectedItems()).toEqual([]);
        });
        it('should fire onSelectionChange event on item selection', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent({ nativeElement: null }, mockCdr, selectionService, mockComboService, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            spyOn(combo.onSelectionChange, 'emit');

            let oldSelection = [];
            let newSelection = [combo.data[1], combo.data[5], combo.data[6]];

            combo.selectItems(newSelection);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: oldSelection,
                newSelection: newSelection,
                added: newSelection,
                removed: [],
                event: undefined,
                cancel: false
            });

            let newItem = combo.data[3];
            combo.selectItems([newItem]);
            oldSelection = [...newSelection];
            newSelection.push(newItem);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: oldSelection,
                newSelection: newSelection,
                removed: [],
                added: [combo.data[3]],
                event: undefined,
                cancel: false
            });

            oldSelection = [...newSelection];
            newSelection = [combo.data[0]];
            combo.selectItems(newSelection, true);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(3);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: oldSelection,
                newSelection: newSelection,
                removed: oldSelection,
                added: newSelection,
                event: undefined,
                cancel: false
            });

            oldSelection = [...newSelection];
            newSelection = [];
            newItem = combo.data[0];
            combo.deselectItems([newItem]);
            expect(combo.selectedItems().length).toEqual(0);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(4);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: oldSelection,
                newSelection: newSelection,
                removed: [combo.data[0]],
                added: [],
                event: undefined,
                cancel: false
            });
        });
        it('should handle select/deselect ALL items', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent({ nativeElement: null }, mockCdr, selectionService, mockComboService, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            spyOn(combo, 'selectAllItems');
            spyOn(combo, 'deselectAllItems');

            combo.handleSelectAll({ checked: true });
            expect(combo.selectAllItems).toHaveBeenCalledTimes(1);
            expect(combo.deselectAllItems).toHaveBeenCalledTimes(0);

            combo.handleSelectAll({ checked: false });
            expect(combo.selectAllItems).toHaveBeenCalledTimes(1);
            expect(combo.deselectAllItems).toHaveBeenCalledTimes(1);
        });
        it('should emit onSelectonChange event on select/deselect ALL items method call', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent({ nativeElement: null }, mockCdr, selectionService, mockComboService, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            spyOn(combo.onSelectionChange, 'emit');

            combo.selectAllItems(true);
            expect(combo.selectedItems()).toEqual(data);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: [],
                newSelection: data,
                added: data,
                removed: [],
                event: undefined,
                cancel: false
            });

            combo.deselectAllItems(true);
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({
                oldSelection: data,
                newSelection: [],
                added: [],
                removed: data,
                event: undefined,
                cancel: false
            });
        });
        it('should properly handle selection manipulation through onSelectionChange emit', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent({ nativeElement: null }, mockCdr, selectionService, mockComboService, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            spyOn(combo.onSelectionChange, 'emit').and.callFake(function (event: IComboSelectionChangeEventArgs) {
                return event.newSelection = [];
            });
            // No items are initially selected
            expect(combo.selectedItems()).toEqual([]);
            // Select the first 5 items
            combo.selectItems(combo.data.splice(0, 5));
            // onSelectionChange fires and overrides the selection to be [];
            expect(combo.selectedItems()).toEqual([]);
        });
        it('should not throw error when setting data to null', () => {
            combo = new IgxComboComponent({ nativeElement: null }, mockCdr, mockSelection as any, mockComboService, null, mockInjector);
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
            combo = new IgxComboComponent({ nativeElement: null }, mockCdr, mockSelection as any, mockComboService, null, mockInjector);
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
            combo = new IgxComboComponent({ nativeElement: null }, mockCdr, mockSelection as any, mockComboService, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            combo.filterable = true;
            const matchSpy = spyOn<any>(combo, 'checkMatch').and.callThrough();
            spyOn(combo.onSearchInput, 'emit');

            combo.handleInputChange();
            expect(matchSpy).toHaveBeenCalledTimes(1);
            expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(0);

            combo.handleInputChange('Fake');
            expect(matchSpy).toHaveBeenCalledTimes(2);
            expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(1);
            expect(combo.onSearchInput.emit).toHaveBeenCalledWith('Fake');

            combo.handleInputChange('');
            expect(matchSpy).toHaveBeenCalledTimes(3);
            expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(2);
            expect(combo.onSearchInput.emit).toHaveBeenCalledWith('');

            combo.filterable = false;
            combo.handleInputChange();
            expect(matchSpy).toHaveBeenCalledTimes(4);
            expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(2);
        });
        xit('should properly handle addItemToCollection calls (Primitive data)', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxComboComponent({ nativeElement: null }, mockCdr, selectionService, mockComboService, null, mockInjector);
            spyOn(selectionService, 'add_items').and.returnValue(new Set('myItem'));
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            combo.ngOnInit();
            combo.id = 'combo_test';
            combo.data = data;
            combo.dropdown = dropdown;
            combo.filterable = true;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            const initialData = [...combo.data];
            expect(combo.searchValue).toEqual('');
            combo.addItemToCollection();
            expect(initialData).toEqual(combo.data);
            expect(combo.data.length).toEqual(initialData.length);
            combo.searchValue = 'myItem';
            spyOn(combo.onAddition, 'emit');
            combo.addItemToCollection();
            expect(initialData.length).toBeLessThan(combo.data.length);
            expect(combo.data.length).toEqual(initialData.length + 1);
            expect(combo.onAddition.emit).toHaveBeenCalledTimes(1);
            expect(combo.data[combo.data.length - 1]).toEqual('myItem');
        });
    });

    describe('General tests: ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
        }));
        it('Should initialize the combo component properly', fakeAsync(() => {
            const comboButton = fixture.debugElement.query(By.css('button'));
            expect(fixture.componentInstance).toBeDefined();
            expect(combo).toBeDefined();
            expect(combo.collapsed).toBeDefined();
            expect(combo.data).toBeDefined();
            expect(combo.collapsed).toBeTruthy();
            expect(combo.searchInput).toBeDefined();
            expect(comboButton).toBeDefined();
            expect(combo.placeholder).toBeDefined();
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(false);
            expect(combo.searchInput).toBeDefined();
        }));
        it('Should properly return the context (this)', () => {
            expect(combo.context.$implicit).toEqual(combo);
        });
        it('Should properly accept input properties', () => {
            expect(combo.width).toEqual('400px');
            expect(combo.placeholder).toEqual('Location');
            expect(combo.searchPlaceholder).toEqual('Enter a Search Term'); // Default;
            expect(combo.filterable).toEqual(true);
            expect(combo.itemsMaxHeight).toEqual(400);
            expect(combo.itemsWidth).toEqual('399px');
            expect(combo.itemHeight).toEqual(40);
            expect(combo.groupKey).toEqual('region');
            expect(combo.valueKey).toEqual('field');
            expect(combo.data).toBeDefined();
            combo.width = '500px';
            expect(combo.width).toEqual('500px');
            combo.placeholder = 'Destination';
            expect(combo.placeholder).toEqual('Destination');
            combo.searchPlaceholder = 'Filter';
            expect(combo.searchPlaceholder).toEqual('Filter');
            combo.filterable = false;
            expect(combo.filterable).toEqual(false);
            combo.itemsMaxHeight = 500;
            expect(combo.itemsMaxHeight).toEqual(500);
            combo.itemHeight = 50;
            expect(combo.itemHeight).toEqual(50);
            combo.groupKey = 'field';
            expect(combo.groupKey).toEqual('field');
            combo.valueKey = 'region';
            expect(combo.valueKey).toEqual('region');
            combo.data = [{
                field: 1,
                region: 'A'
            }, {
                field: 2,
                region: 'B'
            }, {
                field: 3,
                region: 'C'
            }];
            expect(combo.data).toBeDefined();
            expect(combo.data.length).toEqual(3);
            combo.data = [];
            fixture.detectChanges();
            expect(combo.data).toBeDefined();
            expect(combo.data.length).toEqual(0);
        });
        it('Combo`s input textbox should be read-only', fakeAsync(() => {
            const comboElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_COMBO_INPUTGROUP));
            expect(comboElement.attributes['readonly']).toBeDefined();
        }));
        it('Should properly get/set displayKey', () => {
            expect(combo.displayKey).toEqual(combo.valueKey);
            combo.displayKey = 'region';
            expect(combo.displayKey).toEqual('region');
            expect(combo.displayKey === combo.valueKey).toBeFalsy();
        });
        it('Should properly get/set overlaySettings', () => {
            const defaultSettings = (combo as any)._overlaySettings;
            spyOn(combo.dropdown, 'toggle');
            combo.toggle();
            expect(combo.dropdown.toggle).toHaveBeenCalledWith(defaultSettings);
            const newSettings = {
                positionStrategy: new ConnectedPositioningStrategy({ target: fixture.elementRef.nativeElement }),
                scrollStrategy: new AbsoluteScrollStrategy(fixture.elementRef.nativeElement)
            };
            combo.overlaySettings = newSettings;
            const expectedSettings = Object.assign({}, defaultSettings, newSettings);
            combo.toggle();
            expect(combo.dropdown.toggle).toHaveBeenCalledWith(expectedSettings);
        });
        // fit('Should return correct edit element', () => {
        //     const fixture = TestBed.createComponent(SimpleBindComboComponent);
        //     fixture.detectChanges();
        //     const comboElement = fixture.debugElement.query(By.css('input[name=\'comboInput\']')).nativeElement;
        //     const comboInstance = fixture.componentInstance.combo;
        //     expect(comboInstance.getEditElement()).toEqual(comboElement);
        // });
    });

    describe('Template tests: ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
        }));
        it('should properly initialize templates', () => {
            expect(combo).toBeDefined();
            expect(combo.footerTemplate).toBeDefined();
            expect(combo.headerTemplate).toBeDefined();
            expect(combo.itemTemplate).toBeDefined();
            expect(combo.addItemTemplate).toBeUndefined();
            expect(combo.headerItemTemplate).toBeUndefined();
        });
        it('should properly render header template', fakeAsync(() => {
            let headerElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_HEADER));
            expect(headerElement).toBeNull();
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.headerTemplate).toBeDefined();
            const dropdownList: HTMLElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
            headerElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_HEADER));
            expect(headerElement).not.toBeNull();
            const headerHTMLElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_HEADER)).nativeElement;
            expect(headerHTMLElement.parentNode).toEqual(dropdownList);
            expect(headerHTMLElement.textContent).toEqual('This is a header');
        }));
        it('should properly render footer template', fakeAsync(() => {
            let footerElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOOTER));
            expect(footerElement).toBeNull();
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.footerTemplate).toBeDefined();
            const dropdownList: HTMLElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
            footerElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOOTER));
            expect(footerElement).not.toBeNull();
            const footerHTMLElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOOTER)).nativeElement;
            expect(footerHTMLElement.parentNode).toEqual(dropdownList);
            expect(footerHTMLElement.textContent).toEqual('This is a footer');
        }));
    });

    describe('Dropdown tests: ', () => {
        let dropdown: IgxComboDropDownComponent;
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            dropdown = combo.dropdown;
            input = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP));
        }));
        it('should properly call dropdown navigatePrev method', fakeAsync(() => {
            expect(dropdown.focusedItem).toBeFalsy();
            expect(dropdown.focusedItem).toEqual(null);
            expect(combo.collapsed).toBeTruthy();
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(document.activeElement).toEqual(combo.searchInput.nativeElement);
            expect(combo.collapsed).toBeFalsy();
            combo.handleKeyUp(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
            fixture.detectChanges();
            expect(dropdown.focusedItem).toBeTruthy();
            expect(dropdown.focusedItem.itemIndex).toEqual(0);
            expect((combo as any).virtDir.state.startIndex).toEqual(0);
            dropdown.navigatePrev();
            tick();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(document.activeElement).toEqual(combo.searchInput.nativeElement);
            combo.handleKeyUp(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
            fixture.detectChanges();
            expect(dropdown.focusedItem).toBeTruthy();
            expect(dropdown.focusedItem.itemIndex).toEqual(0);
            dropdown.navigateNext();
            tick();
            fixture.detectChanges();
            expect(dropdown.focusedItem).toBeTruthy();
            expect(dropdown.focusedItem.itemIndex).toEqual(1);
            expect((combo as any).virtDir.state.startIndex).toEqual(0);
            spyOn(dropdown, 'navigatePrev').and.callThrough();
            dropdown.navigatePrev();
            tick();
            expect(dropdown.focusedItem).toBeTruthy();
            expect(dropdown.focusedItem.itemIndex).toEqual(0);
            expect((combo as any).virtDir.state.startIndex).toEqual(0);
            expect(dropdown.navigatePrev).toHaveBeenCalledTimes(1);
        }));

        // xit('Should properly call dropdown navigateNext with virtual items', (async () => {
        //     expect(combo).toBeDefined();
        //     expect(dropdown).toBeDefined();
        //     expect(dropdown.focusedItem).toBeFalsy();
        //     expect((combo as any).virtDir).toBeDefined();
        //     const mockClick = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
        //     const virtualMockUP = spyOn<any>(dropdown, 'navigatePrev').and.callThrough();
        //     const virtualMockDOWN = spyOn<any>(dropdown, 'navigateNext').and.callThrough();
        //     expect(dropdown.focusedItem).toEqual(null);
        //     expect(combo.collapsed).toBeTruthy();
        //     combo.toggle();
        //     await wait(30);
        //     fixture.detectChanges();
        //     expect(combo.collapsed).toBeFalsy();
        //     (combo as any).virtDir.scrollTo(51);
        //     await wait(30);
        //     fixture.detectChanges();
        //     let items = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM));
        //     let lastItem = items[items.length - 1].componentInstance;
        //     expect(lastItem).toBeDefined();
        //     lastItem.clicked(mockClick);
        //     await wait(30);
        //     fixture.detectChanges();
        //     expect(dropdown.focusedItem).toEqual(lastItem);
        //     dropdown.navigateItem(-1);
        //     await wait(30);
        //     fixture.detectChanges();
        //     expect(virtualMockDOWN).toHaveBeenCalledTimes(0);
        //     lastItem.clicked(mockClick);
        //     await wait(30);
        //     fixture.detectChanges();
        //     expect(dropdown.focusedItem).toEqual(lastItem);
        //     dropdown.navigateNext();
        //     await wait(30);
        //     fixture.detectChanges();
        //     expect(virtualMockDOWN).toHaveBeenCalledTimes(1);
        //     combo.searchValue = 'New';
        //     combo.handleInputChange();
        //     fixture.detectChanges();
        //     await wait(30);
        //     items = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM));
        //     lastItem = items[items.length - 1].componentInstance;
        //     (lastItem as IgxComboAddItemComponent).handleClick();
        //     fixture.detectChanges();
        //     // After `Add Item` is clicked, the input is focused and the item is added to the list
        //     expect(dropdown.focusedItem).toEqual(null);
        //     expect(document.activeElement).toEqual(combo.searchInput.nativeElement);
        //     expect(combo.customValueFlag).toBeFalsy();
        //     expect(combo.searchInput.nativeElement.value).toBeTruthy();

        //     // TEST move from first item
        //     (combo as any).virtDir.scrollTo(0);
        //     await wait(30);
        //     fixture.detectChanges();
        //     const firstItem = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM))[0].componentInstance;
        //     firstItem.clicked(mockClick);
        //     await wait(30);
        //     fixture.detectChanges();
        //     expect(dropdown.focusedItem).toEqual(firstItem);
        //     expect(dropdown.focusedItem.itemIndex).toEqual(0);
        //     // spyOnProperty(dropdown, 'focusedItem', 'get').and.returnValue(firstItem);
        //     dropdown.navigateFirst();
        //     await wait(30);
        //     fixture.detectChanges();
        //     dropdown.navigatePrev();
        //     await wait(30);
        //     fixture.detectChanges();
        //     // Called once before the `await` and called once more, because item @ index 0 is a header
        //     expect(virtualMockUP).toHaveBeenCalledTimes(2);
        // }));
        it('should focus item when onFocus and onBlur are called', fakeAsync(() => {
            expect(dropdown.focusedItem).toEqual(null);
            expect(dropdown.items.length).toEqual(9);
            dropdown.toggle();
            tick();
            fixture.detectChanges();
            expect(dropdown.items).toBeDefined();
            expect(dropdown.items.length).toBeTruthy();
            dropdown.onFocus();
            expect(dropdown.focusedItem).toEqual(dropdown.items[0]);
            expect(dropdown.focusedItem.focused).toEqual(true);
            dropdown.onFocus();
            dropdown.onBlur();
            expect(dropdown.focusedItem).toEqual(null);
            dropdown.onBlur();
        }));
        xit('should properly handle dropdown.focusItem', fakeAsync(() => {
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
            combo.handleKeyUp(new KeyboardEvent('keyup', { key: 'A' }));
            combo.handleKeyUp(new KeyboardEvent('keyup', {}));
            expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
            expect(combo.dropdown.onFocus).toHaveBeenCalledTimes(0);
            combo.handleKeyUp(new KeyboardEvent('keyup', { key: 'Enter' }));
            expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
            spyOnProperty(combo, 'filteredData', 'get').and.returnValue([1]);
            combo.handleKeyUp(new KeyboardEvent('keyup', { key: 'Enter' }));
            expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
            combo.handleKeyUp(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
            expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
            expect(combo.dropdown.onFocus).toHaveBeenCalledTimes(1);
            combo.handleKeyUp(new KeyboardEvent('keyup', { key: 'Escape' }));
            expect(combo.toggle).toHaveBeenCalledTimes(1);
        }));
        it('should toggle combo dropdown on toggle button click', fakeAsync(() => {
            spyOn(combo, 'toggle').and.callThrough();
            input.triggerEventHandler('click', clickEvent);
            tick();
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(false);
            expect(combo.toggle).toHaveBeenCalledTimes(1);

            input.triggerEventHandler('click', clickEvent);
            tick();
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(true);
            expect(combo.toggle).toHaveBeenCalledTimes(2);
        }));
        it('should toggle dropdown list with arrow down/up keys', fakeAsync(() => {
            spyOn(combo, 'open').and.callThrough();
            spyOn(combo, 'close').and.callThrough();

            combo.onArrowDown(new KeyboardEvent('keydown', { altKey: false, key: 'ArrowDown' }));
            tick();
            fixture.detectChanges();
            expect(combo.open).toHaveBeenCalledTimes(1);

            combo.onArrowDown(new KeyboardEvent('keydown', { altKey: true, key: 'ArrowDown' }));
            tick();
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(false);
            expect(combo.open).toHaveBeenCalledTimes(2);

            combo.handleKeyDown(new KeyboardEvent('keydown', { altKey: false, key: 'ArrowUp' }));
            tick();
            fixture.detectChanges();
            expect(combo.close).toHaveBeenCalledTimes(1);

            combo.handleKeyDown(new KeyboardEvent('keydown', { altKey: true, key: 'ArrowUp' }));
            fixture.detectChanges();
            tick();
            expect(combo.close).toHaveBeenCalledTimes(2);
        }));
        it('should focus search input after dropdown has been opened', fakeAsync(() => {
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(document.activeElement).toEqual(combo.searchInput.nativeElement);
        }));
        it('should select/focus dropdown list items with space/up and down arrow keys', fakeAsync(() => {
            let selectedItemsCount = 0;
            combo.toggle();
            tick();
            fixture.detectChanges();

            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT));
            let focusedItems = dropdownList.querySelectorAll('.' + CSS_CLASS_FOCUSED);
            let selectedItems = dropdownList.querySelectorAll('.' + CSS_CLASS_SELECTED);
            expect(focusedItems.length).toEqual(0);
            expect(selectedItems.length).toEqual(0);

            const focusAndVerifyItem = function (itemIndex: number, key: string) {
                dropdownContent.triggerEventHandler('keydown', new KeyboardEvent('keydown', { key: key }));
                fixture.detectChanges();
                focusedItems = dropdownList.querySelectorAll('.' + CSS_CLASS_FOCUSED);
                expect(focusedItems.length).toEqual(1);
                expect(focusedItems[0]).toEqual(dropdownItems[itemIndex]);
            };

            const selectAndVerifyItem = function (itemIndex: number) {
                dropdownContent.triggerEventHandler('keydown', spaceKeydownEvent);
                fixture.detectChanges();
                selectedItems = dropdownList.querySelectorAll('.' + CSS_CLASS_SELECTED);
                expect(selectedItems.length).toEqual(selectedItemsCount);
                expect(selectedItems).toContain(dropdownItems[itemIndex]);
            };

            focusAndVerifyItem(0, 'ArrowDown');
            selectedItemsCount++;
            selectAndVerifyItem(0);

            for (let index = 1; index < 7; index++) {
                focusAndVerifyItem(index, 'ArrowDown');
            }
            selectedItemsCount++;
            selectAndVerifyItem(6);

            for (let index = 5; index > 3; index--) {
                focusAndVerifyItem(index, 'ArrowUp');
            }
            selectedItemsCount++;
            selectAndVerifyItem(4);
        }));
        // it('Should scroll up to the first item in the dropdown list with HOME key',  fakeAsync(() => {
        //     let scrollbar: HTMLElement;
        //     let dropdownContainer: HTMLElement;
        //     let firstVisibleItem: Element;
        //     let lastVisibleItem: Element;
        //     combo.toggle();
        //     tick();
        //     fixture.detectChanges();
        //     const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT));
        //     scrollbar = fixture.debugElement.query(By.css('.' + CSS_CLASS_SCROLLBAR_VERTICAL)).nativeElement as HTMLElement;
        //     expect(scrollbar.scrollTop).toEqual(0);

        //     (combo as any).virtDir.onChunkLoad.pipe(take(1)).subscribe(() => {
        //         fixture.detectChanges();
        //         expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);
        //         dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //         firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
        //         lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
        //         expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[15].value.field);
        //         expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[37].value.field);
        //         expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //         expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();

        //     });
        //     UIInteractions.triggerKeyDownEvtUponElem('End', dropdownContent.nativeElement, true);
        //     tick();
        //     fixture.detectChanges();

        // combo.onOpened.pipe(take(1)).subscribe(() => {
        //     fixture.detectChanges();
        //     const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT));
        //     scrollbar = fixture.debugElement.query(By.css('.' + CSS_CLASS_SCROLLBAR_VERTICAL)).nativeElement as HTMLElement;
        //     expect(scrollbar.scrollTop).toEqual(0);
        //     dropdownContent.triggerEventHandler('keydown', endKeydownEvent);
        //     (combo as any).virtDir.onChunkLoad.pipe(take(1)).subscribe(() => {
        //         fixture.detectChanges();
        //         expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);
        //         dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //         firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
        //         lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
        //         expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[15].value.field);
        //         expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[37].value.field);
        //         expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //         expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
        //         done();
        //     });
        // });
        //}));
        // xit('Should scroll up to the first item in the dropdown list with HOME key', async(() => {
        //     let scrollbar: HTMLElement;
        //     let dropdownContainer: HTMLElement;
        //     let firstVisibleItem: Element;
        //     let lastVisibleItem: Element;
        //     const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
        //     const endEvent = new KeyboardEvent('keydown', { key: 'End' });
        //     const comboButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
        //     comboButton.click();
        //     fixture.whenStable().then(() => {
        //         fixture.detectChanges();
        //         const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT)).nativeElement;
        //         scrollbar = fixture.debugElement.query(By.css('.' + CSS_CLASS_SCROLLBAR_VERTICAL)).nativeElement as HTMLElement;
        //         expect(scrollbar.scrollTop).toEqual(0);
        //         dropdownContent.dispatchEvent(endEvent);
        //         setTimeout(() => {
        //             fixture.detectChanges();
        //             expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);
        //             dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //             firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
        //             lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
        //             expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 11]);
        //             expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 1]);
        //             expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //             expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
        //             dropdownContent.dispatchEvent(homeEvent);
        //             setTimeout(() => {
        //                 fixture.detectChanges();
        //                 expect(scrollbar.scrollTop).toEqual(0);
        //                 dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //                 firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
        //                 lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
        //                 expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
        //                 expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //                 expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[0]);
        //                 expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[10]);
        //                 (combo as any).virtDir.scrollTo(10);
        //                 setTimeout(function () {
        //                     fixture.detectChanges();
        //                     dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //                     firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
        //                     lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
        //                     expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //                     expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //                     expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[11]);
        //                     dropdownContent.dispatchEvent(homeEvent);
        //                     setTimeout(function () {
        //                         fixture.detectChanges();
        //                         dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //                         firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
        //                         lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
        //                         expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[0]);
        //                         expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[10]);
        //                         expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
        //                         expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //                         expect(scrollbar.scrollTop).toEqual(0);
        //                     }, 20);
        //                 }, 20);
        //             }, 20);
        //         }, 20);
        //     });
        // }));
        // xit('Should scroll down to the last item in the dropdown list with END key', (done) => {
        //     let dropdownContainer: HTMLElement;
        //     let firstVisibleItem: Element;
        //     let lastVisibleItem: Element;
        //     const endEvent = new KeyboardEvent('keydown', { key: 'End' });
        //     const fixture = TestBed.createComponent(IgxComboTestComponent);
        //     fixture.detectChanges();
        //     const combo = fixture.componentInstance.combo;
        //     combo.toggle();
        //     setTimeout(() => {
        //         fixture.detectChanges();
        //         const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT)).nativeElement;
        //         const scrollbar = fixture.debugElement.query(By.css('.' + CSS_CLASS_SCROLLBAR_VERTICAL)).nativeElement as HTMLElement;
        //         expect(scrollbar.scrollTop).toEqual(0);
        //         dropdownContent.dispatchEvent(endEvent);
        //         setTimeout(() => {
        //             fixture.detectChanges();
        //             setTimeout(function () {
        //                 fixture.detectChanges();
        //                 expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);
        //                 dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //                 firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
        //                 lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
        //                 expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 11]);
        //                 expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 1]);
        //                 expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //                 expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
        //                 (combo as any).virtDir.scrollTo(3);
        //                 setTimeout(function () {
        //                     fixture.detectChanges();
        //                     dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //                     firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
        //                     expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[3]);
        //                     dropdownContent.dispatchEvent(endEvent);
        //                     setTimeout(function () {
        //                         fixture.detectChanges();
        //                         dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //                         firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
        //                         lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
        //                         expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 11]);
        //                         expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 1]);
        //                         expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);
        //                         expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //                         expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
        //                         done();
        //                     }, 20);
        //                 }, 20);
        //             }, 20);
        //         }, 20);
        //     }, 10);
        // });

        // it('Should scroll down to the last item in the dropdown list with END key - combo with more records', (done) => {
        //     let dropdownContainer: HTMLElement;
        //     let firstVisibleItem: Element;
        //     let lastVisibleItem: Element;
        //     combo.toggle();
        //     combo.onOpened.pipe(take(1)).subscribe(() => {
        //         fixture.detectChanges();
        //         const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT)).nativeElement;
        //         const scrollbar = fixture.debugElement.query(By.css('.' + CSS_CLASS_SCROLLBAR_VERTICAL)).nativeElement as HTMLElement;
        //         expect(scrollbar.scrollTop).toEqual(0);
        //         UIInteractions.simulateKeyDownEvent(dropdownContent, 'End');
        //         setTimeout(() => {
        //             fixture.detectChanges();
        //             expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);
        //             dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //             firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
        //             lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
        //             expect(lastVisibleItem.textContent.trim()).toEqual('State: TexasRegion: West South Cent');
        //             expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //             expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
        //             done();
        //         }, 20);
        //     });
        // });

        // xit('Should properly navigate to last item using END key when no virtScroll is necessary', (done) => {
        //     let dropdownContainer: HTMLElement;
        //     let firstVisibleItem: Element;
        //     let lastVisibleItem: Element;
        //     const endEvent = new KeyboardEvent('keydown', { key: 'End' });
        //     const moveUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        //     const fixture = TestBed.createComponent(IgxComboTestDataComponent);
        //     fixture.detectChanges();
        //     const combo = fixture.componentInstance.combo;
        //     combo.toggle();
        //     combo.onOpened.pipe(take(1)).subscribe(() => {
        //         fixture.detectChanges();
        //         const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT)).nativeElement;
        //         const scrollbar = fixture.debugElement.query(By.css('.' + CSS_CLASS_SCROLLBAR_VERTICAL)).nativeElement as HTMLElement;
        //         expect(scrollbar.scrollTop).toEqual(0);
        //         dropdownContent.dispatchEvent(endEvent);
        //         setTimeout(() => {
        //             fixture.detectChanges();

        //             // Content was scrolled to bottom
        //             expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);
        //             dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //             firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
        //             lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
        //             expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 1]);
        //             expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //             expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();

        //             dropdownContent.dispatchEvent(moveUpEvent);
        //             fixture.detectChanges();
        //             lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');

        //             // Scroll has not changed
        //             expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);

        //             // Last item is no longer focused
        //             expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();

        //             dropdownContent.dispatchEvent(endEvent);
        //             setTimeout(() => {
        //                 fixture.detectChanges();
        //                 lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
        //                 // Scroll has not changed
        //                 expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);
        //                 // Last item is focused again
        //                 expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
        //                 done();
        //             }, 20);
        //         });
        //     });
        // });

        // it('should properly navigate with HOME/END key', (done) => {
        //     let dropdownContainer: HTMLElement;
        //     let firstVisibleItem: Element;
        //     let lastVisibleItem: Element;
        //     const endEvent = new KeyboardEvent('keydown', { key: 'End' });
        //     const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
        //     const moveDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        //     // console.log(combo.data);
        //     combo.toggle();
        //     fixture.detectChanges();
        //     combo.onOpened.pipe(take(1)).subscribe(() => {
        //         fixture.detectChanges();
        //         const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT)).nativeElement;
        //         const scrollbar = fixture.debugElement.query(By.css('.' + CSS_CLASS_SCROLLBAR_VERTICAL)).nativeElement as HTMLElement;
        //         expect(scrollbar.scrollTop).toEqual(0);
        //         // Scroll to bottom;

        //         dropdownContent.dispatchEvent(endEvent);
        //         setTimeout(() => {
        //         fixture.detectChanges();
        //         expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);
        //             dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //             firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
        //             lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
        //             expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[15].value.field);
        //             expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[37].value.field);
        //             expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //             expect(lastVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
        //             done();
        //     }, 20);

        //         // (combo as any).virtDir.onChunkLoad.pipe(take(1)).subscribe(() => {
        //         //     fixture.detectChanges();

        //             // Content was scrolled to bottom


        //             // Scroll to top
        //             // dropdownContent.dispatchEvent(homeEvent);
        //             // (combo as any).virtDir.onChunkLoad.pipe(take(1)).subscribe(() => {
        //             //     fixture.detectChanges();
        //             //     dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
        //             //     firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');

        //             //     // Container is scrolled to top
        //             //     expect(scrollbar.scrollTop).toEqual(0);

        //             //     // First item is focused
        //             //     expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
        //             //     dropdownContent.dispatchEvent(moveDownEvent);
        //             //     fixture.detectChanges();
        //             //     firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');

        //             //     // Scroll has not change
        //             //     expect(scrollbar.scrollTop).toEqual(0);

        //             //     // First item is no longer focused
        //             //     expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        //             //     dropdownContent.dispatchEvent(homeEvent);
        //             //     fixture.detectChanges();
        //             //     expect(firstVisibleItem.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
        //             //     done();
        //             // });
        //         // });
        //     });
        // });

        // // dispatchEvent 'Tab' does not trigger default browser behaviour (focus)
        // it('Should properly get the first focusable item when focusing the component list', fakeAsync(() => {
        //     const expectedItemText = 'State: MichiganRegion: East North Central';
        //     combo.toggle();
        //     tick();
        //     fixture.detectChanges();
        //     combo.dropdown.onFocus();
        //     tick();
        //     fixture.detectChanges();
        //     (<HTMLElement>document.getElementsByClassName(CSS_CLASS_CONTENT)[0]).focus();
        //     expect((<HTMLElement>combo.dropdown.focusedItem.element.nativeElement).textContent.trim()).toEqual(expectedItemText);
        // }));
    });

    describe('Selection tests: ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            input = fixture.debugElement.query(By.css('.' + CSS_CLASS_COMBO_INPUTGROUP));
        }));
        function simulateComboItemCheckboxClick(itemIndex: number, isHeader = false) {
            const itemClass = isHeader ? CSS_CLASS_HEADERITEM : CSS_CLASS_DROPDOWNLISTITEM;
            const dropdownItem = fixture.debugElement.queryAll(By.css('.' + itemClass))[itemIndex];
            dropdownItem.triggerEventHandler('click', clickEvent);
            tick();
            fixture.detectChanges();
        }
        it('should append/remove selected items to the input in their selection order', fakeAsync(() => {
            let expectedOutput = 'Illinois';
            combo.selectItems(['Illinois']);
            tick();
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);

            expectedOutput += ', Mississippi';
            combo.selectItems(['Mississippi']);
            tick();
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);

            expectedOutput += ', Ohio';
            combo.selectItems(['Ohio']);
            tick();
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);

            expectedOutput += ', Arkansas';
            combo.selectItems(['Arkansas']);
            tick();
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);

            expectedOutput = 'Illinois, Mississippi, Arkansas';
            combo.deselectItems(['Ohio']);
            tick();
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);

            expectedOutput += ', Florida';
            combo.selectItems(['Florida'], false);
            tick();
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);

            expectedOutput = 'Mississippi, Arkansas, Florida';
            combo.deselectItems(['Illinois']);
            tick();
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);
        }));
        it('should dismiss all selected items by pressing clear button', fakeAsync(() => {
            const expectedOutput = 'Kentucky, Ohio, Indiana';
            combo.selectItems(['Kentucky', 'Ohio', 'Indiana']);
            tick();
            fixture.detectChanges();
            expect(input.nativeElement.value).toEqual(expectedOutput);
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.dropdown.items[1].selected).toBeTruthy();
            expect(combo.dropdown.items[4].selected).toBeTruthy();
            expect(combo.dropdown.items[6].selected).toBeTruthy();

            const clearBtn = fixture.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON));
            clearBtn.triggerEventHandler('click', clickEvent);
            tick();
            fixture.detectChanges();

            expect(input.nativeElement.value).toEqual('');
            expect(combo.selectedItems().length).toEqual(0);
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.dropdown.items[1].selected).toBeFalsy();
            expect(combo.dropdown.items[4].selected).toBeFalsy();
            expect(combo.dropdown.items[6].selected).toBeFalsy();
        }));
        it('should show/hide clear button after selecting/deselecting items', fakeAsync(() => {
            // This is a workaround for issue github.com/angular/angular/issues/14235
            // Expecting existing DebugElement toBeFalsy creates circular reference in Jasmine
            expect(fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_CLEARBUTTON)).length).toBeFalsy();

            // Open dropdown and select an item
            combo.selectItems(['Maryland']);
            tick();
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_CLEARBUTTON)).length).toEqual(1);

            combo.deselectItems(['Maryland']);
            tick();
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_CLEARBUTTON)).length).toEqual(0);

            combo.selectItems(['Oklahome']);
            tick();
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_CLEARBUTTON)).length).toEqual(1);

            combo.selectItems(['Wisconsin']);
            tick();
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_CLEARBUTTON)).length).toEqual(1);

            // Clear selected items
            fixture.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON)).triggerEventHandler('click', clickEvent);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_CLEARBUTTON)).length).toBeFalsy();
        }));
        it('should select/deselect item on check/uncheck', fakeAsync(() => {
            const dropdown = combo.dropdown;
            spyOn(combo.onSelectionChange, 'emit').and.callThrough();
            combo.toggle();
            tick();
            fixture.detectChanges();

            let selectedItem = dropdown.items[1];
            const eventParams: IComboSelectionChangeEventArgs = {
                oldSelection: [],
                newSelection: [selectedItem.value.field],
                added: [selectedItem.value.field],
                removed: [],
                event: clickEvent,
                cancel: false
            };
            simulateComboItemCheckboxClick(1);
            expect(combo.selectedItems()[0]).toEqual(selectedItem.value.field);
            expect(selectedItem.isSelected).toBeTruthy();
            expect(selectedItem.element.nativeElement.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
            expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(1);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledWith(eventParams);

            eventParams.oldSelection.push(selectedItem.value.field);
            selectedItem = dropdown.items[5];
            eventParams.newSelection.push(selectedItem.value.field);
            eventParams.added = [selectedItem.value.field];
            simulateComboItemCheckboxClick(5);
            expect(combo.selectedItems()[1]).toEqual(selectedItem.value.field);
            expect(selectedItem.isSelected).toBeTruthy();
            expect(selectedItem.element.nativeElement.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
            expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(2);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledWith(eventParams);

            // Unselecting an item
            selectedItem = dropdown.items[1];
            eventParams.oldSelection = [];
            eventParams.newSelection.pop();
            eventParams.added = [];
            eventParams.removed.push(selectedItem.value.field);
            simulateComboItemCheckboxClick(1);
            expect(combo.selectedItems().length).toEqual(1);
            expect(selectedItem.isSelected).toBeFalsy();
            expect(selectedItem.element.nativeElement.classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
            expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(3);
            // expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({
            //     oldSelection: ['Ohio', 'Alabama'],
            //     newSelection: ['Alabama'],
            //     removed: ['Ohio'],
            //     added: [],
            //     event: undefined,
            //     cancel: false
            // });
        }));
        it('should not be able to select group header', fakeAsync(() => {
            spyOn(combo.onSelectionChange, 'emit').and.callThrough();
            combo.toggle();
            tick();
            fixture.detectChanges();

            simulateComboItemCheckboxClick(0, true);
            expect(combo.selectedItems().length).toEqual(0);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(0);
        }));
        it('should add the items to the previously selection wen using the "selectItem" method ', fakeAsync(() => {
            const inputElement = fixture.debugElement.query(By.css('input[name=\'comboInput\']')).nativeElement;
            combo.toggle();
            tick();
            fixture.detectChanges();

            combo.selectItems(['Illinois', 'Mississippi', 'Ohio']);
            fixture.detectChanges();
            expect(combo.selectedItems()[0]).toEqual('Illinois');
            expect(combo.selectedItems()[1]).toEqual('Mississippi');
            expect(combo.selectedItems()[2]).toEqual('Ohio');

            let targetItem = combo.dropdown.items[2] as IgxComboItemComponent;
            combo.dropdown.selectItem(targetItem);
            tick();
            fixture.detectChanges();
            expect(targetItem.selected).toBeTruthy();
            expect(combo.selectedItems()[3]).toEqual('Wisconsin');
            expect(inputElement.value).toEqual('Illinois, Mississippi, Ohio, Wisconsin');

            targetItem = combo.dropdown.items[5] as IgxComboItemComponent;
            combo.dropdown.selectItem(targetItem);
            tick();
            fixture.detectChanges();
            expect(targetItem.selected).toBeTruthy();
            expect(combo.selectedItems()[4]).toEqual('Alabama');
            expect(inputElement.value).toEqual('Illinois, Mississippi, Ohio, Wisconsin, Alabama');
        }));
    });

    describe('Rendering tests: ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            input = fixture.debugElement.query(By.css('.' + CSS_CLASS_COMBO_INPUTGROUP));
        }));
        it('should apply all appropriate classes on combo initialization', () => {
            const comboWrapper = fixture.nativeElement.querySelector(CSS_CLASS_COMBO);
            expect(comboWrapper).not.toBeNull();
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-placeholder').nodeValue).toEqual('Location');
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-value-key').nodeValue).toEqual('field');
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-group-key').nodeValue).toEqual('region');
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-filterable')).toBeTruthy();
            expect(comboWrapper.childElementCount).toEqual(2); // Input Group + Dropdown
            expect(comboWrapper.attributes.getNamedItem('class').nodeValue).toEqual(CSS_CLASS_COMBO);
            expect(comboWrapper.attributes.getNamedItem('role').nodeValue).toEqual('combobox');
            expect(comboWrapper.attributes.getNamedItem('aria-haspopup').nodeValue).toEqual('listbox');
            expect(comboWrapper.attributes.getNamedItem('aria-expanded').nodeValue).toEqual('false');
            expect(comboWrapper.attributes.getNamedItem('aria-owns').nodeValue).toEqual(fixture.componentInstance.combo.dropdown.id);
            expect(comboWrapper.childElementCount).toEqual(2);

            const inputGroupElement = comboWrapper.children[0];
            expect(inputGroupElement.attributes.getNamedItem('ng-reflect-type').nodeValue).toEqual('box');
            expect(inputGroupElement.classList.contains(CSS_CLASS_INPUTGROUP)).toBeTruthy();
            expect(inputGroupElement.classList.contains('igx-input-group--box')).toBeTruthy();
            expect(inputGroupElement.classList.contains('igx-input-group--placeholder')).toBeTruthy();
            expect(inputGroupElement.childElementCount).toEqual(2);

            const inputGroupWrapper = inputGroupElement.children[0];
            expect(inputGroupWrapper.classList.contains(CSS_CLASS_INPUTGROUP_WRAPPER)).toBeTruthy();
            expect(inputGroupWrapper.childElementCount).toEqual(2);

            const inputGroupBundle = inputGroupWrapper.children[0];
            expect(inputGroupBundle.classList.contains(CSS_CLASS_INPUTGROUP_BUNDLE)).toBeTruthy();
            expect(inputGroupBundle.childElementCount).toEqual(2);

            const mainInputGroupBundle = inputGroupBundle.children[0];
            expect(mainInputGroupBundle.classList.contains(CSS_CLASS_INPUTGROUP_MAINBUNDLE)).toBeTruthy();
            expect(mainInputGroupBundle.childElementCount).toEqual(1);

            const inputElement = mainInputGroupBundle.children[0];
            expect(inputElement.classList.contains('igx-input-group__input')).toBeTruthy();
            expect(inputElement.attributes.getNamedItem('type').nodeValue).toEqual('text');

            const dropDownButton = inputGroupBundle.children[1];
            expect(dropDownButton.classList.contains(CSS_CLASS_DROPDOWNBUTTON)).toBeTruthy();
            expect(dropDownButton.childElementCount).toEqual(1);

            const inputGroupBorder = inputGroupWrapper.children[1];
            expect(inputGroupBorder.classList.contains(CSS_CLASS_INPUTGROUP_BORDER)).toBeTruthy();
            expect(inputGroupBorder.childElementCount).toEqual(0);

            const dropDownElement = comboWrapper.children[1];
            expect(dropDownElement.classList.contains(CSS_CLASS_COMBO_DROPDOWN)).toBeTruthy();
            expect(dropDownElement.classList.contains(CSS_CLASS_DROPDOWN)).toBeTruthy();
            expect(dropDownElement.childElementCount).toEqual(1);

            const dropDownList = dropDownElement.children[0];
            const dropDownScrollList = dropDownElement.children[0].children[0];
            expect(dropDownList.classList.contains(CSS_CLASS_DROPDOWNLIST)).toBeTruthy();
            expect(dropDownList.classList.contains('igx-toggle--hidden')).toBeTruthy();
            expect(dropDownScrollList.childElementCount).toEqual(0);
        });
        it('should render aria-expanded attribute properly', fakeAsync(() => {
            const comboContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_COMBO);
            expect(comboContainer.getAttribute('aria-expanded')).toMatch('false');
            combo.open();
            tick();
            fixture.detectChanges();
            expect(comboContainer.getAttribute('aria-expanded')).toMatch('true');
            combo.close();
            tick();
            fixture.detectChanges();
            expect(comboContainer.getAttribute('aria-expanded')).toMatch('false');
        }));
        it('should render placeholder values for inputs properly', fakeAsync(() => {
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.placeholder).toEqual('Location');
            expect(combo.comboInput.nativeElement.placeholder).toEqual('Location');

            expect(combo.searchPlaceholder).toEqual('Enter a Search Term');
            expect(combo.searchInput.nativeElement.placeholder).toEqual('Enter a Search Term');

            combo.searchPlaceholder = 'Filter';
            tick();
            fixture.detectChanges();
            expect(combo.searchPlaceholder).toEqual('Filter');
            expect(combo.searchInput.nativeElement.placeholder).toEqual('Filter');

            combo.placeholder = 'States';
            tick();
            fixture.detectChanges();
            expect(combo.placeholder).toEqual('States');
            expect(combo.comboInput.nativeElement.placeholder).toEqual('States');
        }));
        it('should render dropdown list and item height properly', fakeAsync(() => {
            // NOTE: Minimum itemHeight is 2 rem, per Material Design Guidelines (for mobile only)
            let itemHeight = defaultDropdownItemHeight;
            let itemMaxHeight = defaultDropdownItemMaxHeight;
            combo.toggle();
            tick();
            fixture.detectChanges();
            const dropdownItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM));
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT));

            const verifyDropdownItemHeight = function () {
                expect(combo.itemHeight).toEqual(itemHeight);
                expect(dropdownItems[0].nativeElement.clientHeight).toEqual(itemHeight);
                expect(combo.itemsMaxHeight).toEqual(itemMaxHeight);
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
        it('should render grouped items properly', (done) => {
            let dropdownContainer;
            let dropdownItems;
            let scrollIndex = 0;
            const headers: Array<string> = Array.from(new Set(combo.data.map(item => item.region)));
            combo.toggle();
            fixture.detectChanges();
            const checkGroupedItemsClass = function () {
                fixture.detectChanges();
                dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                dropdownItems = dropdownContainer.children;
                Array.from(dropdownItems).forEach(function (item) {
                    const itemElement = item as HTMLElement;
                    const itemText = itemElement.innerText.toString();
                    const expectedClass: string = headers.includes(itemText) ? CSS_CLASS_HEADERITEM : CSS_CLASS_DROPDOWNLISTITEM;
                    expect(itemElement.classList.contains(expectedClass)).toBeTruthy();
                });
                scrollIndex += 10;
                if (scrollIndex < combo.data.length) {
                    (combo as any).virtDir.scrollTo(scrollIndex);
                    (combo as any).virtDir.onChunkLoad.pipe(take(1)).subscribe(() => {
                        checkGroupedItemsClass();
                    });
                } else {
                    done();
                }
            };
            checkGroupedItemsClass();
        });
        it('should render selected items properly', fakeAsync(() => {
            combo.toggle();
            tick();
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            expect(dropdownItems[1].classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
            expect(dropdownItems[3].classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
            expect(dropdownItems[7].classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();

            combo.selectItems(['Illinois', 'Mississippi', 'Ohio']);
            fixture.detectChanges();
            expect(dropdownItems[1].classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
            expect(dropdownItems[3].classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
            expect(dropdownItems[7].classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();

            combo.deselectItems(['Ohio']);
            fixture.detectChanges();
            expect(dropdownItems[1].classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
        }));
        it('should render focused items properly', fakeAsync(() => {
            const dropdown = combo.dropdown;
            combo.toggle();
            tick();
            fixture.detectChanges();

            dropdown.navigateItem(2); // Componenent is virtualized, so this will focus the ACTUAL 3rd item
            fixture.detectChanges();

            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            const focusedItem_1 = dropdownItems[1];
            expect(focusedItem_1.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();

            // Change focus
            dropdown.navigateItem(6);
            fixture.detectChanges();
            const focusedItem_2 = dropdownItems[5];
            expect(focusedItem_2.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
            expect(focusedItem_1.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        }));
        it(`should not render search input if both 'allowCustomValues' and 'filterable' are false`, fakeAsync(() => {
            combo.allowCustomValues = false;
            combo.filterable = false;
            expect(combo.displaySearchInput).toBeFalsy();
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.searchInput).toBeFalsy();
        }));
    });

    describe('Positioning tests: ', () => {
        let containerElement: any;
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            containerElement = fixture.debugElement.query(By.css('.comboContainer')).nativeElement;
        }));
        it('should adjust combo width to the container element width when set to 100%', fakeAsync(() => {
            const containerWidth = 500;
            const comboWrapper = fixture.debugElement.query(By.css(CSS_CLASS_COMBO)).nativeElement;
            let containerElementWidth = containerElement.getBoundingClientRect().width;
            let wrapperWidth = comboWrapper.getBoundingClientRect().width;
            expect(containerElementWidth).toEqual(containerWidth);
            expect(containerElementWidth).toEqual(wrapperWidth);

            combo.toggle();
            tick();
            fixture.detectChanges();
            tick();
            const inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP_WRAPPER)).nativeElement;
            const dropDownElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
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

            let inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP_WRAPPER)).nativeElement;
            let dropDownElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
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
            inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP_WRAPPER)).nativeElement;
            dropDownElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
            containerElementWidth = containerElement.style.width;
            wrapperWidth = comboWrapper.style.width;
            inputWidth = inputElement.getBoundingClientRect().width + 'px';
            dropDownWidth = dropDownElement.getBoundingClientRect().width + 'px';
            expect(containerElementWidth).toEqual(containerWidth);
            expect(wrapperWidth).toEqual(comboWidth);
            expect(dropDownWidth).toEqual(comboWidth);
            expect(inputWidth).toEqual(comboWidth);
        }));
        it(`should properly display "Add Item" button when filtering is off`, fakeAsync(() => {
            combo.filterable = false;
            fixture.detectChanges();
            expect(combo.isAddButtonVisible()).toEqual(false);

            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(false);
            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            searchInput.nativeElement.value = combo.data[2];
            searchInput.triggerEventHandler('input', { target: searchInput.nativeElement });
            fixture.detectChanges();
            expect(combo.isAddButtonVisible()).toEqual(false);

            searchInput.nativeElement.value = combo.searchValue.substring(0, 2);
            searchInput.triggerEventHandler('input', { target: searchInput.nativeElement });
            fixture.detectChanges();
            expect(combo.isAddButtonVisible()).toEqual(true);
        }));
    });

    describe('Virtualization tests: ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
        }));
        it('should properly return a reference to the VirtScrollContainer', () => {
            expect(combo.dropdown.element).toBeDefined();
            const mockScroll = spyOnProperty<any>(combo.dropdown, 'scrollContainer', 'get').and.callThrough();
            function mockFunc() {
                return mockScroll();
            }
            expect(mockFunc).toThrow();
            combo.toggle();
            fixture.detectChanges();
            expect(combo.dropdown.element).toBeDefined();
            expect(mockFunc).toBeDefined();
        });
        xit('should restore position of dropdown scroll after opening', fakeAsync(() => {
            spyOn(combo.dropdown, 'onToggleOpening').and.callThrough();
            spyOn(combo.dropdown, 'onToggleOpened').and.callThrough();
            spyOn(combo.dropdown, 'onToggleClosing').and.callThrough();
            spyOn(combo.dropdown, 'onToggleClosed').and.callThrough();
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(false);
            expect(combo.dropdown.onToggleOpening).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.onToggleOpened).toHaveBeenCalledTimes(1);
            let vContainerScrollHeight = (combo as any).virtDir.getScroll().scrollHeight;
            expect((combo as any).virtDir.getScroll().scrollTop).toEqual(0);
            expect(vContainerScrollHeight).toBeGreaterThan(combo.itemHeight);
            (combo as any).virtDir.getScroll().scrollTop = Math.floor(vContainerScrollHeight / 2);
            tick();
            fixture.detectChanges();
            expect((combo as any).virtDir.getScroll().scrollTop).toBeGreaterThan(0);
            UIInteractions.simulateClickEvent(document.documentElement);
            tick();
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(true);
            expect(combo.dropdown.onToggleClosing).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.onToggleClosed).toHaveBeenCalledTimes(1);
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.collapsed).toEqual(false);
            expect(combo.dropdown.onToggleOpening).toHaveBeenCalledTimes(2);
            expect(combo.dropdown.onToggleOpened).toHaveBeenCalledTimes(2);
            vContainerScrollHeight = (combo as any).virtDir.getScroll().scrollHeight;
            expect((combo as any).virtDir.getScroll().scrollTop).toEqual(vContainerScrollHeight / 2);
        }));
        it('should display vertical scrollbar properly', fakeAsync(() => {
            combo.toggle();
            tick();
            fixture.detectChanges();
            const scrollbarContainer = fixture.debugElement
                .query(By.css('.' + CSS_CLASS_SCROLLBAR_VERTICAL))
                .nativeElement as HTMLElement;
            let hasScrollbar = scrollbarContainer.scrollHeight > scrollbarContainer.clientHeight;
            expect(hasScrollbar).toBeTruthy();

            combo.data = [{ field: 'Mid-Atlantic', region: 'New Jersey' }, { field: 'Mid-Atlantic', region: 'New York' }];
            fixture.detectChanges();

            combo.toggle();
            tick();
            fixture.detectChanges();
            hasScrollbar = scrollbarContainer.scrollHeight > scrollbarContainer.clientHeight;
            expect(hasScrollbar).toBeFalsy();
        }));
    });

    describe('Binding tests: ', () => {
        it('Should bind combo data to array of primitive data', () => {
            fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const data = [...fixture.componentInstance.citiesData];
            combo = fixture.componentInstance.combo;
            const comboData = combo.data;
            expect(comboData).toEqual(data);
        });
        it('Should bind combo data to array of objects', () => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            const data = [...fixture.componentInstance.items];
            combo = fixture.componentInstance.combo;
            const comboData = combo.data;
            expect(comboData).toEqual(data);
        });
        it('Should bind combo data to remote service data', (async () => {
            let productIndex = 0;
            fixture = TestBed.createComponent(IgxComboRemoteDataComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.instance;

            const verifyComboData = function () {
                fixture.detectChanges();
                let ind = (combo as any).virtDir.state.startIndex;
                for (let itemIndex = 0; itemIndex < 10; itemIndex++) {
                    expect(combo.data[itemIndex].id).toEqual(ind);
                    expect(combo.data[itemIndex].product).toEqual('Product ' + ind);
                    const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
                    const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                    expect(dropdownItems[itemIndex].innerText.trim()).toEqual('Product ' + ind);
                    ind++;
                }
            };

            combo.toggle();
            fixture.detectChanges();
            await wait(20);
            verifyComboData();
            expect((combo as any).virtDir.state.startIndex).toEqual(productIndex);
            await wait(10);

            productIndex = 42;
            (combo as any).virtDir.scrollTo(productIndex);
            fixture.detectChanges();
            await wait(20);
            verifyComboData();
            // index is at bottom
            expect((combo as any).virtDir.state.startIndex + (combo as any).virtDir.state.chunkSize - 1)
                .toEqual(productIndex);
            await wait(20);

            productIndex = 485;
            (combo as any).virtDir.scrollTo(productIndex);
            fixture.detectChanges();
            await wait(20);
            verifyComboData();
            // index is at bottom
            expect((combo as any).virtDir.state.startIndex + (combo as any).virtDir.state.chunkSize - 1)
                .toEqual(productIndex);
            await wait(20);

            productIndex = 873;
            (combo as any).virtDir.scrollTo(productIndex);
            fixture.detectChanges();
            await wait(20);
            verifyComboData();
            await wait(20);

            productIndex = 649;
            (combo as any).virtDir.scrollTo(productIndex);
            fixture.detectChanges();
            await wait(20);
            verifyComboData();
            await wait(20);
        }));
        it('Should bind combo data to remote service data and display items properly', (done) => {
            fixture = TestBed.createComponent(IgxComboRemoteDataComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.instance;
            let selectedItem, itemCheckbox, dropdownList, dropdownItems;

            combo.toggle();
            fixture.detectChanges();

            dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
            dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            selectedItem = dropdownItems[0];
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();

            expect(selectedItem.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
            combo.toggle();
            fixture.detectChanges();
            combo.toggle();
            fixture.detectChanges();

            expect(selectedItem.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
            selectedItem = dropdownItems[1];
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            selectedItem = dropdownItems[2];
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();

            let selItems = combo.selectedItems();
            const dataItems = combo.data;
            expect(selItems.length).toEqual(3);
            expect(selItems[0]).toEqual(dataItems[0][combo.valueKey]);
            expect(selItems[1]).toEqual(dataItems[1][combo.valueKey]);
            expect(selItems[2]).toEqual(dataItems[2][combo.valueKey]);

            setTimeout(() => {
                (combo as any).virtDir.scrollTo(20);
                fixture.detectChanges();
                setTimeout(() => {
                    (combo as any).virtDir.scrollTo(0);
                    fixture.detectChanges();
                    expect(selItems.length).toEqual(3);
                    expect(selItems[0]).toEqual(dataItems[0][combo.valueKey]);
                    expect(selItems[1]).toEqual(dataItems[1][combo.valueKey]);
                    expect(selItems[2]).toEqual(dataItems[2][combo.valueKey]);
                    setTimeout(() => {
                        selectedItem = dropdownItems[0];
                        itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
                        itemCheckbox.click();
                        fixture.detectChanges();
                        selItems = combo.selectedItems();
                        expect(selItems.length).toEqual(2);
                        expect(selItems[0]).toEqual(dataItems[1][combo.valueKey]);
                        expect(selItems[1]).toEqual(dataItems[2][combo.valueKey]);

                        selectedItem = dropdownItems[2];
                        itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
                        itemCheckbox.click();
                        fixture.detectChanges();
                        selItems = combo.selectedItems();
                        expect(selItems.length).toEqual(1);
                        expect(selItems[0]).toEqual(dataItems[1][combo.valueKey]);

                        combo.selectItems([dataItems[0][combo.valueKey]]);
                        fixture.detectChanges();
                        selItems = combo.selectedItems();
                        expect(selItems.length).toEqual(2);
                        expect(selItems[0]).toEqual(dataItems[1][combo.valueKey]);
                        expect(selItems[1]).toEqual(dataItems[0][combo.valueKey]);

                        combo.close();
                        fixture.detectChanges();
                        selItems = combo.selectedItems();
                        expect(selItems.length).toEqual(2);
                        expect(selItems[0]).toEqual(dataItems[1][combo.valueKey]);
                        expect(selItems[1]).toEqual(dataItems[0][combo.valueKey]);

                        done();
                    }, 200);
                }, 20);
            }, 10);
        });

        it('Should bind combo data to remote data and clear selection properly', async (done) => {
            fixture = TestBed.createComponent(IgxComboRemoteDataComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.instance;
            let selectedItems = [combo.data[0], combo.data[1]];
            const spyObj = jasmine.createSpyObj('event', ['stopPropagation']);
            combo.toggle();
            combo.selectItems([selectedItems[0][combo.valueKey], selectedItems[1][combo.valueKey]]);
            expect(combo.value).toEqual(`${selectedItems[0][combo.displayKey]}, ${selectedItems[1][combo.displayKey]}`);
            expect(combo.selectedItems()).toEqual([selectedItems[0][combo.valueKey], selectedItems[1][combo.valueKey]]);
            // Clear items while they are in view
            combo.handleClearItems(spyObj);
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.value).toBe('');
            selectedItems = [combo.data[2], combo.data[3]];
            combo.selectItems([selectedItems[0][combo.valueKey], selectedItems[1][combo.valueKey]]);
            expect(combo.value).toEqual(`${selectedItems[0][combo.displayKey]}, ${selectedItems[1][combo.displayKey]}`);

            // Scroll selected items out of view
            combo.virtualScrollContainer.scrollTo(40);
            await wait(60);
            fixture.detectChanges();
            combo.handleClearItems(spyObj);
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.value).toBe('');
            combo.selectItems([combo.data[7][combo.valueKey]]);
            expect(combo.value).toBe(combo.data[7][combo.displayKey]);
            done();
        });

        it('Should render empty template when combo data source is not set', fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboEmptyTestComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            combo.toggle();
            tick();
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
            const dropdownItemsContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT)).nativeElement;
            const dropDownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
            const listItems = dropDownContainer.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            expect(listItems.length).toEqual(0);
            expect(dropdownList.childElementCount).toEqual(3);
            // Expect no items to be rendered in the virtual container
            expect(dropdownItemsContainer.children[0].childElementCount).toEqual(0);
            // Expect the list child (NOT COMBO ITEM) to be a container with "The list is empty";
            const dropdownItem = dropdownList.lastElementChild as HTMLElement;
            expect(dropdownItem.firstElementChild.textContent).toEqual('The list is empty');
        }));
        it('Should bind combo data properly when changing data source runtime', () => {
            const newData = ['Item 1', 'Item 2'];
            fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const data = [...fixture.componentInstance.citiesData];
            combo = fixture.componentInstance.combo;
            expect(combo.data).toEqual(data);
            combo.data = newData;
            fixture.detectChanges();
            expect(combo.data).toEqual(newData);
        });
        it('Should properly bind to object value w/ valueKey', fakeAsync(() => {
            fixture = TestBed.createComponent(ComboModelBindingComponent);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            const component = fixture.componentInstance;
            combo = fixture.componentInstance.combo;
            expect(combo.selectedItems()).toEqual([combo.data[0][combo.valueKey], combo.data[2][combo.valueKey]]);
            combo.selectItems([combo.data[4][combo.valueKey]]);
            tick();
            fixture.detectChanges();
            expect(component.selection).toEqual([0, 2, 4]);
        }));

        it('Should properly bind to object value w/o valueKey', fakeAsync(() => {
            fixture = TestBed.createComponent(ComboModelBinding2Component);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            const component = fixture.componentInstance;
            combo = fixture.componentInstance.combo;
            expect(combo.selectedItems()).toEqual([combo.data[0], combo.data[2]]);
            combo.selectItems([combo.data[4]]);
            tick();
            fixture.detectChanges();
            expect(component.selectedItems).toEqual([combo.data[0], combo.data[2], combo.data[4]]);
        }));
    });

    describe('Grouping tests: ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            input = fixture.debugElement.query(By.css('.' + CSS_CLASS_COMBO_INPUTGROUP));
        }));
        it('should group items correctly', fakeAsync(() => {
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.groupKey).toEqual('region');
            expect(combo.dropdown.items[0].value.field === combo.data[0].field).toBeFalsy();
            const listItems = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM));
            const listHeaders = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_HEADERITEM));
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
            spyOnProperty(combo.dropdown, 'focusedItem', 'get').and.returnValue({ element: { nativeElement: mockObj } });
            (combo.dropdown.headers[0] as IgxComboItemComponent).clicked(null);
            fixture.detectChanges();
            expect(mockObj.focus).not.toHaveBeenCalled(); // Focus only if `allowItemFocus === true`

            combo.dropdown.items[0].clicked(null);
            fixture.detectChanges();
            expect(document.activeElement).toEqual(combo.searchInput.nativeElement);
        }));

        it('should properly add items to the defaultFallbackGroup', () => {
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
            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            searchInput.nativeElement.value = 'My Custom Item';
            searchInput.triggerEventHandler('input', { target: searchInput.nativeElement });
            fixture.detectChanges();
            expect(combo.data.length).toEqual(initialDataLength + 3);
            expect(combo.dropdown.items.length).toEqual(4); // Add Item button is included
            expect(combo.dropdown.headers.length).toEqual(1);
            expect(combo.dropdown.headers[0].element.nativeElement.innerText).toEqual(fallBackGroup);
        });
    });

    describe('Filtering tests: ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            input = fixture.debugElement.query(By.css('.' + CSS_CLASS_COMBO_INPUTGROUP));
        }));
        it('should properly get/set filteredData', () => {
            combo.toggle();
            fixture.detectChanges();
            const initialData = [...combo.filteredData];
            let firstFilter;
            expect(combo.searchValue).toEqual('');

            const filterSpy = spyOn(IgxComboFilteringPipe.prototype, 'transform').and.callThrough();
            combo.searchValue = 'New ';
            combo.handleInputChange();
            fixture.detectChanges();
            expect(filterSpy).toHaveBeenCalledTimes(1);
            expect(combo.filteredData.length).toBeLessThan(initialData.length);

            firstFilter = [...combo.filteredData];
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
            expect(filterSpy).toHaveBeenCalledTimes(3);
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
            expect(combo.selectedItems().length).toEqual(4);

            combo.selectAllItems(true);
            fixture.detectChanges();
            expect(combo.selectedItems().length).toEqual(51);

            combo.deselectAllItems();
            fixture.detectChanges();
            expect(combo.selectedItems().length).toEqual(47);

            combo.deselectAllItems(true);
            fixture.detectChanges();
            expect(combo.selectedItems().length).toEqual(0);
        });
        // it('Should properly handle addItemToCollection calls (Complex data)', fakeAsync(() => {
        //     const initialData = [...combo.data];
        //     expect(combo.searchValue).toEqual('');
        //     combo.addItemToCollection();
        //     fix.detectChanges();
        //     expect(initialData).toEqual(combo.data);
        //     expect(combo.data.length).toEqual(initialData.length);
        //     combo.searchValue = 'myItem';
        //     fix.detectChanges();
        //     spyOn(combo.onAddition, 'emit').and.callThrough();
        //     combo.addItemToCollection();
        //     fix.detectChanges();
        //     expect(initialData.length).toBeLessThan(combo.data.length);
        //     expect(combo.data.length).toEqual(initialData.length + 1);
        //     expect(combo.onAddition.emit).toHaveBeenCalledTimes(1);
        //     expect(combo.data[combo.data.length - 1]).toEqual({
        //         field: 'myItem',
        //         region: 'Other'
        //     });
        //     combo.onAddition.subscribe((e) => {
        //         e.addedItem.region = 'exampleRegion';
        //     });
        //     combo.searchValue = 'myItem2';
        //     fix.detectChanges();
        //     combo.addItemToCollection();
        //     fix.detectChanges();
        //     expect(initialData.length).toBeLessThan(combo.data.length);
        //     expect(combo.data.length).toEqual(initialData.length + 2);
        //     expect(combo.onAddition.emit).toHaveBeenCalledTimes(2);
        //     expect(combo.data[combo.data.length - 1]).toEqual({
        //         field: 'myItem2',
        //         region: 'exampleRegion'
        //     });
        //     combo.toggle();
        //     tick();
        //     fix.detectChanges();
        //     expect(combo.collapsed).toEqual(false);
        //     expect(combo.searchInput).toBeDefined();
        //     combo.searchValue = 'myItem3';
        //     combo.addItemToCollection();
        //     fix.detectChanges();
        //     expect(initialData.length).toBeLessThan(combo.data.length);
        //     expect(combo.data.length).toEqual(initialData.length + 3);
        //     expect(combo.onAddition.emit).toHaveBeenCalledTimes(3);
        //     expect(combo.data[combo.data.length - 1]).toEqual({
        //         field: 'myItem3',
        //         region: 'exampleRegion'
        //     });
        // }));
        // it('Should properly handle addItemToCollection calls (Primitive data)', () => {
        //     fixture = TestBed.createComponent(IgxComboTestComponent);
        //     fixture.detectChanges();
        //     combo = fixture.componentInstance.combo;
        //     const initialData = [...combo.data];
        //     expect(combo.searchValue).toEqual('');
        //     combo.addItemToCollection();
        //     fixture.detectChanges();
        //     expect(initialData).toEqual(combo.data);
        //     expect(combo.data.length).toEqual(initialData.length);
        //     combo.searchValue = 'myItem';
        //     fixture.detectChanges();
        //     spyOn(combo.onAddition, 'emit').and.callThrough();
        //     combo.addItemToCollection();
        //     fixture.detectChanges();
        //     expect(initialData.length).toBeLessThan(combo.data.length);
        //     expect(combo.data.length).toEqual(initialData.length + 1);
        //     expect(combo.onAddition.emit).toHaveBeenCalledTimes(1);
        //     expect(combo.data[combo.data.length - 1]).toEqual('myItem');
        // });
        xit('should filter the dropdown items when typing in the search input', fakeAsync(() => {
            let searchInputElement;
            let dropdownList;
            let dropdownItems;
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();

            const checkFilteredItems = function (listItems: HTMLElement[]) {
                listItems.forEach(function (el) {
                    const itemText: string = el.textContent.trim();
                    expect(expectedValues).toContain(itemText);
                });
            };

            const combo = fixture.componentInstance.combo;
            const expectedValues = combo.data.filter(data => data.includes('P'));
            combo.toggle();
            tick();
            fixture.detectChanges();
            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            searchInputElement = searchInput.nativeElement;

            const verifyFilteredItems = function (inputValue: string, expectedItemsNumber) {
                UIInteractions.sendInput(searchInput, inputValue, fixture);
                fixture.detectChanges();
                dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(dropdownItems.length).toEqual(expectedItemsNumber);
            };
            verifyFilteredItems('P', 5);

            verifyFilteredItems('Pa', 4);
            expectedValues.splice(1, 1);
            checkFilteredItems(dropdownItems);

            verifyFilteredItems('Pal', 2);
            expectedValues.splice(0, 1);
            expectedValues.splice(0, 1);
            checkFilteredItems(dropdownItems);

            UIInteractions.sendInput(searchInput, 'Pala', fixture);
            fixture.detectChanges();
            dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            expect(dropdownItems.length).toEqual(0);
        }));
        xit('should display empty list when the search query does not match any item', fakeAsync(() => {
            let searchInputElement;
            let dropdownList: HTMLElement;
            let dropDownContainer: HTMLElement;
            let listItems;
            combo.toggle();
            tick();
            fixture.detectChanges();
            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            searchInput.nativeElement.value = 'P';
            searchInput.triggerEventHandler('input', { target: searchInput.nativeElement });
            fixture.detectChanges();
            // const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            // searchInputElement = searchInput.nativeElement;
            // UIInteractions.sendInput(searchInput, 'P', fixture);
            // fixture.detectChanges();
            dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
            dropDownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
            listItems = dropDownContainer.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            expect(listItems.length).toEqual(3);
            expect(dropdownList.childElementCount).toEqual(5);

            searchInput.nativeElement.value = 'Pat';
            searchInput.triggerEventHandler('input', { target: searchInput.nativeElement });
            fixture.detectChanges();
            dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST_SCROLL)).nativeElement;
            dropDownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
            listItems = dropDownContainer.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
           // console.log(listItems);

            // UIInteractions.sendInput(searchInput, 'Pat', fixture);
            // fixture.detectChanges();
            // listItems = dropDownContainer.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            expect(listItems.length).toEqual(0);
            expect(dropdownList.childElementCount).toEqual(5);
            console.log(dropdownList);
            const dropdownItem = dropdownList.lastElementChild as HTMLElement;
            expect(dropdownItem.firstElementChild.textContent).toEqual('The list is empty');
        }));
        xit('Should fire onSearchInput event when typing in the search box ', fakeAsync(() => {
            let searchInputElement;
            let timesFired = 0;
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            spyOn(combo.onSearchInput, 'emit').and.callThrough();
            combo.toggle();
            tick();
            fixture.detectChanges();
            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            searchInputElement = searchInput.nativeElement;

            const verifyOnSearchInputEventIsFired = function (inputValue: string) {
                UIInteractions.sendInput(searchInput, inputValue, fixture);
                fixture.detectChanges();
                timesFired++;
                expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(timesFired);
            };

            verifyOnSearchInputEventIsFired('P');
            verifyOnSearchInputEventIsFired('Pa');
            verifyOnSearchInputEventIsFired('Pal');
            verifyOnSearchInputEventIsFired('Pala');
        }));
        xit('Should restore the initial combo dropdown list after clearing the search input', fakeAsync(() => {
            let searchInputElement;
            let dropdownList;
            let dropdownItems;
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            combo.toggle();
            tick();
            fixture.detectChanges();
            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            searchInputElement = searchInput.nativeElement;

            const verifyFilteredItems = function (inputValue: string,
                expectedDropdownItemsNumber: number,
                expectedFilteredItemsNumber: number) {
                UIInteractions.sendInput(searchInput, inputValue, fixture);
                fixture.detectChanges();
                dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(dropdownItems.length).toEqual(expectedDropdownItemsNumber);
                expect(combo.filteredData.length).toEqual(expectedFilteredItemsNumber);
            };

            verifyFilteredItems('P', 5, 5);
            verifyFilteredItems('Pa', 4, 4);
            verifyFilteredItems('P', 5, 5);
            combo.filteredData.forEach(function (item) {
                expect(combo.data).toContain(item);
            });
        }));
        xit('Should clear the search input and close the dropdown list on pressing ESC key', fakeAsync(() => {
            let searchInputElement;
            let dropdownList;
            let dropdownItems;

            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            combo.toggle();
            tick();
            fixture.detectChanges();

            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            searchInputElement = searchInput.nativeElement;
            UIInteractions.sendInput(searchInput, 'P', fixture);
            fixture.detectChanges();
            dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
            dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            expect(dropdownItems.length).toEqual(5);

            const event = new KeyboardEvent('keyup', { 'key': 'Escape' });
            searchInputElement.dispatchEvent(event);
            tick();
            fixture.detectChanges();
            expect(combo.collapsed).toBeTruthy();
            expect(searchInputElement.textContent).toEqual('');
        }));
        it('should not display group headers when no results are filtered for a group', () => {
            let dropdownList;
            const filteredItems: { [index: string]: any; } = combo.data.reduce(function (filteredArray, item) {
                if (item.field.toLowerCase().trim().includes('mi')) {
                    (filteredArray[item['region']] = filteredArray[item['region']] || []).push(item);
                }
                return filteredArray;
            }, {});
            combo.toggle();
            fixture.detectChanges();
            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            searchInput.nativeElement.value = 'Mi';
            searchInput.triggerEventHandler('input', { target: searchInput.nativeElement });
            fixture.detectChanges();
            dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
            const listHeaders: NodeListOf<HTMLElement> = dropdownList.querySelectorAll('.' + CSS_CLASS_HEADERITEM);
            expect(listHeaders.length).toEqual(Object.keys(filteredItems).length);
            const headers = Array.prototype.map.call(listHeaders, function (item) {
                return item.textContent.trim();
            });
            Object.keys(filteredItems).forEach(key => {
                expect(headers).toContain(key);
            });
        });
        it('should dismiss the input text when clear button is being pressed and custom values are enabled', () => {
            combo.toggle();
            fixture.detectChanges();
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.value).toEqual('');
            expect(combo.comboInput.nativeElement.value).toEqual('');

            combo.searchValue = 'New ';
            fixture.detectChanges();
            expect(combo.isAddButtonVisible()).toEqual(true);
            const addItemButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_ADDBUTTON));
            expect(addItemButton.nativeElement).toBeDefined();

            addItemButton.triggerEventHandler('click', clickEvent);
            fixture.detectChanges();
            expect(combo.selectedItems()).toEqual(['New']);
            expect(combo.comboInput.nativeElement.value).toEqual('New');

            const clearButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON));
            clearButton.triggerEventHandler('click', clickEvent);
            fixture.detectChanges();
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.comboInput.nativeElement.value).toEqual('');
        });
        it('should remove ADD button when search value matches an already selected item and custom values are enabled ', () => {
            combo.toggle();
            fixture.detectChanges();

            let addItemButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_ADDBUTTON));
            expect(addItemButton).toEqual(null);
            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            searchInput.nativeElement.value = 'New';
            searchInput.triggerEventHandler('input', { target: searchInput.nativeElement });
            fixture.detectChanges();
            expect(combo.searchValue).toEqual('New');
            addItemButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_ADDBUTTON));
            expect(addItemButton === null).toBeFalsy();

            searchInput.nativeElement.value = 'New York';
            searchInput.triggerEventHandler('input', { target: searchInput.nativeElement });
            fixture.detectChanges();
            expect(combo.searchValue).toEqual('New York');
            addItemButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_ADDBUTTON));
            expect(addItemButton).toEqual(null);
        });
        it(`should handle enter keydown on "Add Item" properly`, () => {
            combo.toggle();
            fixture.detectChanges();

            combo.searchValue = 'My New Custom Item';
            combo.handleInputChange();
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.value).toEqual('');
            expect(combo.isAddButtonVisible()).toBeTruthy();

            combo.handleKeyUp(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
            fixture.detectChanges();
            const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT));
            dropdownContent.triggerEventHandler('keydown', spaceKeydownEvent);
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.value).toEqual('');
            expect(combo.isAddButtonVisible()).toBeTruthy();

            dropdownContent.triggerEventHandler('keydown', enterKeydownEvent);
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.value).toEqual('My New Custom Item');
        });
        it(`should handle click on "Add Item" properly`, () => {
            combo.toggle();
            fixture.detectChanges();
            combo.searchValue = 'My New Custom Item';
            combo.handleInputChange();
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.value).toEqual('');
            expect(combo.isAddButtonVisible()).toBeTruthy();

            combo.handleKeyUp(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
            fixture.detectChanges();
            const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT));
            dropdownContent.triggerEventHandler('keydown', spaceKeydownEvent);
            fixture.detectChanges();
            // SPACE does not add item to collection
            expect(combo.collapsed).toBeFalsy();
            expect(combo.value).toEqual('');

            const focusedItem = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOCUSED));
            focusedItem.triggerEventHandler('click', clickEvent);
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.value).toEqual('My New Custom Item');
        });
        it('should enable/disable filtering at runtime', () => {
            combo.allowCustomValues = false;
            combo.open(); // Open combo - all data items are in filteredData
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toBeGreaterThan(0);

            const searchInput = fixture.debugElement.query(By.css('input[name=\'searchInput\']'));
            searchInput.nativeElement.value = 'Not-available item';
            searchInput.triggerEventHandler('input', { target: searchInput.nativeElement });
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toEqual(0); // No items are available because of filtering

            combo.close(); // Filter is cleared on close
            fixture.detectChanges();
            combo.filterable = false; // Filtering is disabled
            fixture.detectChanges();
            combo.open(); // All items are visible since filtering is disabled
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toBeGreaterThan(0); // All items are visible since filtering is disabled

            combo.searchValue = 'Not-available item';
            combo.handleInputChange();
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toBeGreaterThan(0); // All items are visible since filtering is disabled

            combo.close(); // Filter is cleared on close
            fixture.detectChanges();
            combo.filterable = true; // Filtering is re-enabled
            fixture.detectChanges();
            combo.open(); // Filter is cleared on open
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toBeGreaterThan(0);
        });
    });

    describe('Form control tests: ', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxComboFormComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
        }));
        it('Should properly initialize when used as a form control', fakeAsync(() => {
            expect(combo).toBeDefined();
            const comboFormReference = fixture.componentInstance.reactiveForm.controls.townCombo;
            expect(comboFormReference).toBeDefined();
            expect(combo.selectedItems()).toEqual(comboFormReference.value);
            expect(combo.selectedItems().length).toEqual(1);
            expect(combo.selectedItems()[0].field).toEqual('Connecticut');
            expect(combo.valid).toEqual(IgxComboState.INITIAL);
            expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
            const clearButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON)).nativeElement;
            UIInteractions.simulateClickEvent(clearButton);
            fixture.detectChanges();
            expect(combo.valid).toEqual(IgxComboState.INVALID);
            expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

            combo.onBlur();
            fixture.detectChanges();
            expect(combo.valid).toEqual(IgxComboState.INVALID);
            expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

            combo.selectItems([combo.dropdown.items[0], combo.dropdown.items[1]]);
            expect(combo.valid).toEqual(IgxComboState.VALID);
            expect(combo.comboInput.valid).toEqual(IgxInputState.VALID);

            combo.onBlur();
            fixture.detectChanges();
            expect(combo.valid).toEqual(IgxComboState.INITIAL);
            expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
        }));
        it('Should properly initialize when used as a form control - without validators', fakeAsync(() => {
            const form: FormGroup = fixture.componentInstance.reactiveForm;
            form.controls.townCombo.validator = null;
            expect(combo).toBeDefined();
            const comboFormReference = fixture.componentInstance.reactiveForm.controls.townCombo;
            expect(comboFormReference).toBeDefined();
            expect(combo.selectedItems()).toEqual(comboFormReference.value);
            expect(combo.selectedItems().length).toEqual(1);
            expect(combo.selectedItems()[0].field).toEqual('Connecticut');
            expect(combo.valid).toEqual(IgxComboState.INITIAL);
            expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
            const clearButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON)).nativeElement;
            UIInteractions.simulateClickEvent(clearButton);
            fixture.detectChanges();
            expect(combo.valid).toEqual(IgxComboState.INITIAL);
            expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);

            combo.onBlur();
            fixture.detectChanges();
            expect(combo.valid).toEqual(IgxComboState.INITIAL);
            expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);

            combo.selectItems([combo.dropdown.items[0], combo.dropdown.items[1]]);
            expect(combo.valid).toEqual(IgxComboState.INITIAL);
            expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);

            combo.onBlur();
            fixture.detectChanges();
            expect(combo.valid).toEqual(IgxComboState.INITIAL);
            expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
        }));

        it('Should be possible to be enabled/disabled when used as a form control', () => {
            expect(combo).toBeDefined();
            const form = fixture.componentInstance.reactiveForm;
            const comboFormReference = form.controls.townCombo;
            expect(comboFormReference).toBeDefined();
            expect(combo.disabled).toBeFalsy();
            expect(comboFormReference.disabled).toBeFalsy();
            spyOn(combo, 'onInputClick');
            spyOn(combo, 'setDisabledState').and.callThrough();
            combo.comboInput.nativeElement.click();
            fixture.detectChanges();
            expect(combo.onInputClick).toHaveBeenCalledTimes(1);
            combo.comboInput.nativeElement.blur();

            form.disable();
            // Disabling the form disables all of the controls in it
            fixture.detectChanges();
            expect(comboFormReference.disabled).toBeTruthy();
            expect(combo.disabled).toBeTruthy();
            expect(combo.setDisabledState).toHaveBeenCalledTimes(1);

            // Disabled form controls don't handle click events
            combo.comboInput.nativeElement.click();
            fixture.detectChanges();
            expect(combo.onInputClick).toHaveBeenCalledTimes(1);
            combo.comboInput.nativeElement.blur();

            // Can enabling the form re-enables all of the controls in it
            form.enable();
            fixture.detectChanges();
            expect(comboFormReference.disabled).toBeFalsy();
            expect(combo.disabled).toBeFalsy();
        });
        it('Should change value when addressed as a form control', () => {
            expect(combo).toBeDefined();
            const form = fixture.componentInstance.reactiveForm;
            const comboFormReference = form.controls.townCombo;
            expect(comboFormReference).toBeDefined();
            expect(combo.selectedItems()).toEqual(comboFormReference.value);

            // Form -> Combo
            comboFormReference.setValue([{ field: 'Missouri', region: 'West North Central' }]);
            fixture.detectChanges();
            expect(combo.selectedItems()).toEqual([{ field: 'Missouri', region: 'West North Central' }]);

            // Combo -> Form
            combo.selectItems([{ field: 'South Carolina', region: 'South Atlantic' }], true);
            fixture.detectChanges();
            expect(comboFormReference.value).toEqual([{ field: 'South Carolina', region: 'South Atlantic' }]);
        });
        it('Should properly submit values when used as a form control', () => {
            expect(combo).toBeDefined();
            const form = fixture.componentInstance.reactiveForm;
            const comboFormReference = form.controls.townCombo;
            expect(comboFormReference).toBeDefined();
            expect(combo.selectedItems()).toEqual(comboFormReference.value);
            expect(form.status).toEqual('INVALID');
            form.controls.password.setValue('TEST');
            form.controls.firstName.setValue('TEST');

            spyOn(console, 'log');
            fixture.detectChanges();
            expect(form.status).toEqual('VALID');
            fixture.debugElement.query(By.css('button')).nativeElement.click();
        });

        xit('Should properly bind to values when used as a form control without valueKey', fakeAsync(() => {
            fixture = TestBed.createComponent(SimpleBindComboComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            const data = fixture.componentInstance.items;
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(combo.selectedItems()).toEqual(fixture.componentInstance.comboSelectedItems);
            combo.selectItems([...data].splice(1, 3), true);
            fixture.detectChanges();
            expect(fixture.componentInstance.comboSelectedItems).toEqual([...data].splice(1, 3));
        }));

        xit('Should properly initialize when used in a Template form control', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboInTemplatedFormComponent);
            fix.detectChanges();
            tick();

            combo = fix.componentInstance.testCombo;
            expect(combo.valid).toEqual(IgxComboState.INITIAL);
            expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
            const inputGroupRequired = fix.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP_REQUIRED));
            expect(inputGroupRequired).toBeDefined();
            combo.onBlur();
            fix.detectChanges();
            tick();
            expect(combo.valid).toEqual(IgxComboState.INVALID);
            expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

            combo.selectAllItems();
            fix.detectChanges();
            tick();
            expect(combo.valid).toEqual(IgxComboState.VALID);
            expect(combo.comboInput.valid).toEqual(IgxInputState.VALID);

            const clearButton = fix.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON)).nativeElement;
            clearButton.click();
            fix.detectChanges();
            tick();
            expect(combo.valid).toEqual(IgxComboState.INVALID);
            expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);
        }));
    });

    describe('Combo - Display Density', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(DensityInputComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
        }));
        it('Should be able to set Display Density as input', fakeAsync(() => {
            expect(combo.displayDensity).toEqual(DisplayDensity.cosy);
            fixture.componentInstance.density = DisplayDensity.compact;
            tick();
            fixture.detectChanges();
            expect(combo.displayDensity).toEqual(DisplayDensity.compact);
            fixture.componentInstance.density = DisplayDensity.comfortable;
            tick();
            fixture.detectChanges();
            expect(combo.displayDensity).toEqual(DisplayDensity.comfortable);
        }));
        it('Should be able to get Display Density from DI engine', fakeAsync(() => {
            expect(combo.displayDensity).toEqual(DisplayDensity.cosy);
        }));
        it('Should apply correct styles to items and input when Display Density is set', fakeAsync(() => {
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toEqual(document.getElementsByClassName(CSS_CLASS_ITEM_COSY).length);
            expect(combo.dropdown.headers.length).toEqual(document.getElementsByClassName(CSS_CLASS_HEADER_COSY).length);
            expect(document.getElementsByClassName(CSS_CLASS_INPUT_COSY).length).toBe(2);
            fixture.componentInstance.density = DisplayDensity.compact;
            tick();
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toEqual(document.getElementsByClassName(CSS_CLASS_ITEM_COMPACT).length);
            expect(combo.dropdown.headers.length).toEqual(document.getElementsByClassName(CSS_CLASS_HEADER_COMPACT).length);
            expect(document.getElementsByClassName(CSS_CLASS_INPUT_COMPACT).length).toBe(2);
            fixture.componentInstance.density = DisplayDensity.comfortable;
            tick();
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toEqual(document.getElementsByClassName(CSS_CLASS_ITEM).length);
            expect(combo.dropdown.headers.length).toEqual(document.getElementsByClassName(CSS_CLASS_HEADER_ITEM).length);
            expect(document.getElementsByClassName(CSS_CLASS_INPUT_COMFORTABLE).length).toBe(2);
            expect(document.getElementsByClassName(CSS_CLASS_ITEM_COMPACT).length).toEqual(0);
            expect(document.getElementsByClassName(CSS_CLASS_ITEM_COSY).length).toEqual(0);
        }));
        it('Should scale items container depending on displayDensity (itemHeight * 10)', fakeAsync(() => {
            combo.toggle();
            tick();
            fixture.detectChanges();
            expect(combo.itemsMaxHeight).toEqual(320);
            fixture.componentInstance.density = DisplayDensity.compact;
            tick();
            fixture.detectChanges();
            expect(combo.itemsMaxHeight).toEqual(280);
            fixture.componentInstance.density = DisplayDensity.comfortable;
            tick();
            fixture.detectChanges();
            expect(combo.itemsMaxHeight).toEqual(400);
        }));
    });
});

@Component({
    template: `
<igx-combo #combo
[data]='citiesData'
[placeholder]="'Location'"
[filterable]='true' [width]="'400px'"
>
</igx-combo>
`
})
class IgxComboTestComponent {
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

@Component({
    template: `<igx-combo #combo [data]='citiesData'></igx-combo>`
})
class IgxComboTestDataComponent {
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
        'Palma de Mallorca'
    ];
    constructor() {
        let newArray = [];
        for (let i = 0; i < 100; i++) {
            newArray = newArray.concat(this.citiesData.map(item => item + ' ' + i));
        }
        this.citiesData = newArray;
    }
}

@Component({
    template: `
<igx-combo #combo
[data]='data'
[placeholder]="'Items'"
[filterable]='true'
>
</igx-combo>
`
})
class IgxComboScrollTestComponent {
    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;

    public data: string[] = [
        'Item 1',
        'Item 2',
        'Item 3'];

}

@Component({
    template: `
<igx-combo #combo [placeholder]="'Location'" [data]='items'
[filterable]='true' [valueKey]="'field'" [groupKey]="'region'" [width]="'400px'"
(onSelectionChange)="onSelectionChange($event)" [allowCustomValues]="true">
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
</igx-combo>
`
})
class IgxComboSampleComponent {

    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;

    public items = [];
    public initData = [];

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
            'Mountain': ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
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

    onSelectionChange(ev: IComboSelectionChangeEventArgs) {
    }
}

@Component({
    template: `
<p>Change data to:</p>
<label id="mockID">Combo Label</label>
<igx-combo #combo [placeholder]="'Location'" [data]='items'
[itemsMaxHeight]='400' [itemsWidth]="'399px'" [itemHeight]='40'
[filterable]='true' [valueKey]="'field'" [groupKey]="'region'" [width]="'400px'"
[ariaLabelledBy]="'mockID'">
</igx-combo>
`
})
class IgxComboInputTestComponent {

    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;

    public items = [];
    public initData = [];

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
            'South Atlantic 02': ['North Carolina', 'South Carolina', 'Virginia', 'District of Columbia', 'West Virginia'],
            'South Atlantic 03': ['District of Columbia', 'West Virginia'],
            'East South Central 01': ['Alabama', 'Kentucky'],
            'East South Central 02': ['Mississippi', 'Tennessee'],
            'West South Central': ['Arkansas', 'Louisiana', 'Oklahome', 'Texas'],
            'Mountain': ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
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
class="input-container" [filterable]="true" placeholder="Location(s)"
[data]="items" [displayKey]="'field'" [groupKey]="'region'"></igx-combo>
</p>
<p>
<button type="submit" [disabled]="!reactiveForm.valid">Submit</button>
</p>
</form>
`
})

class IgxComboFormComponent {
    @ViewChild('comboReactive', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public items = [];

    get valuesTemplate() {
        return this.combo.selectedItems();
    }
    set valuesTemplate(values: any[]) {
        this.combo.selectItems(values);
    }

    reactiveForm: FormGroup;

    constructor(fb: FormBuilder) {

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
            'Mountain': ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
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
            'firstName': new FormControl('', Validators.required),
            'password': ['', Validators.required],
            'townCombo': [[this.items[0]], Validators.required]
        });

    }
    onSubmitReactive() { }

    onSubmitTemplateBased() { }
}

@Component({
    template: `
    <form>
        <igx-combo #testCombo class="input-container" [placeholder]="'Locations'"
            name="anyName" required [(ngModel)]="values"
            [data]="items" [filterable]="filterableFlag"
            [displayKey]="'field'" [valueKey]="'field'"
            [groupKey]="'field' ? 'region' : ''" [width]="'100%'">
            <label igxLabel>Combo Label</label>
        </igx-combo>
</form>
`
})
class IgxComboInTemplatedFormComponent {
    @ViewChild('testCombo', { read: IgxComboComponent, static: true }) testCombo: IgxComboComponent;
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
            'Mountain': ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
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
        const fakeData = Observable.create(obs => {
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

@Component({
    template: `
<label id="mockID">Combo Label</label>
<igx-combo #combo [placeholder]="'Products'" [data]='items' [itemsMaxHeight]='400'
[itemHeight]='40' [valueKey]="'id'" [displayKey]="'product'" [width]="'400px'"
[ariaLabelledBy]="'mockID'">
</igx-combo>
`,
    providers: [LocalService]
})
export class IgxComboBindingTestComponent {

    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;

    public items = [];
    constructor(private localService: LocalService) {
        this.localService.getData().subscribe(
            (data) => {
                this.items = data;
            }
        );
    }
}

@Component({
    template: `
<label id="mockID">Combo Label</label>
<igx-combo #combo [itemsMaxHeight]='400'
[itemHeight]='40' [width]="'400px'">
</igx-combo>
`
})
export class IgxComboEmptyTestComponent {

    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
}

@Component({
    template: `
<div class="comboContainer" [style.width]="'500px'">
<igx-combo #combo placeholder="Location(s)"
[data]="citiesData"
[allowCustomValues]="true"
[filterable]="true">
>
</igx-combo>
</div>
`
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

// @Component({
//     template: `
// <div class="comboContainer" [style.width]="'500px'">
// <igx-combo #combo placeholder="Location(s)"
// [data]="citiesData"
// [filterable]="true">
// >
// </igx-combo>
// </div>
// `
// })
// class IgxComboInContainerFixedWidthComponent {
//     @ViewChild('combo', { read: IgxComboComponent, static: true })
//     public combo: IgxComboComponent;

//     public citiesData: string[] = [
//         'New York',
//         'Sofia',
//         'Istanbul',
//         'Paris',
//         'Hamburg',
//         'Berlin',
//         'London',
//         'Oslo',
//         'Los Angeles',
//         'Rome',
//         'Madrid',
//         'Ottawa',
//         'Prague',
//         'Padua',
//         'Palermo',
//         'Palma de Mallorca'];

// }

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
<igx-combo #combo [placeholder]="'Products'" [data]="data | async" (onDataPreLoad)="dataLoading($event)" [itemsMaxHeight]='400'
[itemHeight]='40' [valueKey]="'id'" [displayKey]="'product'" [width]="'400px'"
[ariaLabelledBy]="'mockID'">
</igx-combo>
`,
    providers: [RemoteDataService]
})
export class IgxComboRemoteDataComponent implements OnInit, AfterViewInit, OnDestroy {
    public data;
    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public instance: IgxComboComponent;
    constructor(private remoteDataService: RemoteDataService, public cdr: ChangeDetectorRef) { }
    public ngOnInit(): void {
        this.data = this.remoteDataService.records;
    }

    public ngAfterViewInit() {
        this.remoteDataService.getData(this.instance.virtualizationState, (count) => {
            this.instance.totalItemCount = count;
            this.cdr.detectChanges();
        });
    }

    dataLoading(evt) {
        this.remoteDataService.getData(evt, () => {
            this.cdr.detectChanges();
        });
    }

    ngOnDestroy() {
        this.cdr.detach();
    }
}

@Component({
    template: `<igx-combo [(ngModel)]="comboSelectedItems" [data]="items"></igx-combo>`
})
export class SimpleBindComboComponent implements OnInit {
    @ViewChild(IgxComboComponent, { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public items: any[];
    public comboSelectedItems: any[];

    ngOnInit() {
        this.items = ['One', 'Two', 'Three', 'Four', 'Five'];
        this.comboSelectedItems = ['One', 'Two'];
    }
}

@Component({
    template: `<igx-combo [(ngModel)]="selection" [valueKey]="valueKey" [data]="items"></igx-combo>`
})
export class ComboModelBindingComponent implements OnInit {
    @ViewChild(IgxComboComponent, { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public items: any[];
    public selection: any[];
    public valueKey = 'id';

    ngOnInit() {
        this.items = [{ text: 'One', id: 0 }, { text: 'Two', id: 1 }, { text: 'Three', id: 2 },
        { text: 'Four', id: 3 }, { text: 'Five', id: 4 }];
        this.selection = [0, 2];
    }
}

@Component({
    template: `<igx-combo [(ngModel)]="selectedItems" [data]="items"></igx-combo>`
})
export class ComboModelBinding2Component implements OnInit {
    @ViewChild(IgxComboComponent, { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public items: any[];
    public selectedItems: any[];

    ngOnInit() {
        this.items = [{ text: 'One', id: 0 }, { text: 'Two', id: 1 }, { text: 'Three', id: 2 },
        { text: 'Four', id: 3 }, { text: 'Five', id: 4 }];
        this.selectedItems = [this.items[0], this.items[2]];
    }
}


@Component({
    template: `
        <igx-combo #combo [data]="items" [displayDensity]="density" [displayKey]="'name'" [valueKey]="'value'">
        </igx-combo>
    `
})
class DensityInputComponent {
    public density = DisplayDensity.cosy;
    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public items = fiftyItems;
}

@Component({
    template: `
        <igx-combo #combo [data]="items" [displayKey]="'name'" [valueKey]="'value'">
        </igx-combo>
    `,
    providers: [{
        provide: DisplayDensityToken, useValue: DisplayDensity.cosy
    }]
})
class DensityParentComponent {
    @ViewChild('combo', { read: IgxComboComponent, static: true })
    public combo: IgxComboComponent;
    public items = fiftyItems;
}
