import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useMessages(channelId) {
  // 使用物件來儲存每個頻道的訊息，實現獨立歷史紀錄與快取
  const [history, setHistory] = useState({})
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  // 取得目前頻道的訊息列表
  const messages = history[channelId] || []

  useEffect(() => {
    if (!channelId) return

    let isMounted = true

    // 優化：如果快取中已有該頻道的訊息，且並非初次載入，則跳過 API 抓取
    // 依賴 Realtime 處理之後的新訊息，既省流量又省資料庫開銷
    if (history[channelId] && history[channelId].length > 0) {
      setLoading(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } else {
      setLoading(true)
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
        .then(({ data, error }) => {
          if (!isMounted) return
          if (error) {
            console.error('載入訊息失敗:', error)
          } else {
            setHistory(prev => ({
              ...prev,
              [channelId]: data || []
            }))
          }
          setLoading(false)
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        })
    }

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
          if (!isMounted) return

          // 取得發送者的 profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.user_id)
            .single()

          const newMsg = { ...payload.new, profiles: profile }
          
          setHistory(prev => {
            const currentMsgs = prev[channelId] || []
            // 避免重複加入
            if (currentMsgs.some(m => m.id === newMsg.id)) return prev
            return {
              ...prev,
              [channelId]: [...currentMsgs, newMsg]
            }
          })

          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [channelId])

  async function sendMessage(content, userId, fileUrl = null, fileType = null) {
    if (!content?.trim() && !fileUrl) return
    if (!channelId) return

    const { error } = await supabase
      .from('messages')
      .insert({
        channel_id: channelId,
        user_id: userId,
        content: content?.trim() || null,
        file_url: fileUrl,
        file_type: fileType
      })

    if (error) console.error('送出訊息失敗:', error)
  }

  return { messages, loading, sendMessage, bottomRef }
}
