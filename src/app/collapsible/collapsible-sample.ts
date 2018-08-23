import { IgxCollapsibleComponent } from './../../../projects/igniteui-angular/src/lib/collapsible/collapsible.component';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
    // IgxCollapsibleComponent
} from 'igniteui-angular';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'collapsible-sample',
    templateUrl: './collapsible-sample.html',
    styleUrls: ['collapsible-sample.scss']
})
export class CollapsibleSampleComponent implements OnInit {
    @ViewChild(IgxCollapsibleComponent) public igxCollapsible: IgxCollapsibleComponent;
    @ViewChild('button') public button: ElementRef;

    public score: number;
    public data = [];
    public winningPlayer;
    private rounds = 5;
    public get currentScore(): { 'Player 1': number,
    'Player 2': number} {
        return this.data.reduce((a, b) => {
            return {
                'Player 1': a['Player 1'] + b['Player 1'],
                'Player 2': a['Player 2'] + b['Player 2'],
            };
        });
    }

    public get getWinningScore(): number {
        return Math.max(...Object.values(this.currentScore));
    }
    public get getWinningPlayer(): string {
        const currentScore = this.currentScore;
        return Object.keys(currentScore).sort((a, b) => currentScore[b] - currentScore[a])[0];
    }
    private generateScore(): void {
        for (let i = 0; i < this.rounds; i++) {
            this.data.push({
                'Game': `Game ${i + 1}`,
                'Player 1': Math.floor(Math.random() * 10) + 1,
                'Player 2': Math.floor(Math.random() * 10) + 1
            });
        }
    }

    ngOnInit() {
        this.generateScore();
        this.igxCollapsible.onCollapsed.subscribe((e) => {
            this.onCollapsing(e);
        });
        this.igxCollapsible.onExpanded.subscribe((e) => {
            this.onExpanding(e);
        });
    }

    resetScore(event: Event) {
        this.data = [];
        event.stopPropagation();
        this.generateScore();
    }

    constructor() {
    }

    onCollapsing(event) {
        console.log(`I'm collapsing!`, event);
    }
    onExpanding(event) {
        console.log(`I'm expanding!`, event);
    }
    onInterraction(event) {
        console.log(`Header's touched!`, event);
    }
}
