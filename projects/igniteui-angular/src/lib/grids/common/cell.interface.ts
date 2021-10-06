import { ColumnType } from './column.interface';
import { GridType } from './grid.interface';
import { RowType } from './row.interface';

export interface CellType {
	value: any;
	editValue: any;
	selected: boolean;
	active: boolean;
	editable: boolean;
	editMode: boolean;
    nativeElement?: HTMLElement;
	column: ColumnType;
	row: RowType;
	grid: GridType;
	id: { rowID: any; columnID: number; rowIndex: number };
	width: string;
    visibleColumnIndex?: number;
	update: (value: any) => void;
    calculateSizeToFit?(range: any): number;
    activate?(): void;
}

