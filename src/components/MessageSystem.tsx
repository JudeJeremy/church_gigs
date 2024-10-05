import React, { useState, useEffect } from 'react'
import { fetchMessages, sendMessage, subscribeToMessages } from '@/lib/supabase'

interface Message {
  id: string
  booking_id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

interface MessageSystemProps {
  bookingId: string
  currentUserId: string
  otherUserId: string
}

export default function MessageSystem({ bookingId, currentUserId, otherUserId }: MessageSystemProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    fetchMessages(bookingId).then(setMessages)

    const subscription = subscribeToMessages(bookingId, (payload) => {
      setMessages((prev) => [...prev, payload.new])
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [bookingId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      await sendMessage({
        booking_id: bookingId,
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: newMessage.trim(),
      })
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="message-system">
      <div className="messages-container h-64 overflow-y-auto mb-4 p-4 border rounded">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 p-2 rounded ${
              message.sender_id === currentUserId ? 'bg-blue-100 text-right' : 'bg-gray-100'
            }`}
          >
            <p>{message.content}</p>
            <small className="text-xs text-gray-500">
              {new Date(message.created_at).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded-l"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">
          Send
        </button>
      </form>
    </div>
  )
}