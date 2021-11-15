import { AfterViewInit, ChangeDetectorRef, Component, DebugElement, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { take } from 'rxjs/operators';
import { IgxComboDropDownComponent } from '../combo/combo-dropdown.component';
import { RemoteDataService } from '../combo/combo.component.spec';
import { DisplayDensity } from '../core/displayDensity';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { configureTestSuite } from '../test-utils/configure-suite';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { IgxSimpleComboComponent, IgxSimpleComboModule } from './public_api';


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
const CSS_CLASS_FOCUSED = 'igx-drop-down__item--focused';
const CSS_CLASS_HEADERITEM = 'igx-drop-down__header';
const CSS_CLASS_INPUTGROUP = 'igx-input-group';
const CSS_CLASS_COMBO_INPUTGROUP = 'igx-input-group__input';
const CSS_CLASS_INPUTGROUP_WRAPPER = 'igx-input-group__wrapper';
const CSS_CLASS_INPUTGROUP_BUNDLE = 'igx-input-group__bundle';
const CSS_CLASS_INPUTGROUP_MAINBUNDLE = 'igx-input-group__bundle-main';
const CSS_CLASS_INPUTGROUP_BORDER = 'igx-input-group__border';
const CSS_CLASS_ADDBUTTON = 'igx-combo__add-item';
const CSS_CLASS_HEADER = 'header-class';
const CSS_CLASS_FOOTER = 'footer-class';
const defaultDropdownItemHeight = 40;
const defaultDropdownItemMaxHeight = 400;

describe('IgxSimpleCombo', () => {
    let fixture: ComponentFixture<any>;
    let combo: IgxSimpleComboComponent;
    let input: DebugElement;

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
        it('should render grouped items properly', (done) => {
            let dropdownContainer;
            let dropdownItems;
            let scrollIndex = 0;
            const headers: Array<string> = Array.from(new Set(combo.data.map(item => item.region)));
            combo.toggle();
            fixture.detectChanges();
            const checkGroupedItemsClass = () => {
                fixture.detectChanges();
                dropdownContainer = fixture.debugElement.query(By.css(`.${CSS_CLASS_CONTAINER}`)).nativeElement;
                dropdownItems = dropdownContainer.children;
                Array.from(dropdownItems).forEach((item) => {
                    const itemElement = item as HTMLElement;
                    const itemText = itemElement.innerText.toString();
                    const expectedClass: string = headers.includes(itemText) ? CSS_CLASS_HEADERITEM : CSS_CLASS_DROPDOWNLISTITEM;
                    expect(itemElement.classList.contains(expectedClass)).toBeTruthy();
                });
                scrollIndex += 10;
                if (scrollIndex < combo.data.length) {
                    combo.virtualScrollContainer.scrollTo(scrollIndex);
                    combo.virtualScrollContainer.chunkLoad.pipe(take(1)).subscribe(async () => {
                        await wait(30);
                        checkGroupedItemsClass();
                    });
                } else {
                    done();
                }
            };
            checkGroupedItemsClass();
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

        it('should move the focus to the AddItem button with ArrowDown when allowCustomItems is true', fakeAsync(() => {
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
