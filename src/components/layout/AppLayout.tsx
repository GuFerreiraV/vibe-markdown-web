import React from 'react';

interface AppLayoutProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  resizer: React.ReactNode;
  viewer: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  header,
  sidebar,
  resizer,
  viewer,
}) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      {header}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {sidebar}
        {resizer}
        {viewer}
      </div>
    </div>
  );
};
