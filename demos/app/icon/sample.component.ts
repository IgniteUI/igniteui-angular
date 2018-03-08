import { Component } from "@angular/core";
import { IgxIconService } from "../../lib/icon/icon.service";

@Component({
    selector: "icon-sample",
    styleUrls: ["../app.samples.css", "./sample.component.css"],
    templateUrl: "icon.sample.html"
})
export class IconSampleComponent {
    constructor(private iconService: IgxIconService) {
        iconService.registerFontSetAlias("fa-solid", "fa");
        iconService.registerFontSetAlias("fa-brands", "fab");
    }
}
