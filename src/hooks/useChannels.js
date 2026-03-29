import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useChannels() {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setChannels(data || [])
        setLoading(false)
      })
  }, [])

  async function createChannel(name, description, userId) {
    const { data, error } = await supabase
      .from('channels')
      .insert({ name, description, created_by: userId })
      .select()
      .single()

    if (!error && data) setChannels(prev => [...prev, data])
    return { data, error }
  }

  return { channels, loading, createChannel }
}
