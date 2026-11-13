import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    IgxChatAttachmentContextDirective,
    IgxChatComponent,
    IgxChatInputContextDirective,
    IgxChatMessageContextDirective,
    type IgxChatOptions,
    type IgxChatTemplates
} from './chat.component';
import { Component, signal, TemplateRef, ViewRef, viewChild, type OutputEmitterRef } from '@angular/core';
import type {
    IgcChatComponent,
    IgcChatMessage,
    IgcChatMessageAttachment,
    IgcChatMessageReaction,
    IgcTextareaComponent
} from 'igniteui-webcomponents';
import { describe, it, expect, beforeEach, vi, type Mock, type MockInstance } from 'vitest';

describe('Chat wrapper', () => {

    let chatComponent: IgxChatComponent;
    let chatElement: IgcChatComponent;
    let fixture: ComponentFixture<IgxChatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IgxChatComponent]
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(IgxChatComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        chatComponent = fixture.componentInstance;
        chatElement = getChatElement(fixture);
    });

    it('is created', () => {
        expect(chatComponent).toBeDefined();
    });

    it('has correct initial empty state', () => {
        const draft = chatComponent.draftMessage();

        expect(chatComponent.messages().length).toEqual(0);
        expect(draft.text).toEqual('');
        expect(draft.attachments).toBeUndefined();
    });

    it('correct bindings for messages', async () => {
        fixture.componentRef.setInput('messages', [{ id: '1', sender: 'user', text: 'Hello' }]);
        fixture.detectChanges();
        await fixture.whenStable();


        // The web component renders its messages asynchronously
        await vi.waitFor(() => {
            const messageElement = getChatMessages(chatElement)[0];
            expect(messageElement).toBeDefined();
            expect(getChatMessageDOM(messageElement).textContent.trim()).toEqual(chatComponent.messages()[0].text);
        });
    });

    it('correct bindings for draft message', async () => {
        fixture.componentRef.setInput('draftMessage', { text: 'Hello world' });
        fixture.detectChanges();
        await fixture.whenStable();

        const textarea = getChatInput(chatElement);
        expect(textarea.value).toEqual(chatComponent.draftMessage().text);
    });

    it('passes options to the web component', async () => {
        const options: IgxChatOptions = { headerText: 'Support', inputPlaceholder: 'Ask anything' };
        fixture.componentRef.setInput('options', options);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(chatElement.options).toEqual({ ...options, renderers: {} });
        await vi.waitFor(() => {
            expect(getChatHeaderTitle(chatElement).textContent.trim()).toEqual('Support');
            expect(getChatInput(chatElement).placeholder).toEqual('Ask anything');
        });
    });

    it('updates the web component when options change', async () => {
        fixture.componentRef.setInput('options', { headerText: 'First' });
        fixture.detectChanges();
        await fixture.whenStable();

        fixture.componentRef.setInput('options', { headerText: 'Second' });
        fixture.detectChanges();
        await fixture.whenStable();

        await vi.waitFor(() => expect(getChatHeaderTitle(chatElement).textContent.trim()).toEqual('Second'));
    });
});

describe('Chat outputs', () => {
    type ChatOutputName = {
        [K in keyof IgxChatComponent]: IgxChatComponent[K] extends OutputEmitterRef<any> ? K : never
    }[keyof IgxChatComponent];

    const message: IgcChatMessage = { id: '1', sender: 'user', text: 'Hello' };
    const attachment: IgcChatMessageAttachment = { id: 'a1', name: 'file.pdf' };
    const reaction: IgcChatMessageReaction = { message, reaction: 'like' };

    const cases: { event: string; output: ChatOutputName; detail: unknown; expected: unknown }[] = [
        { event: 'igcMessageCreated', output: 'messageCreated', detail: message, expected: message },
        { event: 'igcMessageReact', output: 'messageReact', detail: reaction, expected: reaction },
        { event: 'igcAttachmentClick', output: 'attachmentClick', detail: attachment, expected: attachment },
        { event: 'igcTypingChange', output: 'typingChange', detail: true, expected: true },
        { event: 'igcInputChange', output: 'inputChange', detail: 'draft text', expected: 'draft text' },
        // Void outputs must not leak the event detail
        { event: 'igcAttachmentDrag', output: 'attachmentDrag', detail: 'ignored', expected: undefined },
        { event: 'igcAttachmentDrop', output: 'attachmentDrop', detail: 'ignored', expected: undefined },
        { event: 'igcInputFocus', output: 'inputFocus', detail: 'ignored', expected: undefined },
        { event: 'igcInputBlur', output: 'inputBlur', detail: 'ignored', expected: undefined },
    ];

    let fixture: ComponentFixture<IgxChatComponent>;
    let chatElement: IgcChatComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IgxChatComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(IgxChatComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        chatElement = getChatElement(fixture);
    });

    it.each(cases)('emits $output when the web component fires $event', ({ event, output, detail, expected }) => {
        const spy = vi.fn();
        (fixture.componentInstance[output] as OutputEmitterRef<unknown>).subscribe(spy);

        chatElement.dispatchEvent(new CustomEvent(event, { detail }));

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(expected);
    });
});

describe('Chat rendering with every template context', () => {
    let fixture: ComponentFixture<ChatAllContextsBed>;
    let chatElement: IgcChatComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ChatAllContextsBed]
        }).compileComponents();

        fixture = TestBed.createComponent(ChatAllContextsBed);
        // The web component creates the template views during its own async render, after
        // any manual change detection pass, so let the application tick check them as in an app
        fixture.autoDetectChanges();
        await fixture.whenStable();

        chatElement = getChatElement(fixture);
    });

    it('renders the attachment template with the attachment as context', async () => {
        await vi.waitFor(() => {
            const attachments = getMessageAttachments(getChatMessages(chatElement)[0]);
            expect(attachments.querySelector('.custom-attachment').textContent.trim()).toEqual('report.pdf');
        });
    });

    it('renders the input template with the input value and attachments as context', async () => {
        await vi.waitFor(() =>
            expect(getChatInputRoot(chatElement).querySelector('.custom-input').textContent.trim()).toEqual('Draft text|1'));
    });

    it('renders the send button template with the chat instance as context', async () => {
        await vi.waitFor(() =>
            expect(getChatInputRoot(chatElement).querySelector('.custom-send').textContent.trim()).toEqual('IGC-CHAT'));
    });

    it('emits attachmentClick when the user clicks an attachment header', async () => {
        const header = await vi.waitFor(() => {
            const element = getMessageAttachments(getChatMessages(chatElement)[0]).querySelector<HTMLElement>('[role="button"]');
            expect(element).toBeTruthy();
            return element;
        });

        header.click();

        expect(fixture.componentInstance.clickedAttachment).toEqual(fixture.componentInstance.messages[0].attachments[0]);
    });

    it('keeps the template renderers when the options change', async () => {
        fixture.componentInstance.options.set({ headerText: 'Updated' });
        await fixture.whenStable();

        const renderers = chatElement.options?.renderers ?? {};
        expect(Object.keys(renderers).sort()).toEqual(['attachmentHeader', 'input', 'sendButton']);
        await vi.waitFor(() => {
            expect(getChatHeaderTitle(chatElement).textContent.trim()).toEqual('Updated');
            expect(getChatInputRoot(chatElement).querySelector('.custom-send')).toBeTruthy();
        });
    });

    it('destroys the rendered template views when the host is destroyed', async () => {
        await vi.waitFor(() => expect(getChatInputRoot(chatElement).querySelector('.custom-send')).toBeTruthy());

        const views = getTemplateViews(fixture);
        expect(views.length).toBeGreaterThan(0);

        fixture.destroy();

        expect(views.every(view => view.destroyed)).toBe(true);
    });

    it('renders a replacement template and destroys the views of the old one', async () => {
        await vi.waitFor(() => expect(getChatInputRoot(chatElement).querySelector('.custom-send')).toBeTruthy());
        const oldViews = getTemplateViews(fixture, fixture.componentInstance.sendButtonTemplate());
        expect(oldViews.length).toBeGreaterThan(0);

        fixture.componentInstance.useAltSendButton.set(true);
        await fixture.whenStable();

        expect(oldViews.every(view => view.destroyed)).toBe(true);
        await vi.waitFor(() => {
            const inputRoot = getChatInputRoot(chatElement);
            expect(inputRoot.querySelector('.alt-send').textContent.trim()).toEqual('Send');
            expect(inputRoot.querySelector('.custom-send')).toBeNull();
        });
    });
});

describe('Chat content projection', () => {
    it('projects content into the web component slots', async () => {
        await TestBed.configureTestingModule({
            imports: [ChatProjectionBed]
        }).compileComponents();

        const fixture = TestBed.createComponent(ChatProjectionBed);
        fixture.detectChanges();
        await fixture.whenStable();

        const chatElement = getChatElement(fixture);
        const projected = chatElement.querySelector('.custom-title');
        expect(projected).toBeTruthy();
        await vi.waitFor(() => expect(getChatHeaderTitle(chatElement).assignedElements()).toContain(projected));
    });
});

describe('Chat template context directives', () => {
    it('only narrow types and always accept the context at runtime', () => {
        expect(IgxChatMessageContextDirective.ngTemplateContextGuard(new IgxChatMessageContextDirective(), {})).toBe(true);
        expect(IgxChatAttachmentContextDirective.ngTemplateContextGuard(new IgxChatAttachmentContextDirective(), {})).toBe(true);
        expect(IgxChatInputContextDirective.ngTemplateContextGuard(new IgxChatInputContextDirective(), {})).toBe(true);
    });
});

describe('Chat templates', () => {
    let fixture: ComponentFixture<ChatTemplatesBed>;
    let chatElement: IgcChatComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IgxChatComponent, IgxChatMessageContextDirective, ChatTemplatesBed]
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(ChatTemplatesBed);
        fixture.detectChanges();
        await fixture.whenStable();

        chatElement = getChatElement(fixture);
    });

    it('has correct initially bound template', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        // The web component renders its messages asynchronously
        await vi.waitFor(() => expect(getChatMessageDOM(getChatMessages(chatElement)[0]).textContent.trim())
            .toEqual(`Your message: ${fixture.componentInstance.messages()[0].text}`));
    });
});

describe('Chat dynamic templates binding', () => {
    let fixture: ComponentFixture<ChatDynamicTemplatesBed>;
    let chatElement: IgcChatComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IgxChatComponent, IgxChatMessageContextDirective, ChatDynamicTemplatesBed]
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(ChatDynamicTemplatesBed);
        fixture.detectChanges();
        await fixture.whenStable();

        chatElement = getChatElement(fixture);
    });

    it('supports late binding', async () => {
        fixture.componentInstance.bindTemplates();
        fixture.detectChanges();
        await fixture.whenStable();
        // The templates effect updates the chat options, which needs another change detection pass
        fixture.detectChanges();
        await fixture.whenStable();

        // The web component renders its messages asynchronously
        await vi.waitFor(() => expect(getChatMessageDOM(getChatMessages(chatElement)[0]).textContent.trim())
            .toEqual(`Your message: ${fixture.componentInstance.messages()[0].text}`));
    });

});


describe('Chat _createTemplateRenderer context dispatch', () => {
    let fixture: ComponentFixture<IgxChatComponent>;
    let component: IgxChatComponent;
    let mockViewRef: { destroy: Mock; rootNodes: Node[] };
    let mockTemplateRef: TemplateRef<any>;
    let createEmbeddedViewSpy: MockInstance;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IgxChatComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IgxChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        const mockRootNode = document.createElement('div');
        mockRootNode.textContent = 'mock-node';
        mockViewRef = { destroy: vi.fn(), rootNodes: [mockRootNode] };
        mockTemplateRef = {} as TemplateRef<any>;

        createEmbeddedViewSpy = vi.spyOn((component as any)._view, 'createEmbeddedView')
            .mockReturnValue(mockViewRef as unknown as ViewRef);
    });

    it('maps attachment render context (message + attachment) to attachment $implicit', () => {
        const attachment: IgcChatMessageAttachment = { id: 'a1', name: 'file.pdf' };
        const message: IgcChatMessage = { id: 'm1', sender: 'user', text: 'Hello' };

        const renderer = (component as any)._createTemplateRenderer(mockTemplateRef);
        renderer({ message, attachment, instance: {} });

        expect(createEmbeddedViewSpy).toHaveBeenCalledWith(
            mockTemplateRef,
            { $implicit: attachment }
        );
    });

    it('maps message render context (message only) to message $implicit', () => {
        const message: IgcChatMessage = { id: 'm1', sender: 'user', text: 'Hello' };

        const renderer = (component as any)._createTemplateRenderer(mockTemplateRef);
        renderer({ message, instance: {} });

        expect(createEmbeddedViewSpy).toHaveBeenCalledWith(
            mockTemplateRef,
            { $implicit: message }
        );
    });

    it('maps input render context (value) to value $implicit and attachments', () => {
        const value = 'typed text';
        const attachments: IgcChatMessageAttachment[] = [{ id: 'a1', name: 'image.png' }];

        const renderer = (component as any)._createTemplateRenderer(mockTemplateRef);
        renderer({ value, attachments, instance: {} });

        expect(createEmbeddedViewSpy).toHaveBeenCalledWith(
            mockTemplateRef,
            { $implicit: value, attachments }
        );
    });

    it('maps general render context (instance only) to instance $implicit', () => {
        const instance = {} as any;

        const renderer = (component as any)._createTemplateRenderer(mockTemplateRef);
        renderer({ instance });

        expect(createEmbeddedViewSpy).toHaveBeenCalledWith(
            mockTemplateRef,
            { $implicit: { instance } }
        );
    });

    it('returns root nodes from the created embedded view', () => {
        const message: IgcChatMessage = { id: 'm1', sender: 'user', text: 'Hello' };

        const renderer = (component as any)._createTemplateRenderer(mockTemplateRef);
        const result = renderer({ message, instance: {} });

        expect(result).toBe(mockViewRef.rootNodes);
    });

    it('tracks created view refs in the internal refs map', () => {
        const message: IgcChatMessage = { id: 'm1', sender: 'user', text: 'Hello' };

        const renderer = (component as any)._createTemplateRenderer(mockTemplateRef);
        renderer({ message, instance: {} });

        const viewSet: Set<ViewRef> = (component as any)._templateViewRefs.get(mockTemplateRef);
        expect(viewSet).toBeDefined();
        expect(viewSet.has(mockViewRef as unknown as ViewRef)).toBe(true);
    });

    it('reuses the existing view set when the same template ref is passed again', () => {
        // First call creates a new Set and registers it in _templateViewRefs
        (component as any)._createTemplateRenderer(mockTemplateRef);
        const initialSet: Set<ViewRef> = (component as any)._templateViewRefs.get(mockTemplateRef);

        // Second call with the same ref must reuse the existing Set, not create a new one
        (component as any)._createTemplateRenderer(mockTemplateRef);
        const reusedSet: Set<ViewRef> = (component as any)._templateViewRefs.get(mockTemplateRef);

        expect(reusedSet).toBe(initialSet);
    });
});

describe('Chat view lifecycle (_setTemplates)', () => {
    let fixture: ComponentFixture<IgxChatComponent>;
    let component: IgxChatComponent;
    let mockViewRef: { destroy: Mock; rootNodes: Node[] };
    let mockTemplateRefA: TemplateRef<any>;
    let mockTemplateRefB: TemplateRef<any>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IgxChatComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IgxChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockViewRef = { destroy: vi.fn(), rootNodes: [] as any };
        mockTemplateRefA = {} as TemplateRef<any>;
        mockTemplateRefB = {} as TemplateRef<any>;

        vi.spyOn((component as any)._view, 'createEmbeddedView')
            .mockReturnValue(mockViewRef as unknown as ViewRef);
    });

    it('destroys old view refs when a template ref is replaced', () => {
        (component as any)._setTemplates({ messageContent: mockTemplateRefA });

        const renderer = (component as any)._transformedTemplates().messageContent;
        renderer({ message: { id: '1', sender: 'user', text: 'Hi' }, instance: {} });

        (component as any)._setTemplates({ messageContent: mockTemplateRefB });

        expect(mockViewRef.destroy).toHaveBeenCalledTimes(1);
    });

    it('does not destroy view refs when the same template ref is reused', () => {
        (component as any)._setTemplates({ messageContent: mockTemplateRefA });

        const renderer = (component as any)._transformedTemplates().messageContent;
        renderer({ message: { id: '1', sender: 'user', text: 'Hi' }, instance: {} });

        (component as any)._setTemplates({ messageContent: mockTemplateRefA });

        expect(mockViewRef.destroy).not.toHaveBeenCalled();
    });

    it('destroys view refs when a template key is removed from the new templates', () => {
        (component as any)._setTemplates({ messageContent: mockTemplateRefA });

        const renderer = (component as any)._transformedTemplates().messageContent;
        renderer({ message: { id: '1', sender: 'user', text: 'Hi' }, instance: {} });

        (component as any)._setTemplates({});

        expect(mockViewRef.destroy).toHaveBeenCalledTimes(1);
    });

    it('removes replaced template ref from the internal view refs map', () => {
        (component as any)._setTemplates({ messageContent: mockTemplateRefA });

        const renderer = (component as any)._transformedTemplates().messageContent;
        renderer({ message: { id: '1', sender: 'user', text: 'Hi' }, instance: {} });

        (component as any)._setTemplates({ messageContent: mockTemplateRefB });

        expect((component as any)._templateViewRefs.has(mockTemplateRefA)).toBe(false);
    });

    it('does not create renderers for falsy template ref values', () => {
        (component as any)._setTemplates({ messageContent: undefined });

        const transformedTemplates = (component as any)._transformedTemplates();
        expect(transformedTemplates.messageContent).toBeUndefined();
    });

    it('sets transformed templates to empty object when given empty templates', () => {
        (component as any)._setTemplates({});

        expect((component as any)._transformedTemplates()).toEqual({});
    });

    it('destroys all tracked view refs on ngOnDestroy', () => {
        (component as any)._setTemplates({ messageContent: mockTemplateRefA });

        const renderer = (component as any)._transformedTemplates().messageContent;
        renderer({ message: { id: '1', sender: 'user', text: 'Hi' }, instance: {} });

        component.ngOnDestroy();

        expect(mockViewRef.destroy).toHaveBeenCalled();
    });

    it('clears the internal view refs map on ngOnDestroy', () => {
        (component as any)._setTemplates({ messageContent: mockTemplateRefA });

        component.ngOnDestroy();

        expect((component as any)._templateViewRefs.size).toBe(0);
    });
});

@Component({
    template: `
        <igx-chat [messages]="messages()" [templates]="{messageContent: messageTemplate()}"/>
        <ng-template igxChatMessageContext #message let-message>
            <h3>Your message: {{ message.text }}</h3>
        </ng-template>
    `,
    imports: [IgxChatComponent, IgxChatMessageContextDirective]
})
class ChatTemplatesBed {
    public messages = signal<IgcChatMessage[]>([{
            id: '1',
            sender: 'user',
            text: 'Hello world'
        }]);
    public messageTemplate = viewChild.required<TemplateRef<any>>('message');
}

@Component({
    template: `
        <igx-chat [messages]="messages()" [templates]="templates()" />
        <ng-template igxChatMessageContext #message let-message>
            <h3>Your message: {{ message.text }}</h3>
        </ng-template>
    `,
    imports: [IgxChatComponent, IgxChatMessageContextDirective]
})
class ChatDynamicTemplatesBed {
    public templates = signal<IgxChatTemplates | null>(null);
    public messages = signal<IgcChatMessage[]>([{
            id: '1',
            sender: 'user',
            text: 'Hello world'
        }]);
    public messageTemplate = viewChild.required<TemplateRef<any>>('message');

    public bindTemplates(): void {
        this.templates.set({
            messageContent: this.messageTemplate()
        });
    }
}

@Component({
    template: `
        <igx-chat
            [messages]="messages"
            [draftMessage]="draftMessage"
            [options]="options()"
            [templates]="{
                attachmentHeader: attachmentTemplate(),
                input: inputTemplate(),
                sendButton: useAltSendButton() ? altSendButtonTemplate() : sendButtonTemplate()
            }"
            (attachmentClick)="clickedAttachment = $event"
        />
        <ng-template igxChatAttachmentContext #attachment let-attachment>
            <span class="custom-attachment">{{ attachment.name }}</span>
        </ng-template>
        <ng-template igxChatInputContext #input let-value let-attachments="attachments">
            <span class="custom-input">{{ value }}|{{ attachments.length }}</span>
        </ng-template>
        <ng-template #sendButton let-context>
            <span class="custom-send">{{ context.instance.tagName }}</span>
        </ng-template>
        <ng-template #altSendButton>
            <span class="alt-send">Send</span>
        </ng-template>
    `,
    imports: [IgxChatComponent, IgxChatAttachmentContextDirective, IgxChatInputContextDirective]
})
class ChatAllContextsBed {
    public messages: IgcChatMessage[] = [{
        id: '1',
        sender: 'user',
        text: 'See the attached report',
        attachments: [{ id: 'a1', name: 'report.pdf' }]
    }];
    public draftMessage = { text: 'Draft text', attachments: [{ id: 'd1', name: 'draft.png' }] };
    public options = signal<IgxChatOptions>({});
    public clickedAttachment?: IgcChatMessageAttachment;
    public attachmentTemplate = viewChild.required<TemplateRef<any>>('attachment');
    public inputTemplate = viewChild.required<TemplateRef<any>>('input');
    public sendButtonTemplate = viewChild.required<TemplateRef<any>>('sendButton');
    public altSendButtonTemplate = viewChild.required<TemplateRef<any>>('altSendButton');
    public useAltSendButton = signal(false);
}

@Component({
    template: `
        <igx-chat>
            <span slot="title" class="custom-title">Projected title</span>
        </igx-chat>
    `,
    imports: [IgxChatComponent]
})
class ChatProjectionBed { }

function getChatElement<T>(fixture: ComponentFixture<T>): IgcChatComponent {
    const nativeElement = fixture.nativeElement as HTMLElement;
    return nativeElement.querySelector('igc-chat');
}

function getChatInput(chat: IgcChatComponent): IgcTextareaComponent {
    return chat.renderRoot.querySelector('igc-chat-input').shadowRoot.querySelector('igc-textarea');
}

function getChatMessages(chat: IgcChatComponent): HTMLElement[] {
    return Array.from(chat.renderRoot.querySelectorAll('igc-chat-message'));
}

function getChatMessageDOM(message: HTMLElement) {
    return message.shadowRoot;
}

function getChatHeaderTitle(chat: IgcChatComponent): HTMLSlotElement {
    return chat.renderRoot.querySelector('slot[name="title"]');
}

function getChatInputRoot(chat: IgcChatComponent): ShadowRoot {
    return chat.renderRoot.querySelector('igc-chat-input').shadowRoot;
}

/** Collects the embedded views the wrapper created, optionally only those of one template. */
function getTemplateViews(fixture: ComponentFixture<unknown>, template?: TemplateRef<unknown>): ViewRef[] {
    const chat = fixture.debugElement.query(debugElement => debugElement.name === 'igx-chat').componentInstance as IgxChatComponent;
    const viewRefs = (chat as any)._templateViewRefs as Map<TemplateRef<unknown>, Set<ViewRef>>;
    const sets = template ? [viewRefs.get(template) ?? new Set<ViewRef>()] : Array.from(viewRefs.values());
    return sets.flatMap(set => Array.from(set));
}

function getMessageAttachments(message: HTMLElement): ShadowRoot {
    return getChatMessageDOM(message).querySelector('igc-message-attachments').shadowRoot;
}
