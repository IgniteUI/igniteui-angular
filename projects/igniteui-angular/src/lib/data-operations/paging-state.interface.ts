export enum PagingError {
    None,
    IncorrectPageIndex,
    IncorrectRecordsPerPage
}

/* marshalByValue */
/* tsPlainInterface */
export declare interface IPagingState {
    index: number;
    recordsPerPage: number;
    /* blazorSuppress */
    metadata?: {
        countPages: number;
        error: PagingError;
        countRecords: number;
    };
}
