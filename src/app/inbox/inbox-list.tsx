'use client'

import { useState } from 'react'
import { InboxItem, type Item } from './inbox-item'

export function InboxList({
  items,
  readOnly = false,
}: {
  items: Item[]
  readOnly?: boolean
}) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <InboxItem
          key={item.id}
          item={item}
          readOnly={readOnly}
          isOpen={openId === item.id}
          onToggle={() => setOpenId(openId === item.id ? null : item.id)}
        />
      ))}
    </ul>
  )
}