'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Activity } from 'lucide-react'; // Re-enable icon
import { NodeResizer } from '@reactflow/node-resizer'; // Import NodeResizer
import '@reactflow/node-resizer/dist/style.css'; // Import NodeResizer CSS

// It's good practice to type the data prop for your custom nodes
interface EventNodeData {
  label: string;
}

const EventNode: React.FC<NodeProps<EventNodeData>> = ({ data, isConnectable, selected }) => {
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
        padding: '8px 12px', // Slightly reduced overall padding
        width: '100%', // Fill the resizer controlled area
        height: '100%', // Fill the resizer controlled area
        textAlign: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', // Prevent content spillover during resize
      }}
      // className="dark:bg-amber-800/50 dark:border-amber-700" // Tailwind for dark bg/border removed as inline styles now handle it
    >
      <NodeResizer
        isVisible={selected}
        minWidth={80}  // Reduced minWidth
        minHeight={40} // Reduced minHeight
        keepAspectRatio={false}
        lineClassName="border-blue-500"
        handleClassName="bg-blue-500 h-2 w-2 rounded-full"
      />
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ background: '#555' }} />
      <div className="flex items-center justify-center gap-x-1.5 w-full" style={{ minWidth: 0 }}> {/* gap-x-1.5 is 6px */}
        <Activity size={14} className={`${currentStyle.iconColor} flex-shrink-0`} />
        <strong
          className="font-semibold text-xs whitespace-nowrap overflow-hidden text-ellipsis flex-grow"
          style={{ color: currentStyle.textColor }}
          title={data.label || 'Event'} // Show full label on hover
        >
          {data.label || 'Event'}
        </strong>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ background: '#555' }} />
    </div>
  );
};

export default EventNode; 