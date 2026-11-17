import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { AgentStatusEvent } from '../../types';

interface AgentExecutionPipelineProps {
  researchId: string;
  onComplete: () => void;
  onError: (err: string) => void;
}

export const AgentExecutionPipeline: React.FC<AgentExecutionPipelineProps> = ({
  researchId,
  onComplete,
  onError,
}) => {
  const [events, setEvents] = useState<AgentStatusEvent[]>([]);
  const [currentProgress, setCurrentProgress] = useState(5);
  const [currentStep, setCurrentStep] = useState('Initializing Multi-Agent Pipeline...');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!researchId) return;

    const eventSource = new EventSource(`/api/v1/research/${researchId}/stream`);

    eventSource.addEventListener('status', (e) => {
      try {
        const data: AgentStatusEvent = JSON.parse(e.data);
        setEvents((prev) => [...prev, data]);
        setCurrentProgress(data.progress);
        setCurrentStep(data.message);

        if (data.status === 'FAILED') {
          onError(data.message);
          eventSource.close();
        } else if (data.progress >= 100) {
          setIsDone(true);
          eventSource.close();
          setTimeout(() => {
            onComplete();
          }, 800);
        }
      } catch (err) {
        console.error('Failed to parse SSE payload', err);
      }
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [researchId]);

  const agents = [
    { id: 'supervisor', name: 'Supervisor Agent', role: 'Orchestrator & Arbiter', threshold: 10 },
    { id: 'fundamental', name: 'Fundamental Agent', role: 'Balance Sheet & Margins', threshold: 40 },
    { id: 'technical', name: 'Technical Agent', role: 'Momentum & Trend Signals', threshold: 60 },
    { id: 'news', name: 'News & Sentiment Agent', role: 'Catalysts & Narrative Polarity', threshold: 75 },
    { id: 'risk', name: 'Risk Analysis Agent', role: 'Adversarial Contradiction Audit', threshold: 90 },
  ];

  return (
    <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 shadow-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">LangGraph Multi-Agent Engine</h3>
            <p className="text-xs text-gray-400 font-mono">Autonomous Execution Pipeline</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isDone ? (
            <span className="flex items-center gap-1.5 text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> {currentProgress}%
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% COMPLETE
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-300"
          style={{ width: `${currentProgress}%` }}
        />
      </div>

      {/* Agent Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {agents.map((ag) => {
          const isComplete = currentProgress >= ag.threshold;
          const isActive = currentProgress < ag.threshold && currentProgress >= ag.threshold - 25;

          return (
            <div
              key={ag.id}
              className={`p-3 rounded-lg border text-xs transition duration-200 ${
                isComplete
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-gray-200'
                  : isActive
                  ? 'bg-blue-500/5 border-blue-500/30 text-white shadow-lg shadow-blue-500/5'
                  : 'bg-gray-900/40 border-[#1F293D] text-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold">{ag.name}</span>
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-gray-600" />
                )}
              </div>
              <div className="text-[10px] text-gray-400 line-clamp-1">{ag.role}</div>
            </div>
          );
        })}
      </div>

      {/* Real-time Status Stream Terminal */}
      <div className="bg-black/50 border border-[#1F293D] rounded-lg p-3 font-mono text-xs max-h-32 overflow-y-auto space-y-1">
        <div className="text-gray-400 text-[11px] mb-1 flex items-center justify-between">
          <span>// LIVE AGENT REASONING STREAM</span>
          <span className="text-[10px]">{events.length} events logged</span>
        </div>
        {events.map((evt, idx) => (
          <div key={idx} className="flex items-start gap-2 text-gray-300 text-[11px]">
            <span className="text-blue-400 select-none">&gt;</span>
            <span className="text-gray-400">[{evt.agent.toUpperCase()}]</span>
            <span className="text-gray-200">{evt.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

