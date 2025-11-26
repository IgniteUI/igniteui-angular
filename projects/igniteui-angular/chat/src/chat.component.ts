import {
    ChangeDetectionStrategy,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    Directive,
    effect,
    inject,
    input,
    OnInit,
    output,
    signal,
    TemplateRef,
    ViewContainerRef,
    OnDestroy,
    ViewRef,
    computed,
} from '@angular/core';
import {
    IgcChatComponent,
    type IgcChatMessageAttachment,
    type IgcChatMessage,
    type IgcChatOptions,
    type ChatRenderContext,
    type ChatRenderers,
    type ChatAttachmentRenderContext,
    type ChatInputRenderContext,
    type ChatMessageRenderContext,
    type IgcChatMessageReaction,
} from 'igniteui-webcomponents';

type ChatContextUnion =
    | ChatAttachmentRenderContext
    | ChatMessageRenderContext
    | ChatInputRenderContext
    | ChatRenderContext;

type ChatContextType<T extends ChatContextUnion> =
    T extends ChatAttachmentRenderContext
    ? IgcChatMessageAttachment
    : T extends ChatMessageRenderContext
    ? IgcChatMessage
    : T extends ChatInputRenderContext
    ? { value: string; attachments: IgcChatMessageAttachment[] }
    : T extends ChatRenderContext
    ? { instance: IgcChatComponent }
    : never;

type ExtractChatContext<T> = T extends (ctx: infer R) => any ? R : never;

type ChatTemplatesContextMap = {
    [K in keyof ChatRenderers]: {
        $implicit: ChatContextType<
            ExtractChatContext<NonNullable<ChatRenderers[K]>> & ChatContextUnion
        >;
    };
};

/**
 * Template references for customizing chat component rendering.
 * Each property corresponds to a specific part of the chat UI that can be customized.
 *
 * @example
 * ```typescript
 * templates = {
 *   messageContent: this.customMessageTemplate,
 *   attachment: this.customAttachmentTemplate
 * }
 * ```
 */
export type IgxChatTemplates = {
    [K in keyof Omit<ChatRenderers, 'typingIndicator'>]?: TemplateRef<ChatTemplatesContextMap[K]>;
};

/**
 * Configuration options for the chat component.
 */
export type IgxChatOptions = Omit<IgcChatOptions, 'renderers'>;


/**
 * Angular wrapper component for the Ignite UI Web Components Chat component.
 *
 * This component provides an Angular-friendly interface to the igc-chat web component,
 * including support for Angular templates, signals, and change detection.
 *
 * Uses OnPush change detection strategy for optimal performance. All inputs are signals,
 * so changes are automatically tracked and propagated to the underlying web component.
 *
 * @example
 * ```typescript
 * <igx-chat
 *   [messages]="messages"
 *   [draftMessage]="draft"
 *   [options]="chatOptions"
 *   [templates]="chatTemplates"
 *   (messageCreated)="onMessageCreated($event)"
 * />
 * ```
 */
@Component({
    selector: 'igx-chat',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './chat.component.html'
})
export class IgxChatComponent implements OnInit, OnDestroy {
    //#region Internal state

    private readonly _view = inject(ViewContainerRef);
    private readonly _templateViewRefs = new Map<TemplateRef<any>, Set<ViewRef>>();
    private _oldTemplates: IgxChatTemplates = {};

    protected readonly _transformedTemplates = signal<ChatRenderers>({});

    protected readonly _mergedOptions = computed<IgcChatOptions>(() => {
        const options = this.options();
        const transformedTemplates = this._transformedTemplates();
        return {
            ...options,
            renderers: transformedTemplates
        };
    });

    //#endregion

    //#region Inputs

    /** Array of chat messages to display */
    public readonly messages = input<IgcChatMessage[]>([]);

    /** Draft message with text and optional attachments */
    public readonly draftMessage = input<
        { text: string; attachments?: IgcChatMessageAttachment[] } | undefined
    >({ text: '' });

    /** Configuration options for the chat component */
    public readonly options = input<IgxChatOptions>({});

    /** Custom templates for rendering chat elements */
    public readonly templates = input<IgxChatTemplates>({});

    //#endregion

    //#region Outputs

    /** Emitted when a new message is created */
    public readonly messageCreated = output<IgcChatMessage>();

    /** Emitted when a user reacts to a message */
    public readonly messageReact = output<IgcChatMessageReaction>();

    /** Emitted when an attachment is clicked */
    public readonly attachmentClick = output<IgcChatMessageAttachment>();

    /** Emitted when attachment drag starts */
    public readonly attachmentDrag = output<void>();

    /** Emitted when attachment is dropped */
    public readonly attachmentDrop = output<void>();

    /** Emitted when typing indicator state changes */
    public readonly typingChange = output<boolean>();

    /** Emitted when the input receives focus */
    public readonly inputFocus = output<void>();

    /** Emitted when the input loses focus */
    public readonly inputBlur = output<void>();

    /** Emitted when the input value changes */
    public readonly inputChange = output<string>();

    //#endregion

    /** @internal */
    public ngOnInit(): void {
        IgcChatComponent.register();
    }

    /** @internal */
    public ngOnDestroy(): void {
        for (const viewSet of this._templateViewRefs.values()) {
            viewSet.forEach(viewRef => viewRef.destroy());
        }
        this._templateViewRefs.clear();
    }

    constructor() {
        // Templates changed - update transformed templates and viewRefs
        effect(() => {
            const templates = this.templates();
            this._setTemplates(templates ?? {});
        });
    }

    private _setTemplates(newTemplates: IgxChatTemplates): void {
        const templateCopies: ChatRenderers = {};
        const newTemplateKeys = Object.keys(newTemplates) as Array<keyof IgxChatTemplates>;

        const oldTemplates = this._oldTemplates;
        const oldTemplateKeys = Object.keys(oldTemplates) as Array<keyof IgxChatTemplates>;

        for (const key of oldTemplateKeys) {
            const oldRef = oldTemplates[key];
            const newRef = newTemplates[key];

            if (oldRef && oldRef !== newRef) {
                const obsolete = this._templateViewRefs.get(oldRef);
                if (obsolete) {
                    obsolete.forEach(viewRef => viewRef.destroy());
                    this._templateViewRefs.delete(oldRef);
                }
            }
        }

        if (newTemplateKeys.length > 0) {
            this._oldTemplates = {};
            for (const key of newTemplateKeys) {
                const ref = newTemplates[key];
                if (ref) {
                    this._oldTemplates[key] = ref as any;
                    templateCopies[key] = this._createTemplateRenderer(ref);
                }
            }
        }

        this._transformedTemplates.set(templateCopies);
    }

    private _createTemplateRenderer<K extends keyof IgxChatTemplates>(ref: NonNullable<IgxChatTemplates[K]>) {
        type ChatContext = ExtractChatContext<NonNullable<ChatRenderers[K]>>;

        if (!this._templateViewRefs.has(ref)) {
            this._templateViewRefs.set(ref, new Set<ViewRef>());
        }

        const viewSet = this._templateViewRefs.get(ref)!;

        return (ctx: ChatContext) => {
            const context = ctx as ChatContextUnion;
            let angularContext: any;

            if ('message' in context && 'attachment' in context) {
                angularContext = { $implicit: context.attachment };
            } else if ('message' in context) {
                angularContext = { $implicit: context.message };
            } else if ('value' in context) {
                angularContext = {
                    $implicit: context.value,
                    attachments: context.attachments
                };
            } else {
                angularContext = { $implicit: { instance: context.instance } };
            }

            const viewRef = this._view.createEmbeddedView(ref, angularContext);
            viewSet.add(viewRef);

            return viewRef.rootNodes;
        }
    }
}

/**
 * Context provided to the chat input template.
 */
export interface ChatInputContext {
    /** The current input value */
    $implicit: string;
    /** Array of attachments associated with the input */
    attachments: IgcChatMessageAttachment[];
}

/**
 * Directive providing type information for chat message template contexts.
 * Use this directive on ng-template elements that render chat messages.
 *
 * @example
 * ```html
 * <ng-template igxChatMessageContext let-message>
 *   <div>{{ message.text }}</div>
 * </ng-template>
 * ```
 */
@Directive({ selector: '[igxChatMessageContext]' })
export class IgxChatMessageContextDirective {

    public static ngTemplateContextGuard(_: IgxChatMessageContextDirective, ctx: unknown): ctx is { $implicit: IgcChatMessage } {
        return true;
    }
}

/**
 * Directive providing type information for chat attachment template contexts.
 * Use this directive on ng-template elements that render message attachments.
 *
 * @example
 * ```html
 * <ng-template igxChatAttachmentContext let-attachment>
 *   <img [src]="attachment.url" />
 * </ng-template>
 * ```
 */
@Directive({ selector: '[igxChatAttachmentContext]' })
export class IgxChatAttachmentContextDirective {

    public static ngTemplateContextGuard(_: IgxChatAttachmentContextDirective, ctx: unknown): ctx is { $implicit: IgcChatMessageAttachment } {
        return true;
    }
}

/**
 * Directive providing type information for chat input template contexts.
 * Use this directive on ng-template elements that render the chat input.
 *
 * @example
 * ```html
 * <ng-template igxChatInputContext let-value let-attachments="attachments">
 *   <input [value]="value" />
 * </ng-template>
 * ```
 */
@Directive({ selector: '[igxChatInputContext]' })
export class IgxChatInputContextDirective {

    public static ngTemplateContextGuard(_: IgxChatInputContextDirective, ctx: unknown): ctx is ChatInputContext {
        return true;
    }
}
