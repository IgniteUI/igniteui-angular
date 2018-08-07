# Ignite UI for Angular Typography

## Anatomy of the Typography in Ignite UI for Angular

Ignite UI for Angular follows [The Type System](https://material.io/design/typography/the-type-system.html#) as described in the Material Design specification. The type system is a ***type scale*** consisting of ***13 different category type styles*** used across most components. All of the scale categories are completely reusable and adjustable by the end user.

Here's a list of all 13 category styles as defined in Ignite UI for Angular:
- h1
- h2
- h3
- h4
- h5
- h6
- subtitle-1
- subtitle-2
- body-1
- body-2
- button
- caption
- overline

An application can define multiple `scales` that may share scale categories with each other. A `scale category` is a set of `type styles`, containing information about `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, and `text-transform`.

Ignite UI for Angular defines a `$default-type-scale`, which is in turn used by the `igx-typography` mixin to set the initial typography styles. The user can, however, pass a different type scale to be used by `igx-typography` mixin.

## Usage

There are a several mixins and functions that are used to set and retrieve category styles to/from a type scale. Those are:

- `igx-type-style` [function] - Returns a set of style rules to be used by a type scale category.
- `igx-type-scale` [function] - Returns a set of 13 style categories.
- `igx-type-scale-category` [function] - Returns a map of style rules from a type scale and category.
- `igx-type-style` [mixin] - Adds style rules to a selector from a specific type scale and category.
- `igx-typography` [mixin] - Defines the global application typography styles.


Let's take a close look at what each one of the aforementioned mixins and functions do.

### The type style
The `igx-type-style` function is an interface-like function that simply ensures that certain arguments are passed as part of the style set for a scale category. Say, for instance, that we want to define a new set of style rules for the `h1` scale category. To do so, we would simply write:

```scss
$h1-style: igx-type-style(
    $font-size: 112px,
    $font-weight: 600,
    $line-height: 96px
);
```

** Note that any properties that you do not pass, such as `$font-family`, `letter-spacing`, etc. will be automatically replaced with the default values as specified in the `$default-type-scale` for the category you want to use your style for.


### The type scale

The type scale is a map of type styles for all 13 scale categories. To generate a new type map all you have to do is write.

```scss
$my-type-scale: igx-type-scale();
```

This will produce a map, which is exactly the same as the `$default-scale-map` that the `igx-typography` mixin uses by default.

We can use the `$h1-style` we defined in our previous example to produce a slightly modified type scale.

```scss
$my-type-scale: igx-type-scale($h1: $h1-style);
```

Now `$my-type-scale` will store a modified type scale containing the modifications we specified for the `h1` category scale.


### The typography mixin

The typography mixin defines the global typography styles for an application, including how the native h1-h6 and p elements look.

It currently accepts 3 arguments:
- `$font-family` - The global font family to be used by the application.
- `$type-scale` - The default type scale to be used by the application.
- `$base-color` - The base text color to be used by the application.

To overwrite the default typography, include the `igx-typography` mixin anywhere after the `igx-core` mixin. Let's take advantage of the type scale `$my-type-scale` we defined above and make it the default type scale.

```scss
@include igx-typography(
    $font-family: "'Roboto', sans-serif",
    $type-scale: $my-type-scale,
    $base-color: #484848
);
```
