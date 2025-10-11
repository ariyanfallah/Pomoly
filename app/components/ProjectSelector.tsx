import { useState } from 'react';
import { Plus, Folder, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Project } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ProjectSelectorProps {
  currentProjectId: string | null;
  onProjectChange: (projectId: string | null) => void;
}

const defaultProjects: Project[] = [
  { id: '1', name: 'Work Tasks', color: '#5EADD1', createdAt: new Date() },
  { id: '2', name: 'Learning', color: '#7BC96F', createdAt: new Date() },
  { id: '3', name: 'Personal', color: '#F7931E', createdAt: new Date() },
];

const projectColors = [
  '#5EADD1', '#7BC96F', '#F7931E', '#E85D75', '#9B5DE5', '#F15BB5'
];

export function ProjectSelector({ currentProjectId, onProjectChange }: ProjectSelectorProps) {
  const [projects, setProjects] = useLocalStorage<Project[]>('pomodoroProjects', defaultProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(projectColors[0]);

  const handleCreateProject = () => {
    if (!projectName.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName.trim(),
      color: selectedColor,
      createdAt: new Date(),
    };

    setProjects([...projects, newProject]);
    setProjectName('');
    setSelectedColor(projectColors[0]);
    setIsDialogOpen(false);
    onProjectChange(newProject.id);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectName(project.name);
    setSelectedColor(project.color);
    setIsDialogOpen(true);
  };

  const handleUpdateProject = () => {
    if (!editingProject || !projectName.trim()) return;

    const updatedProjects = projects.map(p => 
      p.id === editingProject.id 
        ? { ...p, name: projectName.trim(), color: selectedColor }
        : p
    );

    setProjects(updatedProjects);
    setEditingProject(null);
    setProjectName('');
    setSelectedColor(projectColors[0]);
    setIsDialogOpen(false);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (currentProjectId === projectId) {
      onProjectChange(null);
    }
  };

  const resetDialog = () => {
    setEditingProject(null);
    setProjectName('');
    setSelectedColor(projectColors[0]);
    setIsDialogOpen(false);
  };

  const currentProject = projects.find(p => p.id === currentProjectId);

  return (
    <Card className="p-6 shadow-soft border-0">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Folder className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Current Project</h3>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetDialog();
          }}>
            <DialogTrigger asChild>
              <Button variant="soft" size="sm">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </DialogTitle>
                <DialogDescription>
                  {editingProject 
                    ? 'Update your project details below.'
                    : 'Add a new project to organize your focus sessions.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name..."
                  />
                </div>
                <div className="space-y-3">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {projectColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full transition-smooth ${
                          selectedColor === color 
                            ? 'ring-2 ring-offset-2 ring-primary' 
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetDialog}>
                  Cancel
                </Button>
                <Button onClick={editingProject ? handleUpdateProject : handleCreateProject}>
                  {editingProject ? 'Update Project' : 'Create Project'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Select value={currentProjectId || ''} onValueChange={(value) => onProjectChange(value || null)}>
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Select a project...">
              {currentProject && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentProject.color }}
                  />
                  <span>{currentProject.name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span>{project.name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="p-1 hover:bg-destructive/10 hover:text-destructive rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!currentProject && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Select or create a project to start tracking your focus time
          </p>
        )}
      </div>
    </Card>
  );
}