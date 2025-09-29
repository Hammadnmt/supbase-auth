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
    const ch = supabase.channel("location-update");
    const subscribed = ch.subscribe();
    setChannel(subscribed);
  }, [channel]);

  return <RealtimeContext.Provider value={{ channel }}>{children}</RealtimeContext.Provider>;
}
export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error("useRealtime must be used inside RealtimeContex");
  return context;
}
