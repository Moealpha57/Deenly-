
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

// NOTE: This component uses `react-markdown` and `remark-gfm`.
// Ensure these are added to your project's dependencies.

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="text-sm md:text-base leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-slate-900 dark:text-slate-100" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-5 mb-2 text-slate-900 dark:text-slate-100 pb-1" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-bold mt-4 mb-1 text-slate-800 dark:text-slate-200" {...props} />,
          
          // Paragraphs
          p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
          
          // Lists
          ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-3 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-3 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,
          
          // Links
          a: ({node, ...props}) => <a className="text-brand-primary hover:underline font-medium break-all" target="_blank" rel="noopener noreferrer" {...props} />,
          
          // Blockquotes
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-brand-primary/50 pl-4 py-2 my-3 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-r-sm" {...props} />,
          
          // Code
          code: ({node, ...props}) => {
              // @ts-ignore - inline property exists on the component props from ReactMarkdown
              const {inline} = props;
              return inline 
                ? <code className="bg-slate-100 dark:bg-slate-700 rounded px-1.5 py-0.5 text-sm font-mono text-brand-dark dark:text-brand-light" {...props} />
                : <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto my-3 text-sm font-mono"><code {...props} /></pre>
          },
          
          // Emphasis
          strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
          
          // Table
          table: ({node, ...props}) => <div className="overflow-x-auto mb-4"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg" {...props} /></div>,
          th: ({node, ...props}) => <th className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider" {...props} />,
          td: ({node, ...props}) => <td className="px-3 py-2 whitespace-nowrap text-sm border-t border-slate-200 dark:border-slate-700" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
