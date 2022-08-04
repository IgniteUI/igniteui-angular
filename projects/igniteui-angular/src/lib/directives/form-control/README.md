# igcFormControlDirective

The `IgcFormControl` directive is designed to attach to form `igc-` elements from Ignite UI for WebComponents and provide `ValueAccessor` implementation so that they can be used in Angular templates and reactive forms with support for `ngModel` and `formControlName` directives.

The directive doesn't require a specific attribute and instead uses the element's name. This means that users only need to import it for it to take effect.

```html
<igc-rating name="modelRating" [(ngModel)]="model.Rating"></igc-rating>
```

```typescript
import { IgcFormsModule } from 'igniteui-angular';

@NgModule({
    declarations: AppComponent,
    imports: [
        IgcFormsModule
    ]
})
export class AppModule { }
```

## Supported Components

1. `igc-rating`

## Notes

- Users still need to define their Ignite UI Web Components before use as the directive doesn't do that for them. This can be achieved by using the `defineComponents` function inside your Angular component's .ts file using an Ignite UI Web Component.
    ```typescript
        import { Component } from '@angular/core';
        import { defineComponents, IgcRatingComponent } from 'igniteui-webcomponents';

        defineComponents(IgcRatingComponent);

        @Component({
            selector: 'rating-sample',
            styleUrls: ['rating.sample.css'],
            templateUrl: 'rating.sample.html'
        })
        export class RatingSampleComponent { }
    ```