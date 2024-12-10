import { useEffect, useMemo, useState } from 'react';
import { FigmaLogo } from './FigmaLogo';
import { twMerge } from 'tailwind-merge';

function App() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'react' | 'react-native'>('react');

  const outputText = useMemo(() => {
    // Remove wrapping <svg> tags
    const svgRegex = /<svg[^>]*>([\s\S]*?)<\/svg>/g;
    let result = inputText.replace(svgRegex, '$1');

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

    if (mode === 'react') {
      // Remove `fill` attributes
      const fillRegex = /fill="[^"]*"/g;
      result = result.replace(fillRegex, '');
    }

    if (mode === 'react-native') {
      // Uppercase first letter of each tag
      result = result.replace(/<([a-z]+)/g, (_, p1) => `<${p1.charAt(0).toUpperCase()}${p1.slice(1)}`);

      // Replace `fill` attribute with `fill={color}`
      result = result.replace(/fill="[^"]*"/g, 'fill={color} ');
    }

    return result;
  }, [inputText, mode]);

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
          className="w-full h-80 bg-neutral-800 px-4 py-3 rounded-lg mt-2 font-mono text-sm text-indigo-200 focus:outline-none transition-colors focus-visible:border-indigo-400/75 border border-transparent"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          autoFocus
        >
          {inputText}
        </textarea>
      </label>

      <div className="mt-10 group">
        <div className="mb-2 flex items-center gap-2">
          <div className="text-neutral-50 text-lg">
            JSX to use in <span className="font-mono text-yellow-100">&lt;CustomIcon&gt;</span>
          </div>

          {hasOutput && (
            <button
              className={twMerge(
                'inline-flex items-center rounded-md bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-500 ring-1 ring-inset ring-yellow-400/20 hover:ring-yellow-400/50 transition-colors copy-button group-has-[.copy-button:hover]:border-yellow-400/50',
                hasCopied && 'bg-green-500/10 text-green-500 ring-green-500/20 hover:ring-green-500/50'
              )}
              onClick={copyToClipboard}
            >
              {hasCopied ? 'Copied to clipboard' : 'Copy to clipboard'}
            </button>
          )}

          <div className="text-neutral-50 text-sm ml-auto">
            <div className="relative hidden sm:block">
              <select
                className="h-8 rounded-lg border-0 bg-transparent bg-none px-2 font-medium text-neutral-50 focus:shadow-none focus:outline-none text-sm"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'react' | 'react-native')}
              >
                <option value="react">React</option>
                <option value="react-native">React Native</option>
              </select>
            </div>
          </div>
        </div>
        <button
          className={twMerge(
            'text-left rounded-lg bg-neutral-800 border border-transparent transition-colors copy-button w-full',
            hasOutput && 'cursor-pointer hover:border-yellow-400/50 group-has-[.copy-button:hover]:border-yellow-400/50',
            hasCopied && 'hover:border-green-500/50 group-has-[.copy-button:hover]:border-green-500/50'
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
