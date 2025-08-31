import React from 'react';

export default function Result({ response }) {
  const file = response?.file ?? null;
  const text = response?.text ?? '';
  const analysis = response?.analysis ?? null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied!');
    } catch {
      alert('Copy failed.');
    }
  };

  const handleDownloadTxt = () => {
    const safeName = (file?.name || 'extracted').replace(/[^\w.-]+/g, '_');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `${safeName}.txt`,
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="result">
      {/* File Metadata */}
      <div className="card meta">
        <h3>File</h3>
        <div><b>Name:</b> {file?.name || '—'}</div>
        <div><b>Type:</b> {file?.type || '—'}</div>
        <div><b>Words:</b> {analysis?.wordCount ?? 0}</div>
        <div><b>Reading Time:</b> {analysis?.readingTime ?? 0} min</div>
        <div><b>Hashtags:</b> {analysis?.hashtags ?? 0}</div>
        <div><b>Mentions:</b> {analysis?.mentions ?? 0}</div>
        <div><b>Links:</b> {analysis?.urls ?? 0}</div>
      </div>

      {/* Extracted Text */}
      <div className="card text">
        <div className="toolbar">
          <h3>Extracted Text</h3>
          <div className="actions">
            <button onClick={handleCopy} type="button">Copy</button>
            <button onClick={handleDownloadTxt} type="button">Download .txt</button>
          </div>
        </div>
        <textarea value={text} readOnly spellCheck={false} />
      </div>

      {/* Engagement Suggestions */}

        <div className="card tips">
          <h3>Engagement Suggestions</h3>
          {!analysis?.suggestions?.length ? (
            <div>Looks good! 🎉</div>
          ) : (
            <ol className="numbered-suggestions">
              {analysis.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          )}  
        </div>


      {/* Top Keywords */}
      {Array.isArray(analysis?.topKeywords) && analysis.topKeywords.length > 0 && (
        <div className="card tips">
          <h3>Top Keywords</h3>
          <ul>
            {analysis.topKeywords.map((k, i) => (
              <li key={i}>{k.word} — {k.count} times</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
