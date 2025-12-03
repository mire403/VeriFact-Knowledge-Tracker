import React from 'react';
import { Source } from '../types';
import { ExternalLink, Globe, ShieldCheck } from 'lucide-react';

interface SourceCardProps {
  source: Source;
  index: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, index }) => {
  const hostname = new URL(source.uri).hostname.replace('www.', '');

  return (
    <a
      href={source.uri}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group"
    >
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
          <Globe size={16} />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
            SOURCE {index + 1}
          </span>
          <span className="text-xs text-slate-500 truncate max-w-[120px]" title={hostname}>
            {hostname}
          </span>
        </div>
        
        <h4 className="text-sm font-medium text-slate-200 line-clamp-2 leading-relaxed group-hover:text-blue-200 transition-colors">
          {source.title}
        </h4>
      </div>

      <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
        <ExternalLink size={16} className="text-blue-400" />
      </div>
    </a>
  );
};