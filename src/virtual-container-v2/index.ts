import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { HorizontalChunkComponent } from "./horizontal-chunk.component";
import { VerticalChunkComponent } from "./vertical-chunk.component";
import { VirtualContainerComponent } from "./virtual-container.component";

@NgModule({
    declarations: [
      VirtualContainerComponent,
      VerticalChunkComponent,
      HorizontalChunkComponent
    ],
    entryComponents: [
    ],
    imports: [
      CommonModule
    ],
    exports: [
      VirtualContainerComponent,
      VerticalChunkComponent,
      HorizontalChunkComponent
    ]
})
export class VirtualContainerModule {
    public static forRoot() {
      return {
        ngModule: VirtualContainerModule
      };
    }
  }