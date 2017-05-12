import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { IgxCardModule } from "../../../src/main";
import { DataStateConfiguratorComponent } from "./data-state-configurator.component";
import { DataTable } from "./data-table.component";
// import panels
import { FilteringPanelComponent } from "./filtering-panel.component";
import { PagingPanelComponent } from "./paging-panel.component";
import { DataOperationsSampleComponent } from "./sample.component";
import { SortingPanelComponent } from "./sorting-panel.component";

@NgModule({
    declarations: [DataOperationsSampleComponent, DataTable, DataStateConfiguratorComponent,
                FilteringPanelComponent, SortingPanelComponent, PagingPanelComponent],
    imports: [
        IgxComponentsModule,
        CommonModule,
        FormsModule,
        IgxDirectivesModule,
        HttpModule,
        IgxCardModule
    ]
})
export class DataOperationsSampleModule {}
