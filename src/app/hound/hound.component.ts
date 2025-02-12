import {Component, OnInit} from '@angular/core';
import {
    IgxButtonModule,
    IgxCheckboxComponent,
    IgxComboComponent,
    IgxDropDownComponent,
    IgxDropDownItemComponent,
    IgxIconComponent,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxLabelDirective,
    IgxPrefixDirective,
    IgxRadioComponent,
    IgxRadioGroupDirective,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxSuffixDirective,
    IgxSwitchComponent, IgxTabHeaderComponent,
    IgxTabHeaderIconDirective,
    IgxTabHeaderLabelDirective,
    IgxTabItemComponent,
    IgxTabsComponent,
    IgxTabsModule,
    IgxToggleActionDirective,
} from "igniteui-angular";
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";

@Component({
    selector: 'app-hound',
    imports: [
        IgxButtonModule,
        IgxIconComponent,
        IgxSwitchComponent,
        FormsModule,
        IgxInputGroupComponent,
        IgxLabelDirective,
        IgxInputDirective,
        IgxPrefixDirective,
        IgxSuffixDirective,
        IgxSelectComponent,
        NgForOf,
        IgxComboComponent,
        IgxCheckboxComponent,
        IgxDropDownComponent,
        IgxDropDownItemComponent,
        IgxToggleActionDirective,
        IgxRadioComponent,
        IgxRadioGroupDirective,
        NgIf,
        IgxSelectItemComponent,
        IgxTabsModule,
        IgxTabsComponent,
        IgxTabItemComponent,
        IgxTabHeaderIconDirective,
        IgxTabHeaderLabelDirective,
        IgxTabHeaderComponent,
    ],
    templateUrl: './hound.component.html',
    styleUrl: './hound.component.scss'
})
export class HoundComponent implements OnInit {
    public isButtonDisabled = false;
    public isInputDisabled = false;
    public isTabDisabled = false;

    public items: string[] = ['Orange', 'Apple', 'Banana', 'Mango'];

    public lData: any[];

    public division = {
        'New England 01': ['Connecticut', 'Maine', 'Massachusetts'],
        'New England 02': ['New Hampshire', 'Rhode Island', 'Vermont'],
        // tslint:disable-next-line:object-literal-sort-keys
        'Mid-Atlantic': ['New Jersey', 'New York', 'Pennsylvania'],
        'East North Central 02': ['Michigan', 'Ohio', 'Wisconsin'],
        'East North Central 01': ['Illinois', 'Indiana'],
        'West North Central 01': ['Missouri', 'Nebraska', 'North Dakota', 'South Dakota'],
        'West North Central 02': ['Iowa', 'Kansas', 'Minnesota'],
        'South Atlantic 01': ['Delaware', 'Florida', 'Georgia', 'Maryland'],
        'South Atlantic 02': ['North Carolina', 'South Carolina', 'Virginia',
            'District of Columbia', 'West Virginia'],
        'East South Central 01': ['Alabama', 'Kentucky'],
        'East South Central 02': ['Mississippi', 'Tennessee'],
        'West South Central': ['Arkansas', 'Louisiana', 'Oklahome', 'Texas'],
        'Mountain': ['Arizona', 'Colorado', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Utah', 'Wyoming'],
        'Pacific 01': ['Alaska', 'California'],
        'Pacific 02': ['Hawaii', 'Oregon', 'Washington']
    };

    public ddItems = [
        {
            field: 'Option 1'
        },
        {
            field: 'Option 2',
            icon: 'check'
        },
        {
            field: 'Option 3'
        }
    ];

    public localData: any[] = [];

    public keys = Object.keys(this.division);

    public ngOnInit() {
        for (const key of this.keys) {
            this.division[key].map((e) => {
                this.localData.push({
                    field: e,
                    region: key.substring(0, key.length - 3)
                });
            });
        }

        this.lData = this.localData;
    }
}
