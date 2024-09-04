/**
 * An alternative to @rollup/plugin-esm-shim (https://github.com/rollup/plugins/tree/master/packages/esm-shim).
 *
 * The original ESM shim plugin has a bug: it inserts the shims
 * in wrong places causing syntax errors. This slightly modified
 * version of it is a very simple solution, which surely will not work
 * in every case, but at list does not brake specifically for my code.
 *
 * Whats different from the original?
 * The regex used to find import statements is changed to a more
 * simple one /^import\s.*';$/gm and the whole logic is a lot simpler,
 * so you can adjust the regex to make it work with your code, if it suddenly doesn't.
 * 
 * This code is from: https://github.com/rollup/plugins/issues/1709#issuecomment-2112362911
 */
export default function esmShimCustom() {
  const ESMShim = `
// -- Shims --
import cjsUrl from 'node:url';
import cjsPath from 'node:path';
import cjsModule from 'node:module';
const __filename = cjsUrl.fileURLToPath(import.meta.url);
const __dirname = cjsPath.dirname(__filename);
const require = cjsModule.createRequire(import.meta.url);
// -- End Shims --
`;
  const CJSyntaxRegex = /__filename|__dirname|require\(|require\.resolve\(/;

  return {
    name: 'esm-shim-custom',

    renderChunk(/** @type {string} */ code, _chunk, opts) {
      if (opts.format === 'es') {
        if (code.includes(ESMShim) || !CJSyntaxRegex.test(code)) {
          return null;
        }

        let endIndexOfLastImport = -1;

        // Find the last import statement and its ending index
        for (let match of code.matchAll(/^import\s.*';$/gm)) {
          if (match.length === 0 || typeof match.index !== 'number') {
            continue;
          }

          endIndexOfLastImport = match.index + match[0].length;
        }

        const s = new MagicString(code);
        s.appendRight(endIndexOfLastImport, ESMShim);

        const sourceMap = s.generateMap({
          includeContent: true,
        });

        /** @type {string[] | undefined} */
        let sourcesContent;
        if (Array.isArray(sourceMap.sourcesContent)) {
          sourcesContent = [];
          for (let i = 0; i < sourceMap.sourcesContent.length; i++) {
            const content = sourceMap.sourcesContent[i];
            if (typeof content === 'string') {
              sourcesContent.push(content);
            }
          }
        }

        return {
          code: s.toString(),
          map: {
            ...sourceMap,
            sourcesContent,
          },
        };
      }

      return null;
    },
  };
}