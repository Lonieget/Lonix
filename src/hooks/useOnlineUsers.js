import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useOnlineUsers(user, profile) {
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    if (!user) return

    const channel = supabase.channel('online-users', {
      config: { presence: { key: user.id } }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat()
        // 去重並排序
        const uniqueUsers = Array.from(new Map(users.map(u => [u.user_id, u])).values())
        setOnlineUsers(uniqueUsers)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            username: profile?.username || user.email?.split('@')[0] || '未知使用者',
            online_at: new Date().toISOString()
          })
        }
      })

    return () => supabase.removeChannel(channel)
  }, [user, profile])

  return onlineUsers
}
