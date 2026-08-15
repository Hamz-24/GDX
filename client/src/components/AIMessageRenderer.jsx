import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

const CodeBlock = ({ codeText, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 font-mono text-xs shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
          <Code size={13} /> {language || 'code'}
        </span>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed text-zinc-200">
        <code>{codeText}</code>
      </pre>
    </div>
  );
};

const formatInlineFormatting = (text) => {
  if (!text) return text;

  // Split text by code ticks, bold, and italic markers
  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  // Regex to match inline code (`code`), bold (**text**), and italic (*text*)
  const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
  const matches = [...remaining.matchAll(inlineRegex)];

  if (matches.length === 0) {
    return text;
  }

  let lastIndex = 0;
  matches.forEach((match) => {
    const matchText = match[0];
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push(remaining.substring(lastIndex, matchIndex));
    }

    if (matchText.startsWith('`') && matchText.endsWith('`')) {
      const codeVal = matchText.slice(1, -1);
      parts.push(
        <code
          key={`code-${keyIdx++}`}
          className="px-1.5 py-0.5 mx-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-mono text-xs rounded-md border border-amber-200/50 dark:border-amber-800/40"
        >
          {codeVal}
        </code>
      );
    } else if (
      (matchText.startsWith('**') && matchText.endsWith('**')) ||
      (matchText.startsWith('__') && matchText.endsWith('__'))
    ) {
      const boldVal = matchText.slice(2, -2);
      parts.push(
        <strong key={`bold-${keyIdx++}`} className="font-extrabold text-zinc-900 dark:text-white">
          {formatInlineFormatting(boldVal)}
        </strong>
      );
    } else if (
      (matchText.startsWith('*') && matchText.endsWith('*')) ||
      (matchText.startsWith('_') && matchText.endsWith('_'))
    ) {
      const italicVal = matchText.slice(1, -1);
      parts.push(
        <em key={`italic-${keyIdx++}`} className="italic text-zinc-800 dark:text-zinc-200">
          {formatInlineFormatting(italicVal)}
        </em>
      );
    }

    lastIndex = matchIndex + matchText.length;
  });

  if (lastIndex < remaining.length) {
    parts.push(remaining.substring(lastIndex));
  }

  return parts;
};

const AIMessageRenderer = ({ text = '' }) => {
  if (!text || typeof text !== 'string') return null;

  // Split into code blocks vs non-code blocks
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const blocks = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    blocks.push({ type: 'code', language: match[1] || 'plaintext', content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    blocks.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return (
    <div className="space-y-3 font-sans text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
      {blocks.map((block, blockIdx) => {
        if (block.type === 'code') {
          return <CodeBlock key={`code-block-${blockIdx}`} codeText={block.content} language={block.language} />;
        }

        // Process Markdown lines
        const lines = block.content.split('\n');
        const elements = [];
        let currentList = null;
        let listType = null; // 'ul' or 'ol'
        let elementKey = 0;

        const flushList = () => {
          if (currentList && currentList.length > 0) {
            if (listType === 'ol') {
              elements.push(
                <ol key={`ol-${elementKey++}`} className="list-decimal pl-5 space-y-1.5 my-2.5 font-medium">
                  {currentList.map((li, i) => (
                    <li key={i}>{formatInlineFormatting(li)}</li>
                  ))}
                </ol>
              );
            } else {
              elements.push(
                <ul key={`ul-${elementKey++}`} className="list-disc pl-5 space-y-1.5 my-2.5 font-medium">
                  {currentList.map((li, i) => (
                    <li key={i}>{formatInlineFormatting(li)}</li>
                  ))}
                </ul>
              );
            }
            currentList = null;
            listType = null;
          }
        };

        lines.forEach((line) => {
          const trimmed = line.trim();

          if (!trimmed) {
            flushList();
            return;
          }

          // Check Headings (#, ##, ###, ####)
          if (trimmed.startsWith('#')) {
            flushList();
            const level = (trimmed.match(/^#+/) || ['#'])[0].length;
            const headingText = trimmed.replace(/^#+\s*/, '');

            if (level === 1) {
              elements.push(
                <h1 key={`h1-${elementKey++}`} className="text-xl font-extrabold font-display text-zinc-900 dark:text-white mt-4 mb-2 tracking-tight">
                  {formatInlineFormatting(headingText)}
                </h1>
              );
            } else if (level === 2) {
              elements.push(
                <h2 key={`h2-${elementKey++}`} className="text-lg font-bold font-display text-zinc-900 dark:text-white mt-3.5 mb-1.5 tracking-tight">
                  {formatInlineFormatting(headingText)}
                </h2>
              );
            } else {
              elements.push(
                <h3 key={`h3-${elementKey++}`} className="text-base font-bold font-display text-amber-600 dark:text-amber-400 mt-3 mb-1">
                  {formatInlineFormatting(headingText)}
                </h3>
              );
            }
            return;
          }

          // Check Blockquotes (> quote)
          if (trimmed.startsWith('>')) {
            flushList();
            const quoteText = trimmed.replace(/^>\s*/, '');
            elements.push(
              <blockquote key={`bq-${elementKey++}`} className="border-l-4 border-amber-400 dark:border-amber-500 pl-3.5 py-1.5 my-2.5 bg-amber-50/60 dark:bg-amber-950/40 text-zinc-800 dark:text-zinc-200 rounded-r-xl italic">
                {formatInlineFormatting(quoteText)}
              </blockquote>
            );
            return;
          }

          // Check Numbered Lists (1. item, 2. item)
          const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (olMatch) {
            if (listType !== 'ol') {
              flushList();
              listType = 'ol';
              currentList = [];
            }
            currentList.push(olMatch[2]);
            return;
          }

          // Check Unordered Bullet Lists (- item, * item, • item)
          const ulMatch = trimmed.match(/^[-*•]\s+(.*)/);
          if (ulMatch) {
            if (listType !== 'ul') {
              flushList();
              listType = 'ul';
              currentList = [];
            }
            currentList.push(ulMatch[1]);
            return;
          }

          // Normal Paragraph Line
          flushList();
          elements.push(
            <p key={`p-${elementKey++}`} className="mb-2 leading-relaxed">
              {formatInlineFormatting(line)}
            </p>
          );
        });

        flushList();
        return <div key={`block-${blockIdx}`}>{elements}</div>;
      })}
    </div>
  );
};

export default AIMessageRenderer;
