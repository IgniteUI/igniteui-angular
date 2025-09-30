import {
    ChangeDetectionStrategy,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    effect,
    inject,
    input,
    OnInit,
    output,
    signal,
    TemplateRef,
    ViewContainerRef,
    untracked,
    OnDestroy,
    ViewRef,
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
    ? { value: T['value']; attachments: T['attachments'] }
    : T extends ChatRenderContext
    ? { instance: T['instance'] }
    : never;

type ExtractChatContext<T> = T extends (ctx: infer R) => any ? R : never;

type ChatTemplatesContextMap = {
    [K in keyof ChatRenderers]: {
        $implicit: ChatContextType<
            ExtractChatContext<NonNullable<ChatRenderers[K]>> & ChatContextUnion
        >;
    };
};

export type NgChatTemplates = {
    [K in keyof ChatRenderers]?: TemplateRef<ChatTemplatesContextMap[K]>;
};

export type NgChatOptions = Omit<IgcChatOptions, 'renderers'>;

@Component({
    selector: 'igx-chat',
    changeDetection: ChangeDetectionStrategy.OnPush,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './chat.component.html'
})
export class IgxChatComponent implements OnInit, OnDestroy {
    //#region Internal state

    private readonly _view = inject(ViewContainerRef);
    private readonly _templateViewRefs = new Map<TemplateRef<any>, Set<ViewRef>>();
    private _oldTemplates: NgChatTemplates = {};

    protected readonly _mergedOptions = signal<IgcChatOptions>({});
    protected readonly _transformedTemplates = signal<ChatRenderers>({});

    //#endregion

    //#region Inputs

    public readonly messages = input<IgcChatMessage[]>([]);
    public readonly draftMessage = input<
        { text: string; attachments?: IgcChatMessageAttachment[] } | undefined
    >({ text: '' });
    public readonly options = input<NgChatOptions>({});
    public readonly templates = input<NgChatTemplates>({});

    //#endregion

    //#region Outputs

    public readonly messageCreated = output<IgcChatMessage>();
    public readonly attachmentClick = output<IgcChatMessageAttachment>();
    public readonly attachmentDrag = output<void>();
    public readonly attachmentDrop = output<void>();
    public readonly typingChange = output<boolean>();
    public readonly inputFocus = output<void>();
    public readonly inputBlur = output<void>();
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
        // Templates changed - update transformed templates and viewRefs and merge with options
        effect(() => {
            const templates = this.templates();
            this._setTemplates(templates);

            this._mergeOptions(untracked(() => this.options()));
        });

        // Options changed - merge with current template state
        effect(() => {
            const options = this.options();
            this._mergeOptions(options);
        });
    }

    private _mergeOptions(options: NgChatOptions): void {
        const transformedTemplates = this._transformedTemplates();
        const merged: IgcChatOptions = {
            ...options,
            renderers: transformedTemplates
        };
        this._mergedOptions.set(merged);
    }

    private _setTemplates(newTemplates: NgChatTemplates): void {
        const templateCopies: ChatRenderers = {};
        const newTemplateKeys = Object.keys(newTemplates) as Array<keyof NgChatTemplates>;

        const oldTemplates = this._oldTemplates;
        const oldTemplateKeys = Object.keys(oldTemplates) as Array<keyof NgChatTemplates>;

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

    private _createTemplateRenderer<K extends keyof NgChatTemplates>(ref: NonNullable<NgChatTemplates[K]>) {
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
                    $implicit: { value: context.value, attachments: context.attachments },
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
