import React, { useRef } from 'react';

const HighlightableText = ({ text, onTextSelect, highlights = [], onHighlightClick }) => {
  const textRef = useRef(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText && selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      onTextSelect && onTextSelect(selectedText, { x: rect.left + rect.width / 2, y: rect.top });
    }
  };

  const handleClick = (e) => {
    if (!window.getSelection().toString()) {
      const clickX = e.clientX;
      const clickY = e.clientY;
      const range = document.caretRangeFromPoint
        ? document.caretRangeFromPoint(clickX, clickY)
        : document.caretPositionFromPoint
        ? (() => {
            const pos = document.caretPositionFromPoint(clickX, clickY);
            if (!pos) return null;
            const r = document.createRange();
            r.setStart(pos.offsetNode, pos.offset);
            r.setEnd(pos.offsetNode, pos.offset);
            return r;
          })()
        : null;
      if (range) {
        const textNode = range.startContainer;
        if (textNode.nodeType === Node.TEXT_NODE) {
          const text = textNode.textContent;
          const offset = range.startOffset;
          let start = offset;
          let end = offset;
          while (start > 0 && !/\s|[.,!?;:()[\]{}=+\-*/]/.test(text[start - 1])) start--;
          while (end < text.length && !/[.!?;\n]/.test(text[end])) end++;
          if (end < text.length && /[.!?;]/.test(text[end])) end++;
          const selectedText = text.substring(start, end).trim();
          if (selectedText.length > 1) {
            const newRange = document.createRange();
            newRange.setStart(textNode, start);
            newRange.setEnd(textNode, end);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(newRange);
            const rect = newRange.getBoundingClientRect();
            onTextSelect && onTextSelect(selectedText, { x: rect.left + rect.width / 2, y: rect.top });
          }
        }
      }
    }
  };

  const renderTextWithHighlights = () => {
    if (!highlights.length) {
      return (
        <div
          ref={textRef}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          className="cursor-pointer select-text leading-relaxed"
          style={{ lineHeight: '1.8' }}
        >
          {text.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-800">
              {paragraph}
            </p>
          ))}
        </div>
      );
    }

    return (
      <div
        ref={textRef}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        className="cursor-pointer select-text leading-relaxed"
        style={{ lineHeight: '1.8' }}
      >
        {text.split('\n').map((paragraph, pIndex) => {
          let parts = [paragraph];
          highlights.forEach((highlight, hIndex) => {
            parts = parts.flatMap(part => {
              if (typeof part !== 'string') return [part];
              const index = part.indexOf(highlight.text);
              if (index === -1) return [part];
              return [
                part.substring(0, index),
                <mark
                  key={`${pIndex}-${hIndex}`}
                  className={`${highlight.color} underline decoration-blue-500 underline-offset-2 cursor-pointer rounded px-1 hover:shadow-sm transition-shadow relative`}
                  onClick={e => {
                    e.stopPropagation();
                    onHighlightClick && onHighlightClick(highlight);
                  }}
                  onMouseEnter={e => {
                    if (highlight.note) {
                      const tooltip = document.createElement('div');
                      tooltip.className = 'absolute left-1/2 top-full mt-2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-pre-line min-w-[120px] max-w-xs pointer-events-none';
                      tooltip.innerText = highlight.note;
                      tooltip.setAttribute('data-tooltip', '');
                      e.currentTarget.appendChild(tooltip);
                    }
                  }}
                  onMouseLeave={e => {
                    const tooltip = e.currentTarget.querySelector('[data-tooltip]');
                    if (tooltip) e.currentTarget.removeChild(tooltip);
                  }}
                >
                  {highlight.text}
                </mark>,
                part.substring(index + highlight.text.length)
              ];
            });
          });
          return (
            <p key={pIndex} className="mb-4 text-gray-800">
              {parts}
            </p>
          );
        })}
      </div>
    );
  };

  return renderTextWithHighlights();
};

export default HighlightableText; 