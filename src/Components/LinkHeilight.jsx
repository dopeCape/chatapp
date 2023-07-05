import React, { useEffect, useState } from 'react';
export default function LinkHighlighter({ text_, currentUser }) {
  const [text, setText] = useState(text_);
  useEffect(() => {
    setText(text_);
  }, [text_]);
  const mentionRegex = /@(\w+)\[(\w+(?:,\w+)*)\]/g;
  const mentionMatches = text.match(mentionRegex);

  const urlRegex = /(?:(?:https?:\/\/)|(?:www\.))\S+/gi;
  const urlMatches = text.match(urlRegex);

  const renderHighlightedText = () => {
    if (!mentionMatches && !urlMatches) {
      return <span>{text}</span>;
    }

    const renderedText = [];
    let currentIndex = 0;

    const allMatches = [...(mentionMatches || []), ...(urlMatches || [])];
    allMatches.sort((a, b) => text.indexOf(a) - text.indexOf(b));

    allMatches.forEach(match => {
      const matchIndex = text.indexOf(match, currentIndex);

      if (matchIndex !== currentIndex) {
        const normalText = text.substring(currentIndex, matchIndex);
        renderedText.push(<span key={currentIndex}>{normalText}</span>);
      }

      if (mentionMatches && mentionMatches.includes(match)) {
        const mentionRegex = /@(\w+)\[(\w+(?:,\w+)*)\]/;
        const mentionMatchResult = mentionRegex.exec(match);
        if (mentionMatchResult) {
          const mentionUserName = mentionMatchResult[1];
          const mentionUserIds = mentionMatchResult[2].split(',');
          const isCurrentUserMentioned = mentionUserIds.includes(currentUser) || mentionUserIds.includes('1234565');
          renderedText.push(
            <span
              key={matchIndex}
              style={{
                color: `${isCurrentUserMentioned ? '#e3d77d' : '#4D96DA'}`
              }}
            >
              @{mentionUserName}
            </span>
          );
        } else {
          renderedText.push(<span key={matchIndex}>{match}</span>);
        }
      } else if (urlMatches && urlMatches.includes(match)) {
        let url = match;
        if (!match.startsWith('http://') && !match.startsWith('https://')) {
          url = `https://${match}`;
        }

        renderedText.push(
          <a
            key={matchIndex}
            href={url}
            style={{ color: '#4D96DA', fontWeight: 'bold' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {match}
          </a>
        );
      }

      currentIndex = matchIndex + match.length;
    });

    if (currentIndex < text.length) {
      const normalText = text.substring(currentIndex);
      renderedText.push(<span key={currentIndex}>{normalText}</span>);
    }

    return renderedText;
  };

  return <div>{renderHighlightedText()}</div>;
}
