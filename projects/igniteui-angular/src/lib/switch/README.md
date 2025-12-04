# igx-switch

`igx-switch` is a selection component that allows users to make a binary choice for a certain condition. It behaves similar to the switch component sans the indeterminate state.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/switch)

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
    <div *ngIf="order.items">
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

### Switch Label

The switch label is set to anything passed between the opening and closing tags of the `<igx-switch>` component.

The position of the label can be set to either `before` or `after`(default) the switch using the `labelPosition` input property. For instance, to set the label position ___before___ the switch:

```html
<igx-switch labelPosition="before">Label</igx-switch>
```

### Ripple Touch Feedback

The `igx-switch` is styled according to the Google's Material spec, and provides a ripple effect around the switch's thumb when the switch is clicked/tapped.
To disable the ripple effect, do:

```html
<igx-switch [disableRipple]="true"></igx-switch>
```

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `@Input()` id |   string   | The unique `id` attribute to be used for the switch. If you do not provide a value, it will be auto-generated. |
| `@Input()` labelId |    string   | The unique `id` attribute to be used for the switch label. If you do not provide a value, it will be auto-generated. |
| `@Input()` name |  string | The `name` attribute to be used for the switch. |
| `@Input()` value | any | The value to be set for the switch. |
| `@Input()` tabindex | number | Specifies the tabbing order of the switch. |
| `@Input()` checked | boolean | Specifies the checked state of the switch. |
| `@Input()` required | boolean | Specifies the required state of the switch. |
| `@Input()` disabled | boolean | Specifies the disabled state of the switch. |
| `@Input()` disableRipple | boolean | Specifies the whether the ripple effect should be disabled for the switch. |
| `@Input()` labelPosition | string `|` enum LabelPosition | Specifies the position of the text label relative to the switch element. |
| `@Input("aria-labelledby")` ariaLabelledBy | string | Specify an external element by id to be used as label for the switch. |
| `@Output()` change | EventEmitter<IChangeCheckboxEventArgs> | Emitted when the switch checked value changes. |

### Methods

| toggle |
|:----------|
| Toggles the checked state of the switch. |
