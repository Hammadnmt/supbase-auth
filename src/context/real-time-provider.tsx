// RealtimeContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/libs/supabase";

type RealtimeContextType = {
  channel: ReturnType<typeof supabase.channel> | null;
};

const RealtimeContext = createContext<RealtimeContextType>({ channel: null });

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Create + subscribe once
    const ch = supabase.channel("realtime:location-update").subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Subscribed to realtime:location-update");
      }
    });

    setChannel(ch);

    // Cleanup
    return () => {
      ch.unsubscribe();
    };
  }, []);

  return <RealtimeContext.Provider value={{ channel }}>{children}</RealtimeContext.Provider>;
}

export const useRealtime = () => useContext(RealtimeContext);
