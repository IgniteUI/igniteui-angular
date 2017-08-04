import {Component} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "scroll-sample",
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "./sample.component.html"
})
export class IgxScrollSampleComponent {
    public items: string[] = [];
    /*[ "Trina Friesen", "Mack Koch", "Burney O'Kon", "Dawson Rohan", "Mr. Reinhold Schmidt DDS",
        "Jesenia Rogahn", "Tod Heller", "Rhonda Cormier", "Dr. Hayden Lockman", "Tierra Witting MD",
        "Roderic Considine", "Miley Tromp MD", "Zina Buckridge", "Mrs. Suzanne Stanton", "Lyndia Steuber",
        "Dominick Quigley", "Cason Botsford", "Janeen Schaden", "Tegan Wehner", "Mr. Halley Ryan", "Evalena Hackett",
        "Racquel O'Hara", "Lilburn Weissnat", "Bernice Mante", "Carli King", "Miss Alyse Gusikowski", "Nelia Powlowski",
        "Andon Hammes", "Mrs. Ivie Bailey PhD", "Lahoma Rutherford" ];*/

    public constructor() {
        for (let i = 1; i <= 50000; i++) {
            this.items.push("item #" + i );
        }

        this.visibleItems = this.items.slice(0, 5);
    }

    public visibleItems: string[] = [];

    public visibleItemsCount: number = 5;

    private updateList($event): void {
        this.visibleItems = this.items.slice($event.currentTop, $event.currentTop + this.visibleItemsCount);
    }
}
