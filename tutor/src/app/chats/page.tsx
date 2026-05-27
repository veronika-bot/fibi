'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, Search } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { MOCK_CHATS } from '@/lib/mock'

const DEMO_MESSAGES = [
  { id:'1', from:'АС', text:'Здравствуйте! Можете объяснить задание 3?', time:'10:30', mine:false },
  { id:'2', from:'me', text:'Конечно! Давай посмотрим...', time:'10:32', mine:true },
  { id:'3', from:'АС', text:'Спасибо, поняла!', time:'10:41', mine:false },
]

export default function ChatsPage() {
  const [active, setActive] = useState(MOCK_CHATS[0].id)
  const [msg, setMsg] = useState('')
  const activeChat = MOCK_CHATS.find(c => c.id === active)!

  return (
    <div>
      <h1 className="text-3xl font-black text-gray-900 mb-6">Чаты</h1>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden" style={{ height: 600 }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-72 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input placeholder="Поиск..." className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-yale"/>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {MOCK_CHATS.map(c => (
                <motion.div key={c.id} whileHover={{ backgroundColor: '#f9fafb' }} onClick={() => setActive(c.id)}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-50 transition-colors ${active===c.id ? 'bg-blue-50' : ''}`}>
                  <Avatar initials={c.avatar} size="md" online={c.online}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.time}</p>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{c.lastMsg}</p>
                  </div>
                  {c.unread > 0 && <span className="bg-yale text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">{c.unread}</span>}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <Avatar initials={activeChat.avatar} size="sm" online={activeChat.online}/>
              <div>
                <p className="font-semibold text-gray-900">{activeChat.name}</p>
                <p className="text-xs text-gray-400">{activeChat.online ? 'онлайн' : 'был(а) недавно'}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {DEMO_MESSAGES.map(m => (
                <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${m.mine ? 'bg-yale text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                    <p>{m.text}</p>
                    <p className={`text-xs mt-1 ${m.mine ? 'text-white/60' : 'text-gray-400'}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-gray-600 p-2"><Paperclip size={18}/></button>
                <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Написать сообщение..."
                  onKeyDown={e => e.key==='Enter' && setMsg('')}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yale"/>
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => setMsg('')}
                  className="w-10 h-10 bg-yale rounded-xl flex items-center justify-center text-white hover:bg-yale-light transition-colors">
                  <Send size={16}/>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
