import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { CallRoom } from '@/components/call-room';
import { env } from '@/lib/env';

export default async function CallPage({ params }: { params: { callId: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) redirect('/login');

  const { data: call } = await supabase.from('calls').select('*').eq('id', params.callId).single();

  if (!call) redirect('/dashboard');

  return (
    <main className="min-h-screen p-6">
      <CallRoom callId={call.id} roomName={call.room_name} serverUrl={env.livekitUrl} />
    </main>
  );
}
