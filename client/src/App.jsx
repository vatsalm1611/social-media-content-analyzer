import React, { useCallback, useEffect, useRef, useState } from 'react';
import FileUpload from './components/FileUpload.jsx';
import Result from './components/Result.jsx';

const EXTRACT_API = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}` : '') + '/api/extract';


export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const abortControllerRef = useRef(null);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const handleFileSelect = useCallback(async (file) => {
    if (!file || isLoading) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setErrorMessage('');
    setServerResponse(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(EXTRACT_API, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!res.ok) {
        let msg = res.statusText || 'Request failed';
        try {
          const errJson = await res.json();
          if (errJson?.error) msg = errJson.error;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || 'Processing failed');

      setServerResponse(data); // includes text, analysis, hashtagsSuggested, file
    } catch (err) {
      if (err.name !== 'AbortError') setErrorMessage(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
      if (abortControllerRef.current === controller) abortControllerRef.current = null;
    }
  }, [isLoading]);

  return (
    <div className="container">
      <header>
        <h1>Social Media Content Analyzer</h1>
        <p>Upload a PDF or image. We’ll extract the text and suggest engagement improvements.</p>
      </header>

      <FileUpload onFile={handleFileSelect} loading={isLoading} />

      {errorMessage && <div className="error" role="alert" aria-live="assertive">{errorMessage}</div>}
      {isLoading && <div className="loading" aria-live="polite">Extracting…</div>}

      {serverResponse && <Result response={serverResponse} />}

      <footer>
        <span>Developed By Vatsal Mishra</span><br />
        <span>PSIT, Kanpur</span><br />
        <span>2201640100320</span>
      </footer>
    </div>
  );
}
