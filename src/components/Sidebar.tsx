/**
 * @file components/Sidebar.tsx
 * @description Defines the main application navigation sidebar, handling view selection and user logout.
 * @created June 10, 2025. 10:15 a.m. Eastern Time
 * @updated June 10, 2025. 10:15 a.m. Eastern Time - Revised documentation for LLM conciseness.
 * 
 * @architectural-context
 * Layer: UI Component (Primary Navigation)
 * Dependencies: React, ../types (View), ../constants (NAV_ITEMS, APP_TITLE), ./icons/IconComponents, ../contexts/AppContext (for logout)
 * Pattern: Navigation menu interacting with App-level view state and authentication context.
 * 
 * @workflow-context  
 * User Journey: Application-wide navigation, User Logout.
 * Sequence Position: Persistently displayed on the left in the main authenticated layout.
 * Inputs: `activeView` prop (current view), `setActiveView` prop (view change callback), user interactions.
 * Outputs: Renders navigation links, triggers view changes, initiates logout.
 * 
 * @authentication-context
 * Security: Logout action clears session token via AppContext.
 * 
 * @mock-data-context N/A
 */
import React from 'react';
import { View } from '../types';
import { NAV_ITEMS, APP_TITLE } from '../constants';
import { DashboardIcon, UploadIcon, TuneIcon, AppLogoIcon } from './icons/IconComponents';
import { useAppContext } from '../contexts/AppContext';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const iconMap: Record<View, React.FC<{className?: string}>> = {
    [View.DASHBOARD]: DashboardIcon,
    [View.LOADER]: UploadIcon,
    [View.CURATION]: TuneIcon,
};

/**
 * @component LogoutIcon
 * @description Renders an SVG icon for the logout action.
 * @param {{ className?: string }} props - Optional styling.
 * @returns {JSX.Element}
 * @accessibility Decorative icon, `aria-hidden="true"`.
 */
const LogoutIcon: React.FC<{className?: string}> = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

/**
 * @component Sidebar
 * @description Application sidebar for navigation and logout.
 * @param {SidebarProps} props - Controls active view and view switching.
 * @returns {JSX.Element}
 * @accessibility Navigation items use ARIA-like patterns for active state and focus.
 */
const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { logout } = useAppContext(); 

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    logout();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col flex-shrink-0 justify-between">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <AppLogoIcon />
          <h1 className="text-xl font-bold text-slate-900">{APP_TITLE}</h1>
        </div>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const IconComponent = iconMap[item.id as View];
            const isActive = activeView === item.id;
            return (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView(item.id as View);
                }}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold focus:ring-indigo-300' 
                    : 'text-slate-600 hover:bg-slate-100 font-medium focus:ring-slate-300'
                  }`}
                aria-current={isActive ? 'page' : undefined} // Accessibility: Indicate current page
              >
                {IconComponent && <IconComponent className="h-5 w-5" aria-hidden="true" />}
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
      
      {/* Logout Button */}
      <div className="mt-auto pt-6 border-t border-slate-200">
        <a
          href="#"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-300"
          role="button" // Accessibility: Indicate this link acts as a button
        >
          <LogoutIcon className="h-5 w-5" aria-hidden="true" />
          Logout
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;