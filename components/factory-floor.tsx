import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PipelineTask = {
  id: string;
  title: string;
  status: string;
  agent_id: string;
  notes?: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTIVE_STATUSES = ['BACKLOG', 'SPEC', 'IN_PROGRESS', 'QA', 'REVIEW'] as const;
type ActiveStatus = (typeof ACTIVE_STATUSES)[number];

const STATUS_LABELS: Record<ActiveStatus, string> = {
  BACKLOG: 'Backlog',
  SPEC: 'Spec',
  IN_PROGRESS: 'In Progress',
  QA: 'QA',
  REVIEW: 'Review',
};

/** Agent-id -> hex colour for the pixel head background. */
const AGENT_COLORS: Record<string, string> = {
  george: '#6366f1',
  rex: '#f97316',
  leo: '#22c55e',
  iris: '#ec4899',
  atlas: '#8b5cf6',
  scout: '#06b6d4',
  hugo: '#ef4444',
};

const DEFAULT_AGENT_COLOR = '#9ca3af';

// ---------------------------------------------------------------------------
// Keyframe injection (runs once)
// ---------------------------------------------------------------------------

const BOB_KEYFRAMES = `
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}
`;

let keyframesInjected = false;

function ensureKeyframes(): void {
  if (typeof document === 'undefined' || keyframesInjected) return;
  const style = document.createElement('style');
  style.textContent = BOB_KEYFRAMES;
  document.head.appendChild(style);
  keyframesInjected = true;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveColor(agentId: string): string {
  const normalized = agentId.trim().toLowerCase();
  // Try exact match first
  if (AGENT_COLORS[normalized]) return AGENT_COLORS[normalized]!;
  // Try partial match (e.g., "rex/coder" → "rex")
  for (const [key, color] of Object.entries(AGENT_COLORS)) {
    if (normalized.includes(key) || key.includes(normalized)) return color;
  }
  return DEFAULT_AGENT_COLOR;
}

function extractDisplayName(agentId: string): string {
  const parts = agentId.split('/');
  const name = parts[0] ?? agentId;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function isActiveStatus(status: string): status is ActiveStatus {
  return (ACTIVE_STATUSES as readonly string[]).includes(status);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface PixelHeadProps {
  agentId: string;
  /** Stagger offset so heads in the same column bob out of phase. */
  delayMs?: number;
}

const PixelHead: React.FC<PixelHeadProps> = ({ agentId, delayMs = 0 }) => {
  const color = resolveColor(agentId);
  const name = extractDisplayName(agentId);

  const headStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: color,
    position: 'relative',
    animation: `bob 1.6s ease-in-out ${delayMs}ms infinite`,
    flexShrink: 0,
  };

  const eyeBase: React.CSSProperties = {
    width: 4,
    height: 4,
    backgroundColor: '#000',
    borderRadius: 1,
    position: 'absolute',
    top: 12,
  };

  const nametagStyle: React.CSSProperties = {
    fontSize: 8,
    lineHeight: '12px',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 48,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={headStyle} title={agentId}>
        {/* Left eye */}
        <div style={{ ...eyeBase, left: 8 }} />
        {/* Right eye */}
        <div style={{ ...eyeBase, right: 8 }} />
      </div>
      <span style={nametagStyle}>{name}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Ghost placeholder for empty zones
// ---------------------------------------------------------------------------

const GhostPlaceholder: React.FC = () => {
  const ghostHeadStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#374151',
    opacity: 0.35,
    position: 'relative',
  };

  const ghostEyeBase: React.CSSProperties = {
    width: 4,
    height: 4,
    backgroundColor: '#000',
    borderRadius: 1,
    position: 'absolute',
    top: 12,
    opacity: 0.3,
  };

  const ghostLabelStyle: React.CSSProperties = {
    fontSize: 8,
    lineHeight: '12px',
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'monospace',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={ghostHeadStyle}>
        <div style={{ ...ghostEyeBase, left: 8 }} />
        <div style={{ ...ghostEyeBase, right: 8 }} />
      </div>
      <span style={ghostLabelStyle}>---</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Task card wrapper
// ---------------------------------------------------------------------------

interface TaskCardProps {
  task: PipelineTask;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    border: '1px solid #334155',
    width: 64,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 9,
    lineHeight: '12px',
    color: '#cbd5e1',
    textAlign: 'center',
    fontFamily: 'monospace',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%',
  };

  return (
    <div style={cardStyle} title={task.notes ?? task.title}>
      <PixelHead agentId={task.agent_id} delayMs={index * 200} />
      <span style={titleStyle}>{task.title}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Status column / zone
// ---------------------------------------------------------------------------

interface StatusZoneProps {
  status: ActiveStatus;
  tasks: PipelineTask[];
}

const StatusZone: React.FC<StatusZoneProps> = ({ status, tasks }) => {
  const zoneStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    minWidth: 88,
    flex: '1 1 0%',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#64748b',
    fontFamily: 'monospace',
    marginBottom: 4,
  };

  const countBadgeStyle: React.CSSProperties = {
    fontSize: 9,
    color: '#475569',
    fontFamily: 'monospace',
  };

  return (
    <div style={zoneStyle}>
      <span style={headerStyle}>{STATUS_LABELS[status]}</span>
      <span style={countBadgeStyle}>{tasks.length}</span>
      {tasks.length === 0 ? (
        <GhostPlaceholder />
      ) : (
        tasks.map((task, idx) => (
          <TaskCard key={task.id} task={task} index={idx} />
        ))
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface FactoryFloorProps {
  tasks?: PipelineTask[];
}

const FactoryFloor: React.FC<FactoryFloorProps> = ({ tasks: tasksProp }) => {
  const [fetchedTasks, setFetchedTasks] = React.useState<PipelineTask[]>([]);

  React.useEffect(() => {
    ensureKeyframes();
    if (!tasksProp) {
      const load = () =>
        fetch('/api/factory')
          .then((r) => r.json())
          .then((d) => setFetchedTasks(d.tasks ?? []))
          .catch(() => {});
      load();
      const id = setInterval(load, 5000);
      return () => clearInterval(id);
    }
  }, [tasksProp]);

  const tasks = tasksProp ?? fetchedTasks;

  // Filter to active statuses only — SHIPPED and ARCHIVE are excluded.
  const activeTasks = React.useMemo(
    () => tasks.filter((t) => isActiveStatus(t.status)),
    [tasks],
  );

  // Group tasks by status, preserving column order.
  const grouped = React.useMemo(() => {
    const map = new Map<ActiveStatus, PipelineTask[]>();
    for (const status of ACTIVE_STATUSES) {
      map.set(status, []);
    }
    for (const task of activeTasks) {
      const bucket = map.get(task.status as ActiveStatus);
      if (bucket) {
        bucket.push(task);
      }
    }
    return map;
  }, [activeTasks]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    overflowX: 'auto',
    minHeight: 160,
    alignItems: 'flex-start',
  };

  return (
    <div style={containerStyle}>
      {ACTIVE_STATUSES.map((status) => (
        <StatusZone
          key={status}
          status={status}
          tasks={grouped.get(status) ?? []}
        />
      ))}
    </div>
  );
};

export default FactoryFloor;

export { FactoryFloor };
