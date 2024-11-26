import { ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import {
    IgxButtonModule,
    IgxDividerModule,
    IgxSplitterComponent,
    IgxSplitterModule,
} from "igniteui-angular";

@Component({
    selector: "app-splitter-sample",
    styleUrls: ["splitter.sample.scss"],
    templateUrl: "splitter.sample.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxButtonModule, IgxSplitterModule, IgxSplitterComponent, IgxDividerModule]
})
export class SplitterSampleComponent {
    @ViewChild("splitter") public splitterComponent: IgxSplitterComponent;

    public toggleCollapsible() {
        this.splitterComponent.nonCollapsible =
            !this.splitterComponent.nonCollapsible;
    }
}
