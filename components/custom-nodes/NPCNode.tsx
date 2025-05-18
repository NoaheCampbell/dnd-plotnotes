'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User } from 'lucide-react'; // Icon for NPCs

interface NPCNodeData {
  label: string;
  // Potentially add npcId?: string or other NPC-specific data fields
}

const NPCNode: React.FC<NodeProps<NPCNodeData>> = ({ data, isConnectable, selected }) => {
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const npcNodeStyles = {
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
    }
  };

  const currentStyle = isDarkMode ? npcNodeStyles.dark : npcNodeStyles.light;

  return (
    <div 
      style={{
        background: currentStyle.background,
        border: `2px solid ${currentStyle.borderColor}`,
        borderRadius: '50%', // Makes it a circle
        width: '120px',     // Fixed width for a circle
        height: '120px',    // Fixed height for a circle
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '10px',
        boxShadow: selected ? '0 0 0 2px #38bdf8' : '0 2px 5px rgba(0,0,0,0.1)', // Highlight if selected
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable} 
        style={{ background: '#555', top: '-5px' }} // Adjust handle position for circle
      />
      <User size={24} className={currentStyle.iconColor} />
      <strong 
        className="font-semibold mt-1 text-sm break-words"
        style={{ color: currentStyle.textColor, maxWidth: '100px' }} // Ensure text wraps
      >
        {data.label || 'NPC'}
      </strong>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable} 
        style={{ background: '#555', bottom: '-5px' }} // Adjust handle position for circle
      />
    </div>
  );
};

export default NPCNode; 