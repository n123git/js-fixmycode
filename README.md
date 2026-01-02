# js-fixmycode
A short JS script to measure global scope pollution in a web environment (Made for yw-cond v1.4b)

## Documentation and stuff
To use this code you must call the following function: `getGlobalPollution` in your console while your site is running.
It detects and reports global scope pollution i.e., properties on the `window` object that are not part of a clean browser environment. Useful for debugging my shitty code.

Function Signature:
```js
getGlobalPollution(options)
```
* `options`  *Object* (optional)

Here are all the options lol:
| Option           | Type    | Default | Description                                                                                                  |
| ---------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `countFunctions` | boolean | `true`  | Whether to include standalone functions in the result.                                                       |
| `countObjects`   | boolean | `true`  | Whether to include plain objects (`{}`) in the result.                                                       |
| `countClasses`   | boolean | `true`  | Whether to include ES6 classes in the result.                                                                |
| `ignoreDevTools` | boolean | `true`  | Whether to ignore known DevTools-injected globals (`$_`, `$0`, `dir`, etc.). Set to `false` to include them. |

The function returns the following object:
```js
{
  count: Number, // total number of polluted globals detected
  polluted: Array // array of objects describing each polluted global
}
```
Each element in the `polluted` array has the following structure:
```js
{
  name: string, // global variable name
  kind: string, // 'class', 'object', 'array', 'function', 'number', 'string', etc.
  source?: string // optional; present if ignoreDevTools is false and the global is DevTools/extension injected
}
```

### Usage Examples

```js
const result = getGlobalPollution();
console.log(result.count);       // e.g., 5
console.log(result.polluted);    // [{ name: 'myLib', kind: 'object' }, ...]
```
> By default, DevTools helpers are ignored, and all functions, objects, and classes are counted.

#### Include DevTools helpers

```js
const result = getGlobalPollution({ ignoreDevTools: false });
console.log(result.polluted);
```

#### Functions only

```js
const result = getGlobalPollution({ countObjects: false, countClasses: false });
console.log(result.polluted); 
// Only shows functions defined globally (excluding classes and objects)
```

#### Objects only

```js
const result = getGlobalPollution({ countFunctions: false, countClasses: false });
console.log(result.polluted); 
// Only global objects and arrays are reported
```

## How it works and stuff
1. Creates a hidden iframe to capture a clean global environment.
2. Compares all properties of the current `window` against the clean iframe.
3. Filters out:
   * Native browser globals.
   * Frame index aliases (`"0"`, `"1"`, …).
   * Known DevTools helpers (optional).
4. Classifies remaining globals as `class`, `object`, `array`, `function`, or primitive type.
5. Returns the data

Notes:
* `const` and `let` declarations in scripts are *not* attached to `window`, so they are not detected as globals by this function. Only `var`, functions, or explicitly attached properties appear.
* Some browser extensions may inject additional globals that will be reported if `ignoreDevTools` is `false`.
* This function **does not recursively inspect objects**; it only checks top-level globals on `window`.
  * I did this for my use case, but it'd be relatively simple to modify this code to do so. I'm lazy though and nobody'll use this so I won't.

