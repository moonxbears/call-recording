import React, { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";

import IconRail from "@/components/calls/IconRail";
import CallListPanel from "@/components/calls/CallListPanel";
import PlaybackStudio from "@/components/calls/PlaybackStudio";
import CallCard from "@/components/calls/CallCard";
import MobileTranscriptDrawer from "@/components/calls/MobileTranscriptDrawer";
import { Radio } from "lucide-react";
import SearchBar from "@/components/calls/SearchBar";

export default function Home() {
  const { user } = useAuth();
  
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [counts, setCounts] = useState({ all: 0, unread: 0, starred: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedCall = calls.find((c) => c.id === selectedId) || null;
  const tickRef = useRef(null);

  // Load list from Supabase
  const loadCalls = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      let query = supabase
        .from('calls')
        .select('*')
        .eq('user_id', user.id) // Only get this user's calls
        .order('created_at', { ascending: false })
        .limit(50);

      // Apply Filters
      if (activeFilter === "unread") query = query.eq('read', false);
      if (activeFilter === "starred") query = query.eq('starred', true);

      // Apply Search
      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        // Supabase ILIKE search across multiple columns
        query = query.or(`title.ilike.${term},contact_name.ilike.${term},phone_number.ilike.${term},transcript.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setCalls(data || []);
    } catch (e) {
      console.error("Failed to load calls", e);
      setCalls([]);
    } finally {
      setLoading(false);
    }
  }, [user, activeFilter, searchQuery]);

  // Load counts for the sidebar chips
  const loadCounts = useCallback(async () => {
    if (!user) return;
    
    try {
      // Helper function to get exact counts from Supabase without downloading the rows
      const getCount = async (filterCol, filterVal) => {
        let q = supabase.from('calls').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        if (filterCol) q = q.eq(filterCol, filterVal);
        
        const { count, error } = await q;
        if (error) throw error;
        return count || 0;
      };

      const [all, unread, starred] = await Promise.all([
        getCount(null, null),
        getCount('read', false),
        getCount('starred', true),
      ]);
      
      setCounts({ all, unread, starred });
    } catch (e) {
      console.error("Failed to load counts", e);
    }
  }, [user]);

  // Fetch data when filters or user changes
  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  // Playback simulation timer
  useEffect(() => {
    if (isPlaying && selectedCall) {
      tickRef.current = setInterval(() => {
        setCurrentTime((t) => {
          const next = t + 0.1;
          const duration = selectedCall.duration || 0;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
      }, 100);
      return () => clearInterval(tickRef.current);
    }
  }, [isPlaying, selectedCall]);

  // Handle opening a call and marking it read in Supabase
  const handleSelect = useCallback(
    async (id) => {
      setSelectedId(id);
      setCurrentTime(0);
      setIsPlaying(false);
      setMobileOpen(true);
      
      const call = calls.find((c) => c.id === id);
      if (call && call.read !== true) {
        try {
          const { error } = await supabase.from('calls').update({ read: true }).eq('id', id);
          if (error) throw error;
          
          setCalls((prev) => prev.map((c) => (c.id === id ? { ...c, read: true } : c)));
          setCounts((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
        } catch (e) {
          console.error("Failed to mark read", e);
        }
      }
    },
    [calls]
  );

  // Handle toggling the star status in Supabase
  const handleToggleStar = useCallback(
    async (call) => {
      const newVal = !call.starred;
      try {
        const { error } = await supabase.from('calls').update({ starred: newVal }).eq('id', call.id);
        if (error) throw error;
        
        setCalls((prev) => prev.map((c) => (c.id === call.id ? { ...c, starred: newVal } : c)));
        setCounts((prev) => ({
          ...prev,
          starred: prev.starred + (newVal ? 1 : -1),
        }));
      } catch (e) {
        console.error("Failed to toggle star", e);
      }
    },
    []
  );

  const handlePlayPause = useCallback(() => setIsPlaying((p) => !p), []);
  const handleSeek = useCallback(
    (t) => {
      setCurrentTime(Math.max(0, Math.min(t, selectedCall?.duration || 0)));
    },
    [selectedCall]
  );
  const handleSkip = useCallback(
    (delta) => {
      setCurrentTime((t) => Math.max(0, Math.min(t + delta, selectedCall?.duration || 0)));
    },
    [selectedCall]
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#090D16] text-slate-100">
      <IconRail active="inbox" />

      {/* Desktop split view */}
      <div className="hidden md:flex flex-1 min-w-0">
        <CallListPanel
          calls={calls}
          selectedId={selectedId}
          onSelect={handleSelect}
          onToggleStar={handleToggleStar}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
          loading={loading}
        />
        <PlaybackStudio
          call={selectedCall}
          isPlaying={isPlaying}
          currentTime={currentTime}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onSkip={handleSkip}
          onToggleStar={handleToggleStar}
          searchQuery={searchQuery}
        />
      </div>

      {/* Mobile feed */}
      <div className="flex md:hidden flex-1 flex-col min-w-0">
        <div className="sticky top-0 z-10 bg-[#090D16]/95 backdrop-blur border-b border-[#1E293B] px-4 pt-3 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/15 border border-amber-500/40">
                <Radio className="h-3.5 w-3.5 text-amber-400" />
              </span>
              <h1 className="font-display text-lg font-bold tracking-tight">Signal</h1>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-signal-blink" />
              INTERCEPTING
            </span>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-white/[0.02] animate-pulse" />
            ))
          ) : calls.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-600">No calls match your filters.</div>
          ) : (
            calls.map((call) => (
              <CallCard
                key={call.id}
                call={call}
                onOpen={handleSelect}
                onToggleStar={handleToggleStar}
                searchQuery={searchQuery}
              />
            ))
          )}
        </div>
      </div>

      <MobileTranscriptDrawer
        call={selectedCall}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isPlaying={isPlaying}
        currentTime={currentTime}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onSkip={handleSkip}
        onToggleStar={handleToggleStar}
        searchQuery={searchQuery}
      />
    </div>
  );
}