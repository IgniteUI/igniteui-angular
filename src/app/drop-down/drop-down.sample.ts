import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
    IgxDropDownComponent,
    ConnectedPositioningStrategy,
    OverlaySettings,
    NoOpScrollStrategy,
    IgxOverlayOutletDirective
} from 'igniteui-angular';
import { foods } from './foods';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'drop-down-sample',
    templateUrl: './drop-down.sample.html',
    styleUrls: ['drop-down.sample.scss']
})
export class DropDownSampleComponent implements OnInit {
    @ViewChild(IgxDropDownComponent) public igxDropDown: IgxDropDownComponent;
    @ViewChild('button') public button: ElementRef;

    @ViewChild(IgxOverlayOutletDirective) public igxOverlayOutlet: IgxOverlayOutletDirective;

    items: any[] = [];
    public foods = foods;

    ngOnInit() {
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

    constructor() {
    }

    public toggleDropDown() {
        const overlaySettings: OverlaySettings = {
            positionStrategy: new ConnectedPositioningStrategy(),
            scrollStrategy: new NoOpScrollStrategy(),
            closeOnOutsideClick: false,
            modal: false,
            outlet: this.igxOverlayOutlet
        };

        overlaySettings.positionStrategy.settings.target = this.button.nativeElement;
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

        overlaySettings.positionStrategy.settings.target = this.button.nativeElement;
        this.igxDropDown.open(overlaySettings);
    }

    public close() {
        this.igxDropDown.close();
    }

    onSelection(event) {
        console.log(event);
        const old = event.oldSelection;
        event.oldSelection = event.newSelection;
        event.newSelection = old;
    }

    onSelectionMenu(eventArgs) {
        eventArgs.cancel = true;

        console.log(`new selection ${eventArgs.newSelection.element.nativeElement.textContent}`);
        console.log(`old selection ${eventArgs.oldSelection ? eventArgs.oldSelection.element.nativeElement.textContent : ''}`);
    }

    onOpening(event) {
    }
}
