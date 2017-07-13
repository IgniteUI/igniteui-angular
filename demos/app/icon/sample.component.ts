import { Component} from "@angular/core";
import { IgxIconModule } from "../../../src/main";

@Component ({
    moduleId: module.id,
    selector: "icon-sample",
    styleUrls: ["../app.samples.css", "./sample.component.css"],
    templateUrl: "icon.sample.html"
})
export class IconSampleComponent {
    private val = new Date(2017, 7, 7);

    public customFormatter = (_: Date) => {
        return `${_.getFullYear()}/${_.getMonth()}/${_.getDate()}`;
    }

}
