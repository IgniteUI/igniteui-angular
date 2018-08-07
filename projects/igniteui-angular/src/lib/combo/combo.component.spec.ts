import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Injectable, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef, NgModule } from '@angular/core';
import { async, TestBed, ComponentFixture, tick, fakeAsync, flush } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSelectionAPIService } from '../core/selection';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxDropDownBase, Navigate } from '../drop-down/drop-down.component';
import { IgxComboItemComponent } from './combo-item.component';
import { IgxComboComponent, IgxComboModule, IgxComboState } from './combo.component';
import { IgxComboDropDownComponent } from './combo-dropdown.component';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { RemoteService } from 'src/app/shared/remote.combo.service';

const CSS_CLASS_COMBO = 'igx-combo';
const CSS_CLASS_COMBO_DROPDOWN = 'igx-combo__drop-down';
const CSS_CLASS_DROPDOWN = 'igx-drop-down';
const CSS_CLASS_DROPDOWNLIST = 'igx-drop-down__list';
const CSS_CLASS_CONTENT = 'igx-combo__content';
const CSS_CLASS_CONTAINER = 'igx-display-container';
const CSS_CLASS_DROPDOWNLISTITEM = 'igx-drop-down__item';
const CSS_CLASS_DROPDOWNBUTTON = 'dropdownToggleButton';
const CSS_CLASS_CLEARBUTTON = 'clearButton';
const CSS_CLASS_CHECK_GENERAL = 'igx-combo__checkbox';
const CSS_CLASS_CHECKBOX = 'igx-checkbox';
const CSS_CLASS_CHECKED = 'igx-checkbox--checked';
const CSS_CLASS_TOGGLE = 'igx-toggle';
const CSS_CLASS_SELECTED = 'igx-drop-down__item--selected';
const CSS_CLASS_FOCUSED = 'igx-drop-down__item--focused';
const CSS_CLASS_HEADERITEM = 'igx-drop-down__header';
const CSS_CLASS_SCROLLBAR = 'igx-vhelper__placeholder-content';
const CSS_CLASS_SCROLLBAR_VERTICAL = 'igx-vhelper--vertical';
const CSS_CLASS_SEARCH = 'igx-combo__search';
const CSS_CLASS_INPUTGROUP = 'igx-input-group';
const CSS_CLASS_INPUTGROUP_WRAPPER = 'igx-input-group__wrapper';
const CSS_CLASS_INPUTGROUP_BUNDLE = 'igx-input-group__bundle';
const CSS_CLASS_INPUTGROUP_MAINBUNDLE = 'igx-input-group__bundle-main';
const CSS_CLASS_INPUTGROUP_BUNDLESUFFIX = 'igx-input-group__bundle-suffix';
const CSS_CLASS_INPUTGROUP_BORDER = 'igx-input-group__border';
const CSS_CLASS_HEADER = 'header-class';
const CSS_CLASS_FOOTER = 'footer-class';

describe('igxCombo', () => {
    beforeEach(async(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [
                IgxComboTestComponent,
                IgxComboSampleComponent,
                IgxComboInputTestComponent,
                IgxComboScrollTestComponent,
                IgxComboBindingTestComponent,
                IgxComboRemoteBindingTestComponent,
                IgxComboEmptyTestComponent,
                IgxComboInContainerTestComponent,
                IgxComboInContainerFixedWidthComponent,
                IgxComboFormComponent
            ],
            imports: [
                IgxComboModule,
                NoopAnimationsModule,
                IgxToggleModule,
                ReactiveFormsModule,
                DynamicTestModule
            ]
        }).compileComponents();
    }));

    describe('General tests: ', () => {
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
            expect(combo.searchInput).toBeDefined();
            expect(comboButton).toBeDefined();
            expect(combo.placeholder).toBeDefined();
            combo.dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(combo.dropdown.collapsed).toEqual(false);
                expect(combo.searchInput).toBeDefined();
            });
        }));
        it('Should properly return the context (this)', () => {
            const fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            expect(combo.context.$implicit).toEqual(combo);
        });
        it('Should properly accept input properties', () => {
            const fixture = TestBed.createComponent(IgxComboInputTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            expect(combo.width).toEqual('400px');
            expect(combo.placeholder).toEqual('Location');
            expect(combo.searchPlaceholder).toEqual('Enter a Search Term'); // Default;
            expect(combo.filterable).toEqual(true);
            expect(combo.height).toEqual('400px');
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
            combo.height = '500px';
            expect(combo.height).toEqual('500px');
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
        it('Should properly get/set displayKey', () => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            expect(combo.displayKey).toEqual(combo.valueKey);
            combo.displayKey = 'region';
            expect(combo.displayKey).toEqual('region');
            expect(combo.displayKey === combo.valueKey).toBeFalsy();
        });
    });

    describe('Template tests: ', () => {
        it('Should properly initialize templates', () => {
            const fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            expect(combo).toBeDefined();
            expect(combo.footerTemplate).toBeDefined();
            expect(combo.headerTemplate).toBeDefined();
            expect(combo.itemTemplate).toBeDefined();
            expect(combo.addItemTemplate).toBeUndefined();
            expect(combo.headerItemTemplate).toBeUndefined();
        });
        it('Combo header template rendering', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            let headerElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_HEADER));
            expect(headerElement).toBeNull();
            combo.dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(combo.headerTemplate).toBeDefined();
                const dropdownList: HTMLElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
                headerElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOOTER));
                expect(headerElement).not.toBeNull();
                const headerHTMLElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_HEADER)).nativeElement;
                expect(headerHTMLElement.parentNode).toEqual(dropdownList);
                expect(headerHTMLElement.textContent).toEqual('This is a header');
            });
        }));
        it('Combo footer template rendering', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            let footerElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOOTER));
            expect(footerElement).toBeNull();
            combo.dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(combo.footerTemplate).toBeDefined();
                const dropdownList: HTMLElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
                footerElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOOTER));
                expect(footerElement).not.toBeNull();
                const footerHTMLElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_FOOTER)).nativeElement;
                expect(footerHTMLElement.parentNode).toEqual(dropdownList);
                expect(footerHTMLElement.textContent).toEqual('This is a footer');
            });
        }));
    });

    describe('Dropdown tests: ', () => {
        it('Should properly call dropdown methods', () => {
            const fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            expect(combo).toBeDefined();
            spyOn(combo.dropdown, 'close');
            spyOn(combo.dropdown, 'open');
            spyOn(combo.dropdown, 'toggle');
            spyOnProperty(combo.dropdown, 'collapsed', 'get').and.callFake(() => 'fake');
            combo.open();
            combo.close();
            combo.toggle();
            expect(combo.dropdown.close).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.open).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.toggle).toHaveBeenCalledTimes(1);
        });
        it('Should properly call dropdown navigatePrev method', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            const dropdown = combo.dropdown;
            expect(combo).toBeDefined();
            expect(dropdown).toBeDefined();
            expect(dropdown.focusedItem).toBeFalsy();
            expect(dropdown.verticalScrollContainer).toBeDefined();
            const mockObj = jasmine.createSpyObj('nativeElement', ['focus']);
            const mockSearchInput = spyOnProperty(combo, 'searchInput', 'get').and.returnValue({ nativeElement: mockObj });
            const mockFn = () => dropdown.navigatePrev();
            expect(mockFn).toThrow();
            expect(dropdown.focusedItem).toEqual(null);
            expect(combo.collapsed).toBeTruthy();
            combo.toggle();
            tick();
            fix.detectChanges();
            expect(mockObj.focus).toHaveBeenCalledTimes(1);
            expect(combo.collapsed).toBeFalsy();
            combo.handleKeyUp({ key: 'ArrowDown' });
            fix.whenStable().then(() => {
                fix.detectChanges();
                expect(dropdown.focusedItem).toBeTruthy();
                expect(dropdown.focusedItem.index).toEqual(0);
                expect(dropdown.verticalScrollContainer.state.startIndex).toEqual(0);
                spyOn(dropdown, 'onBlur').and.callThrough();
                dropdown.navigatePrev();
                tick();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(mockObj.focus).toHaveBeenCalledTimes(2);
                combo.handleKeyUp({ key: 'ArrowDown' });
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(dropdown.focusedItem).toBeTruthy();
                expect(dropdown.focusedItem.index).toEqual(0);
                dropdown.navigateNext();
                tick();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(dropdown.focusedItem).toBeTruthy();
                expect(dropdown.focusedItem.index).toEqual(1);
                expect(dropdown.verticalScrollContainer.state.startIndex).toEqual(0);
                spyOn(IgxDropDownBase.prototype, 'navigatePrev').and.callThrough();
                dropdown.navigatePrev();
                tick();
                return fix.whenStable();
            }).then(() => {
                expect(dropdown.focusedItem).toBeTruthy();
                expect(dropdown.focusedItem.index).toEqual(0);
                expect(dropdown.verticalScrollContainer.state.startIndex).toEqual(0);
                expect(IgxDropDownBase.prototype.navigatePrev).toHaveBeenCalledTimes(1);
            });
        }));
        it('Should properly call dropdown navigateNext with virutal items', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            const dropdown = combo.dropdown;
            expect(combo).toBeDefined();
            expect(dropdown).toBeDefined();
            expect(dropdown.focusedItem).toBeFalsy();
            expect(dropdown.verticalScrollContainer).toBeDefined();
            const mockClick = jasmine.createSpyObj('event', ['preventDefault', 'stopPropagation']);
            const mockObj = jasmine.createSpyObj('nativeElement', ['focus']);
            const mockSearchInput = spyOnProperty(combo, 'searchInput', 'get').and.returnValue({ nativeElement: mockObj });
            const mockFn = () => dropdown.navigatePrev();
            const virtualMock = spyOn<any>(dropdown, 'navigateVirtualItem').and.callThrough();
            expect(mockFn).toThrow();
            expect(dropdown.focusedItem).toEqual(null);
            expect(combo.collapsed).toBeTruthy();
            combo.toggle();
            tick();
            fix.detectChanges();
            expect(mockObj.focus).toHaveBeenCalledTimes(1);
            expect(combo.collapsed).toBeFalsy();
            dropdown.verticalScrollContainer.scrollTo(51);
            tick();
            fix.whenStable().then(() => {
                // TEST move to last item;
                fix.detectChanges();
                const lastItem = fix.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM))[8].componentInstance;
                expect(lastItem).toBeDefined();
                lastItem.clicked(mockClick);
                fix.detectChanges();
                expect(dropdown.focusedItem).toEqual(lastItem);
                const mockFunc = () => dropdown.navigateItem(lastItem.index + 1);
                expect(mockFunc).toThrow();
                dropdown.navigateItem(-1);
                fix.detectChanges();
                expect(virtualMock).toHaveBeenCalledTimes(1);
                lastItem.clicked(mockClick);
                fix.detectChanges();
                expect(dropdown.focusedItem).toEqual(lastItem);
                dropdown.navigateItem(-1, Navigate.Down);
                fix.detectChanges();
                expect(virtualMock).toHaveBeenCalledTimes(2);
                combo.searchValue = 'New';
                tick();
                lastItem.clicked(mockClick);
                fix.detectChanges();
                expect(dropdown.focusedItem).toEqual(lastItem);
                fix.detectChanges();
                expect(combo.customValueFlag && combo.searchValue !== '').toBeTruthy();
                dropdown.navigateItem(-1, Navigate.Down);
                expect(virtualMock).toHaveBeenCalledTimes(3);
                lastItem.itemData = dropdown.verticalScrollContainer.igxForOf[dropdown.verticalScrollContainer.igxForOf.length - 1];
                lastItem.clicked(mockClick);
                fix.detectChanges();
                expect(dropdown.focusedItem).toEqual(lastItem);
                dropdown.navigateItem(-1, Navigate.Down);
                expect(virtualMock).toHaveBeenCalledTimes(3);

                // TEST move from first item
                dropdown.verticalScrollContainer.scrollTo(0);
                tick();
                fix.detectChanges();
                const firstItem = fix.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM))[0].componentInstance;
                firstItem.clicked(mockClick);
                fix.detectChanges();
                expect(dropdown.focusedItem).toEqual(firstItem);
                expect(dropdown.focusedItem.index).toEqual(0);
                // spyOnProperty(dropdown, 'focusedItem', 'get').and.returnValue(firstItem);
                dropdown.navigateItem(-1);
                fix.detectChanges();
                expect(virtualMock).toHaveBeenCalledTimes(4);
                spyOn(dropdown, 'onBlur').and.callThrough();
                dropdown.navigateItem(-1, Navigate.Up);
                tick();
                fix.detectChanges();
                expect(virtualMock).toHaveBeenCalledTimes(5);
            });
        }));
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
        it('IgxComboDropDown onFocus and onBlur event', async(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const dropdown = fix.componentInstance.combo.dropdown;
            expect(dropdown.focusedItem).toEqual(null);
            expect(dropdown.items.length).toEqual(9);
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
        }));
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
        it('Should properly handle dropdown.focusItem', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            const dropdown = combo.dropdown;
            combo.toggle();
            tick();
            fix.detectChanges();
            const virtualSpy = spyOn<any>(dropdown, 'navigateVirtualItem');
            spyOn(IgxComboDropDownComponent.prototype, 'navigateItem').and.callThrough();
            dropdown.navigateItem(0);

            fix.detectChanges();
            expect(IgxComboDropDownComponent.prototype.navigateItem).toHaveBeenCalledTimes(1);
            dropdown.navigateItem(-1);
            expect(IgxComboDropDownComponent.prototype.navigateItem).toHaveBeenCalledTimes(2);
            expect(virtualSpy).toHaveBeenCalled();
        }));
        it('Should handle handleKeyDown calls', () => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            spyOn(combo, 'selectAllItems');
            spyOn(combo, 'toggle');
            spyOn(combo.dropdown, 'onFocus').and.callThrough();
            combo.handleKeyUp({ key: 'A' });
            combo.handleKeyUp({});
            expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
            expect(combo.dropdown.onFocus).toHaveBeenCalledTimes(0);
            combo.handleKeyUp({ key: 'Enter' });
            expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
            spyOnProperty(combo, 'filteredData', 'get').and.returnValue([1]);
            combo.handleKeyUp({ key: 'Enter' });
            expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
            combo.handleKeyUp({ key: 'ArrowDown' });
            expect(combo.selectAllItems).toHaveBeenCalledTimes(0);
            expect(combo.dropdown.onFocus).toHaveBeenCalledTimes(1);
            combo.handleKeyUp({ key: 'Escape' });
            expect(combo.toggle).toHaveBeenCalledTimes(1);
        });
        it('Should properly close on click outside of the combo dropdown', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            expect(combo).toBeDefined();
            combo.toggle();
            tick();
            expect(combo.collapsed).toEqual(false);
            document.documentElement.dispatchEvent(new Event('click'));
            tick();
            expect(combo.collapsed).toEqual(true);
        }));
        it('Should restore position of dropdown scroll after opening', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            expect(combo).toBeDefined();
            spyOn(combo.dropdown, 'onToggleOpening').and.callThrough();
            spyOn(combo.dropdown, 'onToggleOpened').and.callThrough();
            spyOn(combo.dropdown, 'onToggleClosing').and.callThrough();
            spyOn(combo.dropdown, 'onToggleClosed').and.callThrough();
            combo.toggle();
            tick();
            expect(combo.collapsed).toEqual(false);
            expect(combo.dropdown.onToggleOpening).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.onToggleOpened).toHaveBeenCalledTimes(1);
            let vContainerScrollHeight = combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollHeight;
            expect(combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollTop).toEqual(0);
            expect(vContainerScrollHeight).toBeGreaterThan(combo.itemHeight);
            combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollTop = Math.floor(vContainerScrollHeight / 2);
            tick(1000);
            expect(combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollTop).toBeGreaterThan(0);
            document.documentElement.dispatchEvent(new Event('click'));
            tick(500);
            expect(combo.collapsed).toEqual(true);
            expect(combo.dropdown.onToggleClosing).toHaveBeenCalledTimes(1);
            expect(combo.dropdown.onToggleClosed).toHaveBeenCalledTimes(1);
            combo.toggle();
            tick(500);
            expect(combo.collapsed).toEqual(false);
            expect(combo.dropdown.onToggleOpening).toHaveBeenCalledTimes(2);
            expect(combo.dropdown.onToggleOpened).toHaveBeenCalledTimes(2);
            vContainerScrollHeight = combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollHeight;
            expect(combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollTop).toEqual(vContainerScrollHeight / 2);
        }));
        it('Dropdown button should open/close dropdown list', async(() => {
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
        }));
        it('Search input should be focused when dropdown is opened', async(() => {
            let isFocused = false;
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
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
        }));
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

                combo.onArrowUp(new KeyboardEvent('keydown', { altKey: false, key: 'ArrowUp' }));
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();

                expect(combo.dropdown.toggle).toHaveBeenCalledTimes(2);
                expect(combo.dropdown.close).toHaveBeenCalledTimes(1);

                combo.onArrowUp(new KeyboardEvent('keydown', { altKey: true, key: 'ArrowUp' }));
                return fix.whenStable();
            }).then(() => {

                fix.detectChanges();
                expect(combo.dropdown.toggle).toHaveBeenCalledTimes(3);
                expect(combo.dropdown.close).toHaveBeenCalledTimes(2);
            });
        }));
        it('Dropdown button should fire dropdown opening/closing events', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            const dropdown = combo.dropdown;
            spyOn(combo.onOpened, 'emit').and.callThrough();
            spyOn(combo.onOpening, 'emit').and.callThrough();
            spyOn(combo.onClosed, 'emit').and.callThrough();
            spyOn(combo.onClosing, 'emit').and.callThrough();
            spyOn(combo, 'onInputClick').and.callThrough();
            const comboButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
            expect(comboButton).toBeDefined();
            comboButton.click();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(dropdown.collapsed).toEqual(false);
                expect(combo.onInputClick).toHaveBeenCalledTimes(1);
                expect(combo.onOpened.emit).toHaveBeenCalledTimes(1);
                expect(combo.onOpening.emit).toHaveBeenCalledTimes(1);
                expect(combo.onClosing.emit).toHaveBeenCalledTimes(0);
                expect(combo.onClosed.emit).toHaveBeenCalledTimes(0);
                comboButton.click();
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                expect(combo.onInputClick).toHaveBeenCalledTimes(2);
                expect(combo.onClosed.emit).toHaveBeenCalledTimes(1);
                expect(combo.onClosing.emit).toHaveBeenCalledTimes(1);
            });
        }));
        it('Dropdown list items key navigation', fakeAsync(() => {
            let focusedItems;
            let selectedItems;
            let selectedItemsCount = 0;
            let dropdownList: HTMLElement;
            let dropdownContent: HTMLElement;
            let dropdownItems;
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            const spaceEvent = new KeyboardEvent('keydown', { key: 'Space' });
            const combo = fixture.componentInstance.combo;
            combo.dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT)).nativeElement;
                focusedItems = dropdownList.querySelectorAll('.' + CSS_CLASS_FOCUSED);
                expect(focusedItems.length).toEqual(0);
                selectedItems = dropdownList.querySelectorAll('.' + CSS_CLASS_SELECTED);
                expect(selectedItems.length).toEqual(0);

                focusItem(arrowDownEvent, 0);
                selectedItemsCount++;
                selectItem(0);

                for (let index = 1; index < 7; index++) {
                    focusItem(arrowDownEvent, index);
                }
                selectedItemsCount++;
                selectItem(6);

                for (let index = 5; index > 3; index--) {
                    focusItem(arrowUpEvent, index);
                }
                selectedItemsCount++;
                selectItem(4);
            });

            const focusItem = function (event: KeyboardEvent, itemIndex: number) {
                dropdownContent.dispatchEvent(event);
                fixture.detectChanges();
                focusedItems = dropdownList.querySelectorAll('.' + CSS_CLASS_FOCUSED);
                expect(focusedItems.length).toEqual(1);
                expect(focusedItems[0]).toEqual(dropdownItems[itemIndex]);
            };

            const selectItem = function (itemIndex: number) {
                dropdownContent.dispatchEvent(spaceEvent);
                fixture.detectChanges();
                selectedItems = dropdownList.querySelectorAll('.' + CSS_CLASS_SELECTED);
                expect(selectedItems.length).toEqual(selectedItemsCount);
                expect(selectedItems).toContain(dropdownItems[itemIndex]);
            };
        }));
        it('Home key should scroll up to the first item in the dropdown list', async(() => {
            let scrollbar: HTMLElement;
            let dropdownContainer: HTMLElement;
            let firstVisibleItem: Element;
            let lastVisibleItem: Element;
            const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
            const endEvent = new KeyboardEvent('keydown', { key: 'End' });
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            const comboButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
            comboButton.click();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT)).nativeElement;
                scrollbar = fixture.debugElement.query(By.css('.' + CSS_CLASS_SCROLLBAR_VERTICAL)).nativeElement as HTMLElement;
                expect(scrollbar.scrollTop).toEqual(0);
                dropdownContent.dispatchEvent(endEvent);
                setTimeout(() => {
                    fixture.detectChanges();
                    expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);
                    dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                    firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
                    lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
                    expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 10]);
                    expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 1]);
                    dropdownContent.dispatchEvent(homeEvent);
                    setTimeout(() => {
                        fixture.detectChanges();
                        expect(scrollbar.scrollTop).toEqual(0);
                        dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                        firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
                        lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
                        expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[0]);
                        expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[10]);
                        combo.dropdown.verticalScrollContainer.scrollTo(6);
                        setTimeout(function () {
                            fixture.detectChanges();
                            dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                            firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
                            expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[6]);
                            dropdownContent.dispatchEvent(homeEvent);
                            setTimeout(function () {
                                fixture.detectChanges();
                                dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                                firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
                                lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
                                expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[0]);
                                expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[10]);
                                expect(scrollbar.scrollTop).toEqual(0);
                            }, 20);
                        }, 20);
                    }, 20);
                }, 20);
            });
        }));
        it('End key should scroll down to the last item in the dropdown list', async(() => {
            let scrollbar: HTMLElement;
            let dropdownContainer: HTMLElement;
            let firstVisibleItem: Element;
            let lastVisibleItem: Element;
            const endEvent = new KeyboardEvent('keydown', { key: 'End' });
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            const comboButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
            comboButton.click();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT)).nativeElement;
                scrollbar = fixture.debugElement.query(By.css('.' + CSS_CLASS_SCROLLBAR_VERTICAL)).nativeElement as HTMLElement;
                expect(scrollbar.scrollTop).toEqual(0);
                fixture.detectChanges();
                dropdownContent.dispatchEvent(endEvent);
                setTimeout(() => {
                    fixture.detectChanges();
                    expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);
                    dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                    firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
                    lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
                    expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 10]);
                    expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 1]);
                    combo.dropdown.verticalScrollContainer.scrollTo(3);
                    setTimeout(function () {
                        fixture.detectChanges();
                        dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                        firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
                        expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[3]);
                        dropdownContent.dispatchEvent(endEvent);
                        setTimeout(function () {
                            fixture.detectChanges();
                            dropdownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                            firstVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':first-child');
                            lastVisibleItem = dropdownContainer.querySelector('.' + CSS_CLASS_DROPDOWNLISTITEM + ':last-child');
                            expect(firstVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 10]);
                            expect(lastVisibleItem.textContent.trim()).toEqual(combo.data[combo.data.length - 1]);
                            expect(scrollbar.scrollHeight - scrollbar.scrollTop).toEqual(scrollbar.clientHeight);
                        }, 20);
                    }, 20);
                }, 20);
            });
        }));
    });

    describe('Selection tests: ', () => {
        it('Should properly return the selected value(s)', () => {
            const fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            expect(combo).toBeDefined();
            expect(combo.values).toEqual([]);
            combo.valueKey = undefined;
            expect(combo.values).toEqual([]);
        });
        it('Should properly call "writeValue" (method)', () => {
            const fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            spyOn(combo, 'selectItems');
            combo.writeValue(['EXAMPLE']);
            fixture.detectChanges();
            expect(combo.selectItems).toHaveBeenCalledTimes(1);
            // Calling "SelectItems" through the writeValue accessor should clear the previous values;
            expect(combo.selectItems).toHaveBeenCalledWith(['EXAMPLE'], true);
        });
        it(`Should properly select/deselect items`, fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            expect(combo.dropdown.items).toBeDefined();
            // items are only accessible when the combo dropdown is opened;
            let targetItem: IgxComboItemComponent;
            spyOn(combo, 'setSelectedItem').and.callThrough();
            spyOn(combo.dropdown, 'navigateItem').and.callThrough();
            spyOn<any>(combo, 'triggerSelectionChange').and.callThrough();
            spyOn(combo.dropdown, 'selectedItem').and.callThrough();
            spyOn(combo.onSelectionChange, 'emit');
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
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(1);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({ oldSelection: [], newSelection: [targetItem.itemID] });

                combo.dropdown.selectItem(targetItem);
                expect(combo.dropdown.selectedItem).toEqual([]);
                expect(combo.setSelectedItem).toHaveBeenCalledTimes(2);
                expect(combo.setSelectedItem).toHaveBeenCalledWith(targetItem.itemID, true);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(2);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({ oldSelection: [targetItem.itemID], newSelection: [] });

                spyOn(combo, 'addItemToCollection');
                combo.dropdown.selectItem({ itemData: 'ADD ITEM' } as IgxComboItemComponent, new Event('click'));
                fix.detectChanges();
                expect(combo.addItemToCollection).toHaveBeenCalledTimes(1);
            });
        }));
        it(`Should properly select/deselect items using public methods selectItems and deselectItems`, fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            spyOn(combo.onSelectionChange, 'emit');
            combo.dropdown.toggle();
            let oldSelection = [];
            let newSelection = [combo.data[1], combo.data[5], combo.data[6]];
            tick();
            fix.whenStable().then(() => {
                fix.detectChanges();

                combo.selectItems(newSelection);
                fix.detectChanges();
                expect(combo.selectedItems().length).toEqual(newSelection.length);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(1);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({ oldSelection: oldSelection, newSelection: newSelection });

                let newItem = combo.data[3];
                combo.selectItems([newItem]);
                oldSelection = [...newSelection];
                newSelection.push(newItem);
                fix.detectChanges();
                expect(combo.selectedItems().length).toEqual(newSelection.length);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(2);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({ oldSelection: oldSelection, newSelection: newSelection });

                oldSelection = [...newSelection];
                newSelection = [combo.data[0]];
                combo.selectItems(newSelection, true);
                fix.detectChanges();
                expect(combo.selectedItems().length).toEqual(newSelection.length);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(3);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({ oldSelection: oldSelection, newSelection: newSelection });

                oldSelection = [...newSelection];
                newSelection = [];
                newItem = combo.data[0];
                combo.deselectItems([newItem]);
                fix.detectChanges();
                expect(combo.selectedItems().length).toEqual(newSelection.length);
                expect(combo.selectedItems().length).toEqual(0);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(4);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({ oldSelection: oldSelection, newSelection: newSelection });
            });
        }));
        it('Should properly select/deselect ALL items', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            expect(combo.dropdown.items).toBeDefined();
            // items are only accessible when the combo dropdown is opened;
            spyOn(combo, 'selectAllItems').and.callThrough();
            spyOn(combo, 'deselectAllItems').and.callThrough();
            spyOn(combo, 'handleSelectAll').and.callThrough();
            spyOn<any>(combo, 'triggerSelectionChange').and.callThrough();
            spyOn(combo.onSelectionChange, 'emit');
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
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(1);

                combo.handleSelectAll({ checked: false });

                fix.detectChanges();
                expect(combo.selectAllItems).toHaveBeenCalledTimes(1);
                expect(combo.deselectAllItems).toHaveBeenCalledTimes(1);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(2);
            });
        }));
        it('Should handle setSelectedItem properly', () => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            const dropdown = combo.dropdown;
            spyOn(dropdown, 'setSelectedItem').and.callThrough();
            spyOn(combo, 'getItemDataByValueKey').and.callThrough();
            spyOn(combo.onSelectionChange, 'emit').and.callThrough();
            combo.setSelectedItem(null);
            expect(combo.selectedItems()).toEqual([]);
            dropdown.setSelectedItem(null);
            expect(combo.selectedItems()).toEqual([]);
            dropdown.setSelectedItem(undefined);
            expect(combo.selectedItems()).toEqual([]);
            combo.setSelectedItem(undefined);
            expect(combo.selectedItems()).toEqual([]);
            dropdown.setSelectedItem({ field: 'Connecticut', region: 'New England' });
            expect(combo.selectedItems()).toEqual([{ field: 'Connecticut', region: 'New England' }]);
            combo.deselectAllItems();
            expect(combo.selectedItems()).toEqual([]);
            combo.setSelectedItem({ field: 'Connecticut', region: 'New England' });
            expect(combo.selectedItems()).toEqual([{ field: 'Connecticut', region: 'New England' }]);
            combo.deselectAllItems();
            expect(combo.selectedItems()).toEqual([]);
            dropdown.setSelectedItem('Connecticut');
            expect(combo.selectedItems()).toEqual([{ field: 'Connecticut', region: 'New England' }]);
            combo.deselectAllItems();
            expect(combo.selectedItems()).toEqual([]);
            dropdown.setSelectedItem('Connecticut', false);
            expect(combo.selectedItems()).toEqual([]);
            combo.deselectAllItems();
            expect(combo.selectedItems()).toEqual([]);
            dropdown.setSelectedItem({ field: 'Connecticut', region: 'New England' }, true);
            expect(combo.selectedItems()).toEqual([{ field: 'Connecticut', region: 'New England' }]);
            spyOn(combo, 'setSelectedItem').and.callThrough();
            const selectionSpy = spyOn<any>(combo, 'triggerSelectionChange').and.callThrough();
            dropdown.setSelectedItem(combo.selectedItems()[0], false);
            expect(combo.setSelectedItem).toHaveBeenCalledWith({ field: 'Connecticut', region: 'New England' }, false);
            expect(selectionSpy.calls.mostRecent().args).toEqual([[]]);
            expect(combo.selectedItems()).toEqual([]);
            combo.setSelectedItem('Connecticut', true);
            expect(combo.selectedItems()).toEqual([{ field: 'Connecticut', region: 'New England' }]);
            expect(combo.selectedItems()[0]).toEqual({ field: 'Connecticut', region: 'New England' });
            combo.setSelectedItem('Connecticut', false);
            expect(combo.selectedItems()).toEqual([]);
            combo.setSelectedItem('Connecticut', false);
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.getItemDataByValueKey).toHaveBeenCalledTimes(5);
            expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(13);
        });
        it('Should properly return the selected item(s)', () => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.dropdown.selectedItem).toEqual([]);
            combo.setSelectedItem('Connecticut');
            fix.detectChanges();
            expect(combo.dropdown.selectedItem).toEqual([{ field: 'Connecticut', region: 'New England' }]);
            expect(combo.dropdown.selectedItem[0]).toEqual(combo.data[0]);
        });
        it('Selected items should be appended to the input separated by comma', async(() => {
            let dropdownList: HTMLElement;
            let dropdownItems: NodeListOf<HTMLElement>;
            let selectedItem: HTMLElement;
            let itemCheckbox: HTMLElement;
            let expectedOutput: string;
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
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
        }));
        it('Selected items should be appended to the input in the order they are selected', async(() => {
            let dropdownItems: NodeListOf<HTMLElement>;
            let targetItem: HTMLElement;
            let targetCheckbox: HTMLElement;
            const event = new KeyboardEvent('keydown', { key: 'End' });
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            const expectedOutput = combo.data[3] + ', ' + combo.data[7] + ', ' + combo.data[1] + ', ' + combo.data[11];
            const comboButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
            comboButton.click();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const dropdownContent = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTENT)).nativeElement;
                const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                targetItem = dropdownItems[3];
                targetCheckbox = targetItem.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                targetCheckbox.click();
                fixture.detectChanges();

                targetItem = dropdownItems[7];
                targetCheckbox = targetItem.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                targetCheckbox.click();
                fixture.detectChanges();

                targetItem = dropdownItems[1];
                targetCheckbox = targetItem.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                targetCheckbox.click();
                fixture.detectChanges();

                dropdownContent.dispatchEvent(event);
                setTimeout(function () {
                    fixture.detectChanges();
                    dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                    targetItem = dropdownItems[5];
                    targetCheckbox = targetItem.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                    targetCheckbox.click();
                    fixture.detectChanges();
                    setTimeout(function () {
                        fixture.detectChanges();
                        const input = fixture.debugElement.query(By.css('input[name=\'comboInput\']'));
                        expect(input.nativeElement.value).toEqual(expectedOutput);
                    }, 20);
                }, 20);
            });
        }));
        it('Deselected item should be removed from the input', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            const input = fixture.debugElement.query(By.css('input[name=\'comboInput\']'));
            const inputElement = input.nativeElement;
            let dropdownItems;
            let checkbox_1: HTMLElement;
            let checkbox_2: HTMLElement;
            let checkbox_3: HTMLElement;
            let checkbox_4: HTMLElement;
            combo.dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                const item_1 = dropdownItems[3];
                checkbox_1 = item_1.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_1.click();
                fixture.detectChanges();

                const item_2 = dropdownItems[7];
                checkbox_2 = item_2.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_2.click();
                fixture.detectChanges();

                const item_3 = dropdownItems[1];
                checkbox_3 = item_3.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_3.click();
                fixture.detectChanges();
                return fixture.whenStable();
            }).then(() => {
                expect(inputElement.value).toEqual('Paris, Oslo, Sofia');
                checkbox_2.click();
                fixture.detectChanges();
                return fixture.whenStable();
            }).then(() => {
                expect(inputElement.value).toEqual('Paris, Sofia');
                const item_4 = dropdownItems[8];
                checkbox_4 = item_4.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_4.click();
                fixture.detectChanges();
                return fixture.whenStable();
            }).then(() => {
                expect(inputElement.value).toEqual('Paris, Sofia, Los Angeles');
                checkbox_3.click();
                fixture.detectChanges();
                return fixture.whenStable();
            }).then(() => {
                expect(inputElement.value).toEqual('Paris, Los Angeles');
                checkbox_1.click();
                fixture.detectChanges();
                return fixture.whenStable();
            }).then(() => {
                expect(inputElement.value).toEqual('Los Angeles');
                checkbox_4.click();
                fixture.detectChanges();
                return fixture.whenStable();
            }).then(() => {
                expect(inputElement.value).toEqual('');
            });
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
                expect(combo.selectedItems()[0]).toEqual('Paris');

                const item_2 = dropdownItems[7];
                dropdownItem_2 = combo.data[7];
                checkbox_2 = item_2.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_2.click();
                fixture.detectChanges();
                expect(checkbox_2.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
                expect(combo.isItemSelected(dropdownItem_2)).toBeTruthy();
                expect(combo.selectedItems()[1]).toEqual('Oslo');

                const item_3 = dropdownItems[1];
                dropdownItem_3 = combo.data[1];
                checkbox_3 = item_3.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_3.click();
                fixture.detectChanges();
                expect(checkbox_3.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
                expect(combo.isItemSelected(dropdownItem_3)).toBeTruthy();
                expect(combo.selectedItems()[2]).toEqual('Sofia');
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
                expect(combo.selectedItems().length).toEqual(0);
            });
        }));
        it('Clear button should not throw exception when no items are selected', async(() => {
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const clearButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON));
            expect(clearButton).toBeNull();
        }));
        it('Item selection - checkbox', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            let checkbox_1: HTMLElement;
            let checkbox_2: HTMLElement;
            let checkbox_3: HTMLElement;
            let dropdownItem_2;
            let dropdownItem_3;
            combo.dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
                const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                const item_1 = dropdownItems[3];
                checkbox_1 = item_1.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_1.click();
                fixture.detectChanges();
                expect(checkbox_1.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
                expect(combo.isItemSelected(combo.data[3])).toBeTruthy();
                expect(combo.selectedItems()[0]).toEqual('Paris');

                const item_2 = dropdownItems[7];
                dropdownItem_2 = combo.data[7];
                checkbox_2 = item_2.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_2.click();
                fixture.detectChanges();
                expect(checkbox_2.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
                expect(combo.isItemSelected(dropdownItem_2)).toBeTruthy();
                expect(combo.selectedItems()[1]).toEqual('Oslo');

                const item_3 = dropdownItems[1];
                dropdownItem_3 = combo.data[1];
                checkbox_3 = item_3.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_3.click();
                fixture.detectChanges();
                expect(checkbox_3.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
                expect(combo.isItemSelected(dropdownItem_3)).toBeTruthy();
                expect(combo.selectedItems()[2]).toEqual('Sofia');

                // Deselect first item
                checkbox_1.click();
                fixture.detectChanges();
                expect(checkbox_1.classList.contains(CSS_CLASS_CHECKED)).toBeFalsy();
                expect(combo.isItemSelected(combo.data[3])).toBeFalsy();
                expect(combo.selectedItems()[0]).toEqual('Oslo');
                expect(combo.selectedItems()[1]).toEqual('Sofia');
            });
        }));
        it('Item selection/deselection should trigger onSelectionChangeChange event ', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            let selectedItem: HTMLElement;
            let itemCheckbox: HTMLElement;
            let result = 1;
            spyOn(combo.onSelectionChange, 'emit').and.callThrough();
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
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(result);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({ oldSelection: [], newSelection: ['Paris'] });
                result++;

                selectedItem = dropdownItems[7];
                itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
                itemCheckbox.click();
                fixture.detectChanges();
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(result);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({ oldSelection: ['Paris'], newSelection: ['Paris', 'Oslo'] });
                result++;

                selectedItem = dropdownItems[1];
                itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
                itemCheckbox.click();
                fixture.detectChanges();
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(result);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({
                    oldSelection: ['Paris', 'Oslo'],
                    newSelection: ['Paris', 'Oslo', 'Sofia']
                });
                result++;

                // Deselecting an item
                selectedItem = dropdownItems[7];
                itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
                itemCheckbox.click();
                fixture.detectChanges();
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(result);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({
                    oldSelection: ['Paris', 'Oslo', 'Sofia'],
                    newSelection: ['Paris', 'Sofia']
                });
                result++;

                selectedItem = dropdownItems[1];
                itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
                itemCheckbox.click();
                fixture.detectChanges();
                expect(combo.onSelectionChange.emit).toHaveBeenCalledTimes(result);
                expect(combo.onSelectionChange.emit).toHaveBeenCalledWith({ oldSelection: ['Paris', 'Sofia'], newSelection: ['Paris'] });
            });
        }));
        it('Grouped items should be selectable ', fakeAsync(() => {
            const expectedOutput = 'Michigan, Tennessee, Illinois';
            const fixture = TestBed.createComponent(IgxComboSampleComponent);
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
                dropdownItem_1 = combo.data[9];
                checkbox_1 = item_1.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_1.click();
                fixture.detectChanges();
                expect(checkbox_1.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
                expect(combo.isItemSelected(dropdownItem_1)).toBeTruthy();
                expect(combo.selectedItems()[0]).toEqual(dropdownItem_1);

                const item_2 = dropdownItems[7];
                dropdownItem_2 = combo.data[33];
                checkbox_2 = item_2.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_2.click();
                fixture.detectChanges();
                expect(checkbox_2.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
                expect(combo.isItemSelected(dropdownItem_2)).toBeTruthy();
                expect(combo.selectedItems()[1]).toEqual(dropdownItem_2);

                const item_3 = dropdownItems[1];
                dropdownItem_3 = combo.data[12];
                checkbox_3 = item_3.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_3.click();
                fixture.detectChanges();
                expect(checkbox_3.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
                expect(combo.isItemSelected(dropdownItem_3)).toBeTruthy();
                expect(combo.selectedItems()[2]).toEqual(dropdownItem_3);
                return fixture.whenStable();
            }).then(() => {
                expect(inputElement.value).toEqual(expectedOutput);
            });
        }));
        it('Grouped item headers should not be selectable ', async(() => {
            const fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            let scrollIndex = 0;
            const combo = fixture.componentInstance.combo;
            const input = fixture.debugElement.query(By.css('input[name=\'comboInput\']'));
            const inputElement = input.nativeElement;
            const dropdownButton = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
            dropdownButton.click();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                selectGroupHeaders();
                expect(inputElement.value).toEqual('');
            });

            const selectGroupHeaders = function () {
                setTimeout(function () {
                    fixture.detectChanges();
                    const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                    const dropdownHeaders = dropdownList.querySelectorAll('.' + CSS_CLASS_HEADERITEM);
                    dropdownHeaders.forEach(el => {
                        const item = el as IgxComboItemComponent;
                        combo.dropdown.selectItem(item);
                        fixture.detectChanges();
                        expect(combo.isItemSelected(item)).toBeFalsy();
                        expect(combo.selectedItems().length).toEqual(0);
                    });
                    scrollIndex += 10;
                    combo.dropdown.verticalScrollContainer.scrollTo(scrollIndex);
                    if (scrollIndex < combo.data.length) {
                        selectGroupHeaders();
                    }
                }, 20);
            };
        }));
        it('Selecting items using the "selectItem" method should add the items to the previously selected items', fakeAsync(() => {
            let expectedOutput = 'Paris, Oslo, Sofia, Madrid';
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            const input = fixture.debugElement.query(By.css('input[name=\'comboInput\']'));
            const inputElement = input.nativeElement;
            let checkbox_1: HTMLElement;
            let checkbox_2: HTMLElement;
            let checkbox_3: HTMLElement;
            combo.dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
                const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                const item_1 = dropdownItems[3];
                checkbox_1 = item_1.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_1.click();
                fixture.detectChanges();
                expect(combo.selectedItems()[0]).toEqual('Paris');

                const item_2 = dropdownItems[7];
                checkbox_2 = item_2.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_2.click();
                fixture.detectChanges();
                expect(combo.selectedItems()[1]).toEqual('Oslo');

                const item_3 = dropdownItems[1];
                checkbox_3 = item_3.querySelector('.' + CSS_CLASS_CHECKBOX) as HTMLElement;
                checkbox_3.click();
                fixture.detectChanges();
                expect(combo.selectedItems()[2]).toEqual('Sofia');

                const item_4 = combo.dropdown.items[10] as IgxComboItemComponent;
                combo.dropdown.selectItem(item_4);
                fixture.detectChanges();
                return fixture.whenStable();
            }).then(() => {
                expect(combo.selectedItems()[3]).toEqual('Madrid');
                // expect(checkbox_4.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
                expect(combo.isItemSelected(combo.data[10])).toBeTruthy();
                expect(inputElement.value).toEqual(expectedOutput);

                const item_5 = combo.dropdown.items[9] as IgxComboItemComponent;
                combo.dropdown.selectItem(item_5);
                fixture.detectChanges();
                return fixture.whenStable();
            }).then(() => {
                expectedOutput += ', Rome';
                expect(combo.selectedItems()[4]).toEqual('Rome');
                // expect(checkbox_5.classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();
                expect(combo.isItemSelected(combo.data[9])).toBeTruthy();
                expect(inputElement.value).toEqual(expectedOutput);
            });
        }));
    });

    describe('Rendering tests: ', () => {
        it('All appropriate classes should be applied on combo initialization', () => {
            const defaultComboWidth = '100%';
            const defaultComboDDWidth = '100%';
            const fix = TestBed.createComponent(IgxComboScrollTestComponent);
            fix.detectChanges();

            const comboWrapper = fix.nativeElement.querySelector(CSS_CLASS_COMBO);
            expect(comboWrapper).not.toBeNull();
            expect(comboWrapper.style.width).toEqual(defaultComboWidth);
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-placeholder').nodeValue).toEqual('Items');
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-data').nodeValue).toEqual('Item 1,Item 2,Item 3');
            expect(comboWrapper.attributes.getNamedItem('ng-reflect-filterable')).toBeTruthy();
            expect(comboWrapper.childElementCount).toEqual(1);

            const comboElement = comboWrapper.children[0];
            expect(comboElement.attributes.getNamedItem('class').nodeValue).toEqual(CSS_CLASS_COMBO);
            expect(comboElement.attributes.getNamedItem('role').nodeValue).toEqual('combobox');
            expect(comboElement.style.width).toEqual(defaultComboWidth);
            expect(comboElement.attributes.getNamedItem('aria-haspopup').nodeValue).toEqual('listbox');
            expect(comboElement.attributes.getNamedItem('aria-expanded').nodeValue).toEqual('false');
            expect(comboElement.attributes.getNamedItem('aria-owns').nodeValue).toEqual(fix.componentInstance.combo.dropdown.id);
            expect(comboElement.childElementCount).toEqual(2);

            const inputGroupElement = comboElement.children[0];
            expect(inputGroupElement.attributes.getNamedItem('ng-reflect-type').nodeValue).toEqual('box');
            expect(inputGroupElement.classList.contains(CSS_CLASS_INPUTGROUP)).toBeTruthy();
            expect(inputGroupElement.classList.contains('igx-input-group--box')).toBeTruthy();
            expect(inputGroupElement.classList.contains('igx-input-group--placeholder')).toBeTruthy();
            expect(inputGroupElement.childElementCount).toEqual(1);

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
            expect(inputElement.classList.contains('ng-untouched')).toBeTruthy();
            expect(inputElement.classList.contains('ng-pristine')).toBeTruthy();
            expect(inputElement.classList.contains('ng-valid')).toBeTruthy();
            expect(inputElement.attributes.getNamedItem('type').nodeValue).toEqual('text');

            const dropDownButton = inputGroupBundle.children[1];
            expect(dropDownButton.classList.contains(CSS_CLASS_DROPDOWNBUTTON)).toBeTruthy();
            expect(dropDownButton.classList.contains(CSS_CLASS_INPUTGROUP_BUNDLESUFFIX)).toBeTruthy();
            expect(dropDownButton.childElementCount).toEqual(1);

            const inputGroupBorder = inputGroupWrapper.children[1];
            expect(inputGroupBorder.classList.contains(CSS_CLASS_INPUTGROUP_BORDER)).toBeTruthy();
            expect(inputGroupBorder.childElementCount).toEqual(0);

            const dropDownWrapper = comboElement.children[1];
            expect(dropDownWrapper.classList.contains(CSS_CLASS_COMBO_DROPDOWN)).toBeTruthy();
            expect(dropDownWrapper.attributes.getNamedItem('ng-reflect-width').nodeValue).toEqual(defaultComboDDWidth);
            expect(dropDownWrapper.childElementCount).toEqual(1);

            const dropDownElement = dropDownWrapper.children[0];
            expect(dropDownElement.classList.contains(CSS_CLASS_DROPDOWN)).toBeTruthy();
            expect(dropDownElement.childElementCount).toEqual(1);

            const dropDownList = dropDownElement.children[0];
            expect(dropDownList.classList.contains(CSS_CLASS_DROPDOWNLIST)).toBeTruthy();
            expect(dropDownList.classList.contains('igx-toggle--hidden')).toBeTruthy();
            expect(dropDownList.style.width).toEqual(defaultComboDDWidth);
            expect(dropDownList.childElementCount).toEqual(0);
        });
        it('Should render aria attribute properly', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            const comboContainer = fix.nativeElement.querySelector('.igx-combo');
            expect(comboContainer.getAttribute('aria-expanded')).toMatch('false');
            combo.open();
            tick();
            fix.whenStable().then(() => {
                fix.detectChanges();
                expect(comboContainer.getAttribute('aria-expanded')).toMatch('true');
                combo.close();
                tick();
                fix.whenStable().then(() => {
                    fix.detectChanges();
                    expect(comboContainer.getAttribute('aria-expanded')).toMatch('false');
                });
            });
        }));
        it('Should render placeholder values for inputs properly', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            combo.toggle();
            tick();
            fix.detectChanges();
            fix.whenStable().then(() => {
                expect(combo.collapsed).toBeFalsy();
                expect(combo.placeholder).toEqual('Location');
                expect(combo.comboInput.nativeElement.placeholder).toEqual('Location');

                expect(combo.searchPlaceholder).toEqual('Enter a Search Term');
                expect(combo.searchInput.nativeElement.placeholder).toEqual('Enter a Search Term');

                combo.searchPlaceholder = 'Filter';
                fix.detectChanges();
                tick();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(combo.searchPlaceholder).toEqual('Filter');
                expect(combo.searchInput.nativeElement.placeholder).toEqual('Filter');

                combo.placeholder = 'States';
                fix.detectChanges();
                tick();
                return fix.whenStable();
            }).then(() => {
                expect(combo.placeholder).toEqual('States');
                expect(combo.comboInput.nativeElement.placeholder).toEqual('States');
            });
        }));
        it('Should render dropdown list and item height properly', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            combo.toggle();
            tick();
            fix.detectChanges();
            fix.whenStable().then(() => {
                expect(combo.collapsed).toBeFalsy();
                // NOTE: Minimum itemHeight is 2 rem, per Material Design Guidelines
                expect(combo.itemHeight).toEqual(32); // Default value for itemHeight
                expect(combo.itemsMaxHeight).toEqual(320); // Default value for itemsMaxHeight
                const dropdownItems = fix.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM));
                const dropdownList = fix.debugElement.query(By.css('.igx-combo__content'));
                expect(dropdownList.nativeElement.clientHeight).toEqual(320);
                expect(dropdownItems[0].nativeElement.clientHeight).toEqual(32);

                combo.itemHeight = 47;
                tick();
                fix.detectChanges();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(combo.itemHeight).toEqual(47);
                expect(combo.itemsMaxHeight).toEqual(320);
                const dropdownItems = fix.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM));
                const dropdownList = fix.debugElement.query(By.css('.igx-combo__content'));
                expect(dropdownList.nativeElement.clientHeight).toEqual(320);
                expect(dropdownItems[0].nativeElement.clientHeight).toEqual(47);

                combo.itemsMaxHeight = 438;
                tick();
                fix.detectChanges();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(combo.itemHeight).toEqual(47);
                expect(combo.itemsMaxHeight).toEqual(438);
                const dropdownItems = fix.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM));
                const dropdownList = fix.debugElement.query(By.css('.igx-combo__content'));
                expect(dropdownList.nativeElement.clientHeight).toEqual(438);
                expect(dropdownItems[0].nativeElement.clientHeight).toEqual(47);

                combo.itemsMaxHeight = 1171;
                tick();
                fix.detectChanges();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(combo.itemHeight).toEqual(47);
                expect(combo.itemsMaxHeight).toEqual(1171);
                const dropdownItems = fix.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM));
                const dropdownList = fix.debugElement.query(By.css('.igx-combo__content'));
                expect(dropdownList.nativeElement.clientHeight).toEqual(1171);
                expect(dropdownItems[0].nativeElement.clientHeight).toEqual(47);

                combo.itemHeight = 83;
                tick();
                fix.detectChanges();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(combo.itemHeight).toEqual(83);
                expect(combo.itemsMaxHeight).toEqual(1171);
                const dropdownItems = fix.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM));
                const dropdownList = fix.debugElement.query(By.css('.igx-combo__content'));
                expect(dropdownList.nativeElement.clientHeight).toEqual(1171);
                expect(dropdownItems[0].nativeElement.clientHeight).toEqual(83);
            });
        }));
        it('Should render grouped items properly', async(() => {
            let dropdownContainer;
            let dropdownItems;
            let scrollIndex = 0;
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            const headers: Array<string> = Array.from(new Set(combo.data.map(item => item.region)));
            const dropDownButton = fix.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNBUTTON)).nativeElement;
            dropDownButton.click();
            fix.whenStable().then(() => {
                fix.detectChanges();
                checkGroupedItemsClass();
            });
            const checkGroupedItemsClass = function () {
                setTimeout(function () {
                    fix.detectChanges();
                    dropdownContainer = fix.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                    dropdownItems = dropdownContainer.children;
                    Array.from(dropdownItems).forEach(function (item) {
                        const itemElement = item as HTMLElement;
                        const itemText = itemElement.innerText.toString();
                        const expectedClass: string = headers.includes(itemText) ? CSS_CLASS_HEADERITEM : CSS_CLASS_DROPDOWNLISTITEM;
                        expect(itemElement.classList.contains(expectedClass)).toBeTruthy();
                    });
                    scrollIndex += 10;
                    combo.dropdown.verticalScrollContainer.scrollTo(scrollIndex);
                    if (scrollIndex < combo.data.length) {
                        checkGroupedItemsClass();
                    }
                }, 20);
            };
        }));
        it('Should not throw error when setting data to null', () => {
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();

            const combo = fixture.componentInstance.combo;
            let errorMessage = '';

            try {
                combo.data = null;
                fixture.detectChanges();
            } catch (ex) {
                errorMessage = ex.message;
            }

            expect(errorMessage).toBe('');
            expect(combo.data).not.toBeUndefined();
            expect(combo.data).not.toBeNull();
            expect(combo.data.length).toBe(0);
        });
        it('Should not throw error when setting data to undefined', () => {
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();

            const combo = fixture.componentInstance.combo;
            let errorMessage = '';

            try {
                combo.data = undefined;
                fixture.detectChanges();
            } catch (ex) {
                errorMessage = ex.message;
            }

            expect(errorMessage).toBe('');
            expect(combo.data).not.toBeUndefined();
            expect(combo.data).not.toBeNull();
            expect(combo.data.length).toBe(0);
        });
        it('Should render selected items properly', async(() => {
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
                expect(itemCheckbox.classList.contains(CSS_CLASS_CHECK_GENERAL));
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
        }));
        it('Should render focused items properly', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            const dropdown = combo.dropdown;
            combo.toggle();
            tick();
            fixture.detectChanges();
            dropdown.navigateItem(2);
            fixture.detectChanges();

            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            const focusedItem_1 = dropdownItems[2];
            expect(focusedItem_1.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();

            // Change focus
            dropdown.navigateItem(5);
            fixture.detectChanges();
            const focusedItem_2 = dropdownItems[5];
            expect(focusedItem_2.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
            expect(focusedItem_1.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        }));
        it('Should render focused items when grouped properly', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            const dropdown = combo.dropdown;
            combo.toggle();
            tick();
            fixture.detectChanges();

            dropdown.navigateItem(2);
            fixture.detectChanges();

            const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
            const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
            const focusedItem_1 = dropdownItems[2];
            expect(focusedItem_1.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();

            // Change focus
            dropdown.navigateItem(6);
            fixture.detectChanges();
            const focusedItem_2 = dropdownItems[6];
            expect(focusedItem_2.classList.contains(CSS_CLASS_FOCUSED)).toBeTruthy();
            expect(focusedItem_1.classList.contains(CSS_CLASS_FOCUSED)).toBeFalsy();
        }));
        it('Should adjust combo width to the container element width when set to 100%', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
            fixture.detectChanges();

            const containerWidth = 400;
            const containerElement = fixture.debugElement.query(By.css('.comboContainer')).nativeElement;
            const combo = fixture.componentInstance.combo;
            const comboWrapper = fixture.debugElement.query(By.css(CSS_CLASS_COMBO)).nativeElement;
            let containerElementWidth = containerElement.getBoundingClientRect().width;
            let wrapperWidth = comboWrapper.getBoundingClientRect().width;
            expect(containerElementWidth).toEqual(containerWidth);
            expect(containerElementWidth).toEqual(wrapperWidth);

            combo.toggle();
            tick();
            fixture.detectChanges();

            const inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP_WRAPPER)).nativeElement;
            const dropDownElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
            containerElementWidth = containerElement.getBoundingClientRect().width;
            wrapperWidth = comboWrapper.getBoundingClientRect().width;
            const inputWidth = inputElement.getBoundingClientRect().width;
            const dropDownWidth = dropDownElement.getBoundingClientRect().width;
            expect(containerElementWidth).toEqual(wrapperWidth);
            expect(dropDownWidth).toEqual(containerElementWidth);
            expect(inputWidth).toEqual(containerElementWidth);
        }));
        it('Should render combo width properly when placed in container', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboInContainerFixedWidthComponent);
            fixture.detectChanges();
            let comboWidth = '300px';
            const containerWidth = '500px';

            const combo = fixture.componentInstance.combo;
            const containerElement = fixture.debugElement.query(By.css('.comboContainer')).nativeElement;
            let comboWrapper = fixture.debugElement.query(By.css(CSS_CLASS_COMBO)).nativeElement;
            let containerElementWidth = containerElement.style.width;
            let wrapperWidth = comboWrapper.style.width;
            expect(containerElementWidth).toEqual(containerWidth);
            expect(wrapperWidth).toEqual(comboWidth);

            combo.toggle();
            tick();
            fixture.detectChanges();

            let inputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUTGROUP_WRAPPER)).nativeElement;
            let dropDownElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
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
            dropDownElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
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

    describe('Virtualization tests: ', () => {
        it('Should properly return a reference to the VirtScrollContainer', () => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            expect(combo.dropdown.element).toBeDefined();
            const mockScroll = spyOnProperty<any>(combo.dropdown, 'scrollContainer', 'get').and.callThrough();
            function mockFunc() {
                return mockScroll();
            }
            expect(mockFunc).toThrow();
            combo.dropdown.toggle();
            fix.detectChanges();
            expect(combo.dropdown.element).toBeDefined();
            expect(mockFunc).toBeDefined();
        });
        it('Vertical scrollbar should not be visible when the items fit inside the container', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboScrollTestComponent);
            fixture.detectChanges();
            const dropdown = fixture.componentInstance.combo.dropdown;
            dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const scrollbarContainer = fixture.debugElement
                    .query(By.css('.' + CSS_CLASS_SCROLLBAR_VERTICAL))
                    .nativeElement as HTMLElement;
                const hasScrollbar = scrollbarContainer.scrollHeight > scrollbarContainer.clientHeight;
                expect(hasScrollbar).toBeFalsy();
            });
        }));
        it('Vertical scrollbar should be visible when the items does not fit inside the container', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const dropdown = fixture.componentInstance.combo.dropdown;
            dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const scrollbarContainer = fixture.debugElement
                    .query(By.css('.' + CSS_CLASS_SCROLLBAR_VERTICAL))
                    .nativeElement as HTMLElement;
                const hasScrollbar = scrollbarContainer.scrollHeight > scrollbarContainer.clientHeight;
                expect(hasScrollbar).toBeTruthy();
            });
        }));
    });

    describe('Binding tests: ', () => {
        it('Combo data binding - array of primitive data', () => {
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const data = [...fixture.componentInstance.citiesData];
            const combo = fixture.componentInstance.combo;
            const comboData = combo.data;
            expect(comboData).toEqual(data);
        });
        it('Combo data binding - array of objects', () => {
            const fixture = TestBed.createComponent(IgxComboSampleComponent);
            fixture.detectChanges();
            const data = [...fixture.componentInstance.items];
            const combo = fixture.componentInstance.combo;
            const comboData = combo.data;
            expect(comboData).toEqual(data);
        });
        it('Combo data binding', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboBindingTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            tick(3200);
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(combo.data.length).toEqual(20);
                for (let i = 0; i < 20; i++) {
                    const productIndex = i + 1;
                    expect(combo.data[i]['id']).toEqual(productIndex);
                    expect(combo.data[i]['product']).toEqual('Product ' + productIndex);
                }

                combo.toggle();
                tick();
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
                const dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);

                expect(dropdownItems[0].innerText.trim()).toEqual('Product 1');
            });
        }));

        it('Combo data binding - remote service', async(() => {
            const fixture = TestBed.createComponent(IgxComboRemoteBindingTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            let selectedItem, itemCheckbox, dropdownList, dropdownItems;

            fixture.whenStable().then(() => {
                setTimeout(() => {
                    combo.toggle();

                    dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
                    dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                    selectedItem = dropdownItems[0];
                    itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
                    itemCheckbox.click();
                    fixture.detectChanges();

                    expect(selectedItem.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
                    combo.toggle();
                    combo.toggle();

                    expect(selectedItem.classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
                    selectedItem = dropdownItems[1];
                    itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
                    itemCheckbox.click();
                    selectedItem = dropdownItems[2];
                    itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
                    itemCheckbox.click();

                    let selItems = combo.selectedItems();
                    const dataItems = combo.data;
                    expect(selItems.length).toEqual(3);
                    expect(selItems[0][combo.valueKey]).toEqual(dataItems[0][combo.valueKey]);
                    expect(selItems[1][combo.valueKey]).toEqual(dataItems[1][combo.valueKey]);
                    expect(selItems[2][combo.valueKey]).toEqual(dataItems[2][combo.valueKey]);

                    combo.dropdown.verticalScrollContainer.scrollTo(20);
                    setTimeout(() => {
                        combo.dropdown.verticalScrollContainer.scrollTo(0);
                        setTimeout(() => {
                            fixture.detectChanges();
                            expect(selItems.length).toEqual(3);
                            expect(selItems[0][combo.valueKey]).toEqual(dataItems[0][combo.valueKey]);
                            expect(selItems[1][combo.valueKey]).toEqual(dataItems[1][combo.valueKey]);
                            expect(selItems[2][combo.valueKey]).toEqual(dataItems[2][combo.valueKey]);

                            selectedItem = dropdownItems[0];
                            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
                            itemCheckbox.click();
                            fixture.detectChanges();
                            selItems = combo.selectedItems();
                            expect(selItems.length).toEqual(2);
                            expect(selItems[0][combo.valueKey]).toEqual(dataItems[1][combo.valueKey]);
                            expect(selItems[1][combo.valueKey]).toEqual(dataItems[2][combo.valueKey]);

                            selectedItem = dropdownItems[2];
                            itemCheckbox = selectedItem.querySelector('.' + CSS_CLASS_CHECKBOX);
                            itemCheckbox.click();
                            fixture.detectChanges();
                            selItems = combo.selectedItems();
                            expect(selItems.length).toEqual(1);
                            expect(selItems[0][combo.valueKey]).toEqual(dataItems[1][combo.valueKey]);

                            combo.selectItems([dataItems[0]]);
                            fixture.detectChanges();
                            selItems = combo.selectedItems();
                            expect(selItems.length).toEqual(2);
                            expect(selItems[0][combo.valueKey]).toEqual(dataItems[1][combo.valueKey]);
                            expect(selItems[1][combo.valueKey]).toEqual(dataItems[0][combo.valueKey]);

                            combo.close();
                            fixture.detectChanges();
                            selItems = combo.selectedItems();
                            expect(selItems.length).toEqual(2);
                            expect(selItems[0][combo.valueKey]).toEqual(dataItems[1][combo.valueKey]);
                            expect(selItems[1][combo.valueKey]).toEqual(dataItems[0][combo.valueKey]);
                        }, 1000);
                    }, 1000);
                }, 1000);
            });
        }));
        it('The empty template should be rendered when combo data source is not set', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxComboEmptyTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            combo.dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                const dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
                const dropdownItemsContainer = fixture.debugElement.query(By.css('.igx-combo__content')).nativeElement;
                const dropDownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                const listItems = dropDownContainer.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(listItems.length).toEqual(0);
                expect(dropdownList.childElementCount).toEqual(3);
                // Expect no items to be rendered in the virtual container
                expect(dropdownItemsContainer.children[0].childElementCount).toEqual(0);
                // Expect the list child (NOT COMBO ITEM) to be a container with "The list is empty";
                const dropdownItem = dropdownList.lastElementChild as HTMLElement;
                expect(dropdownItem.firstElementChild.textContent).toEqual('The list is empty');
            });
        }));
        it('Combo data binding - change data source runtime', () => {
            const newData = ['Item 1', 'Item 2'];
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const data = [...fixture.componentInstance.citiesData];
            const combo = fixture.componentInstance.combo;
            expect(combo.data).toEqual(data);
            combo.data = newData;
            fixture.detectChanges();
            expect(combo.data).toEqual(newData);
        });
    });

    describe('Grouping tests: ', () => {
        it('Combo should group items correctly', () => {
            const fix = TestBed.createComponent(IgxComboInputTestComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            combo.dropdown.toggle();
            fix.whenStable().then(() => {
                fix.detectChanges();
                expect(combo.groupKey).toEqual('region');
                expect(combo.dropdown.items[0].itemData.field === combo.data[0].field).toBeFalsy();
                expect(combo.sortingExpressions[0]).toEqual({
                    fieldName: 'region',
                    dir: SortingDirection.Asc,
                    ignoreCase: true
                });
                const listItems = fix.debugElement.queryAll(By.css('.' + CSS_CLASS_DROPDOWNLISTITEM));
                const listHeaders = fix.debugElement.queryAll(By.css('.' + CSS_CLASS_HEADERITEM));
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
        it('Should properly handle click events on Disabled / Header items', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            combo.toggle();
            spyOn(combo.dropdown, 'selectItem').and.callThrough();
            tick();
            fix.whenStable().then(() => {
                fix.detectChanges();
                expect(combo.collapsed).toBeFalsy();
                expect(combo.dropdown.headers).toBeDefined();
                expect(combo.dropdown.headers.length).toEqual(2);
                combo.dropdown.headers[0].clicked({});
                fix.detectChanges();

                const mockObj = jasmine.createSpyObj('nativeElement', ['focus']);
                spyOnProperty(combo.dropdown, 'focusedItem', 'get').and.returnValue({ element: { nativeElement: mockObj } });
                combo.dropdown.headers[0].clicked({});
                fix.detectChanges();
                expect(mockObj.focus).toHaveBeenCalled();

                combo.dropdown.items[0].clicked({});
                fix.detectChanges();
                expect(document.activeElement).toEqual(combo.searchInput.nativeElement);
            });
        }));

        it('Should properly add items to the defaultFallbackGroup', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            combo.toggle();
            tick();
            const comboSearch = combo.searchInput.nativeElement;
            const fallBackGroup = combo.defaultFallbackGroup;
            const initialDataLength = combo.data.length + 0;
            expect(combo.filteredData.filter((e) => e[combo.groupKey] === undefined)).toEqual([]);
            combo.searchValue = 'My Custom Item 1';
            tick();
            combo.addItemToCollection();
            tick();
            combo.searchValue = 'My Custom Item 2';
            combo.addItemToCollection();
            tick();
            combo.searchValue = 'My Custom Item 3';
            combo.addItemToCollection();
            tick();
            combo.searchValue = 'My Custom Item';
            comboSearch.value = 'My Custom Item';
            comboSearch.dispatchEvent(new Event('input'));
            fix.detectChanges();
            tick();
            expect(combo.data.length).toEqual(initialDataLength + 3);
            expect(combo.dropdown.items.length).toEqual(4); // Add Item button is included
            expect(combo.dropdown.headers.length).toEqual(1);
            expect(combo.dropdown.headers[0].element.nativeElement.innerText).toEqual(fallBackGroup);
        }));
    });

    describe('Filtering tests: ', () => {
        it('Should properly get/set filteredData', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            combo.toggle();
            tick();
            fix.detectChanges();
            const initialData = [...combo.filteredData];
            let firstFilter;
            expect(combo.searchValue).toEqual('');
            spyOn(combo, 'filter').and.callThrough();
            combo.searchValue = 'New ';
            combo.handleInputChange();
            tick();
            fix.whenStable().then(() => {
                fix.detectChanges();
                expect(combo.filter).toHaveBeenCalledTimes(1);
                expect(combo.filteredData.length).toBeLessThan(initialData.length);
                firstFilter = [...combo.filteredData];
                combo.searchValue += '  ';
                combo.handleInputChange();
                tick();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(combo.filteredData.length).toBeLessThan(initialData.length);
                expect(combo.filter).toHaveBeenCalledTimes(2);
                combo.searchValue = '';
                combo.handleInputChange();
                tick();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(combo.filteredData.length).toEqual(initialData.length);
                expect(combo.filteredData.length).toBeGreaterThan(firstFilter.length);
                expect(combo.filter).toHaveBeenCalledTimes(3);
                combo.filteringExpressions = [];
                tick();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(combo.filteredData.length).toEqual(initialData.length);
                expect(combo.filter).toHaveBeenCalledTimes(3);
            });
        }));
        it('Should properly select/deselect filteredData', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            combo.toggle();
            tick();
            fix.detectChanges();
            const initialData = [...combo.filteredData];

            expect(combo.searchValue).toEqual('');
            spyOn(combo, 'filter').and.callThrough();
            combo.searchValue = 'New ';
            combo.handleInputChange();
            tick();
            fix.whenStable().then(() => {
                fix.detectChanges();
                expect(combo.filter).toHaveBeenCalledTimes(1);
                expect(combo.filteredData.length).toBeLessThan(initialData.length);
                expect(combo.filteredData.length).toEqual(4);

                combo.selectAllItems();
                fix.detectChanges();
                expect(combo.selectedItems().length).toEqual(4);

                combo.selectAllItems(true);
                fix.detectChanges();
                expect(combo.selectedItems().length).toEqual(51);

                combo.deselectAllItems();
                fix.detectChanges();
                expect(combo.selectedItems().length).toEqual(47);

                combo.deselectAllItems(true);
                fix.detectChanges();
                expect(combo.selectedItems().length).toEqual(0);
            });
        }));
        it('Should properly sort filteredData', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            spyOn(combo, 'sort').and.callThrough();
            const clearSpy = spyOn<any>(combo, 'clearSorting').and.callThrough();
            combo.toggle();
            tick();
            fix.detectChanges();
            expect(combo.sort).toHaveBeenCalledTimes(0);
            expect(combo.sortingExpressions.length).toEqual(1);
            expect(combo.sortingExpressions[0].fieldName).toEqual('region');
            expect(combo.groupKey).toEqual('region');
            const initialFirstItem = '' + combo.filteredData[0].field;
            combo.groupKey = '';
            tick();
            fix.detectChanges();
            expect(combo.sort).toHaveBeenCalledTimes(1);
            expect(combo.groupKey).toEqual('');
            expect(combo.sortingExpressions.length).toEqual(0);
            expect(combo.sortingExpressions[0]).toBeUndefined();
            expect(combo.filteredData[0].field !== initialFirstItem).toBeTruthy();
            expect(clearSpy).toHaveBeenCalledTimes(1);
            combo.groupKey = null;
            tick();
            fix.detectChanges();
            expect(combo.sort).toHaveBeenCalledTimes(2);
            expect(combo.groupKey).toEqual(null);
            expect(combo.sortingExpressions.length).toEqual(0);
            expect(combo.sortingExpressions[0]).toBeUndefined();
            expect(combo.filteredData[0].field !== initialFirstItem).toBeTruthy();
            expect(clearSpy).toHaveBeenCalledTimes(2);
        }));
        it('Should properly handleInputChange', () => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            spyOn(combo, 'filter');
            spyOn(combo.onSearchInput, 'emit');

            combo.handleInputChange();

            fix.detectChanges();
            expect(combo.filter).toHaveBeenCalledTimes(1);
            expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(0);

            combo.handleInputChange({ key: 'Fake' });

            fix.detectChanges();
            expect(combo.filter).toHaveBeenCalledTimes(2);
            expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(1);
            expect(combo.onSearchInput.emit).toHaveBeenCalledWith({ key: 'Fake' });

            combo.handleInputChange('');
            fix.detectChanges();
            expect(combo.filter).toHaveBeenCalledTimes(3);
            expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(2);
            expect(combo.onSearchInput.emit).toHaveBeenCalledWith('');

            combo.filterable = false;
            fix.detectChanges();

            combo.handleInputChange();
            expect(combo.filter).toHaveBeenCalledTimes(3);
            expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(2);
        });
        it('Should properly handle addItemToCollection calls (Complex data)', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
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
                field: 'myItem',
                region: 'Other'
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
            combo.toggle();
            tick();
            fix.detectChanges();
            expect(combo.collapsed).toEqual(false);
            expect(combo.searchInput).toBeDefined();
            combo.searchValue = 'myItem3';
            combo.addItemToCollection();
            fix.detectChanges();
            expect(initialData.length).toBeLessThan(combo.data.length);
            expect(combo.data.length).toEqual(initialData.length + 3);
            expect(combo.onAddition.emit).toHaveBeenCalledTimes(3);
            expect(combo.data[combo.data.length - 1]).toEqual({
                field: 'myItem3',
                region: 'exampleRegion'
            });
        }));
        it('Should properly handle addItemToCollection calls (Primitive data)', () => {
            const fix = TestBed.createComponent(IgxComboTestComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
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
            expect(combo.data[combo.data.length - 1]).toEqual('myItem');
        });
        it('Typing in the textbox input filters the dropdown items', fakeAsync(() => {
            const event = new Event('input');
            const expectedValues = ['Paris', 'Prague', 'Padua', 'Palermo', 'Palma de Mallorca'];
            let searchInputElement;
            let dropdownList;
            let dropdownItems;
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            combo.dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                searchInputElement = fixture.debugElement.query(By.css('input[name=\'searchInput\']')).nativeElement;
                searchInputElement.value = 'P';
                searchInputElement.dispatchEvent(event);
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(dropdownItems.length).toEqual(5);
                checkFilteredItems(dropdownItems);
                searchInputElement.value = 'Pa';
                searchInputElement.dispatchEvent(event);
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(dropdownItems.length).toEqual(4);
                expectedValues.splice(1, 1);
                checkFilteredItems(dropdownItems);
                searchInputElement.value = 'Pal';
                searchInputElement.dispatchEvent(event);
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(dropdownItems.length).toEqual(2);
                expectedValues.splice(0, 1);
                expectedValues.splice(0, 1);
                checkFilteredItems(dropdownItems);
                searchInputElement.value = 'Pala';
                searchInputElement.dispatchEvent(event);
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(dropdownItems.length).toEqual(0);
            });

            const checkFilteredItems = function (listItems: HTMLElement[]) {
                listItems.forEach(function (el) {
                    const itemText: string = el.textContent.trim();
                    expect(expectedValues).toContain(itemText);
                });
            };
        }));
        it('Should display empty list when the search query does not match any item', fakeAsync(() => {
            let searchInputElement;
            let dropdownList: HTMLElement;
            let dropDownContainer: HTMLElement;
            let listItems;
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            combo.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                searchInputElement = fixture.debugElement.query(By.css('input[name=\'searchInput\']')).nativeElement;
                searchInputElement.value = 'P';
                searchInputElement.dispatchEvent(new Event('input'));
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWNLIST)).nativeElement;
                dropDownContainer = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                listItems = dropDownContainer.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(listItems.length).toEqual(5);
                expect(dropdownList.childElementCount).toEqual(2);
                searchInputElement.value = 'Pat';
                searchInputElement.dispatchEvent(new Event('input'));
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                listItems = dropDownContainer.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(listItems.length).toEqual(0);
                expect(dropdownList.childElementCount).toEqual(3);
                const dropdownItem = dropdownList.lastElementChild as HTMLElement;
                expect(dropdownItem.firstElementChild.textContent).toEqual('The list is empty');
            });
        }));
        it('Typing in the textbox should fire onSearchInput event', fakeAsync(() => {
            const event = new Event('input');
            let searchInputElement;
            let timesFired = 1;
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            spyOn(combo.onSearchInput, 'emit').and.callThrough();
            combo.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                searchInputElement = fixture.debugElement.query(By.css('input[name=\'searchInput\']')).nativeElement;
                searchInputElement.value = 'P';
                searchInputElement.dispatchEvent(event);
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(timesFired);
                searchInputElement.value = 'Pa';
                searchInputElement.dispatchEvent(event);
                timesFired++;
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(timesFired);
                searchInputElement.value = 'Pal';
                searchInputElement.dispatchEvent(event);
                timesFired++;
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(timesFired);
                searchInputElement.value = 'Pala';
                searchInputElement.dispatchEvent(event);
                timesFired++;
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                expect(combo.onSearchInput.emit).toHaveBeenCalledTimes(timesFired);
            });
        }));
        it('Clearing the filter textbox should restore the initial combo dropdown list', fakeAsync(() => {
            const event = new Event('input');
            let searchInputElement;
            let dropdownList;
            let dropdownItems;
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            combo.dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                searchInputElement = fixture.debugElement.query(By.css('input[name=\'searchInput\']')).nativeElement;
                searchInputElement.value = 'P';
                searchInputElement.dispatchEvent(event);
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(dropdownItems.length).toEqual(5);
                expect(combo.filteredData.length).toEqual(5);
                searchInputElement.value = 'Pa';
                searchInputElement.dispatchEvent(event);
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(dropdownItems.length).toEqual(4);
                expect(combo.filteredData.length).toEqual(4);
                searchInputElement.value = 'P';
                searchInputElement.dispatchEvent(event);
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(dropdownItems.length).toEqual(5);
                expect(combo.filteredData.length).toEqual(5);
                searchInputElement.value = '';
                searchInputElement.dispatchEvent(event);
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(dropdownItems.length).toEqual(10);
                expect(combo.filteredData.length).toEqual(combo.data.length);
                combo.filteredData.forEach(function (item) {
                    expect(combo.data).toContain(item);
                });
            });
        }));
        it('Escape key should clear the textbox input and close the dropdown list', fakeAsync(() => {
            let searchInputElement;
            let dropdownList;
            let dropdownItems;
            const fixture = TestBed.createComponent(IgxComboTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            combo.dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                searchInputElement = fixture.debugElement.query(By.css('input[name=\'searchInput\']')).nativeElement;
                searchInputElement.value = 'P';
                searchInputElement.dispatchEvent(new Event('input'));
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                dropdownList = fixture.debugElement.query(By.css('.' + CSS_CLASS_CONTAINER)).nativeElement;
                dropdownItems = dropdownList.querySelectorAll('.' + CSS_CLASS_DROPDOWNLISTITEM);
                expect(dropdownItems.length).toEqual(5);
                const event = new KeyboardEvent('keyup', { 'key': 'Escape' });
                searchInputElement.dispatchEvent(event);
                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();
                expect(combo.dropdown.collapsed).toBeTruthy();
                expect(searchInputElement.textContent).toEqual('');
            });
        }));
        it('When no results are filtered for a group, the group header should not be visible', fakeAsync(() => {
            let searchInputElement;
            let dropdownList;
            const fixture = TestBed.createComponent(IgxComboInputTestComponent);
            fixture.detectChanges();
            const combo = fixture.componentInstance.combo;
            const filteredItems: { [index: string]: any; } = combo.data.reduce(function (filteredArray, item) {
                if (item.field.toLowerCase().trim().includes('mi')) {
                    (filteredArray[item['region']] = filteredArray[item['region']] || []).push(item);
                }
                return filteredArray;
            }, {});
            combo.dropdown.toggle();
            tick();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                searchInputElement = fixture.debugElement.query(By.css('input[name=\'searchInput\']')).nativeElement;
                searchInputElement.value = 'Mi';
                searchInputElement.dispatchEvent(new Event('input'));
                return fixture.whenStable();
            }).then(() => {
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
        }));
        it('Existing values - clear button dismisses the input text', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const component = fix.componentInstance;
            const combo = fix.componentInstance.combo;
            combo.toggle();
            tick();
            fix.detectChanges();
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.value).toEqual('');
            expect(combo.comboInput.nativeElement.value).toEqual('');
            const triggerSelectionSpy = spyOn<any>(combo, 'triggerSelectionChange').and.callThrough();
            const valueSetterSpy = spyOnProperty<any>(combo, 'value', 'set').and.callThrough();
            combo.selectItems([component.items[0], component.items[1]]);
            tick();
            fix.whenStable().then(() => {
                tick();
                fix.detectChanges();
                return fix.whenStable();
            }).then(() => {
                expect(valueSetterSpy).toHaveBeenCalled();
                expect(triggerSelectionSpy).toHaveBeenCalled();
                expect(combo.comboInput.nativeElement.value).toEqual(component.items[0].field + ', ' + component.items[1].field);
                expect(combo.value).toEqual(component.items[0].field + ', ' + component.items[1].field);
                expect(combo.selectedItems()).toEqual([component.items[0], component.items[1]]);
                fix.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON)).nativeElement.click();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                return fix.whenStable();
            }).then(() => {
                expect(combo.comboInput.nativeElement.value).toEqual('');
                expect(combo.value).toEqual('');
                expect(combo.selectedItems()).toEqual([]);
            });
        }));
        it('Custom values - clear button dismisses the input text', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            combo.toggle();
            tick();
            fix.detectChanges();
            expect(combo.selectedItems()).toEqual([]);
            expect(combo.value).toEqual('');
            expect(combo.comboInput.nativeElement.value).toEqual('');
            combo.searchValue = 'New ';
            const mockEvent = jasmine.createSpyObj('event', ['stopPropagation', 'preventDefaults']);
            tick();
            fix.whenStable().then(() => {
                fix.detectChanges();
                return fix.whenStable();
            }).then(() => {
                expect(combo.isAddButtonVisible()).toEqual(true);
                const addItemButton = fix.debugElement.query(By.css('.igx-combo__add-item'));
                expect(addItemButton.nativeElement).toBeDefined();
                addItemButton.nativeElement.click(mockEvent);
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                return fix.whenStable();
            }).then(() => {
                expect(combo.selectedItems()).toEqual([{ field: 'New', region: 'Other' }]);
                expect(combo.comboInput.nativeElement.value).toEqual('New');
                fix.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON)).nativeElement.click(mockEvent);
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                return fix.whenStable();
            }).then(() => {
                expect(combo.selectedItems()).toEqual([]);
                expect(combo.comboInput.nativeElement.value).toEqual('');
            });
        }));
        it('Custom values - typing a value that matches an already selected item should remove the ADD ITEM button', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboSampleComponent);
            fix.detectChanges();
            let addItem;
            const combo = fix.componentInstance.combo;
            combo.dropdown.toggle();
            tick();
            fix.whenStable().then(() => {
                fix.detectChanges();
                addItem = fix.debugElement.query(By.css('.igx-combo__add'));
                expect(addItem).toEqual(null);
                expect(combo.children.length).toBeTruthy();
                combo.searchInput.nativeElement.value = 'New';
                combo.searchInput.nativeElement.dispatchEvent(new Event('input', {}));
                tick();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(combo.searchValue).toEqual('New');
                addItem = fix.debugElement.query(By.css('.igx-combo__add'));
                expect(addItem === null).toBeFalsy();
                expect(combo.children.length).toBeTruthy();

                combo.searchInput.nativeElement.value = 'New York';
                combo.searchInput.nativeElement.dispatchEvent(new Event('input', {}));
                tick();
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                expect(combo.searchValue).toEqual('New York');
                return fix.whenStable();
            }).then(() => {
                fix.detectChanges();
                addItem = fix.debugElement.query(By.css('.igx-combo__add'));
                expect(addItem).toEqual(null);
                expect(combo.children.length).toBeTruthy();
            });
        }));

        it('Disable/Enable filtering at runtime', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboInputTestComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;

            combo.dropdown.open(); // Open combo - all data items are in filteredData
            tick();
            fix.detectChanges();
            expect(combo.dropdown.items.length).toBeGreaterThan(0);
            combo.searchInput.nativeElement.value = 'Not-available item';
            combo.searchInput.nativeElement.dispatchEvent(new Event('input', {}));
            tick();
            fix.detectChanges();
            expect(combo.dropdown.items.length).toEqual(0); // No items are available because of filtering
            combo.dropdown.close(); // Filter is cleared on close
            tick();
            fix.detectChanges();
            combo.filterable = false; // Filtering is disabled
            tick();
            fix.detectChanges();
            combo.dropdown.open(); // All items are visible since filtering is disabled
            tick();
            fix.detectChanges();
            expect(combo.dropdown.items.length).toBeGreaterThan(0); // All items are visible since filtering is disabled
            combo.searchInput.nativeElement.value = 'Not-available item';
            combo.searchInput.nativeElement.dispatchEvent(new Event('input', {}));
            tick();
            fix.detectChanges();
            expect(combo.dropdown.items.length).toBeGreaterThan(0); // All items are visible since filtering is disabled
            combo.dropdown.close(); // Filter is cleared on close
            tick();
            fix.detectChanges();
            tick();
            combo.filterable = true; // Filtering is re-enabled
            tick();
            fix.detectChanges();
            combo.dropdown.open(); // Filter is cleared on open
            tick();
            fix.detectChanges();
            tick();
            expect(combo.dropdown.items.length).toBeGreaterThan(0);
        }));
    });

    describe('Form control tests: ', () => {
        it('Should properly initialize when used as a form control', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxComboFormComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            expect(combo).toBeDefined();
            const comboFormReference = fix.componentInstance.reactiveForm.controls.townCombo;
            expect(comboFormReference).toBeDefined();
            expect(combo.selectedItems()).toEqual(comboFormReference.value);
            expect(combo.selectedItems().length).toEqual(1);
            expect(combo.selectedItems()[0].field).toEqual('Connecticut');
            expect(combo.valid).toEqual(IgxComboState.INITIAL);
            const clearButton = fix.debugElement.query(By.css('.' + CSS_CLASS_CLEARBUTTON)).nativeElement;
            clearButton.click();
            fix.detectChanges();
            fix.whenStable().then(() => {
                fix.detectChanges();
                expect(combo.valid).toEqual(IgxComboState.INVALID);
                combo.selectItems([combo.dropdown.items[0], combo.dropdown.items[1]]);
                expect(combo.valid).toEqual(IgxComboState.VALID);
            });
        }));
        it('Can be enabled/disabled when used as a form control', () => {
            const fix = TestBed.createComponent(IgxComboFormComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            expect(combo).toBeDefined();
            const form = fix.componentInstance.reactiveForm;
            const comboFormReference = form.controls.townCombo;
            expect(comboFormReference).toBeDefined();
            expect(combo.disabled).toBeFalsy();
            expect(comboFormReference.disabled).toBeFalsy();
            spyOn(combo, 'onInputClick');
            spyOn(combo, 'setDisabledState').and.callThrough();
            const mockClick = jasmine.createSpyObj('event', ['stopPropagation', 'preventDefault']);
            combo.comboInput.nativeElement.click();
            fix.detectChanges();
            expect(combo.onInputClick).toHaveBeenCalledTimes(1);

            form.disable();
            // Disabling the form disables all of the controls in it
            fix.detectChanges();
            expect(comboFormReference.disabled).toBeTruthy();
            expect(combo.disabled).toBeTruthy();
            expect(combo.setDisabledState).toHaveBeenCalledTimes(1);

            // Disabled form controls don't handle click events
            combo.comboInput.nativeElement.click();
            fix.detectChanges();
            expect(combo.onInputClick).toHaveBeenCalledTimes(1);

            // Can enabling the form re-enables all of the controls in it
            form.enable();
            fix.detectChanges();
            expect(comboFormReference.disabled).toBeFalsy();
            expect(combo.disabled).toBeFalsy();
        });
        it('Should change value when addressed as a form control', () => {
            const fix = TestBed.createComponent(IgxComboFormComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            expect(combo).toBeDefined();
            const form = fix.componentInstance.reactiveForm;
            const comboFormReference = form.controls.townCombo;
            expect(comboFormReference).toBeDefined();
            expect(combo.selectedItems()).toEqual(comboFormReference.value);

            // Form -> Combo
            comboFormReference.setValue([{ field: 'Missouri', region: 'West North Central' }]);
            fix.detectChanges();
            expect(combo.selectedItems()).toEqual([{ field: 'Missouri', region: 'West North Central' }]);

            // Combo -> Form
            combo.selectItems([{ field: 'South Carolina', region: 'South Atlantic' }], true);
            fix.detectChanges();
            expect(comboFormReference.value).toEqual([{ field: 'South Carolina', region: 'South Atlantic' }]);
        });
        it('Should properly submit values when used as a form control', () => {
            const fix = TestBed.createComponent(IgxComboFormComponent);
            fix.detectChanges();
            const combo = fix.componentInstance.combo;
            expect(combo).toBeDefined();
            const form = fix.componentInstance.reactiveForm;
            const comboFormReference = form.controls.townCombo;
            expect(comboFormReference).toBeDefined();
            expect(combo.selectedItems()).toEqual(comboFormReference.value);
            expect(form.status).toEqual('INVALID');
            form.controls.password.setValue('TEST');
            form.controls.firstName.setValue('TEST');

            spyOn(console, 'log');
            fix.detectChanges();
            expect(form.status).toEqual('VALID');
            fix.debugElement.query(By.css('button')).nativeElement.click();
        });
    });

    it('Should properly close on click outside of the combo dropdown', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        expect(combo).toBeDefined();
        combo.toggle();
        tick();
        expect(combo.collapsed).toEqual(false);
        document.documentElement.dispatchEvent(new Event('click'));
        tick();
        expect(combo.collapsed).toEqual(true);
    }));

    it('Should restore position of dropdown scroll after opening', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxComboSampleComponent);
        fix.detectChanges();
        const combo = fix.componentInstance.combo;
        expect(combo).toBeDefined();
        spyOn(combo.dropdown, 'onToggleOpening').and.callThrough();
        spyOn(combo.dropdown, 'onToggleOpened').and.callThrough();
        spyOn(combo.dropdown, 'onToggleClosing').and.callThrough();
        spyOn(combo.dropdown, 'onToggleClosed').and.callThrough();
        combo.toggle();
        tick();
        expect(combo.collapsed).toEqual(false);
        expect(combo.dropdown.onToggleOpening).toHaveBeenCalledTimes(1);
        expect(combo.dropdown.onToggleOpened).toHaveBeenCalledTimes(1);
        let vContainerScrollHeight = combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollHeight;
        expect(combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollTop).toEqual(0);
        expect(vContainerScrollHeight).toBeGreaterThan(combo.itemHeight);
        combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollTop = Math.floor(vContainerScrollHeight / 2);
        tick(1000);
        expect(combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollTop).toBeGreaterThan(0);
        document.documentElement.dispatchEvent(new Event('click'));
        tick(500);
        expect(combo.collapsed).toEqual(true);
        expect(combo.dropdown.onToggleClosing).toHaveBeenCalledTimes(1);
        expect(combo.dropdown.onToggleClosed).toHaveBeenCalledTimes(1);
        combo.toggle();
        tick(500);
        expect(combo.collapsed).toEqual(false);
        expect(combo.dropdown.onToggleOpening).toHaveBeenCalledTimes(2);
        expect(combo.dropdown.onToggleOpened).toHaveBeenCalledTimes(2);
        vContainerScrollHeight = combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollHeight;
        expect(combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollTop).toEqual(vContainerScrollHeight / 2);

        combo.searchInput.nativeElement.value = 'c';
        combo.searchInput.nativeElement.dispatchEvent(new Event('input', {}));
        expect(combo.dropdown.verticalScrollContainer.getVerticalScroll().scrollTop).toEqual(0);
    }));

    it(`Should handle enter keydown on "Add Item" properly`, fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxComboSampleComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        expect(combo).toBeDefined();
        combo.toggle();

        tick();
        fixture.detectChanges();
        spyOnProperty(combo, 'searchValue', 'get').and.returnValue('My New Custom Item');
        combo.handleInputChange();

        tick();
        fixture.detectChanges();
        expect(combo.collapsed).toBeFalsy();
        expect(combo.value).toEqual('');

        tick();
        expect(combo.isAddButtonVisible()).toBeTruthy();
        const dropdownHandler = document.getElementsByClassName('igx-combo__content')[0] as HTMLElement;
        combo.handleKeyUp(new KeyboardEvent('keyup', { key: 'ArrowDown' }));

        tick();
        fixture.detectChanges();
        dropdownHandler.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));

        tick();
        fixture.detectChanges();
        // SPACE does not add item to collection
        expect(combo.collapsed).toBeFalsy();
        expect(combo.value).toEqual('');
        dropdownHandler.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        tick();
        fixture.detectChanges();
        expect(combo.collapsed).toBeFalsy();
        expect(combo.value).toEqual('My New Custom Item');
    }));

    it(`Should properly display "Add Item" button when filtering is off`, fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxComboInContainerTestComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        combo.filterable = false;
        tick();
        expect(combo).toBeDefined();
        expect(combo.filterable).toEqual(false);
        expect(combo.isAddButtonVisible()).toEqual(false);
        combo.toggle();
        tick();
        expect(combo.collapsed).toEqual(false);
        const comboInput = combo.searchInput.nativeElement;
        comboInput.value = combo.data[2];
        comboInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        tick();
        expect(combo.isAddButtonVisible()).toEqual(false);
        comboInput.value = combo.searchValue.substring(0, 2);
        comboInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        tick();
        expect(combo.isAddButtonVisible()).toEqual(true);
    }));

    it(`Should handle click on "Add Item" properly`, fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxComboSampleComponent);
        fixture.detectChanges();
        const combo = fixture.componentInstance.combo;
        expect(combo).toBeDefined();
        combo.toggle();

        tick();
        fixture.detectChanges();
        spyOnProperty(combo, 'searchValue', 'get').and.returnValue('My New Custom Item');
        combo.handleInputChange();

        tick();
        fixture.detectChanges();
        expect(combo.collapsed).toBeFalsy();
        expect(combo.value).toEqual('');
        expect(combo.isAddButtonVisible()).toBeTruthy();
        const dropdownHandler = document.getElementsByClassName('igx-combo__content')[0] as HTMLElement;
        combo.handleKeyUp(new KeyboardEvent('keyup', { key: 'ArrowDown' }));

        tick();
        fixture.detectChanges();
        dropdownHandler.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));

        tick();
        fixture.detectChanges();
        // SPACE does not add item to collection
        expect(combo.collapsed).toBeFalsy();
        expect(combo.value).toEqual('');
        combo.dropdown.focusedItem.element.nativeElement.click();

        tick();
        fixture.detectChanges();
        expect(combo.collapsed).toBeFalsy();
        expect(combo.value).toEqual('My New Custom Item');
    }));
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
        'Prague',
        'Padua',
        'Palermo',
        'Palma de Mallorca'];

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
    @ViewChild('combo', { read: IgxComboComponent })
    public combo: IgxComboComponent;

    public data: string[] = [
        'Item 1',
        'Item 2',
        'Item 3'];

}

@Component({
    template: `
        <igx-combo #combo [placeholder]="'Location'" [data]='items'
        [filterable]='true' [valueKey]="'field'" [groupKey]="'region'" [width]="'400px'" [allowCustomValues]="true">
            <ng-template #itemTemplate let-display let-key="valueKey">
                <div class="state-card--simple">
                    <span class="small-red-circle"></span>
                    <div class="display-value--main">State: {{display[key]}}</div>
                    <div class="display-value--sub">Region: {{display.region}}</div>
                </div>
            </ng-template>
            <ng-template #headerTemplate>
                <div class="header-class">This is a header</div>
            </ng-template>
            <ng-template #footerTemplate>
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

    onSelectionChange(ev) {
    }
}

@Component({
    template: `
        <p>Change data to:</p>
        <label id="mockID">Combo Label</label>
        <igx-combo #combo [placeholder]="'Location'" [data]='items' [height]="'400px'"
        [itemsMaxHeight]='400' [itemsWidth]="'399px'" [itemHeight]='40'
        [filterable]='true' [valueKey]="'field'" [groupKey]="'region'" [width]="'400px'"
        [ariaLabelledBy]="'mockID'">
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
                    [data]="items" [displayKey]="'field'" [valueKey]="'field'" [groupKey]="'region'"></igx-combo>
            </p>
            <p>
                <button type="submit" [disabled]="!reactiveForm.valid">Submit</button>
            </p>
        </form>
`
})

class IgxComboFormComponent {
    @ViewChild('comboReactive', { read: IgxComboComponent })
    public combo: IgxComboComponent;
    public items = [];

    get valuesTemplate() {
        return this.combo.selectedItems();
    }
    set valuesTemplate(values: Array<any>) {
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
        <igx-combo #combo [placeholder]="'Products'" [data]='items' [height]="'400px'" [itemsMaxHeight]='400'
        [itemHeight]='40' [valueKey]="'id'" [displayKey]="'product'" [width]="'400px'"
        [ariaLabelledBy]="'mockID'">
        </igx-combo>
`,
    providers: [LocalService]
})
export class IgxComboBindingTestComponent {

    @ViewChild('combo', { read: IgxComboComponent })
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
        <igx-combo #combo class="input-container" width="300px" [itemsMaxHeight]="250"
            [data]="rData | async" [valueKey]="'ID'" [displayKey]="'ProductName'"
            (onDataPreLoad)="dataLoading($event)" (onSearchInput)="searchInput($event)" (onOpening)="searchInput('')"
            placeholder="Location(s)" searchPlaceholder="Search..." [filterable]="false">
        </igx-combo>
`,
    providers: [RemoteService, HttpClient]
})
export class IgxComboRemoteBindingTestComponent implements OnInit, AfterViewInit {

    @ViewChild('combo', { read: IgxComboComponent })
    public combo: IgxComboComponent;
    public rData: any;
    public prevRequest: any;

    constructor(private remoteService: RemoteService, public cdr: ChangeDetectorRef) {

    }

    public ngOnInit() {
        this.rData = this.remoteService.remoteData;
    }

    public ngAfterViewInit() {
        this.remoteService.getData(this.combo.virtualizationState, null, (data) => {
            this.combo.totalItemCount = data.Count;
            this.cdr.detectChanges();
        });
    }

    public dataLoading(evt) {
        if (this.prevRequest) {
            this.prevRequest.unsubscribe();
        }

        this.prevRequest = this.remoteService.getData(this.combo.virtualizationState, null, () => {
            this.cdr.detectChanges();
            this.combo.triggerCheck();
        });
    }

    public searchInput(searchText) {
        this.remoteService.getData(this.combo.virtualizationState, searchText, (data) => {
            this.combo.totalItemCount = searchText ? data.Results.length : data.Count;
        });
    }
}

@Component({
    template: `
        <label id="mockID">Combo Label</label>
        <igx-combo #combo [height]="'400px'" [itemsMaxHeight]='400'
        [itemHeight]='40' [width]="'400px'">
        </igx-combo>
`
})
export class IgxComboEmptyTestComponent {

    @ViewChild('combo', { read: IgxComboComponent })
    public combo: IgxComboComponent;
}

@Component({
    template: `
    <div class="comboContainer" [style.width]="'400px'">
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
        'Prague',
        'Padua',
        'Palermo',
        'Palma de Mallorca'];

}

@Component({
    template: `
    <div class="comboContainer" [style.width]="'500px'">
    <igx-combo #combo placeholder="Location(s)"
    [data]="citiesData"
    [filterable]="true" [width]="'300px'">
    >
    </igx-combo>
    </div>
`
})
class IgxComboInContainerFixedWidthComponent {
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
        'Prague',
        'Padua',
        'Palermo',
        'Palma de Mallorca'];

}

@NgModule({
    imports: [BrowserModule, HttpClientModule]
})
export class DynamicTestModule { }


