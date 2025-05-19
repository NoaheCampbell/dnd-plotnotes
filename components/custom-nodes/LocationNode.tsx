'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MapPin } from 'lucide-react';
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';

interface LocationNodeData {
  label: string;
  // Add other location-specific fields if needed
}

const LocationNode: React.FC<NodeProps<LocationNodeData>> = ({ data, isConnectable, selected }) => {
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const nodeStyles = {
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
    }
  };

  const currentStyle = isDarkMode ? nodeStyles.dark : nodeStyles.light;

  const handleStyle = {
    width: 10,
    height: 10,
    background: '#555',
    border: `1.5px solid #fff`,
    borderRadius: '50%',
    zIndex: 10,
  };

  return (
    // This outer div is what React Flow controls (size, position). NodeResizer targets this.
    // It should be a simple rectangle, and NodeResizer will operate on it.
    <div 
      style={{
        width: '100%',
        height: '100%',
        position: 'relative', // For positioning inner elements and handles
        overflow: 'visible', // Ensure resizer handles are visible
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={60} // Reduced min width
        minHeight={60} // Reduced min height
        keepAspectRatio={false} 
        lineClassName={`border-2 ${isDarkMode ? 'border-green-400' : 'border-green-500'}`}
        handleClassName={`h-3 w-3 rounded-full border-2 ${isDarkMode ? 'bg-green-400 border-gray-800' : 'bg-green-500 border-white'}`}
      />
      {/* Handles are children of the outer div, positioned relative to it */}
      <Handle id="top" type="target" position={Position.Top} isConnectable={isConnectable} style={handleStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} isConnectable={isConnectable} style={handleStyle} />
      <Handle id="left" type="target" position={Position.Left} isConnectable={isConnectable} style={{...handleStyle, left: '-5px'}} />
      <Handle id="right" type="source" position={Position.Right} isConnectable={isConnectable} style={{...handleStyle, right: '-5px'}} />
      
      {/* This div is the "border" layer. Its background is the border color. */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: currentStyle.borderColor, // Border color as background
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Diamond shape
          position: 'relative', // For positioning the inner content div
          boxSizing: 'border-box',
          boxShadow: selected ? `0 0 0 1px ${currentStyle.borderColor}` : '0 1px 3px rgba(0,0,0,0.1)',
          // No explicit border or padding here
        }}
      >
        {/* This inner div is the actual content area, inset from the border layer */}
        <div 
          style={{
            position: 'absolute',
            top: '2px',      // Border thickness
            left: '2px',     // Border thickness
            right: '2px',    // Border thickness
            bottom: '2px',   // Border thickness
            background: currentStyle.background, // Actual node fill color
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Content area must also be clipped
            padding: '13px 6px', // Original padding (15px 8px) minus border (2px)
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div className="flex items-center justify-center gap-x-1.5 w-full" style={{ minWidth: 0 }}>
            <MapPin size={16} className={`${currentStyle.iconColor} flex-shrink-0`} />
            <strong
              className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis flex-grow"
              style={{ color: currentStyle.textColor }}
              title={data.label || 'Location'}
            >
              {data.label || 'Location'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationNode; 