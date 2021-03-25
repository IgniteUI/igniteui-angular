import { Component } from '@angular/core';

@Component({
    template: `
        <igx-list [allowRightPanning]="true" [allowLeftPanning]="true">
            <igx-list-item [isHeader]="true">History</igx-list-item>
            <igx-list-item igxRipple="pink" igxRippleTarget=".igx-list__item" *ngFor="let contact of contacts">
                <igx-avatar [src]="contact.avatar" [roundShape]="true" igxListThumbnail></igx-avatar>
                <h4 igxListLineTitle>{{contact.text}}</h4>
                <p igxListLineSubTitle>{{contact.phone}}</p>
                <igx-icon igxListAction>phone</igx-icon>
            </igx-list-item>
        </igx-list>
    `
})
export class BottomNavRoutingView1Component {

    public contacts = [{
        avatar: 'assets/images/avatar/1.jpg',
        phone: '770-504-2217',
        text: 'Terrance Orta'
    }, {
        avatar: 'assets/images/avatar/2.jpg',
        phone: '423-676-2869',
        text: 'Richard Mahoney'
    }, {
        avatar: 'assets/images/avatar/3.jpg',
        phone: '859-496-2817',
        text: 'Donna Price'
    }, {
        avatar: 'assets/images/avatar/4.jpg',
        phone: '901-747-3428',
        text: 'Lisa Landers'
    }, {
        avatar: 'assets/images/avatar/12.jpg',
        phone: '573-394-9254',
        text: 'Dorothy H. Spencer'
    }, {
        avatar: 'assets/images/avatar/13.jpg',
        phone: '323-668-1482',
        text: 'Stephanie May'
    }, {
        avatar: 'assets/images/avatar/14.jpg',
        phone: '401-661-3742',
        text: 'Marianne Taylor'
    }];

}

@Component({
    template: `
        <h3>Tab 2 Content</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula. Donec
            consectetur accumsan suscipit. Praesent rutrum tellus blandit bibendum cursus. Vestibulum
            urna arcu, bibendum nec molestie ac, varius congue massa. Mauris porttitor viverra lacus.
            Donec efficitur purus id urna dapibus, vitae pharetra orci pellentesque. Vestibulum id lacus
            a magna euismod volutpat id in mi. Etiam a nunc ut tellus dictum porta. Donec in ligula a
            arcu sollicitudin finibus. Vivamus id lorem pulvinar, accumsan justo vitae, vehicula diam.
            Mauris vel quam at velit venenatis vulputate in quis nisl.</p>
    `
})
export class BottomNavRoutingView2Component {
}

@Component({
    template: `
        <h3>Tab 3 Content</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula. Donec
            consectetur accumsan suscipit. Praesent rutrum tellus blandit bibendum cursus. Vestibulum
            urna arcu, bibendum nec molestie ac, varius congue massa. Mauris porttitor viverra lacus.
            Donec efficitur purus id urna dapibus, vitae pharetra orci pellentesque.</p>
    `
})
export class BottomNavRoutingView3Component {
}

