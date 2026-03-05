import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IgxChatComponent, IgxChatMessageContextDirective, type IgxChatTemplates } from './chat.component';
import { Component, signal, TemplateRef, viewChild } from '@angular/core';
import type { IgcChatComponent, IgcChatMessage, IgcTextareaComponent } from 'igniteui-webcomponents';
import { describe, it, expect, beforeEach } from 'vitest';

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
