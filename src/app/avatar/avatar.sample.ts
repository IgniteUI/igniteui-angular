import {
    Component,
    ViewChild,
    ViewEncapsulation,
    OnInit,
    ComponentFactoryResolver,
    ViewContainerRef,
} from '@angular/core';
import { IgxColumnComponent, IgxGridComponent } from 'igniteui-angular';
import {DATA} from "./customers";

@Component({
    encapsulation: ViewEncapsulation.None,
   // providers: [],
    selector: 'app-avatar-sample',
    styleUrls: ['avatar.sample.css'],
    templateUrl: `avatar.sample.html`
})
export class AvatarSampleComponent implements OnInit {
    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;

    constructor(
        private resolver: ComponentFactoryResolver,
        private viewRef: ViewContainerRef
    ) {}

    public data: any[];
    public columns: any[];
    public ngOnInit(): void {
        this.columns = [
            { field: 'CompanyName', header: 'Company Name', width: 300 },
            {
                field: 'ContactName',
                header: 'Contact Name',
                width: 200,
            },
            {
                field: 'ContactTitle',
                header: 'Contact Title',
                width: 200,
            },
            { field: 'Address', header: 'Address', width: 300 },
            { field: 'City', header: 'City', width: 120 },
            { field: 'Region', header: 'Region', width: 120 },
            { field: 'PostalCode', header: 'Postal Code', width: 150 },
            { field: 'Phone', header: 'Phone', width: 150 },
            { field: 'Fax', header: 'Fax', width: 150 },
        ];
        this.data = DATA;
    }

    public trackByField(index: number, value: any) {
        return value.field;
    }

    public toggleColumn(col: IgxColumnComponent) {
        col.pinned ? col.unpin() : col.pin();
    }

    public reverseColumns() {
        this.columns.reverse();
        console.log(this.columns);

        this.gridResetColumns(this.columns);
    }

    private gridResetColumns(columns: any[]) {
         const newColumns = [];
        const factory = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const ref = factory.create(this.viewRef.injector);

        columns.forEach((c) => {
            Object.assign(ref.instance, c);
            ref.changeDetectorRef.detectChanges();
            newColumns.push(ref.instance);
        });


        this.grid1.columnList.reset(this.columns);
        this.grid1.cdr.detectChanges();
    }
}
