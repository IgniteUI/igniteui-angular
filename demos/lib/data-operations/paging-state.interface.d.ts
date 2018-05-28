export declare enum PagingError {
    None = 0,
    IncorrectPageIndex = 1,
    IncorrectRecordsPerPage = 2,
}
export interface IPagingState {
    index: number;
    recordsPerPage: number;
    metadata?: {
        countPages: number;
        error: PagingError;
        countRecords: number;
    };
}
