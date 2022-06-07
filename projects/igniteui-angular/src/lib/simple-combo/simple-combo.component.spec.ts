import { AfterViewInit, ChangeDetectorRef, Component, DebugElement, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxComboDropDownComponent } from '../combo/combo-dropdown.component';
import { IgxComboState } from '../combo/combo.common';
import { RemoteDataService } from '../combo/combo.component.spec';
import { IComboSelectionChangingEventArgs } from '../combo/public_api';
import { DisplayDensity } from '../core/displayDensity';
import { IgxSelectionAPIService } from '../core/selection';
import { IBaseCancelableBrowserEventArgs, PlatformUtil } from '../core/utils';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxIconComponent, IgxIconModule, IgxIconService } from '../icon/public_api';
import { IgxInputState } from '../input-group/public_api';
import { AbsoluteScrollStrategy, ConnectedPositioningStrategy } from '../services/public_api';
import { configureTestSuite } from '../test-utils/configure-suite';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { IgxSimpleComboComponent, IgxSimpleComboModule, ISimpleComboSelectionChangingEventArgs } from './public_api';


const CSS_CLASS_COMBO = 'igx-combo';
const SIMPLE_COMBO_ELEMENT = 'igx-simple-combo';
const CSS_CLASS_COMBO_DROPDOWN = 'igx-combo__drop-down';
const CSS_CLASS_DROPDOWN = 'igx-drop-down';
const CSS_CLASS_DROPDOWNLIST = 'igx-drop-down__list';
const CSS_CLASS_DROPDOWNLIST_SCROLL = 'igx-drop-down__list-scroll';
const CSS_CLASS_CONTENT = 'igx-combo__content';
const CSS_CLASS_CONTAINER = 'igx-display-container';
const CSS_CLASS_DROPDOWNLISTITEM = 'igx-drop-down__item';
const CSS_CLASS_TOGGLEBUTTON = 'igx-combo__toggle-button';
const CSS_CLASS_CLEARBUTTON = 'igx-combo__clear-button';
const CSS_CLASS_ADDBUTTON = 'igx-combo__add-item';
const CSS_CLASS_FOCUSED = 'igx-drop-down__item--focused';
const CSS_CLASS_INPUTGROUP = 'igx-input-group';
const CSS_CLASS_COMBO_INPUTGROUP = 'igx-input-group__input';
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

describe('IgxSimpleCombo', () => {
    let fixture: ComponentFixture<any>;
    let combo: IgxSimpleComboComponent;
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
        } = jasmine.createSpyObj('IgxSelectionAPIService', ['get', 'set', 'add_items', 'select_items']);
        const mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);
        const mockComboService = jasmine.createSpyObj('IgxComboAPIService', ['register']);
        const mockNgControl = jasmine.createSpyObj('NgControl', ['registerOnChangeCb', 'registerOnTouchedCb']);
        const mockInjector = jasmine.createSpyObj('Injector', {
            get: mockNgControl
        });
        mockSelection.get.and.returnValue(new Set([]));
        const mockIconService = new IgxIconService(null, null, null, null);
        const platformUtil = new PlatformUtil('browser');
        it('should properly call dropdown methods on toggle', () => {
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['open', 'close', 'toggle']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
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
        it('should call dropdown toggle with correct overlaySettings', () => {
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['toggle']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.dropdown = dropdown;
            const defaultSettings = (combo as any)._overlaySettings;
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
        it('should properly get/set displayKey', () => {
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.valueKey = 'field';
            expect(combo.displayKey).toEqual(combo.valueKey);
            combo.displayKey = 'region';
            expect(combo.displayKey).toEqual('region');
            expect(combo.displayKey === combo.valueKey).toBeFalsy();
        });
        it('should select items through select method', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            const comboInput = jasmine.createSpyObj('IgxInputDirective', ['value']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.comboInput = comboInput;
            combo.data = complexData;
            combo.valueKey = 'country'; // with valueKey
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);

            const selectedItems = [combo.data[0].country];
            combo.select('UK');
            expect(combo.selection).toEqual(selectedItems);
            combo.select('Germany');
            selectedItems.push(combo.data[2].country);
            selectedItems.shift();
            expect(combo.selection).toEqual(selectedItems);

            selectedItems.shift();
            combo.valueKey = null; // without valueKey
            selectedItems.push(combo.data[5]);
            combo.select(combo.data[5]);
            expect(combo.selection).toEqual(selectedItems);
            selectedItems.shift();
            selectedItems.push(combo.data[1]);
            combo.select(combo.data[1]);
            expect(combo.selection).toEqual(selectedItems);
        });
        it('should emit owner on `opening` and `closing`', () => {
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
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
            (combo as any).textSelection = { selected: false, trigger: () => { } };
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
        it('should fire selectionChanging event on item selection', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            const comboInput = jasmine.createSpyObj('IgxInputDirective', ['value']);
            comboInput.value = 'test';
            combo.comboInput = comboInput;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            spyOn(combo.selectionChanging, 'emit');

            let oldSelection;
            let newSelection = [combo.data[1]];

            combo.select(combo.data[1]);
            expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(1);
            expect(combo.selectionChanging.emit).toHaveBeenCalledWith({
                oldSelection,
                newSelection: newSelection[0],
                owner: combo,
                displayText: newSelection[0].trim(),
                cancel: false
            });

            oldSelection = [...newSelection];
            newSelection = [combo.data[0]];
            combo.select(combo.data[0]);
            expect(combo.selectionChanging.emit).toHaveBeenCalledTimes(2);
            expect(combo.selectionChanging.emit).toHaveBeenCalledWith({
                oldSelection: oldSelection[0],
                newSelection: newSelection[0],
                owner: combo,
                displayText: newSelection[0].trim(),
                cancel: false
            });
        });
        it('should properly emit added and removed values in change event on single value selection', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = complexData;
            combo.valueKey = 'country';
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            const selectionSpy = spyOn(combo.selectionChanging, 'emit');
            const expectedResults: ISimpleComboSelectionChangingEventArgs = {
                newSelection: combo.data[0][combo.valueKey],
                oldSelection: undefined,
                owner: combo,
                displayText: `${combo.data[0][combo.displayKey]}`,
                cancel: false
            };
            const comboInput = jasmine.createSpyObj('IgxInputDirective', ['value']);
            comboInput.value = 'test';
            combo.comboInput = comboInput;
            combo.select(combo.data[0][combo.valueKey]);
            expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
            Object.assign(expectedResults, {
                newSelection: undefined,
                oldSelection: combo.data[0][combo.valueKey],
                displayText: ''
            });
            combo.deselect();
            expect(selectionSpy).toHaveBeenCalledWith(expectedResults);
        });
        it('should properly handle selection manipulation through selectionChanging emit', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);
            spyOn(combo.selectionChanging, 'emit').and.callFake((event: IComboSelectionChangingEventArgs) => event.newSelection = []);
            const comboInput = jasmine.createSpyObj('IgxInputDirective', ['value']);
            combo.comboInput = comboInput;
            // No items are initially selected
            expect(combo.selection).toEqual([]);
            // Select the first item
            combo.select(combo.data[0]);
            // selectionChanging fires and overrides the selection to be [];
            expect(combo.selection).toEqual([]);
        });
        it('should not throw error when setting data to null', () => {
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
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
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
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
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem', 'navigateFirst']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            const matchSpy = spyOn<any>(combo, 'checkMatch').and.callThrough();
            spyOn(combo.searchInputUpdate, 'emit');
            const comboInput = jasmine.createSpyObj('IgxInputDirective', ['value']);
            comboInput.value = 'test';
            combo.comboInput = comboInput;

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

            combo.handleInputChange();
            expect(matchSpy).toHaveBeenCalledTimes(4);
            expect(combo.searchInputUpdate.emit).toHaveBeenCalledTimes(2);
        });
        it('should be able to cancel searchInputUpdate', () => {
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.searchInputUpdate.subscribe((e) => {
                e.cancel = true;
            });
            const matchSpy = spyOn<any>(combo, 'checkMatch').and.callThrough();
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem', 'collapsed', 'open', 'navigateFirst']);
            combo.dropdown = dropdown;
            spyOn(combo.searchInputUpdate, 'emit').and.callThrough();
            const comboInput = jasmine.createSpyObj('IgxInputDirective', ['value', 'focused']);
            comboInput.value = 'test';
            combo.comboInput = comboInput;

            combo.handleInputChange('Item1');
            expect(combo.searchInputUpdate.emit).toHaveBeenCalledTimes(1);
            expect(matchSpy).toHaveBeenCalledTimes(1);
        });
        it('should not open on click if combo is disabled', () => {
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, mockSelection as any, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['open', 'close', 'toggle']);
            const spyObj = jasmine.createSpyObj('event', ['stopPropagation', 'preventDefault']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            const comboInput = jasmine.createSpyObj('IgxInputDirective', ['value']);
            comboInput.value = 'test';
            combo.comboInput = comboInput;
            combo.ngOnInit();
            combo.dropdown = dropdown;
            dropdown.collapsed = true;

            combo.disabled = true;
            combo.onClick(spyObj);
            expect(combo.dropdown.collapsed).toBeTruthy();
        });
        it('should not clear value when combo is disabled', () => {
            const selectionService = new IgxSelectionAPIService();
            combo = new IgxSimpleComboComponent(elementRef, mockCdr, selectionService, mockComboService,
                mockIconService, platformUtil, null, null, mockInjector);
            const dropdown = jasmine.createSpyObj('IgxComboDropDownComponent', ['selectItem', 'focusedItem']);
            const spyObj = jasmine.createSpyObj('event', ['stopPropagation']);
            spyOn(mockIconService, 'addSvgIconFromText').and.returnValue(null);
            combo.ngOnInit();
            combo.data = data;
            combo.dropdown = dropdown;
            combo.disabled = true;
            const comboInput = jasmine.createSpyObj('IgxInputDirective', ['value', 'focus']);
            comboInput.value = 'test';
            combo.comboInput = comboInput;
            spyOnProperty(combo, 'totalItemCount').and.returnValue(combo.data.length);

            const item = combo.data.slice(0, 1);
            combo.select(item);
            combo.handleClear(spyObj);
            expect(combo.value).toEqual(item[0]);
        });
    });

    describe('Initialization and rendering tests: ', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxSimpleComboSampleComponent
                ],
                imports: [
                    IgxSimpleComboModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
        }));
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxSimpleComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            input = fixture.debugElement.query(By.css(`.${CSS_CLASS_COMBO_INPUTGROUP}`));
            tick();
            fixture.detectChanges();
        }));
        it('should initialize the combo component properly', () => {
            const toggleButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLEBUTTON));
            expect(fixture.componentInstance).toBeDefined();
            expect(combo).toBeDefined();
            expect(combo.collapsed).toBeDefined();
            expect(combo.collapsed).toBeTruthy();
            expect(input).toBeDefined();
            expect(toggleButton).toBeDefined();
            expect(combo.placeholder).toBeDefined();
        });
        it('should initialize input properties properly', () => {
            expect(combo.data).toBeDefined();
            expect(combo.valueKey).toEqual('field');
            expect(combo.displayKey).toEqual('field');
            expect(combo.groupKey).toEqual('region');
            expect(combo.width).toEqual('400px');
            expect(combo.itemsMaxHeight).toEqual(320);
            expect(combo.itemHeight).toEqual(32);
            expect(combo.placeholder).toEqual('Location');
            expect(combo.allowCustomValues).toEqual(false);
            expect(combo.cssClass).toEqual(CSS_CLASS_COMBO);
            expect(combo.type).toEqual('box');
            expect(combo.role).toEqual('combobox');
        });
        it('should apply all appropriate classes on combo initialization', () => {
            const comboWrapper = fixture.nativeElement.querySelector(SIMPLE_COMBO_ELEMENT);
            expect(comboWrapper).not.toBeNull();
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-placeholder').nodeValue).toEqual('Location');
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-value-key').nodeValue).toEqual('field');
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-group-key').nodeValue).toEqual('region');
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
            expect(inputGroupElement.childElementCount).toEqual(3);

            const inputGroupWrapper = inputGroupElement.children[0];
            expect(inputGroupWrapper.classList.contains(CSS_CLASS_INPUTGROUP_WRAPPER)).toBeTruthy();
            expect(inputGroupWrapper.childElementCount).toEqual(1);

            const inputGroupBundle = inputGroupWrapper.children[0];
            expect(inputGroupBundle.classList.contains(CSS_CLASS_INPUTGROUP_BUNDLE)).toBeTruthy();
            expect(inputGroupBundle.childElementCount).toEqual(2);

            const mainInputGroupBundle = inputGroupBundle.children[0];
            expect(mainInputGroupBundle.classList.contains(CSS_CLASS_INPUTGROUP_MAINBUNDLE)).toBeTruthy();
            expect(mainInputGroupBundle.childElementCount).toEqual(1);

            const dropDownButton = inputGroupBundle.children[1];
            expect(dropDownButton.classList.contains(CSS_CLASS_TOGGLEBUTTON)).toBeTruthy();
            expect(dropDownButton.childElementCount).toEqual(1);

            const inputGroupBorder = inputGroupElement.children[1];
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
        it('should render placeholder values for inputs properly', () => {
            combo.toggle();
            fixture.detectChanges();
            expect(combo.collapsed).toBeFalsy();
            expect(combo.placeholder).toEqual('Location');
            expect(combo.comboInput.nativeElement.placeholder).toEqual('Location');

            combo.placeholder = 'States';
            fixture.detectChanges();
            expect(combo.placeholder).toEqual('States');
            expect(combo.comboInput.nativeElement.placeholder).toEqual('States');
        });
        it('should render dropdown list and item height properly', fakeAsync(() => {
            // NOTE: Minimum itemHeight is 2 rem, per Material Design Guidelines (for mobile only)
            let itemHeight = defaultDropdownItemHeight;
            let itemMaxHeight = defaultDropdownItemMaxHeight;
            combo.displayDensity = DisplayDensity.comfortable;
            fixture.detectChanges();
            combo.toggle();
            tick();
            fixture.detectChanges();
            const dropdownItems = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`));
            const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));

            const verifyDropdownItemHeight = () => {
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
        it('should render focused items properly', () => {
            const dropdown = combo.dropdown;
            combo.toggle();
            fixture.detectChanges();

            dropdown.navigateItem(2); // Component is virtualized, so this will focus the ACTUAL 3rd item
            fixture.detectChanges();

            const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
            const focusedItem_1 = dropdownItems[1];
            expect(focusedItem_1.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();

            // Change focus
            dropdown.navigateItem(6);
            fixture.detectChanges();
            const focusedItem_2 = dropdownItems[5];
            expect(focusedItem_2.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
            expect(focusedItem_1.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        });
        it('should properly initialize templates', () => {
            expect(combo).toBeDefined();
            expect(combo.footerTemplate).toBeDefined();
            expect(combo.headerTemplate).toBeDefined();
            expect(combo.itemTemplate).toBeDefined();
            expect(combo.addItemTemplate).toBeUndefined();
            expect(combo.headerItemTemplate).toBeUndefined();
        });
        it('should properly render header and footer templates', () => {
            let headerElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_HEADER}`));
            let footerElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOOTER}`));
            expect(headerElement).toBeNull();
            expect(footerElement).toBeNull();
            combo.toggle();
            fixture.detectChanges();
            expect(combo.headerTemplate).toBeDefined();
            expect(combo.footerTemplate).toBeDefined();
            const dropdownList: HTMLElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
            headerElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_HEADER}`));
            footerElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOOTER}`));
            expect(headerElement).not.toBeNull();
            const headerHTMLElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_HEADER}`)).nativeElement;
            expect(headerHTMLElement.parentNode).toEqual(dropdownList);
            expect(headerHTMLElement.textContent).toEqual('This is a header');
            expect(footerElement).not.toBeNull();
            const footerHTMLElement = fixture.debugElement.query(By.css(`.${CSS_CLASS_FOOTER}`)).nativeElement;
            expect(footerHTMLElement.parentNode).toEqual(dropdownList);
            expect(footerHTMLElement.textContent).toEqual('This is a footer');
        });
    });

    describe('Binding tests: ', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxSimpleComboSampleComponent,
                    IgxComboInContainerTestComponent,
                    IgxComboRemoteDataComponent,
                    ComboModelBindingComponent
                ],
                imports: [
                    IgxSimpleComboModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
        }));
        it('should bind combo data to array of primitive data', () => {
            fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
            fixture.detectChanges();
            const data = [...fixture.componentInstance.citiesData];
            combo = fixture.componentInstance.combo;
            const comboData = combo.data;
            expect(comboData).toEqual(data);
        });
        it('should bind combo data to array of objects', () => {
            fixture = TestBed.createComponent(IgxSimpleComboSampleComponent);
            fixture.detectChanges();
            const data = [...fixture.componentInstance.items];
            combo = fixture.componentInstance.combo;
            const comboData = combo.data;
            expect(comboData).toEqual(data);
        });
        it('should render empty template when combo data source is not set', () => {
            fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            combo.data = [];
            fixture.detectChanges();
            combo.toggle();
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLIST_SCROLL}`)).nativeElement;
            const dropdownItemsContainer = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`)).nativeElement;
            const dropDownContainer = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
            const listItems = dropDownContainer.querySelectorAll(`.${CSS_CLASS_DROPDOWNLISTITEM}`);
            expect(listItems.length).toEqual(0);
            // Expect no items to be rendered in the virtual container
            expect(dropdownItemsContainer.children[0].childElementCount).toEqual(0);
            // Expect the list child (NOT COMBO ITEM) to be a container with "The list is empty";
            const dropdownItem = dropdownList.lastElementChild as HTMLElement;
            expect(dropdownItem.firstElementChild.textContent).toEqual('The list is empty');
        });
        it('should bind combo data properly when changing data source runtime', () => {
            const newData = ['Item 1', 'Item 2'];
            fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
            fixture.detectChanges();
            const data = [...fixture.componentInstance.citiesData];
            combo = fixture.componentInstance.combo;
            expect(combo.data).toEqual(data);
            combo.data = newData;
            fixture.detectChanges();
            expect(combo.data).toEqual(newData);
        });
        it('should properly bind to object value w/ valueKey', fakeAsync(() => {
            fixture = TestBed.createComponent(ComboModelBindingComponent);
            fixture.detectChanges();
            tick();
            const component = fixture.componentInstance;
            combo = fixture.componentInstance.combo;
            combo.valueKey = 'id';
            component.selectedItem = 1;
            fixture.detectChanges();
            tick();
            expect(combo.selection).toEqual([combo.data[1][combo.valueKey]]);
            combo.select(combo.data[4][combo.valueKey]);
            fixture.detectChanges();
            expect(component.selectedItem).toEqual(4);
        }));
        it('should properly bind to object value w/o valueKey', fakeAsync(() => {
            fixture = TestBed.createComponent(ComboModelBindingComponent);
            fixture.detectChanges();
            tick();
            const component = fixture.componentInstance;
            combo = fixture.componentInstance.combo;
            component.selectedItem = component.items[0];
            fixture.detectChanges();
            tick();
            expect(combo.selection).toEqual([combo.data[0]]);
            combo.select(combo.data[4]);
            fixture.detectChanges();
            expect(component.selectedItem).toEqual(combo.data[4]);
        }));

        it('should clear selection w/o valueKey', fakeAsync(() => {
            fixture = TestBed.createComponent(ComboModelBindingComponent);
            fixture.detectChanges();
            const component = fixture.componentInstance;
            combo = fixture.componentInstance.combo;
            component.items = ['One', 'Two', 'Three', 'Four', 'Five'];
            combo.select('Three');
            fixture.detectChanges();
            expect(combo.selection).toEqual(['Three']);
            combo.handleClear(new MouseEvent('click'));
            fixture.detectChanges();
            expect(combo.value).toEqual('');
        }));

        it('should properly bind to values w/o valueKey', fakeAsync(() => {
            fixture = TestBed.createComponent(ComboModelBindingComponent);
            fixture.detectChanges();
            const component = fixture.componentInstance;
            combo = fixture.componentInstance.combo;
            component.items = ['One', 'Two', 'Three', 'Four', 'Five'];
            component.selectedItem = 'One';
            fixture.detectChanges();
            tick();
            expect(combo.selection).toEqual([component.selectedItem]);
            combo.select('Three');
            fixture.detectChanges();
            expect(fixture.componentInstance.selectedItem).toEqual('Three');
        }));

        it('should bind combo data to remote data and clear selection properly', (async () => {
            fixture = TestBed.createComponent(IgxComboRemoteDataComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.instance;
            expect(combo).toBeDefined();
            expect(combo.valueKey).toBeDefined();
            let selectedItem = combo.data[1];
            const spyObj = jasmine.createSpyObj('event', ['stopPropagation']);
            combo.toggle();

            combo.select(combo.data[1][combo.valueKey]);
            expect(combo.value).toEqual(`${selectedItem[combo.displayKey]}`);
            expect(combo.selection).toEqual([selectedItem[combo.valueKey]]);
            // Clear items while they are in view
            combo.handleClear(spyObj);
            expect(combo.selection).toEqual([]);
            expect(combo.value).toBe('');
            selectedItem = combo.data[2];
            combo.select(combo.data[2][combo.valueKey]);
            expect(combo.value).toEqual(`${selectedItem[combo.displayKey]}`);

            // Scroll selected items out of view
            combo.virtualScrollContainer.scrollTo(40);
            await wait();
            fixture.detectChanges();
            combo.handleClear(spyObj);
            expect(combo.selection).toEqual([]);
            expect(combo.value).toBe('');
            combo.select(combo.data[7][combo.valueKey]);
            expect(combo.value).toBe(combo.data[7][combo.displayKey]);
        }));
    });

    describe('Keyboard navigation and interactions', () => {
        let dropdown: IgxComboDropDownComponent;
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxSimpleComboSampleComponent
                ],
                imports: [
                    IgxSimpleComboModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    IgxIconModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
        }));
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxSimpleComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            input = fixture.debugElement.query(By.css(`.${CSS_CLASS_COMBO_INPUTGROUP}`));
            dropdown = combo.dropdown;
            tick();
            fixture.detectChanges();
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
            expect(combo.open).toHaveBeenCalledTimes(1);

            combo.handleKeyDown(UIInteractions.getKeyboardEvent('keydown', 'ArrowUp'));
            tick();
            fixture.detectChanges();
            expect(combo.close).toHaveBeenCalledTimes(1);

            combo.handleKeyDown(UIInteractions.getKeyboardEvent('keydown', 'ArrowUp', true));
            fixture.detectChanges();
            tick();
            expect(combo.close).toHaveBeenCalledTimes(2);
        }));

        it('should select an item from the dropdown list with the Space key without closing it', () => {
            combo.open();
            fixture.detectChanges();

            const dropdownContent = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTENT}`));
            expect(dropdownContent).not.toBeFalsy();

            combo.handleKeyUp(UIInteractions.getKeyboardEvent('keyup', 'ArrowDown'));
            fixture.detectChanges();
            expect(dropdown.focusedItem).toBeTruthy();
            expect(dropdown.focusedItem.index).toEqual(1);

            spyOn(combo.closed, 'emit').and.callThrough();
            UIInteractions.triggerEventHandlerKeyDown('Space', dropdownContent);
            fixture.detectChanges();
            expect(combo.closed.emit).not.toHaveBeenCalled();
            expect(combo.selection.length).toEqual(1);
        });

        it('should clear the selection on tab/blur if the search text does not match any value', fakeAsync(() => {
            // allowCustomValues does not matter
            combo.select(combo.data[2][combo.valueKey]);
            fixture.detectChanges();
            expect(combo.selection.length).toBe(1);
            expect(input.nativeElement.value).toEqual('Massachusetts');

            UIInteractions.setInputElementValue(input.nativeElement, 'MassachusettsL');
            fixture.detectChanges();
            combo.onBlur();
            tick();
            fixture.detectChanges();
            expect(input.nativeElement.value.length).toEqual(0);
            expect(combo.selection.length).toEqual(0);
        }));

        it('should display the AddItem button when allowCustomValues is true and there is a partial match', fakeAsync(() => {
            fixture.componentInstance.allowCustomValues = true;
            fixture.detectChanges();
            combo.open();
            fixture.detectChanges();
            UIInteractions.setInputElementValue(input.nativeElement, 'Massachuset');
            fixture.detectChanges();

            expect(combo.isAddButtonVisible()).toBeTruthy();
            let addItemButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_ADDBUTTON}`));
            expect(addItemButton).not.toBeNull();

            // after adding the item, the addItem button should not be displayed (there is a full match)
            addItemButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();

            expect(combo.collapsed).toBeFalsy();
            expect(combo.data.findIndex(i => i.field === 'Massachuset')).not.toBe(-1);
            addItemButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_ADDBUTTON}`));
            expect(combo.isAddButtonVisible()).toBeFalsy();
            expect(addItemButton).toBeNull();
        }));

        it('should move the focus to the AddItem button with ArrowDown when allowCustomValues is true', fakeAsync(() => {
            fixture.componentInstance.allowCustomValues = true;
            fixture.detectChanges();
            UIInteractions.setInputElementValue(input.nativeElement, 'MassachusettsL');
            fixture.detectChanges();
            combo.open();
            fixture.detectChanges();
            const addItemButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_ADDBUTTON}`));
            expect(addItemButton).toBeDefined();

            input.nativeElement.focus();
            fixture.detectChanges();

            combo.onArrowDown(new Event('keydown'));
            fixture.detectChanges();
            expect(document.activeElement).toEqual(addItemButton.nativeElement);
        }));

        it('should close when an item is clicked on', () => {
            spyOn(combo, 'close').and.callThrough();
            combo.open();
            fixture.detectChanges();
            const item1 = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`));
            expect(item1).toBeDefined();

            item1.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();

            expect(combo.close).toHaveBeenCalledTimes(1);
        });

        it('should retain selection after blurring', () => {
            combo.open();
            fixture.detectChanges();
            const item1 = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`));
            expect(item1).toBeDefined();

            item1.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('Tab', input);
            fixture.detectChanges();

            expect(combo.selection.length).toBe(1);
        });

        it('should scroll to top when opened and there is no selection', () => {
            combo.deselect();
            fixture.detectChanges();

            spyOn(combo, 'onClick').and.callThrough();
            spyOn((combo as any).virtDir, 'scrollTo').and.callThrough();

            const toggleButton = fixture.debugElement.query(By.directive(IgxIconComponent));
            expect(toggleButton).toBeDefined();

            toggleButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();

            expect(combo.onClick).toHaveBeenCalledTimes(1);
            expect((combo as any).virtDir.scrollTo).toHaveBeenCalledWith(0);
        });

        it('should close the dropdown with Alt + ArrowUp', fakeAsync(() => {
            combo.open();
            fixture.detectChanges();
            spyOn(combo, 'close').and.callThrough();

            UIInteractions.triggerEventHandlerKeyDown('ArrowDown', input);
            tick();
            fixture.detectChanges();
            expect(document.activeElement).toHaveClass('igx-combo__content');

            UIInteractions.triggerEventHandlerKeyDown('ArrowUp', input, true, true);
            fixture.detectChanges();
            expect(combo.close).toHaveBeenCalledTimes(1);
        }));

        it('should select the first filtered item with Enter', () => {
            UIInteractions.simulateTyping('con', input);
            expect(combo.comboInput.value).toEqual('con');
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement);
            expect(document.activeElement).toHaveClass('igx-combo__content');

            UIInteractions.triggerKeyDownEvtUponElem('Enter', input.nativeElement);
            expect(input.nativeElement.value).toEqual('Wisconsin');
        });

        it('should clear selection when all text in input is removed by Backspace and Delete', () => {
            combo.select('Wisconsin');
            fixture.detectChanges();

            input.triggerEventHandler('focus', {});
            fixture.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('Backspace', input);
            fixture.detectChanges();
            expect(combo.selection.length).toEqual(0);

            input.triggerEventHandler('blur', {});
            fixture.detectChanges();

            combo.select('Wisconsin');
            fixture.detectChanges();

            input.triggerEventHandler('focus', {});
            fixture.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('Backspace', input);
            fixture.detectChanges();
            expect(combo.selection.length).toEqual(0);
        });

        it('should close the dropdown (if opened) when tabbing outside of the input', () => {
            combo.open();
            fixture.detectChanges();

            spyOn(combo, 'close').and.callThrough();

            UIInteractions.triggerEventHandlerKeyDown('Tab', input);
            fixture.detectChanges();
            expect(combo.close).toHaveBeenCalledTimes(1);
        });

        it('should clear the input on blur with a partial match', () => {
            spyOn(combo as any, 'clearSelection').and.callThrough();
            spyOn(combo.dropdown.closing, 'emit').and.callThrough();

            input.triggerEventHandler('focus', {});
            fixture.detectChanges();
            UIInteractions.simulateTyping('new', input);

            UIInteractions.triggerEventHandlerKeyDown('Tab', input);
            fixture.detectChanges();

            expect((combo as any).clearSelection).toHaveBeenCalledOnceWith(true);
            expect(combo.dropdown.closing.emit).toHaveBeenCalledTimes(1);
            expect(combo.value).toBeFalsy();
        });

        it('should empty and invalid item values', () => {
            combo.valueKey = 'key';
            combo.displayKey = 'value';
            combo.data = [
                { key: 1, value: null },
                { key: 2, value: 'val2' },
                { key: 3, value: '' },
                { key: 4, value: undefined },
            ];

            combo.open();
            fixture.detectChanges();
            const item1 = fixture.debugElement.query(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`));
            expect(item1).toBeDefined();

            item1.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
            expect(combo.value).toBe(null);

            combo.open();
            fixture.detectChanges();
            const item2 = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[1];
            expect(item2).toBeDefined();

            item2.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
            expect(combo.value).toBe('val2');

            combo.open();
            fixture.detectChanges();
            const item3 = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[2];
            expect(item3).toBeDefined();

            item3.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
            expect(combo.value).toBe('');

            combo.open();
            fixture.detectChanges();
            const item5 = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_DROPDOWNLISTITEM}`))[3];
            expect(item5).toBeDefined();

            item5.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
            expect(combo.value).toBe(undefined);
        });
    });

    describe('Display density', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxSimpleComboSampleComponent
                ],
                imports: [
                    IgxSimpleComboModule,
                    NoopAnimationsModule,
                    IgxToggleModule,
                    ReactiveFormsModule,
                    FormsModule
                ]
            }).compileComponents();
        }));
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxSimpleComboSampleComponent);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
        });
        it('Should be able to set Display Density as input', () => {
            expect(combo.displayDensity).toEqual(DisplayDensity.cosy);
            fixture.componentInstance.density = DisplayDensity.compact;
            fixture.detectChanges();
            expect(combo.displayDensity).toEqual(DisplayDensity.compact);
            fixture.componentInstance.density = DisplayDensity.comfortable;
            fixture.detectChanges();
            expect(combo.displayDensity).toEqual(DisplayDensity.comfortable);
        });
        it('should apply correct styles to items and input when Display Density is set', () => {
            combo.toggle();
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toEqual(document.getElementsByClassName(CSS_CLASS_ITEM_COSY).length);
            expect(combo.dropdown.headers.length).toEqual(document.getElementsByClassName(CSS_CLASS_HEADER_COSY).length);
            expect(document.getElementsByClassName(CSS_CLASS_INPUT_COSY).length).toBe(1);
            fixture.componentInstance.density = DisplayDensity.compact;
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toEqual(document.getElementsByClassName(CSS_CLASS_ITEM_COMPACT).length);
            expect(combo.dropdown.headers.length).toEqual(document.getElementsByClassName(CSS_CLASS_HEADER_COMPACT).length);
            expect(document.getElementsByClassName(CSS_CLASS_INPUT_COMPACT).length).toBe(1);
            fixture.componentInstance.density = DisplayDensity.comfortable;
            fixture.detectChanges();
            expect(combo.dropdown.items.length).toEqual(document.getElementsByClassName(CSS_CLASS_ITEM).length);
            expect(combo.dropdown.headers.length).toEqual(document.getElementsByClassName(CSS_CLASS_HEADER_ITEM).length);
            expect(document.getElementsByClassName(CSS_CLASS_INPUT_COMFORTABLE).length).toBe(1);
            expect(document.getElementsByClassName(CSS_CLASS_ITEM_COMPACT).length).toEqual(0);
            expect(document.getElementsByClassName(CSS_CLASS_ITEM_COSY).length).toEqual(0);
        });
        it('should scale items container depending on displayDensity (itemHeight * 10)', () => {
            combo.toggle();
            fixture.detectChanges();
            expect(combo.itemsMaxHeight).toEqual(320);
            fixture.componentInstance.density = DisplayDensity.compact;
            fixture.detectChanges();
            expect(combo.itemsMaxHeight).toEqual(280);
            fixture.componentInstance.density = DisplayDensity.comfortable;
            fixture.detectChanges();
            expect(combo.itemsMaxHeight).toEqual(400);
        });
    });

    describe('Form control tests: ', () => {
        describe('Template form tests: ', () => {
            let inputGroupRequired: DebugElement;
            configureTestSuite();
            beforeAll(waitForAsync(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        IgxSimpleComboInTemplatedFormComponent
                    ],
                    imports: [
                        IgxSimpleComboModule,
                        NoopAnimationsModule,
                        IgxToggleModule,
                        ReactiveFormsModule,
                        FormsModule
                    ]
                }).compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(IgxSimpleComboInTemplatedFormComponent);
                fixture.detectChanges();
                combo = fixture.componentInstance.testCombo;
                input = fixture.debugElement.query(By.css(`${CSS_CLASS_INPUTGROUP} input`));
                inputGroupRequired = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP_REQUIRED}`));
            }));
            it('should properly initialize when used in a template form control', () => {
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
                expect(inputGroupRequired).toBeDefined();
                combo.onBlur();
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INVALID);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

                input.triggerEventHandler('focus', {});
                combo.select('Wisconsin');
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.VALID);
                expect(combo.comboInput.valid).toEqual(IgxInputState.VALID);

                const clearButton = fixture.debugElement.query(By.css(`.${CSS_CLASS_CLEARBUTTON}`));
                clearButton.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INVALID);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);
            });
            it('should set validity to initial when the form is reset', fakeAsync(() => {
                combo.onBlur();
                fixture.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INVALID);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INVALID);

                fixture.componentInstance.form.resetForm();
                tick();
                expect(combo.valid).toEqual(IgxComboState.INITIAL);
                expect(combo.comboInput.valid).toEqual(IgxInputState.INITIAL);
            }));
        });
    });
});

@Component({
    template: `
<igx-simple-combo #combo [placeholder]="'Location'" [data]='items' [displayDensity]="density"
[valueKey]="'field'" [groupKey]="'region'" [width]="'400px'" (selectionChanging)="selectionChanging($event)"
[allowCustomValues]="allowCustomValues">
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
</igx-simple-combo>
`
})
class IgxSimpleComboSampleComponent {
    @ViewChild('combo', { read: IgxSimpleComboComponent, static: true })
    public combo: IgxSimpleComboComponent;
    public density: DisplayDensity = DisplayDensity.cosy;
    public allowCustomValues = false;

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
    template: `<igx-simple-combo [(ngModel)]="selectedItem" [data]="items"></igx-simple-combo>`
})
export class ComboModelBindingComponent implements OnInit {
    @ViewChild(IgxSimpleComboComponent, { read: IgxSimpleComboComponent, static: true })
    public combo: IgxSimpleComboComponent;
    public items: any[];
    public selectedItem: any;

    public ngOnInit() {
        this.items = [{ text: 'One', id: 0 }, { text: 'Two', id: 1 }, { text: 'Three', id: 2 },
        { text: 'Four', id: 3 }, { text: 'Five', id: 4 }];
    }
}

@Component({
    template: `
<div class="comboContainer" [style.width]="'500px'">
<igx-simple-combo #combo placeholder="Location(s)"
[data]="citiesData"
[allowCustomValues]="true">
>
</igx-simple-combo>
</div>
`
})
class IgxComboInContainerTestComponent {
    @ViewChild('combo', { read: IgxSimpleComboComponent, static: true })
    public combo: IgxSimpleComboComponent;

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
    providers: [RemoteDataService],
    template: `
    <label id="mockID">Combo Label</label>
    <igx-simple-combo #combo [placeholder]="'Products'" [data]="data | async" (dataPreLoad)="dataLoading($event)" [itemsMaxHeight]='400'
    [itemHeight]='40' [valueKey]="'id'" [displayKey]="'product'" [width]="'400px'"
    [ariaLabelledBy]="'mockID'">
    </igx-simple-combo>
    `
})
export class IgxComboRemoteDataComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('combo', { read: IgxSimpleComboComponent, static: true })
    public instance: IgxSimpleComboComponent;
    public data;
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
    template: `
    <form #form="ngForm">
        <igx-simple-combo #testCombo class="input-container" [placeholder]="'Locations'"
            name="anyName" required [(ngModel)]="values" [data]="items"
            [displayKey]="'field'" [valueKey]="'field'"
            [groupKey]="'field' ? 'region' : ''" [width]="'100%'">
            <label igxLabel>Combo Label</label>
        </igx-simple-combo>
</form>
`
})
class IgxSimpleComboInTemplatedFormComponent {
    @ViewChild('testCombo', { read: IgxSimpleComboComponent, static: true })
    public testCombo: IgxSimpleComboComponent;
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
