export interface IVirtualizationState {
    chunkStartIndex: number;
    chunkEndIndex: number;
    metadata?: {
        totalRecordsCount: number;
    };
}
