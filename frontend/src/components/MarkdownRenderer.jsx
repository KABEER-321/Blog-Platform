import React from 'react';

const MarkdownRenderer = ({ content = '' }) => {
  if (!content) return null;

  // Split by double newlines to parse blocks
  const blocks = content.split(/\n\n+/);

  const renderInline = (text) => {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic (*text*)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Inline Code (`code`)
    html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 text-indigo-650 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>');

    // Links ([text](url))
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-650 hover:underline font-bold">$1</a>');

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="space-y-4 text-gray-800 leading-relaxed text-base font-medium">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Code block
        if (trimmed.startsWith('```')) {
          const lines = trimmed.split('\n');
          const codeLines = lines.slice(1, lines.length - (lines[lines.length - 1].startsWith('```') ? 1 : 0));
          return (
            <pre key={index} className="overflow-x-auto rounded-xl border border-gray-150 bg-gray-50 p-4 text-xs font-mono text-gray-800 my-4 shadow-inner">
              <code>{codeLines.join('\n')}</code>
            </pre>
          );
        }

        // Heading 1 (# title)
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={index} className="text-2xl sm:text-3xl font-black text-gray-950 mt-6 mb-2 font-serif-display border-b border-gray-100 pb-2">
              {renderInline(trimmed.substring(2))}
            </h1>
          );
        }

        // Heading 2 (## title)
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl sm:text-2xl font-black text-gray-950 mt-5 mb-2 font-serif-display">
              {renderInline(trimmed.substring(3))}
            </h2>
          );
        }

        // Heading 3 (### title)
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg sm:text-xl font-black text-gray-950 mt-4 mb-2">
              {renderInline(trimmed.substring(4))}
            </h3>
          );
        }

        // Blockquotes or GitHub-style alerts (e.g. > [!NOTE])
        if (trimmed.startsWith('>')) {
          const lines = trimmed.split('\n');
          const cleanedText = lines.map(line => line.replace(/^>\s*/, '')).join('\n');
          
          let alertType = 'quote';
          let bodyText = cleanedText;
          
          if (cleanedText.startsWith('[!NOTE]')) {
            alertType = 'note';
            bodyText = cleanedText.substring(7).trim();
          } else if (cleanedText.startsWith('[!WARNING]')) {
            alertType = 'warning';
            bodyText = cleanedText.substring(10).trim();
          }

          const borderStyle = alertType === 'note' ? 'border-indigo-500 bg-indigo-50/30' :
                              alertType === 'warning' ? 'border-amber-500 bg-amber-50/30' :
                              'border-gray-300 bg-gray-50';

          return (
            <blockquote key={index} className={`border-l-4 p-4 rounded-r-xl my-4 text-sm font-semibold text-gray-700 leading-relaxed ${borderStyle}`}>
              {alertType !== 'quote' && (
                <div className={`text-xs font-black uppercase mb-1 ${alertType === 'note' ? 'text-indigo-650' : 'text-amber-700'}`}>
                  {alertType}
                </div>
              )}
              {renderInline(bodyText)}
            </blockquote>
          );
        }

        // Bullet lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const lines = trimmed.split('\n');
          return (
            <ul key={index} className="list-disc pl-6 space-y-1.5 my-3">
              {lines.map((line, lIdx) => {
                const itemText = line.replace(/^[-*]\s+/, '');
                return <li key={lIdx}>{renderInline(itemText)}</li>;
              })}
            </ul>
          );
        }

        // Default Paragraph block
        return (
          <p key={index} className="my-3 text-gray-650 text-base leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;
