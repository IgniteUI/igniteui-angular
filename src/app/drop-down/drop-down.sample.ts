import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import {
    IgxDropDownComponent,
    ConnectedPositioningStrategy,
    PositionSettings,
    HorizontalAlignment,
    VerticalAlignment,
    OverlaySettings,
    ScrollStrategyFactory
} from 'igniteui-angular';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'drop-down-sample',
    templateUrl: './drop-down.sample.html',
    styleUrls: ['drop-down.sample.css']
})
export class DropDownSampleComponent implements OnInit {
    private width = '160px';
    @ViewChild(IgxDropDownComponent) public igxDropDown: IgxDropDownComponent;

    @ViewChild('button') public button: ElementRef;

    items: any[] = [];

    ngOnInit() {
        this.igxDropDown.height = '400px';
        this.igxDropDown.width = '180px';
        // this.igxDropDown.allowItemsFocus = false;

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
    }

    constructor(
        private elementRef: ElementRef,
        @Inject(ScrollStrategyFactory) private ssf: ScrollStrategyFactory) {
    }

    public toggleDropDown() {
        const overlaySettings = new OverlaySettings();
        // overlaySettings.modal = false;
        // const positionSettings = new PositionSettings();
        // positionSettings.element = this.button.nativeElement;
        // positionSettings.horizontalStartPoint = HorizontalAlignment.Left;
        // positionSettings.verticalStartPoint = VerticalAlignment.Bottom;
        // positionSettings.horizontalDirection = HorizontalAlignment.Right;
        // positionSettings.verticalDirection = VerticalAlignment.Bottom;
        // const positionStrategy = new ConnectedPositioningStrategy(positionSettings);
        // overlaySettings.positionStrategy = positionStrategy;
        // tslint:disable-next-line:no-debugger
        // const close = this.ssf.close(this.igxDropDown.id);
        // overlaySettings.scrollStrategy = close;
        const block = this.ssf.block();
        overlaySettings.scrollStrategy = block;
        overlaySettings.closeOnOutsideClick = false;
        this.igxDropDown.toggle(overlaySettings);
    }

    onSelection(ev) {
    }

    onOpening(ev) {
    }
}
