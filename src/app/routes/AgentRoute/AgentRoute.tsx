/**
 * AgentRoute.tsx
 *
 * Live dashboard for the x402 AI agent.
 * Shows:
 *   - Agent wallet address + TBUX balance
 *   - Task input + Run button
 *   - Live SSE-powered payment/tool activity feed
 *   - Budget meter (vault top-ups shown separately)
 */

import { Bot, RefreshCw, Send, Wallet, Zap } from 'lucide-react';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';

const AGENT_SERVER_URL = import.meta.env['VITE_AGENT_SERVER_URL'] ?? 'http://localhost:3002';

type EventType =
  | 'agent_thinking'
  | 'tool_call'
  | 'payment'
  | 'balance'
  | 'agent_response'
  | 'error';

interface AgentEvent {
  type: EventType;
  data: Record<string, unknown>;
  timestamp: string;
}

interface AgentStatus {
  agent_address: string;
  agent_id: string;
  balance_base_units: string;
  balance_formatted: string;
  token_address: string;
}

const EVENT_COLORS: Record<EventType, string> = {
  agent_thinking: 'text-blue-400',
  tool_call: 'text-yellow-400',
  payment: 'text-purple-400',
  balance: 'text-green-400',
  agent_response: 'text-emerald-300',
  error: 'text-red-400',
};

const EVENT_ICONS: Record<EventType, string> = {
  agent_thinking: '🤔',
  tool_call: '🔧',
  payment: '💸',
  balance: '🏦',
  agent_response: '✅',
  error: '❌',
};

const formatEventText = (event: AgentEvent): string => {
  const { type, data } = event;
  switch (type) {
    case 'agent_thinking':
      return String(data['thinking'] ?? '').slice(0, 140);
    case 'tool_call':
      return `Calling ${String(data['tool'])} (product: ${String(data['productId'])})`;
    case 'payment':
      // eslint-disable-next-line no-case-declarations
      const pEvt = data as Record<string, unknown>;
      if (pEvt['type'] === 'payment_settled')
        return `Payment settled ✓ — ${String(pEvt['amountBaseUnits'])} base units → tx ${String(pEvt['txHash'] ?? '').slice(0, 12)}...`;
      if (pEvt['type'] === 'payment_signed')
        return `EIP-2612 permit signed for ${String(pEvt['tool'])}`;
      if (pEvt['type'] === 'payment_start')
        return `Starting x402 payment for ${String(pEvt['tool'])}`;
      if (pEvt['type'] === 'payment_failed')
        return `Payment failed: ${String(pEvt['error'])}`;
      return JSON.stringify(pEvt).slice(0, 120);
    case 'balance':
      // eslint-disable-next-line no-case-declarations
      const bEvt = data as Record<string, unknown>;
      if (bEvt['type'] === 'topup_confirmed')
        return `🏦 Vault top-up confirmed! +${String(bEvt['topupAmountBaseUnits'])} TBUX → tx ${String(bEvt['txHash'] ?? '').slice(0, 12)}...`;
      if (bEvt['type'] === 'topup_requested')
        return `🏦 Requesting TBUX top-up from Fireblocks vault...`;
      return `Balance check: ${String(bEvt['balanceBaseUnits'])} base units`;
    case 'agent_response':
      return String(data['text'] ?? '').slice(0, 300);
    case 'error':
      return `Error: ${String(data['error'] ?? '')}`;
  }
};

export const AgentRoute: FC = () => {
  const [task, setTask] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch(`${AGENT_SERVER_URL}/agent/status`);
      if (res.ok) setStatus(await res.json());
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  // Auto-scroll feed to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events]);

  const runAgent = useCallback(async () => {
    if (!task.trim() || isRunning) return;

    setIsRunning(true);
    setEvents([]);
    setFinalAnswer(null);

    try {
      const res = await fetch(`${AGENT_SERVER_URL}/agent/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Agent server error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6)) as AgentEvent;
            setEvents((prev) => [...prev, event]);
            if (event.type === 'agent_response' && event.data['text']) {
              setFinalAnswer(String(event.data['text']));
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch (err) {
      setEvents((prev) => [
        ...prev,
        {
          type: 'error',
          data: { error: err instanceof Error ? err.message : String(err) },
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsRunning(false);
      void loadStatus(); // refresh balance after run
    }
  }, [task, isRunning, loadStatus]);

  const paymentCount = events.filter(
    (e) => e.type === 'payment' && (e.data as Record<string, unknown>)['type'] === 'payment_settled',
  ).length;

  const topupCount = events.filter(
    (e) => e.type === 'balance' && (e.data as Record<string, unknown>)['type'] === 'topup_confirmed',
  ).length;

  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[780px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col gap-6">

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI Agent
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Autonomous agent with a Dynamic MPC wallet — pays for tools via x402
            </p>
          </div>
          <button
            onClick={() => void loadStatus()}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${statusLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Agent wallet card */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Wallet className="w-4 h-4 text-purple-400" />
            Agent Wallet
            <span className="ml-auto text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
              Dynamic MPC
            </span>
          </div>

          {statusLoading ? (
            <div className="h-8 bg-muted/40 rounded animate-pulse" />
          ) : status ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-muted-foreground bg-muted/40 px-2 py-1 rounded">
                  {status.agent_address}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">TBUX Balance</span>
                <span className="text-sm font-semibold text-foreground">
                  {status.balance_formatted} TBUX
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-400">
              Agent server not reachable — is x402-agent-node running on port 3002?
            </p>
          )}
        </div>

        {/* Stats strip */}
        {events.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Events', value: events.length, color: 'text-blue-400' },
              { label: 'Payments', value: paymentCount, color: 'text-purple-400' },
              { label: 'Top-ups', value: topupCount, color: 'text-green-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-3 text-center">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Task input */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-yellow-400" />
            Give the agent a task
          </p>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Get the current price of ETH and SOL, then analyze if we're in a bull or bear market"
            rows={3}
            disabled={isRunning}
            className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
          />
          <button
            onClick={() => void runAgent()}
            disabled={!task.trim() || isRunning || !status}
            className="self-end flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Run Agent
              </>
            )}
          </button>
        </div>

        {/* Final answer */}
        {finalAnswer && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-xs font-medium text-emerald-400 mb-2">Agent Response</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{finalAnswer}</p>
          </div>
        )}

        {/* Live activity feed */}
        {events.length > 0 && (
          <div className="rounded-xl border border-border bg-card flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-foreground">Live Activity</span>
              <span className="ml-auto text-xs text-muted-foreground">{events.length} events</span>
            </div>
            <div
              ref={feedRef}
              className="overflow-y-auto max-h-[360px] p-3 flex flex-col gap-1.5 font-mono"
            >
              {events.map((evt, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="shrink-0 mt-0.5">{EVENT_ICONS[evt.type]}</span>
                  <span className={`${EVENT_COLORS[evt.type]} leading-5`}>
                    {formatEventText(evt)}
                  </span>
                  <span className="ml-auto shrink-0 text-muted-foreground/50 text-[10px] mt-0.5">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {isRunning && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60 animate-pulse">
                  <span>⋯</span>
                  <span>Agent working...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
