'use client';

import { useEffect, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { useRouter } from 'next/navigation';

interface CallRoomProps {
  callId: string;
  roomName: string;
  serverUrl: string;
}

export function CallRoom({ callId, roomName, serverUrl }: CallRoomProps) {
  const router = useRouter();
  const [status, setStatus] = useState('Connecting...');
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    let mounted = true;
    const lkRoom = new Room({ adaptiveStream: true, dynacast: true });

    const boot = async () => {
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName }),
      });

      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error ?? 'Could not create token');
        return;
      }

      await lkRoom.connect(serverUrl, data.token);
      await lkRoom.localParticipant.setMicrophoneEnabled(true);
      setStatus('Active');
      setRoom(lkRoom);

      await fetch(`/api/livekit/token?callId=${callId}`, { method: 'PATCH' });

      lkRoom.on(RoomEvent.Disconnected, () => {
        if (mounted) setStatus('Disconnected');
      });
    };

    boot();

    return () => {
      mounted = false;
      lkRoom.disconnect();
    };
  }, [callId, roomName, serverUrl]);

  const hangup = async () => {
    await fetch(`/api/livekit/token?callId=${callId}`, { method: 'DELETE' });
    room?.disconnect();
    router.push('/dashboard');
  };

  return (
    <section className="mx-auto mt-24 w-full max-w-lg rounded-md border border-white/20 bg-void-panel p-8 text-center">
      <h1 className="text-2xl font-semibold">Audio Call</h1>
      <p className="mt-2 text-sm text-void-muted">Room: {roomName}</p>
      <p className="mt-6 text-lg text-void-success">{status}</p>
      <button onClick={hangup} className="mt-8 rounded-md border border-void-danger px-5 py-2 text-sm text-void-danger hover:bg-void-danger/10">
        End Call
      </button>
    </section>
  );
}
