import React, { useState, useEffect } from 'react'
import { fetchNotifications, markNotificationAsRead, subscribeToNotifications } from '@/lib/supabase'

interface Notification {
  id: string
  message: string
  read: boolean
  created_at: string
}

export default function Notifications({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    fetchNotifications(userId).then(setNotifications)

    const subscription = subscribeToNotifications(userId, (payload) => {
      setNotifications((prev) => [payload.new, ...prev])
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    )
  }

  return (
    <div className="notifications">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`mb-2 p-2 rounded ${notification.read ? 'bg-gray-100' : 'bg-blue-100'}`}
            >
              <p>{notification.message}</p>
              <p className="text-sm text-gray-500">
                {new Date(notification.created_at).toLocaleString()}
              </p>
              {!notification.read && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}