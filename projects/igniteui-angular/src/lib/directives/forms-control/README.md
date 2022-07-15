# igxFormsControl

The `igxFormsControl` directive attaches to form `igc-` elements from Ignite UI for WebComponents and provides `ValueAccessor` implementation so that they can be used in Angular forms.

## Supported Components

1. `igc-rating`

## Notes

- `igxFormsControl` directive's `listenForValueChange` uses the common WC `igcChange` event. Ideally, all WC value change events will use the same name.
- The WC value is directly read and set through the element's properties.
