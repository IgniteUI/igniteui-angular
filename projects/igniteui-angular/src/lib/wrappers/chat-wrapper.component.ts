import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    EmbeddedViewRef,
    inject,
    ViewContainerRef,
    input,
    effect,
    model
} from '@angular/core';

@Component({
  selector: 'igx-chat-wrapper',
  templateUrl: './chat-wrapper.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true
})
export class IgxChatWrapperComponent {
    protected readonly viewContainer = inject(ViewContainerRef);

    messages = input<any[]>([]);
    options = model<any>({});

    constructor() {
        effect(() => {
            const templateKeys = [
                'attachmentTemplate',
                'attachmentHeaderTemplate',
                'attachmentActionsTemplate',
                'attachmentContentTemplate',
                'messageTemplate',
                'messageActionsTemplate',
                'composingIndicatorTemplate',
                'textInputTemplate',
                'textAreaActionsTemplate',
                'textAreaAttachmentsTemplate'
            ];
            const templates = this.options().templates ?? {};
            const newTemplates: any = {};

            templateKeys.forEach(key => {
                const currentTemplate = templates[key];
                if (currentTemplate) {
                    const mapKey = `${key}Map`;
                    const lastKey = `last${key.charAt(0).toUpperCase() + key.slice(1)}`;
                    if (!this[mapKey]) this[mapKey] = new Map<string, EmbeddedViewRef<any>>();
                    if (!this[lastKey]) this[lastKey] = undefined;

                    newTemplates[key] = (item: any) => {
                        if (this[lastKey] !== currentTemplate) {
                            this[mapKey].forEach((view: EmbeddedViewRef<any>) => view.destroy());
                            this[mapKey].clear();
                            this[lastKey] = currentTemplate;
                        }

                        const cacheKey = item.id; // will not set cacheKey for arrays (attachments, etc.)
                        if (this[mapKey].has(cacheKey)) {
                            return this[mapKey].get(cacheKey)!.rootNodes;
                        }

                        const context = { $implicit: item };
                        if (currentTemplate === null) return;

                        const view = this.viewContainer.createEmbeddedView(currentTemplate, context);

                        if (cacheKey) {
                            this[mapKey].set(cacheKey, view);
                        }

                        return view.rootNodes;
                    };
                }
            });

            this.options().templates = { ...templates, ...newTemplates };
        });
    }
}
