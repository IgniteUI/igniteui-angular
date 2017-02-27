import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { DataOperationsSampleComponent, DataIterator, DataService } from "./sample.component";
import { HttpModule } from '@angular/http';

@NgModule({
    imports: [IgxComponentsModule, CommonModule, FormsModule, IgxDirectivesModule, HttpModule],
    declarations: [DataOperationsSampleComponent, DataIterator]
})
export class DataOperationsSampleModule {}