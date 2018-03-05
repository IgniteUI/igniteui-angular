import { Component } from "@angular/core";
import { IgxIconService } from "../../lib/icon/icon.service";
import { IgxIconModule } from "../../lib/main";

@Component({
    selector: "icon-sample",
    styleUrls: ["../app.samples.css", "./sample.component.css"],
    templateUrl: "icon.sample.html"
})
export class IconSampleComponent {
    constructor(private iconService: IgxIconService) {
        iconService.registerFontSetAlias("font-awesome", "fa");
    }
}
