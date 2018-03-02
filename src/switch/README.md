# igx-switch

`igx-switch` is a selection component that allows users to make a binary choice for a certain condition. It behaves similar to the switch component in iOS.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/switch.html)

# Usage

Basic usage of `igx-switch`

```html
<ul>
    <li *ngFor="let task of tasks">
        <igx-switch [checked]="task.done" (change)="handler($event)">
            {{ task.description }}
        </igx-switch>
    </li>
</ul>
```

You can easily use it within forms with `[(ngModel)]`

```html
<form (submit)="saveForm()">
    <div class="order-detail__cbxgroup" *ngIf="order.items">
        <div *ngFor="let item of order.items">
            <ig-switch [disabled]="order.completed || order.canceled"
                         [checked]="order.completed"
                         [(ngModel)]="item.completed">
                {{ item.description }}
            </ig-switch>
        </div>
    </div>
</form>
```
