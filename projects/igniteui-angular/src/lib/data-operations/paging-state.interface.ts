export enum PagingError {
    None,
    IncorrectPageIndex,
    IncorrectRecordsPerPage
}

export declare interface IPagingState {
    index: number;
    recordsPerPage: number;
    metadata?: {
        countPages: number;
        error: PagingError;
        countRecords: number;
    };
}
