'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Activity } from 'lucide-react'; // Re-enable icon

// It's good practice to type the data prop for your custom nodes
interface EventNodeData {
  label: string;
}

const EventNode: React.FC<NodeProps<EventNodeData>> = ({ data, isConnectable }) => {
  // Determine if dark mode is active. This is a common way but might need adjustment
  // based on how your app handles dark mode toggling if it's not via class on <html>.
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const nodeStyles = {
    light: {
      background: '#fff3e0', // Light parchment
      borderColor: '#ffcc80',
      textColor: '#78350F',  // Dark amber/brown text
      iconColor: 'text-amber-700'
    },
    dark: {
      background: '#451a03', // Darker amber/brown background (adjust as needed)
      borderColor: '#a16207', // Muted amber border (adjust as needed)
      textColor: '#fffbeb',  // Very light cream/yellow text
      iconColor: 'text-amber-300'
    }
  };

  const currentStyle = isDarkMode ? nodeStyles.dark : nodeStyles.light;

  return (
    <div 
      style={{
        background: currentStyle.background,
        border: `1px solid ${currentStyle.borderColor}`,
        borderRadius: '8px',
        padding: '10px 15px',
        minWidth: '150px',
        textAlign: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      }}
      // className="dark:bg-amber-800/50 dark:border-amber-700" // Tailwind for dark bg/border removed as inline styles now handle it
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ background: '#555' }} />
      <div className="flex items-center justify-center gap-2">
        <Activity size={16} className={currentStyle.iconColor} />
        <strong 
          className="font-semibold"
          style={{ color: currentStyle.textColor }}
        >
          {data.label || 'Event'}
        </strong>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ background: '#555' }} />
    </div>
  );
};

export default EventNode; 