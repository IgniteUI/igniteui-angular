export class RowExportingEventArgs {
	constructor(public rowData: any, public rowIndex: number) {
	}

	public cancel = false;
}


export class ColumnExportingEventArgs {
	constructor(public header: string, public columnIndex: number) {
	}

	public cancel = false;
}