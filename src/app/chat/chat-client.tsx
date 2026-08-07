'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useEffect, useRef, useState } from 'react'
import { ActionButtons } from './action-buttons'

export function ChatClient({
  conversationId,
  initialMessages = [],
}: {
  conversationId?: string
  initialMessages?: UIMessage[]
}) {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, error } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: conversationId ? { conversationId } : undefined,
    }),
  })

  const busy = status === 'streaming' || status === 'submitted'
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || busy) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {!messages.length && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-600">
              Dokümanlarınız hakkında bir soru sorun.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === 'user' ? 'flex justify-end' : ''}
          >
            <div
              className={
                message.role === 'user'
                  ? 'max-w-[80%] rounded-2xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-sm'
                  : 'max-w-[85%] rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm'
              }
            >
              {message.parts.map((part, i) => {
                if (part.type === 'text') {
                  const clean = part.text
                    .replace(/\s*\[\d+(?:\s*,\s*\d+)*\]/g, '')
                    .replace(/ +([.,;:!?])/g, '$1')

                  return (
                    <p key={i} className="whitespace-pre-wrap">
                      {clean}
                    </p>
                  )
                }

                {message.role === 'assistant' &&
                  status !== 'streaming' &&
                  message.parts.some((p) => p.type === 'text') && (
                    <ActionButtons
                      conversationId={conversationId}
                      content={message.parts
                        .filter((p) => p.type === 'text')
                        .map((p) => (p as { text: string }).text)
                        .join('\n')}
                    />
                  )}

                if (part.type === 'tool-searchDocuments') {
                  if (part.state !== 'output-available') {
                    return (
                      <p key={i} className="mb-2 text-xs text-slate-400">
                        Dokümanlarda aranıyor...
                      </p>
                    )
                  }
                  return null
                }

                return null
              })}
            </div>
          </div>
        ))}

        {busy && <p className="text-sm text-slate-400">Yanıt hazırlanıyor...</p>}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
            Yanıt alınamadı. Model kotası dolmuş olabilir, birkaç dakika sonra tekrar
            deneyin.
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-stone-200 pt-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Dokümanlarınız hakkında soru sorun..."
          disabled={busy}
          className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
        >
          Gönder
        </button>
      </form>
    </div>
  )
}