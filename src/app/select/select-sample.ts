import { IgxSelectComponent } from './../../../projects/igniteui-angular/src/lib/select/select.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ISelectionEventArgs, CancelableEventArgs } from 'igniteui-angular';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'app-select-sample',
    styleUrls: ['./select-sample.scss'],
    templateUrl: './select-sample.html'
})
export class SelectComponent implements OnInit {

    @ViewChild(IgxSelectComponent) public igxSelect: IgxSelectComponent;
    public items: any[] = [];
    public value: string;
//  public value = 'Option 1';
    public ngOnInit() {
        for (let i = 1; i < 4; i ++) {
            const item = { field: 'Option ' + i };
            this.items.push(item);
        }

        this.igxSelect.onOpening.subscribe((eventArgs: CancelableEventArgs) => {
            console.log(`onOpening log!: ${eventArgs.cancel}`);
        });

        this.igxSelect.onOpened.subscribe(() => {
            console.log(`onOpened log!`);
        });

        this.igxSelect.onClosing.subscribe((eventArgs: CancelableEventArgs) => {
            console.log( `onClosing log!: ${eventArgs.cancel}`);
        });

        this.igxSelect.onClosed.subscribe(() => {
            console.log('onClosed log!');
        });

        this.igxSelect.onSelection.subscribe((eventArgs: ISelectionEventArgs) => {
            console.log(`
                onSelection log!:
                newSelection: ${eventArgs.newSelection.value}
                cancel: ${eventArgs.cancel}`);
        });
    }

    public onSelection(eventArgs: ISelectionEventArgs) {
        this.value = eventArgs.newSelection.value;
    }

    public openDropDown() {
    }
}
