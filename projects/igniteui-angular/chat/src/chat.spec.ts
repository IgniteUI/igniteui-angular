import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IgxChatComponent, IgxChatMessageContextDirective, type IgxChatTemplates } from './chat.component'
import { Component, signal, TemplateRef, ViewRef, viewChild } from '@angular/core';
import type { IgcChatComponent, IgcChatMessage, IgcChatMessageAttachment, IgcTextareaComponent } from 'igniteui-webcomponents';

describe('Chat wrapper', () => {

    let chatComponent: IgxChatComponent;
    let chatElement: IgcChatComponent;
    let fixture: ComponentFixture<IgxChatComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [IgxChatComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgxChatComponent);
        chatComponent = fixture.componentInstance;
        chatElement = getChatElement(fixture);
        fixture.detectChanges();
    })

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


        const messageElement = getChatMessages(chatElement)[0];
        expect(messageElement).toBeDefined();
        expect(getChatMessageDOM(messageElement).textContent.trim()).toEqual(chatComponent.messages()[0].text);
    });

    it('correct bindings for draft message', async () => {
        fixture.componentRef.setInput('draftMessage', { text: 'Hello world' });

        fixture.detectChanges();
        await fixture.whenStable();

        const textarea = getChatInput(chatElement);
        expect(textarea.value).toEqual(chatComponent.draftMessage().text);
    });
});

describe('Chat templates', () => {
    let fixture: ComponentFixture<ChatTemplatesBed>;
    let chatElement: IgcChatComponent;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [IgxChatComponent, IgxChatMessageContextDirective, ChatTemplatesBed]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatTemplatesBed);
        fixture.detectChanges();
        chatElement = getChatElement(fixture);
    });

    it('has correct initially bound template', async () => {
        await fixture.whenStable();

        // NOTE: This is invoked since in the test bed there is no app ref so fresh embedded view
        // has no change detection ran on it. In an application scenario this is not the case.
        // This is so we don't explicitly invoke `viewRef.detectChanges()` inside the returned closure
        // from the wrapper's `_createTemplateRenderer` call.
        fixture.detectChanges();
        expect(getChatMessageDOM(getChatMessages(chatElement)[0]).textContent.trim())
            .toEqual(`Your message: ${fixture.componentInstance.messages()[0].text}`);
    });
});

describe('Chat dynamic templates binding', () => {
    let fixture: ComponentFixture<ChatDynamicTemplatesBed>;
    let chatElement: IgcChatComponent;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [IgxChatComponent, IgxChatMessageContextDirective, ChatDynamicTemplatesBed]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatDynamicTemplatesBed);
        fixture.detectChanges();
        chatElement = getChatElement(fixture);
    });

    it('supports late binding', async () => {
        fixture.componentInstance.bindTemplates();
        fixture.detectChanges();

        await fixture.whenStable();
        fixture.detectChanges();

        expect(getChatMessageDOM(getChatMessages(chatElement)[0]).textContent.trim())
            .toEqual(`Your message: ${fixture.componentInstance.messages()[0].text}`);
    });

});


describe('Chat _createTemplateRenderer context dispatch', () => {
    let fixture: ComponentFixture<IgxChatComponent>;
    let component: IgxChatComponent;
    let mockViewRef: { destroy: jasmine.Spy; rootNodes: Node[] };
    let mockTemplateRef: TemplateRef<any>;
    let createEmbeddedViewSpy: jasmine.Spy;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [IgxChatComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgxChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockViewRef = { destroy: jasmine.createSpy('destroy'), rootNodes: ['mock-node'] as any };
        mockTemplateRef = {} as TemplateRef<any>;

        createEmbeddedViewSpy = spyOn((component as any)._view, 'createEmbeddedView')
            .and.returnValue(mockViewRef as unknown as ViewRef);
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
        expect(viewSet.has(mockViewRef as unknown as ViewRef)).toBeTrue();
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
    let mockViewRef: { destroy: jasmine.Spy; rootNodes: Node[] };
    let mockTemplateRefA: TemplateRef<any>;
    let mockTemplateRefB: TemplateRef<any>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [IgxChatComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgxChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockViewRef = { destroy: jasmine.createSpy('destroy'), rootNodes: [] as any };
        mockTemplateRefA = {} as TemplateRef<any>;
        mockTemplateRefB = {} as TemplateRef<any>;

        spyOn((component as any)._view, 'createEmbeddedView')
            .and.returnValue(mockViewRef as unknown as ViewRef);
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

        expect((component as any)._templateViewRefs.has(mockTemplateRefA)).toBeFalse();
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
