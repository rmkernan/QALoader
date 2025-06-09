/**
 * @file components/icons/IconComponents.tsx
 * @description Provides reusable SVG icon components for the application UI.
 * @created June 8, 2025. 9:30 p.m. Eastern Time
 * @updated June 9, 2025. 1:02 p.m. Eastern Time - Applied LLM-focused documentation standards.
 * 
 * @architectural-context
 * Layer: UI Utility (Icon Library)
 * Dependencies: react
 * Pattern: Stateless Functional Components for SVG rendering.
 * 
 * @workflow-context  
 * User Journey: N/A (Supports various UI elements across user journeys)
 * Sequence Position: N/A
 * Inputs: Optional `className` prop for styling.
 * Outputs: SVG elements.
 * 
 * @authentication-context N/A
 * @mock-data-context N/A
 */
import React from 'react';

/**
 * @interface IconProps
 * @description Common properties for icon components.
 * @property {string} [className] - Optional CSS classes for the SVG element.
 */
interface IconProps {
  className?: string;
}

/**
 * @component DashboardIcon
 * @description Renders a dashboard/home icon.
 * @param {IconProps} props - Component props.
 * @returns {JSX.Element}
 * @usage `<DashboardIcon className="h-6 w-6" />`
 * @accessibility `aria-hidden="true"` used as icon is decorative.
 */
export const DashboardIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 10.707V18a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 01-1 1H3a1 1 0 01-1-1V10.707a1 1 0 01.293-.707l7-7z" clipRule="evenodd" />
  </svg>
);

/**
 * @component UploadIcon
 * @description Renders an upload icon.
 * @param {IconProps} props - Component props.
 * @returns {JSX.Element}
 * @usage `<UploadIcon className="h-6 w-6" />`
 * @accessibility `aria-hidden="true"` used as icon is decorative.
 */
export const UploadIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
  </svg>
);

/**
 * @component TuneIcon
 * @description Renders a tune/settings/curation icon.
 * @param {IconProps} props - Component props.
 * @returns {JSX.Element}
 * @usage `<TuneIcon className="h-6 w-6" />`
 * @accessibility `aria-hidden="true"` used as icon is decorative.
 */
export const TuneIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 3.75a2 2 0 100 4 2 2 0 000-4zM4.167 6.375a.625.625 0 01.625-.625h10.416a.625.625 0 010 1.25H4.792a.625.625 0 01-.625-.625zM4.167 11.375a.625.625 0 01.625-.625h10.416a.625.625 0 010 1.25H4.792a.625.625 0 01-.625-.625zM10 13.75a2 2 0 100 4 2 2 0 000-4z" />
  </svg>
);

/**
 * @component AppLogoIcon
 * @description Renders a generic application logo.
 * @param {IconProps} props - Component props.
 * @returns {JSX.Element}
 * @usage `<AppLogoIcon className="h-8 w-8" />`
 * @accessibility `aria-hidden="true"` used as icon is decorative.
 */
export const AppLogoIcon: React.FC<IconProps> = ({ className = "h-8 w-8" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 16.5L5.75 12.75l1.41-1.41L9.5 13.67l5.84-5.83L16.75 9.25 9.5 16.5z" clipRule="evenodd" />
    {/* Simplified generic checkmark in circle logo */}
  </svg>
);


/**
 * @component PlusIcon
 * @description Renders a plus icon.
 * @param {IconProps} props - Component props.
 * @returns {JSX.Element}
 * @usage `<PlusIcon className="h-5 w-5" />`
 * @accessibility `aria-hidden="true"` used as icon is decorative.
 */
export const PlusIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

/**
 * @component DownloadIcon
 * @description Renders a download icon.
 * @param {IconProps} props - Component props.
 * @returns {JSX.Element}
 * @usage `<DownloadIcon className="h-5 w-5" />`
 * @accessibility `aria-hidden="true"` used as icon is decorative.
 */
export const DownloadIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

/**
 * @component EditIcon
 * @description Renders an edit (pencil) icon.
 * @param {IconProps} props - Component props.
 * @returns {JSX.Element}
 * @usage `<EditIcon className="h-5 w-5" />`
 * @accessibility `aria-hidden="true"` used as icon is decorative.
 */
export const EditIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

/**
 * @component DeleteIcon
 * @description Renders a delete (trash can) icon.
 * @param {IconProps} props - Component props.
 * @returns {JSX.Element}
 * @usage `<DeleteIcon className="h-5 w-5" />`
 * @accessibility `aria-hidden="true"` used as icon is decorative.
 */
export const DeleteIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

/**
 * @component DuplicateIcon
 * @description Renders a duplicate (copy) icon.
 * @param {IconProps} props - Component props.
 * @returns {JSX.Element}
 * @usage `<DuplicateIcon className="h-5 w-5" />`
 * @accessibility `aria-hidden="true"` used as icon is decorative.
 */
export const DuplicateIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
    <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 002-2H5z" />
  </svg>
);

/**
 * @component ChevronDownIcon
 * @description Renders a chevron down icon.
 * @param {IconProps} props - Component props.
 * @returns {JSX.Element}
 * @usage `<ChevronDownIcon className="h-5 w-5" />`
 * @accessibility `aria-hidden="true"` used as icon is decorative.
 */
export const ChevronDownIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);
