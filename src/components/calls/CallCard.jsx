import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Play, Clock, Calendar, MoreVertical, Trash2, Download } from 'lucide-react';

// Helper to format total seconds into an mm:ss string
const formatDuration = (/** @type {number} */ seconds) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper to format the Supabase timestamp into a readable date
const formatDate = (/** @type {string} */ dateString) => {
  if (!dateString) return 'Unknown date';
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function CallCard({ call, onPlay, onDelete, onDownload }) {
  return (
    <Card className="hover:bg-accent/50 transition-colors group flex flex-col justify-between">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold line-clamp-1 pr-2">
          {call.title || call.contact_name || 'Unknown Caller'}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            >
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDownload?.(call)}>
              <Download className="mr-2 h-4 w-4" />
              <span>Download Audio</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(call.id)} 
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Call</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            {formatDate(call.created_at)}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              {formatDuration(call.duration)}
            </div>
            {/* Badge indicating if the call was successfully synced to Google Drive/Supabase */}
            <Badge variant={call.sync_status === 'synced' ? 'default' : 'secondary'}>
              {call.sync_status === 'synced' ? 'Backed Up' : 'Local'}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          className="w-full" 
          variant="secondary" 
          onClick={() => onPlay?.(call)}
        >
          <Play className="mr-2 h-4 w-4" /> Open Recording
        </Button>
      </CardFooter>
    </Card>
  );
}