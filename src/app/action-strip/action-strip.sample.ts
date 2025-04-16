import { Component, OnInit } from '@angular/core';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';
import {
    IDataCloneStrategy,
    IRowDataEventArgs,
    IgxActionStripComponent,
    IgxActionStripMenuItemDirective,
    IgxButtonDirective,
    IgxCellTemplateDirective,
    IgxColumnComponent,
    IgxGridComponent,
    IgxGridEditingActionsComponent,
    IgxGridPinningActionsComponent,
    IgxIconComponent,
    IRowDataCancelableEventArgs
}
from 'igniteui-angular';
import { SAMPLE_DATA } from '../shared/sample-data';


class MyClone implements IDataCloneStrategy {

    public clone(data: any) {
        if (data) {
            return Object.create(Object.getPrototypeOf(data), Object.getOwnPropertyDescriptors(data));
        }
    }
}

class User {
    protected id: number;
    protected name: string;
    protected age: number;

    public get Name(): string {
        return this.name;
    }

    public set Name(v: string) {
        this.name = v;
    }

    public get Id(): number {
        return this.id;
    }

    public set Id(v: number) {
        this.id = v;
    }

    public get Age(): number {
        return this.age;
    }

    public set Age(v: number) {
        this.age = v;
    }
}

@Component({
    selector: 'app-action-strip-sample',
    styleUrls: ['action-strip.sample.scss'],
    templateUrl: `action-strip.sample.html`,
    imports: [
        IgxButtonDirective,
        IgxActionStripComponent,
        IgxIconComponent,
        IgxGridComponent,
        IgxColumnComponent,
        IgxGridPinningActionsComponent,
        IgxCellTemplateDirective,
        IgxGridEditingActionsComponent,
        IgxActionStripMenuItemDirective,
        SizeSelectorComponent
    ]
})
export class ActionStripSampleComponent implements OnInit {
    public result: string;
    public isVisible = false;
    public customItem = false;
    public data: any[];
    public columns: any[];
    public userData: User[] = [];
    public myClone = new MyClone();

    private counter = 0;

    public doSomeAction() {
        this.result = `Clicked ${this.counter++} times`;
    }

    public showActions() {
        this.isVisible = true;
    }

    public hideActions() {
        this.isVisible = false;
    }

    public onMouseOver(event, grid, actionStrip) {
        if (event.target.nodeName.toLowerCase() === 'igx-grid-cell') {
            const rowIndex = parseInt(event.target.attributes['data-rowindex'].value, 10);
            const row = grid.getRowByIndex(rowIndex);
            actionStrip.show(row);
        }
    }

    public onMouseLeave(actionstrip, event?) {
        if (!event || event.relatedTarget.nodeName.toLowerCase() !== 'igx-drop-down-item') {
            actionstrip.hide();
        }
    }

    public rowAdd(event: IRowDataCancelableEventArgs) {
        console.log("RowAdd is: " + event.primaryKey);
    }

    public rowAdded(event: IRowDataEventArgs) {
        console.log("RowAdded is: " + event.primaryKey);
    }

    public rowDelete(event: IRowDataCancelableEventArgs) {
        console.log("Row Delete is: " + event.primaryKey);
    }

    public rowDeleted(event: IRowDataEventArgs) {
        console.log("Row deleted is: " + event.primaryKey);
    }

    public ngOnInit(): void {
        this.columns = [
            { field: 'ID', width: '200px', hidden: false },
            { field: 'CompanyName', width: '200px' },
            { field: 'ContactName', width: '200px', pinned: false },
            { field: 'ContactTitle', width: '300px', pinned: false },
            { field: 'Address', width: '250px' },
            { field: 'City', width: '200px' },
            { field: 'Region', width: '300px' },
            { field: 'PostalCode', width: '150px' },
            { field: 'Phone', width: '200px' },
            { field: 'Fax', width: '200px' }
        ];

        for (let i = 0; i < 50; i++) {
            const user = new User();
            user.Id = i;
            user.Age = i + 10;
            user.Name = `User ${i}`;
            this.userData.push(user);
        }

        this.data = SAMPLE_DATA;
    }
}
