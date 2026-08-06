'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useEffect, useRef, useState } from 'react'

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
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center">
            <p className="text-sm text-neutral-600">
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
                  ? 'max-w-[80%] rounded-xl bg-neutral-900 px-4 py-2.5 text-sm text-white'
                  : 'max-w-[85%] rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm'
              }
            >
              {message.parts.map((part, i) => {
                if (part.type === 'text') {
                  return (
                    <p key={i} className="whitespace-pre-wrap">
                      {part.text}
                    </p>
                  )
                }

                if (part.type === 'tool-searchDocuments') {
                  if (part.state !== 'output-available') {
                    return (
                      <p key={i} className="mb-2 text-xs text-neutral-400">
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

        {busy && <p className="text-sm text-neutral-400">Yanıt hazırlanıyor...</p>}

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            Yanıt alınamadı. Model kotası dolmuş olabilir, birkaç dakika sonra tekrar
            deneyin.
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-neutral-200 pt-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Dokümanlarınız hakkında soru sorun..."
          disabled={busy}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-md bg-neutral-900 px-5 py-2 text-sm text-white disabled:opacity-50"
        >
          Gönder
        </button>
      </form>
    </div>
  )
}