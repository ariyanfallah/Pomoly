import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, set } from 'date-fns';
import { CalendarIcon, Clock, Plus, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ManualSessionEntryProps {
  projects: any[];
  onSessionAdded?: () => void;
}

export function ManualSessionEntry({ projects, onSessionAdded }: ManualSessionEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:25');
  const [notes, setNotes] = useState('');

  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    return Math.max(0, Math.floor(diffMs / 1000)); // Convert to seconds
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const resetForm = () => {
    setSelectedProject('');
    setSessionType('focus');
    setDate(new Date());
    setStartTime('09:00');
    setEndTime('09:25');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject) {
      toast({
        title: 'Project Required',
        description: 'Please select a project for this session.',
        variant: 'destructive',
      });
      return;
    }

    const duration = calculateDuration();
    if (duration <= 0) {
      toast({
        title: 'Invalid Time Range',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to add manual sessions.',
          variant: 'destructive',
        });
        return;
      }

      // Create start and end timestamps
      const startDateTime = set(date, {
        hours: parseInt(startTime.split(':')[0]),
        minutes: parseInt(startTime.split(':')[1]),
        seconds: 0,
        milliseconds: 0,
      });

      const endDateTime = set(date, {
        hours: parseInt(endTime.split(':')[0]),
        minutes: parseInt(endTime.split(':')[1]),
        seconds: 0,
        milliseconds: 0,
      });

      const { error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          project_id: selectedProject,
          type: sessionType,
          duration,
          started_at: startDateTime.toISOString(),
          completed_at: endDateTime.toISOString(),
          is_manual: true,
          notes: notes.trim() || null,
        });

      if (error) {
        console.error('Error adding manual session:', error);
        toast({
          title: 'Error',
          description: 'Failed to add session. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Session Added!',
        description: `Added ${formatDuration(duration)} ${sessionType} session.`,
      });

      resetForm();
      setIsOpen(false);
      onSessionAdded?.();
    } catch (error) {
      console.error('Error adding manual session:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const duration = calculateDuration();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Manual Session
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Add Manual Session
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Session Type</Label>
            <Select value={sessionType} onValueChange={(value: SessionType) => setSessionType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="focus">Focus Session</SelectItem>
                <SelectItem value="shortBreak">Short Break</SelectItem>
                <SelectItem value="longBreak">Long Break</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className="pointer-events-auto"
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Duration Display */}
          {duration > 0 && (
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="text-lg font-semibold text-foreground">
                {formatDuration(duration)}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="What did you work on during this session?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || duration <= 0}>
              {loading ? 'Adding...' : 'Add Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}