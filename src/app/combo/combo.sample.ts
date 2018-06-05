import { Component, ViewChild, OnInit } from '@angular/core';
import { IgxComboComponent } from 'igniteui-angular';
import { take } from 'rxjs/operators';

const primitive = ['1', '2', '3', '4', '5', '6'];
const complex = [{
    field: 1,
    value: 1
}, {
    field: 2,
    value: 2
}, {
    field: 3,
    value: 3
}, {
    field: 4,
    value: 4
}, {
    field: 5,
    value: 5
}, {
    field: 6,
    value: 6
}];
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'combo-sample',
    templateUrl: './combo.sample.html',
    styleUrls: ['combo.sample.css']
})
export class ComboSampleComponent implements OnInit {
    private width = '160px';
    @ViewChild(IgxComboComponent) public igxCombo: IgxComboComponent;
    public toggleItemState = false;
    private initData: any[] = [];
    public items: any[] = [];
    private currentDataType = '';

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
                this.initData = this.items;
            });
        }
    }

    changeData(type) {
        switch (type) {
            case 'complex':
                this.items = complex;
                this.currentDataType = 'complex';
                console.log(this.items, complex);
                break;
            case 'primitive':
                this.items = primitive;
                this.currentDataType = 'primitive';
                console.log(this.items);
                break;
            default:
                this.items = this.initData;
                this.currentDataType = 'initial';
                console.log(this.items);
        }
    }

    onSelection(ev) {
    }

    handleAddition(evt) {
        console.log(evt);
        evt.addedItem[this.igxCombo.groupKey] = 'MyCustomGroup';
    }

    toggleItem(itemID) {
        this.toggleItemState = !this.toggleItemState;
        this.igxCombo.dropdown.setSelectedItem(itemID, this.toggleItemState);
    }

    ngOnInit() {
        this.igxCombo.dropdown.onOpening.subscribe(() => {
            console.log('Opening log!');
        });

        this.igxCombo.dropdown.onOpened.subscribe(() => {
            console.log('Opened log!');
        });

        this.igxCombo.dropdown.onOpened.pipe(take(1)).subscribe(() => {
            console.log('Attaching');
            this.igxCombo.searchInput.nativeElement.onchange = (e) => {
                console.log(e);
            };
        });

        this.igxCombo.dropdown.onClosing.subscribe(() => {
            console.log('Closing log!');
        });

        this.igxCombo.dropdown.onClosed.subscribe(() => {
            console.log('Closed log!');
        });

        this.igxCombo.onSearchInput.subscribe((e) => {
            console.log(e);
        });
    }
}
