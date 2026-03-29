import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useChannels() {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 載入初始頻道列表
    fetchChannels()

    // 訂閱頻道變更（新增或刪除）
    const channelSubscription = supabase
      .channel('public:channels')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'channels' },
        (payload) => {
          if (payload.event === 'INSERT') {
            setChannels((prev) => [...prev, payload.new])
          } else if (payload.event === 'DELETE') {
            setChannels((prev) => prev.filter((ch) => ch.id !== payload.old.id))
          } else if (payload.event === 'UPDATE') {
            setChannels((prev) => prev.map((ch) => ch.id === payload.new.id ? payload.new : ch))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelSubscription)
    }
  }, [])

  async function fetchChannels() {
    setLoading(true)
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (!error) setChannels(data || [])
    setLoading(false)
  }

  async function createChannel(name, description, userId) {
    const { data, error } = await supabase
      .from('channels')
      .insert({ name, description, created_by: userId })
      .select()
      .single()

    // 注意：如果有訂閱 Realtime，這裡就不一定需要手動更新 setChannels
    // 但為了反應速度，手動更新也是可以的 (Realtime 會處理重複或漏掉的情況)
    if (!error && data) {
      setChannels(prev => {
        if (prev.some(ch => ch.id === data.id)) return prev
        return [...prev, data]
      })
    }
    return { data, error }
  }

  async function deleteChannel(channelId) {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId)

    if (!error) {
      setChannels(prev => prev.filter(ch => ch.id !== channelId))
    }
    return { error }
  }

  return { channels, loading, createChannel, deleteChannel }
}
