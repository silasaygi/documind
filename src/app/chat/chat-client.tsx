'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'

export function ChatClient() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const busy = status === 'streaming' || status === 'submitted'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || busy) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
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
                  return (
                    <p key={i} className="mb-2 text-xs text-neutral-400">
                      Dokümanlarda aranıyor...
                    </p>
                  )
                }
                return null
              })}
            </div>
          </div>
        ))}

        {busy && (
          <p className="text-sm text-neutral-400">Yanıt hazırlanıyor...</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-neutral-200 pt-4">
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