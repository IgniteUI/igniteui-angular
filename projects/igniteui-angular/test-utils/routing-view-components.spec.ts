import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    template: `This is a content from view component # 1`,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class RoutingView1Component {
}

@Component({
    selector: 'igx-routing-view-2',
    template: `This is a content from view component # 2`,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class RoutingView2Component {
}

@Component({
    selector: 'igx-routing-view-3',
    template: `This is a content from view component # 3`,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class RoutingView3Component {
}

@Component({
    selector: 'igx-routing-view-4',
    template: `This is a content from view component # 4`,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class RoutingView4Component {
}

@Component({
    selector: 'igx-routing-view-5',
    template: `This is a content from view component # 5`,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class RoutingView5Component {
}

