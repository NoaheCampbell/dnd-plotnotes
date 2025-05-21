import { User, MapPin, FileText, Swords } from 'lucide-react';
import React from 'react';

export interface NodeStyleConfig {
  background: string;
  borderColor: string;
  textColor: string;
  iconColor: string; // Tailwind class for icon color
}

export interface NodeVisualConfig {
  type: 'npc' | 'location' | 'note' | 'encounter';
  light: NodeStyleConfig;
  dark: NodeStyleConfig;
  icon: React.ElementType;
  clipPath?: string;
  borderRadius?: string; // For shapes like rounded rectangle, circle (can also be achieved via clipPath)
  resizer: {
    minWidth: number;
    minHeight: number;
    keepAspectRatio: boolean;
    lineClassNameLight: string; // Specific classes for resizer line in light mode
    handleClassNameLight: string; // Specific classes for resizer handle in light mode
    lineClassNameDark: string; // Specific classes for resizer line in dark mode
    handleClassNameDark: string; // Specific classes for resizer handle in dark mode
  };
  padding: string;
  defaultLabel: string;
  // Specific data props can be handled by the ConfigurableNode or passed through if needed
  // For now, data.label is the primary one used by all. NoteNodeData has entity_links.
}

export const npcNodeConfig: NodeVisualConfig = {
  type: 'npc',
  light: {
    background: '#e0f2fe',  // Light sky blue
    borderColor: '#7dd3fc',  // Sky blue border
    textColor: '#0c4a6e',    // Dark sky blue text
    iconColor: 'text-sky-600'
  },
  dark: {
    background: '#082f49',  // Darker sky blue
    borderColor: '#0369a1',  // Medium sky blue border
    textColor: '#e0f2fe',    // Light sky blue text
    iconColor: 'text-sky-400'
  },
  icon: User,
  clipPath: 'circle(50% at 50% 50%)', // For the inner content divs primarily
  borderRadius: '50%', // Helps with anti-aliasing of clip-path for the content
  resizer: {
    minWidth: 40,
    minHeight: 40,
    keepAspectRatio: true,
    lineClassNameLight: 'border-2 border-sky-500', // Matching NPCNode
    handleClassNameLight: 'h-3 w-3 rounded-full border-2 bg-sky-500 border-white', // Matching NPCNode
    lineClassNameDark: 'border-2 border-sky-400', // Matching NPCNode
    handleClassNameDark: 'h-3 w-3 rounded-full border-2 bg-sky-400 border-gray-800', // Matching NPCNode
  },
  padding: '10px', // Adjusted padding for circle
  defaultLabel: 'NPC',
};

export const locationNodeConfig: NodeVisualConfig = {
  type: 'location',
  light: {
    background: '#f0fdf4',  // Light green
    borderColor: '#4ade80',  // Slightly more vibrant green border
    textColor: '#15803d',    // Dark green text
    iconColor: 'text-green-600'
  },
  dark: {
    background: '#14532d',  // Darker green
    borderColor: '#22c55e',  // Medium green border
    textColor: '#dcfce7',    // Light green text
    iconColor: 'text-green-400'
  },
  icon: MapPin,
  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Diamond shape
  resizer: {
    minWidth: 60,
    minHeight: 60,
    keepAspectRatio: false, // LocationNodes are not aspect-ratio locked
    lineClassNameLight: 'border-2 border-green-500', // Matching LocationNode
    handleClassNameLight: 'h-3 w-3 rounded-full border-2 bg-green-500 border-white', // Matching LocationNode
    lineClassNameDark: 'border-2 border-green-400',   // Matching LocationNode
    handleClassNameDark: 'h-3 w-3 rounded-full border-2 bg-green-400 border-gray-800', // Matching LocationNode
  },
  padding: '13px 6px', // Specific to diamond shape and border
  defaultLabel: 'Location',
};

export const noteNodeConfig: NodeVisualConfig = {
  type: 'note',
  light: {
    background: '#fffbeb', // Light amber/parchment
    borderColor: '#fde68a', // amber-200
    textColor: '#78350f',    // amber-800
    iconColor: 'text-amber-600'
  },
  dark: {
    background: '#451a03',  // Dark amber/brown (amber-950)
    borderColor: '#d97706',  // amber-600
    textColor: '#fef3c7',    // amber-100
    iconColor: 'text-amber-400'
  },
  icon: FileText,
  borderRadius: '8px', // Rounded rectangle
  resizer: {
    minWidth: 80,
    minHeight: 60,
    keepAspectRatio: false,
    lineClassNameLight: 'border-2 border-amber-400', // Matching NoteNode
    handleClassNameLight: 'h-3 w-3 rounded-full border-2 bg-amber-400 border-white', // Matching NoteNode
    lineClassNameDark: 'border-2 border-amber-500',   // Matching NoteNode
    handleClassNameDark: 'h-3 w-3 rounded-full border-2 bg-amber-500 border-gray-800', // Matching NoteNode
  },
  padding: '10px 15px',
  defaultLabel: 'Note',
};

export const encounterNodeConfig: NodeVisualConfig = {
  type: 'encounter',
  light: {
    background: '#fee2e2', // Light red (red-100)
    borderColor: '#fca5a5', // red-300
    textColor: '#991b1b',    // red-800
    iconColor: 'text-red-600'
  },
  dark: {
    background: '#450a0a',  // Dark red (red-950)
    borderColor: '#ef4444',  // red-500
    textColor: '#fecaca',    // red-200
    iconColor: 'text-red-400'
  },
  icon: Swords,
  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', // Hexagon shape
  resizer: {
    minWidth: 90,
    minHeight: 80,
    keepAspectRatio: false,
    lineClassNameLight: 'border-2 border-red-400', // Matching EncounterNode
    handleClassNameLight: 'h-3 w-3 rounded-full border-2 bg-red-400 border-white', // Matching EncounterNode
    lineClassNameDark: 'border-2 border-red-500',   // Matching EncounterNode
    handleClassNameDark: 'h-3 w-3 rounded-full border-2 bg-red-500 border-gray-800', // Matching EncounterNode
  },
  padding: '13px 18px', // Specific to hexagon shape and border
  defaultLabel: 'Encounter',
};

// Helper type for node data that ConfigurableNode will expect
export interface ConfigurableNodeData {
  label: string;
  entity_links?: Array<{ linked_entity_id: number, linked_entity_type: string }>; // For NoteNode
  // Add other potential shared or specific data fields here if necessary in the future
} 