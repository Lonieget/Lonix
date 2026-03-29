import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import MessageItem from '../components/MessageItem'
import MessageInput from '../components/MessageInput'
import { useMessages } from '../hooks/useMessages'
import { useChannels } from '../hooks/useChannels'
import { useOnlineUsers } from '../hooks/useOnlineUsers'
import { format, isToday, isYesterday } from 'date-fns'
import { zhTW } from 'date-fns/locale'

function DateDivider({ date }) {
  const d = new Date(date)
  let label
  if (isToday(d)) label = '今天'
  else if (isYesterday(d)) label = '昨天'
  else label = format(d, 'yyyy年M月d日', { locale: zhTW })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 16px', userSelect: 'none'
    }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      <span style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

function groupMessages(messages) {
  const groups = []
  let lastUserId = null
  let lastDate = null

  for (const msg of messages) {
    const msgDate = new Date(msg.created_at).toDateString()
    const showDateDivider = msgDate !== lastDate
    const showHeader = msg.user_id !== lastUserId || showDateDivider

    groups.push({ msg, showHeader, showDateDivider })
    lastUserId = msg.user_id
    lastDate = msgDate
  }
  return groups
}

export default function ChatPage({ user, profile, onSignOut }) {
  const { channels, loading: loadingChannels, createChannel } = useChannels()
  const [activeChannel, setActiveChannel] = useState(null)
  const { messages, loading: loadingMessages, sendMessage, bottomRef } = useMessages(activeChannel?.id)
  const onlineUsers = useOnlineUsers(user, profile)

  // Auto-select first channel
  if (!activeChannel && channels.length > 0) {
    setActiveChannel(channels[0])
  }

  const grouped = groupMessages(messages)

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg)',
      overflow: 'hidden'
    }}>
      <Sidebar
        channels={channels}
        activeChannel={activeChannel}
        onSelectChannel={setActiveChannel}
        profile={profile}
        onSignOut={onSignOut}
        onlineUsers={onlineUsers}
        onCreateChannel={(name, desc) => createChannel(name, desc, user.id)}
      />

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {activeChannel ? (
          <>
            {/* Chat header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '8px',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '16px', color: 'var(--muted)' }}>#</span>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text)' }}>
                  {activeChannel.name}
                </div>
                {activeChannel.description && (
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {activeChannel.description}
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {loadingMessages ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--muted)', fontSize: '14px' }}>
                  載入訊息中...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ padding: '40px 16px', color: 'var(--muted)', fontSize: '14px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>#</div>
                  <strong style={{ color: 'var(--text)' }}>{activeChannel.name}</strong> 的開始
                  <p style={{ margin: '4px 0 0', fontSize: '13px' }}>這是 #{activeChannel.name} 頻道的最初始，快來發第一則訊息吧！</p>
                </div>
              ) : (
                <div style={{ paddingBottom: '8px' }}>
                  {grouped.map(({ msg, showHeader, showDateDivider }) => (
                    <div key={msg.id}>
                      {showDateDivider && <DateDivider date={msg.created_at} />}
                      <MessageItem
                        message={msg}
                        isMine={msg.user_id === user.id}
                        showHeader={showHeader}
                      />
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <MessageInput
              channelName={activeChannel.name}
              onSend={(content) => sendMessage(content, user.id)}
              disabled={loadingMessages}
            />
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--muted)' }}>
            選擇一個頻道開始聊天
          </div>
        )}
      </div>
    </div>
  )
}
