'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { Chat, Message } from '@/lib/types';
import { useChatStore } from '@/store/chat-store';

interface DashboardShellProps {
  initialChats: Chat[];
  initialMessages: Message[];
  userId: string;
}

export function DashboardShell({ initialChats, initialMessages, userId }: DashboardShellProps) {
  const params = useParams<{ id?: string }>();
  const chatId = params?.id;
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { chats, messages, setChats, setMessages, addMessage } = useChatStore();
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setChats(initialChats);
    setMessages(initialMessages);
  }, [initialChats, initialMessages, setChats, setMessages]);

  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => addMessage(payload.new as Message),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, supabase, addMessage]);

  const sendMessage = async () => {
    if (!chatId || !draft.trim()) return;
    const { error } = await supabase.from('messages').insert({ chat_id: chatId, sender_id: userId, content: draft.trim() });
    if (!error) {
      setDraft('');
    }
  };

  const startCall = async () => {
    if (!chatId) return;

    const selected = chats.find((chat) => chat.id === chatId);
    const roomName = `voidline-${chatId}-${Date.now()}`;

    const { data, error } = await supabase
      .from('calls')
      .insert({
        chat_id: chatId,
        created_by: userId,
        type: selected?.type ?? 'direct',
        provider: 'livekit',
        room_name: roomName,
        status: 'ringing',
      })
      .select('id')
      .single();

    if (!error && data?.id) {
      router.push(`/dashboard/call/${data.id}`);
    }
  };

  return (
    <div className="grid h-screen grid-cols-[280px_1fr]">
      <aside className="border-r border-white/15 bg-void-secondary p-3">
        <p className="px-2 text-xs uppercase tracking-[0.2em] text-void-muted">Chats</p>
        <div className="mt-3 space-y-1">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/dashboard/chat/${chat.id}`}
              className="block rounded-md border border-transparent px-3 py-2 text-sm hover:border-white/20 hover:bg-void-hover"
            >
              {chat.title ?? 'Direct Chat'}
            </Link>
          ))}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        <header className="flex items-center justify-between border-b border-white/15 bg-void-panel px-4 py-3">
          <h2 className="text-sm text-void-muted">{chatId ? chats.find((chat) => chat.id === chatId)?.title ?? 'Direct Chat' : 'Select a chat'}</h2>
          {chatId && (
            <button onClick={startCall} className="rounded-md border border-void-success/70 px-3 py-1 text-xs text-void-success hover:bg-void-success/10">
              Start Audio Call
            </button>
          )}
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {messages.map((message) => (
            <div key={message.id} className="max-w-xl rounded-md border border-white/15 bg-void-panel px-3 py-2">
              <p className="text-sm">{message.content}</p>
              <p className="mt-1 text-[10px] text-void-muted">{new Date(message.created_at).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>

        {chatId && (
          <div className="border-t border-white/15 bg-void-secondary p-3">
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="flex-1 rounded-md border border-white/20 bg-black px-3 py-2 text-sm"
                placeholder="Write a message"
              />
              <button onClick={sendMessage} className="rounded-md border border-white/30 px-4 py-2 text-sm hover:bg-void-hover">
                Send
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
