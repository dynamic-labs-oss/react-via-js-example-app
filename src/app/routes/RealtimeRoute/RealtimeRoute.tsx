import {
  type RealtimeConnectionState,
  createRealtimeChannelSchema,
  getCore,
} from '@dynamic-labs-sdk/client/core';
import { Radio } from 'lucide-react';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import * as z from 'zod/mini';

import { dynamicClient } from '../../constants/dynamicClient';

const chatSchema = z.object({
  sender: z.string(),
  text: z.string(),
  timestamp: z.number(),
});

type ChatMessage = z.infer<typeof chatSchema>;

const CHANNEL_PREFIX = 'dynamic-demo-';

const CONNECTION_STATE_COLORS: Record<RealtimeConnectionState, string> = {
  closed: 'bg-gray-400',
  closing: 'bg-gray-400',
  connected: 'bg-emerald-500',
  connecting: 'bg-amber-400',
  disconnected: 'bg-red-400',
  failed: 'bg-red-600',
  idle: 'bg-gray-400',
  suspended: 'bg-orange-400',
};

export const RealtimeRoute: FC = () => {
  const [connectionState, setConnectionState] =
    useState<RealtimeConnectionState>('idle');
  const [channel, setChannel] = useState('test-chat');
  const [channelInput, setChannelInput] = useState('test-chat');
  const [isJoining, setIsJoining] = useState(false);
  const [sender, setSender] = useState(
    () => `User-${Math.random().toString(36).slice(2, 6)}`
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const callbackRef = useRef<((message: { data: ChatMessage }) => void) | null>(
    null
  );
  const channelSchemaRef = useRef(
    createRealtimeChannelSchema({ channel: `${CHANNEL_PREFIX}${channel}`, schema: chatSchema })
  );

  const realtime = getCore(dynamicClient).realtime;

  // Listen to connection state changes
  useEffect(() => {
    const handler = (state: RealtimeConnectionState) => {
      setConnectionState(state);
    };

    realtime.on('connectionStateChange', handler);

    return () => {
      realtime.off('connectionStateChange', handler);
    };
  }, [realtime]);

  // Unsubscribe on unmount
  useEffect(() => {
    return () => {
      if (callbackRef.current && channelSchemaRef.current) {
        realtime.unsubscribe({
          callback: callbackRef.current,
          channelSchema: channelSchemaRef.current,
        });
      }
    };
  }, [realtime]);

  const handleConnect = async () => {
    await realtime.connect({ client: dynamicClient });
  };

  const handleDisconnect = () => {
    realtime.disconnect();
    setIsSubscribed(false);
    setMessages([]);
  };

  const handleJoinChannel = useCallback(async () => {
    setIsJoining(true);
    try {
      // Unsubscribe from old channel if needed
      if (callbackRef.current && channelSchemaRef.current) {
        realtime.unsubscribe({
          callback: callbackRef.current,
          channelSchema: channelSchemaRef.current,
        });
      }

      const newSchema = createRealtimeChannelSchema({
        channel: `${CHANNEL_PREFIX}${channelInput}`,
        schema: chatSchema,
      });

      channelSchemaRef.current = newSchema;
      setChannel(channelInput);
      setMessages([]);

      const callback = (message: { data: ChatMessage }) => {
        setMessages((prev) => [...prev, message.data]);
      };

      callbackRef.current = callback;

      await realtime.subscribe({
        callback,
        channelSchema: newSchema,
      });

      setIsSubscribed(true);
    } finally {
      setIsJoining(false);
    }
  }, [channelInput, realtime]);

  const handleSend = async () => {
    if (!text.trim()) return;

    await realtime.publish({
      channelSchema: channelSchemaRef.current,
      data: {
        sender,
        text: text.trim(),
        timestamp: Date.now(),
      },
    });

    setText('');
  };

  const isConnected = connectionState === 'connected';

  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col gap-6">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Realtime
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pub/sub messaging between browser tabs
          </p>
        </div>

        {/* Connection card */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-semibold text-foreground">
                Connection
              </h2>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${CONNECTION_STATE_COLORS[connectionState]}`}
                />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {connectionState}
                </span>
              </div>
            </div>

            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => void handleConnect()}
                disabled={connectionState === 'connecting'}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* Channel & sender config */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card">
          <div className="px-5 pt-4 pb-4 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">Settings</h2>

            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground w-16 shrink-0">
                Channel
              </label>
              <div className="flex-1 flex items-center border border-border rounded-lg bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden">
                <span className="text-xs text-muted-foreground pl-3 pr-1 select-none whitespace-nowrap">
                  {CHANNEL_PREFIX}
                </span>
                <input
                  type="text"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  className="flex-1 text-sm bg-transparent py-1.5 pr-3 text-foreground focus:outline-none"
                  placeholder="channel name"
                />
              </div>
              <button
                onClick={() => void handleJoinChannel()}
                disabled={!isConnected || isJoining}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Join
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground w-16 shrink-0">
                Sender
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="your name"
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="rounded-2xl bg-card border border-border/60 shadow-card flex flex-col">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2.5">
            <h2 className="text-sm font-semibold text-foreground">Messages</h2>
            {isSubscribed && (
              <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                #{CHANNEL_PREFIX}{channel}
              </span>
            )}
          </div>

          <div className="px-5 pb-2 h-[320px] overflow-y-auto flex flex-col gap-2">
            {!isSubscribed && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-border/60 shadow-sm flex items-center justify-center">
                    <Radio className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-[13px] text-muted-foreground">
                    Connect and join a channel to start messaging
                  </p>
                </div>
              </div>
            )}

            {isSubscribed && messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[13px] text-muted-foreground">
                  No messages yet. Send one or open another tab!
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={`${msg.timestamp}-${i}`}
                className="flex flex-col gap-0.5"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/80">{msg.text}</p>
              </div>
            ))}

          </div>

          {/* Compose */}
          <div className="px-5 pb-4 pt-2 border-t border-border/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={!isSubscribed}
                className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                placeholder={
                  isSubscribed ? 'Type a message...' : 'Join a channel first'
                }
              />
              <button
                type="submit"
                disabled={!isSubscribed || !text.trim()}
                className="text-xs font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
