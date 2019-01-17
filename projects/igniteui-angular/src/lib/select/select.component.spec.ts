import { AfterViewInit, ChangeDetectorRef, Component, Injectable, NgModule, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
import { IgxDropDownItemBase } from '../drop-down';

const CSS_CLASS_INPUT_GROUP = 'igx-input-group';
const CSS_CLASS_INPUT = 'igx-input-group__input';
const CSS_CLASS_DROPDOWN_LIST = 'igx-drop-down__list';
const CSS_CLASS_SELECTED_ITEM = 'igx-drop-down__item--selected';
const CSS_CLASS_DISABLED_ITEM = 'igx-drop-down__item--disabled';

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
            expect(select.height).toEqual('400px');
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
        it('Should properly emit opening/closing events', fakeAsync(() => {
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
            expect(select.onClosing.emit).toHaveBeenCalledTimes(0);
            expect(select.onClosed.emit).toHaveBeenCalledTimes(0);
            expect(select.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(select.onOpened.emit).toHaveBeenCalledTimes(1);
            expect(select.toggle).toHaveBeenCalledTimes(1);
            expect(select.open).toHaveBeenCalledTimes(1);
            expect(select.close).toHaveBeenCalledTimes(0);

            inputGroup.nativeElement.click();
            tick();
            fixture.detectChanges();
            expect(select.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(select.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(select.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(select.onOpened.emit).toHaveBeenCalledTimes(1);
            expect(select.toggle).toHaveBeenCalledTimes(2);
            expect(select.open).toHaveBeenCalledTimes(1);
            expect(select.close).toHaveBeenCalledTimes(1);

            select.disabled = true;
            inputGroup.nativeElement.click();
            tick();
            fixture.detectChanges();

            // No additional calls, because select is disabled
            expect(select.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(select.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(select.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(select.onOpened.emit).toHaveBeenCalledTimes(1);
            expect(select.toggle).toHaveBeenCalledTimes(2);
            expect(select.open).toHaveBeenCalledTimes(1);
            expect(select.close).toHaveBeenCalledTimes(1);
        }));
    });
    describe('Selection tests: ', () => {
        it('Should be single selection', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            let selectedItemIndex = 5;

            const checkItemSelection = function (itemIndex: number) {
                select.items.forEach(item => {
                    const expectedValue = item.index === itemIndex ? true : false;
                    expect(item.isSelected).toEqual(expectedValue);
                    expect(item.element.nativeElement.classList.contains(CSS_CLASS_SELECTED_ITEM)).toEqual(expectedValue);
                });
                expect(select.selectedItem).toEqual(select.items[selectedItemIndex]);
                expect(select.value).toEqual(select.items[selectedItemIndex].value);
            };

            select.toggle();
            tick();
            fixture.detectChanges();
            selectList.children[selectedItemIndex].nativeElement.click();
            tick();
            fixture.detectChanges();
            checkItemSelection(selectedItemIndex);

            selectedItemIndex = 15;
            select.selectItem(select.items[selectedItemIndex]);
            tick();
            fixture.detectChanges();
            checkItemSelection(selectedItemIndex);
            // select.toggle();
            // tick();
            // fixture.detectChanges();

            // selectedItemIndex = 8;
            // select.value = select.items[selectedItemIndex].value.toString();
            // fixture.detectChanges();
            // tick();
            // fixture.detectChanges();
            // select.toggle();
            // tick();
            // fixture.detectChanges();
            // checkItemSelection(selectedItemIndex);

            // selectedItemIndex = -1;
            // select.value = 'Ghost city';
            // tick();
            // fixture.detectChanges();
            // checkItemSelection(selectedItemIndex);
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
                expect(select.value).toEqual(selectedItemValue);
                expect(select.input.value).toEqual(selectedItemValue);
                expect(inputElement.value).toEqual(selectedItemValue);
            };

            // There is not a selected item initially
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
        fit('Should select first match out of duplicated values', async() => {
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
        it('Should properly emit onSelection event on item click', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;
            const selectList = fixture.debugElement.query(By.css('.' + CSS_CLASS_DROPDOWN_LIST));
            const item_1 = selectList.children[5];
            const item_2 = selectList.children[10];

            spyOn(select.onSelection, 'emit');
            spyOn(select, 'selectItem').and.callThrough();

            select.toggle();
            tick();
            fixture.detectChanges();
            item_1.nativeElement.click();
            tick();
            fixture.detectChanges();
            // expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
            // expect(select.selectItem).toHaveBeenCalledTimes(1);
            // expect(select.onSelection.emit).toHaveBeenCalledWith(null);

            select.toggle();
            tick();
            fixture.detectChanges();
            item_2.nativeElement.click();
            tick();
            fixture.detectChanges();
            // expect(select.onSelection.emit).toHaveBeenCalledTimes(2);
            // expect(select.selectItem).toHaveBeenCalledTimes(2);
            // expect(select.onSelection.emit).toHaveBeenCalledWith(null);
        }));
        it('Should properly emit onSelection event on isSelected setting', () => {
            const fixture = TestBed.createComponent(IgxSelectSimpleComponent);
            fixture.detectChanges();
            const select = fixture.componentInstance.select;

            spyOn(select.onSelection, 'emit');
            spyOn(select, 'selectItem').and.callThrough();

            select.items[3].isSelected = true;
            fixture.detectChanges();
            // expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
            // expect(select.selectItem).toHaveBeenCalledTimes(1);
            // expect(select.onSelection.emit).toHaveBeenCalledWith(null);

            select.items[9].isSelected = true;
            fixture.detectChanges();
            // expect(select.onSelection.emit).toHaveBeenCalledTimes(2);
            // expect(select.selectItem).toHaveBeenCalledTimes(2);
            // expect(select.onSelection.emit).toHaveBeenCalledWith(null);
        });
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
            spyOn(select.onSelection, 'emit');

            select.selectItem(select.items[4]);
            fixture.detectChanges();
            // expect(select.onSelection.emit).toHaveBeenCalledTimes(1);
            // expect(select.onSelection.emit).toHaveBeenCalledWith(null);

            select.selectItem(select.items[14]);
            fixture.detectChanges();
            // expect(select.onSelection.emit).toHaveBeenCalledTimes(2);
            // expect(select.onSelection.emit).toHaveBeenCalledWith(null);
        });
    });
});

@Component({
    template: `
    <igx-select #select [width]="'300px'" [height]="'400px'" [placeholder]="'Choose a city'" [(ngModel)]="value" >
    <igx-select-item *ngFor="let item of items" [value]="item">
        {{ item }}
    </igx-select-item>
    </igx-select>
`
})
class IgxSelectSimpleComponent {
    @ViewChild('select', { read: IgxSelectComponent })
    public select: IgxSelectComponent;
    // public value: string = 'Paris';
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
        'Paris'];

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
