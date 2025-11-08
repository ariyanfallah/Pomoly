import { useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/types';
import { useData } from '@/contexts/DataContext';

export function useProjects() {
  const { projects, addProject, updateProject, deleteProject: removeProject } = useData();
  const { toast } = useToast();

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  const createProject = async (name: string, color: string = '#3b82f6') => {
    if (!name.trim()) {
      toast({
        title: 'Project name required',
        description: 'Please provide a name for your project.',
        variant: 'destructive',
      });
      return null;
    }

    const project = addProject(name.trim(), color);
    toast({
      title: 'Project created',
      description: `Created project "${project.name}".`,
    });
    return project;
  };

  const editProject = async (id: string, updates: Partial<Pick<Project, 'name' | 'color'>>) => {
    const updated = updateProject(id, updates);
    if (!updated) {
      toast({
        title: 'Project not found',
        description: 'We could not find that project to update.',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Project updated',
      description: 'Project details have been updated.',
    });
    return true;
  };

  const deleteProject = async (id: string) => {
    const removed = removeProject(id);
    if (!removed) {
      toast({
        title: 'Project not found',
        description: 'We could not find that project to delete.',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Project deleted',
      description: 'Project has been removed.',
    });
    return true;
  };

  return {
    projects: sortedProjects,
    loading: false,
    createProject,
    updateProject: editProject,
    deleteProject,
    refetch: () => undefined,
  };
}
