"use client";

import { useEffect, useState } from "react";
import { CommTimeline } from "@/components/comm-timeline";
import { createClient } from "@/lib/supabase";

interface CommRow {
  id: string;
  from_agent: string;
  to_agent: string;
  message: string;
  task_description: string;
  status: string;
  duration_ms: number | null;
  created_at: string;
}

export default function CommsPage() {
  const [comms, setComms] = useState<CommRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("comms")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setComms(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Communications</h1>
        <p className="text-sm text-muted-foreground mt-1">Agent-to-agent message timeline</p>
      </div>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[100px] rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : comms.length === 0 ? (
        <p className="text-muted-foreground text-sm">No communications found. Run the sync script to populate data.</p>
      ) : (
        <CommTimeline comms={comms} />
      )}
    </div>
  );
}
