import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { DashboardShell } from '@/components/dashboard-shell';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect('/login');

  const { data: memberships } = await supabase.from('chat_members').select('chat_id').eq('user_id', user.id);
  const chatIds = memberships?.map((row) => row.chat_id) ?? [];

  const { data: chats } = chatIds.length
    ? await supabase.from('chats').select('*').in('id', chatIds).order('created_at', { ascending: false })
    : { data: [] };

  return <DashboardShell initialChats={chats ?? []} initialMessages={[]} userId={user.id} />;
}
