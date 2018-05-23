import { Component } from "@angular/core";

export class GridComponentFactory {
    public static data = [];
    public static gridAttributes = "";
    public static columnDefinitions = "";
    public static eventSubscriptions = "";

    public static templateBase = `<grid [data]="data"
        ${ GridComponentFactory.gridAttributes }
        ${ GridComponentFactory.eventSubscriptions }>
        ${ GridComponentFactory.columnDefinitions }
    </grid>`;
}

// @Component({
//     template: this.templateBase
// })
// export class BaseGridTestComponent {
//     public data = [];

// }

// enum GridEvents {
//     CellClick,
//     ColumnInit,
//     ColumnPinning,
//     ColumnResized,
//     ContextMenu,
//     DataPreLoad,
//     DoubleClick,
//     EditDone,
//     FilteringDone,
//     PagingDone,
//     RowAdded,
//     RowDeleted,
//     RowSelectionChange,
//     Selection,
//     SortingDone
// }
