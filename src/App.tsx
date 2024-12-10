import { useEffect, useMemo, useState } from 'react';
import { FigmaLogo } from './FigmaLogo';
import { twMerge } from 'tailwind-merge';

function App() {
  const [inputText, setInputText] = useState('');

  const outputText = useMemo(() => {
    // Remove wrapping <svg> tags
    const svgRegex = /<svg[^>]*>([\s\S]*?)<\/svg>/g;
    let result = inputText.replace(svgRegex, '$1');

    // Remove `fill` attributes
    const fillRegex = /fill="[^"]*"/g;
    result = result.replace(fillRegex, '');

    // Convert kebab-case attributes to camelCase
    result = result.replace(/([a-z]+)-([a-z]+)/g, (_, p1, p2) => `${p1}${p2.charAt(0).toUpperCase()}${p2.slice(1)}`);

    // Wrap in `<></>` fragment if needed more than one element
    const elementCount = (result.match(/<[a-z]+[^>]*>/g) || []).length;
    if (elementCount > 1) {
      result = `<>${result}</>`;
    }

    // Trim whitespace from start/end of each line
    result = result
      .split('\n')
      .map((line) => line.trim())
      .join('\n');

    // Trim empty lines at start/end
    result = result.replace(/^\n+|\n+$/g, '');

    return result;
  }, [inputText]);

  const hasOutput = useMemo(() => outputText.length > 0, [outputText]);

  function copyToClipboard() {
    navigator.clipboard.writeText(outputText);
    setHasCopied(true);

    setTimeout(() => setHasCopied(false), 2000);
  }

  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => setHasCopied(false), [outputText]);

  return (
    <main className="mx-auto px-4 max-w-full py-16 w-[960px]">
      <h1 className="text-neutral-50 text-4xl font-semibold mb-12">
        Convert <span className="text-indigo-200">SVG</span>
        <span className="text-xl text-neutral-300 relative -top-1 ml-2 mr-1.5 font-light">→</span>
        <span className="font-mono text-yellow-100 font-normal">&lt;CustomIcon&gt;</span>
      </h1>

      <label className="text-neutral-50">
        <div className="flex items-center gap-1.5 text-lg">
          <div>SVG code from</div>
          <FigmaLogo className="mt-0.5" />
        </div>
        <textarea
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-80 bg-neutral-800 px-4 py-3 rounded-lg mt-2 font-mono text-sm text-indigo-200"
        >
          {inputText}
        </textarea>
      </label>

      <div className="mt-10 group">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div className="text-neutral-50 text-lg">
            JSX to use in <span className="font-mono text-yellow-100">&lt;CustomIcon&gt;</span>
          </div>

          {hasOutput && (
            <button
              className="inline-flex items-center rounded-md bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-500 ring-1 ring-inset ring-yellow-400/20 hover:ring-yellow-400/50 transition-colors copy-button group-has-[.copy-button:hover]:border-yellow-400/50"
              onClick={copyToClipboard}
            >
              {hasCopied ? 'Copied to clipboard' : 'Copy to clipboard'}
            </button>
          )}
        </div>
        <button
          className={twMerge(
            'text-left rounded-lg bg-neutral-800 border border-transparent transition-colors copy-button w-full',
            hasOutput && 'cursor-pointer hover:border-yellow-400/50 group-has-[.copy-button:hover]:border-yellow-400/50'
          )}
          disabled={!hasOutput}
          onClick={copyToClipboard}
        >
          <pre className="w-full px-4 py-3 text-sm text-yellow-100 whitespace-pre-wrap h-80 overflow-auto">{outputText}</pre>
        </button>
      </div>
    </main>
  );
}

export default App;