/**
 * AnimationBuilder is an injectable service that is available when the {@link
 * BrowserAnimationsModule BrowserAnimationsModule} or {@link NoopAnimationsModule
 * NoopAnimationsModule} modules are used within an application.
 *
 * The purpose if this service is to produce an animation sequence programmatically within an
 * angular component or directive.
 *
 * Programmatic animations are first built and then a player is created when the build animation is
 * attached to an element.
 *
 * ```ts
 * // remember to include the BrowserAnimationsModule module for this to work...
 * import {AnimationBuilder} from '@angular/animations';
 *
 * class MyCmp {
 *   constructor(private _builder: AnimationBuilder) {}
 *
 *   makeAnimation(element: any) {
 *     // first build the animation
 *     const myAnimation = this._builder.build([
 *       style({ width: 0 }),
 *       animate(1000, style({ width: '100px' }))
 *     ]);
 *
 *     // then create a player from it
 *     const player = myAnimation.create(element);
 *
 *     player.play();
 *   }
 * }
 * ```
 *
 * When an animation is built an instance of {@link AnimationFactory AnimationFactory} will be
 * returned. Using that an {@link AnimationPlayer AnimationPlayer} can be created which can then be
 * used to start the animation.
 *
 * @experimental Animation support is experimental.
 */
var /**
 * AnimationBuilder is an injectable service that is available when the {@link
 * BrowserAnimationsModule BrowserAnimationsModule} or {@link NoopAnimationsModule
 * NoopAnimationsModule} modules are used within an application.
 *
 * The purpose if this service is to produce an animation sequence programmatically within an
 * angular component or directive.
 *
 * Programmatic animations are first built and then a player is created when the build animation is
 * attached to an element.
 *
 * ```ts
 * // remember to include the BrowserAnimationsModule module for this to work...
 * import {AnimationBuilder} from '@angular/animations';
 *
 * class MyCmp {
 *   constructor(private _builder: AnimationBuilder) {}
 *
 *   makeAnimation(element: any) {
 *     // first build the animation
 *     const myAnimation = this._builder.build([
 *       style({ width: 0 }),
 *       animate(1000, style({ width: '100px' }))
 *     ]);
 *
 *     // then create a player from it
 *     const player = myAnimation.create(element);
 *
 *     player.play();
 *   }
 * }
 * ```
 *
 * When an animation is built an instance of {@link AnimationFactory AnimationFactory} will be
 * returned. Using that an {@link AnimationPlayer AnimationPlayer} can be created which can then be
 * used to start the animation.
 *
 * @experimental Animation support is experimental.
 */
AnimationBuilder = /** @class */ (function () {
    function AnimationBuilder() {
    }
    return AnimationBuilder;
}());
/**
 * AnimationBuilder is an injectable service that is available when the {@link
 * BrowserAnimationsModule BrowserAnimationsModule} or {@link NoopAnimationsModule
 * NoopAnimationsModule} modules are used within an application.
 *
 * The purpose if this service is to produce an animation sequence programmatically within an
 * angular component or directive.
 *
 * Programmatic animations are first built and then a player is created when the build animation is
 * attached to an element.
 *
 * ```ts
 * // remember to include the BrowserAnimationsModule module for this to work...
 * import {AnimationBuilder} from '@angular/animations';
 *
 * class MyCmp {
 *   constructor(private _builder: AnimationBuilder) {}
 *
 *   makeAnimation(element: any) {
 *     // first build the animation
 *     const myAnimation = this._builder.build([
 *       style({ width: 0 }),
 *       animate(1000, style({ width: '100px' }))
 *     ]);
 *
 *     // then create a player from it
 *     const player = myAnimation.create(element);
 *
 *     player.play();
 *   }
 * }
 * ```
 *
 * When an animation is built an instance of {@link AnimationFactory AnimationFactory} will be
 * returned. Using that an {@link AnimationPlayer AnimationPlayer} can be created which can then be
 * used to start the animation.
 *
 * @experimental Animation support is experimental.
 */
export { AnimationBuilder };
/**
 * An instance of `AnimationFactory` is returned from {@link AnimationBuilder#build
 * AnimationBuilder.build}.
 *
 * @experimental Animation support is experimental.
 */
var /**
 * An instance of `AnimationFactory` is returned from {@link AnimationBuilder#build
 * AnimationBuilder.build}.
 *
 * @experimental Animation support is experimental.
 */
AnimationFactory = /** @class */ (function () {
    function AnimationFactory() {
    }
    return AnimationFactory;
}());
/**
 * An instance of `AnimationFactory` is returned from {@link AnimationBuilder#build
 * AnimationBuilder.build}.
 *
 * @experimental Animation support is experimental.
 */
export { AnimationFactory };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL3NyYy9hbmltYXRpb25fYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpREE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7MkJBakRBO0lBbURDLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFGRCw0QkFFQzs7Ozs7OztBQVFEOzs7Ozs7QUFBQTs7OzJCQTNEQTtJQTZEQyxDQUFBOzs7Ozs7O0FBRkQsNEJBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvbk1ldGFkYXRhLCBBbmltYXRpb25PcHRpb25zfSBmcm9tICcuL2FuaW1hdGlvbl9tZXRhZGF0YSc7XG5pbXBvcnQge0FuaW1hdGlvblBsYXllcn0gZnJvbSAnLi9wbGF5ZXJzL2FuaW1hdGlvbl9wbGF5ZXInO1xuXG4vKipcbiAqIEFuaW1hdGlvbkJ1aWxkZXIgaXMgYW4gaW5qZWN0YWJsZSBzZXJ2aWNlIHRoYXQgaXMgYXZhaWxhYmxlIHdoZW4gdGhlIHtAbGlua1xuICogQnJvd3NlckFuaW1hdGlvbnNNb2R1bGUgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGV9IG9yIHtAbGluayBOb29wQW5pbWF0aW9uc01vZHVsZVxuICogTm9vcEFuaW1hdGlvbnNNb2R1bGV9IG1vZHVsZXMgYXJlIHVzZWQgd2l0aGluIGFuIGFwcGxpY2F0aW9uLlxuICpcbiAqIFRoZSBwdXJwb3NlIGlmIHRoaXMgc2VydmljZSBpcyB0byBwcm9kdWNlIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZSBwcm9ncmFtbWF0aWNhbGx5IHdpdGhpbiBhblxuICogYW5ndWxhciBjb21wb25lbnQgb3IgZGlyZWN0aXZlLlxuICpcbiAqIFByb2dyYW1tYXRpYyBhbmltYXRpb25zIGFyZSBmaXJzdCBidWlsdCBhbmQgdGhlbiBhIHBsYXllciBpcyBjcmVhdGVkIHdoZW4gdGhlIGJ1aWxkIGFuaW1hdGlvbiBpc1xuICogYXR0YWNoZWQgdG8gYW4gZWxlbWVudC5cbiAqXG4gKiBgYGB0c1xuICogLy8gcmVtZW1iZXIgdG8gaW5jbHVkZSB0aGUgQnJvd3NlckFuaW1hdGlvbnNNb2R1bGUgbW9kdWxlIGZvciB0aGlzIHRvIHdvcmsuLi5cbiAqIGltcG9ydCB7QW5pbWF0aW9uQnVpbGRlcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG4gKlxuICogY2xhc3MgTXlDbXAge1xuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9idWlsZGVyOiBBbmltYXRpb25CdWlsZGVyKSB7fVxuICpcbiAqICAgbWFrZUFuaW1hdGlvbihlbGVtZW50OiBhbnkpIHtcbiAqICAgICAvLyBmaXJzdCBidWlsZCB0aGUgYW5pbWF0aW9uXG4gKiAgICAgY29uc3QgbXlBbmltYXRpb24gPSB0aGlzLl9idWlsZGVyLmJ1aWxkKFtcbiAqICAgICAgIHN0eWxlKHsgd2lkdGg6IDAgfSksXG4gKiAgICAgICBhbmltYXRlKDEwMDAsIHN0eWxlKHsgd2lkdGg6ICcxMDBweCcgfSkpXG4gKiAgICAgXSk7XG4gKlxuICogICAgIC8vIHRoZW4gY3JlYXRlIGEgcGxheWVyIGZyb20gaXRcbiAqICAgICBjb25zdCBwbGF5ZXIgPSBteUFuaW1hdGlvbi5jcmVhdGUoZWxlbWVudCk7XG4gKlxuICogICAgIHBsYXllci5wbGF5KCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdoZW4gYW4gYW5pbWF0aW9uIGlzIGJ1aWx0IGFuIGluc3RhbmNlIG9mIHtAbGluayBBbmltYXRpb25GYWN0b3J5IEFuaW1hdGlvbkZhY3Rvcnl9IHdpbGwgYmVcbiAqIHJldHVybmVkLiBVc2luZyB0aGF0IGFuIHtAbGluayBBbmltYXRpb25QbGF5ZXIgQW5pbWF0aW9uUGxheWVyfSBjYW4gYmUgY3JlYXRlZCB3aGljaCBjYW4gdGhlbiBiZVxuICogdXNlZCB0byBzdGFydCB0aGUgYW5pbWF0aW9uLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW5pbWF0aW9uQnVpbGRlciB7XG4gIGFic3RyYWN0IGJ1aWxkKGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXSk6IEFuaW1hdGlvbkZhY3Rvcnk7XG59XG5cbi8qKlxuICogQW4gaW5zdGFuY2Ugb2YgYEFuaW1hdGlvbkZhY3RvcnlgIGlzIHJldHVybmVkIGZyb20ge0BsaW5rIEFuaW1hdGlvbkJ1aWxkZXIjYnVpbGRcbiAqIEFuaW1hdGlvbkJ1aWxkZXIuYnVpbGR9LlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW5pbWF0aW9uRmFjdG9yeSB7XG4gIGFic3RyYWN0IGNyZWF0ZShlbGVtZW50OiBhbnksIG9wdGlvbnM/OiBBbmltYXRpb25PcHRpb25zKTogQW5pbWF0aW9uUGxheWVyO1xufVxuIl19