import { SearchX } from "lucide-react";
import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function EmptyState({ 
  title, 
  description, 
  action, 
  icon = <SearchX size={32} className="text-border" /> 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-surface border border-border rounded-xl shadow-sm">
      <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-inter font-bold text-lg text-foreground mb-2">
        {title}
      </h3>
      <p className="font-inter text-sm text-muted max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}
