export enum PagingError {
    None,
    IncorrectPageIndex,
    IncorrectRecordsPerPage
}

export declare interface PagingState {
    index: number;
    recordsPerPage: number;
    metadata?: {
        countPages: number;
        error: PagingError;
        countRecords: number;
    };
}
