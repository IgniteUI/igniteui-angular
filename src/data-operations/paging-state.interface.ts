export enum PagingError {
    None,
    IncorrectPageIndex,
    IncorrectRecordsPerPage
}

export declare class PagingState {
    index: number;
    recordsPerPage: number;
    metadata?: {
        countPages: number;
        error: PagingError;
        countRecords: number;
    };
}