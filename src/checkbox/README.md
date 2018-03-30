# igx-checkbox

`igx-checkbox` is a selection component that allows users to make a binary choice for a certain condition. It behaves similar to the native browser checkbox.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/checkbox.html)

# Usage

Basic usage of `igx-checkbox`

```html
<ul>
    <li *ngFor="let task of tasks">
        <igx-checkbox [checked]="task.done" (change)="handler($event)">
            {{ task.description }}
        </igx-checkbox>
    </li>
</ul>
```

You can easily use it within forms with `[(ngModel)]`

```html
<form (submit)="saveForm()">
    <div class="order-detail__cbxgroup" *ngIf="order.items">
        <div *ngFor="let item of order.items">
            <ig-checkbox [disabled]="order.completed || order.canceled"
                         [checked]="order.completed"
                         [(ngModel)]="item.completed">
                {{ item.description }}
            </ig-checkbox>
        </div>
    </div>
</form>
```
