// tslint:disable:max-line-length
import { ConnectedPositioningStrategy } from './../../../projects/igniteui-angular/src/lib/services/overlay/position/connected-positioning-strategy';
import { AbsoluteScrollStrategy } from '../../../projects/igniteui-angular/src/lib/services/overlay/scroll/absolute-scroll-strategy';
// tslint:disable-next-line:max-line-length
import { IgxSelectComponent } from '../../../projects/igniteui-angular/src/lib/select/select.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ISelectionEventArgs, CancelableEventArgs, OverlaySettings, HorizontalAlignment, VerticalAlignment } from 'igniteui-angular';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'app-select-sample',
    styleUrls: ['./select.sample.scss'],
    templateUrl: './select.sample.html'
})
export class SelectSampleComponent implements OnInit {

    @ViewChild(IgxSelectComponent) public igxSelect: IgxSelectComponent;
    public items: any[] = [];

    //public value = 'notContainedInItemsValue';
    public value: 'opt1'; // value not set
    public customOverlaySettings: OverlaySettings;

    public ngOnInit() {
        for (let i = 1; i < 10; i ++) {
            const item = { field: 'opt' + i };
            this.items.push(item);
        }
    }

    public testOnSelection(evt: ISelectionEventArgs) {
        //  console.log('testOnSelection.....................' + evt.cancel);
    }

    public testOnOpening(evt: CancelableEventArgs) {
        // console.log('testOnOpening.....................: ' + evt.cancel);
    }

    public testOnOpened() {
        // console.log('testOnOpened.....................: ');
    }

    public testOnClosing(evt: CancelableEventArgs) {
        // console.log('testOnClosing.....................: ' + evt.cancel);
    }

    public testOnClosed() {
        // console.log('testOnClosed.....................: ');
    }

    public handleToggle() {
        // console.log('handleToggle.....................: ');
        this.igxSelect.toggle();
    }

    public handleOpen() {
        if (this.igxSelect.collapsed) {
            console.log('onOpen.....................:');
            this.igxSelect.open();
        }
    }

    public handleClose() {
        if (!this.igxSelect.collapsed) {
            // console.log('onClose.....................: ');
            this.igxSelect.close();
        }
    }

    public toggleDisabled() {
        this.igxSelect.disabled = !this.igxSelect.disabled;
        // console.log('toggleDisabled.....................: ');
    }

    public openCustomOverlaySettings() {
        if (this.igxSelect.collapsed) {
        const positionSettings = {
            target: this.igxSelect.inputGroup.element.nativeElement,
            horizontalDirection: HorizontalAlignment.Right,
            verticalDirection: VerticalAlignment.Bottom,
            horizontalStartPoint: HorizontalAlignment.Left,
            verticalStartPoint: VerticalAlignment.Bottom
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
            this.customOverlaySettings = customOverlaySettings;
            this.igxSelect.open(customOverlaySettings);
        }
    }
}
