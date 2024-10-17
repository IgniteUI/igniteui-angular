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
| ------: | --------------- | ---------------- | ------------- |
|       1 | Simeon Simeonov | Date: 1 Oct 2024 | Initial draft |
|       2 | Dilyana Yarabanova | Date: 3 Oct 2024 | Update Specification |

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
        monthsNum: {
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

1. Here's a table of the available control types and how to use them:

| Control Type | Description                                                                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| boolean      | Provides a toggle for switching between possible states. config = { disabled: { control: { type: 'boolean'}}}                                                   |
| number       | Provides a numeric input to include the range of all possible values. config = { monthsNum: { control: { type: 'number', min:1, max:30, step: 2 }}}             |
| range        | Provides a slider component to include all possible values. config = { odd: { control: { type: 'range', min: 1, max: 30, step: 3 }}}                            |
| radio        | Provides a set of radio buttons based on the available options. config = { contact: { control: { type: 'radio', options: ['email', 'phone', 'mail'] }}}         |
| radio-inline | Provides a set of inlined radio buttons based on the available options. config = { contact: { control: { type: 'radio', options: ['email', 'phone', 'mail'] }}} |
| button-group | Provides a button group with the available options config = { locale: { control: { type: 'button-group', options: ['en', 'fr', 'ru', 'es']}}}                   |
| select       | Provides a drop-down list component to handle single value selection. config = { age: { control: { type: 'select', options: [20, 30, 40, 50] }}}                |
| text         | Provides a freeform text input. config = { label: { control: { type: 'text' }}}                                                                                 |
| date         | Provides a datepicker component to handle date selection. config = { startDate: { control: { type: 'date' }}}                                                   |
| time         | Provides a timepicker component to handle time selection. config = { startDate: { control: { type: 'date' }}}                                                   |
| date-time    | Provides an input component with date-time editor directive to handle date and time selection/change. config = { startDate: { control: { type: 'date' }}}       |

2. You can also add label to show the user the name or a short description of the property.

```ts
public config = {
    monthsNum: {
        label: 'Number of months',
        control: {
            type: 'number',
        }
    }
}
```

That way above the control, there will be a label - "Number of months" so the user has better understanding of what this property does.

3. Labels for the controls are also available, if you want to show the property values in a more visually pleasing way:

```ts
public config = {
    locale: {
        control: {
            type: 'button-group',
            options: ['en', 'fr', 'ru', 'es'],
            labels: ['EN', 'FR', 'RU', 'ES'],
            defaultValue: 'en'
        },
    },
}
```

Using labels for the options, in this example, the text of the buttons will use the capitalized values from `labels`, but will pass to the property the values from `options`. You can also see how we use `defaultValue` in this example and it's available for all control types.
