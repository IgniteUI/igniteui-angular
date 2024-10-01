# Properties Panel Specification 

### Contents

1. [Overview & Objectives](#overview)
2. [User Stories](#user-stories)
3. [Functionality](#functionality)

### Owned by
**Team Name**: Design and Web Development (DnD)

**Developer**: Dilyana Yarabanova

### Requires approval from
- [x] Simeon Simeonov | Date:

### Signed off by
- [x] Simeon Simeonov | Date: 

## Revision History

| Version | Users           | Date             | Notes         |
|--------:|-----------------|------------------|---------------|
|       1 | Simeon Simeonov | Date: 1 Oct 2024 | Initial draft |

## <a name='overview'>1. Overview & Objectives</a>

The properties panel aims to provide a unified User Interface for configuring components in various app samples. It is configured via a standardized data model.

### Acceptance criteria 

1. Should be able to configure the panel using a data object specifying the configuration properties and their default values.
2. Should generate UI elements for the provided data object.
3. Should emit event with the updated properties when the user changes them. 

```html
<app-properties-panel [config]="config"></app-properties-panel>
```

```ts
@Component({
    selector: "app-sample",
    ...
})
export class AppSampleComponent {
    public config = {
        disabled: {
            label?: 'Disabled',
            control: {
                type: 'boolean',
                labels?: ''
            }
        },
        locale: {
            label: 'Change Locale',
            control: {
                type: 'button-group',
                options: ['en', 'fr', 'ru', 'es'],
                labels: ['EN', 'FR', 'RU', 'ES'],
                defaultValue: 'en'
            },
        },
        months_num: {
            label: 'Number of months',
            control: {
                type: 'number',
                defaultValue: 1,
                min?: 1,
                max?: 4,
                step?: 1
            }
        }
    }
}
```

**End-user stories:**


## <a name='functionality'>3. Functionality</a>

