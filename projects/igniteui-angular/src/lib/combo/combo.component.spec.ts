import { Component, ContentChildren, DebugElement, Directive, ElementRef, ViewChild } from '@angular/core';
import { async, inject, TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSelectionAPIService } from '../core/selection';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxToggleActionDirective, IgxToggleDirective, IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxDropDownItemComponent } from '../drop-down/drop-down-item.component';
import {
    IgxDropDownBase, IgxDropDownComponent, IgxDropDownItemNavigationDirective, IgxDropDownModule
} from '../drop-down/drop-down.component';
import { IgxComboItemComponent } from './combo-item.component';
import { IgxComboComponent, IgxComboModule } from './combo.component';
import { VirtualHelperComponent } from '../directives/for-of/virtual.helper.component';

const CSS_CLASS_DROP_DOWN_BASE = 'igx-drop-down';
const CSS_CLASS_DROPDOWNLIST = 'igx-drop-down__list';
const CSS_CLASS_DROPDOWNLISTITEM = 'igx-drop-down__item';
const CSS_CLASS_DROPDOWNBUTTON = 'dropdownToggleButton';
const CSS_CLASS_CLEARBUTTON = 'clearButton';
const CSS_CLASS_CHECKBOX = 'igx-checkbox';
const CSS_CLASS_CHECKED = 'igx-checkbox--checked';
const CSS_CLASS_TOGGLE = 'igx-toggle';
const CSS_CLASS_SELECTED = 'igx-drop-down__item--selected';
const CSS_CLASS_HEADER = 'igx-drop-down__header';
const CSS_CLASS_SCROLLBAR = 'igx-vhelper__placeholder-content';

const employeeData = [
    { ID: 1, Name: 'Casey Houston', JobTitle: 'Vice President', HireDate: '2017-06-19T11:43:07.714Z' },
    { ID: 2, Name: 'Gilberto Todd', JobTitle: 'Director', HireDate: '2015-12-18T11:23:17.714Z' },
    { ID: 3, Name: 'Tanya Bennett', JobTitle: 'Director', HireDate: '2005-11-18T11:23:17.714Z' },
    { ID: 4, Name: 'Jack Simon', JobTitle: 'Software Developer', HireDate: '2008-12-18T11:23:17.714Z' },
    { ID: 5, Name: 'Celia Martinez', JobTitle: 'Senior Software Developer', HireDate: '2007-12-19T11:23:17.714Z' },
    { ID: 6, Name: 'Erma Walsh', JobTitle: 'CEO', HireDate: '2016-12-18T11:23:17.714Z' },
    { ID: 7, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', HireDate: '2005-11-19T11:23:17.714Z' },
    { ID: 8, Name: 'Erika Wells', JobTitle: 'Software Development Team Lead', HireDate: '2005-10-14T11:23:17.714Z' },
    { ID: 9, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', HireDate: '2013-10-10T11:23:17.714Z' },
    { ID: 10, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '2011-11-28T11:23:17.714Z' }
];

function wrapPromise(callback, resolve, time) {
    return new Promise((res, rej) => {
        return setTimeout(() => {
            callback();
            return res(resolve);
        }, time);
    });
}

fdescribe('Combo', () => {
    beforeEach(async(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [
                IgxComboTestComponent,
                IgxComboSampleComponent,
                IgxComboInputTestComponent,
                IgxComboScrollTestComponent
            ],
            imports: [
                IgxComboModule,
                NoopAnimationsModule,
                IgxToggleModule
            ]
        }).compileComponents();
    }));

    // General
    it('Should initialize the combo component properly', fakeAsync(() => {
        const fixture: ComponentFixture<IgxComboSampleComponent> = TestBed.createComponent(IgxComboSampleComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const comboButton = fixture.debugElement.query(By.css('button'));
        expect(fixture.componentInstance).toBeDefined();
        expect(combo).toBeDefined();
        expect(combo.dropdown.collapsed).toBeDefined();
        expect(combo.data).toBeDefined();
        expect(combo.dropdown.collapsed).toBeTruthy();
        expect(combo.searchInput).toBeUndefined();
        expect(comboButton).toBeDefined();
        expect(combo.placeholder).toBeDefined();
        combo.dropdown.toggle();
        tick();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(combo.dropdown.collapsed).toEqual(false);
            expect(combo.searchInput).toBeDefined();
            // expect(combo.searchInput).toEqual(comboButton);
        });
    }));

    // Unit tests
    it('Should properly initialize templates', () => {
        const fixture = TestBed.createComponent(IgxComboSampleComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        expect(combo).toBeDefined();
        expect(combo.dropdownFooter).toBeDefined();
        expect(combo.dropdownHeader).toBeDefined();
        expect(combo.dropdownItemTemplate).toBeDefined();
        // Next two templates are not passed in the sample
        expect(combo.addItemTemplate).toBeUndefined();
        expect(combo.headerItemTemplate).toBeUndefined();
    });

    it('Should properly accept input properties', () => {
        const fixture = TestBed.createComponent(IgxComboInputTestComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        expect(combo.width).toEqual('400px');
        expect(combo.placeholder).toEqual('Location');
        expect(combo.filterable).toEqual(true);
        expect(combo.height).toEqual('400px');
        expect(combo.listHeight).toEqual(400);
        expect(combo.listItemHeight).toEqual(40);
        expect(combo.groupKey).toEqual('region');
        expect(combo.valueKey).toEqual('field');
        expect(combo.data).toBeDefined();
        combo.width = '500px';
        expect(combo.width).toEqual('500px');
        combo.placeholder = 'Destination';
        expect(combo.placeholder).toEqual('Destination');
        combo.filterable = false;
        expect(combo.filterable).toEqual(false);
        combo.height = '500px';
        expect(combo.height).toEqual('500px');
        combo.listHeight = 500;
        expect(combo.listHeight).toEqual(500);
        combo.listItemHeight = 50;
        expect(combo.listItemHeight).toEqual(50);
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

    it('Should call toggle properly', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxComboSampleComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        spyOn(combo.dropdown, 'open').and.callThrough();
        spyOn(combo.dropdown, 'close').and.callThrough();
        spyOn(combo.dropdown, 'onToggleOpening').and.callThrough();
        spyOn(combo.dropdown, 'onToggleOpened').and.callThrough();
        spyOn(combo.dropdown, 'onToggleClosing').and.callThrough();
        spyOn(combo.dropdown, 'onToggleClosed').and.callThrough();
        spyOn<any>(combo, 'cdr').and.callThrough();
        expect(combo.dropdown.collapsed).toEqual(true);
        combo.dropdown.toggle();
        tick();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(combo.dropdown.open).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.onToggleOpening).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.onToggleOpened).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.collapsed).toEqual(false);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            // spyOnProperty(combo, 'collapsed', 'get').and.returnValue(false);
            combo.dropdown.toggle();
            tick();
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(combo.dropdown.close).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.onToggleClosed).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.onToggleClosing).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.collapsed).toEqual(true);
        });
    }));

    it(`Should properly select/deselect items`, fakeAsync(() => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        expect(combo.dropdown.items).toBeDefined();
        expect(combo.dropdown.items.length).toEqual(0);
        // items are only accessible when the combo dropdown is opened;
        let targetItem: IgxComboItemComponent;
        spyOn(combo, 'setSelectedItem').and.callThrough();
        spyOn(combo.dropdown, 'focusItem').and.callThrough();
        spyOn<any>(combo, 'triggerSelectionChange').and.callThrough();
        spyOn(combo.dropdown, 'selectedItem').and.callThrough();
        spyOn(combo.onSelection, 'emit');
        combo.dropdown.toggle();
        tick();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(combo.dropdown.collapsed).toEqual(false);
            expect(combo.dropdown.items.length).toEqual(9); // Virtualization
            targetItem = combo.dropdown.items[5] as IgxComboItemComponent;
            expect(targetItem).toBeDefined();
            expect(targetItem.index).toEqual(5);
            combo.dropdown.selectItem(targetItem);

            fix.detectChanges();
            expect(combo.dropdown.selectedItem).toEqual([targetItem.itemID]);
            expect(combo.setSelectedItem).toHaveBeenCalledTimes(1);
            expect(combo.setSelectedItem).toHaveBeenCalledWith(targetItem.itemID, true);
            // expect(combo.triggerSelectionChange).toHaveBeenCalledTimes(1);
            // expect(combo.triggerSelectionChange).toHaveBeenCalledWith([targetItem.itemID]);
            expect(combo.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(combo.onSelection.emit).toHaveBeenCalledWith({ oldSelection: [], newSelection: [targetItem.itemID] });

            combo.dropdown.selectItem(targetItem);
            expect(combo.dropdown.selectedItem).toEqual([]);
            expect(combo.setSelectedItem).toHaveBeenCalledTimes(2);
            expect(combo.setSelectedItem).toHaveBeenCalledWith(targetItem.itemID, true);
            // expect(combo.triggerSelectionChange).toHaveBeenCalledTimes(2);
            // expect(combo.triggerSelectionChange).toHaveBeenCalledWith([]);
            expect(combo.onSelection.emit).toHaveBeenCalledTimes(2);
            expect(combo.onSelection.emit).toHaveBeenCalledWith({ oldSelection: [targetItem.itemID], newSelection: [] });
        });
    }));

    it('Should properly select/deselect ALL items', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        expect(combo.dropdown.items).toBeDefined();
        expect(combo.dropdown.items.length).toEqual(0);
        // items are only accessible when the combo dropdown is opened;
        spyOn(combo, 'selectAllItems').and.callThrough();
        spyOn(combo, 'deselectAllItems').and.callThrough();
        spyOn(combo, 'handleSelectAll').and.callThrough();
        spyOn<any>(combo, 'triggerSelectionChange').and.callThrough();
        spyOn(combo.onSelection, 'emit');
        const selectionService = new IgxSelectionAPIService();
        combo.dropdown.toggle();
        tick();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(combo.dropdown.collapsed).toEqual(false);
            expect(combo.dropdown.items.length).toEqual(9); // Virtualization
            combo.handleSelectAll({ checked: true });

            fix.detectChanges();
            expect(combo.selectAllItems).toHaveBeenCalledTimes(1);
            expect(combo.deselectAllItems).toHaveBeenCalledTimes(0);
            expect(combo.onSelection.emit).toHaveBeenCalledTimes(1);

            combo.handleSelectAll({ checked: false });

            fix.detectChanges();
            expect(combo.selectAllItems).toHaveBeenCalledTimes(1);
            expect(combo.deselectAllItems).toHaveBeenCalledTimes(1);
            expect(combo.onSelection.emit).toHaveBeenCalledTimes(2);
        });
    }));

    it('Combo`s input textbox should be read-only', () => {
        const inputText = 'text';
        const fixture = TestBed.createComponent(IgxComboTestComponent);
        fixture.detectChanges();
        const comboElement = fixture.debugElement.query(By.css('input[name=\'comboInput\']'));
        const inputElement = comboElement.nativeElement;
        expect(comboElement.attributes['readonly']).toBeDefined();
        inputElement.value = inputText;
        inputElement.dispatchEvent(new Event('input'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('');
        });
    });

    it('Should properly handle getItemDataByValueKey calls', () => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        expect(combo.getItemDataByValueKey('Connecticut')).toEqual({ field: 'Connecticut', region: 'New England' });
        expect(combo.getItemDataByValueKey('')).toEqual(undefined);
        expect(combo.getItemDataByValueKey(null)).toEqual(undefined);
        expect(combo.getItemDataByValueKey(undefined)).toEqual(undefined);
        expect(combo.getItemDataByValueKey({ field: 'Connecticut', region: 'New England' })).toEqual(undefined);
        expect(combo.getItemDataByValueKey(1)).toEqual(undefined);
    });

    it('Should properly handle addItemToCollection calls (Complex data)', () => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        const dropdown = combo.dropdown;
        const initialData = [...combo.data];
        expect(combo.searchValue).toEqual('');
        combo.addItemToCollection();
        fix.detectChanges();
        expect(initialData).toEqual(combo.data);
        expect(combo.data.length).toEqual(initialData.length);
        combo.searchValue = 'myItem';
        fix.detectChanges();
        spyOn(combo.onAddition, 'emit').and.callThrough();
        combo.addItemToCollection();
        fix.detectChanges();
        expect(initialData.length).toBeLessThan(combo.data.length);
        expect(combo.data.length).toEqual(initialData.length + 1);
        expect(combo.onAddition.emit).toHaveBeenCalledTimes(1);
        expect(combo.data[combo.data.length - 1]).toEqual({
            field: 'myItem'
        });
        combo.onAddition.subscribe((e) => {
            e.addedItem.region = 'exampleRegion';
        });
        combo.searchValue = 'myItem2';
        fix.detectChanges();
        combo.addItemToCollection();
        fix.detectChanges();
        expect(initialData.length).toBeLessThan(combo.data.length);
        expect(combo.data.length).toEqual(initialData.length + 2);
        expect(combo.onAddition.emit).toHaveBeenCalledTimes(2);
        expect(combo.data[combo.data.length - 1]).toEqual({
            field: 'myItem2',
            region: 'exampleRegion'
        });
    });

    it('Should properly handle addItemToCollection calls (Primitive data)', () => {
        const fix = TestBed.createComponent(IgxComboTestComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        const dropdown = combo.dropdown;
        const initialData = [...combo.data];
        expect(combo.searchValue).toEqual('');
        combo.addItemToCollection();
        fix.detectChanges();
        expect(initialData).toEqual(combo.data);
        expect(combo.data.length).toEqual(initialData.length);
        combo.searchValue = 'myItem';
        fix.detectChanges();
        spyOn(combo.onAddition, 'emit').and.callThrough();
        combo.addItemToCollection();
        // tslint:disable-next-line:no-debugger
        debugger;
        fix.detectChanges();
        expect(initialData.length).toBeLessThan(combo.data.length);
        expect(combo.data.length).toEqual(initialData.length + 1);
        expect(combo.onAddition.emit).toHaveBeenCalledTimes(1);
        expect(combo.data[combo.data.length - 1]).toEqual('myItem');
    });

    it('Should handle setSelectedItem properly', () => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        const dropdown = combo.dropdown;
        spyOn(dropdown, 'setSelectedItem').and.callThrough();
        spyOn(combo, 'getItemDataByValueKey').and.callThrough();
        spyOn(combo.onSelection, 'emit').and.callThrough();
        combo.setSelectedItem(null);
        expect(combo.selectedItems).toEqual([]);
        dropdown.setSelectedItem(null);
        expect(combo.selectedItems).toEqual([]);
        dropdown.setSelectedItem(undefined);
        expect(combo.selectedItems).toEqual([]);
        combo.setSelectedItem(undefined);
        expect(combo.selectedItems).toEqual([]);
        dropdown.setSelectedItem({ field: 'Connecticut', region: 'New England' });
        expect(combo.selectedItems).toEqual([{ field: 'Connecticut', region: 'New England' }]);
        combo.deselectAllItems();
        expect(combo.selectedItems).toEqual([]);
        combo.setSelectedItem({ field: 'Connecticut', region: 'New England' });
        expect(combo.selectedItems).toEqual([{ field: 'Connecticut', region: 'New England' }]);
        combo.deselectAllItems();
        expect(combo.selectedItems).toEqual([]);
        dropdown.setSelectedItem('Connecticut');
        expect(combo.selectedItems).toEqual([{ field: 'Connecticut', region: 'New England' }]);
        combo.deselectAllItems();
        expect(combo.selectedItems).toEqual([]);
        dropdown.setSelectedItem('Connecticut', false);
        expect(combo.selectedItems).toEqual([]);
        combo.deselectAllItems();
        expect(combo.selectedItems).toEqual([]);
        dropdown.setSelectedItem({ field: 'Connecticut', region: 'New England' }, true);
        expect(combo.selectedItems).toEqual([{ field: 'Connecticut', region: 'New England' }]);
        spyOn(combo, 'setSelectedItem').and.callThrough();
        const selectionSpy = spyOn<any>(combo, 'triggerSelectionChange').and.callThrough();
        dropdown.setSelectedItem(combo.selectedItems[0], false);
        expect(combo.setSelectedItem).toHaveBeenCalledWith({ field: 'Connecticut', region: 'New England' }, false);
        expect(selectionSpy.calls.mostRecent().args).toEqual([[]]);
        expect(combo.selectedItems).toEqual([]);
        combo.setSelectedItem('Connecticut', true);
        expect(combo.selectedItems).toEqual([{ field: 'Connecticut', region: 'New England' }]);
        expect(combo.selectedItems[0]).toEqual({ field: 'Connecticut', region: 'New England' });
        combo.setSelectedItem('Connecticut', false);
        expect(combo.selectedItems).toEqual([]);
        combo.setSelectedItem('Connecticut', false);
        expect(combo.selectedItems).toEqual([]);
        expect(combo.getItemDataByValueKey).toHaveBeenCalledTimes(5);
        expect(combo.onSelection.emit).toHaveBeenCalledTimes(13);
    });

    it('Should properly return the selected item(s)', () => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        const dropdown = combo.dropdown;
        expect(combo.selectedItems).toEqual([]);
        expect(combo.dropdown.selectedItem).toEqual([]);
        combo.setSelectedItem('Connecticut');
        fix.detectChanges();
        expect(combo.dropdown.selectedItem).toEqual([{ field: 'Connecticut', region: 'New England' }]);
        expect(combo.dropdown.selectedItem[0]).toEqual(combo.data[0]);
    });

    it('Should handle handleKeyDown calls', () => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        spyOn(combo, 'selectAllItems');
        const dropdownSpy = jasmine.createSpyObj('element', { focus: () => { } });
        const dropdownElement = spyOnProperty(combo.dropdown, 'element', 'get').and.returnValues(dropdownSpy);
        combo.handleKeyDown({ key: 'A' });
        combo.handleKeyDown({});
        expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
        expect(dropdownSpy.focus).toHaveBeenCalledTimes(0);
        combo.handleKeyDown({ key: 'Enter' });
        expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
        spyOnProperty(combo, 'filteredData', 'get').and.returnValue([1]);
        combo.handleKeyDown({ key: 'Enter' });
        expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
        combo.handleKeyDown({ key: 'ArrowDown' });
        expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
        expect(dropdownSpy.focus).toHaveBeenCalledTimes(1);
        // combo.handleKeyDown({key: 'Down'});
        // expect(combo.selectAllItems).toHaveBeenCalledTimes(1);
        // expect(dropdownSpy.focus).toHaveBeenCalledTimes(2);
    });

    // it('Should properly return a reference to the VirtScrollContainer', () => {
    //     const fix = TestBed.createComponent(IgxComboSampleComponent);
    //     fix.detectChanges();
    //     const combo = fix.componentInstance.combo;
    //     expect(combo.dropdown.element).toBeDefined();
    //     function mockFunc() {
    //         return combo.dropdown.scrollContainer;
    //     }
    //     expect(mockFunc).toThrow();
    //     combo.dropdown.toggle();
    //     fix.detectChanges();
    //     expect(combo.dropdown.element).toBeDefined();
    //     expect(mockFunc).toBeDefined();
    // });

    it('Should properly get/set textKey', () => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        expect(combo.textKey).toEqual(combo.valueKey);
        combo.textKey = 'region';
        expect(combo.textKey).toEqual('region');
        expect(combo.textKey === combo.valueKey).toBeFalsy();
    });

    it('IgxComboDropDown onFocus and onBlur event', () => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const dropdown = fix.componentInstance.combo.dropdown;
        expect(dropdown.focusedItem).toEqual(null);
        expect(dropdown.items.length).toBeFalsy();
        dropdown.toggle();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(dropdown.items).toBeDefined();
            expect(dropdown.items.length).toBeTruthy();
            dropdown.onFocus();
            expect(dropdown.focusedItem).toEqual(dropdown.items[0]);
            expect(dropdown.focusedItem.isFocused).toEqual(true);
            dropdown.onFocus();
            dropdown.onBlur();
            expect(dropdown.focusedItem).toEqual(null);
            dropdown.onBlur();
        });
    });

    it('IgxComboDropDown focusedItem getter/setter', () => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const dropdown = fix.componentInstance.combo.dropdown;
        expect(dropdown.focusedItem).toEqual(null);
        dropdown.toggle();
        fix.detectChanges();
        expect(dropdown.focusedItem).toEqual(null);
        dropdown.onFocus();
        expect(dropdown.focusedItem).toEqual(dropdown.items[0]);
    });

    xit('Should properly accept width', () => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        expect(combo.width).toEqual('400px');
    });

    // Rendering
    it('All appropriate classes should be applied on combo initialization', () => {
        // TO DO
    });

    it('Should properly render grouped items', () => {
        const fix = TestBed.createComponent(IgxComboInputTestComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        combo.dropdown.toggle();
        fix.whenStable().then(() => {
            fix.detectChanges();
            const dropdown = combo.dropdown.element;
            checkGroupedItemsClass(0, 5, dropdown);
            checkGroupedItemsClass(6, 10, dropdown);
            // TO DO
            // Navigate down and check the rest of the items
        });

        const checkGroupedItemsClass = function (startIndex: number, endIndex: number, dropdown: any) {
            expect(dropdown.items[startIndex].classList.contains(CSS_CLASS_HEADER)).toBeTruthy();
            for (let index = startIndex + 1; index <= endIndex; index++) {
                expect(dropdown.items[index].classList.contains(CSS_CLASS_DROPDOWNLISTITEM)).toBeTruthy();
            }
        };
    });
    it('Should properly render selected items', () => {
        let selectedItem: HTMLElement;
        let itemCheckbox: HTMLElement;
        const fixture = TestBed.createComponent(IgxComboTestComponent);
        fixture.detectChanges();
        const dropDownButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
        dropDownButton.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            selectedItem = dropdownItems[4];
            expect(selectedItem.classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            expect(selectedItem.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
            selectedItem = dropdownItems[8];
            expect(selectedItem.classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            expect(selectedItem.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
            selectedItem = dropdownItems[0];
            expect(selectedItem.classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            expect(selectedItem.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
        });
    });
    it('Combo focused items rendering', () => {
        // TO DO
    });

    // Binding
    it('Combo data binding - array of primitive data', () => {
        // TO DO
    });
    it('Combo data binding - array of objects', () => {
        // TO DO
    });
    it('Combo data binding - remote service', () => {
        // TO DO
    });
    it('Combo data binding - asynchronous pipe', () => {
        // TO DO
    });
    it('Combo data binding - streaming of data', () => {
        // TO DO
    });
    it('The empty template should be rendered When combo data source is not set', () => {
        // TO DO
    });
    it('Combo data binding - change data source runtime', () => {
        // TO DO
    });

    // Dropdown
    it('Dropdown button should open/close dropdown list', () => {
        const fixture = TestBed.createComponent(IgxComboTestComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const comboButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
        comboButton.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(combo.dropdown.collapsed).toEqual(false);
            const searchInputElement = fixture.debugElement.query(By.css('input[name=\'searchInput\']')).nativeElement;
            expect(searchInputElement).toBeDefined();
            // const selectAllCheckboxElement = fixture.debugElement.query(By.css('#igx-checkbox')).nativeElement;
            // expect(selectAllCheckboxElement).toBeDefined();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
            expect(dropdownList.classList.contains(CSS_CLASS_TOGGLE)).toBeTruthy();
            const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            expect(dropdownItems.length).toEqual(11);
            comboButton.click();
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(combo.dropdown.collapsed).toEqual(true);
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
            expect(dropdownList.classList.contains(CSS_CLASS_TOGGLE + '--hidden')).toBeTruthy();
            expect(dropdownList.children.length).toEqual(0);
        });
    });

    it('Search input should be focused when dropdown is opened', () => {
        let isFocused = false;
        const fixture = TestBed.createComponent(IgxComboTestComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const comboButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
        comboButton.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const searchInputElement: HTMLElement = fixture.debugElement.query(By.css('input[name=\'searchInput\']')).nativeElement;
            isFocused = (document.activeElement === searchInputElement);
            return fixture.whenStable();
        }).then(() => {
            expect(isFocused).toEqual(true);
        });
    });

    it('Dropdown list open/close - key navigation', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxComboTestComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        const comboInput = combo.comboInput.nativeElement as HTMLElement;
        expect(comboInput).toBeDefined();
        spyOn(combo, 'onArrowDown').and.callThrough();
        spyOn(combo, 'onArrowUp').and.callThrough();
        spyOn(combo.dropdown, 'toggle').and.callThrough();
        spyOn(combo.dropdown, 'open').and.callThrough();
        spyOn(combo.dropdown, 'close').and.callThrough();
        combo.onArrowDown(new KeyboardEvent('keydown', { altKey: false, key: 'ArrowDown' }));
        tick();
        fix.whenStable().then(() => {
            fix.detectChanges();

            expect(combo.dropdown.toggle).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.open).toHaveBeenCalledTimes(1);
            combo.onArrowDown(new KeyboardEvent('keydown', { altKey: true, key: 'ArrowDown' }));

            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            expect(combo.dropdown.toggle).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.collapsed).toEqual(false);
            expect(combo.dropdown.open).toHaveBeenCalledTimes(1);
            // expect(document.activeElement).toEqual(combo.searchInput.nativeElement);

            combo.onArrowUp(new KeyboardEvent('keydown', { altKey: false, key: 'ArrowUp' }));
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();

            expect(combo.dropdown.toggle).toHaveBeenCalledTimes(2);
            expect(combo.dropdown.close).toHaveBeenCalledTimes(1);
            // expect(document.activeElement).toEqual(combo.searchInput.nativeElement);

            combo.onArrowUp(new KeyboardEvent('keydown', { altKey: true, key: 'ArrowUp' }));
            return fix.whenStable();
        }).then(() => {

            fix.detectChanges();
            expect(combo.dropdown.toggle).toHaveBeenCalledTimes(3);
            expect(combo.dropdown.close).toHaveBeenCalledTimes(2);
            // expect(document.activeElement).toEqual(combo.comboInput.nativeElement);
        });
    }));

    it('Dropdown button should fire dropdown opening/closing events', fakeAsync(() => {
        let onOpeningEventFired = false;
        let onOpenedEventFired = false;
        let onClosingEventFired = false;
        let onClosedEventFired = false;
        const fixture = TestBed.createComponent(IgxComboTestComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const dropdown = combo.dropdown;
        spyOn(dropdown.onOpened, 'emit').and.callThrough();
        spyOn(dropdown.onOpening, 'emit').and.callThrough();
        spyOn(dropdown.onClosed, 'emit').and.callThrough();
        spyOn(dropdown.onClosing, 'emit').and.callThrough();
        spyOn(combo, 'onInputFocus').and.callThrough();
        spyOn(combo, 'onInputClick').and.callThrough();
        const mockObj = jasmine.createSpyObj('mockEvt', ['stopPropagation', 'preventDefault']);
        dropdown.onOpening.subscribe(() => onOpeningEventFired = true);
        dropdown.onOpened.subscribe(() => onOpenedEventFired = true);
        dropdown.onClosing.subscribe(() => onClosingEventFired = true);
        dropdown.onClosed.subscribe(() => onClosedEventFired = true);
        const comboButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
        expect(comboButton).toBeDefined();
        comboButton.click();
        tick();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(dropdown.collapsed).toEqual(false);
            expect(combo.onInputClick).toHaveBeenCalledTimes(1);
            expect(dropdown.onOpened.emit).toHaveBeenCalledTimes(1);
            expect(dropdown.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(dropdown.onClosing.emit).toHaveBeenCalledTimes(0);
            expect(dropdown.onClosed.emit).toHaveBeenCalledTimes(0);
            expect(onOpeningEventFired).toEqual(true);
            expect(onOpenedEventFired).toEqual(true);
            comboButton.click();
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expect(combo.onInputFocus).toHaveBeenCalledTimes(0);
            expect(combo.onInputClick).toHaveBeenCalledTimes(2);
            expect(dropdown.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(dropdown.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(onClosingEventFired).toEqual(true);
            expect(onClosedEventFired).toEqual(true);
        });
    }));
    it('Item selection - key navigation', () => {
        const fixture = TestBed.createComponent(IgxComboSampleComponent);
        fixture.detectChanges();
        const mockObj = jasmine.createSpyObj('mockEvt', ['stopPropagation', 'preventDefault']);
        const combo = fixture.componentInstance.combo;
        const dropdown = combo.dropdown;
        const comboButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
        comboButton.click();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            const items = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM));
            const lastVisibleItem = items[items.length - 2];
            lastVisibleItem.nativeElement.click();
            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {
            const items = fixture.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM));
            const lastVisibleItem = items[items.length - 1];
            lastVisibleItem.triggerEventHandler('keydown.ArrowDown', mockObj);
            fixture.detectChanges();
        });
    });
    it('Home key should scroll up to the first item in the dropdown list', () => {
        const fixture = TestBed.createComponent(IgxComboSampleComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const dropdown = combo.dropdown;
    });
    it('End key should scroll down to the last item in the dropdown list', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxComboSampleComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const dropdown = combo.dropdown;
        dropdown.toggle();
        tick();
    }));

    it('PageDown/PageUp key should scroll the list a single view down/up', () => {
        // Combo will not provide such an implementation, PageDown/PageUp will scroll the container, without moving selection.
    });

    it('Vertical scrollbar should not be visible when the items fit inside the container', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxComboScrollTestComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const dropdown = combo.dropdown;
        dropdown.toggle();
        tick();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement as HTMLElement;
            const scrollbarContainer = dropdownList.firstElementChild;
            const hasScrollbar = scrollbarContainer.scrollHeight > scrollbarContainer.clientHeight;
            expect(hasScrollbar).toBeFalsy();
        });
    }));
    it('Vertical scrollbar should be visible when the items does not fit inside the container', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxComboTestComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const dropdown = combo.dropdown;
        dropdown.toggle();
        tick();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement as HTMLElement;
            const scrollbarContainer = dropdownList.firstElementChild;
            const hasScrollbar = scrollbarContainer.scrollHeight > scrollbarContainer.clientHeight;
            expect(hasScrollbar).toBeTruthy();
        });
    }));
    // Selection
    it('Selected items should be appended to the input separated by comma', () => {
        let dropdownList: HTMLElement;
        let dropdownItems: NodeListOf<HTMLElement>;
        let selectedItem: HTMLElement;
        let itemCheckbox: HTMLElement;
        let expectedOutput: string;
        const fixture = TestBed.createComponent(IgxComboTestComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const input = fixture.debugElement.query(By.css('input[name=\'comboInput\']'));
        const inputElement = input.nativeElement;
        const comboButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
        comboButton.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
            dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            selectedItem = dropdownItems[3];
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expectedOutput = 'Paris';
            expect(inputElement.value).toEqual(expectedOutput);
            selectedItem = dropdownItems[7];
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expectedOutput += ', Oslo';
            expect(inputElement.value).toEqual(expectedOutput);
            selectedItem = dropdownItems[1];
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expectedOutput += ', Sofia';
            expect(inputElement.value).toEqual(expectedOutput);
            selectedItem = dropdownItems[7];
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            expectedOutput = 'Paris, Sofia';
            expect(inputElement.value).toEqual(expectedOutput);
        });
    });

    xit('Selected items should be appended to the input in the order they are selected', fakeAsync(() => {
        let dropdownItems: NodeListOf<HTMLElement>;
        const expectedOutput = 'Paris, Oslo, Sofia, Ottawa';
        const fixture = TestBed.createComponent(IgxComboTestComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const input = fixture.debugElement.query(By.css('input[name=\'comboInput\']'));
        const inputElement = input.nativeElement;
        // items are only accessible when the combo dropdown is opened;
        let targetItem: IgxComboItemComponent;
        // spyOn(combo, 'setSelectedItem').and.callThrough();
        // spyOn(combo.dropdown, 'focusItem').and.callThrough();
        // spyOn<any>(combo, 'triggerSelectionChange').and.callThrough();
        // spyOn(combo.dropdown, 'selectedItem').and.callThrough();
        // spyOn(combo.onSelection, 'emit');
        combo.dropdown.toggle();
        tick();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
            dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            const item_1 = dropdownItems[3];
            const checkbox_1 = item_1.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
            checkbox_1.click();
            fixture.detectChanges();

            const item_2 = dropdownItems[7];
            const checkbox_2 = item_2.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
            checkbox_2.click();
            fixture.detectChanges();

            fixture.detectChanges();
            targetItem = combo.dropdown.items[1] as IgxComboItemComponent;
            combo.dropdown.selectItem(targetItem);

            // fixture.detectChanges();
            // combo.dropdown.navigateNext();
            // fixture.detectChanges();
            // combo.dropdown.navigateNext();
            // fixture.detectChanges();

            // targetItem = combo.dropdown.items[11] as IgxComboItemComponent;
            // console.log(targetItem);
            // combo.dropdown.selectItem(targetItem);

            fixture.detectChanges();
            expect(inputElement.value).toEqual(expectedOutput);
        });
    }));
    it('Deselected item should be removed from the input', fakeAsync(() => {
        // const expectedOutput = 'Paris, Oslo, Sofia';
        // const fixture = TestBed.createComponent(IgxComboTestComponent);
        // fixture.detectChanges();
        // const combo = fixture.componentInstance.combo;
        // const input = fixture.debugElement.query(By.css('input[name=\'comboInput\']'));
        // const inputElement = input.nativeElement;
        // // items are only accessible when the combo dropdown is opened;
        // let targetItem: IgxComboItemComponent;
        // // spyOn(combo, 'setSelectedItem').and.callThrough();
        // // spyOn(combo.dropdown, 'focusItem').and.callThrough();
        // // spyOn<any>(combo, 'triggerSelectionChange').and.callThrough();
        // // spyOn(combo.dropdown, 'selectedItem').and.callThrough();
        // // spyOn(combo.onSelection, 'emit');
        // combo.dropdown.toggle();
        // tick();
        // fixture.whenStable().then(() => {
        //     fixture.detectChanges();
        //     targetItem = combo.dropdown.items[3] as IgxComboItemComponent;
        //     combo.dropdown.selectItem(targetItem);

        //     fixture.detectChanges();
        //     targetItem = combo.dropdown.items[7] as IgxComboItemComponent;
        //     combo.dropdown.selectItem(targetItem);

        //     fixture.detectChanges();
        //     targetItem = combo.dropdown.items[1] as IgxComboItemComponent;
        //     combo.dropdown.selectItem(targetItem);

        //     fixture.detectChanges();
        //     expect(inputElement.value).toEqual(expectedOutput);

        //     const clearButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON)).nativeElement;
        //     clearButton.click();

        //     fixture.detectChanges();
        //     expect(inputElement.value).toEqual('');
        // });
    }));
    it('Clear button should dismiss all selected items', fakeAsync(() => {
        const expectedOutput = 'Paris, Oslo, Sofia';
        const fixture = TestBed.createComponent(IgxComboTestComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const input = fixture.debugElement.query(By.css('input[name=\'comboInput\']'));
        const inputElement = input.nativeElement;
        let checkbox_1: HTMLElement;
        let checkbox_2: HTMLElement;
        let checkbox_3: HTMLElement;
        let dropdownItem_1;
        let dropdownItem_2;
        let dropdownItem_3;
        combo.dropdown.toggle();
        tick();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            const item_1 = dropdownItems[3];
            dropdownItem_1 = combo.data[3];
            checkbox_1 = item_1.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
            checkbox_1.click();
            fixture.detectChanges();
            expect(checkbox_1.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
            expect(combo.isItemSelected(combo.data[3])).toBeTruthy();
            expect(combo.selectedItems[0]).toEqual('Paris');

            const item_2 = dropdownItems[7];
            dropdownItem_2 = combo.data[7];
            checkbox_2 = item_2.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
            checkbox_2.click();
            fixture.detectChanges();
            expect(checkbox_2.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
            expect(combo.isItemSelected(dropdownItem_2)).toBeTruthy();
            expect(combo.selectedItems[1]).toEqual('Oslo');

            const item_3 = dropdownItems[1];
            dropdownItem_3 = combo.data[1];
            checkbox_3 = item_3.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
            checkbox_3.click();
            fixture.detectChanges();
            expect(checkbox_3.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
            expect(combo.isItemSelected(dropdownItem_3)).toBeTruthy();
            expect(combo.selectedItems[2]).toEqual('Sofia');
            return fixture.whenStable();
        }).then(() => {
            expect(inputElement.value).toEqual(expectedOutput);
            const clearButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON)).nativeElement;
            clearButton.click();
            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {
            expect(inputElement.value).toEqual('');
            expect(checkbox_1.classList.contains(CSS_CLASS_CHECKED)).toBeFalsy();
            expect(combo.isItemSelected(dropdownItem_1)).toBeFalsy();
            expect(checkbox_2.classList.contains(CSS_CLASS_CHECKED)).toBeFalsy();
            expect(combo.isItemSelected(dropdownItem_2)).toBeFalsy();
            expect(checkbox_3.classList.contains(CSS_CLASS_CHECKED)).toBeFalsy();
            expect(combo.isItemSelected(dropdownItem_3)).toBeFalsy();
            expect(combo.selectedItems.length).toEqual(0);
        });
    }));
    it('Clear button should not throw exception when no items are selected', () => {
        const fixture = TestBed.createComponent(IgxComboTestComponent);
        fixture.detectChanges();
        const clearButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON)).nativeElement;
        clearButton.click();
        fixture.whenStable().then(() => {
            expect(() => fixture.detectChanges()).not.toThrowError();
        });
    });
    it('Item selection - checkbox', fakeAsync(() => {
        const expectedOutput = 'Paris, Oslo, Sofia';
        const fixture = TestBed.createComponent(IgxComboTestComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const input = fixture.debugElement.query(By.css('input[name=\'comboInput\']'));
        const inputElement = input.nativeElement;
        let checkbox_1: HTMLElement;
        let checkbox_2: HTMLElement;
        let checkbox_3: HTMLElement;
        let dropdownItem_1;
        let dropdownItem_2;
        let dropdownItem_3;
        combo.dropdown.toggle();
        tick();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            const item_1 = dropdownItems[3];
            dropdownItem_1 = combo.data[3];
            checkbox_1 = item_1.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
            checkbox_1.click();
            fixture.detectChanges();
            expect(checkbox_1.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
            expect(combo.isItemSelected(combo.data[3])).toBeTruthy();
            expect(combo.selectedItems[0]).toEqual('Paris');

            const item_2 = dropdownItems[7];
            dropdownItem_2 = combo.data[7];
            checkbox_2 = item_2.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
            checkbox_2.click();
            fixture.detectChanges();
            expect(checkbox_2.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
            expect(combo.isItemSelected(dropdownItem_2)).toBeTruthy();
            expect(combo.selectedItems[1]).toEqual('Oslo');

            const item_3 = dropdownItems[1];
            dropdownItem_3 = combo.data[1];
            checkbox_3 = item_3.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
            checkbox_3.click();
            fixture.detectChanges();
            expect(checkbox_3.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
            expect(combo.isItemSelected(dropdownItem_3)).toBeTruthy();
            expect(combo.selectedItems[2]).toEqual('Sofia');

            // Deselect first item
            checkbox_1.click();
            fixture.detectChanges();
            expect(checkbox_1.classList.contains(CSS_CLASS_CHECKED)).toBeFalsy();
            expect(combo.isItemSelected(combo.data[3])).toBeFalsy();
            expect(combo.selectedItems[0]).toEqual('Oslo');
            expect(combo.selectedItems[1]).toEqual('Sofia');
        });
    }));
    it('SelectAll option should select/deselect all list items', fakeAsync(() => {
    }));
    it('Item selection/deselection should trigger onSelectionChange event ', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxComboTestComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        const input = fixture.debugElement.query(By.css('input[name=\'comboInput\']'));
        const inputElement = input.nativeElement;
        let selectedItem: HTMLElement;
        let itemCheckbox: HTMLElement;
        let result = 1;
        spyOn(combo.onSelection, 'emit').and.callThrough();
        combo.dropdown.toggle();
        tick();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            selectedItem = dropdownItems[3];
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            expect(combo.onSelection.emit).toHaveBeenCalledTimes(result);
            expect(combo.onSelection.emit).toHaveBeenCalledWith({ oldSelection: [], newSelection: ['Paris'] });
            result++;

            selectedItem = dropdownItems[7];
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            expect(combo.onSelection.emit).toHaveBeenCalledTimes(result);
            expect(combo.onSelection.emit).toHaveBeenCalledWith({ oldSelection: ['Paris'], newSelection: ['Paris', 'Oslo'] });
            result++;

            selectedItem = dropdownItems[1];
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            expect(combo.onSelection.emit).toHaveBeenCalledTimes(result);
            expect(combo.onSelection.emit).toHaveBeenCalledWith({
                oldSelection: ['Paris', 'Oslo'],
                newSelection: ['Paris', 'Oslo', 'Sofia']
            });
            result++;

            // Deselecting an item
            selectedItem = dropdownItems[7];
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            expect(combo.onSelection.emit).toHaveBeenCalledTimes(result);
            expect(combo.onSelection.emit).toHaveBeenCalledWith({
                oldSelection: ['Paris', 'Oslo', 'Sofia'],
                newSelection: ['Paris', 'Sofia']
            });
            result++;

            selectedItem = dropdownItems[1];
            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
            itemCheckbox.click();
            fixture.detectChanges();
            expect(combo.onSelection.emit).toHaveBeenCalledTimes(result);
            expect(combo.onSelection.emit).toHaveBeenCalledWith({ oldSelection: ['Paris', 'Sofia'], newSelection: ['Paris'] });
        });
    }));
    it('Groupped items should be selectable ', () => {
        // TO DO
    });
    it('Groupped item headdings should not be selectable ', () => {
        // TO DO
    });

    it('Selecting items using the "selectItems" method should add the items to the previously selected items', () => {
        // TO DO
    });

    it('Selecting items using the "selectItems" method should override the previously selected items', () => {
        // TO DO
    });

    // Filtering
    it('The textbox input is placed correctly', () => {
        // TO DO
    });
    it('Typing in the textbox input filters the dropdown items', () => {
        // TO DO
    });
    it('Typing in the textbox should fire onFilterChanged event', () => {
        // TO DO
    });
    it('Clearing the filter textbox should restore the initial combo dropdown list', () => {
        // TO DO
    });
    it('Enter key should select and append the closest suggestion item from the filtered items list', () => {
        // TO DO
    });
    it('Escape key should clear the textbox input and close the dropdown list', () => {
        // TO DO
    });
    it('When no results are filtered, the "Select All" checkbox should not be visible', () => {
        // TO DO
    });
    it('After adding a custom value, the "Select All" checkbox should appear checked', () => {
        // TO DO
    });
    it('When no results are filtered for a group, the group header should not be visible', () => {
        // TO DO
    });

    it('The SPACE key is not allowed inside the filtering box', () => {
        // TO DO
    });

    // Templates
    it('Combo header template', () => {
        // TO DO
    });
    it('Combo footer template', () => {
        // TO DO
    });

    // Grouping
    it('Combo should group items correctly', () => {
        const fix = TestBed.createComponent(IgxComboInputTestComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        combo.dropdown.toggle();
        fix.whenStable().then(() => {
            fix.detectChanges();
            const dropdown = combo.dropdown.element as DebugElement;
            expect(combo.groupKey).toEqual('region');
            expect(combo.dropdown.items[0].itemData.field === combo.data[0].field).toBeFalsy();
            expect(combo.sortingExpressions[0]).toEqual({
                fieldName: 'region',
                dir: SortingDirection.Asc,
                ignoreCase: true
            });
            const listItems = fix.debugElement.queryAll(By.css('.igx-drop-down__item'));
            const listHeaders = fix.debugElement.queryAll(By.css('.igx-drop-down__header'));
            expect(listItems.length).toBeGreaterThan(0);
            expect(listHeaders.length).toBeGreaterThan(0);
            expect(listHeaders[0].nativeElement.innerHTML).toContain('East North Central');
        });
    });

    it('Should sort items correctly', () => {
        const fix = TestBed.createComponent(IgxComboInputTestComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        combo.dropdown.toggle();
        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(combo.groupKey).toEqual('region');
            expect(combo.dropdown.items[0].itemData.field === combo.data[0].field).toBeFalsy();
            expect(combo.sortingExpressions.length).toEqual(1);
            expect(combo.sortingExpressions[0]).toEqual({
                fieldName: 'region',
                dir: SortingDirection.Asc,
                ignoreCase: true
            });
            combo.groupKey = '';

            fix.detectChanges();
            expect(combo.groupKey).toEqual('');
            expect(combo.sortingExpressions.length).toEqual(0);
            expect(combo.sortingExpressions[0]).toBeUndefined();
            return fix.whenStable();
        }).then(() => {
            fix.detectChanges();
            expect(combo.dropdown.items[0].itemData).toEqual(combo.data[0]);
        });
    });

    // Suggestions
    it('Combo should complete the input with the first text match', () => {
        // TO DO
    });
    it('Combo should not display any suggestions when the text match does not begin with the current input', () => {
        // TO DO
    });
    it('Combo should not display any suggestions when there is not any text match', () => {
        // TO DO
    });

    // Custom values
    it('Custom values - combo should display info icon when typing in the input', () => {
        // TO DO
    });
    it('Custom values - Enter key adds the new item in the dropdown list', () => {
        // TO DO
    });
    it('Custom values - clear button dismisses the input text', () => {
        // TO DO
    });
    it('Custom values - typing a value that matches an item from the list selects it', () => {
        // TO DO
    });
    it('Custom values - typing a value that matches an already selected item should remove the corresponding tag', () => {
        // TO DO
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
    @ViewChild('combo', { read: IgxComboComponent })
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
        'Prague'];

}

@Component({
    template: `
    <igx-combo #combo
        [data]='data'
        [placeholder]="'Location'"
        [filterable]='true' [width]="'100px'"
    >
    </igx-combo>
`
})
class IgxComboScrollTestComponent {
    @ViewChild('combo', { read: IgxComboComponent })
    public combo: IgxComboComponent;

    public data: string[] = [
        'Item 1',
        'Item 2',
        'Item 3'];

}

@Component({
    template: `
        <p>Change data to:</p>
        <button class='igx-button' igxRipple (click)="changeData('primitive')">Primitve</button>
        <button class='igx-button' igxRipple (click)="changeData('complex')">Complex</button>
        <button class='igx-button' igxRipple (click)="changeData()">Initial</button>
        <igx-combo #combo [placeholder]="'Location'" [data]='items'
        [filterable]='true' [valueKey]="'field'" [groupKey]="'region'" [width]="'400px'">
            <ng-template #dropdownItemTemplate let-display let-key="valueKey">
                <div class="state-card--simple">
                    <span class="small-red-circle"></span>
                    <div class="display-value--main">State: {{display[key]}}</div>
                    <div class="display-value--sub">Region: {{display.region}}</div>
                </div>
            </ng-template>
            <ng-template #dropdownHeader>
                <div class="header-class">This is a header</div>
            </ng-template>
            <ng-template #dropdownFooter>
                <div class="footer-class">This is a footer</div>
            </ng-template>
        </igx-combo>
`
})
class IgxComboSampleComponent {

    @ViewChild('combo', { read: IgxComboComponent })
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

    changeData(type) {
        // switch (type) {
        //     case 'complex':
        //         this.items = complex;
        //         this.currentDataType = 'complex';
        //         console.log(this.items, complex);
        //         break;
        //     case 'primitive':
        //         this.items = primitive;
        //         this.currentDataType = 'primitive';
        //         console.log(this.items);
        //         break;
        //     default:
        //         this.items = this.initData;
        //         this.currentDataType = 'initial';
        //         console.log(this.items);
        // }
    }
    onSelection(ev) {
    }
}

@Component({
    template: `
        <p>Change data to:</p>
        <igx-combo #combo [placeholder]="'Location'" [data]='items' [height]="'400px'" [listHeight]='400'
        [listItemHeight]='40' [filterable]='true' [valueKey]="'field'" [groupKey]="'region'" [width]="'400px'">
        </igx-combo>
`
})
class IgxComboInputTestComponent {

    @ViewChild('combo', { read: IgxComboComponent })
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

