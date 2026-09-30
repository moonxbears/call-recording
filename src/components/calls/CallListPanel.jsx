import React, { useState, useEffect } from 'react';
import CallListPanel from './CallListPanel';
import { supabase } from '../../api/supabaseClient';
import { useAuth } from '../../lib/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  
  // Example state for the panel's other props
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchCalls = async () => {
      if (!user) return;
      
      setLoading(true);
      // Fetch calls for the logged-in user from Supabase
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching calls:', error);
      } else {
        setCalls(data || []);
      }
      setLoading(false);
    };

    fetchCalls();
  }, [user]); // Re-run if the user changes

  // Dummy counts for the FilterChips
  const counts = { all: calls.length, starred: 0, unread: 0 };

  return (
    <div className="flex h-screen bg-background">
      <CallListPanel 
        calls={calls}
        loading={loading}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
        onToggleStar={(id) => console.log('Star toggled for', id)}
      />
      
      {/* Your PlaybackStudio or Main Content area goes here */}
      <div className="flex-1">
         {/* ... */}
      </div>
    </div>
  );
}