import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxVirtualContainerModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { VirtualContainerRemoteSampleComponent } from "./sample.component";
import { myRow } from './row';
import { myCell } from './cell';

@NgModule({    
    declarations: [VirtualContainerRemoteSampleComponent, myRow, myCell],
    imports: [PageHeaderModule, CommonModule, IgxVirtualContainerModule ],
    entryComponents: [myRow, myCell]
})
export class VirtualContainerRemoteSampleModule {  }
