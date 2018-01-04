import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { VirtualContainerComponent } from "./virtual.container.component";
import { VirtualRowHost } from "./virtual.row.host.directive";

@NgModule({
  declarations: [
    VirtualRowHost,
    VirtualContainerComponent
  ],
  entryComponents: [
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    VirtualContainerComponent,
    VirtualRowHost
  ]
})
export class IgxVirtualContainerModule {
  public static forRoot() {
    return {
      ngModule: IgxVirtualContainerModule
    };
  }
}
