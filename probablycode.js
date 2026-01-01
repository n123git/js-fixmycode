// it's not code guys trust
const DEVTOOLS_HELPERS = new Set([ // optionally ignore special global tools chrome devtools injects into console
  // selection
  '$_', '$0', '$1', '$2', '$3', '$4',
  '$', '$$', '$x',

  // console helpers
  'dir', 'dirxml', 'profile', 'profileEnd', 'clear',
  'table', 'keys', 'values', 'debug', 'undebug',
  'monitor', 'unmonitor', 'inspect', 'copy',
  'queryObjects', 'getEventListeners', // getEventListeners should be a standard DOM function, please for my sanity add this, please
  'getAccessibleName', 'getAccessibleRole',
  'monitorEvents', 'unmonitorEvents'
]);

function getGlobalPollution({
  countFunctions = true,
  countObjects = true,
  countClasses = true,
  ignoreDevTools = true
} = {}) {
  // first we inject an iframe to get all the normal globals because I am NOT manually listing all of them
  const iframe = document.createElement('iframe'); 
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const cleanGlobals = new Set(
    Object.getOwnPropertyNames(iframe.contentWindow)
  );
  const currentGlobals = Object.getOwnPropertyNames(window);

  document.body.removeChild(iframe);

  const polluted = [];

  for (const name of currentGlobals) { // now loop
    if (cleanGlobals.has(name)) continue; // if it exists in the iframe - it always exists and isn't pollution
    if (!isNaN(name)) continue; // Ignore frame index aliases ("0", "1", ...)

    // Ignore DevTools helpers if ignoreDevTools is truthy
    if (ignoreDevTools && DEVTOOLS_HELPERS.has(name)) continue;

    const value = window[name];

    const isClass =
      typeof value === 'function' &&
      /^class\s/.test(Function.prototype.toString.call(value));

    const isPlainObject =
      typeof value === 'object' &&
      value !== null &&
      Object.getPrototypeOf(value) === Object.prototype;

    if (!countClasses && isClass) continue;
    if (!countFunctions && typeof value === 'function' && !isClass) continue;
    if (!countObjects && isPlainObject) continue;

    const entry = {
      name,
      kind: isClass
        ? 'class'
        : isPlainObject
        ? 'object'
        : Array.isArray(value)
        ? 'array'
        : typeof value
    };

    if (!ignoreDevTools) {
      entry.source = 'Injected into Console (thank Chrome DevTools)';
    }

    polluted.push(entry);
  }

  return {
    count: polluted.length,
    polluted
  };
}
