import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/types';

interface DatabaseProject {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects.',
          variant: 'destructive',
        });
        return;
      }

      setProjects((data || []).map((p: DatabaseProject) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        createdAt: new Date(p.created_at),
      })));
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, color: string = '#3b82f6') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to create projects.',
          variant: 'destructive',
        });
        return null;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name,
          color,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        toast({
          title: 'Error',
          description: 'Failed to create project.',
          variant: 'destructive',
        });
        return null;
      }

      setProjects(prev => [...prev, {
        id: data.id,
        name: data.name,
        color: data.color,
        createdAt: new Date(data.created_at),
      }]);
      toast({
        title: 'Project Created',
        description: `Created project "${name}".`,
      });

      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Pick<DatabaseProject, 'name' | 'color'>>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        toast({
          title: 'Error',
          description: 'Failed to update project.',
          variant: 'destructive',
        });
        return false;
      }

      setProjects(prev => prev.map(p => p.id === id ? {
        id: data.id,
        name: data.name,
        color: data.color,
        createdAt: new Date(data.created_at),
      } : p));
      toast({
        title: 'Project Updated',
        description: 'Project has been updated successfully.',
      });

      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete project.',
          variant: 'destructive',
        });
        return false;
      }

      setProjects(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Project Deleted',
        description: 'Project has been deleted successfully.',
      });

      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
}