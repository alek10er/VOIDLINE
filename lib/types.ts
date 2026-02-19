export type ChatType = 'direct' | 'group';
export type MemberRole = 'admin' | 'member';
export type CallStatus = 'ringing' | 'active' | 'ended';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Chat {
  id: string;
  type: ChatType;
  title: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
}

export interface Call {
  id: string;
  chat_id: string;
  created_by: string;
  type: ChatType;
  provider: 'livekit';
  room_name: string;
  status: CallStatus;
  created_at: string;
  ended_at: string | null;
}
