import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
    IgxDropDownComponent,
    ConnectedPositioningStrategy,
    OverlaySettings,
    NoOpScrollStrategy,
    IgxOverlayOutletDirective
} from 'igniteui-angular';
import { foods } from './foods';
import { IgxRippleDirective } from '../../../projects/igniteui-angular/src/lib/directives/ripple/ripple.directive';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';
import { IgxDropDownGroupComponent } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down-group.component';
import { IgxDropDownItemComponent } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down-item.component';
import { NgFor } from '@angular/common';
import { IgxDropDownComponent as IgxDropDownComponent_1 } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down.component';
import { IgxToggleActionDirective, IgxToggleDirective, IgxOverlayOutletDirective as IgxOverlayOutletDirective_1 } from '../../../projects/igniteui-angular/src/lib/directives/toggle/toggle.directive';
import { IgxDropDownItemNavigationDirective } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down-navigation.directive';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxButtonGroupComponent } from '../../../projects/igniteui-angular/src/lib/buttonGroup/buttonGroup.component';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'drop-down-sample',
    templateUrl: './drop-down.sample.html',
    styleUrls: ['drop-down.sample.scss'],
    standalone: true,
    imports: [IgxButtonGroupComponent, IgxButtonDirective, IgxDropDownItemNavigationDirective, IgxToggleActionDirective, IgxDropDownComponent_1, NgFor, IgxDropDownItemComponent, IgxToggleDirective, IgxDropDownGroupComponent, IgxInputGroupComponent, IgxInputDirective, IgxRippleDirective, IgxOverlayOutletDirective_1]
})
export class DropDownSampleComponent implements OnInit {
    @ViewChild(IgxDropDownComponent, { static: true })
    private igxDropDown: IgxDropDownComponent;
    @ViewChild('dropdown3', { static: true })
    private igxDropDownSelection: IgxDropDownComponent;
    @ViewChild('button', { static: true })
    private button: ElementRef;
    @ViewChild(IgxOverlayOutletDirective, { static: true })
    private igxOverlayOutlet: IgxOverlayOutletDirective;

    public items: any[] = [];
    public foods = foods;

    public ngOnInit() {
        this.igxDropDown.height = '400px';
        this.igxDropDown.width = '180px';

        const states = [
            'New England',
            'Connecticut',
            'Maine',
            'Massachusetts',
            'New Hampshire',
            'Rhode Island',
            'Vermont',
            'Mid-Atlantic',
            'New Jersey',
            'New York',
            'Pennsylvania',
            'East North Central',
            'Illinois',
            'Indiana',
            'Michigan',
            'Ohio',
            'Wisconsin',
            'West North Central',
            'Iowa',
            'Kansas',
            'Minnesota',
            'Missouri',
            'Nebraska',
            'North Dakota',
            'South Dakota',
            'South Atlantic',
            'Delaware',
            'Florida',
            'Georgia',
            'Maryland',
            'North Carolina',
            'South Carolina',
            'Virginia',
            'District of Columbia',
            'West Virginia',
            'East South Central',
            'Alabama',
            'Kentucky',
            'Mississippi',
            'Tennessee',
            'West South Central',
            'Arkansas',
            'Louisiana',
            'Oklahoma',
            'Texas',
            'Mountain',
            'Arizona',
            'Colorado',
            'Idaho',
            'Montana',
            'Nevada',
            'New Mexico',
            'Utah',
            'Wyoming',
            'Pacific',
            'Alaska',
            'California',
            'Hawaii',
            'Oregon',
            'Washington'];

        const areas = [
            'New England',
            'Mid-Atlantic',
            'East North Central',
            'West North Central',
            'South Atlantic',
            'East South Central',
            'West South Central',
            'Mountain',
            'Pacific'
        ];

        for (let i = 0; i < states.length; i += 1) {
            const item = { field: states[i] };
            if (areas.indexOf(states[i]) !== -1) {
                item['header'] = true;
            } else if (i % 7 === 4 || i > 49) {
                item['disabled'] = true;
            }
            this.items.push(item);
        }

        this.items[3]['selected'] = true;
    }

    public toggleDropDown() {
        const overlaySettings: OverlaySettings = {
            positionStrategy: new ConnectedPositioningStrategy(),
            scrollStrategy: new NoOpScrollStrategy(),
            closeOnOutsideClick: false,
            modal: false,
            outlet: this.igxOverlayOutlet
        };

        overlaySettings.target = this.button.nativeElement;
        this.igxDropDown.toggle(overlaySettings);
    }

    public open() {
        const overlaySettings: OverlaySettings = {
            positionStrategy: new ConnectedPositioningStrategy(),
            scrollStrategy: new NoOpScrollStrategy(),
            closeOnOutsideClick: false,
            modal: false,
            outlet: this.igxOverlayOutlet
        };

        overlaySettings.target = this.button.nativeElement;
        this.igxDropDown.open(overlaySettings);
    }

    public close() {
        this.igxDropDown.close();
    }

    public clearSelection() {
        this.igxDropDownSelection.clearSelection();
    }

    public onSelection(event) {
        console.log(event);
        const old = event.oldSelection;
        event.oldSelection = event.newSelection;
        event.newSelection = old;
    }

    public onSelectionLogger(event) {
        // event.cancel = true;
        console.log(event);
    }

    public onSelectionMenu(eventArgs) {
        eventArgs.cancel = true;

        console.log(`new selection ${eventArgs.newSelection.element.nativeElement.textContent}`);
        console.log(`old selection ${eventArgs.oldSelection ? eventArgs.oldSelection.element.nativeElement.textContent : ''}`);
    }

    public onOpening() {
    }
}
