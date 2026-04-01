import type { FC, ReactNode } from 'react';
import { createContext, useContext } from 'react';

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = (): TabsContextValue => {
  const context = useContext(TabsContext);

  if (!context) throw new Error('Tabs components must be used inside <Tabs>');

  return context;
};

export const Tabs: FC<{
  activeTab: string;
  children: ReactNode;
  onTabChange: (tab: string) => void;
}> = ({ activeTab, onTabChange, children }) => (
  <TabsContext.Provider value={{ activeTab, setActiveTab: onTabChange }}>
    {children}
  </TabsContext.Provider>
);

export const TabsList: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="flex gap-1 border-b border-gray-200 mb-4">
    {children}
  </div>
);

export const TabsTrigger: FC<{ children: ReactNode; value: string }> = ({
  value,
  children,
}) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        isActive
          ? 'border-gray-900 text-gray-900'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
};

export const TabsContent: FC<{ children: ReactNode; value: string }> = ({
  value,
  children,
}) => {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return <>{children}</>;
};
