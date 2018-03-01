import { ChangeDetectionStrategy, Component, DoCheck, HostBinding, HostListener, Input } from "@angular/core";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid-summary",
    templateUrl: "./grid-summary.component.html"
})
export class IgxGridSummaryComponent {
    
}
