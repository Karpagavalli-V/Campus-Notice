import React from 'react';

const MarkdownContent = ({ content }) => {
    if (!content) return null;

    // Simple regex-based markdown-lite parser
    const parseMarkdown = (text) => {
        let html = text
            // Escape HTML to prevent XSS (basic)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // Bold: **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic: *text*
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Bullet points: - text (at start of line)
            .replace(/^-\s(.*)$/gm, '<li>$1</li>')
            // Links: [text](url)
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Line breaks
            .replace(/\n/g, '<br />');

        // Wrap lists
        if (html.includes('<li>')) {
            // This is a bit naive but works for simple lists
            // Split by <br /> and check if segment starts with <li>
            const lines = html.split('<br />');
            let inList = false;
            const processedLines = lines.map(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('<li>') && !inList) {
                    inList = true;
                    return '<ul>' + line;
                } else if (!trimmed.startsWith('<li>') && inList) {
                    inList = false;
                    return '</ul>' + line;
                }
                return line;
            });
            if (inList) processedLines[processedLines.length - 1] += '</ul>';
            html = processedLines.join('<br />');
        }

        return { __html: html };
    };

    return (
        <div
            className="markdown-content"
            dangerouslySetInnerHTML={parseMarkdown(content)}
        />
    );
};

export default MarkdownContent;
