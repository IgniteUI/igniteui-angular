/**
 * Web Animations API keyframes plus timing options.
 * Same shape as the igniteui-webcomponents type of the same name.
 */
export interface AnimationReferenceMetadata {
    steps: Keyframe[];
    options?: KeyframeAnimationOptions;
}

/** Timing every preset accepts. Durations are milliseconds. */
export interface AnimationParams {
    duration: number;
    delay: number;
    easing: string;
}

/**
 * A named, parameterized animation. Callable with overrides, usable bare:
 *
 *   openAnimation: slideInTop
 *   openAnimation: slideInTop({ duration: 1000 })
 */
export interface AnimationPreset<P extends AnimationParams = AnimationParams> {
    (params?: Partial<P>): PresetAnimation<P>;
    readonly name: string;
    readonly defaults: Readonly<P>;
}

/** Output of a preset call. Remembers its origin so it can be reversed with the same overrides. */
export interface PresetAnimation<P extends AnimationParams = AnimationParams> extends AnimationReferenceMetadata {
    readonly preset: AnimationPreset<P>;
    readonly params: Partial<P>;
}

/** Anything the animation service accepts. */
export type AnimationInput = AnimationReferenceMetadata | AnimationPreset;

/** Wraps raw keyframes into metadata. For custom animations. */
export function animation(steps: Keyframe[], options?: KeyframeAnimationOptions): AnimationReferenceMetadata {
    return { steps, options };
}

/** Builds a preset from defaults and a keyframe recipe. `name` is the exported identifier. */
export function definePreset<P extends AnimationParams>(
    name: string,
    defaults: P,
    steps: (params: P) => Keyframe[]
): AnimationPreset<P> {
    const preset = ((params: Partial<P> = {}) => {
        const resolved = { ...defaults, ...definedOnly(params) };
        const { duration, delay, easing } = resolved;

        return { preset, params, steps: steps(resolved), options: { duration, delay, easing } };
    }) as AnimationPreset<P>;

    // Function.name is read-only but configurable.
    Object.defineProperties(preset, {
        name: { value: name },
        defaults: { value: Object.freeze({ ...defaults }) }
    });

    return preset;
}

export function isPreset(input: AnimationInput): input is AnimationPreset {
    return typeof input === 'function';
}

export function isPresetAnimation(input: AnimationInput): input is PresetAnimation {
    return !isPreset(input) && 'preset' in input;
}

/**
 * Normalizes an input into plain metadata, optionally overriding timing.
 * Preset-based inputs are rebuilt through their preset so reversal keeps working.
 */
export function resolveAnimation(input: AnimationInput, overrides?: Partial<AnimationParams>): AnimationReferenceMetadata {
    if (isPreset(input)) {
        return input(overrides);
    }

    if (!overrides) {
        return input;
    }

    if (isPresetAnimation(input)) {
        return input.preset({ ...input.params, ...overrides });
    }

    return { ...input, options: { ...input.options, ...definedOnly(overrides) } };
}

/** Drops `undefined` values so they never shadow a default. */
function definedOnly<T extends object>(source: T): Partial<T> {
    const result: Partial<T> = {};

    for (const key of Object.keys(source) as (keyof T)[]) {
        if (source[key] !== undefined) {
            result[key] = source[key];
        }
    }

    return result;
}
