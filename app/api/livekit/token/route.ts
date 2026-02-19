import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { env } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { roomName } = (await request.json()) as { roomName?: string };
  if (!roomName) {
    return NextResponse.json({ error: 'roomName is required' }, { status: 400 });
  }

  const token = new AccessToken(env.livekitApiKey, env.livekitApiSecret, {
    identity: userData.user.id,
    ttl: '2h',
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return NextResponse.json({ token: await token.toJwt(), roomName });
}

export async function PATCH(request: NextRequest) {
  const callId = request.nextUrl.searchParams.get('callId');
  if (!callId) return NextResponse.json({ error: 'callId missing' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  await supabase.from('calls').update({ status: 'active' }).eq('id', callId);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const callId = request.nextUrl.searchParams.get('callId');
  if (!callId) return NextResponse.json({ error: 'callId missing' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  await supabase.from('calls').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', callId);

  return NextResponse.json({ ok: true });
}
