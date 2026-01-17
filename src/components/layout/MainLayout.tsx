import React from 'react';
import { Sidebar } from './Sidebar';
import { useNav } from '../../App'; // Import from App
import './Layout.css';

interface MainLayoutProps {
    children: React.ReactNode;
    rightPanel?: React.ReactNode;
    activeTab?: string; // Optional override
    onTabChange?: (tab: string) => void; // Optional override
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    rightPanel,
    activeTab: propsActiveTab,
    onTabChange: propsOnTabChange
}) => {
    // Try to use context, fallback to props or default
    let activeTab = propsActiveTab;
    let onTabChange = propsOnTabChange;

    try {
        const nav = useNav();
        if (!propsActiveTab) activeTab = nav.activeTab;
        if (!propsOnTabChange) onTabChange = nav.setActiveTab;
    } catch (e) {
        // Context not available (e.g. testing), stick to props
    }

    return (
        <div className="layout-wrapper">
            <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
            <div className="main-container">
                <main className="main-content">
                    {children}
                </main>
                {rightPanel && (
                    <aside className="right-panel">
                        {rightPanel}
                    </aside>
                )}
            </div>
        </div>
    );
};
