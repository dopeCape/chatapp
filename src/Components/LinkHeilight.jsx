import React from 'react';
export default function LinkHighlighter({ text }) {
  //when i wrote this only god and i understood what i was doing
  // Now, only god knows...
  const urlRegex = /(?:(?:https?:\/\/)|(?:www\.))\S+/gi;
  const urlMatches = text.match(urlRegex);

  const renderHighlightedText = () => {
    if (!urlMatches) {
      return <span>{text}</span>;
    }

    const renderedText = [];
    let currentIndex = 0;

    urlMatches.forEach(urlMatch => {
      const urlIndex = text.indexOf(urlMatch, currentIndex);

      if (urlIndex !== currentIndex) {
        const normalText = text.substring(currentIndex, urlIndex);
        renderedText.push(<span key={currentIndex}>{normalText}</span>);
      }

      let url = urlMatch;
      if (!urlMatch.startsWith('http://') && !urlMatch.startsWith('https://')) {
        url = `https://${urlMatch}`;
      }
      renderedText.push(
        <a
          key={urlIndex}
          href={url}
          style={{ color: '#4D96DA', fontWeight: 'bold' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          {urlMatch}
        </a>
      );

      currentIndex = urlIndex + urlMatch.length;
    });

    if (currentIndex < text.length) {
      const normalText = text.substring(currentIndex);
      renderedText.push(<span key={currentIndex}>{normalText}</span>);
    }

    return renderedText;
  };

  return <div>{renderHighlightedText()}</div>;
}
