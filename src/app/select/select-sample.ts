import { IgxSelectComponent } from './../../../projects/igniteui-angular/src/lib/select/select.component';
import { Component, OnInit } from '@angular/core';
import { ISelectionEventArgs } from 'igniteui-angular';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'app-select-sample',
    styleUrls: ['./select-sample.scss'],
    templateUrl: './select-sample.html'
})
export class SelectComponent implements OnInit {

    public items: any[] = [];
    public value: string;

    public ngOnInit() {
        for (let i = 1; i < 4; i ++) {
            const item = { field: 'Option ' + i };
            this.items.push(item);
        }
    }

    public onSelection(eventArgs: ISelectionEventArgs) {
        this.value = eventArgs.newSelection.value;
    }

    public openDropDown() {
        // if (this.igxDropDown.collapsed) {
        //     this.igxDropDown.open({
        //         modal: false,
        //         positionStrategy: new ConnectedPositioningStrategy({
        //             target: this.inputGroup.element.nativeElement
        //         })
        //     });
        }
    // }

}
