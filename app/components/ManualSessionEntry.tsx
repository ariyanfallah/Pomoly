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
import type { Project, SessionType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useSessions } from '@/hooks/useSessions';

interface ManualSessionEntryProps {
  projects: Project[];
  onSessionAdded?: () => void;
}

export function ManualSessionEntry({ projects, onSessionAdded }: ManualSessionEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { createSession } = useSessions();

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
    return Math.max(0, Math.floor(diffMs / 1000));
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

      const session = await createSession({
        projectId: selectedProject,
        type: sessionType,
        duration,
        startedAt: startDateTime,
        completedAt: endDateTime,
        isManual: true,
        notes: notes.trim() || null,
      });

      if (!session) {
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

          <div className="space-y-2">
            <Label htmlFor="type">Session Type</Label>
            <Select value={sessionType} onValueChange={(value: SessionType) => setSessionType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="focus">Focus Session</SelectItem>
                <SelectItem value="shortBreak">Short Break</SelectItem>
                <SelectItem value="longBreak">Long Break</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start">Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end">End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this session"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Duration</span>
            <span>{formatDuration(duration)}</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
