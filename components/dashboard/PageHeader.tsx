interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: string;
}

export default function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between pb-6 mb-6 border-b border-border">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <h1 className="font-inter font-bold text-[26px] leading-[32px] text-foreground tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="px-2.5 py-1 bg-background text-muted rounded-full text-xs font-semibold font-inter">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="font-inter text-[13px] text-muted max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3 shrink-0 ml-6">
          {action}
        </div>
      )}
    </div>
  );
}
