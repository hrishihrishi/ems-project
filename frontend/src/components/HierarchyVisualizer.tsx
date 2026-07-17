import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, ShieldCheck } from 'lucide-react';

interface TreeNode {
  id: string;
  name: string;
  designation: string;
  profileImage?: string;
  reportees: TreeNode[];
}

interface NodeProps {
  node: TreeNode;
  depth: number;
}

const TreeNodeItem: React.FC<NodeProps> = ({ node, depth }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasReports = node.reportees && node.reportees.length > 0;

  return (
    <div className="ml-6 my-2 relative">
      {/* Decorative Structural Guide Lines linking elements together */}
      {depth > 0 && (
        <div className="absolute -left-4 top-0 bottom-0 border-l-2 border-slate-200 dark:border-slate-800" />
      )}
      <div className="absolute -left-4 top-5 w-4 border-t-2 border-slate-200 dark:border-slate-800" />

      <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm max-w-sm hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-200 relative z-10">
        {hasReports ? (
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="p-1 text-slate-300 dark:text-slate-700">
            <User className="w-4 h-4" />
          </div>
        )}

        {node.profileImage ? (
          <img src={node.profileImage} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm ring-2 ring-slate-100 dark:ring-slate-800">
            {node.name.charAt(0)}
          </div>
        )}

        <div>
          <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            {node.name}
            {depth === 0 && <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" title="Top Tier Node" />}
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{node.designation}</p>
        </div>
      </div>

      {/* Recursive Render Engine Branch Execution */}
      {hasReports && isExpanded && (
        <div className="mt-1">
          {node.reportees.map((subNode) => (
            <TreeNodeItem key={subNode.id} node={subNode} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const HierarchyVisualizer: React.FC<{ treeData: TreeNode[] }> = ({ treeData }) => {
  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto min-h-[500px]">
      <div className="inline-block min-w-full">
        {treeData.length > 0 ? (
          treeData.map((rootNode) => (
            <TreeNodeItem key={rootNode.id} node={rootNode} depth={0} />
          ))
        ) : (
          <p className="text-sm text-slate-400 p-4 text-center">
            No organization hierarchy links mapped down to current active nodes context.
          </p>
        )}
      </div>
    </div>
  );
};