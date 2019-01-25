import { AbsoluteScrollStrategy } from '../../../projects/igniteui-angular/src/lib/services/overlay/scroll/absolute-scroll-strategy';
// tslint:disable-next-line:max-line-length
import { SelectPositioningStrategy } from '../../../projects/igniteui-angular/src/lib/services/overlay/position/select-positioning-strategy';
import { IgxSelectComponent } from '../../../projects/igniteui-angular/src/lib/select/select.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ISelectionEventArgs, CancelableEventArgs, OverlaySettings } from 'igniteui-angular';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'app-select-sample',
    styleUrls: ['./select.sample.scss'],
    templateUrl: './select.sample.html'
})
export class SelectSampleComponent implements OnInit {

    @ViewChild(IgxSelectComponent) public igxSelect: IgxSelectComponent;
    public items: any[] = [];

    public value = 'notContainedInItemsValue';

    customOverlaySettings: OverlaySettings = {
        modal: false,
        closeOnOutsideClick: true,
        positionStrategy: new SelectPositioningStrategy(
            this.igxSelect
        ),
        scrollStrategy: new AbsoluteScrollStrategy()
    };
    public ngOnInit() {
        for (let i = 1; i < 5; i ++) {
            const item = { field: 'Option ' + i };
            this.items.push(item);
        }
    }

    public testOnSelection(evt: ISelectionEventArgs) {
         console.log('testOnSelection.....................' + evt.cancel);
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
            // console.log('onOpen.....................: ');
            this.igxSelect.open(this.customOverlaySettings);
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
}
