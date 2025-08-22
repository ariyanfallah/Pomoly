import { useState } from 'react';
import { type Project } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AnalyticsFiltersProps {
  projects: Project[];
  selectedProject: string | null;
  onProjectChange: (projectId: string | null) => void;
}

export function AnalyticsFilters({ projects, selectedProject, onProjectChange }: AnalyticsFiltersProps) {
  return (
    <div className="flex gap-3">
      <Select value={selectedProject || 'all'} onValueChange={(value) => onProjectChange(value === 'all' ? null : value)}>
        <SelectTrigger className="w-48 shadow-soft border-0">
          <SelectValue placeholder="Filter by project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
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
  );
}