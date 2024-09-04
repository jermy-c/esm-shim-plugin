An alternative to @rollup/plugin-esm-shim (https://github.com/rollup/plugins/tree/master/packages/esm-shim).

The original ESM shim plugin has a bug: it inserts the shims
in wrong places causing syntax errors. This slightly modified
version of it is a very simple solution, which surely will not work
in every case, but at list does not brake specifically for my code.

Whats different from the original?
The regex used to find import statements is changed to a more
simple one /^import\s.*';$/gm and the whole logic is a lot simpler,
so you can adjust the regex to make it work with your code, if it suddenly doesn't.
 
This code is from: https://github.com/rollup/plugins/issues/1709#issuecomment-2112362911