import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useMessages(channelId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!channelId) return
    setLoading(true)
    setMessages([])

    // 載入歷史訊息
    supabase
      .from('messages')
      .select(`
        *,
        profiles:user_id (id, username, avatar_url)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages(data || [])
        setLoading(false)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })

    // 訂閱即時新訊息
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          // 取得發送者的 profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.user_id)
            .single()

          const newMsg = { ...payload.new, profiles: profile }
          setMessages(prev => [...prev, newMsg])
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId])

  async function sendMessage(content, userId) {
    if (!content.trim() || !channelId) return

    const { error } = await supabase
      .from('messages')
      .insert({ channel_id: channelId, user_id: userId, content: content.trim() })

    if (error) console.error('送出訊息失敗:', error)
  }

  return { messages, loading, sendMessage, bottomRef }
}
