import { AgentCard } from "@/components/agent-card";
import agentsData from "@/data/agents.json";

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your AI agents in real-time
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {agentsData.map((agent) => (
          <AgentCard key={agent.id} agent={agent as never} />
        ))}
      </div>
    </div>
  );
}
