import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { IgxCardModule } from "../../../src/main";
import { DataOperationsSampleComponent } from "./sample.component";
import { DataTable } from "./data-table.component";
import { HttpModule } from '@angular/http';
import { DataStateConfiguratorComponent } from "./data-state-configurator.component";

@NgModule({
    imports: [
        IgxComponentsModule, 
        CommonModule, 
        FormsModule, 
        IgxDirectivesModule, 
        HttpModule,
        IgxCardModule
    ],
    declarations: [DataOperationsSampleComponent, DataTable, DataStateConfiguratorComponent]
})
export class DataOperationsSampleModule {}