import { useState } from 'react';
import { useGitHubRepo } from './hooks/useGitHubRepo';
import { useResizableSidebar } from './hooks/useResizableSidebar';
import { useMarkdownSearch } from './hooks/useMarkdownSearch';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/sidebar/Sidebar';
import { SidebarResizer } from './components/layout/SidebarResizer';
import { MarkdownViewer } from './components/viewer/MarkdownViewer';
import { AppLayout } from './components/layout/AppLayout';

export function App() {
  const {
    target,
    files,
    selectedFilePath,
    currentContent,
    isTreeLoading,
    isFileLoading,
    error,
    changeRepository,
    selectFile,
    reloadTree,
  } = useGitHubRepo();

  const {
    width: sidebarWidth,
    isOpen: isSidebarOpen,
    isResizing,
    startResizing,
    toggleSidebar,
  } = useResizableSidebar();

  const [searchQuery, setSearchQuery] = useState('');
  const { searchResults, totalCount, matchedCount } = useMarkdownSearch(
    files,
    target,
    searchQuery
  );

  return (
    <AppLayout
      header={
        <Header
          target={target}
          onChangeRepository={changeRepository}
          onRefresh={reloadTree}
          isLoading={isTreeLoading}
          fileCount={files.length}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
      }
      sidebar={
        <Sidebar
          width={sidebarWidth}
          isOpen={isSidebarOpen}
          searchResults={searchResults}
          selectedPath={selectedFilePath}
          onSelectFile={selectFile}
          isLoading={isTreeLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={totalCount}
          matchedCount={matchedCount}
        />
      }
      resizer={
        isSidebarOpen ? (
          <SidebarResizer onPointerDown={startResizing} isResizing={isResizing} />
        ) : null
      }
      viewer={
        <MarkdownViewer
          filePath={selectedFilePath}
          content={currentContent}
          target={target}
          isLoading={isFileLoading}
          error={error}
          onSelectFile={selectFile}
        />
      }
    />
  );
}

export default App;
