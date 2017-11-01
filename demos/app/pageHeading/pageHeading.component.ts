import { Component, Input } from "@angular/core";

@Component({
    selector: "page-header",
    styleUrls: ["./pageHeading.styles.css"],
    templateUrl: "./pageHeading.template.html"
})
export class PageHeaderComponent {
    @Input() private title: string;
    @Input() private description: string;
}
