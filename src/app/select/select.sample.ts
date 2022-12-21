import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {
    ISelectionEventArgs, CancelableEventArgs,
    HorizontalAlignment, VerticalAlignment, scaleInTop, scaleOutBottom, ConnectedPositioningStrategy,
    AbsoluteScrollStrategy,
    IgxSelectComponent,
    IButtonGroupEventArgs
} from 'igniteui-angular';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'app-select-sample',
    styleUrls: ['./select.sample.scss'],
    templateUrl: './select.sample.html'
})
export class SelectSampleComponent implements OnInit {
    @ViewChild('selectReactive', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    @ViewChild('model', { read: IgxSelectComponent, static: true })
    public selectFruits: IgxSelectComponent;
    @ViewChild('displayDensitySelect', { read: IgxSelectComponent, static: true })
    public selectDisplayDensity: IgxSelectComponent;

    @ViewChildren(IgxSelectComponent) private selectComponents: QueryList<IgxSelectComponent>;

    public isDisabled = false;

    public items: any[] = [];
    public value: 'opt1';
    public disabledItemValue: 'InsideGroup1';
    public fruits: string[] = ['Orange', 'Apple', 'Banana', 'Mango', 'Pear', 'Lemon', 'Peach', 'Apricot', 'Grapes', 'Cactus'];
    public selected: string;
    public selectRequired = true;

    public reactiveForm: UntypedFormGroup;
    public cities: string[] = [
        'Sofia',
        'Varna',
        'Sozopol',
        'Plovdiv',
        'Ruse',
        'Stara Zagora'
    ];

    public validationType = {
        citiesSelect: [Validators.required]
    };

    constructor(fb: UntypedFormBuilder) {
        this.reactiveForm = fb.group({
            citiesSelect: ['', Validators.required]
        });
    }

    public ngOnInit() {
        for (let i = 1; i < 10; i++) {
            const item = { field: 'opt' + i };
            this.items.push(item);
        }
    }

    public onSubmitReactive() { }

    public selectBanana() {
        this.selectFruits.setSelectedItem(3);
    }

    public setToNull() {
        this.selectFruits.value = null;
        this.selected = null;
    }

    public testOnSelection(evt: ISelectionEventArgs) {
        console.log('testOnSelection.....................' + evt.cancel);
    }

    public testOnOpening(evt: CancelableEventArgs) {
        console.log('testOnOpening.....................: ' + evt.cancel);
    }

    public testOnOpened() {
        // console.log('testOnOpened.....................: ');
    }

    public testOnClosing(evt: CancelableEventArgs) {
        console.log('testOnClosing.....................: ' + evt.cancel);
    }

    public testOnClosed() {
        // console.log('testOnClosed.....................: ');
    }

    public handleToggle() {
        // console.log('handleToggle.....................: ');
        this.selectComponents.first.toggle();
    }

    public handleOpen() {
        if (this.selectComponents.first.collapsed) {
            const customCloseOnOutsideClick = {
                closeOnOutsideClick: false
            };
            console.log('onOpen.....................:');
            this.selectComponents.first.open(customCloseOnOutsideClick);
        }
    }

    public handleClose() {
        if (!this.selectComponents.first.collapsed) {
            // console.log('onClose.....................: ');
            this.selectComponents.first.close();
        }
    }

    public openCustomOverlaySettings() {
        if (this.selectComponents.first.collapsed) {
            const positionSettings = {
                target: this.selectComponents.first.inputGroup.element.nativeElement,
                horizontalDirection: HorizontalAlignment.Right,
                verticalDirection: VerticalAlignment.Bottom,
                horizontalStartPoint: HorizontalAlignment.Left,
                verticalStartPoint: VerticalAlignment.Bottom,
                openAnimation: scaleInTop,
                closeAnimation: scaleOutBottom
            };

            const customOverlaySettings = {
                modal: true,
                closeOnOutsideClick: false,
                positionStrategy: new ConnectedPositioningStrategy(
                    positionSettings
                ),
                scrollStrategy: new AbsoluteScrollStrategy()
            };
            console.log('onOpenCustomOverlaySettings.....................:  customOverlaySettings');
            this.selectComponents.first.open(customOverlaySettings);
        }
    }

    public setDensity(event: IButtonGroupEventArgs) {
        this.selectDisplayDensity.displayDensity = event.button.nativeElement.value;
    }

    public btnClick() {
        // console.log('clicked');
    }

    public headerFootedClick(event) {
        console.log('Header/Footer clicked', event);
    }
}
