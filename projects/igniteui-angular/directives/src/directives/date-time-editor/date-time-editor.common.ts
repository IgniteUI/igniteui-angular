export interface IgxDateTimeEditorEventArgs {
    readonly oldValue?: Date;
    newValue?: Date;
    readonly userInput: string;
}

// Re-export from core to maintain backwards compatibility
export { DatePart, DatePartInfo, DatePartDeltas } from 'igniteui-angular/core';
