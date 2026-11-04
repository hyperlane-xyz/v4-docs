// Mintlify injects React hooks into JSX snippets; no React import is needed.
export const GraphQLExample = ({
  title,
  initialQuery,
  initialVariables = '{}',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [variables, setVariables] = useState(initialVariables);
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [failed, setFailed] = useState(false);
  const [running, setRunning] = useState(false);
  const request = useRef(null);
  const queryOverlay = useRef(null);
  const variablesOverlay = useRef(null);

  useEffect(
    () => () => {
      request.current?.abort();
      request.current = null;
    },
    [],
  );

  const run = async (event) => {
    event.preventDefault();
    if (request.current) return;
    setResult('');
    setFailed(false);
    let values;
    try {
      values = JSON.parse(variables);
      if (!values || typeof values !== 'object' || Array.isArray(values)) {
        throw new Error('Variables must be a JSON object, such as {}.');
      }
      if (!query.trim()) throw new Error('Enter a GraphQL query first.');
    } catch (error) {
      setFailed(true);
      setStatus(error instanceof Error ? error.message : String(error));
      return;
    }

    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30000);
    const started = Date.now();
    setRunning(true);
    setStatus('Running query…');
    try {
      const response = await fetch(
        'https://explorer-api.hyperlane.xyz/graphql',
        {
          method: 'POST',
          credentials: 'omit',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables: values }),
          signal: controller.signal,
        },
      );
      const body = await response.text();
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        throw new Error(
          `HTTP ${response.status}: the server returned a non-JSON response. Try again later.`,
        );
      }
      if (request.current !== controller) return;
      const hasErrors = Array.isArray(data?.errors) && data.errors.length > 0;
      setResult(JSON.stringify(data, null, 2));
      setFailed(!response.ok || hasErrors);
      setStatus(
        `${hasErrors ? 'Query returned errors' : response.ok ? 'Completed' : 'Request failed'} · HTTP ${response.status} · ${Date.now() - started} ms`,
      );
    } catch (error) {
      if (request.current !== controller) return;
      setFailed(true);
      setStatus(
        controller.signal.aborted
          ? 'Request timed out after 30 seconds. Narrow the query and try again.'
          : error instanceof Error
            ? error.message
            : String(error),
      );
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        setRunning(false);
      }
    }
  };

  const reset = () => {
    setQuery(initialQuery);
    setVariables(initialVariables);
    setResult('');
    setStatus('');
    setFailed(false);
  };

  // Render tokens as React text nodes so query contents cannot inject markup.
  const highlight = (source, language) => {
    const tokens =
      /#[^\r\n]*|"""[\s\S]*?"""|"(?:\\[\s\S]|[^"\\])*"|\$[_A-Za-z][_0-9A-Za-z]*|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[_A-Za-z][_0-9A-Za-z]*|[!():=@\[\]{},]/g;
    const parts = [];
    let end = 0;
    for (const match of source.matchAll(tokens)) {
      const token = match[0];
      const start = match.index;
      parts.push(source.slice(end, start));
      end = start + token.length;
      let color = '#e2e8f0';
      if (token.startsWith('#')) color = '#94a3b8';
      else if (token.startsWith('"')) {
        color =
          language === 'json' && source.slice(end).trimStart().startsWith(':')
            ? '#7dd3fc'
            : '#86efac';
      } else if (
        token.startsWith('$') ||
        /^(query|mutation|subscription|fragment|on)$/.test(token)
      ) {
        color = '#c4b5fd';
      } else if (/^(true|false|null)$/.test(token) || /^-?\d/.test(token)) {
        color = '#fdba74';
      } else if (/^[_A-Za-z]/.test(token)) color = '#7dd3fc';
      parts.push(
        <span key={start} style={{ color }}>
          {token}
        </span>,
      );
    }
    parts.push(source.slice(end));
    return parts;
  };

  const editor = (value, onChange, language, label, overlay) => {
    // Both layers must use identical metrics to keep the caret on the colored text.
    const typography = {
      margin: 0,
      border: 0,
      padding: '12px 14px',
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: '22px',
      letterSpacing: 'normal',
      tabSize: 2,
      whiteSpace: 'pre',
      wordBreak: 'normal',
      overflowWrap: 'normal',
      boxSizing: 'border-box',
    };
    return (
      <div
        style={{
          position: 'relative',
          height: `${Math.min(24, Math.max(3, value.split('\n').length)) * 22 + 24}px`,
          minHeight: '90px',
          marginTop: '8px',
          borderRadius: '8px',
          background: '#0f172a',
          overflow: 'hidden',
          resize: 'vertical',
        }}
      >
        <pre
          ref={overlay}
          aria-hidden="true"
          style={{
            ...typography,
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            color: '#e2e8f0',
          }}
        >
          <code
            style={{
              font: 'inherit',
              color: 'inherit',
              whiteSpace: 'inherit',
              padding: 0,
              background: 'transparent',
            }}
          >
            {highlight(value, language)}
            {'\n'}
          </code>
        </pre>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={(event) => {
            if (overlay.current) {
              overlay.current.scrollTop = event.target.scrollTop;
              overlay.current.scrollLeft = event.target.scrollLeft;
            }
          }}
          wrap="off"
          disabled={running}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={`${title}: ${label}`}
          className="focus:outline-violet-400"
          style={{
            ...typography,
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            resize: 'none',
            overflow: 'auto',
            background: 'transparent',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            caretColor: '#e2e8f0',
          }}
        />
      </div>
    );
  };

  return (
    <form
      onSubmit={run}
      aria-label={title}
      aria-busy={running}
      className="not-prose my-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            disabled={running}
            className="rounded px-2 py-1 text-xs text-zinc-600 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-white"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
          >
            <svg
              aria-hidden="true"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
            >
              <path d="M3 1.5v9L10 6z" />
            </svg>
            {running ? 'Running…' : 'Run query'}
          </button>
        </div>
      </div>
      <label className="block px-4 pt-3">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Query
        </span>
        {editor(query, setQuery, 'graphql', 'GraphQL query', queryOverlay)}
      </label>
      <details open={initialVariables !== '{}'} className="px-4 pb-4 pt-3">
        <summary className="cursor-pointer text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Variables (JSON)
        </summary>
        {editor(
          variables,
          setVariables,
          'json',
          'JSON variables',
          variablesOverlay,
        )}
      </details>
      {status && (
        <p
          role="status"
          aria-live="polite"
          className={`border-t px-4 py-3 text-xs ${failed ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300' : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400'}`}
        >
          {status}
        </p>
      )}
      {result && (
        <div
          role="region"
          aria-label={`${title}: response`}
          className="border-t border-zinc-200 dark:border-zinc-700"
        >
          <div className="px-4 pt-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Response
          </div>
          <pre
            tabIndex={0}
            className="m-0 overflow-auto bg-transparent p-4 text-xs leading-5 text-zinc-900 dark:text-zinc-100"
            style={{ maxHeight: '24rem' }}
          >
            <code>{result}</code>
          </pre>
        </div>
      )}
    </form>
  );
};
