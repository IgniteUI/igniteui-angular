import { IgxSelectionAPIService } from "../core/selection";
import { IgxGridAPIService } from "./api.service";
export declare class IgxGridModule {
    static forRoot(): {
        ngModule: typeof IgxGridModule;
        providers: (typeof IgxSelectionAPIService | typeof IgxGridAPIService)[];
    };
}
