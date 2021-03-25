import {
    IgxExpansionPanelComponent,
    growVerIn,
    growVerOut,
    IExpansionPanelEventArgs,
    ExpansionPanelHeaderIconPosition
} from 'igniteui-angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AnimationReferenceMetadata, useAnimation } from '@angular/animations';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'expansion-panel-sample',
    templateUrl: './expansion-panel-sample.html',
    styleUrls: ['expansion-panel-sample.scss']
})
export class ExpansionPanelSampleComponent implements OnInit {
    @ViewChild(IgxExpansionPanelComponent, { static: true })
    private igxExpansionPanel: IgxExpansionPanelComponent;

    public animationSettings: { openAnimation: AnimationReferenceMetadata; closeAnimation: AnimationReferenceMetadata } = {
        openAnimation: useAnimation(growVerIn, { params: {
            startHeight: '0px',
            endHeight: '*',
            duration: '400ms'
        }}),
        closeAnimation: useAnimation(growVerOut, {
            params: {
                duration: '200ms'
            }
        })
    };
    public templatedIcon = false;
    public score: number;
    public data = [];
    public winningPlayer;
    public iconPosition: ExpansionPanelHeaderIconPosition = 'right';
    private rounds = 5;
    public get currentScore(): {
        'Player 1': number;
        'Player 2': number;
    } {
        return this.data.length === 0 ? [] : this.data.reduce((a, b) => ({
                'Player 1': a['Player 1'] + b['Player 1'],
                'Player 2': a['Player 2'] + b['Player 2'],
            }));
    }

    public get getWinningScore(): number {
        return Math.max(...Object.values(this.currentScore));
    }
    public get getWinningPlayer(): string {
        const currentScore = this.currentScore;
        return Object.keys(currentScore).sort((a, b) => currentScore[b] - currentScore[a])[0];
    }

    public ngOnInit() {
        this.generateScore();
    }

    public resetScore(event: Event) {
        this.data = [];
        event.stopPropagation();
        this.generateScore();
    }

    public collapsed() {
        return this.igxExpansionPanel && this.igxExpansionPanel.collapsed;
    }

    public handleCollapsed(event) {
        console.log(`I'm collapsing!`, event);
    }
    public handleExpanded(event) {
        console.log(`I'm expanding!`, event);
    }
    public onInteraction(event: IExpansionPanelEventArgs) {
        console.log(event.owner);
        console.log(`Header's touched!`, event);
    }

    public templateIcon() {
        this.templatedIcon = !this.templatedIcon;
    }

    public toggleLeftRight() {
        this.iconPosition = this.iconPosition === 'right' ? 'left' : 'right';
    }

    private generateScore(): void {
        for (let i = 0; i < this.rounds; i++) {
            this.data.push({
                Game: `Game ${i + 1}`,
                'Player 1': Math.floor(Math.random() * 10) + 1,
                'Player 2': Math.floor(Math.random() * 10) + 1
            });
        }
    }
}
