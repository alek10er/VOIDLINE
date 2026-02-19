import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { DashboardShell } from '@/components/dashboard-shell';

export default async function ChatPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect('/login');

  const { data: memberships } = await supabase.from('chat_members').select('chat_id').eq('user_id', user.id);
  const chatIds = memberships?.map((row) => row.chat_id) ?? [];

  if (!chatIds.includes(params.id)) {
    redirect('/dashboard');
  }

  const { data: chats } = await supabase.from('chats').select('*').in('id', chatIds).order('created_at', { ascending: false });

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', params.id)
    .order('created_at', { ascending: true })
    .limit(100);

  return <DashboardShell initialChats={chats ?? []} initialMessages={messages ?? []} userId={user.id} />;
}
