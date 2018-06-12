import { IScrollStrategy } from './IScrollStrategy';

export class BlockScrollStrategy implements IScrollStrategy {
    private initialScrollTop;
    private initialScrollLeft;

    constructor(private document: Document) { }

    public attach() {
        this.initialScrollTop = this.document.documentElement.scrollTop;
        this.initialScrollLeft = this.document.documentElement.scrollLeft;
        // this.document.addEventListener('wheel', this.onWheel);
        this.document.addEventListener('scroll', this.onScroll);
    }

    public detach() {
        // this.document.removeEventListener('wheel', this.onWheel);
        this.document.removeEventListener('scroll', this.onScroll);
    }

    private onScroll = (ev) => {
        ev.target.scrollingElement.scrollTop = this.initialScrollTop;
        ev.target.scrollingElement.scrollLeft = this.initialScrollLeft;
    }

    // private onWheel = (ev: WheelEvent) => {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    // }
}
