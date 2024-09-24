import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

import { foods } from './foods';
import {
	ConnectedPositioningStrategy,
	IgxButtonDirective,
	IgxButtonGroupComponent,
	IgxDropDownComponent,
	IgxDropDownGroupComponent,
	IgxDropDownItemComponent,
	IgxDropDownItemNavigationDirective,
	IgxIconComponent,
	IgxInputDirective,
	IgxInputGroupComponent,
	IgxOverlayOutletDirective,
	IgxRippleDirective,
	IgxToggleActionDirective,
	IgxToggleDirective,
	NoOpScrollStrategy,
	OverlaySettings,
} from 'igniteui-angular';
import { defineComponents, IgcDropdownComponent, IgcButtonComponent} from "igniteui-webcomponents";

defineComponents(IgcDropdownComponent, IgcButtonComponent);


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'drop-down-showcase-sample',
    templateUrl: './drop-down-showcase.sample.html',
    styleUrls: ['drop-down-showcase.sample.scss'],
    standalone: true,
	imports: [
		NgFor,
		IgxButtonGroupComponent,
		IgxButtonDirective,
		IgxDropDownItemNavigationDirective,
		IgxToggleActionDirective,
		IgxDropDownComponent,
		IgxDropDownItemComponent,
		IgxToggleDirective,
		IgxDropDownGroupComponent,
		IgxInputGroupComponent,
		IgxInputDirective,
		IgxRippleDirective,
		IgxOverlayOutletDirective,
		IgxIconComponent,
		NgIf,
	],
})
export class DropDownShowcaseSampleComponent implements OnInit {
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

    public toggleDropDownWC() {
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
