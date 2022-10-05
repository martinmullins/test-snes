// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module != "undefined" ? Module : {};

// See https://caniuse.com/mdn-javascript_builtins_object_assign

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// Wires up the event handlers, called from compiled c code to give file
// system a chance to sync.
window.initSNES = function () {
  // Hide some emscripten things
  if (document.querySelector("body > a"))
    document.querySelector("body > a").style.display = "none";
  if (document.querySelector("#status"))
    document.querySelector("#status").style.display = "none";
  if (document.querySelector("#output"))
    document.querySelector("#output").rows = 4;
  const displayCanvas = document.querySelector("#canvas");
  displayCanvas.style.width = "100vw";
  displayCanvas.style.height = "100vw * 224 / 256";

  // var startbttn = document.getElementById('start');
  // var fileChooser = document.getElementById('file-selector');
  // var frameskipInc = document.getElementById('frameskip-increment');
  // var frameskipDec = document.getElementById('frameskip-decrement');
  // var frameskipSpan = document.createElement("span");
  // document.body.appendChild(frameskipSpan);
  // frameskipSpan.style.display = null;
  // var transToggle = document.getElementById('transparency-toggle');
  // var fpsToggle = document.getElementById('fps-toggle');
  // var fullscreen = document.getElementById('fullscreen');
  // var cout_print = Module.print;
  // var filename = "";

  window.Module = Module;

  window.reportButton = Module.cwrap("S9xReportButton", null, [
    "number",
    "boolean",
  ]);

  var frameskipAdjust = (function () {
    var frameskip = 0;
    var set_frameskip = Module.cwrap("set_frameskip", "number", ["number"]);
    var fn = function (n) {
      return function (evt) {
        frameskip += n;
        if (frameskip < 0) frameskip = 0;
        // frameskipSpan.textContent = "" + frameskip;
        set_frameskip(frameskip);
        return frameskip;
      };
    };

    fn.reset = function () {
      frameskip = 0;
      // frameskipSpan.textContent = "0";
      set_frameskip(frameskip);
    };

    return fn;
  })();

  var toggleTransparency = (function () {
    var snes_transparency = 1;
    return function () {
      snes_transparency = !snes_transparency;
      Module._set_transparency(snes_transparency);
      cout_print("Transparency is now " + (snes_transparency ? "on" : "off"));
    };
  })();

  var goFullScreen = function () {
    var pointerlock = document.getElementById("pointer-lock").checked;
    var resize = document.getElementById("resize").checked;
    // double-checked, this does expect js boolean values
    Module.requestFullScreen(pointerlock, resize);
  };

  var snesReadFile = function (evt) {
    var f = evt.currentTarget.files[0];
    cout_print(f.name);
    filename = f.name;
    var reader = new FileReader();
    reader.onprogress = function (e) {
      if (e.lengthComputable) {
        cout_print(Math.round((e.loaded / e.total) * 100) + "%");
      } else {
        count_print(e.loaded + "bytes");
      }
      document.getElementById("start").disabled = false;
    };
    reader.onload = function (e) {
      cout_print(f.name + " loaded");
      Module.FS_createDataFile(
        "/",
        f.name,
        new Uint8Array(this.result),
        true,
        true
      );
    };
    reader.readAsArrayBuffer(f);
  };

  var snesMain = (function () {
    var interval = null;
    var run = Module.cwrap("run", null, ["string"]);
    return function () {
      //clearInterval(interval);
      //interval = setInterval(Module._S9xAutoSaveSRAM, 10000);
      document.getElementById("start").disabled = true;
      // reboot_romnum = -1; // seems unnecessary?
      // frameskipAdjust.reset();
      run(filename);
    };
  })();

  window.runRom = Module.cwrap("run", null, ["string"]);
  window.cancelRom = Module.cwrap("cancel", null, []);
  window.unfreezeGame = Module.cwrap("S9xUnfreezeGame", null, ["string"]);
  window.freezeGame = Module.cwrap("S9xFreezeGame", null, ["string"]);

  // (function () {
  //   var interval = null;
  //   var run = Module.cwrap("run", null, ["string"]);
  //   return function () {
  //     //clearInterval(interval);
  //     //interval = setInterval(Module._S9xAutoSaveSRAM, 10000);
  //     // reboot_romnum = -1; // seems unnecessary?
  //     // frameskipAdjust.reset();
  //     run("/frognes.smc");
  //   };
  // })()();

  // fpsToggle.addEventListener('click', Module._toggle_display_framerate);
  // startbttn.addEventListener('click', snesMain);
  // fileChooser.addEventListener('change', snesReadFile);
  // frameskipInc.addEventListener('click', frameskipAdjust(1));
  // frameskipDec.addEventListener('click', frameskipAdjust(-1));
  // transToggle.addEventListener('click', toggleTransparency);
  // fullscreen.addEventListener('click', goFullScreen);
  // make sure we sync state before tab closes
  if (window.setupBrowserFS) {
    console.log("SETUP BROWSER FS");
    console.log("SETUP BROWSER FS");
    console.log("SETUP BROWSER FS");
    console.log("SETUP BROWSER FS");
    console.log("SETUP BROWSER FS");
    window.preRun = [
      () => window.addEventListener("beforeunload", Module._S9xAutoSaveSRAM),
      window.setupBrowserFS,
    ];
  } else {
    console.log("NO SETUP BROWSER FS");
    console.log("NO SETUP BROWSER FS");
    console.log("NO SETUP BROWSER FS");
    console.log("NO SETUP BROWSER FS");
    console.log("NO SETUP BROWSER FS");
    Module.preRun = [
      () => window.addEventListener("beforeunload", Module._S9xAutoSaveSRAM),
    ];
  }

  // const script = document.createElement("script");
  // script.src = "/other.js";
  // document.body.append(script);
};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = "./this.program";
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == "object";
var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE =
  typeof process == "object" &&
  typeof process.versions == "object" &&
  typeof process.versions.node == "string";
var ENVIRONMENT_IS_SHELL =
  !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = "";
function locateFile(path) {
  if (window.Module["locateFile"]) {
    return window.Module["locateFile"](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_, readAsync, readBinary, setWindowTitle;

// Normally we don't log exceptions but instead let them bubble out the top
// level where the embedding environment (e.g. the browser) can handle
// them.
// However under v8 and node we sometimes exit the process direcly in which case
// its up to use us to log the exception before exiting.
// If we fix https://github.com/emscripten-core/emscripten/issues/15080
// this may no longer be needed under node.
function logExceptionOnExit(e) {
  if (e instanceof ExitStatus) return;
  let toLog = e;
  err("exiting due to exception: " + toLog);
}

var fs;
var nodePath;
var requireNodeFS;

if (ENVIRONMENT_IS_NODE) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = require("path").dirname(scriptDirectory) + "/";
  } else {
    scriptDirectory = __dirname + "/";
  }

  // include: node_shell_read.js

  requireNodeFS = () => {
    // Use nodePath as the indicator for these not being initialized,
    // since in some environments a global fs may have already been
    // created.
    if (!nodePath) {
      fs = require("fs");
      nodePath = require("path");
    }
  };

  read_ = function shell_read(filename, binary) {
    requireNodeFS();
    filename = nodePath["normalize"](filename);
    return fs.readFileSync(filename, binary ? undefined : "utf8");
  };

  readBinary = (filename) => {
    var ret = read_(filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    return ret;
  };

  readAsync = (filename, onload, onerror) => {
    requireNodeFS();
    filename = nodePath["normalize"](filename);
    fs.readFile(filename, function (err, data) {
      if (err) onerror(err);
      else onload(data.buffer);
    });
  };

  // end include: node_shell_read.js
  if (process["argv"].length > 1) {
    thisProgram = process["argv"][1].replace(/\\/g, "/");
  }

  arguments_ = process["argv"].slice(2);

  if (typeof module != "undefined") {
    module["exports"] = Module;
  }

  process["on"]("uncaughtException", function (ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  // Without this older versions of node (< v15) will log unhandled rejections
  // but return 0, which is not normally the desired behaviour.  This is
  // not be needed with node v15 and about because it is now the default
  // behaviour:
  // See https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode
  process["on"]("unhandledRejection", function (reason) {
    throw reason;
  });

  quit_ = (status, toThrow) => {
    if (keepRuntimeAlive()) {
      process["exitCode"] = status;
      throw toThrow;
    }
    logExceptionOnExit(toThrow);
    process["exit"](status);
  };

  Module["inspect"] = function () {
    return "[Emscripten Module object]";
  };
}

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
    // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != "undefined" && document.currentScript) {
    // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.indexOf("blob:") !== 0) {
    scriptDirectory = scriptDirectory.substr(
      0,
      scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1
    );
  } else {
    scriptDirectory = "";
  }

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {
    // include: web_or_worker_shell_read.js

    read_ = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.send(null);
      return xhr.responseText;
    };

    if (ENVIRONMENT_IS_WORKER) {
      readBinary = (url) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.responseType = "arraybuffer";
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
      };
    }

    readAsync = (url, onload, onerror) => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = () => {
        if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
          // file URLs can return 0
          onload(xhr.response);
          return;
        }
        onerror();
      };
      xhr.onerror = onerror;
      xhr.send(null);
    };

    // end include: web_or_worker_shell_read.js
  }

  setWindowTitle = (title) => (document.title = title);
} else {
}

var out = Module["print"] || console.log.bind(console);
var err = Module["printErr"] || console.warn.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module["arguments"]) arguments_ = Module["arguments"];

if (Module["thisProgram"]) thisProgram = Module["thisProgram"];

if (Module["quit"]) quit_ = Module["quit"];

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message

var STACK_ALIGN = 16;
var POINTER_SIZE = 4;

function getNativeTypeSize(type) {
  switch (type) {
    case "i1":
    case "i8":
    case "u8":
      return 1;
    case "i16":
    case "u16":
      return 2;
    case "i32":
    case "u32":
      return 4;
    case "i64":
    case "u64":
      return 8;
    case "float":
      return 4;
    case "double":
      return 8;
    default: {
      if (type[type.length - 1] === "*") {
        return POINTER_SIZE;
      } else if (type[0] === "i") {
        const bits = Number(type.substr(1));
        assert(
          bits % 8 === 0,
          "getNativeTypeSize invalid bits " + bits + ", type " + type
        );
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

// include: runtime_functions.js

// This gives correct answers for everything less than 2^{14} = 16384
// I hope nobody is contemplating functions with 16384 arguments...
function uleb128Encode(n) {
  if (n < 128) {
    return [n];
  }
  return [n % 128 | 128, n >> 7];
}

// Wraps a JS function as a wasm function with a given signature.
function convertJsFunctionToWasm(func, sig) {
  // If the type reflection proposal is available, use the new
  // "WebAssembly.Function" constructor.
  // Otherwise, construct a minimal wasm module importing the JS function and
  // re-exporting it.
  if (typeof WebAssembly.Function == "function") {
    var typeNames = {
      i: "i32",
      j: "i64",
      f: "f32",
      d: "f64",
      p: "i32",
    };
    var type = {
      parameters: [],
      results: sig[0] == "v" ? [] : [typeNames[sig[0]]],
    };
    for (var i = 1; i < sig.length; ++i) {
      type.parameters.push(typeNames[sig[i]]);
    }
    return new WebAssembly.Function(type, func);
  }

  // The module is static, with the exception of the type section, which is
  // generated based on the signature passed in.
  var typeSection = [
    0x01, // count: 1
    0x60, // form: func
  ];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = {
    i: 0x7f, // i32
    p: 0x7f, // i32
    j: 0x7e, // i64
    f: 0x7d, // f32
    d: 0x7c, // f64
  };

  // Parameters, length + signatures
  typeSection = typeSection.concat(uleb128Encode(sigParam.length));
  for (var i = 0; i < sigParam.length; ++i) {
    typeSection.push(typeCodes[sigParam[i]]);
  }

  // Return values, length + signatures
  // With no multi-return in MVP, either 0 (void) or 1 (anything else)
  if (sigRet == "v") {
    typeSection.push(0x00);
  } else {
    typeSection = typeSection.concat([0x01, typeCodes[sigRet]]);
  }

  // Write the section code and overall length of the type section into the
  // section header
  typeSection = [0x01 /* Type section code */].concat(
    uleb128Encode(typeSection.length),
    typeSection
  );

  // Rest of the module is static
  var bytes = new Uint8Array(
    [
      0x00,
      0x61,
      0x73,
      0x6d, // magic ("\0asm")
      0x01,
      0x00,
      0x00,
      0x00, // version: 1
    ].concat(typeSection, [
      0x02,
      0x07, // import section
      // (import "e" "f" (func 0 (type 0)))
      0x01,
      0x01,
      0x65,
      0x01,
      0x66,
      0x00,
      0x00,
      0x07,
      0x05, // export section
      // (export "f" (func 0 (type 0)))
      0x01,
      0x01,
      0x66,
      0x00,
      0x00,
    ])
  );

  // We can compile this wasm module synchronously because it is very small.
  // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, {
    e: {
      f: func,
    },
  });
  var wrappedFunc = instance.exports["f"];
  return wrappedFunc;
}

var freeTableIndexes = [];

// Weak map of functions in the table to their indexes, created on first use.
var functionsInTableMap;

function getEmptyTableSlot() {
  // Reuse a free index if there is one, otherwise grow.
  if (freeTableIndexes.length) {
    return freeTableIndexes.pop();
  }
  // Grow the table
  try {
    wasmTable.grow(1);
  } catch (err) {
    if (!(err instanceof RangeError)) {
      throw err;
    }
    throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
  }
  return wasmTable.length - 1;
}

function updateTableMap(offset, count) {
  for (var i = offset; i < offset + count; i++) {
    var item = getWasmTableEntry(i);
    // Ignore null values.
    if (item) {
      functionsInTableMap.set(item, i);
    }
  }
}

/**
 * Add a function to the table.
 * 'sig' parameter is required if the function being added is a JS function.
 * @param {string=} sig
 */
function addFunction(func, sig) {
  // Check if the function is already in the table, to ensure each function
  // gets a unique index. First, create the map if this is the first use.
  if (!functionsInTableMap) {
    functionsInTableMap = new WeakMap();
    updateTableMap(0, wasmTable.length);
  }
  if (functionsInTableMap.has(func)) {
    return functionsInTableMap.get(func);
  }

  // It's not in the table, add it now.

  var ret = getEmptyTableSlot();

  // Set the new value.
  try {
    // Attempting to call this with JS function will cause of table.set() to fail
    setWasmTableEntry(ret, func);
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    var wrapped = convertJsFunctionToWasm(func, sig);
    setWasmTableEntry(ret, wrapped);
  }

  functionsInTableMap.set(func, ret);

  return ret;
}

function removeFunction(index) {
  functionsInTableMap.delete(getWasmTableEntry(index));
  freeTableIndexes.push(index);
}

// end include: runtime_functions.js
// include: runtime_debug.js

// end include: runtime_debug.js
var tempRet0 = 0;
var setTempRet0 = (value) => {
  tempRet0 = value;
};
var getTempRet0 = () => tempRet0;

// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
var noExitRuntime = Module["noExitRuntime"] || true;

if (typeof WebAssembly != "object") {
  abort("no native wasm support detected");
}

// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    // This build was created without ASSERTIONS defined.  `assert()` should not
    // ever be called in this configuration but in case there are callers in
    // the wild leave this simple abort() implemenation here for now.
    abort(text);
  }
}

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module["_" + ident]; // closure exported function
  return func;
}

// C calling interface.
/** @param {string|null=} returnType
    @param {Array=} argTypes
    @param {Arguments|Array=} args
    @param {Object=} opts */
function ccall(ident, returnType, argTypes, args, opts) {
  // For fast lookup of conversion functions
  var toC = {
    string: function (str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) {
        // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    array: function (arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
  };

  function convertReturnValue(ret) {
    if (returnType === "string") {
      return UTF8ToString(ret);
    }
    if (returnType === "boolean") return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);
  function onDone(ret) {
    if (stack !== 0) stackRestore(stack);
    return convertReturnValue(ret);
  }

  ret = onDone(ret);
  return ret;
}

/** @param {string=} returnType
    @param {Array=} argTypes
    @param {Object=} opts */
function cwrap(ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  // When the function takes numbers and returns a number, we can just return
  // the original function
  var numericArgs = argTypes.every(function (type) {
    return type === "number";
  });
  var numericRet = returnType !== "string";
  if (numericRet && numericArgs && !opts) {
    return getCFunc(ident);
  }
  return function () {
    return ccall(ident, returnType, argTypes, arguments, opts);
  };
}

// include: runtime_legacy.js

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call

/**
 * allocate(): This function is no longer used by emscripten but is kept around to avoid
 *             breaking external users.
 *             You should normally not use allocate(), and instead allocate
 *             memory using _malloc()/stackAlloc(), initialize it with
 *             setValue(), and so forth.
 * @param {(Uint8Array|Array<number>)} slab: An array of data.
 * @param {number=} allocator : How to allocate memory, see ALLOC_*
 */
function allocate(slab, allocator) {
  var ret;

  if (allocator == ALLOC_STACK) {
    ret = stackAlloc(slab.length);
  } else {
    ret = _malloc(slab.length);
  }

  if (!slab.subarray && !slab.slice) {
    slab = new Uint8Array(slab);
  }
  HEAPU8.set(slab, ret);
  return ret;
}

// end include: runtime_legacy.js
// include: runtime_strings.js

// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

var UTF8Decoder =
  typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.
/**
 * heapOrArray is either a regular array, or a JavaScript typed array view.
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  } else {
    var str = "";
    // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
    while (idx < endPtr) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      var u0 = heapOrArray[idx++];
      if (!(u0 & 0x80)) {
        str += String.fromCharCode(u0);
        continue;
      }
      var u1 = heapOrArray[idx++] & 63;
      if ((u0 & 0xe0) == 0xc0) {
        str += String.fromCharCode(((u0 & 31) << 6) | u1);
        continue;
      }
      var u2 = heapOrArray[idx++] & 63;
      if ((u0 & 0xf0) == 0xe0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u0 =
          ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
      }

      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xd800 | (ch >> 10), 0xdc00 | (ch & 0x3ff));
      }
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0))
    // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xd800 && u <= 0xdfff) {
      var u1 = str.charCodeAt(++i);
      u = (0x10000 + ((u & 0x3ff) << 10)) | (u1 & 0x3ff);
    }
    if (u <= 0x7f) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7ff) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xc0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xffff) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xe0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++] = 0xf0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xd800 && u <= 0xdfff)
      u = (0x10000 + ((u & 0x3ff) << 10)) | (str.charCodeAt(++i) & 0x3ff);
    if (u <= 0x7f) ++len;
    else if (u <= 0x7ff) len += 2;
    else if (u <= 0xffff) len += 3;
    else len += 4;
  }
  return len;
}

// end include: runtime_strings.js
// include: runtime_strings_extra.js

// runtime_strings_extra.js: Strings related runtime functions that are available only in regular runtime.

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = "";
  while (1) {
    var ch = HEAPU8[ptr++ >> 0];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder =
  typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : undefined;

function UTF16ToString(ptr, maxBytesToRead) {
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  var maxIdx = idx + maxBytesToRead / 2;
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var str = "";

    // If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
    // will always evaluate to true. The loop is then terminated on the first null char.
    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
      var codeUnit = HEAP16[(ptr + i * 2) >> 1];
      if (codeUnit == 0) break;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }

    return str;
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7fffffff;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite =
    maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[outPtr >> 1] = codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[outPtr >> 1] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length * 2;
}

function UTF32ToString(ptr, maxBytesToRead) {
  var i = 0;

  var str = "";
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(i >= maxBytesToRead / 4)) {
    var utf32 = HEAP32[(ptr + i * 4) >> 2];
    if (utf32 == 0) break;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xd800 | (ch >> 10), 0xdc00 | (ch & 0x3ff));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
  return str;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7fffffff;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xd800 && codeUnit <= 0xdfff) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit =
        (0x10000 + ((codeUnit & 0x3ff) << 10)) | (trailSurrogate & 0x3ff);
    }
    HEAP32[outPtr >> 2] = codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[outPtr >> 2] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdfff) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated
    @param {boolean=} dontAddNull */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce(
    "writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!"
  );

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}

/** @param {boolean=} dontAddNull */
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[buffer++ >> 0] = str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}

// end include: runtime_strings_extra.js
// Memory management

var HEAP,
  /** @type {!ArrayBuffer} */
  buffer,
  /** @type {!Int8Array} */
  HEAP8,
  /** @type {!Uint8Array} */
  HEAPU8,
  /** @type {!Int16Array} */
  HEAP16,
  /** @type {!Uint16Array} */
  HEAPU16,
  /** @type {!Int32Array} */
  HEAP32,
  /** @type {!Uint32Array} */
  HEAPU32,
  /** @type {!Float32Array} */
  HEAPF32,
  /** @type {!Float64Array} */
  HEAPF64;

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module["HEAP8"] = HEAP8 = new Int8Array(buf);
  Module["HEAP16"] = HEAP16 = new Int16Array(buf);
  Module["HEAP32"] = HEAP32 = new Int32Array(buf);
  Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
  Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
  Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
  Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
  Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 5242880;

var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 50331648;

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js

// end include: runtime_stack_check.js
// include: runtime_assertions.js

// end include: runtime_assertions.js
var __ATPRERUN__ = []; // functions called before the runtime is initialized
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

function keepRuntimeAlive() {
  return noExitRuntime;
}

function preRun() {
  if (Module["preRun"]) {
    if (typeof Module["preRun"] == "function")
      Module["preRun"] = [Module["preRun"]];
    while (Module["preRun"].length) {
      addOnPreRun(Module["preRun"].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  runtimeInitialized = true;

  if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
  FS.ignorePermissions = false;

  TTY.init();
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function postRun() {
  if (Module["postRun"]) {
    if (typeof Module["postRun"] == "function")
      Module["postRun"] = [Module["postRun"]];
    while (Module["postRun"].length) {
      addOnPostRun(Module["postRun"].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function getUniqueRunDependency(id) {
  return id;
}

function addRunDependency(id) {
  runDependencies++;

  if (Module["monitorRunDependencies"]) {
    Module["monitorRunDependencies"](runDependencies);
  }
}

function removeRunDependency(id) {
  runDependencies--;

  if (Module["monitorRunDependencies"]) {
    Module["monitorRunDependencies"](runDependencies);
  }

  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

/** @param {string|number=} what */
function abort(what) {
  {
    if (Module["onAbort"]) {
      Module["onAbort"](what);
    }
  }

  what = "Aborted(" + what + ")";
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  what += ". Build with -sASSERTIONS for more info.";

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // defintion for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// {{MEM_INITIALIZER}}

// include: memoryprofiler.js

// end include: memoryprofiler.js
// include: URIUtils.js

// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = "data:application/octet-stream;base64,";

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  // Prefix of data URIs emitted by SINGLE_FILE and related options.
  return filename.startsWith(dataURIPrefix);
}

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return filename.startsWith("file://");
}

// end include: URIUtils.js
var wasmBinaryFile;
wasmBinaryFile = "snes9x.wasm";
if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw "both async and sync fetching of the wasm failed";
    }
  } catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, try to to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == "function" && !isFileURI(wasmBinaryFile)) {
      return fetch(wasmBinaryFile, { credentials: "same-origin" })
        .then(function (response) {
          if (!response["ok"]) {
            throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
          }
          return response["arrayBuffer"]();
        })
        .catch(function () {
          return getBinary(wasmBinaryFile);
        });
    } else {
      if (readAsync) {
        // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
        return new Promise(function (resolve, reject) {
          readAsync(
            wasmBinaryFile,
            function (response) {
              resolve(new Uint8Array(/** @type{!ArrayBuffer} */ (response)));
            },
            reject
          );
        });
      }
    }
  }

  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function () {
    return getBinary(wasmBinaryFile);
  });
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    env: asmLibraryArg,
    wasi_snapshot_preview1: asmLibraryArg,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module["asm"] = exports;

    wasmMemory = Module["asm"]["memory"];
    updateGlobalBufferAndViews(wasmMemory.buffer);

    wasmTable = Module["asm"]["__indirect_function_table"];

    addOnInit(Module["asm"]["__wasm_call_ctors"]);

    removeRunDependency("wasm-instantiate");
  }
  // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  addRunDependency("wasm-instantiate");

  // Prefer streaming instantiation if available.
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(result["instance"]);
  }

  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise()
      .then(function (binary) {
        return WebAssembly.instantiate(binary, info);
      })
      .then(function (instance) {
        return instance;
      })
      .then(receiver, function (reason) {
        err("failed to asynchronously prepare wasm: " + reason);

        abort(reason);
      });
  }

  function instantiateAsync() {
    if (
      !wasmBinary &&
      typeof WebAssembly.instantiateStreaming == "function" &&
      !isDataURI(wasmBinaryFile) &&
      // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
      !isFileURI(wasmBinaryFile) &&
      typeof fetch == "function"
    ) {
      return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(
        function (response) {
          // Suppress closure warning here since the upstream definition for
          // instantiateStreaming only allows Promise<Repsponse> rather than
          // an actual Response.
          // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
          /** @suppress {checkTypes} */
          var result = WebAssembly.instantiateStreaming(response, info);

          return result.then(receiveInstantiationResult, function (reason) {
            // We expect the most common failure cause to be a bad MIME type for the binary,
            // in which case falling back to ArrayBuffer instantiation should work.
            err("wasm streaming compile failed: " + reason);
            err("falling back to ArrayBuffer instantiation");
            return instantiateArrayBuffer(receiveInstantiationResult);
          });
        }
      );
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult);
    }
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  // Also pthreads and wasm workers initialize the wasm instance through this path.
  if (Module["instantiateWasm"]) {
    try {
      var exports = Module["instantiateWasm"](info, receiveInstance);
      return exports;
    } catch (e) {
      err("Module.instantiateWasm callback failed with error: " + e);
      return false;
    }
  }

  instantiateAsync();
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = {
  129600: () => {
    FS.syncfs(false, function (err) {
      if (err) {
        console.log("Error saving sram file.");
        console.log(err);
      } else {
        console.log("File system synced");
      }
    });
  },
  129752: () => {
    console.log("Syncing file system...");
    FS.mkdir("/home/web_user/.snes9x");
    FS.mkdir("/home/web_user/.snes9x/sram");
    FS.mount(IDBFS, {}, "/home/web_user/.snes9x/sram");
    FS.syncfs(true, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("File system synced.");
        window.initSNES();
      }
    });
  },
  130052: () => {
    window.reportAllButtons && window.reportAllButtons();
  },
};

function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == "function") {
      callback(Module); // Pass the module as the first argument.
      continue;
    }
    var func = callback.func;
    if (typeof func == "number") {
      if (callback.arg === undefined) {
        // Run the wasm function ptr with signature 'v'. If no function
        // with such signature was exported, this call does not need
        // to be emitted (and would confuse Closure)
        getWasmTableEntry(func)();
      } else {
        // If any function with signature 'vi' was exported, run
        // the callback with that signature.
        getWasmTableEntry(func)(callback.arg);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

function withStackSave(f) {
  var stack = stackSave();
  var ret = f();
  stackRestore(stack);
  return ret;
}
function demangle(func) {
  return func;
}

function demangleAll(text) {
  var regex = /\b_Z[\w\d_]+/g;
  return text.replace(regex, function (x) {
    var y = demangle(x);
    return x === y ? x : y + " [" + x + "]";
  });
}

/**
 * @param {number} ptr
 * @param {string} type
 */
function getValue(ptr, type = "i8") {
  if (type.endsWith("*")) type = "i32";
  switch (type) {
    case "i1":
      return HEAP8[ptr >> 0];
    case "i8":
      return HEAP8[ptr >> 0];
    case "i16":
      return HEAP16[ptr >> 1];
    case "i32":
      return HEAP32[ptr >> 2];
    case "i64":
      return HEAP32[ptr >> 2];
    case "float":
      return HEAPF32[ptr >> 2];
    case "double":
      return Number(HEAPF64[ptr >> 3]);
    default:
      abort("invalid type for getValue: " + type);
  }
  return null;
}

var wasmTableMirror = [];
function getWasmTableEntry(funcPtr) {
  var func = wasmTableMirror[funcPtr];
  if (!func) {
    if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
    wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
  }
  return func;
}

function handleException(e) {
  // Certain exception types we do not treat as errors since they are used for
  // internal control flow.
  // 1. ExitStatus, which is thrown by exit()
  // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
  //    that wish to return to JS event loop.
  if (e instanceof ExitStatus || e == "unwind") {
    return EXITSTATUS;
  }
  quit_(1, e);
}

function jsStackTrace() {
  var error = new Error();
  if (!error.stack) {
    // IE10+ special cases: It does have callstack info, but it is only
    // populated if an Error object is thrown, so try that as a special-case.
    try {
      throw new Error();
    } catch (e) {
      error = e;
    }
    if (!error.stack) {
      return "(no stack trace available)";
    }
  }
  return error.stack.toString();
}

/**
 * @param {number} ptr
 * @param {number} value
 * @param {string} type
 */
function setValue(ptr, value, type = "i8") {
  if (type.endsWith("*")) type = "i32";
  switch (type) {
    case "i1":
      HEAP8[ptr >> 0] = value;
      break;
    case "i8":
      HEAP8[ptr >> 0] = value;
      break;
    case "i16":
      HEAP16[ptr >> 1] = value;
      break;
    case "i32":
      HEAP32[ptr >> 2] = value;
      break;
    case "i64":
      (tempI64 = [
        value >>> 0,
        ((tempDouble = value),
        +Math.abs(tempDouble) >= 1.0
          ? tempDouble > 0.0
            ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) |
                0) >>>
              0
            : ~~+Math.ceil(
                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0
              ) >>> 0
          : 0),
      ]),
        (HEAP32[ptr >> 2] = tempI64[0]),
        (HEAP32[(ptr + 4) >> 2] = tempI64[1]);
      break;
    case "float":
      HEAPF32[ptr >> 2] = value;
      break;
    case "double":
      HEAPF64[ptr >> 3] = value;
      break;
    default:
      abort("invalid type for setValue: " + type);
  }
}

function setWasmTableEntry(idx, func) {
  wasmTable.set(idx, func);
  // With ABORT_ON_WASM_EXCEPTIONS wasmTable.get is overriden to return wrapped
  // functions so we need to call it here to retrieve the potential wrapper correctly
  // instead of just storing 'func' directly into wasmTableMirror
  wasmTableMirror[idx] = wasmTable.get(idx);
}

function stackTrace() {
  var js = jsStackTrace();
  if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
  return demangleAll(js);
}

function getRandomDevice() {
  if (
    typeof crypto == "object" &&
    typeof crypto["getRandomValues"] == "function"
  ) {
    // for modern web browsers
    var randomBuffer = new Uint8Array(1);
    return function () {
      crypto.getRandomValues(randomBuffer);
      return randomBuffer[0];
    };
  } else if (ENVIRONMENT_IS_NODE) {
    // for nodejs with or without crypto support included
    try {
      var crypto_module = require("crypto");
      // nodejs has crypto support
      return function () {
        return crypto_module["randomBytes"](1)[0];
      };
    } catch (e) {
      // nodejs doesn't have crypto support
    }
  }
  // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
  return function () {
    abort("randomDevice");
  };
}

var PATH = {
  isAbs: (path) => path.charAt(0) === "/",
  splitPath: (filename) => {
    var splitPathRe =
      /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    return splitPathRe.exec(filename).slice(1);
  },
  normalizeArray: (parts, allowAboveRoot) => {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === ".") {
        parts.splice(i, 1);
      } else if (last === "..") {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }
    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (; up; up--) {
        parts.unshift("..");
      }
    }
    return parts;
  },
  normalize: (path) => {
    var isAbsolute = PATH.isAbs(path),
      trailingSlash = path.substr(-1) === "/";
    // Normalize the path
    path = PATH.normalizeArray(
      path.split("/").filter((p) => !!p),
      !isAbsolute
    ).join("/");
    if (!path && !isAbsolute) {
      path = ".";
    }
    if (path && trailingSlash) {
      path += "/";
    }
    return (isAbsolute ? "/" : "") + path;
  },
  dirname: (path) => {
    var result = PATH.splitPath(path),
      root = result[0],
      dir = result[1];
    if (!root && !dir) {
      // No dirname whatsoever
      return ".";
    }
    if (dir) {
      // It has a dirname, strip trailing slash
      dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
  },
  basename: (path) => {
    // EMSCRIPTEN return '/'' for '/', not an empty string
    if (path === "/") return "/";
    path = PATH.normalize(path);
    path = path.replace(/\/$/, "");
    var lastSlash = path.lastIndexOf("/");
    if (lastSlash === -1) return path;
    return path.substr(lastSlash + 1);
  },
  join: function () {
    var paths = Array.prototype.slice.call(arguments, 0);
    return PATH.normalize(paths.join("/"));
  },
  join2: (l, r) => {
    return PATH.normalize(l + "/" + r);
  },
};

var PATH_FS = {
  resolve: function () {
    var resolvedPath = "",
      resolvedAbsolute = false;
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = i >= 0 ? arguments[i] : FS.cwd();
      // Skip empty and invalid entries
      if (typeof path != "string") {
        throw new TypeError("Arguments to path.resolve must be strings");
      } else if (!path) {
        return ""; // an invalid portion invalidates the whole thing
      }
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = PATH.isAbs(path);
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    resolvedPath = PATH.normalizeArray(
      resolvedPath.split("/").filter((p) => !!p),
      !resolvedAbsolute
    ).join("/");
    return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
  },
  relative: (from, to) => {
    from = PATH_FS.resolve(from).substr(1);
    to = PATH_FS.resolve(to).substr(1);
    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== "") break;
      }
      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== "") break;
      }
      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }
    var fromParts = trim(from.split("/"));
    var toParts = trim(to.split("/"));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push("..");
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join("/");
  },
};

var TTY = {
  ttys: [],
  init: function () {
    // https://github.com/emscripten-core/emscripten/pull/1555
    // if (ENVIRONMENT_IS_NODE) {
    //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
    //   // device, it always assumes it's a TTY device. because of this, we're forcing
    //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
    //   // with text files until FS.init can be refactored.
    //   process['stdin']['setEncoding']('utf8');
    // }
  },
  shutdown: function () {
    // https://github.com/emscripten-core/emscripten/pull/1555
    // if (ENVIRONMENT_IS_NODE) {
    //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
    //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
    //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
    //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
    //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
    //   process['stdin']['pause']();
    // }
  },
  register: function (dev, ops) {
    TTY.ttys[dev] = { input: [], output: [], ops: ops };
    FS.registerDevice(dev, TTY.stream_ops);
  },
  stream_ops: {
    open: function (stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    },
    close: function (stream) {
      // flush any pending line data
      stream.tty.ops.flush(stream.tty);
    },
    flush: function (stream) {
      stream.tty.ops.flush(stream.tty);
    },
    read: function (stream, buffer, offset, length, pos /* ignored */) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i = 0; i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === undefined) break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now();
      }
      return bytesRead;
    },
    write: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.timestamp = Date.now();
      }
      return i;
    },
  },
  default_tty_ops: {
    get_char: function (tty) {
      if (!tty.input.length) {
        var result = null;
        if (ENVIRONMENT_IS_NODE) {
          // we will read data by chunks of BUFSIZE
          var BUFSIZE = 256;
          var buf = Buffer.alloc(BUFSIZE);
          var bytesRead = 0;

          try {
            bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, -1);
          } catch (e) {
            // Cross-platform differences: on Windows, reading EOF throws an exception, but on other OSes,
            // reading EOF returns 0. Uniformize behavior by treating the EOF exception to return 0.
            if (e.toString().includes("EOF")) bytesRead = 0;
            else throw e;
          }

          if (bytesRead > 0) {
            result = buf.slice(0, bytesRead).toString("utf-8");
          } else {
            result = null;
          }
        } else if (
          typeof window != "undefined" &&
          typeof window.prompt == "function"
        ) {
          // Browser.
          result = window.prompt("Input: "); // returns null on cancel
          if (result !== null) {
            result += "\n";
          }
        } else if (typeof readline == "function") {
          // Command line.
          result = readline();
          if (result !== null) {
            result += "\n";
          }
        }
        if (!result) {
          return null;
        }
        tty.input = intArrayFromString(result, true);
      }
      return tty.input.shift();
    },
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    },
  },
  default_tty1_ops: {
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    },
  },
};

function zeroMemory(address, size) {
  HEAPU8.fill(0, address, address + size);
}

function alignMemory(size, alignment) {
  return Math.ceil(size / alignment) * alignment;
}
function mmapAlloc(size) {
  abort();
}
var MEMFS = {
  ops_table: null,
  mount: function (mount) {
    return MEMFS.createNode(null, "/", 16384 | 511 /* 0777 */, 0);
  },
  createNode: function (parent, name, mode, dev) {
    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
      // no supported
      throw new FS.ErrnoError(63);
    }
    if (!MEMFS.ops_table) {
      MEMFS.ops_table = {
        dir: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink,
          },
          stream: {
            llseek: MEMFS.stream_ops.llseek,
          },
        },
        file: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
          },
          stream: {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap,
            msync: MEMFS.stream_ops.msync,
          },
        },
        link: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink,
          },
          stream: {},
        },
        chrdev: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
          },
          stream: FS.chrdev_stream_ops,
        },
      };
    }
    var node = FS.createNode(parent, name, mode, dev);
    if (FS.isDir(node.mode)) {
      node.node_ops = MEMFS.ops_table.dir.node;
      node.stream_ops = MEMFS.ops_table.dir.stream;
      node.contents = {};
    } else if (FS.isFile(node.mode)) {
      node.node_ops = MEMFS.ops_table.file.node;
      node.stream_ops = MEMFS.ops_table.file.stream;
      node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
      // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
      // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
      // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
      node.contents = null;
    } else if (FS.isLink(node.mode)) {
      node.node_ops = MEMFS.ops_table.link.node;
      node.stream_ops = MEMFS.ops_table.link.stream;
    } else if (FS.isChrdev(node.mode)) {
      node.node_ops = MEMFS.ops_table.chrdev.node;
      node.stream_ops = MEMFS.ops_table.chrdev.stream;
    }
    node.timestamp = Date.now();
    // add the new node to the parent
    if (parent) {
      parent.contents[name] = node;
      parent.timestamp = node.timestamp;
    }
    return node;
  },
  getFileDataAsTypedArray: function (node) {
    if (!node.contents) return new Uint8Array(0);
    if (node.contents.subarray)
      return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
    return new Uint8Array(node.contents);
  },
  expandFileStorage: function (node, newCapacity) {
    var prevCapacity = node.contents ? node.contents.length : 0;
    if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
    // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
    // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
    // avoid overshooting the allocation cap by a very large margin.
    var CAPACITY_DOUBLING_MAX = 1024 * 1024;
    newCapacity = Math.max(
      newCapacity,
      (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>>
        0
    );
    if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
    var oldContents = node.contents;
    node.contents = new Uint8Array(newCapacity); // Allocate new storage.
    if (node.usedBytes > 0)
      node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
  },
  resizeFileStorage: function (node, newSize) {
    if (node.usedBytes == newSize) return;
    if (newSize == 0) {
      node.contents = null; // Fully decommit when requesting a resize to zero.
      node.usedBytes = 0;
    } else {
      var oldContents = node.contents;
      node.contents = new Uint8Array(newSize); // Allocate new storage.
      if (oldContents) {
        node.contents.set(
          oldContents.subarray(0, Math.min(newSize, node.usedBytes))
        ); // Copy old data over to the new storage.
      }
      node.usedBytes = newSize;
    }
  },
  node_ops: {
    getattr: function (node) {
      var attr = {};
      // device numbers reuse inode numbers.
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.timestamp);
      attr.mtime = new Date(node.timestamp);
      attr.ctime = new Date(node.timestamp);
      // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
      //       but this is not required by the standard.
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    },
    setattr: function (node, attr) {
      if (attr.mode !== undefined) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== undefined) {
        node.timestamp = attr.timestamp;
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    },
    lookup: function (parent, name) {
      throw FS.genericErrors[44];
    },
    mknod: function (parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    },
    rename: function (old_node, new_dir, new_name) {
      // if we're overwriting a directory at new_name, make sure it's empty.
      if (FS.isDir(old_node.mode)) {
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (new_node) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
      }
      // do the internal rewiring
      delete old_node.parent.contents[old_node.name];
      old_node.parent.timestamp = Date.now();
      old_node.name = new_name;
      new_dir.contents[new_name] = old_node;
      new_dir.timestamp = old_node.parent.timestamp;
      old_node.parent = new_dir;
    },
    unlink: function (parent, name) {
      delete parent.contents[name];
      parent.timestamp = Date.now();
    },
    rmdir: function (parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.timestamp = Date.now();
    },
    readdir: function (node) {
      var entries = [".", ".."];
      for (var key in node.contents) {
        if (!node.contents.hasOwnProperty(key)) {
          continue;
        }
        entries.push(key);
      }
      return entries;
    },
    symlink: function (parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
      node.link = oldpath;
      return node;
    },
    readlink: function (node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    },
  },
  stream_ops: {
    read: function (stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (size > 8 && contents.subarray) {
        // non-trivial, and typed array
        buffer.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0; i < size; i++)
          buffer[offset + i] = contents[position + i];
      }
      return size;
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
      if (!length) return 0;
      var node = stream.node;
      node.timestamp = Date.now();

      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        // This write is from a typed array to a typed array?
        if (canOwn) {
          node.contents = buffer.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
          node.contents = buffer.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          // Writing to an already allocated and used subrange of the file?
          node.contents.set(buffer.subarray(offset, offset + length), position);
          return length;
        }
      }

      // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer.subarray) {
        // Use typed array write which is available.
        node.contents.set(buffer.subarray(offset, offset + length), position);
      } else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    },
    llseek: function (stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    },
    allocate: function (stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    },
    mmap: function (stream, length, position, prot, flags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      // Only make a new copy when MAP_PRIVATE is specified.
      if (!(flags & 2) && contents.buffer === buffer) {
        // We can't emulate MAP_SHARED when the file is not backed by the buffer
        // we're mapping to (e.g. the HEAP buffer).
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        // Try to avoid unnecessary slices.
        if (position > 0 || position + length < contents.length) {
          if (contents.subarray) {
            contents = contents.subarray(position, position + length);
          } else {
            contents = Array.prototype.slice.call(
              contents,
              position,
              position + length
            );
          }
        }
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        HEAP8.set(contents, ptr);
      }
      return { ptr: ptr, allocated: allocated };
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (mmapFlags & 2) {
        // MAP_PRIVATE calls need not to be synced back to underlying fs
        return 0;
      }

      var bytesWritten = MEMFS.stream_ops.write(
        stream,
        buffer,
        0,
        length,
        offset,
        false
      );
      // should we check if bytesWritten and length are the same?
      return 0;
    },
  },
};

/** @param {boolean=} noRunDep */
function asyncLoad(url, onload, onerror, noRunDep) {
  var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
  readAsync(
    url,
    function (arrayBuffer) {
      assert(
        arrayBuffer,
        'Loading data file "' + url + '" failed (no arrayBuffer).'
      );
      onload(new Uint8Array(arrayBuffer));
      if (dep) removeRunDependency(dep);
    },
    function (event) {
      if (onerror) {
        onerror();
      } else {
        throw 'Loading data file "' + url + '" failed.';
      }
    }
  );
  if (dep) addRunDependency(dep);
}

var IDBFS = {
  dbs: {},
  indexedDB: () => {
    if (typeof indexedDB != "undefined") return indexedDB;
    var ret = null;
    if (typeof window == "object")
      ret =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB;
    assert(ret, "IDBFS used, but indexedDB not supported");
    return ret;
  },
  DB_VERSION: 21,
  DB_STORE_NAME: "FILE_DATA",
  mount: function (mount) {
    // reuse all of the core MEMFS functionality
    return MEMFS.mount.apply(null, arguments);
  },
  syncfs: (mount, populate, callback) => {
    IDBFS.getLocalSet(mount, (err, local) => {
      if (err) return callback(err);

      IDBFS.getRemoteSet(mount, (err, remote) => {
        if (err) return callback(err);

        var src = populate ? remote : local;
        var dst = populate ? local : remote;

        IDBFS.reconcile(src, dst, callback);
      });
    });
  },
  quit: () => {
    Object.values(IDBFS.dbs).forEach((value) => value.close());
    IDBFS.dbs = {};
  },
  getDB: (name, callback) => {
    // check the cache first
    var db = IDBFS.dbs[name];
    if (db) {
      return callback(null, db);
    }

    var req;
    try {
      req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
    } catch (e) {
      return callback(e);
    }
    if (!req) {
      return callback("Unable to connect to IndexedDB");
    }
    req.onupgradeneeded = (e) => {
      var db = /** @type {IDBDatabase} */ (e.target.result);
      var transaction = e.target.transaction;

      var fileStore;

      if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
        fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
      } else {
        fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
      }

      if (!fileStore.indexNames.contains("timestamp")) {
        fileStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
    req.onsuccess = () => {
      db = /** @type {IDBDatabase} */ (req.result);

      // add to the cache
      IDBFS.dbs[name] = db;
      callback(null, db);
    };
    req.onerror = (e) => {
      callback(this.error);
      e.preventDefault();
    };
  },
  getLocalSet: (mount, callback) => {
    var entries = {};

    function isRealDir(p) {
      return p !== "." && p !== "..";
    }
    function toAbsolute(root) {
      return (p) => {
        return PATH.join2(root, p);
      };
    }

    var check = FS.readdir(mount.mountpoint)
      .filter(isRealDir)
      .map(toAbsolute(mount.mountpoint));

    while (check.length) {
      var path = check.pop();
      var stat;

      try {
        stat = FS.stat(path);
      } catch (e) {
        return callback(e);
      }

      if (FS.isDir(stat.mode)) {
        check.push.apply(
          check,
          FS.readdir(path).filter(isRealDir).map(toAbsolute(path))
        );
      }

      entries[path] = { timestamp: stat.mtime };
    }

    return callback(null, { type: "local", entries: entries });
  },
  getRemoteSet: (mount, callback) => {
    var entries = {};

    IDBFS.getDB(mount.mountpoint, (err, db) => {
      if (err) return callback(err);

      try {
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readonly");
        transaction.onerror = (e) => {
          callback(this.error);
          e.preventDefault();
        };

        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
        var index = store.index("timestamp");

        index.openKeyCursor().onsuccess = (event) => {
          var cursor = event.target.result;

          if (!cursor) {
            return callback(null, { type: "remote", db: db, entries: entries });
          }

          entries[cursor.primaryKey] = { timestamp: cursor.key };

          cursor.continue();
        };
      } catch (e) {
        return callback(e);
      }
    });
  },
  loadLocalEntry: (path, callback) => {
    var stat, node;

    try {
      var lookup = FS.lookupPath(path);
      node = lookup.node;
      stat = FS.stat(path);
    } catch (e) {
      return callback(e);
    }

    if (FS.isDir(stat.mode)) {
      return callback(null, { timestamp: stat.mtime, mode: stat.mode });
    } else if (FS.isFile(stat.mode)) {
      // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
      // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
      node.contents = MEMFS.getFileDataAsTypedArray(node);
      return callback(null, {
        timestamp: stat.mtime,
        mode: stat.mode,
        contents: node.contents,
      });
    } else {
      return callback(new Error("node type not supported"));
    }
  },
  storeLocalEntry: (path, entry, callback) => {
    try {
      if (FS.isDir(entry["mode"])) {
        FS.mkdirTree(path, entry["mode"]);
      } else if (FS.isFile(entry["mode"])) {
        FS.writeFile(path, entry["contents"], { canOwn: true });
      } else {
        return callback(new Error("node type not supported"));
      }

      FS.chmod(path, entry["mode"]);
      FS.utime(path, entry["timestamp"], entry["timestamp"]);
    } catch (e) {
      return callback(e);
    }

    callback(null);
  },
  removeLocalEntry: (path, callback) => {
    try {
      var stat = FS.stat(path);

      if (FS.isDir(stat.mode)) {
        FS.rmdir(path);
      } else if (FS.isFile(stat.mode)) {
        FS.unlink(path);
      }
    } catch (e) {
      return callback(e);
    }

    callback(null);
  },
  loadRemoteEntry: (store, path, callback) => {
    var req = store.get(path);
    req.onsuccess = (event) => {
      callback(null, event.target.result);
    };
    req.onerror = (e) => {
      callback(this.error);
      e.preventDefault();
    };
  },
  storeRemoteEntry: (store, path, entry, callback) => {
    try {
      var req = store.put(entry, path);
    } catch (e) {
      callback(e);
      return;
    }
    req.onsuccess = () => {
      callback(null);
    };
    req.onerror = (e) => {
      callback(this.error);
      e.preventDefault();
    };
  },
  removeRemoteEntry: (store, path, callback) => {
    var req = store.delete(path);
    req.onsuccess = () => {
      callback(null);
    };
    req.onerror = (e) => {
      callback(this.error);
      e.preventDefault();
    };
  },
  reconcile: (src, dst, callback) => {
    var total = 0;

    var create = [];
    Object.keys(src.entries).forEach(function (key) {
      var e = src.entries[key];
      var e2 = dst.entries[key];
      if (!e2 || e["timestamp"].getTime() != e2["timestamp"].getTime()) {
        create.push(key);
        total++;
      }
    });

    var remove = [];
    Object.keys(dst.entries).forEach(function (key) {
      if (!src.entries[key]) {
        remove.push(key);
        total++;
      }
    });

    if (!total) {
      return callback(null);
    }

    var errored = false;
    var db = src.type === "remote" ? src.db : dst.db;
    var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readwrite");
    var store = transaction.objectStore(IDBFS.DB_STORE_NAME);

    function done(err) {
      if (err && !errored) {
        errored = true;
        return callback(err);
      }
    }

    transaction.onerror = (e) => {
      done(this.error);
      e.preventDefault();
    };

    transaction.oncomplete = (e) => {
      if (!errored) {
        callback(null);
      }
    };

    // sort paths in ascending order so directory entries are created
    // before the files inside them
    create.sort().forEach((path) => {
      if (dst.type === "local") {
        IDBFS.loadRemoteEntry(store, path, (err, entry) => {
          if (err) return done(err);
          IDBFS.storeLocalEntry(path, entry, done);
        });
      } else {
        IDBFS.loadLocalEntry(path, (err, entry) => {
          if (err) return done(err);
          IDBFS.storeRemoteEntry(store, path, entry, done);
        });
      }
    });

    // sort paths in descending order so files are deleted before their
    // parent directories
    remove
      .sort()
      .reverse()
      .forEach((path) => {
        if (dst.type === "local") {
          IDBFS.removeLocalEntry(path, done);
        } else {
          IDBFS.removeRemoteEntry(store, path, done);
        }
      });
  },
};
window.IDBFS = IDBFS
var FS = {
  root: null,
  mounts: [],
  devices: {},
  streams: [],
  nextInode: 1,
  nameTable: null,
  currentPath: "/",
  initialized: false,
  ignorePermissions: true,
  ErrnoError: null,
  genericErrors: {},
  filesystems: null,
  syncFSRequests: 0,
  lookupPath: (path, opts = {}) => {
    path = PATH_FS.resolve(FS.cwd(), path);

    if (!path) return { path: "", node: null };

    var defaults = {
      follow_mount: true,
      recurse_count: 0,
    };
    opts = Object.assign(defaults, opts);

    if (opts.recurse_count > 8) {
      // max recursive lookup of 8
      throw new FS.ErrnoError(32);
    }

    // split the path
    var parts = PATH.normalizeArray(
      path.split("/").filter((p) => !!p),
      false
    );

    // start at the root
    var current = FS.root;
    var current_path = "/";

    for (var i = 0; i < parts.length; i++) {
      var islast = i === parts.length - 1;
      if (islast && opts.parent) {
        // stop resolving
        break;
      }

      current = FS.lookupNode(current, parts[i]);
      current_path = PATH.join2(current_path, parts[i]);

      // jump to the mount's root node if this is a mountpoint
      if (FS.isMountpoint(current)) {
        if (!islast || (islast && opts.follow_mount)) {
          current = current.mounted.root;
        }
      }

      // by default, lookupPath will not follow a symlink if it is the final path component.
      // setting opts.follow = true will override this behavior.
      if (!islast || opts.follow) {
        var count = 0;
        while (FS.isLink(current.mode)) {
          var link = FS.readlink(current_path);
          current_path = PATH_FS.resolve(PATH.dirname(current_path), link);

          var lookup = FS.lookupPath(current_path, {
            recurse_count: opts.recurse_count + 1,
          });
          current = lookup.node;

          if (count++ > 40) {
            // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
            throw new FS.ErrnoError(32);
          }
        }
      }
    }

    return { path: current_path, node: current };
  },
  getPath: (node) => {
    var path;
    while (true) {
      if (FS.isRoot(node)) {
        var mount = node.mount.mountpoint;
        if (!path) return mount;
        return mount[mount.length - 1] !== "/"
          ? mount + "/" + path
          : mount + path;
      }
      path = path ? node.name + "/" + path : node.name;
      node = node.parent;
    }
  },
  hashName: (parentid, name) => {
    var hash = 0;

    for (var i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    }
    return ((parentid + hash) >>> 0) % FS.nameTable.length;
  },
  hashAddNode: (node) => {
    var hash = FS.hashName(node.parent.id, node.name);
    node.name_next = FS.nameTable[hash];
    FS.nameTable[hash] = node;
  },
  hashRemoveNode: (node) => {
    var hash = FS.hashName(node.parent.id, node.name);
    if (FS.nameTable[hash] === node) {
      FS.nameTable[hash] = node.name_next;
    } else {
      var current = FS.nameTable[hash];
      while (current) {
        if (current.name_next === node) {
          current.name_next = node.name_next;
          break;
        }
        current = current.name_next;
      }
    }
  },
  lookupNode: (parent, name) => {
    var errCode = FS.mayLookup(parent);
    if (errCode) {
      throw new FS.ErrnoError(errCode, parent);
    }
    var hash = FS.hashName(parent.id, name);
    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
      var nodeName = node.name;
      if (node.parent.id === parent.id && nodeName === name) {
        return node;
      }
    }
    // if we failed to find it in the cache, call into the VFS
    return FS.lookup(parent, name);
  },
  createNode: (parent, name, mode, rdev) => {
    var node = new FS.FSNode(parent, name, mode, rdev);

    FS.hashAddNode(node);

    return node;
  },
  destroyNode: (node) => {
    FS.hashRemoveNode(node);
  },
  isRoot: (node) => {
    return node === node.parent;
  },
  isMountpoint: (node) => {
    return !!node.mounted;
  },
  isFile: (mode) => {
    return (mode & 61440) === 32768;
  },
  isDir: (mode) => {
    return (mode & 61440) === 16384;
  },
  isLink: (mode) => {
    return (mode & 61440) === 40960;
  },
  isChrdev: (mode) => {
    return (mode & 61440) === 8192;
  },
  isBlkdev: (mode) => {
    return (mode & 61440) === 24576;
  },
  isFIFO: (mode) => {
    return (mode & 61440) === 4096;
  },
  isSocket: (mode) => {
    return (mode & 49152) === 49152;
  },
  flagModes: { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 },
  modeStringToFlags: (str) => {
    var flags = FS.flagModes[str];
    if (typeof flags == "undefined") {
      throw new Error("Unknown file open mode: " + str);
    }
    return flags;
  },
  flagsToPermissionString: (flag) => {
    var perms = ["r", "w", "rw"][flag & 3];
    if (flag & 512) {
      perms += "w";
    }
    return perms;
  },
  nodePermissions: (node, perms) => {
    if (FS.ignorePermissions) {
      return 0;
    }
    // return 0 if any user, group or owner bits are set.
    if (perms.includes("r") && !(node.mode & 292)) {
      return 2;
    } else if (perms.includes("w") && !(node.mode & 146)) {
      return 2;
    } else if (perms.includes("x") && !(node.mode & 73)) {
      return 2;
    }
    return 0;
  },
  mayLookup: (dir) => {
    var errCode = FS.nodePermissions(dir, "x");
    if (errCode) return errCode;
    if (!dir.node_ops.lookup) return 2;
    return 0;
  },
  mayCreate: (dir, name) => {
    try {
      var node = FS.lookupNode(dir, name);
      return 20;
    } catch (e) {}
    return FS.nodePermissions(dir, "wx");
  },
  mayDelete: (dir, name, isdir) => {
    var node;
    try {
      node = FS.lookupNode(dir, name);
    } catch (e) {
      return e.errno;
    }
    var errCode = FS.nodePermissions(dir, "wx");
    if (errCode) {
      return errCode;
    }
    if (isdir) {
      if (!FS.isDir(node.mode)) {
        return 54;
      }
      if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
        return 10;
      }
    } else {
      if (FS.isDir(node.mode)) {
        return 31;
      }
    }
    return 0;
  },
  mayOpen: (node, flags) => {
    if (!node) {
      return 44;
    }
    if (FS.isLink(node.mode)) {
      return 32;
    } else if (FS.isDir(node.mode)) {
      if (
        FS.flagsToPermissionString(flags) !== "r" || // opening for write
        flags & 512
      ) {
        // TODO: check for O_SEARCH? (== search for dir only)
        return 31;
      }
    }
    return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
  },
  MAX_OPEN_FDS: 4096,
  nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
    for (var fd = fd_start; fd <= fd_end; fd++) {
      if (!FS.streams[fd]) {
        return fd;
      }
    }
    throw new FS.ErrnoError(33);
  },
  getStream: (fd) => FS.streams[fd],
  createStream: (stream, fd_start, fd_end) => {
    if (!FS.FSStream) {
      FS.FSStream = /** @constructor */ function () {
        this.shared = {};
      };
      FS.FSStream.prototype = {
        object: {
          get: function () {
            return this.node;
          },
          set: function (val) {
            this.node = val;
          },
        },
        isRead: {
          get: function () {
            return (this.flags & 2097155) !== 1;
          },
        },
        isWrite: {
          get: function () {
            return (this.flags & 2097155) !== 0;
          },
        },
        isAppend: {
          get: function () {
            return this.flags & 1024;
          },
        },
        flags: {
          get: function () {
            return this.shared.flags;
          },
          set: function (val) {
            this.shared.flags = val;
          },
        },
        position: {
          get function() {
            return this.shared.position;
          },
          set: function (val) {
            this.shared.position = val;
          },
        },
      };
    }
    // clone it, so we can return an instance of FSStream
    stream = Object.assign(new FS.FSStream(), stream);
    var fd = FS.nextfd(fd_start, fd_end);
    stream.fd = fd;
    FS.streams[fd] = stream;
    return stream;
  },
  closeStream: (fd) => {
    FS.streams[fd] = null;
  },
  chrdev_stream_ops: {
    open: (stream) => {
      var device = FS.getDevice(stream.node.rdev);
      // override node's stream ops with the device's
      stream.stream_ops = device.stream_ops;
      // forward the open call
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
    },
    llseek: () => {
      throw new FS.ErrnoError(70);
    },
  },
  major: (dev) => dev >> 8,
  minor: (dev) => dev & 0xff,
  makedev: (ma, mi) => (ma << 8) | mi,
  registerDevice: (dev, ops) => {
    FS.devices[dev] = { stream_ops: ops };
  },
  getDevice: (dev) => FS.devices[dev],
  getMounts: (mount) => {
    var mounts = [];
    var check = [mount];

    while (check.length) {
      var m = check.pop();

      mounts.push(m);

      check.push.apply(check, m.mounts);
    }

    return mounts;
  },
  syncfs: (populate, callback) => {
    if (typeof populate == "function") {
      callback = populate;
      populate = false;
    }

    FS.syncFSRequests++;

    if (FS.syncFSRequests > 1) {
      err(
        "warning: " +
          FS.syncFSRequests +
          " FS.syncfs operations in flight at once, probably just doing extra work"
      );
    }

    var mounts = FS.getMounts(FS.root.mount);
    var completed = 0;

    function doCallback(errCode) {
      FS.syncFSRequests--;
      return callback(errCode);
    }

    function done(errCode) {
      if (errCode) {
        if (!done.errored) {
          done.errored = true;
          return doCallback(errCode);
        }
        return;
      }
      if (++completed >= mounts.length) {
        doCallback(null);
      }
    }

    // sync all mounts
    mounts.forEach((mount) => {
      if (!mount.type.syncfs) {
        return done(null);
      }
      mount.type.syncfs(mount, populate, done);
    });
  },
  mount: (type, opts, mountpoint) => {
    var root = mountpoint === "/";
    var pseudo = !mountpoint;
    var node;

    if (root && FS.root) {
      throw new FS.ErrnoError(10);
    } else if (!root && !pseudo) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });

      mountpoint = lookup.path; // use the absolute path
      node = lookup.node;

      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }

      if (!FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
    }

    var mount = {
      type: type,
      opts: opts,
      mountpoint: mountpoint,
      mounts: [],
    };

    // create a root node for the fs
    var mountRoot = type.mount(mount);
    mountRoot.mount = mount;
    mount.root = mountRoot;

    if (root) {
      FS.root = mountRoot;
    } else if (node) {
      // set as a mountpoint
      node.mounted = mount;

      // add the new mount to the current mount's children
      if (node.mount) {
        node.mount.mounts.push(mount);
      }
    }

    return mountRoot;
  },
  unmount: (mountpoint) => {
    var lookup = FS.lookupPath(mountpoint, { follow_mount: false });

    if (!FS.isMountpoint(lookup.node)) {
      throw new FS.ErrnoError(28);
    }

    // destroy the nodes for this mount, and all its child mounts
    var node = lookup.node;
    var mount = node.mounted;
    var mounts = FS.getMounts(mount);

    Object.keys(FS.nameTable).forEach((hash) => {
      var current = FS.nameTable[hash];

      while (current) {
        var next = current.name_next;

        if (mounts.includes(current.mount)) {
          FS.destroyNode(current);
        }

        current = next;
      }
    });

    // no longer a mountpoint
    node.mounted = null;

    // remove this mount from the child mounts
    var idx = node.mount.mounts.indexOf(mount);
    node.mount.mounts.splice(idx, 1);
  },
  lookup: (parent, name) => {
    return parent.node_ops.lookup(parent, name);
  },
  mknod: (path, mode, dev) => {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    if (!name || name === "." || name === "..") {
      throw new FS.ErrnoError(28);
    }
    var errCode = FS.mayCreate(parent, name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.mknod) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.mknod(parent, name, mode, dev);
  },
  create: (path, mode) => {
    mode = mode !== undefined ? mode : 438 /* 0666 */;
    mode &= 4095;
    mode |= 32768;
    return FS.mknod(path, mode, 0);
  },
  mkdir: (path, mode) => {
    mode = mode !== undefined ? mode : 511 /* 0777 */;
    mode &= 511 | 512;
    mode |= 16384;
    return FS.mknod(path, mode, 0);
  },
  mkdirTree: (path, mode) => {
    var dirs = path.split("/");
    var d = "";
    for (var i = 0; i < dirs.length; ++i) {
      if (!dirs[i]) continue;
      d += "/" + dirs[i];
      try {
        FS.mkdir(d, mode);
      } catch (e) {
        if (e.errno != 20) throw e;
      }
    }
  },
  mkdev: (path, mode, dev) => {
    if (typeof dev == "undefined") {
      dev = mode;
      mode = 438 /* 0666 */;
    }
    mode |= 8192;
    return FS.mknod(path, mode, dev);
  },
  symlink: (oldpath, newpath) => {
    if (!PATH_FS.resolve(oldpath)) {
      throw new FS.ErrnoError(44);
    }
    var lookup = FS.lookupPath(newpath, { parent: true });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var newname = PATH.basename(newpath);
    var errCode = FS.mayCreate(parent, newname);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.symlink) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.symlink(parent, newname, oldpath);
  },
  rename: (old_path, new_path) => {
    var old_dirname = PATH.dirname(old_path);
    var new_dirname = PATH.dirname(new_path);
    var old_name = PATH.basename(old_path);
    var new_name = PATH.basename(new_path);
    // parents must exist
    var lookup, old_dir, new_dir;

    // let the errors from non existant directories percolate up
    lookup = FS.lookupPath(old_path, { parent: true });
    old_dir = lookup.node;
    lookup = FS.lookupPath(new_path, { parent: true });
    new_dir = lookup.node;

    if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
    // need to be part of the same mount
    if (old_dir.mount !== new_dir.mount) {
      throw new FS.ErrnoError(75);
    }
    // source must exist
    var old_node = FS.lookupNode(old_dir, old_name);
    // old path should not be an ancestor of the new path
    var relative = PATH_FS.relative(old_path, new_dirname);
    if (relative.charAt(0) !== ".") {
      throw new FS.ErrnoError(28);
    }
    // new path should not be an ancestor of the old path
    relative = PATH_FS.relative(new_path, old_dirname);
    if (relative.charAt(0) !== ".") {
      throw new FS.ErrnoError(55);
    }
    // see if the new path already exists
    var new_node;
    try {
      new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {
      // not fatal
    }
    // early out if nothing needs to change
    if (old_node === new_node) {
      return;
    }
    // we'll need to delete the old entry
    var isdir = FS.isDir(old_node.mode);
    var errCode = FS.mayDelete(old_dir, old_name, isdir);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    // need delete permissions if we'll be overwriting.
    // need create permissions if new doesn't already exist.
    errCode = new_node
      ? FS.mayDelete(new_dir, new_name, isdir)
      : FS.mayCreate(new_dir, new_name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!old_dir.node_ops.rename) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
      throw new FS.ErrnoError(10);
    }
    // if we are going to change the parent, check write permissions
    if (new_dir !== old_dir) {
      errCode = FS.nodePermissions(old_dir, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    // remove the node from the lookup hash
    FS.hashRemoveNode(old_node);
    // do the underlying fs rename
    try {
      old_dir.node_ops.rename(old_node, new_dir, new_name);
    } catch (e) {
      throw e;
    } finally {
      // add the node back to the hash (in case node_ops.rename
      // changed its name)
      FS.hashAddNode(old_node);
    }
  },
  rmdir: (path) => {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, true);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.rmdir) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.rmdir(parent, name);
    FS.destroyNode(node);
  },
  readdir: (path) => {
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    if (!node.node_ops.readdir) {
      throw new FS.ErrnoError(54);
    }
    return node.node_ops.readdir(node);
  },
  unlink: (path) => {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, false);
    if (errCode) {
      // According to POSIX, we should map EISDIR to EPERM, but
      // we instead do what Linux does (and we must, as we use
      // the musl linux libc).
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.unlink) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.unlink(parent, name);
    FS.destroyNode(node);
  },
  readlink: (path) => {
    var lookup = FS.lookupPath(path);
    var link = lookup.node;
    if (!link) {
      throw new FS.ErrnoError(44);
    }
    if (!link.node_ops.readlink) {
      throw new FS.ErrnoError(28);
    }
    return PATH_FS.resolve(
      FS.getPath(link.parent),
      link.node_ops.readlink(link)
    );
  },
  stat: (path, dontFollow) => {
    var lookup = FS.lookupPath(path, { follow: !dontFollow });
    var node = lookup.node;
    if (!node) {
      throw new FS.ErrnoError(44);
    }
    if (!node.node_ops.getattr) {
      throw new FS.ErrnoError(63);
    }
    return node.node_ops.getattr(node);
  },
  lstat: (path) => {
    return FS.stat(path, true);
  },
  chmod: (path, mode, dontFollow) => {
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    node.node_ops.setattr(node, {
      mode: (mode & 4095) | (node.mode & ~4095),
      timestamp: Date.now(),
    });
  },
  lchmod: (path, mode) => {
    FS.chmod(path, mode, true);
  },
  fchmod: (fd, mode) => {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    FS.chmod(stream.node, mode);
  },
  chown: (path, uid, gid, dontFollow) => {
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    node.node_ops.setattr(node, {
      timestamp: Date.now(),
      // we ignore the uid / gid for now
    });
  },
  lchown: (path, uid, gid) => {
    FS.chown(path, uid, gid, true);
  },
  fchown: (fd, uid, gid) => {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    FS.chown(stream.node, uid, gid);
  },
  truncate: (path, len) => {
    if (len < 0) {
      throw new FS.ErrnoError(28);
    }
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, { follow: true });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isDir(node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!FS.isFile(node.mode)) {
      throw new FS.ErrnoError(28);
    }
    var errCode = FS.nodePermissions(node, "w");
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    node.node_ops.setattr(node, {
      size: len,
      timestamp: Date.now(),
    });
  },
  ftruncate: (fd, len) => {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(28);
    }
    FS.truncate(stream.node, len);
  },
  utime: (path, atime, mtime) => {
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    node.node_ops.setattr(node, {
      timestamp: Math.max(atime, mtime),
    });
  },
  open: (path, flags, mode) => {
    if (path === "") {
      throw new FS.ErrnoError(44);
    }
    flags = typeof flags == "string" ? FS.modeStringToFlags(flags) : flags;
    mode = typeof mode == "undefined" ? 438 /* 0666 */ : mode;
    if (flags & 64) {
      mode = (mode & 4095) | 32768;
    } else {
      mode = 0;
    }
    var node;
    if (typeof path == "object") {
      node = path;
    } else {
      path = PATH.normalize(path);
      try {
        var lookup = FS.lookupPath(path, {
          follow: !(flags & 131072),
        });
        node = lookup.node;
      } catch (e) {
        // ignore
      }
    }
    // perhaps we need to create the node
    var created = false;
    if (flags & 64) {
      if (node) {
        // if O_CREAT and O_EXCL are set, error out if the node already exists
        if (flags & 128) {
          throw new FS.ErrnoError(20);
        }
      } else {
        // node doesn't exist, try to create it
        node = FS.mknod(path, mode, 0);
        created = true;
      }
    }
    if (!node) {
      throw new FS.ErrnoError(44);
    }
    // can't truncate a device
    if (FS.isChrdev(node.mode)) {
      flags &= ~512;
    }
    // if asked only for a directory, then this must be one
    if (flags & 65536 && !FS.isDir(node.mode)) {
      throw new FS.ErrnoError(54);
    }
    // check permissions, if this is not a file we just created now (it is ok to
    // create and write to a file with read-only permissions; it is read-only
    // for later use)
    if (!created) {
      var errCode = FS.mayOpen(node, flags);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    // do truncation if necessary
    if (flags & 512 && !created) {
      FS.truncate(node, 0);
    }
    // we've already handled these, don't pass down to the underlying vfs
    flags &= ~(128 | 512 | 131072);

    // register the stream with the filesystem
    var stream = FS.createStream({
      node: node,
      path: FS.getPath(node), // we want the absolute path to the node
      flags: flags,
      seekable: true,
      position: 0,
      stream_ops: node.stream_ops,
      // used by the file family libc calls (fopen, fwrite, ferror, etc.)
      ungotten: [],
      error: false,
    });
    // call the new stream's open function
    if (stream.stream_ops.open) {
      stream.stream_ops.open(stream);
    }
    if (Module["logReadFiles"] && !(flags & 1)) {
      if (!FS.readFiles) FS.readFiles = {};
      if (!(path in FS.readFiles)) {
        FS.readFiles[path] = 1;
      }
    }
    return stream;
  },
  close: (stream) => {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (stream.getdents) stream.getdents = null; // free readdir state
    try {
      if (stream.stream_ops.close) {
        stream.stream_ops.close(stream);
      }
    } catch (e) {
      throw e;
    } finally {
      FS.closeStream(stream.fd);
    }
    stream.fd = null;
  },
  isClosed: (stream) => {
    return stream.fd === null;
  },
  llseek: (stream, offset, whence) => {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (!stream.seekable || !stream.stream_ops.llseek) {
      throw new FS.ErrnoError(70);
    }
    if (whence != 0 && whence != 1 && whence != 2) {
      throw new FS.ErrnoError(28);
    }
    stream.position = stream.stream_ops.llseek(stream, offset, whence);
    stream.ungotten = [];
    return stream.position;
  },
  read: (stream, buffer, offset, length, position) => {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.read) {
      throw new FS.ErrnoError(28);
    }
    var seeking = typeof position != "undefined";
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesRead = stream.stream_ops.read(
      stream,
      buffer,
      offset,
      length,
      position
    );
    if (!seeking) stream.position += bytesRead;
    return bytesRead;
  },
  write: (stream, buffer, offset, length, position, canOwn) => {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.write) {
      throw new FS.ErrnoError(28);
    }
    if (stream.seekable && stream.flags & 1024) {
      // seek to the end before writing in append mode
      FS.llseek(stream, 0, 2);
    }
    var seeking = typeof position != "undefined";
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesWritten = stream.stream_ops.write(
      stream,
      buffer,
      offset,
      length,
      position,
      canOwn
    );
    if (!seeking) stream.position += bytesWritten;
    return bytesWritten;
  },
  allocate: (stream, offset, length) => {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (offset < 0 || length <= 0) {
      throw new FS.ErrnoError(28);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8);
    }
    if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(43);
    }
    if (!stream.stream_ops.allocate) {
      throw new FS.ErrnoError(138);
    }
    stream.stream_ops.allocate(stream, offset, length);
  },
  mmap: (stream, length, position, prot, flags) => {
    // User requests writing to file (prot & PROT_WRITE != 0).
    // Checking if we have permissions to write to the file unless
    // MAP_PRIVATE flag is set. According to POSIX spec it is possible
    // to write to file opened in read-only mode with MAP_PRIVATE flag,
    // as all modifications will be visible only in the memory of
    // the current process.
    if (
      (prot & 2) !== 0 &&
      (flags & 2) === 0 &&
      (stream.flags & 2097155) !== 2
    ) {
      throw new FS.ErrnoError(2);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(2);
    }
    if (!stream.stream_ops.mmap) {
      throw new FS.ErrnoError(43);
    }
    return stream.stream_ops.mmap(stream, length, position, prot, flags);
  },
  msync: (stream, buffer, offset, length, mmapFlags) => {
    if (!stream || !stream.stream_ops.msync) {
      return 0;
    }
    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
  },
  munmap: (stream) => 0,
  ioctl: (stream, cmd, arg) => {
    if (!stream.stream_ops.ioctl) {
      throw new FS.ErrnoError(59);
    }
    return stream.stream_ops.ioctl(stream, cmd, arg);
  },
  readFile: (path, opts = {}) => {
    opts.flags = opts.flags || 0;
    opts.encoding = opts.encoding || "binary";
    if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
      throw new Error('Invalid encoding type "' + opts.encoding + '"');
    }
    var ret;
    var stream = FS.open(path, opts.flags);
    var stat = FS.stat(path);
    var length = stat.size;
    var buf = new Uint8Array(length);
    FS.read(stream, buf, 0, length, 0);
    if (opts.encoding === "utf8") {
      ret = UTF8ArrayToString(buf, 0);
    } else if (opts.encoding === "binary") {
      ret = buf;
    }
    FS.close(stream);
    return ret;
  },
  writeFile: (path, data, opts = {}) => {
    opts.flags = opts.flags || 577;
    var stream = FS.open(path, opts.flags, opts.mode);
    if (typeof data == "string") {
      var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
      var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
      FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
    } else if (ArrayBuffer.isView(data)) {
      FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
    } else {
      throw new Error("Unsupported data type");
    }
    FS.close(stream);
  },
  cwd: () => FS.currentPath,
  chdir: (path) => {
    var lookup = FS.lookupPath(path, { follow: true });
    if (lookup.node === null) {
      throw new FS.ErrnoError(44);
    }
    if (!FS.isDir(lookup.node.mode)) {
      throw new FS.ErrnoError(54);
    }
    var errCode = FS.nodePermissions(lookup.node, "x");
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    FS.currentPath = lookup.path;
  },
  createDefaultDirectories: () => {
    FS.mkdir("/tmp");
    FS.mkdir("/home");
    FS.mkdir("/home/web_user");
  },
  createDefaultDevices: () => {
    // create /dev
    FS.mkdir("/dev");
    // setup /dev/null
    FS.registerDevice(FS.makedev(1, 3), {
      read: () => 0,
      write: (stream, buffer, offset, length, pos) => length,
    });
    FS.mkdev("/dev/null", FS.makedev(1, 3));
    // setup /dev/tty and /dev/tty1
    // stderr needs to print output using err() rather than out()
    // so we register a second tty just for it.
    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
    FS.mkdev("/dev/tty", FS.makedev(5, 0));
    FS.mkdev("/dev/tty1", FS.makedev(6, 0));
    // setup /dev/[u]random
    var random_device = getRandomDevice();
    FS.createDevice("/dev", "random", random_device);
    FS.createDevice("/dev", "urandom", random_device);
    // we're not going to emulate the actual shm device,
    // just create the tmp dirs that reside in it commonly
    FS.mkdir("/dev/shm");
    FS.mkdir("/dev/shm/tmp");
  },
  createSpecialDirectories: () => {
    // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
    // name of the stream for fd 6 (see test_unistd_ttyname)
    FS.mkdir("/proc");
    var proc_self = FS.mkdir("/proc/self");
    FS.mkdir("/proc/self/fd");
    FS.mount(
      {
        mount: () => {
          var node = FS.createNode(proc_self, "fd", 16384 | 511 /* 0777 */, 73);
          node.node_ops = {
            lookup: (parent, name) => {
              var fd = +name;
              var stream = FS.getStream(fd);
              if (!stream) throw new FS.ErrnoError(8);
              var ret = {
                parent: null,
                mount: { mountpoint: "fake" },
                node_ops: { readlink: () => stream.path },
              };
              ret.parent = ret; // make it look like a simple root node
              return ret;
            },
          };
          return node;
        },
      },
      {},
      "/proc/self/fd"
    );
  },
  createStandardStreams: () => {
    // TODO deprecate the old functionality of a single
    // input / output callback and that utilizes FS.createDevice
    // and instead require a unique set of stream ops

    // by default, we symlink the standard streams to the
    // default tty devices. however, if the standard streams
    // have been overwritten we create a unique device for
    // them instead.
    if (Module["stdin"]) {
      FS.createDevice("/dev", "stdin", Module["stdin"]);
    } else {
      FS.symlink("/dev/tty", "/dev/stdin");
    }
    if (Module["stdout"]) {
      FS.createDevice("/dev", "stdout", null, Module["stdout"]);
    } else {
      FS.symlink("/dev/tty", "/dev/stdout");
    }
    if (Module["stderr"]) {
      FS.createDevice("/dev", "stderr", null, Module["stderr"]);
    } else {
      FS.symlink("/dev/tty1", "/dev/stderr");
    }

    // open default streams for the stdin, stdout and stderr devices
    var stdin = FS.open("/dev/stdin", 0);
    var stdout = FS.open("/dev/stdout", 1);
    var stderr = FS.open("/dev/stderr", 1);
  },
  ensureErrnoError: () => {
    if (FS.ErrnoError) return;
    FS.ErrnoError = /** @this{Object} */ function ErrnoError(errno, node) {
      this.node = node;
      this.setErrno = /** @this{Object} */ function (errno) {
        this.errno = errno;
      };
      this.setErrno(errno);
      this.message = "FS error";
    };
    FS.ErrnoError.prototype = new Error();
    FS.ErrnoError.prototype.constructor = FS.ErrnoError;
    // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
    [44].forEach((code) => {
      FS.genericErrors[code] = new FS.ErrnoError(code);
      FS.genericErrors[code].stack = "<generic error, no stack>";
    });
  },
  staticInit: () => {
    FS.ensureErrnoError();

    FS.nameTable = new Array(4096);

    FS.mount(MEMFS, {}, "/");

    FS.createDefaultDirectories();
    FS.createDefaultDevices();
    FS.createSpecialDirectories();

    FS.filesystems = {
      MEMFS: MEMFS,
      IDBFS: IDBFS,
    };
  },
  init: (input, output, error) => {
    FS.init.initialized = true;

    FS.ensureErrnoError();

    // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
    Module["stdin"] = input || Module["stdin"];
    Module["stdout"] = output || Module["stdout"];
    Module["stderr"] = error || Module["stderr"];

    FS.createStandardStreams();
  },
  quit: () => {
    FS.init.initialized = false;
    // force-flush all streams, so we get musl std streams printed out
    // close all of our streams
    for (var i = 0; i < FS.streams.length; i++) {
      var stream = FS.streams[i];
      if (!stream) {
        continue;
      }
      FS.close(stream);
    }
  },
  getMode: (canRead, canWrite) => {
    var mode = 0;
    if (canRead) mode |= 292 | 73;
    if (canWrite) mode |= 146;
    return mode;
  },
  findObject: (path, dontResolveLastLink) => {
    var ret = FS.analyzePath(path, dontResolveLastLink);
    if (ret.exists) {
      return ret.object;
    } else {
      return null;
    }
  },
  analyzePath: (path, dontResolveLastLink) => {
    // operate from within the context of the symlink's target
    try {
      var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
      path = lookup.path;
    } catch (e) {}
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null,
    };
    try {
      var lookup = FS.lookupPath(path, { parent: true });
      ret.parentExists = true;
      ret.parentPath = lookup.path;
      ret.parentObject = lookup.node;
      ret.name = PATH.basename(path);
      lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
      ret.exists = true;
      ret.path = lookup.path;
      ret.object = lookup.node;
      ret.name = lookup.node.name;
      ret.isRoot = lookup.path === "/";
    } catch (e) {
      ret.error = e.errno;
    }
    return ret;
  },
  createPath: (parent, path, canRead, canWrite) => {
    parent = typeof parent == "string" ? parent : FS.getPath(parent);
    var parts = path.split("/").reverse();
    while (parts.length) {
      var part = parts.pop();
      if (!part) continue;
      var current = PATH.join2(parent, part);
      try {
        FS.mkdir(current);
      } catch (e) {
        // ignore EEXIST
      }
      parent = current;
    }
    return current;
  },
  createFile: (parent, name, properties, canRead, canWrite) => {
    var path = PATH.join2(
      typeof parent == "string" ? parent : FS.getPath(parent),
      name
    );
    var mode = FS.getMode(canRead, canWrite);
    return FS.create(path, mode);
  },
  createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
    var path = name;
    if (parent) {
      parent = typeof parent == "string" ? parent : FS.getPath(parent);
      path = name ? PATH.join2(parent, name) : parent;
    }
    var mode = FS.getMode(canRead, canWrite);
    var node = FS.create(path, mode);
    if (data) {
      if (typeof data == "string") {
        var arr = new Array(data.length);
        for (var i = 0, len = data.length; i < len; ++i)
          arr[i] = data.charCodeAt(i);
        data = arr;
      }
      // make sure we can write to the file
      FS.chmod(node, mode | 146);
      var stream = FS.open(node, 577);
      FS.write(stream, data, 0, data.length, 0, canOwn);
      FS.close(stream);
      FS.chmod(node, mode);
    }
    return node;
  },
  createDevice: (parent, name, input, output) => {
    var path = PATH.join2(
      typeof parent == "string" ? parent : FS.getPath(parent),
      name
    );
    var mode = FS.getMode(!!input, !!output);
    if (!FS.createDevice.major) FS.createDevice.major = 64;
    var dev = FS.makedev(FS.createDevice.major++, 0);
    // Create a fake device that a set of stream ops to emulate
    // the old behavior.
    FS.registerDevice(dev, {
      open: (stream) => {
        stream.seekable = false;
      },
      close: (stream) => {
        // flush any pending line data
        if (output && output.buffer && output.buffer.length) {
          output(10);
        }
      },
      read: (stream, buffer, offset, length, pos /* ignored */) => {
        var bytesRead = 0;
        for (var i = 0; i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === undefined) break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now();
        }
        return bytesRead;
      },
      write: (stream, buffer, offset, length, pos) => {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.timestamp = Date.now();
        }
        return i;
      },
    });
    return FS.mkdev(path, mode, dev);
  },
  forceLoadFile: (obj) => {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
    if (typeof XMLHttpRequest != "undefined") {
      throw new Error(
        "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread."
      );
    } else if (read_) {
      // Command-line.
      try {
        // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
        //          read() will try to parse UTF8.
        obj.contents = intArrayFromString(read_(obj.url), true);
        obj.usedBytes = obj.contents.length;
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
    } else {
      throw new Error("Cannot load without read() or XMLHttpRequest.");
    }
  },
  createLazyFile: (parent, name, url, canRead, canWrite) => {
    // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
    /** @constructor */
    function LazyUint8Array() {
      this.lengthKnown = false;
      this.chunks = []; // Loaded chunks. Index is the chunk number
    }
    LazyUint8Array.prototype.get =
      /** @this{Object} */ function LazyUint8Array_get(idx) {
        if (idx > this.length - 1 || idx < 0) {
          return undefined;
        }
        var chunkOffset = idx % this.chunkSize;
        var chunkNum = (idx / this.chunkSize) | 0;
        return this.getter(chunkNum)[chunkOffset];
      };
    LazyUint8Array.prototype.setDataGetter =
      function LazyUint8Array_setDataGetter(getter) {
        this.getter = getter;
      };
    LazyUint8Array.prototype.cacheLength =
      function LazyUint8Array_cacheLength() {
        // Find length
        var xhr = new XMLHttpRequest();
        xhr.open("HEAD", url, false);
        xhr.send(null);
        if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
          throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
        var datalength = Number(xhr.getResponseHeader("Content-length"));
        var header;
        var hasByteServing =
          (header = xhr.getResponseHeader("Accept-Ranges")) &&
          header === "bytes";
        var usesGzip =
          (header = xhr.getResponseHeader("Content-Encoding")) &&
          header === "gzip";

        var chunkSize = 1024 * 1024; // Chunk size in bytes

        if (!hasByteServing) chunkSize = datalength;

        // Function to get a range from the remote URL.
        var doXHR = (from, to) => {
          if (from > to)
            throw new Error(
              "invalid range (" + from + ", " + to + ") or no bytes requested!"
            );
          if (to > datalength - 1)
            throw new Error(
              "only " + datalength + " bytes available! programmer error!"
            );

          // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          if (datalength !== chunkSize)
            xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);

          // Some hints to the browser that we want binary data.
          xhr.responseType = "arraybuffer";
          if (xhr.overrideMimeType) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
          }

          xhr.send(null);
          if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
            throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          if (xhr.response !== undefined) {
            return new Uint8Array(
              /** @type{Array<number>} */ (xhr.response || [])
            );
          } else {
            return intArrayFromString(xhr.responseText || "", true);
          }
        };
        var lazyArray = this;
        lazyArray.setDataGetter((chunkNum) => {
          var start = chunkNum * chunkSize;
          var end = (chunkNum + 1) * chunkSize - 1; // including this byte
          end = Math.min(end, datalength - 1); // if datalength-1 is selected, this is the last block
          if (typeof lazyArray.chunks[chunkNum] == "undefined") {
            lazyArray.chunks[chunkNum] = doXHR(start, end);
          }
          if (typeof lazyArray.chunks[chunkNum] == "undefined")
            throw new Error("doXHR failed!");
          return lazyArray.chunks[chunkNum];
        });

        if (usesGzip || !datalength) {
          // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
          chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
          datalength = this.getter(0).length;
          chunkSize = datalength;
          out(
            "LazyFiles on gzip forces download of the whole file when length is accessed"
          );
        }

        this._length = datalength;
        this._chunkSize = chunkSize;
        this.lengthKnown = true;
      };
    if (typeof XMLHttpRequest != "undefined") {
      if (!ENVIRONMENT_IS_WORKER)
        throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
      var lazyArray = new LazyUint8Array();
      Object.defineProperties(lazyArray, {
        length: {
          get: /** @this{Object} */ function () {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._length;
          },
        },
        chunkSize: {
          get: /** @this{Object} */ function () {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._chunkSize;
          },
        },
      });

      var properties = { isDevice: false, contents: lazyArray };
    } else {
      var properties = { isDevice: false, url: url };
    }

    var node = FS.createFile(parent, name, properties, canRead, canWrite);
    // This is a total hack, but I want to get this lazy file code out of the
    // core of MEMFS. If we want to keep this lazy file concept I feel it should
    // be its own thin LAZYFS proxying calls to MEMFS.
    if (properties.contents) {
      node.contents = properties.contents;
    } else if (properties.url) {
      node.contents = null;
      node.url = properties.url;
    }
    // Add a function that defers querying the file size until it is asked the first time.
    Object.defineProperties(node, {
      usedBytes: {
        get: /** @this {FSNode} */ function () {
          return this.contents.length;
        },
      },
    });
    // override each stream op with one that tries to force load the lazy file first
    var stream_ops = {};
    var keys = Object.keys(node.stream_ops);
    keys.forEach((key) => {
      var fn = node.stream_ops[key];
      stream_ops[key] = function forceLoadLazyFile() {
        FS.forceLoadFile(node);
        return fn.apply(null, arguments);
      };
    });
    // use a custom read function
    stream_ops.read = (stream, buffer, offset, length, position) => {
      FS.forceLoadFile(node);
      var contents = stream.node.contents;
      if (position >= contents.length) return 0;
      var size = Math.min(contents.length - position, length);
      if (contents.slice) {
        // normal array
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents[position + i];
        }
      } else {
        for (var i = 0; i < size; i++) {
          // LazyUint8Array from sync binary XHR
          buffer[offset + i] = contents.get(position + i);
        }
      }
      return size;
    };
    node.stream_ops = stream_ops;
    return node;
  },
  createPreloadedFile: (
    parent,
    name,
    url,
    canRead,
    canWrite,
    onload,
    onerror,
    dontCreateFile,
    canOwn,
    preFinish
  ) => {
    // TODO we should allow people to just pass in a complete filename instead
    // of parent and name being that we just join them anyways
    var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
    var dep = getUniqueRunDependency("cp " + fullname); // might have several active requests for the same fullname
    function processData(byteArray) {
      function finish(byteArray) {
        if (preFinish) preFinish();
        if (!dontCreateFile) {
          FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
        }
        if (onload) onload();
        removeRunDependency(dep);
      }
      if (
        Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
          if (onerror) onerror();
          removeRunDependency(dep);
        })
      ) {
        return;
      }
      finish(byteArray);
    }
    addRunDependency(dep);
    if (typeof url == "string") {
      asyncLoad(url, (byteArray) => processData(byteArray), onerror);
    } else {
      processData(url);
    }
  },
  indexedDB: () => {
    return (
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB
    );
  },
  DB_NAME: () => {
    return "EM_FS_" + window.location.pathname;
  },
  DB_VERSION: 20,
  DB_STORE_NAME: "FILE_DATA",
  saveFilesToDB: (paths, onload, onerror) => {
    onload = onload || (() => {});
    onerror = onerror || (() => {});
    var indexedDB = FS.indexedDB();
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
    } catch (e) {
      return onerror(e);
    }
    openRequest.onupgradeneeded = () => {
      out("creating db");
      var db = openRequest.result;
      db.createObjectStore(FS.DB_STORE_NAME);
    };
    openRequest.onsuccess = () => {
      var db = openRequest.result;
      var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
      var files = transaction.objectStore(FS.DB_STORE_NAME);
      var ok = 0,
        fail = 0,
        total = paths.length;
      function finish() {
        if (fail == 0) onload();
        else onerror();
      }
      paths.forEach((path) => {
        var putRequest = files.put(FS.analyzePath(path).object.contents, path);
        putRequest.onsuccess = () => {
          ok++;
          if (ok + fail == total) finish();
        };
        putRequest.onerror = () => {
          fail++;
          if (ok + fail == total) finish();
        };
      });
      transaction.onerror = onerror;
    };
    openRequest.onerror = onerror;
  },
  loadFilesFromDB: (paths, onload, onerror) => {
    onload = onload || (() => {});
    onerror = onerror || (() => {});
    var indexedDB = FS.indexedDB();
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
    } catch (e) {
      return onerror(e);
    }
    openRequest.onupgradeneeded = onerror; // no database to load from
    openRequest.onsuccess = () => {
      var db = openRequest.result;
      try {
        var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
      } catch (e) {
        onerror(e);
        return;
      }
      var files = transaction.objectStore(FS.DB_STORE_NAME);
      var ok = 0,
        fail = 0,
        total = paths.length;
      function finish() {
        if (fail == 0) onload();
        else onerror();
      }
      paths.forEach((path) => {
        var getRequest = files.get(path);
        getRequest.onsuccess = () => {
          if (FS.analyzePath(path).exists) {
            FS.unlink(path);
          }
          FS.createDataFile(
            PATH.dirname(path),
            PATH.basename(path),
            getRequest.result,
            true,
            true,
            true
          );
          ok++;
          if (ok + fail == total) finish();
        };
        getRequest.onerror = () => {
          fail++;
          if (ok + fail == total) finish();
        };
      });
      transaction.onerror = onerror;
    };
    openRequest.onerror = onerror;
  },
};
window.FS = FS;

function _emscripten_set_main_loop_timing(mode, value) {
  Browser.mainLoop.timingMode = mode;
  Browser.mainLoop.timingValue = value;

  if (!Browser.mainLoop.func) {
    return 1; // Return non-zero on failure, can't set timing mode when there is no main loop.
  }

  if (!Browser.mainLoop.running) {
    Browser.mainLoop.running = true;
  }
  if (mode == 0 /*EM_TIMING_SETTIMEOUT*/) {
    Browser.mainLoop.scheduler =
      function Browser_mainLoop_scheduler_setTimeout() {
        var timeUntilNextTick =
          Math.max(
            0,
            Browser.mainLoop.tickStartTime + value - _emscripten_get_now()
          ) | 0;
        setTimeout(Browser.mainLoop.runner, timeUntilNextTick); // doing this each time means that on exception, we stop
      };
    Browser.mainLoop.method = "timeout";
  } else if (mode == 1 /*EM_TIMING_RAF*/) {
    Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
      Browser.requestAnimationFrame(Browser.mainLoop.runner);
    };
    Browser.mainLoop.method = "rAF";
  } else if (mode == 2 /*EM_TIMING_SETIMMEDIATE*/) {
    if (typeof setImmediate == "undefined") {
      // Emulate setImmediate. (note: not a complete polyfill, we don't emulate clearImmediate() to keep code size to minimum, since not needed)
      var setImmediates = [];
      var emscriptenMainLoopMessageId = "setimmediate";
      var Browser_setImmediate_messageHandler = function (
        /** @type {Event} */ event
      ) {
        // When called in current thread or Worker, the main loop ID is structured slightly different to accommodate for --proxy-to-worker runtime listening to Worker events,
        // so check for both cases.
        if (
          event.data === emscriptenMainLoopMessageId ||
          event.data.target === emscriptenMainLoopMessageId
        ) {
          event.stopPropagation();
          setImmediates.shift()();
        }
      };
      addEventListener("message", Browser_setImmediate_messageHandler, true);
      setImmediate = /** @type{function(function(): ?, ...?): number} */ (
        function Browser_emulated_setImmediate(func) {
          setImmediates.push(func);
          if (ENVIRONMENT_IS_WORKER) {
            if (Module["setImmediates"] === undefined)
              Module["setImmediates"] = [];
            Module["setImmediates"].push(func);
            postMessage({ target: emscriptenMainLoopMessageId }); // In --proxy-to-worker, route the message via proxyClient.js
          } else postMessage(emscriptenMainLoopMessageId, "*"); // On the main thread, can just send the message to itself.
        }
      );
    }
    Browser.mainLoop.scheduler =
      function Browser_mainLoop_scheduler_setImmediate() {
        setImmediate(Browser.mainLoop.runner);
      };
    Browser.mainLoop.method = "immediate";
  }
  return 0;
}

var _emscripten_get_now;
if (ENVIRONMENT_IS_NODE) {
  _emscripten_get_now = () => {
    var t = process["hrtime"]();
    return t[0] * 1e3 + t[1] / 1e6;
  };
} else _emscripten_get_now = () => performance.now();
function runtimeKeepalivePush() {}

function _exit(status) {
  // void _exit(int status);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
  exit(status);
}
function maybeExit() {}

/**
 * @param {number=} arg
 * @param {boolean=} noSetTiming
 */
function setMainLoop(
  browserIterationFunc,
  fps,
  simulateInfiniteLoop,
  arg,
  noSetTiming
) {
  assert(
    !Browser.mainLoop.func,
    "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters."
  );

  Browser.mainLoop.func = browserIterationFunc;
  Browser.mainLoop.arg = arg;

  var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
  function checkIsRunning() {
    if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {
      maybeExit();
      return false;
    }
    return true;
  }

  // We create the loop runner here but it is not actually running until
  // _emscripten_set_main_loop_timing is called (which might happen a
  // later time).  This member signifies that the current runner has not
  // yet been started so that we can call runtimeKeepalivePush when it
  // gets it timing set for the first time.
  Browser.mainLoop.running = false;
  Browser.mainLoop.runner = function Browser_mainLoop_runner() {
    if (ABORT) return;
    if (Browser.mainLoop.queue.length > 0) {
      var start = Date.now();
      var blocker = Browser.mainLoop.queue.shift();
      blocker.func(blocker.arg);
      if (Browser.mainLoop.remainingBlockers) {
        var remaining = Browser.mainLoop.remainingBlockers;
        var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
        if (blocker.counted) {
          Browser.mainLoop.remainingBlockers = next;
        } else {
          // not counted, but move the progress along a tiny bit
          next = next + 0.5; // do not steal all the next one's progress
          Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
        }
      }
      out(
        'main loop blocker "' +
          blocker.name +
          '" took ' +
          (Date.now() - start) +
          " ms"
      ); //, left: ' + Browser.mainLoop.remainingBlockers);
      Browser.mainLoop.updateStatus();

      // catches pause/resume main loop from blocker execution
      if (!checkIsRunning()) return;

      setTimeout(Browser.mainLoop.runner, 0);
      return;
    }

    // catch pauses from non-main loop sources
    if (!checkIsRunning()) return;

    // Implement very basic swap interval control
    Browser.mainLoop.currentFrameNumber =
      (Browser.mainLoop.currentFrameNumber + 1) | 0;
    if (
      Browser.mainLoop.timingMode == 1 /*EM_TIMING_RAF*/ &&
      Browser.mainLoop.timingValue > 1 &&
      Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0
    ) {
      // Not the scheduled time to render this frame - skip.
      Browser.mainLoop.scheduler();
      return;
    } else if (Browser.mainLoop.timingMode == 0 /*EM_TIMING_SETTIMEOUT*/) {
      Browser.mainLoop.tickStartTime = _emscripten_get_now();
    }

    // Signal GL rendering layer that processing of a new frame is about to start. This helps it optimize
    // VBO double-buffering and reduce GPU stalls.

    Browser.mainLoop.runIter(browserIterationFunc);

    // catch pauses from the main loop itself
    if (!checkIsRunning()) return;

    // Queue new audio data. This is important to be right after the main loop invocation, so that we will immediately be able
    // to queue the newest produced audio samples.
    // TODO: Consider adding pre- and post- rAF callbacks so that GL.newRenderingFrameStarted() and SDL.audio.queueNewAudioData()
    //       do not need to be hardcoded into this function, but can be more generic.
    if (typeof SDL == "object" && SDL.audio && SDL.audio.queueNewAudioData)
      SDL.audio.queueNewAudioData();

    Browser.mainLoop.scheduler();
  };

  if (!noSetTiming) {
    if (fps && fps > 0)
      _emscripten_set_main_loop_timing(
        0 /*EM_TIMING_SETTIMEOUT*/,
        1000.0 / fps
      );
    else _emscripten_set_main_loop_timing(1 /*EM_TIMING_RAF*/, 1); // Do rAF by rendering each frame (no decimating)

    Browser.mainLoop.scheduler();
  }

  if (simulateInfiniteLoop) {
    throw "unwind";
  }
}

/** @param {boolean=} synchronous */
function callUserCallback(func, synchronous) {
  if (ABORT) {
    return;
  }
  // For synchronous calls, let any exceptions propagate, and don't let the runtime exit.
  if (synchronous) {
    func();
    return;
  }
  try {
    func();
  } catch (e) {
    handleException(e);
  }
}

function runtimeKeepalivePop() {}
/** @param {number=} timeout */
function safeSetTimeout(func, timeout) {
  return setTimeout(function () {
    callUserCallback(func);
  }, timeout);
}
var Browser = {
  mainLoop: {
    running: false,
    scheduler: null,
    method: "",
    currentlyRunningMainloop: 0,
    func: null,
    arg: 0,
    timingMode: 0,
    timingValue: 0,
    currentFrameNumber: 0,
    queue: [],
    pause: function () {
      Browser.mainLoop.scheduler = null;
      // Incrementing this signals the previous main loop that it's now become old, and it must return.
      Browser.mainLoop.currentlyRunningMainloop++;
    },
    resume: function () {
      Browser.mainLoop.currentlyRunningMainloop++;
      var timingMode = Browser.mainLoop.timingMode;
      var timingValue = Browser.mainLoop.timingValue;
      var func = Browser.mainLoop.func;
      Browser.mainLoop.func = null;
      // do not set timing and call scheduler, we will do it on the next lines
      setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
      _emscripten_set_main_loop_timing(timingMode, timingValue);
      Browser.mainLoop.scheduler();
    },
    updateStatus: function () {
      if (Module["setStatus"]) {
        var message = Module["statusMessage"] || "Please wait...";
        var remaining = Browser.mainLoop.remainingBlockers;
        var expected = Browser.mainLoop.expectedBlockers;
        if (remaining) {
          if (remaining < expected) {
            Module["setStatus"](
              message + " (" + (expected - remaining) + "/" + expected + ")"
            );
          } else {
            Module["setStatus"](message);
          }
        } else {
          Module["setStatus"]("");
        }
      }
    },
    runIter: function (func) {
      if (ABORT) return;
      if (Module["preMainLoop"]) {
        var preRet = Module["preMainLoop"]();
        if (preRet === false) {
          return; // |return false| skips a frame
        }
      }
      callUserCallback(func);
      if (Module["postMainLoop"]) Module["postMainLoop"]();
    },
  },
  isFullscreen: false,
  pointerLock: false,
  moduleContextCreatedCallbacks: [],
  workers: [],
  init: function () {
    if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers

    if (Browser.initted) return;
    Browser.initted = true;

    try {
      new Blob();
      Browser.hasBlobConstructor = true;
    } catch (e) {
      Browser.hasBlobConstructor = false;
      out("warning: no blob constructor, cannot create blobs with mimetypes");
    }
    Browser.BlobBuilder =
      typeof MozBlobBuilder != "undefined"
        ? MozBlobBuilder
        : typeof WebKitBlobBuilder != "undefined"
        ? WebKitBlobBuilder
        : !Browser.hasBlobConstructor
        ? out("warning: no BlobBuilder")
        : null;
    Browser.URLObject =
      typeof window != "undefined"
        ? window.URL
          ? window.URL
          : window.webkitURL
        : undefined;
    if (!Module.noImageDecoding && typeof Browser.URLObject == "undefined") {
      out(
        "warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available."
      );
      Module.noImageDecoding = true;
    }

    // Support for plugins that can process preloaded files. You can add more of these to
    // your app by creating and appending to Module.preloadPlugins.
    //
    // Each plugin is asked if it can handle a file based on the file's name. If it can,
    // it is given the file's raw data. When it is done, it calls a callback with the file's
    // (possibly modified) data. For example, a plugin might decompress a file, or it
    // might create some side data structure for use later (like an Image element, etc.).

    var imagePlugin = {};
    imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
      return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
    };
    imagePlugin["handle"] = function imagePlugin_handle(
      byteArray,
      name,
      onload,
      onerror
    ) {
      var b = null;
      if (Browser.hasBlobConstructor) {
        try {
          b = new Blob([byteArray], { type: Browser.getMimetype(name) });
          if (b.size !== byteArray.length) {
            // Safari bug #118630
            // Safari's Blob can only take an ArrayBuffer
            b = new Blob([new Uint8Array(byteArray).buffer], {
              type: Browser.getMimetype(name),
            });
          }
        } catch (e) {
          warnOnce(
            "Blob constructor present but fails: " +
              e +
              "; falling back to blob builder"
          );
        }
      }
      if (!b) {
        var bb = new Browser.BlobBuilder();
        bb.append(new Uint8Array(byteArray).buffer); // we need to pass a buffer, and must copy the array to get the right data range
        b = bb.getBlob();
      }
      var url = Browser.URLObject.createObjectURL(b);
      var img = new Image();
      img.onload = () => {
        assert(img.complete, "Image " + name + " could not be decoded");
        var canvas = /** @type {!HTMLCanvasElement} */ (
          document.createElement("canvas")
        );
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        preloadedImages[name] = canvas;
        Browser.URLObject.revokeObjectURL(url);
        if (onload) onload(byteArray);
      };
      img.onerror = (event) => {
        out("Image " + url + " could not be decoded");
        if (onerror) onerror();
      };
      img.src = url;
    };
    Module["preloadPlugins"].push(imagePlugin);

    var audioPlugin = {};
    audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
      return (
        !Module.noAudioDecoding &&
        name.substr(-4) in { ".ogg": 1, ".wav": 1, ".mp3": 1 }
      );
    };
    audioPlugin["handle"] = function audioPlugin_handle(
      byteArray,
      name,
      onload,
      onerror
    ) {
      var done = false;
      function finish(audio) {
        if (done) return;
        done = true;
        preloadedAudios[name] = audio;
        if (onload) onload(byteArray);
      }
      function fail() {
        if (done) return;
        done = true;
        preloadedAudios[name] = new Audio(); // empty shim
        if (onerror) onerror();
      }
      if (Browser.hasBlobConstructor) {
        try {
          var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
        } catch (e) {
          return fail();
        }
        var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
        var audio = new Audio();
        audio.addEventListener(
          "canplaythrough",
          function () {
            finish(audio);
          },
          false
        ); // use addEventListener due to chromium bug 124926
        audio.onerror = function audio_onerror(event) {
          if (done) return;
          out(
            "warning: browser could not fully decode audio " +
              name +
              ", trying slower base64 approach"
          );
          function encode64(data) {
            var BASE =
              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            var PAD = "=";
            var ret = "";
            var leftchar = 0;
            var leftbits = 0;
            for (var i = 0; i < data.length; i++) {
              leftchar = (leftchar << 8) | data[i];
              leftbits += 8;
              while (leftbits >= 6) {
                var curr = (leftchar >> (leftbits - 6)) & 0x3f;
                leftbits -= 6;
                ret += BASE[curr];
              }
            }
            if (leftbits == 2) {
              ret += BASE[(leftchar & 3) << 4];
              ret += PAD + PAD;
            } else if (leftbits == 4) {
              ret += BASE[(leftchar & 0xf) << 2];
              ret += PAD;
            }
            return ret;
          }
          audio.src =
            "data:audio/x-" +
            name.substr(-3) +
            ";base64," +
            encode64(byteArray);
          finish(audio); // we don't wait for confirmation this worked - but it's worth trying
        };
        audio.src = url;
        // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
        safeSetTimeout(function () {
          finish(audio); // try to use it even though it is not necessarily ready to play
        }, 10000);
      } else {
        return fail();
      }
    };
    Module["preloadPlugins"].push(audioPlugin);

    // Canvas event setup

    function pointerLockChange() {
      Browser.pointerLock =
        document["pointerLockElement"] === Module["canvas"] ||
        document["mozPointerLockElement"] === Module["canvas"] ||
        document["webkitPointerLockElement"] === Module["canvas"] ||
        document["msPointerLockElement"] === Module["canvas"];
    }
    var canvas = Module["canvas"];
    if (canvas) {
      // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
      // Module['forcedAspectRatio'] = 4 / 3;

      canvas.requestPointerLock =
        canvas["requestPointerLock"] ||
        canvas["mozRequestPointerLock"] ||
        canvas["webkitRequestPointerLock"] ||
        canvas["msRequestPointerLock"] ||
        function () {};
      canvas.exitPointerLock =
        document["exitPointerLock"] ||
        document["mozExitPointerLock"] ||
        document["webkitExitPointerLock"] ||
        document["msExitPointerLock"] ||
        function () {}; // no-op if function does not exist
      canvas.exitPointerLock = canvas.exitPointerLock.bind(document);

      document.addEventListener("pointerlockchange", pointerLockChange, false);
      document.addEventListener(
        "mozpointerlockchange",
        pointerLockChange,
        false
      );
      document.addEventListener(
        "webkitpointerlockchange",
        pointerLockChange,
        false
      );
      document.addEventListener(
        "mspointerlockchange",
        pointerLockChange,
        false
      );

      if (Module["elementPointerLock"]) {
        canvas.addEventListener(
          "click",
          function (ev) {
            if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
              Module["canvas"].requestPointerLock();
              ev.preventDefault();
            }
          },
          false
        );
      }
    }
  },
  handledByPreloadPlugin: function (byteArray, fullname, finish, onerror) {
    // Ensure plugins are ready.
    Browser.init();

    var handled = false;
    Module["preloadPlugins"].forEach(function (plugin) {
      if (handled) return;
      if (plugin["canHandle"](fullname)) {
        plugin["handle"](byteArray, fullname, finish, onerror);
        handled = true;
      }
    });
    return handled;
  },
  createContext: function (
    /** @type {HTMLCanvasElement} */ canvas,
    useWebGL,
    setInModule,
    webGLContextAttributes
  ) {
    if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.

    var ctx;
    var contextHandle;
    if (useWebGL) {
      // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
      var contextAttributes = {
        antialias: false,
        alpha: false,
        majorVersion: 1,
      };

      if (webGLContextAttributes) {
        for (var attribute in webGLContextAttributes) {
          contextAttributes[attribute] = webGLContextAttributes[attribute];
        }
      }

      // This check of existence of GL is here to satisfy Closure compiler, which yells if variable GL is referenced below but GL object is not
      // actually compiled in because application is not doing any GL operations. TODO: Ideally if GL is not being used, this function
      // Browser.createContext() should not even be emitted.
      if (typeof GL != "undefined") {
        contextHandle = GL.createContext(canvas, contextAttributes);
        if (contextHandle) {
          ctx = GL.getContext(contextHandle).GLctx;
        }
      }
    } else {
      ctx = canvas.getContext("2d");
    }

    if (!ctx) return null;

    if (setInModule) {
      if (!useWebGL)
        assert(
          typeof GLctx == "undefined",
          "cannot set in module if GLctx is used, but we are a non-GL context that would replace it"
        );

      Module.ctx = ctx;
      if (useWebGL) GL.makeContextCurrent(contextHandle);
      Module.useWebGL = useWebGL;
      Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
        callback();
      });
      Browser.init();
    }
    return ctx;
  },
  destroyContext: function (canvas, useWebGL, setInModule) {},
  fullscreenHandlersInstalled: false,
  lockPointer: undefined,
  resizeCanvas: undefined,
  requestFullscreen: function (lockPointer, resizeCanvas) {
    Browser.lockPointer = lockPointer;
    Browser.resizeCanvas = resizeCanvas;
    if (typeof Browser.lockPointer == "undefined") Browser.lockPointer = true;
    if (typeof Browser.resizeCanvas == "undefined")
      Browser.resizeCanvas = false;

    var canvas = Module["canvas"];
    function fullscreenChange() {
      Browser.isFullscreen = false;
      var canvasContainer = canvas.parentNode;
      if (
        (document["fullscreenElement"] ||
          document["mozFullScreenElement"] ||
          document["msFullscreenElement"] ||
          document["webkitFullscreenElement"] ||
          document["webkitCurrentFullScreenElement"]) === canvasContainer
      ) {
        canvas.exitFullscreen = Browser.exitFullscreen;
        if (Browser.lockPointer) canvas.requestPointerLock();
        Browser.isFullscreen = true;
        if (Browser.resizeCanvas) {
          Browser.setFullscreenCanvasSize();
        } else {
          Browser.updateCanvasDimensions(canvas);
        }
      } else {
        // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
        canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
        canvasContainer.parentNode.removeChild(canvasContainer);

        if (Browser.resizeCanvas) {
          Browser.setWindowedCanvasSize();
        } else {
          Browser.updateCanvasDimensions(canvas);
        }
      }
      if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullscreen);
      if (Module["onFullscreen"]) Module["onFullscreen"](Browser.isFullscreen);
    }

    if (!Browser.fullscreenHandlersInstalled) {
      Browser.fullscreenHandlersInstalled = true;
      document.addEventListener("fullscreenchange", fullscreenChange, false);
      document.addEventListener("mozfullscreenchange", fullscreenChange, false);
      document.addEventListener(
        "webkitfullscreenchange",
        fullscreenChange,
        false
      );
      document.addEventListener("MSFullscreenChange", fullscreenChange, false);
    }

    // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
    var canvasContainer = document.createElement("div");
    canvas.parentNode.insertBefore(canvasContainer, canvas);
    canvasContainer.appendChild(canvas);

    // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
    canvasContainer.requestFullscreen =
      canvasContainer["requestFullscreen"] ||
      canvasContainer["mozRequestFullScreen"] ||
      canvasContainer["msRequestFullscreen"] ||
      (canvasContainer["webkitRequestFullscreen"]
        ? function () {
            canvasContainer["webkitRequestFullscreen"](
              Element["ALLOW_KEYBOARD_INPUT"]
            );
          }
        : null) ||
      (canvasContainer["webkitRequestFullScreen"]
        ? function () {
            canvasContainer["webkitRequestFullScreen"](
              Element["ALLOW_KEYBOARD_INPUT"]
            );
          }
        : null);

    canvasContainer.requestFullscreen();
  },
  exitFullscreen: function () {
    // This is workaround for chrome. Trying to exit from fullscreen
    // not in fullscreen state will cause "TypeError: Document not active"
    // in chrome. See https://github.com/emscripten-core/emscripten/pull/8236
    if (!Browser.isFullscreen) {
      return false;
    }

    var CFS =
      document["exitFullscreen"] ||
      document["cancelFullScreen"] ||
      document["mozCancelFullScreen"] ||
      document["msExitFullscreen"] ||
      document["webkitCancelFullScreen"] ||
      function () {};
    CFS.apply(document, []);
    return true;
  },
  nextRAF: 0,
  fakeRequestAnimationFrame: function (func) {
    // try to keep 60fps between calls to here
    var now = Date.now();
    if (Browser.nextRAF === 0) {
      Browser.nextRAF = now + 1000 / 60;
    } else {
      while (now + 2 >= Browser.nextRAF) {
        // fudge a little, to avoid timer jitter causing us to do lots of delay:0
        Browser.nextRAF += 1000 / 60;
      }
    }
    var delay = Math.max(Browser.nextRAF - now, 0);
    setTimeout(func, delay);
  },
  requestAnimationFrame: function (func) {
    if (typeof requestAnimationFrame == "function") {
      requestAnimationFrame(func);
      return;
    }
    var RAF = Browser.fakeRequestAnimationFrame;
    RAF(func);
  },
  safeSetTimeout: function (func) {
    // Legacy function, this is used by the SDL2 port so we need to keep it
    // around at least until that is updated.
    return safeSetTimeout(func);
  },
  safeRequestAnimationFrame: function (func) {
    return Browser.requestAnimationFrame(function () {
      callUserCallback(func);
    });
  },
  getMimetype: function (name) {
    return {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      bmp: "image/bmp",
      ogg: "audio/ogg",
      wav: "audio/wav",
      mp3: "audio/mpeg",
    }[name.substr(name.lastIndexOf(".") + 1)];
  },
  getUserMedia: function (func) {
    if (!window.getUserMedia) {
      window.getUserMedia =
        navigator["getUserMedia"] || navigator["mozGetUserMedia"];
    }
    window.getUserMedia(func);
  },
  getMovementX: function (event) {
    return (
      event["movementX"] ||
      event["mozMovementX"] ||
      event["webkitMovementX"] ||
      0
    );
  },
  getMovementY: function (event) {
    return (
      event["movementY"] ||
      event["mozMovementY"] ||
      event["webkitMovementY"] ||
      0
    );
  },
  getMouseWheelDelta: function (event) {
    var delta = 0;
    switch (event.type) {
      case "DOMMouseScroll":
        // 3 lines make up a step
        delta = event.detail / 3;
        break;
      case "mousewheel":
        // 120 units make up a step
        delta = event.wheelDelta / 120;
        break;
      case "wheel":
        delta = event.deltaY;
        switch (event.deltaMode) {
          case 0:
            // DOM_DELTA_PIXEL: 100 pixels make up a step
            delta /= 100;
            break;
          case 1:
            // DOM_DELTA_LINE: 3 lines make up a step
            delta /= 3;
            break;
          case 2:
            // DOM_DELTA_PAGE: A page makes up 80 steps
            delta *= 80;
            break;
          default:
            throw "unrecognized mouse wheel delta mode: " + event.deltaMode;
        }
        break;
      default:
        throw "unrecognized mouse wheel event: " + event.type;
    }
    return delta;
  },
  mouseX: 0,
  mouseY: 0,
  mouseMovementX: 0,
  mouseMovementY: 0,
  touches: {},
  lastTouches: {},
  calculateMouseEvent: function (event) {
    // event should be mousemove, mousedown or mouseup
    if (Browser.pointerLock) {
      // When the pointer is locked, calculate the coordinates
      // based on the movement of the mouse.
      // Workaround for Firefox bug 764498
      if (event.type != "mousemove" && "mozMovementX" in event) {
        Browser.mouseMovementX = Browser.mouseMovementY = 0;
      } else {
        Browser.mouseMovementX = Browser.getMovementX(event);
        Browser.mouseMovementY = Browser.getMovementY(event);
      }

      // check if SDL is available
      if (typeof SDL != "undefined") {
        Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
        Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
      } else {
        // just add the mouse delta to the current absolut mouse position
        // FIXME: ideally this should be clamped against the canvas size and zero
        Browser.mouseX += Browser.mouseMovementX;
        Browser.mouseY += Browser.mouseMovementY;
      }
    } else {
      // Otherwise, calculate the movement based on the changes
      // in the coordinates.
      var rect = Module["canvas"].getBoundingClientRect();
      var cw = Module["canvas"].width;
      var ch = Module["canvas"].height;

      // Neither .scrollX or .pageXOffset are defined in a spec, but
      // we prefer .scrollX because it is currently in a spec draft.
      // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
      var scrollX =
        typeof window.scrollX != "undefined"
          ? window.scrollX
          : window.pageXOffset;
      var scrollY =
        typeof window.scrollY != "undefined"
          ? window.scrollY
          : window.pageYOffset;

      if (
        event.type === "touchstart" ||
        event.type === "touchend" ||
        event.type === "touchmove"
      ) {
        var touch = event.touch;
        if (touch === undefined) {
          return; // the "touch" property is only defined in SDL
        }
        var adjustedX = touch.pageX - (scrollX + rect.left);
        var adjustedY = touch.pageY - (scrollY + rect.top);

        adjustedX = adjustedX * (cw / rect.width);
        adjustedY = adjustedY * (ch / rect.height);

        var coords = { x: adjustedX, y: adjustedY };

        if (event.type === "touchstart") {
          Browser.lastTouches[touch.identifier] = coords;
          Browser.touches[touch.identifier] = coords;
        } else if (event.type === "touchend" || event.type === "touchmove") {
          var last = Browser.touches[touch.identifier];
          if (!last) last = coords;
          Browser.lastTouches[touch.identifier] = last;
          Browser.touches[touch.identifier] = coords;
        }
        return;
      }

      var x = event.pageX - (scrollX + rect.left);
      var y = event.pageY - (scrollY + rect.top);

      // the canvas might be CSS-scaled compared to its backbuffer;
      // SDL-using content will want mouse coordinates in terms
      // of backbuffer units.
      x = x * (cw / rect.width);
      y = y * (ch / rect.height);

      Browser.mouseMovementX = x - Browser.mouseX;
      Browser.mouseMovementY = y - Browser.mouseY;
      Browser.mouseX = x;
      Browser.mouseY = y;
    }
  },
  resizeListeners: [],
  updateResizeListeners: function () {
    var canvas = Module["canvas"];
    Browser.resizeListeners.forEach(function (listener) {
      listener(canvas.width, canvas.height);
    });
  },
  setCanvasSize: function (width, height, noUpdates) {
    var canvas = Module["canvas"];
    Browser.updateCanvasDimensions(canvas, width, height);
    if (!noUpdates) Browser.updateResizeListeners();
  },
  windowedWidth: 0,
  windowedHeight: 0,
  setFullscreenCanvasSize: function () {
    // check if SDL is available
    if (typeof SDL != "undefined") {
      var flags = HEAPU32[SDL.screen >> 2];
      flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
      HEAP32[SDL.screen >> 2] = flags;
    }
    Browser.updateCanvasDimensions(Module["canvas"]);
    Browser.updateResizeListeners();
  },
  setWindowedCanvasSize: function () {
    // check if SDL is available
    if (typeof SDL != "undefined") {
      var flags = HEAPU32[SDL.screen >> 2];
      flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
      HEAP32[SDL.screen >> 2] = flags;
    }
    Browser.updateCanvasDimensions(Module["canvas"]);
    Browser.updateResizeListeners();
  },
  updateCanvasDimensions: function (canvas, wNative, hNative) {
    if (wNative && hNative) {
      canvas.widthNative = wNative;
      canvas.heightNative = hNative;
    } else {
      wNative = canvas.widthNative;
      hNative = canvas.heightNative;
    }
    var w = wNative;
    var h = hNative;
    if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
      if (w / h < Module["forcedAspectRatio"]) {
        w = Math.round(h * Module["forcedAspectRatio"]);
      } else {
        h = Math.round(w / Module["forcedAspectRatio"]);
      }
    }
    if (
      (document["fullscreenElement"] ||
        document["mozFullScreenElement"] ||
        document["msFullscreenElement"] ||
        document["webkitFullscreenElement"] ||
        document["webkitCurrentFullScreenElement"]) === canvas.parentNode &&
      typeof screen != "undefined"
    ) {
      var factor = Math.min(screen.width / w, screen.height / h);
      w = Math.round(w * factor);
      h = Math.round(h * factor);
    }
    if (Browser.resizeCanvas) {
      if (canvas.width != w) canvas.width = w;
      if (canvas.height != h) canvas.height = h;
      if (typeof canvas.style != "undefined") {
        canvas.style.removeProperty("width");
        canvas.style.removeProperty("height");
      }
    } else {
      if (canvas.width != wNative) canvas.width = wNative;
      if (canvas.height != hNative) canvas.height = hNative;
      if (typeof canvas.style != "undefined") {
        if (w != wNative || h != hNative) {
          canvas.style.setProperty("width", w + "px", "important");
          canvas.style.setProperty("height", h + "px", "important");
        } else {
          canvas.style.removeProperty("width");
          canvas.style.removeProperty("height");
        }
      }
    }
  },
};

function _SDL_GetTicks() {
  return (Date.now() - SDL.startTime) | 0;
}

function _SDL_LockSurface(surf) {
  var surfData = SDL.surfaces[surf];

  surfData.locked++;
  if (surfData.locked > 1) return 0;

  if (!surfData.buffer) {
    surfData.buffer = _malloc(surfData.width * surfData.height * 4);
    HEAPU32[(surf + 20) >> 2] = surfData.buffer;
  }

  // Mark in C/C++-accessible SDL structure
  // SDL_Surface has the following fields: Uint32 flags, SDL_PixelFormat *format; int w, h; Uint16 pitch; void *pixels; ...
  // So we have fields all of the same size, and 5 of them before us.
  // TODO: Use macros like in library.js
  HEAPU32[(surf + 20) >> 2] = surfData.buffer;

  if (surf == SDL.screen && Module.screenIsReadOnly && surfData.image) return 0;

  if (SDL.defaults.discardOnLock) {
    if (!surfData.image) {
      surfData.image = surfData.ctx.createImageData(
        surfData.width,
        surfData.height
      );
    }
    if (!SDL.defaults.opaqueFrontBuffer) return;
  } else {
    surfData.image = surfData.ctx.getImageData(
      0,
      0,
      surfData.width,
      surfData.height
    );
  }

  // Emulate desktop behavior and kill alpha values on the locked surface. (very costly!) Set SDL.defaults.opaqueFrontBuffer = false
  // if you don't want this.
  if (surf == SDL.screen && SDL.defaults.opaqueFrontBuffer) {
    var data = surfData.image.data;
    var num = data.length;
    for (var i = 0; i < num / 4; i++) {
      data[i * 4 + 3] = 255; // opacity, as canvases blend alpha
    }
  }

  if (SDL.defaults.copyOnLock && !SDL.defaults.discardOnLock) {
    // Copy pixel data to somewhere accessible to 'C/C++'
    if (surfData.isFlagSet(0x00200000 /* SDL_HWPALETTE */)) {
      // If this is neaded then
      // we should compact the data from 32bpp to 8bpp index.
      // I think best way to implement this is use
      // additional colorMap hash (color->index).
      // Something like this:
      //
      // var size = surfData.width * surfData.height;
      // var data = '';
      // for (var i = 0; i<size; i++) {
      //   var color = SDL.translateRGBAToColor(
      //     surfData.image.data[i*4   ],
      //     surfData.image.data[i*4 +1],
      //     surfData.image.data[i*4 +2],
      //     255);
      //   var index = surfData.colorMap[color];
      //   HEAP8[(((surfData.buffer)+(i))>>0)] = index;
      // }
      throw (
        "CopyOnLock is not supported for SDL_LockSurface with SDL_HWPALETTE flag set" +
        new Error().stack
      );
    } else {
      HEAPU8.set(surfData.image.data, surfData.buffer);
    }
  }

  return 0;
}

/** @suppress{missingProperties} */
function SDL_unicode() {
  return SDL.unicode;
}

/** @suppress{missingProperties} */
function SDL_ttfContext() {
  return SDL.ttfContext;
}

/** @suppress{missingProperties} */
function SDL_audio() {
  return SDL.audio;
}
var SDL = {
  defaults: {
    width: 320,
    height: 200,
    copyOnLock: true,
    discardOnLock: false,
    opaqueFrontBuffer: true,
  },
  version: null,
  surfaces: {},
  canvasPool: [],
  events: [],
  fonts: [null],
  audios: [null],
  rwops: [null],
  music: { audio: null, volume: 1 },
  mixerFrequency: 22050,
  mixerFormat: 32784,
  mixerNumChannels: 2,
  mixerChunkSize: 1024,
  channelMinimumNumber: 0,
  GL: false,
  glAttributes: {
    0: 3,
    1: 3,
    2: 2,
    3: 0,
    4: 0,
    5: 1,
    6: 16,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 1,
    16: 0,
    17: 0,
    18: 0,
  },
  keyboardState: null,
  keyboardMap: {},
  canRequestFullscreen: false,
  isRequestingFullscreen: false,
  textInput: false,
  startTime: null,
  initFlags: 0,
  buttonState: 0,
  modState: 0,
  DOMButtons: [0, 0, 0],
  DOMEventToSDLEvent: {},
  TOUCH_DEFAULT_ID: 0,
  eventHandler: null,
  eventHandlerContext: null,
  eventHandlerTemp: 0,
  keyCodes: {
    16: 1249,
    17: 1248,
    18: 1250,
    20: 1081,
    33: 1099,
    34: 1102,
    35: 1101,
    36: 1098,
    37: 1104,
    38: 1106,
    39: 1103,
    40: 1105,
    44: 316,
    45: 1097,
    46: 127,
    91: 1251,
    93: 1125,
    96: 1122,
    97: 1113,
    98: 1114,
    99: 1115,
    100: 1116,
    101: 1117,
    102: 1118,
    103: 1119,
    104: 1120,
    105: 1121,
    106: 1109,
    107: 1111,
    109: 1110,
    110: 1123,
    111: 1108,
    112: 1082,
    113: 1083,
    114: 1084,
    115: 1085,
    116: 1086,
    117: 1087,
    118: 1088,
    119: 1089,
    120: 1090,
    121: 1091,
    122: 1092,
    123: 1093,
    124: 1128,
    125: 1129,
    126: 1130,
    127: 1131,
    128: 1132,
    129: 1133,
    130: 1134,
    131: 1135,
    132: 1136,
    133: 1137,
    134: 1138,
    135: 1139,
    144: 1107,
    160: 94,
    161: 33,
    162: 34,
    163: 35,
    164: 36,
    165: 37,
    166: 38,
    167: 95,
    168: 40,
    169: 41,
    170: 42,
    171: 43,
    172: 124,
    173: 45,
    174: 123,
    175: 125,
    176: 126,
    181: 127,
    182: 129,
    183: 128,
    188: 44,
    190: 46,
    191: 47,
    192: 96,
    219: 91,
    220: 92,
    221: 93,
    222: 39,
    224: 1251,
  },
  scanCodes: {
    8: 42,
    9: 43,
    13: 40,
    27: 41,
    32: 44,
    35: 204,
    39: 53,
    44: 54,
    46: 55,
    47: 56,
    48: 39,
    49: 30,
    50: 31,
    51: 32,
    52: 33,
    53: 34,
    54: 35,
    55: 36,
    56: 37,
    57: 38,
    58: 203,
    59: 51,
    61: 46,
    91: 47,
    92: 49,
    93: 48,
    96: 52,
    97: 4,
    98: 5,
    99: 6,
    100: 7,
    101: 8,
    102: 9,
    103: 10,
    104: 11,
    105: 12,
    106: 13,
    107: 14,
    108: 15,
    109: 16,
    110: 17,
    111: 18,
    112: 19,
    113: 20,
    114: 21,
    115: 22,
    116: 23,
    117: 24,
    118: 25,
    119: 26,
    120: 27,
    121: 28,
    122: 29,
    127: 76,
    305: 224,
    308: 226,
    316: 70,
  },
  loadRect: function (rect) {
    return {
      x: HEAP32[(rect + 0) >> 2],
      y: HEAP32[(rect + 4) >> 2],
      w: HEAP32[(rect + 8) >> 2],
      h: HEAP32[(rect + 12) >> 2],
    };
  },
  updateRect: function (rect, r) {
    HEAP32[rect >> 2] = r.x;
    HEAP32[(rect + 4) >> 2] = r.y;
    HEAP32[(rect + 8) >> 2] = r.w;
    HEAP32[(rect + 12) >> 2] = r.h;
  },
  intersectionOfRects: function (first, second) {
    var leftX = Math.max(first.x, second.x);
    var leftY = Math.max(first.y, second.y);
    var rightX = Math.min(first.x + first.w, second.x + second.w);
    var rightY = Math.min(first.y + first.h, second.y + second.h);

    return {
      x: leftX,
      y: leftY,
      w: Math.max(leftX, rightX) - leftX,
      h: Math.max(leftY, rightY) - leftY,
    };
  },
  checkPixelFormat: function (fmt) {},
  loadColorToCSSRGB: function (color) {
    var rgba = HEAP32[color >> 2];
    return (
      "rgb(" +
      (rgba & 255) +
      "," +
      ((rgba >> 8) & 255) +
      "," +
      ((rgba >> 16) & 255) +
      ")"
    );
  },
  loadColorToCSSRGBA: function (color) {
    var rgba = HEAP32[color >> 2];
    return (
      "rgba(" +
      (rgba & 255) +
      "," +
      ((rgba >> 8) & 255) +
      "," +
      ((rgba >> 16) & 255) +
      "," +
      ((rgba >> 24) & 255) / 255 +
      ")"
    );
  },
  translateColorToCSSRGBA: function (rgba) {
    return (
      "rgba(" +
      (rgba & 0xff) +
      "," +
      ((rgba >> 8) & 0xff) +
      "," +
      ((rgba >> 16) & 0xff) +
      "," +
      (rgba >>> 24) / 0xff +
      ")"
    );
  },
  translateRGBAToCSSRGBA: function (r, g, b, a) {
    return (
      "rgba(" +
      (r & 0xff) +
      "," +
      (g & 0xff) +
      "," +
      (b & 0xff) +
      "," +
      (a & 0xff) / 255 +
      ")"
    );
  },
  translateRGBAToColor: function (r, g, b, a) {
    return r | (g << 8) | (b << 16) | (a << 24);
  },
  makeSurface: function (
    width,
    height,
    flags,
    usePageCanvas,
    source,
    rmask,
    gmask,
    bmask,
    amask
  ) {
    flags = flags || 0;
    var is_SDL_HWSURFACE = flags & 0x00000001;
    var is_SDL_HWPALETTE = flags & 0x00200000;
    var is_SDL_OPENGL = flags & 0x04000000;

    var surf = _malloc(60);
    var pixelFormat = _malloc(44);
    //surface with SDL_HWPALETTE flag is 8bpp surface (1 byte)
    var bpp = is_SDL_HWPALETTE ? 1 : 4;
    var buffer = 0;

    // preemptively initialize this for software surfaces,
    // otherwise it will be lazily initialized inside of SDL_LockSurface
    if (!is_SDL_HWSURFACE && !is_SDL_OPENGL) {
      buffer = _malloc(width * height * 4);
    }

    HEAP32[surf >> 2] = flags;
    HEAPU32[(surf + 4) >> 2] = pixelFormat;
    HEAP32[(surf + 8) >> 2] = width;
    HEAP32[(surf + 12) >> 2] = height;
    HEAP32[(surf + 16) >> 2] = width * bpp; // assuming RGBA or indexed for now,
    // since that is what ImageData gives us in browsers
    HEAPU32[(surf + 20) >> 2] = buffer;

    HEAP32[(surf + 36) >> 2] = 0;
    HEAP32[(surf + 40) >> 2] = 0;
    HEAP32[(surf + 44) >> 2] = Module["canvas"].width;
    HEAP32[(surf + 48) >> 2] = Module["canvas"].height;

    HEAP32[(surf + 56) >> 2] = 1;

    HEAP32[pixelFormat >> 2] = -2042224636;
    HEAP32[(pixelFormat + 4) >> 2] = 0; // TODO
    HEAP8[(pixelFormat + 8) >> 0] = bpp * 8;
    HEAP8[(pixelFormat + 9) >> 0] = bpp;

    HEAP32[(pixelFormat + 12) >> 2] = rmask || 0x000000ff;
    HEAP32[(pixelFormat + 16) >> 2] = gmask || 0x0000ff00;
    HEAP32[(pixelFormat + 20) >> 2] = bmask || 0x00ff0000;
    HEAP32[(pixelFormat + 24) >> 2] = amask || 0xff000000;

    // Decide if we want to use WebGL or not
    SDL.GL = SDL.GL || is_SDL_OPENGL;
    var canvas;
    if (!usePageCanvas) {
      if (SDL.canvasPool.length > 0) {
        canvas = SDL.canvasPool.pop();
      } else {
        canvas = document.createElement("canvas");
      }
      canvas.width = width;
      canvas.height = height;
    } else {
      canvas = Module["canvas"];
    }

    var webGLContextAttributes = {
      antialias:
        SDL.glAttributes[13 /*SDL_GL_MULTISAMPLEBUFFERS*/] != 0 &&
        SDL.glAttributes[14 /*SDL_GL_MULTISAMPLESAMPLES*/] > 1,
      depth: SDL.glAttributes[6 /*SDL_GL_DEPTH_SIZE*/] > 0,
      stencil: SDL.glAttributes[7 /*SDL_GL_STENCIL_SIZE*/] > 0,
      alpha: SDL.glAttributes[3 /*SDL_GL_ALPHA_SIZE*/] > 0,
    };

    var ctx = Browser.createContext(
      canvas,
      is_SDL_OPENGL,
      usePageCanvas,
      webGLContextAttributes
    );

    SDL.surfaces[surf] = {
      width: width,
      height: height,
      canvas: canvas,
      ctx: ctx,
      surf: surf,
      buffer: buffer,
      pixelFormat: pixelFormat,
      alpha: 255,
      flags: flags,
      locked: 0,
      usePageCanvas: usePageCanvas,
      source: source,

      isFlagSet: function (flag) {
        return flags & flag;
      },
    };

    return surf;
  },
  copyIndexedColorData: function (surfData, rX, rY, rW, rH) {
    // HWPALETTE works with palette
    // setted by SDL_SetColors
    if (!surfData.colors) {
      return;
    }

    var fullWidth = Module["canvas"].width;
    var fullHeight = Module["canvas"].height;

    var startX = rX || 0;
    var startY = rY || 0;
    var endX = (rW || fullWidth - startX) + startX;
    var endY = (rH || fullHeight - startY) + startY;

    var buffer = surfData.buffer;

    if (!surfData.image.data32) {
      surfData.image.data32 = new Uint32Array(surfData.image.data.buffer);
    }
    var data32 = surfData.image.data32;

    var colors32 = surfData.colors32;

    for (var y = startY; y < endY; ++y) {
      var base = y * fullWidth;
      for (var x = startX; x < endX; ++x) {
        data32[base + x] = colors32[HEAPU8[(buffer + base + x) >> 0]];
      }
    }
  },
  freeSurface: function (surf) {
    var refcountPointer = surf + 56;
    var refcount = HEAP32[refcountPointer >> 2];
    if (refcount > 1) {
      HEAP32[refcountPointer >> 2] = refcount - 1;
      return;
    }

    var info = SDL.surfaces[surf];
    if (!info.usePageCanvas && info.canvas) SDL.canvasPool.push(info.canvas);
    if (info.buffer) _free(info.buffer);
    _free(info.pixelFormat);
    _free(surf);
    SDL.surfaces[surf] = null;

    if (surf === SDL.screen) {
      SDL.screen = null;
    }
  },
  blitSurface: function (src, srcrect, dst, dstrect, scale) {
    var srcData = SDL.surfaces[src];
    var dstData = SDL.surfaces[dst];
    var sr, dr;
    if (srcrect) {
      sr = SDL.loadRect(srcrect);
    } else {
      sr = { x: 0, y: 0, w: srcData.width, h: srcData.height };
    }
    if (dstrect) {
      dr = SDL.loadRect(dstrect);
    } else {
      dr = { x: 0, y: 0, w: srcData.width, h: srcData.height };
    }
    if (dstData.clipRect) {
      var widthScale = !scale || sr.w === 0 ? 1 : sr.w / dr.w;
      var heightScale = !scale || sr.h === 0 ? 1 : sr.h / dr.h;

      dr = SDL.intersectionOfRects(dstData.clipRect, dr);

      sr.w = dr.w * widthScale;
      sr.h = dr.h * heightScale;

      if (dstrect) {
        SDL.updateRect(dstrect, dr);
      }
    }
    var blitw, blith;
    if (scale) {
      blitw = dr.w;
      blith = dr.h;
    } else {
      blitw = sr.w;
      blith = sr.h;
    }
    if (sr.w === 0 || sr.h === 0 || blitw === 0 || blith === 0) {
      return 0;
    }
    var oldAlpha = dstData.ctx.globalAlpha;
    dstData.ctx.globalAlpha = srcData.alpha / 255;
    dstData.ctx.drawImage(
      srcData.canvas,
      sr.x,
      sr.y,
      sr.w,
      sr.h,
      dr.x,
      dr.y,
      blitw,
      blith
    );
    dstData.ctx.globalAlpha = oldAlpha;
    if (dst != SDL.screen) {
      // XXX As in IMG_Load, for compatibility we write out |pixels|
      warnOnce("WARNING: copying canvas data to memory for compatibility");
      _SDL_LockSurface(dst);
      dstData.locked--; // The surface is not actually locked in this hack
    }
    return 0;
  },
  downFingers: {},
  savedKeydown: null,
  receiveEvent: function (event) {
    function unpressAllPressedKeys() {
      // Un-press all pressed keys: TODO
      for (var code in SDL.keyboardMap) {
        SDL.events.push({
          type: "keyup",
          keyCode: SDL.keyboardMap[code],
        });
      }
    }
    switch (event.type) {
      case "touchstart":
      case "touchmove": {
        event.preventDefault();

        var touches = [];

        // Clear out any touchstart events that we've already processed
        if (event.type === "touchstart") {
          for (var i = 0; i < event.touches.length; i++) {
            var touch = event.touches[i];
            if (SDL.downFingers[touch.identifier] != true) {
              SDL.downFingers[touch.identifier] = true;
              touches.push(touch);
            }
          }
        } else {
          touches = event.touches;
        }

        var firstTouch = touches[0];
        if (firstTouch) {
          if (event.type == "touchstart") {
            SDL.DOMButtons[0] = 1;
          }
          var mouseEventType;
          switch (event.type) {
            case "touchstart":
              mouseEventType = "mousedown";
              break;
            case "touchmove":
              mouseEventType = "mousemove";
              break;
          }
          var mouseEvent = {
            type: mouseEventType,
            button: 0,
            pageX: firstTouch.clientX,
            pageY: firstTouch.clientY,
          };
          SDL.events.push(mouseEvent);
        }

        for (var i = 0; i < touches.length; i++) {
          var touch = touches[i];
          SDL.events.push({
            type: event.type,
            touch: touch,
          });
        }
        break;
      }
      case "touchend": {
        event.preventDefault();

        // Remove the entry in the SDL.downFingers hash
        // because the finger is no longer down.
        for (var i = 0; i < event.changedTouches.length; i++) {
          var touch = event.changedTouches[i];
          if (SDL.downFingers[touch.identifier] === true) {
            delete SDL.downFingers[touch.identifier];
          }
        }

        var mouseEvent = {
          type: "mouseup",
          button: 0,
          pageX: event.changedTouches[0].clientX,
          pageY: event.changedTouches[0].clientY,
        };
        SDL.DOMButtons[0] = 0;
        SDL.events.push(mouseEvent);

        for (var i = 0; i < event.changedTouches.length; i++) {
          var touch = event.changedTouches[i];
          SDL.events.push({
            type: "touchend",
            touch: touch,
          });
        }
        break;
      }
      case "DOMMouseScroll":
      case "mousewheel":
      case "wheel":
        var delta = -Browser.getMouseWheelDelta(event); // Flip the wheel direction to translate from browser wheel direction (+:down) to SDL direction (+:up)
        delta =
          delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1); // Quantize to integer so that minimum scroll is at least +/- 1.

        // Simulate old-style SDL events representing mouse wheel input as buttons
        var button =
          delta > 0 ? 3 /*SDL_BUTTON_WHEELUP-1*/ : 4; /*SDL_BUTTON_WHEELDOWN-1*/ // Subtract one since JS->C marshalling is defined to add one back.
        SDL.events.push({
          type: "mousedown",
          button: button,
          pageX: event.pageX,
          pageY: event.pageY,
        });
        SDL.events.push({
          type: "mouseup",
          button: button,
          pageX: event.pageX,
          pageY: event.pageY,
        });

        // Pass a delta motion event.
        SDL.events.push({ type: "wheel", deltaX: 0, deltaY: delta });
        event.preventDefault(); // If we don't prevent this, then 'wheel' event will be sent again by the browser as 'DOMMouseScroll' and we will receive this same event the second time.
        break;
      case "mousemove":
        if (SDL.DOMButtons[0] === 1) {
          SDL.events.push({
            type: "touchmove",
            touch: {
              identifier: 0,
              deviceID: -1,
              pageX: event.pageX,
              pageY: event.pageY,
            },
          });
        }
        if (Browser.pointerLock) {
          // workaround for firefox bug 750111
          if ("mozMovementX" in event) {
            event["movementX"] = event["mozMovementX"];
            event["movementY"] = event["mozMovementY"];
          }
          // workaround for Firefox bug 782777
          if (event["movementX"] == 0 && event["movementY"] == 0) {
            // ignore a mousemove event if it doesn't contain any movement info
            // (without pointer lock, we infer movement from pageX/pageY, so this check is unnecessary)
            event.preventDefault();
            return;
          }
        }
      // fall through
      case "keydown":
      case "keyup":
      case "keypress":
      case "mousedown":
      case "mouseup":
        // If we preventDefault on keydown events, the subsequent keypress events
        // won't fire. However, it's fine (and in some cases necessary) to
        // preventDefault for keys that don't generate a character. Otherwise,
        // preventDefault is the right thing to do in general.
        if (
          event.type !== "keydown" ||
          (!SDL_unicode() && !SDL.textInput) ||
          event.keyCode === 8 /* backspace */ ||
          event.keyCode === 9 /* tab */
        ) {
          event.preventDefault();
        }

        if (event.type == "mousedown") {
          SDL.DOMButtons[event.button] = 1;
          SDL.events.push({
            type: "touchstart",
            touch: {
              identifier: 0,
              deviceID: -1,
              pageX: event.pageX,
              pageY: event.pageY,
            },
          });
        } else if (event.type == "mouseup") {
          // ignore extra ups, can happen if we leave the canvas while pressing down, then return,
          // since we add a mouseup in that case
          if (!SDL.DOMButtons[event.button]) {
            return;
          }

          SDL.events.push({
            type: "touchend",
            touch: {
              identifier: 0,
              deviceID: -1,
              pageX: event.pageX,
              pageY: event.pageY,
            },
          });
          SDL.DOMButtons[event.button] = 0;
        }

        // We can only request fullscreen as the result of user input.
        // Due to this limitation, we toggle a boolean on keydown which
        // SDL_WM_ToggleFullScreen will check and subsequently set another
        // flag indicating for us to request fullscreen on the following
        // keyup. This isn't perfect, but it enables SDL_WM_ToggleFullScreen
        // to work as the result of a keypress (which is an extremely
        // common use case).
        if (event.type === "keydown" || event.type === "mousedown") {
          SDL.canRequestFullscreen = true;
        } else if (event.type === "keyup" || event.type === "mouseup") {
          if (SDL.isRequestingFullscreen) {
            Module["requestFullscreen"](
              /*lockPointer=*/ true,
              /*resizeCanvas=*/ true
            );
            SDL.isRequestingFullscreen = false;
          }
          SDL.canRequestFullscreen = false;
        }

        // SDL expects a unicode character to be passed to its keydown events.
        // Unfortunately, the browser APIs only provide a charCode property on
        // keypress events, so we must backfill in keydown events with their
        // subsequent keypress event's charCode.
        if (event.type === "keypress" && SDL.savedKeydown) {
          // charCode is read-only
          SDL.savedKeydown.keypressCharCode = event.charCode;
          SDL.savedKeydown = null;
        } else if (event.type === "keydown") {
          SDL.savedKeydown = event;
        }

        // Don't push keypress events unless SDL_StartTextInput has been called.
        if (event.type !== "keypress" || SDL.textInput) {
          SDL.events.push(event);
        }
        break;
      case "mouseout":
        // Un-press all pressed mouse buttons, because we might miss the release outside of the canvas
        for (var i = 0; i < 3; i++) {
          if (SDL.DOMButtons[i]) {
            SDL.events.push({
              type: "mouseup",
              button: i,
              pageX: event.pageX,
              pageY: event.pageY,
            });
            SDL.DOMButtons[i] = 0;
          }
        }
        event.preventDefault();
        break;
      case "focus":
        SDL.events.push(event);
        event.preventDefault();
        break;
      case "blur":
        SDL.events.push(event);
        unpressAllPressedKeys();
        event.preventDefault();
        break;
      case "visibilitychange":
        SDL.events.push({
          type: "visibilitychange",
          visible: !document.hidden,
        });
        unpressAllPressedKeys();
        event.preventDefault();
        break;
      case "unload":
        if (Browser.mainLoop.runner) {
          SDL.events.push(event);
          // Force-run a main event loop, since otherwise this event will never be caught!
          Browser.mainLoop.runner();
        }
        return;
      case "resize":
        SDL.events.push(event);
        // manually triggered resize event doesn't have a preventDefault member
        if (event.preventDefault) {
          event.preventDefault();
        }
        break;
    }
    if (SDL.events.length >= 10000) {
      err("SDL event queue full, dropping events");
      SDL.events = SDL.events.slice(0, 10000);
    }
    // If we have a handler installed, this will push the events to the app
    // instead of the app polling for them.
    SDL.flushEventsToHandler();
    return;
  },
  lookupKeyCodeForEvent: function (event) {
    var code = event.keyCode;
    if (code >= 65 && code <= 90) {
      code += 32; // make lowercase for SDL
    } else {
      code = SDL.keyCodes[event.keyCode] || event.keyCode;
      // If this is one of the modifier keys (224 | 1<<10 - 227 | 1<<10), and the event specifies that it is
      // a right key, add 4 to get the right key SDL key code.
      if (
        event.location === 2 /*KeyboardEvent.DOM_KEY_LOCATION_RIGHT*/ &&
        code >= (224 | (1 << 10)) &&
        code <= (227 | (1 << 10))
      ) {
        code += 4;
      }
    }
    return code;
  },
  handleEvent: function (event) {
    if (event.handled) return;
    event.handled = true;

    switch (event.type) {
      case "touchstart":
      case "touchend":
      case "touchmove": {
        Browser.calculateMouseEvent(event);
        break;
      }
      case "keydown":
      case "keyup": {
        var down = event.type === "keydown";
        var code = SDL.lookupKeyCodeForEvent(event);
        // Assigning a boolean to HEAP8, that's alright but Closure would like to warn about it.
        // TODO(https://github.com/emscripten-core/emscripten/issues/16311):
        // This is kind of ugly hack.  Perhaps we can find a better way?
        /** @suppress{checkTypes} */
        HEAP8[(SDL.keyboardState + code) >> 0] = down;
        // TODO: lmeta, rmeta, numlock, capslock, KMOD_MODE, KMOD_RESERVED
        SDL.modState =
          (HEAP8[(SDL.keyboardState + 1248) >> 0] ? 0x0040 : 0) | // KMOD_LCTRL
          (HEAP8[(SDL.keyboardState + 1249) >> 0] ? 0x0001 : 0) | // KMOD_LSHIFT
          (HEAP8[(SDL.keyboardState + 1250) >> 0] ? 0x0100 : 0) | // KMOD_LALT
          (HEAP8[(SDL.keyboardState + 1252) >> 0] ? 0x0080 : 0) | // KMOD_RCTRL
          (HEAP8[(SDL.keyboardState + 1253) >> 0] ? 0x0002 : 0) | // KMOD_RSHIFT
          (HEAP8[(SDL.keyboardState + 1254) >> 0] ? 0x0200 : 0); //  KMOD_RALT
        if (down) {
          SDL.keyboardMap[code] = event.keyCode; // save the DOM input, which we can use to unpress it during blur
        } else {
          delete SDL.keyboardMap[code];
        }

        break;
      }
      case "mousedown":
      case "mouseup":
        if (event.type == "mousedown") {
          // SDL_BUTTON(x) is defined as (1 << ((x)-1)).  SDL buttons are 1-3,
          // and DOM buttons are 0-2, so this means that the below formula is
          // correct.
          SDL.buttonState |= 1 << event.button;
        } else if (event.type == "mouseup") {
          SDL.buttonState &= ~(1 << event.button);
        }
      // fall through
      case "mousemove": {
        Browser.calculateMouseEvent(event);
        break;
      }
    }
  },
  flushEventsToHandler: function () {
    if (!SDL.eventHandler) return;

    while (SDL.pollEvent(SDL.eventHandlerTemp)) {
      getWasmTableEntry(SDL.eventHandler)(
        SDL.eventHandlerContext,
        SDL.eventHandlerTemp
      );
    }
  },
  pollEvent: function (ptr) {
    if (SDL.initFlags & 0x200 && SDL.joystickEventState) {
      // If SDL_INIT_JOYSTICK was supplied AND the joystick system is configured
      // to automatically query for events, query for joystick events.
      SDL.queryJoysticks();
    }
    if (ptr) {
      while (SDL.events.length > 0) {
        if (SDL.makeCEvent(SDL.events.shift(), ptr) !== false) return 1;
      }
      return 0;
    } else {
      // XXX: somewhat risky in that we do not check if the event is real or not (makeCEvent returns false) if no pointer supplied
      return SDL.events.length > 0;
    }
  },
  makeCEvent: function (event, ptr) {
    if (typeof event == "number") {
      // This is a pointer to a copy of a native C event that was SDL_PushEvent'ed
      _memcpy(ptr, event, 28);
      _free(event); // the copy is no longer needed
      return;
    }

    SDL.handleEvent(event);

    switch (event.type) {
      case "keydown":
      case "keyup": {
        var down = event.type === "keydown";
        //out('Received key event: ' + event.keyCode);
        var key = SDL.lookupKeyCodeForEvent(event);
        var scan;
        if (key >= 1024) {
          scan = key - 1024;
        } else {
          scan = SDL.scanCodes[key] || key;
        }

        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
        HEAP8[(ptr + 8) >> 0] = down ? 1 : 0;
        HEAP8[(ptr + 9) >> 0] = 0; // TODO
        HEAP32[(ptr + 12) >> 2] = scan;
        HEAP32[(ptr + 16) >> 2] = key;
        HEAP16[(ptr + 20) >> 1] = SDL.modState;
        // some non-character keys (e.g. backspace and tab) won't have keypressCharCode set, fill in with the keyCode.
        HEAP32[(ptr + 24) >> 2] = event.keypressCharCode || key;

        break;
      }
      case "keypress": {
        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
        // Not filling in windowID for now
        var cStr = intArrayFromString(String.fromCharCode(event.charCode));
        for (var i = 0; i < cStr.length; ++i) {
          HEAP8[(ptr + (8 + i)) >> 0] = cStr[i];
        }
        break;
      }
      case "mousedown":
      case "mouseup":
      case "mousemove": {
        if (event.type != "mousemove") {
          var down = event.type === "mousedown";
          HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
          HEAP32[(ptr + 4) >> 2] = 0;
          HEAP32[(ptr + 8) >> 2] = 0;
          HEAP32[(ptr + 12) >> 2] = 0;
          HEAP8[(ptr + 16) >> 0] = event.button + 1; // DOM buttons are 0-2, SDL 1-3
          HEAP8[(ptr + 17) >> 0] = down ? 1 : 0;
          HEAP32[(ptr + 20) >> 2] = Browser.mouseX;
          HEAP32[(ptr + 24) >> 2] = Browser.mouseY;
        } else {
          HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
          HEAP32[(ptr + 4) >> 2] = 0;
          HEAP32[(ptr + 8) >> 2] = 0;
          HEAP32[(ptr + 12) >> 2] = 0;
          HEAP32[(ptr + 16) >> 2] = SDL.buttonState;
          HEAP32[(ptr + 20) >> 2] = Browser.mouseX;
          HEAP32[(ptr + 24) >> 2] = Browser.mouseY;
          HEAP32[(ptr + 28) >> 2] = Browser.mouseMovementX;
          HEAP32[(ptr + 32) >> 2] = Browser.mouseMovementY;
        }
        break;
      }
      case "wheel": {
        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(ptr + 16) >> 2] = event.deltaX;
        HEAP32[(ptr + 20) >> 2] = event.deltaY;
        break;
      }
      case "touchstart":
      case "touchend":
      case "touchmove": {
        var touch = event.touch;
        if (!Browser.touches[touch.identifier]) break;
        var w = Module["canvas"].width;
        var h = Module["canvas"].height;
        var x = Browser.touches[touch.identifier].x / w;
        var y = Browser.touches[touch.identifier].y / h;
        var lx = Browser.lastTouches[touch.identifier].x / w;
        var ly = Browser.lastTouches[touch.identifier].y / h;
        var dx = x - lx;
        var dy = y - ly;
        if (touch["deviceID"] === undefined)
          touch.deviceID = SDL.TOUCH_DEFAULT_ID;
        if (dx === 0 && dy === 0 && event.type === "touchmove") return false; // don't send these if nothing happened
        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(ptr + 4) >> 2] = _SDL_GetTicks();
        (tempI64 = [
          touch.deviceID >>> 0,
          ((tempDouble = touch.deviceID),
          +Math.abs(tempDouble) >= 1.0
            ? tempDouble > 0.0
              ? (Math.min(
                  +Math.floor(tempDouble / 4294967296.0),
                  4294967295.0
                ) |
                  0) >>>
                0
              : ~~+Math.ceil(
                  (tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0
                ) >>> 0
            : 0),
        ]),
          (HEAP32[(ptr + 8) >> 2] = tempI64[0]),
          (HEAP32[(ptr + 12) >> 2] = tempI64[1]);
        (tempI64 = [
          touch.identifier >>> 0,
          ((tempDouble = touch.identifier),
          +Math.abs(tempDouble) >= 1.0
            ? tempDouble > 0.0
              ? (Math.min(
                  +Math.floor(tempDouble / 4294967296.0),
                  4294967295.0
                ) |
                  0) >>>
                0
              : ~~+Math.ceil(
                  (tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0
                ) >>> 0
            : 0),
        ]),
          (HEAP32[(ptr + 16) >> 2] = tempI64[0]),
          (HEAP32[(ptr + 20) >> 2] = tempI64[1]);
        HEAPF32[(ptr + 24) >> 2] = x;
        HEAPF32[(ptr + 28) >> 2] = y;
        HEAPF32[(ptr + 32) >> 2] = dx;
        HEAPF32[(ptr + 36) >> 2] = dy;
        if (touch.force !== undefined) {
          HEAPF32[(ptr + 40) >> 2] = touch.force;
        } else {
          // No pressure data, send a digital 0/1 pressure.
          HEAPF32[(ptr + 40) >> 2] = event.type == "touchend" ? 0 : 1;
        }
        break;
      }
      case "unload": {
        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
        break;
      }
      case "resize": {
        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(ptr + 4) >> 2] = event.w;
        HEAP32[(ptr + 8) >> 2] = event.h;
        break;
      }
      case "joystick_button_up":
      case "joystick_button_down": {
        var state = event.type === "joystick_button_up" ? 0 : 1;
        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
        HEAP8[(ptr + 4) >> 0] = event.index;
        HEAP8[(ptr + 5) >> 0] = event.button;
        HEAP8[(ptr + 6) >> 0] = state;
        break;
      }
      case "joystick_axis_motion": {
        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
        HEAP8[(ptr + 4) >> 0] = event.index;
        HEAP8[(ptr + 5) >> 0] = event.axis;
        HEAP32[(ptr + 8) >> 2] = SDL.joystickAxisValueConversion(event.value);
        break;
      }
      case "focus": {
        var SDL_WINDOWEVENT_FOCUS_GAINED = 12; /* SDL_WINDOWEVENT_FOCUS_GAINED */
        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(ptr + 4) >> 2] = 0;
        HEAP8[(ptr + 8) >> 0] = SDL_WINDOWEVENT_FOCUS_GAINED;
        break;
      }
      case "blur": {
        var SDL_WINDOWEVENT_FOCUS_LOST = 13; /* SDL_WINDOWEVENT_FOCUS_LOST */
        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(ptr + 4) >> 2] = 0;
        HEAP8[(ptr + 8) >> 0] = SDL_WINDOWEVENT_FOCUS_LOST;
        break;
      }
      case "visibilitychange": {
        var SDL_WINDOWEVENT_SHOWN = 1; /* SDL_WINDOWEVENT_SHOWN */
        var SDL_WINDOWEVENT_HIDDEN = 2; /* SDL_WINDOWEVENT_HIDDEN */
        var visibilityEventID = event.visible
          ? SDL_WINDOWEVENT_SHOWN
          : SDL_WINDOWEVENT_HIDDEN;
        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(ptr + 4) >> 2] = 0;
        HEAP8[(ptr + 8) >> 0] = visibilityEventID;
        break;
      }
      default:
        throw "Unhandled SDL event: " + event.type;
    }
  },
  makeFontString: function (height, fontName) {
    if (fontName.charAt(0) != "'" && fontName.charAt(0) != '"') {
      // https://developer.mozilla.org/ru/docs/Web/CSS/font-family
      // Font family names containing whitespace should be quoted.
      // BTW, quote all font names is easier than searching spaces
      fontName = '"' + fontName + '"';
    }
    return height + "px " + fontName + ", serif";
  },
  estimateTextWidth: function (fontData, text) {
    var h = fontData.size;
    var fontString = SDL.makeFontString(h, fontData.name);
    var tempCtx = SDL_ttfContext();
    tempCtx.font = fontString;
    var ret = tempCtx.measureText(text).width | 0;
    return ret;
  },
  allocateChannels: function (num) {
    // called from Mix_AllocateChannels and init
    if (SDL.numChannels && SDL.numChannels >= num && num != 0) return;
    SDL.numChannels = num;
    SDL.channels = [];
    for (var i = 0; i < num; i++) {
      SDL.channels[i] = {
        audio: null,
        volume: 1.0,
      };
    }
  },
  setGetVolume: function (info, volume) {
    if (!info) return 0;
    var ret = info.volume * 128; // MIX_MAX_VOLUME
    if (volume != -1) {
      info.volume = Math.min(Math.max(volume, 0), 128) / 128;
      if (info.audio) {
        try {
          info.audio.volume = info.volume; // For <audio> element
          if (info.audio.webAudioGainNode)
            info.audio.webAudioGainNode["gain"]["value"] = info.volume; // For WebAudio playback
        } catch (e) {
          err("setGetVolume failed to set audio volume: " + e);
        }
      }
    }
    return ret;
  },
  setPannerPosition: function (info, x, y, z) {
    if (!info) return;
    if (info.audio) {
      if (info.audio.webAudioPannerNode) {
        info.audio.webAudioPannerNode["setPosition"](x, y, z);
      }
    }
  },
  playWebAudio: function (audio) {
    if (!audio) return;
    if (audio.webAudioNode) return; // This instance is already playing, don't start again.
    if (!SDL.webAudioAvailable()) return;
    try {
      var webAudio = audio.resource.webAudio;
      audio.paused = false;
      if (!webAudio.decodedBuffer) {
        if (webAudio.onDecodeComplete === undefined)
          abort("Cannot play back audio object that was not loaded");
        webAudio.onDecodeComplete.push(function () {
          if (!audio.paused) SDL.playWebAudio(audio);
        });
        return;
      }
      audio.webAudioNode = SDL.audioContext["createBufferSource"]();
      audio.webAudioNode["buffer"] = webAudio.decodedBuffer;
      audio.webAudioNode["loop"] = audio.loop;
      audio.webAudioNode["onended"] = function () {
        audio["onended"]();
      }; // For <media> element compatibility, route the onended signal to the instance.

      audio.webAudioPannerNode = SDL.audioContext["createPanner"]();
      // avoid Chrome bug
      // If posz = 0, the sound will come from only the right.
      // By posz = -0.5 (slightly ahead), the sound will come from right and left correctly.
      audio.webAudioPannerNode["setPosition"](0, 0, -0.5);
      audio.webAudioPannerNode["panningModel"] = "equalpower";

      // Add an intermediate gain node to control volume.
      audio.webAudioGainNode = SDL.audioContext["createGain"]();
      audio.webAudioGainNode["gain"]["value"] = audio.volume;

      audio.webAudioNode["connect"](audio.webAudioPannerNode);
      audio.webAudioPannerNode["connect"](audio.webAudioGainNode);
      audio.webAudioGainNode["connect"](SDL.audioContext["destination"]);

      audio.webAudioNode["start"](0, audio.currentPosition);
      audio.startTime = SDL.audioContext["currentTime"] - audio.currentPosition;
    } catch (e) {
      err("playWebAudio failed: " + e);
    }
  },
  pauseWebAudio: function (audio) {
    if (!audio) return;
    if (audio.webAudioNode) {
      try {
        // Remember where we left off, so that if/when we resume, we can restart the playback at a proper place.
        audio.currentPosition =
          (SDL.audioContext["currentTime"] - audio.startTime) %
          audio.resource.webAudio.decodedBuffer.duration;
        // Important: When we reach here, the audio playback is stopped by the user. But when calling .stop() below, the Web Audio
        // graph will send the onended signal, but we don't want to process that, since pausing should not clear/destroy the audio
        // channel.
        audio.webAudioNode["onended"] = undefined;
        audio.webAudioNode.stop(0); // 0 is a default parameter, but WebKit is confused by it #3861
        audio.webAudioNode = undefined;
      } catch (e) {
        err("pauseWebAudio failed: " + e);
      }
    }
    audio.paused = true;
  },
  openAudioContext: function () {
    // Initialize Web Audio API if we haven't done so yet. Note: Only initialize Web Audio context ever once on the web page,
    // since initializing multiple times fails on Chrome saying 'audio resources have been exhausted'.
    if (!SDL.audioContext) {
      if (typeof AudioContext != "undefined")
        SDL.audioContext = new AudioContext();
      else if (typeof webkitAudioContext != "undefined")
        SDL.audioContext = new webkitAudioContext();
    }
  },
  webAudioAvailable: function () {
    return !!SDL.audioContext;
  },
  fillWebAudioBufferFromHeap: function (
    heapPtr,
    sizeSamplesPerChannel,
    dstAudioBuffer
  ) {
    // The input audio data is interleaved across the channels, i.e. [L, R, L, R, L, R, ...] and is either 8-bit, 16-bit or float as
    // supported by the SDL API. The output audio wave data for Web Audio API must be in planar buffers of [-1,1]-normalized Float32 data,
    // so perform a buffer conversion for the data.
    var audio = SDL_audio();
    var numChannels = audio.channels;
    for (var c = 0; c < numChannels; ++c) {
      var channelData = dstAudioBuffer["getChannelData"](c);
      if (channelData.length != sizeSamplesPerChannel) {
        throw (
          "Web Audio output buffer length mismatch! Destination size: " +
          channelData.length +
          " samples vs expected " +
          sizeSamplesPerChannel +
          " samples!"
        );
      }
      if (audio.format == 32784) {
        for (var j = 0; j < sizeSamplesPerChannel; ++j) {
          channelData[j] =
            HEAP16[(heapPtr + (j * numChannels + c) * 2) >> 1] / 0x8000;
        }
      } else if (audio.format == 8) {
        for (var j = 0; j < sizeSamplesPerChannel; ++j) {
          var v = HEAP8[(heapPtr + (j * numChannels + c)) >> 0];
          channelData[j] = (v >= 0 ? v - 128 : v + 128) / 128;
        }
      } else if (audio.format == 33056) {
        for (var j = 0; j < sizeSamplesPerChannel; ++j) {
          channelData[j] = HEAPF32[(heapPtr + (j * numChannels + c) * 4) >> 2];
        }
      } else {
        throw "Invalid SDL audio format " + audio.format + "!";
      }
    }
  },
  debugSurface: function (surfData) {
    out(
      "dumping surface " +
        [surfData.surf, surfData.source, surfData.width, surfData.height]
    );
    var image = surfData.ctx.getImageData(
      0,
      0,
      surfData.width,
      surfData.height
    );
    var data = image.data;
    var num = Math.min(surfData.width, surfData.height);
    for (var i = 0; i < num; i++) {
      out(
        "   diagonal " +
          i +
          ":" +
          [
            data[i * surfData.width * 4 + i * 4 + 0],
            data[i * surfData.width * 4 + i * 4 + 1],
            data[i * surfData.width * 4 + i * 4 + 2],
            data[i * surfData.width * 4 + i * 4 + 3],
          ]
      );
    }
  },
  joystickEventState: 1,
  lastJoystickState: {},
  joystickNamePool: {},
  recordJoystickState: function (joystick, state) {
    // Standardize button state.
    var buttons = new Array(state.buttons.length);
    for (var i = 0; i < state.buttons.length; i++) {
      buttons[i] = SDL.getJoystickButtonState(state.buttons[i]);
    }

    SDL.lastJoystickState[joystick] = {
      buttons: buttons,
      axes: state.axes.slice(0),
      timestamp: state.timestamp,
      index: state.index,
      id: state.id,
    };
  },
  getJoystickButtonState: function (button) {
    if (typeof button == "object") {
      // Current gamepad API editor's draft (Firefox Nightly)
      // https://dvcs.w3.org/hg/gamepad/raw-file/default/gamepad.html#idl-def-GamepadButton
      return button["pressed"];
    } else {
      // Current gamepad API working draft (Firefox / Chrome Stable)
      // http://www.w3.org/TR/2012/WD-gamepad-20120529/#gamepad-interface
      return button > 0;
    }
  },
  queryJoysticks: function () {
    for (var joystick in SDL.lastJoystickState) {
      var state = SDL.getGamepad(joystick - 1);
      var prevState = SDL.lastJoystickState[joystick];
      // If joystick was removed, state returns null.
      if (typeof state == "undefined") return;
      if (state === null) return;
      // Check only if the timestamp has differed.
      // NOTE: Timestamp is not available in Firefox.
      // NOTE: Timestamp is currently not properly set for the GearVR controller
      //       on Samsung Internet: it is always zero.
      if (
        typeof state.timestamp != "number" ||
        state.timestamp != prevState.timestamp ||
        !state.timestamp
      ) {
        var i;
        for (i = 0; i < state.buttons.length; i++) {
          var buttonState = SDL.getJoystickButtonState(state.buttons[i]);
          // NOTE: The previous state already has a boolean representation of
          //       its button, so no need to standardize its button state here.
          if (buttonState !== prevState.buttons[i]) {
            // Insert button-press event.
            SDL.events.push({
              type: buttonState ? "joystick_button_down" : "joystick_button_up",
              joystick: joystick,
              index: joystick - 1,
              button: i,
            });
          }
        }
        for (i = 0; i < state.axes.length; i++) {
          if (state.axes[i] !== prevState.axes[i]) {
            // Insert axes-change event.
            SDL.events.push({
              type: "joystick_axis_motion",
              joystick: joystick,
              index: joystick - 1,
              axis: i,
              value: state.axes[i],
            });
          }
        }

        SDL.recordJoystickState(joystick, state);
      }
    }
  },
  joystickAxisValueConversion: function (value) {
    // Make sure value is properly clamped
    value = Math.min(1, Math.max(value, -1));
    // Ensures that 0 is 0, 1 is 32767, and -1 is 32768.
    return Math.ceil((value + 1) * 32767.5 - 32768);
  },
  getGamepads: function () {
    var fcn =
      navigator.getGamepads ||
      navigator.webkitGamepads ||
      navigator.mozGamepads ||
      navigator.gamepads ||
      navigator.webkitGetGamepads;
    if (fcn !== undefined) {
      // The function must be applied on the navigator object.
      return fcn.apply(navigator);
    } else {
      return [];
    }
  },
  getGamepad: function (deviceIndex) {
    var gamepads = SDL.getGamepads();
    if (gamepads.length > deviceIndex && deviceIndex >= 0) {
      return gamepads[deviceIndex];
    }
    return null;
  },
};
function _SDL_Flip(surf) {
  // We actually do this in Unlock, since the screen surface has as its canvas
  // backing the page canvas element
}

function _SDL_GetError() {
  if (!SDL.errorMessage) {
    SDL.errorMessage = allocateUTF8("unknown SDL-emscripten error");
  }
  return SDL.errorMessage;
}

/** @param{number=} initFlags */
function _SDL_Init(initFlags) {
  SDL.startTime = Date.now();
  SDL.initFlags = initFlags;

  // capture all key events. we just keep down and up, but also capture press to prevent default actions
  if (!Module["doNotCaptureKeyboard"]) {
    var keyboardListeningElement =
      Module["keyboardListeningElement"] || document;
    keyboardListeningElement.addEventListener("keydown", SDL.receiveEvent);
    keyboardListeningElement.addEventListener("keyup", SDL.receiveEvent);
    keyboardListeningElement.addEventListener("keypress", SDL.receiveEvent);
    window.addEventListener("focus", SDL.receiveEvent);
    window.addEventListener("blur", SDL.receiveEvent);
    document.addEventListener("visibilitychange", SDL.receiveEvent);
  }

  window.addEventListener("unload", SDL.receiveEvent);
  SDL.keyboardState = _malloc(0x10000); // Our SDL needs 512, but 64K is safe for older SDLs
  zeroMemory(SDL.keyboardState, 0x10000);
  // Initialize this structure carefully for closure
  SDL.DOMEventToSDLEvent["keydown"] = 0x300 /* SDL_KEYDOWN */;
  SDL.DOMEventToSDLEvent["keyup"] = 0x301 /* SDL_KEYUP */;
  SDL.DOMEventToSDLEvent["keypress"] = 0x303 /* SDL_TEXTINPUT */;
  SDL.DOMEventToSDLEvent["mousedown"] = 0x401 /* SDL_MOUSEBUTTONDOWN */;
  SDL.DOMEventToSDLEvent["mouseup"] = 0x402 /* SDL_MOUSEBUTTONUP */;
  SDL.DOMEventToSDLEvent["mousemove"] = 0x400 /* SDL_MOUSEMOTION */;
  SDL.DOMEventToSDLEvent["wheel"] = 0x403 /* SDL_MOUSEWHEEL */;
  SDL.DOMEventToSDLEvent["touchstart"] = 0x700 /* SDL_FINGERDOWN */;
  SDL.DOMEventToSDLEvent["touchend"] = 0x701 /* SDL_FINGERUP */;
  SDL.DOMEventToSDLEvent["touchmove"] = 0x702 /* SDL_FINGERMOTION */;
  SDL.DOMEventToSDLEvent["unload"] = 0x100 /* SDL_QUIT */;
  SDL.DOMEventToSDLEvent[
    "resize"
  ] = 0x7001 /* SDL_VIDEORESIZE/SDL_EVENT_COMPAT2 */;
  SDL.DOMEventToSDLEvent["visibilitychange"] = 0x200 /* SDL_WINDOWEVENT */;
  SDL.DOMEventToSDLEvent["focus"] = 0x200 /* SDL_WINDOWEVENT */;
  SDL.DOMEventToSDLEvent["blur"] = 0x200 /* SDL_WINDOWEVENT */;

  // These are not technically DOM events; the HTML gamepad API is poll-based.
  // However, we define them here, as the rest of the SDL code assumes that
  // all SDL events originate as DOM events.
  SDL.DOMEventToSDLEvent[
    "joystick_axis_motion"
  ] = 0x600 /* SDL_JOYAXISMOTION */;
  SDL.DOMEventToSDLEvent[
    "joystick_button_down"
  ] = 0x603 /* SDL_JOYBUTTONDOWN */;
  SDL.DOMEventToSDLEvent["joystick_button_up"] = 0x604 /* SDL_JOYBUTTONUP */;
  return 0; // success
}

function _SDL_InitSubSystem(flags) {
  return 0;
}

function _SDL_LockAudio() {}

function listenOnce(object, event, func) {
  object.addEventListener(event, func, { once: true });
}
/** @param {Object=} elements */
function autoResumeAudioContext(ctx, elements) {
  if (!elements) {
    elements = [document, document.getElementById("canvas")];
  }
  ["keydown", "mousedown", "touchstart"].forEach(function (event) {
    elements.forEach(function (element) {
      if (element) {
        listenOnce(element, event, function () {
          if (ctx.state === "suspended") ctx.resume();
        });
      }
    });
  });
}
function _SDL_OpenAudio(desired, obtained) {
  try {
    SDL.audio = {
      freq: HEAPU32[desired >> 2],
      format: HEAPU16[(desired + 4) >> 1],
      channels: HEAPU8[(desired + 6) >> 0],
      samples: HEAPU16[(desired + 8) >> 1], // Samples in the CB buffer per single sound channel.
      callback: HEAPU32[(desired + 16) >> 2],
      userdata: HEAPU32[(desired + 20) >> 2],
      paused: true,
      timer: null,
    };
    // The .silence field tells the constant sample value that corresponds to the safe un-skewed silence value for the wave data.
    if (SDL.audio.format == 8) {
      SDL.audio.silence = 128; // Audio ranges in [0, 255], so silence is half-way in between.
    } else if (SDL.audio.format == 32784) {
      SDL.audio.silence = 0; // Signed data in range [-32768, 32767], silence is 0.
    } else if (SDL.audio.format == 33056) {
      SDL.audio.silence = 0.0; // Float data in range [-1.0, 1.0], silence is 0.0
    } else {
      throw "Invalid SDL audio format " + SDL.audio.format + "!";
    }
    // Round the desired audio frequency up to the next 'common' frequency value.
    // Web Audio API spec states 'An implementation must support sample-rates in at least the range 22050 to 96000.'
    if (SDL.audio.freq <= 0) {
      throw "Unsupported sound frequency " + SDL.audio.freq + "!";
    } else if (SDL.audio.freq <= 22050) {
      SDL.audio.freq = 22050; // Take it safe and clamp everything lower than 22kHz to that.
    } else if (SDL.audio.freq <= 32000) {
      SDL.audio.freq = 32000;
    } else if (SDL.audio.freq <= 44100) {
      SDL.audio.freq = 44100;
    } else if (SDL.audio.freq <= 48000) {
      SDL.audio.freq = 48000;
    } else if (SDL.audio.freq <= 96000) {
      SDL.audio.freq = 96000;
    } else {
      throw "Unsupported sound frequency " + SDL.audio.freq + "!";
    }
    if (SDL.audio.channels == 0) {
      SDL.audio.channels = 1; // In SDL both 0 and 1 mean mono.
    } else if (SDL.audio.channels < 0 || SDL.audio.channels > 32) {
      throw (
        "Unsupported number of audio channels for SDL audio: " +
        SDL.audio.channels +
        "!"
      );
    } else if (SDL.audio.channels != 1 && SDL.audio.channels != 2) {
      // Unsure what SDL audio spec supports. Web Audio spec supports up to 32 channels.
      out(
        "Warning: Using untested number of audio channels " + SDL.audio.channels
      );
    }
    if (
      SDL.audio.samples < 128 ||
      SDL.audio.samples > 524288 /* arbitrary cap */
    ) {
      throw "Unsupported audio callback buffer size " + SDL.audio.samples + "!";
    } else if ((SDL.audio.samples & (SDL.audio.samples - 1)) != 0) {
      throw (
        "Audio callback buffer size " +
        SDL.audio.samples +
        " must be a power-of-two!"
      );
    }

    var totalSamples = SDL.audio.samples * SDL.audio.channels;
    if (SDL.audio.format == 8) {
      SDL.audio.bytesPerSample = 1;
    } else if (SDL.audio.format == 32784) {
      SDL.audio.bytesPerSample = 2;
    } else if (SDL.audio.format == 33056) {
      SDL.audio.bytesPerSample = 4;
    } else {
      throw "Invalid SDL audio format " + SDL.audio.format + "!";
    }
    SDL.audio.bufferSize = totalSamples * SDL.audio.bytesPerSample;
    SDL.audio.bufferDurationSecs =
      SDL.audio.bufferSize /
      SDL.audio.bytesPerSample /
      SDL.audio.channels /
      SDL.audio.freq; // Duration of a single queued buffer in seconds.
    SDL.audio.bufferingDelay = 50 / 1000; // Audio samples are played with a constant delay of this many seconds to account for browser and jitter.
    SDL.audio.buffer = _malloc(SDL.audio.bufferSize);

    // To account for jittering in frametimes, always have multiple audio buffers queued up for the audio output device.
    // This helps that we won't starve that easily if a frame takes long to complete.
    SDL.audio.numSimultaneouslyQueuedBuffers =
      Module["SDL_numSimultaneouslyQueuedBuffers"] || 5;

    // Pulls and queues new audio data if appropriate. This function gets "over-called" in both requestAnimationFrames and
    // setTimeouts to ensure that we get the finest granularity possible and as many chances from the browser to fill
    // new audio data. This is because setTimeouts alone have very poor granularity for audio streaming purposes, but also
    // the application might not be using emscripten_set_main_loop to drive the main loop, so we cannot rely on that alone.
    SDL.audio.queueNewAudioData = function SDL_queueNewAudioData() {
      if (!SDL.audio) return;

      for (var i = 0; i < SDL.audio.numSimultaneouslyQueuedBuffers; ++i) {
        // Only queue new data if we don't have enough audio data already in queue. Otherwise skip this time slot
        // and wait to queue more in the next time the callback is run.
        var secsUntilNextPlayStart =
          SDL.audio.nextPlayTime - SDL.audioContext["currentTime"];
        if (
          secsUntilNextPlayStart >=
          SDL.audio.bufferingDelay +
            SDL.audio.bufferDurationSecs *
              SDL.audio.numSimultaneouslyQueuedBuffers
        )
          return;

        // Ask SDL audio data from the user code.
        getWasmTableEntry(SDL.audio.callback)(
          SDL.audio.userdata,
          SDL.audio.buffer,
          SDL.audio.bufferSize
        );
        // And queue it to be played after the currently playing audio stream.
        SDL.audio.pushAudio(SDL.audio.buffer, SDL.audio.bufferSize);
      }
    };

    // Create a callback function that will be routinely called to ask more audio data from the user application.
    SDL.audio.caller = function SDL_audioCaller() {
      if (!SDL.audio) return;

      --SDL.audio.numAudioTimersPending;

      SDL.audio.queueNewAudioData();

      // Queue this callback function to be called again later to pull more audio data.
      var secsUntilNextPlayStart =
        SDL.audio.nextPlayTime - SDL.audioContext["currentTime"];

      // Queue the next audio frame push to be performed half-way when the previously queued buffer has finished playing.
      var preemptBufferFeedSecs = SDL.audio.bufferDurationSecs / 2.0;

      if (
        SDL.audio.numAudioTimersPending <
        SDL.audio.numSimultaneouslyQueuedBuffers
      ) {
        ++SDL.audio.numAudioTimersPending;
        SDL.audio.timer = safeSetTimeout(
          SDL.audio.caller,
          Math.max(
            0.0,
            1000.0 * (secsUntilNextPlayStart - preemptBufferFeedSecs)
          )
        );

        // If we are risking starving, immediately queue an extra buffer.
        if (
          SDL.audio.numAudioTimersPending <
          SDL.audio.numSimultaneouslyQueuedBuffers
        ) {
          ++SDL.audio.numAudioTimersPending;
          safeSetTimeout(SDL.audio.caller, 1.0);
        }
      }
    };

    SDL.audio.audioOutput = new Audio();

    // Initialize Web Audio API if we haven't done so yet. Note: Only initialize Web Audio context ever once on the web page,
    // since initializing multiple times fails on Chrome saying 'audio resources have been exhausted'.
    SDL.openAudioContext();
    if (!SDL.audioContext) throw "Web Audio API is not available!";
    autoResumeAudioContext(SDL.audioContext);
    SDL.audio.nextPlayTime = 0; // Time in seconds when the next audio block is due to start.

    // The pushAudio function with a new audio buffer whenever there is new audio data to schedule to be played back on the device.
    SDL.audio.pushAudio = function (ptr, sizeBytes) {
      try {
        if (SDL.audio.paused) return;

        var sizeSamples = sizeBytes / SDL.audio.bytesPerSample; // How many samples fit in the callback buffer?
        var sizeSamplesPerChannel = sizeSamples / SDL.audio.channels; // How many samples per a single channel fit in the cb buffer?
        if (sizeSamplesPerChannel != SDL.audio.samples) {
          throw "Received mismatching audio buffer size!";
        }
        // Allocate new sound buffer to be played.
        var source = SDL.audioContext["createBufferSource"]();
        var soundBuffer = SDL.audioContext["createBuffer"](
          SDL.audio.channels,
          sizeSamplesPerChannel,
          SDL.audio.freq
        );
        source["connect"](SDL.audioContext["destination"]);

        SDL.fillWebAudioBufferFromHeap(ptr, sizeSamplesPerChannel, soundBuffer);
        // Workaround https://bugzilla.mozilla.org/show_bug.cgi?id=883675 by setting the buffer only after filling. The order is important here!
        source["buffer"] = soundBuffer;

        // Schedule the generated sample buffer to be played out at the correct time right after the previously scheduled
        // sample buffer has finished.
        var curtime = SDL.audioContext["currentTime"];
        // Don't ever start buffer playbacks earlier from current time than a given constant 'SDL.audio.bufferingDelay', since a browser
        // may not be able to mix that audio clip in immediately, and there may be subsequent jitter that might cause the stream to starve.
        var playtime = Math.max(
          curtime + SDL.audio.bufferingDelay,
          SDL.audio.nextPlayTime
        );
        if (typeof source["start"] != "undefined") {
          source["start"](playtime); // New Web Audio API: sound sources are started with a .start() call.
        } else if (typeof source["noteOn"] != "undefined") {
          source["noteOn"](playtime); // Support old Web Audio API specification which had the .noteOn() API.
        }
        /*
            // Uncomment to debug SDL buffer feed starves.
            if (SDL.audio.curBufferEnd) {
              var thisBufferStart = Math.round(playtime * SDL.audio.freq);
              if (thisBufferStart != SDL.audio.curBufferEnd) out('SDL starved ' + (thisBufferStart - SDL.audio.curBufferEnd) + ' samples!');
            }
            SDL.audio.curBufferEnd = Math.round(playtime * SDL.audio.freq + sizeSamplesPerChannel);
            */

        SDL.audio.nextPlayTime = playtime + SDL.audio.bufferDurationSecs;
      } catch (e) {
        out("Web Audio API error playing back audio: " + e.toString());
      }
    };

    if (obtained) {
      // Report back the initialized audio parameters.
      HEAP32[obtained >> 2] = SDL.audio.freq;
      HEAP16[(obtained + 4) >> 1] = SDL.audio.format;
      HEAP8[(obtained + 6) >> 0] = SDL.audio.channels;
      HEAP8[(obtained + 7) >> 0] = SDL.audio.silence;
      HEAP16[(obtained + 8) >> 1] = SDL.audio.samples;
      HEAPU32[(obtained + 16) >> 2] = SDL.audio.callback;
      HEAPU32[(obtained + 20) >> 2] = SDL.audio.userdata;
    }
    SDL.allocateChannels(32);
  } catch (e) {
    out(
      'Initializing SDL audio threw an exception: "' +
        e.toString() +
        '"! Continuing without audio.'
    );
    SDL.audio = null;
    SDL.allocateChannels(0);
    if (obtained) {
      HEAP32[obtained >> 2] = 0;
      HEAP16[(obtained + 4) >> 1] = 0;
      HEAP8[(obtained + 6) >> 0] = 0;
      HEAP8[(obtained + 7) >> 0] = 0;
      HEAP16[(obtained + 8) >> 1] = 0;
      HEAPU32[(obtained + 16) >> 2] = 0;
      HEAPU32[(obtained + 20) >> 2] = 0;
    }
  }
  if (!SDL.audio) {
    return -1;
  }
  return 0;
}

function _SDL_PauseAudio(pauseOn) {
  if (!SDL.audio) {
    return;
  }
  if (pauseOn) {
    if (SDL.audio.timer !== undefined) {
      clearTimeout(SDL.audio.timer);
      SDL.audio.numAudioTimersPending = 0;
      SDL.audio.timer = undefined;
    }
  } else if (!SDL.audio.timer) {
    // Start the audio playback timer callback loop.
    SDL.audio.numAudioTimersPending = 1;
    SDL.audio.timer = safeSetTimeout(SDL.audio.caller, 1);
  }
  SDL.audio.paused = pauseOn;
}

function _SDL_PollEvent(ptr) {
  return SDL.pollEvent(ptr);
}

function _SDL_AudioQuit() {
  for (var i = 0; i < SDL.numChannels; ++i) {
    var chan = /** @type {{ audio: (HTMLMediaElement|undefined) }} */ (
      SDL.channels[i]
    );
    if (chan.audio) {
      chan.audio.pause();
      chan.audio = undefined;
    }
  }
  var audio = /** @type {HTMLMediaElement} */ (SDL.music.audio);
  if (audio) audio.pause();
  SDL.music.audio = undefined;
}
function _SDL_Quit() {
  _SDL_AudioQuit();
  out("SDL_Quit called (and ignored)");
}

function __webgl_enable_ANGLE_instanced_arrays(ctx) {
  // Extension available in WebGL 1 from Firefox 26 and Google Chrome 30 onwards. Core feature in WebGL 2.
  var ext = ctx.getExtension("ANGLE_instanced_arrays");
  if (ext) {
    ctx["vertexAttribDivisor"] = function (index, divisor) {
      ext["vertexAttribDivisorANGLE"](index, divisor);
    };
    ctx["drawArraysInstanced"] = function (mode, first, count, primcount) {
      ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
    };
    ctx["drawElementsInstanced"] = function (
      mode,
      count,
      type,
      indices,
      primcount
    ) {
      ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
    };
    return 1;
  }
}

function __webgl_enable_OES_vertex_array_object(ctx) {
  // Extension available in WebGL 1 from Firefox 25 and WebKit 536.28/desktop Safari 6.0.3 onwards. Core feature in WebGL 2.
  var ext = ctx.getExtension("OES_vertex_array_object");
  if (ext) {
    ctx["createVertexArray"] = function () {
      return ext["createVertexArrayOES"]();
    };
    ctx["deleteVertexArray"] = function (vao) {
      ext["deleteVertexArrayOES"](vao);
    };
    ctx["bindVertexArray"] = function (vao) {
      ext["bindVertexArrayOES"](vao);
    };
    ctx["isVertexArray"] = function (vao) {
      return ext["isVertexArrayOES"](vao);
    };
    return 1;
  }
}

function __webgl_enable_WEBGL_draw_buffers(ctx) {
  // Extension available in WebGL 1 from Firefox 28 onwards. Core feature in WebGL 2.
  var ext = ctx.getExtension("WEBGL_draw_buffers");
  if (ext) {
    ctx["drawBuffers"] = function (n, bufs) {
      ext["drawBuffersWEBGL"](n, bufs);
    };
    return 1;
  }
}

function __webgl_enable_WEBGL_multi_draw(ctx) {
  // Closure is expected to be allowed to minify the '.multiDrawWebgl' property, so not accessing it quoted.
  return !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));
}
var GL = {
  counter: 1,
  buffers: [],
  programs: [],
  framebuffers: [],
  renderbuffers: [],
  textures: [],
  shaders: [],
  vaos: [],
  contexts: [],
  offscreenCanvases: {},
  queries: [],
  stringCache: {},
  unpackAlignment: 4,
  recordError: function recordError(errorCode) {
    if (!GL.lastError) {
      GL.lastError = errorCode;
    }
  },
  getNewId: function (table) {
    var ret = GL.counter++;
    for (var i = table.length; i < ret; i++) {
      table[i] = null;
    }
    return ret;
  },
  getSource: function (shader, count, string, length) {
    var source = "";
    for (var i = 0; i < count; ++i) {
      var len = length ? HEAP32[(length + i * 4) >> 2] : -1;
      source += UTF8ToString(
        HEAP32[(string + i * 4) >> 2],
        len < 0 ? undefined : len
      );
    }
    return source;
  },
  createContext: function (
    /** @type {HTMLCanvasElement} */ canvas,
    webGLContextAttributes
  ) {
    // BUG: Workaround Safari WebGL issue: After successfully acquiring WebGL context on a canvas,
    // calling .getContext() will always return that context independent of which 'webgl' or 'webgl2'
    // context version was passed. See https://bugs.webkit.org/show_bug.cgi?id=222758 and
    // https://github.com/emscripten-core/emscripten/issues/13295.
    // TODO: Once the bug is fixed and shipped in Safari, adjust the Safari version field in above check.
    if (!canvas.getContextSafariWebGL2Fixed) {
      canvas.getContextSafariWebGL2Fixed = canvas.getContext;
      /** @type {function(this:HTMLCanvasElement, string, (Object|null)=): (Object|null)} */
      function fixedGetContext(ver, attrs) {
        var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
        return (ver == "webgl") == gl instanceof WebGLRenderingContext
          ? gl
          : null;
      }
      canvas.getContext = fixedGetContext;
    }

    var ctx = canvas.getContext("webgl", webGLContextAttributes);
    // https://caniuse.com/#feat=webgl

    if (!ctx) return 0;

    var handle = GL.registerContext(ctx, webGLContextAttributes);

    return handle;
  },
  registerContext: function (ctx, webGLContextAttributes) {
    // without pthreads a context is just an integer ID
    var handle = GL.getNewId(GL.contexts);

    var context = {
      handle: handle,
      attributes: webGLContextAttributes,
      version: webGLContextAttributes.majorVersion,
      GLctx: ctx,
    };

    // Store the created context object so that we can access the context given a canvas without having to pass the parameters again.
    if (ctx.canvas) ctx.canvas.GLctxObject = context;
    GL.contexts[handle] = context;
    if (
      typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" ||
      webGLContextAttributes.enableExtensionsByDefault
    ) {
      GL.initExtensions(context);
    }

    return handle;
  },
  makeContextCurrent: function (contextHandle) {
    GL.currentContext = GL.contexts[contextHandle]; // Active Emscripten GL layer context object.
    Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx; // Active WebGL context object.
    return !(contextHandle && !GLctx);
  },
  getContext: function (contextHandle) {
    return GL.contexts[contextHandle];
  },
  deleteContext: function (contextHandle) {
    if (GL.currentContext === GL.contexts[contextHandle])
      GL.currentContext = null;
    if (typeof JSEvents == "object")
      JSEvents.removeAllHandlersOnTarget(
        GL.contexts[contextHandle].GLctx.canvas
      ); // Release all JS event handlers on the DOM element that the GL context is associated with since the context is now deleted.
    if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas)
      GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined; // Make sure the canvas object no longer refers to the context object so there are no GC surprises.
    GL.contexts[contextHandle] = null;
  },
  initExtensions: function (context) {
    // If this function is called without a specific context object, init the extensions of the currently active context.
    if (!context) context = GL.currentContext;

    if (context.initExtensionsDone) return;
    context.initExtensionsDone = true;

    var GLctx = context.GLctx;

    // Detect the presence of a few extensions manually, this GL interop layer itself will need to know if they exist.

    // Extensions that are only available in WebGL 1 (the calls will be no-ops if called on a WebGL 2 context active)
    __webgl_enable_ANGLE_instanced_arrays(GLctx);
    __webgl_enable_OES_vertex_array_object(GLctx);
    __webgl_enable_WEBGL_draw_buffers(GLctx);

    {
      GLctx.disjointTimerQueryExt = GLctx.getExtension(
        "EXT_disjoint_timer_query"
      );
    }

    __webgl_enable_WEBGL_multi_draw(GLctx);

    // .getSupportedExtensions() can return null if context is lost, so coerce to empty array.
    var exts = GLctx.getSupportedExtensions() || [];
    exts.forEach(function (ext) {
      // WEBGL_lose_context, WEBGL_debug_renderer_info and WEBGL_debug_shaders are not enabled by default.
      if (!ext.includes("lose_context") && !ext.includes("debug")) {
        // Call .getExtension() to enable that extension permanently.
        GLctx.getExtension(ext);
      }
    });
  },
};
function _SDL_SetVideoMode(width, height, depth, flags) {
  [
    "touchstart",
    "touchend",
    "touchmove",
    "mousedown",
    "mouseup",
    "mousemove",
    "DOMMouseScroll",
    "mousewheel",
    "wheel",
    "mouseout",
  ].forEach(function (event) {
    Module["canvas"].addEventListener(event, SDL.receiveEvent, true);
  });

  var canvas = Module["canvas"];

  // (0,0) means 'use fullscreen' in native; in Emscripten, use the current canvas size.
  if (width == 0 && height == 0) {
    width = canvas.width;
    height = canvas.height;
  }

  if (!SDL.addedResizeListener) {
    SDL.addedResizeListener = true;
    Browser.resizeListeners.push(function (w, h) {
      if (!SDL.settingVideoMode) {
        SDL.receiveEvent({
          type: "resize",
          w: w,
          h: h,
        });
      }
    });
  }

  SDL.settingVideoMode = true; // SetVideoMode itself should not trigger resize events
  Browser.setCanvasSize(width, height);
  SDL.settingVideoMode = false;

  // Free the old surface first if there is one
  if (SDL.screen) {
    SDL.freeSurface(SDL.screen);
    assert(!SDL.screen);
  }

  if (SDL.GL) flags = flags | 0x04000000; // SDL_OPENGL - if we are using GL, then later calls to SetVideoMode may not mention GL, but we do need it. Once in GL mode, we never leave it.

  SDL.screen = SDL.makeSurface(width, height, flags, true, "screen");

  return SDL.screen;
}

function _SDL_UnlockAudio() {}

function _SDL_UnlockSurface(surf) {
  assert(!SDL.GL); // in GL mode we do not keep around 2D canvases and contexts

  var surfData = SDL.surfaces[surf];

  if (!surfData.locked || --surfData.locked > 0) {
    return;
  }

  // Copy pixel data to image
  if (surfData.isFlagSet(0x00200000 /* SDL_HWPALETTE */)) {
    SDL.copyIndexedColorData(surfData);
  } else if (!surfData.colors) {
    var data = surfData.image.data;
    var buffer = surfData.buffer;
    assert(buffer % 4 == 0, "Invalid buffer offset: " + buffer);
    var src = buffer >> 2;
    var dst = 0;
    var isScreen = surf == SDL.screen;
    var num;
    if (
      typeof CanvasPixelArray != "undefined" &&
      data instanceof CanvasPixelArray
    ) {
      // IE10/IE11: ImageData objects are backed by the deprecated CanvasPixelArray,
      // not UInt8ClampedArray. These don't have buffers, so we need to revert
      // to copying a byte at a time. We do the undefined check because modern
      // browsers do not define CanvasPixelArray anymore.
      num = data.length;
      while (dst < num) {
        var val = HEAP32[src]; // This is optimized. Instead, we could do HEAP32[(((buffer)+(dst))>>2)];
        data[dst] = val & 0xff;
        data[dst + 1] = (val >> 8) & 0xff;
        data[dst + 2] = (val >> 16) & 0xff;
        data[dst + 3] = isScreen ? 0xff : (val >> 24) & 0xff;
        src++;
        dst += 4;
      }
    } else {
      var data32 = new Uint32Array(data.buffer);
      if (isScreen && SDL.defaults.opaqueFrontBuffer) {
        num = data32.length;
        // logically we need to do
        //      while (dst < num) {
        //          data32[dst++] = HEAP32[src++] | 0xff000000
        //      }
        // the following code is faster though, because
        // .set() is almost free - easily 10x faster due to
        // native memcpy efficiencies, and the remaining loop
        // just stores, not load + store, so it is faster
        data32.set(HEAP32.subarray(src, src + num));
        var data8 = new Uint8Array(data.buffer);
        var i = 3;
        var j = i + 4 * num;
        if (num % 8 == 0) {
          // unrolling gives big speedups
          while (i < j) {
            data8[i] = 0xff;
            i = (i + 4) | 0;
            data8[i] = 0xff;
            i = (i + 4) | 0;
            data8[i] = 0xff;
            i = (i + 4) | 0;
            data8[i] = 0xff;
            i = (i + 4) | 0;
            data8[i] = 0xff;
            i = (i + 4) | 0;
            data8[i] = 0xff;
            i = (i + 4) | 0;
            data8[i] = 0xff;
            i = (i + 4) | 0;
            data8[i] = 0xff;
            i = (i + 4) | 0;
          }
        } else {
          while (i < j) {
            data8[i] = 0xff;
            i = (i + 4) | 0;
          }
        }
      } else {
        data32.set(HEAP32.subarray(src, src + data32.length));
      }
    }
  } else {
    var width = Module["canvas"].width;
    var height = Module["canvas"].height;
    var s = surfData.buffer;
    var data = surfData.image.data;
    var colors = surfData.colors; // TODO: optimize using colors32
    for (var y = 0; y < height; y++) {
      var base = y * width * 4;
      for (var x = 0; x < width; x++) {
        // See comment above about signs
        var val = HEAPU8[s++ >> 0] * 4;
        var start = base + x * 4;
        data[start] = colors[val];
        data[start + 1] = colors[val + 1];
        data[start + 2] = colors[val + 2];
      }
      s += width * 3;
    }
  }
  // Copy to canvas
  surfData.ctx.putImageData(surfData.image, 0, 0);
  // Note that we save the image, so future writes are fast. But, memory is not yet released
}

function ___assert_fail(condition, filename, line, func) {
  abort(
    "Assertion failed: " +
      UTF8ToString(condition) +
      ", at: " +
      [
        filename ? UTF8ToString(filename) : "unknown filename",
        line,
        func ? UTF8ToString(func) : "unknown function",
      ]
  );
}

function setErrNo(value) {
  HEAP32[___errno_location() >> 2] = value;
  return value;
}

var SYSCALLS = {
  DEFAULT_POLLMASK: 5,
  calculateAt: function (dirfd, path, allowEmpty) {
    if (PATH.isAbs(path)) {
      return path;
    }
    // relative path
    var dir;
    if (dirfd === -100) {
      dir = FS.cwd();
    } else {
      var dirstream = FS.getStream(dirfd);
      if (!dirstream) throw new FS.ErrnoError(8);
      dir = dirstream.path;
    }
    if (path.length == 0) {
      if (!allowEmpty) {
        throw new FS.ErrnoError(44);
      }
      return dir;
    }
    return PATH.join2(dir, path);
  },
  doStat: function (func, path, buf) {
    try {
      var stat = func(path);
    } catch (e) {
      if (
        e &&
        e.node &&
        PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))
      ) {
        // an error occurred while trying to look up the path; we should just report ENOTDIR
        return -54;
      }
      throw e;
    }
    HEAP32[buf >> 2] = stat.dev;
    HEAP32[(buf + 4) >> 2] = 0;
    HEAP32[(buf + 8) >> 2] = stat.ino;
    HEAP32[(buf + 12) >> 2] = stat.mode;
    HEAP32[(buf + 16) >> 2] = stat.nlink;
    HEAP32[(buf + 20) >> 2] = stat.uid;
    HEAP32[(buf + 24) >> 2] = stat.gid;
    HEAP32[(buf + 28) >> 2] = stat.rdev;
    HEAP32[(buf + 32) >> 2] = 0;
    (tempI64 = [
      stat.size >>> 0,
      ((tempDouble = stat.size),
      +Math.abs(tempDouble) >= 1.0
        ? tempDouble > 0.0
          ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) |
              0) >>>
            0
          : ~~+Math.ceil(
              (tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0
            ) >>> 0
        : 0),
    ]),
      (HEAP32[(buf + 40) >> 2] = tempI64[0]),
      (HEAP32[(buf + 44) >> 2] = tempI64[1]);
    HEAP32[(buf + 48) >> 2] = 4096;
    HEAP32[(buf + 52) >> 2] = stat.blocks;
    HEAP32[(buf + 56) >> 2] = (stat.atime.getTime() / 1000) | 0;
    HEAP32[(buf + 60) >> 2] = 0;
    HEAP32[(buf + 64) >> 2] = (stat.mtime.getTime() / 1000) | 0;
    HEAP32[(buf + 68) >> 2] = 0;
    HEAP32[(buf + 72) >> 2] = (stat.ctime.getTime() / 1000) | 0;
    HEAP32[(buf + 76) >> 2] = 0;
    (tempI64 = [
      stat.ino >>> 0,
      ((tempDouble = stat.ino),
      +Math.abs(tempDouble) >= 1.0
        ? tempDouble > 0.0
          ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) |
              0) >>>
            0
          : ~~+Math.ceil(
              (tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0
            ) >>> 0
        : 0),
    ]),
      (HEAP32[(buf + 80) >> 2] = tempI64[0]),
      (HEAP32[(buf + 84) >> 2] = tempI64[1]);
    return 0;
  },
  doMsync: function (addr, stream, len, flags, offset) {
    var buffer = HEAPU8.slice(addr, addr + len);
    FS.msync(stream, buffer, offset, len, flags);
  },
  varargs: undefined,
  get: function () {
    SYSCALLS.varargs += 4;
    var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
    return ret;
  },
  getStr: function (ptr) {
    var ret = UTF8ToString(ptr);
    return ret;
  },
  getStreamFromFD: function (fd) {
    var stream = FS.getStream(fd);
    if (!stream) throw new FS.ErrnoError(8);
    return stream;
  },
};
function ___syscall_fcntl64(fd, cmd, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (cmd) {
      case 0: {
        var arg = SYSCALLS.get();
        if (arg < 0) {
          return -28;
        }
        var newStream;
        newStream = FS.createStream(stream, arg);
        return newStream.fd;
      }
      case 1:
      case 2:
        return 0; // FD_CLOEXEC makes no sense for a single process.
      case 3:
        return stream.flags;
      case 4: {
        var arg = SYSCALLS.get();
        stream.flags |= arg;
        return 0;
      }
      case 5: /* case 5: Currently in musl F_GETLK64 has same value as F_GETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */ {
        var arg = SYSCALLS.get();
        var offset = 0;
        // We're always unlocked.
        HEAP16[(arg + offset) >> 1] = 2;
        return 0;
      }
      case 6:
      case 7:
        /* case 6: Currently in musl F_SETLK64 has same value as F_SETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
        /* case 7: Currently in musl F_SETLKW64 has same value as F_SETLKW, so omitted to avoid duplicate case blocks. If that changes, uncomment this */

        return 0; // Pretend that the locking is successful.
      case 16:
      case 8:
        return -28; // These are for sockets. We don't have them fully implemented yet.
      case 9:
        // musl trusts getown return values, due to a bug where they must be, as they overlap with errors. just return -1 here, so fcntl() returns that, and we set errno ourselves.
        setErrNo(28);
        return -1;
      default: {
        return -28;
      }
    }
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}

function convertI32PairToI53Checked(lo, hi) {
  return (hi + 0x200000) >>> 0 < 0x400001 - !!lo
    ? (lo >>> 0) + hi * 4294967296
    : NaN;
}
function ___syscall_ftruncate64(fd, length_low, length_high) {
  try {
    var length = convertI32PairToI53Checked(length_low, length_high);
    if (isNaN(length)) return -61;
    FS.ftruncate(fd, length);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}

function ___syscall_ioctl(fd, op, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (op) {
      case 21509:
      case 21505: {
        if (!stream.tty) return -59;
        return 0;
      }
      case 21510:
      case 21511:
      case 21512:
      case 21506:
      case 21507:
      case 21508: {
        if (!stream.tty) return -59;
        return 0; // no-op, not actually adjusting terminal settings
      }
      case 21519: {
        if (!stream.tty) return -59;
        var argp = SYSCALLS.get();
        HEAP32[argp >> 2] = 0;
        return 0;
      }
      case 21520: {
        if (!stream.tty) return -59;
        return -28; // not supported
      }
      case 21531: {
        var argp = SYSCALLS.get();
        return FS.ioctl(stream, op, argp);
      }
      case 21523: {
        // TODO: in theory we should write to the winsize struct that gets
        // passed in, but for now musl doesn't read anything on it
        if (!stream.tty) return -59;
        return 0;
      }
      case 21524: {
        // TODO: technically, this ioctl call should change the window size.
        // but, since emscripten doesn't have any concept of a terminal window
        // yet, we'll just silently throw it away as we do TIOCGWINSZ
        if (!stream.tty) return -59;
        return 0;
      }
      default:
        abort("bad ioctl syscall " + op);
    }
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}

function ___syscall_openat(dirfd, path, flags, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    var mode = varargs ? SYSCALLS.get() : 0;
    return FS.open(path, flags, mode).fd;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}

function __emscripten_date_now() {
  return Date.now();
}

function __localtime_js(time, tmPtr) {
  var date = new Date(HEAP32[time >> 2] * 1000);
  HEAP32[tmPtr >> 2] = date.getSeconds();
  HEAP32[(tmPtr + 4) >> 2] = date.getMinutes();
  HEAP32[(tmPtr + 8) >> 2] = date.getHours();
  HEAP32[(tmPtr + 12) >> 2] = date.getDate();
  HEAP32[(tmPtr + 16) >> 2] = date.getMonth();
  HEAP32[(tmPtr + 20) >> 2] = date.getFullYear() - 1900;
  HEAP32[(tmPtr + 24) >> 2] = date.getDay();

  var start = new Date(date.getFullYear(), 0, 1);
  var yday = ((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) | 0;
  HEAP32[(tmPtr + 28) >> 2] = yday;
  HEAP32[(tmPtr + 36) >> 2] = -(date.getTimezoneOffset() * 60);

  // Attention: DST is in December in South, and some regions don't have DST at all.
  var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  var winterOffset = start.getTimezoneOffset();
  var dst =
    (summerOffset != winterOffset &&
      date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
  HEAP32[(tmPtr + 32) >> 2] = dst;
}

function _tzset_impl(timezone, daylight, tzname) {
  var currentYear = new Date().getFullYear();
  var winter = new Date(currentYear, 0, 1);
  var summer = new Date(currentYear, 6, 1);
  var winterOffset = winter.getTimezoneOffset();
  var summerOffset = summer.getTimezoneOffset();

  // Local standard timezone offset. Local standard time is not adjusted for daylight savings.
  // This code uses the fact that getTimezoneOffset returns a greater value during Standard Time versus Daylight Saving Time (DST).
  // Thus it determines the expected output during Standard Time, and it compares whether the output of the given date the same (Standard) or less (DST).
  var stdTimezoneOffset = Math.max(winterOffset, summerOffset);

  // timezone is specified as seconds west of UTC ("The external variable
  // `timezone` shall be set to the difference, in seconds, between
  // Coordinated Universal Time (UTC) and local standard time."), the same
  // as returned by stdTimezoneOffset.
  // See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
  HEAP32[timezone >> 2] = stdTimezoneOffset * 60;

  HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);

  function extractZone(date) {
    var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
    return match ? match[1] : "GMT";
  }
  var winterName = extractZone(winter);
  var summerName = extractZone(summer);
  var winterNamePtr = allocateUTF8(winterName);
  var summerNamePtr = allocateUTF8(summerName);
  if (summerOffset < winterOffset) {
    // Northern hemisphere
    HEAPU32[tzname >> 2] = winterNamePtr;
    HEAPU32[(tzname + 4) >> 2] = summerNamePtr;
  } else {
    HEAPU32[tzname >> 2] = summerNamePtr;
    HEAPU32[(tzname + 4) >> 2] = winterNamePtr;
  }
}
function __tzset_js(timezone, daylight, tzname) {
  // TODO: Use (malleable) environment variables instead of system settings.
  if (__tzset_js.called) return;
  __tzset_js.called = true;
  _tzset_impl(timezone, daylight, tzname);
}

function _abort() {
  abort("");
}

var readAsmConstArgsArray = [];
function readAsmConstArgs(sigPtr, buf) {
  readAsmConstArgsArray.length = 0;
  var ch;
  // Most arguments are i32s, so shift the buffer pointer so it is a plain
  // index into HEAP32.
  buf >>= 2;
  while ((ch = HEAPU8[sigPtr++])) {
    // Floats are always passed as doubles, and doubles and int64s take up 8
    // bytes (two 32-bit slots) in memory, align reads to these:
    buf += (ch != 105) /*i*/ & buf;
    readAsmConstArgsArray.push(
      ch == 105 /*i*/ ? HEAP32[buf] : HEAPF64[buf++ >> 1]
    );
    ++buf;
  }
  return readAsmConstArgsArray;
}
function _emscripten_asm_const_int(code, sigPtr, argbuf) {
  var args = readAsmConstArgs(sigPtr, argbuf);
  return ASM_CONSTS[code].apply(null, args);
}

function _emscripten_cancel_main_loop() {
  Browser.mainLoop.pause();
  Browser.mainLoop.func = null;
}

function _emscripten_exit_with_live_runtime() {
  throw "unwind";
}

function _emscripten_memcpy_big(dest, src, num) {
  HEAPU8.copyWithin(dest, src, src + num);
}

function getHeapMax() {
  return HEAPU8.length;
}

function abortOnCannotGrowMemory(requestedSize) {
  abort("OOM");
}
function _emscripten_resize_heap(requestedSize) {
  var oldSize = HEAPU8.length;
  requestedSize = requestedSize >>> 0;
  abortOnCannotGrowMemory(requestedSize);
}

function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop) {
  var browserIterationFunc = getWasmTableEntry(func);
  setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop);
}

var ENV = {};

function getExecutableName() {
  return thisProgram || "./this.program";
}
function getEnvStrings() {
  if (!getEnvStrings.strings) {
    // Default values.
    // Browser language detection #8751
    var lang =
      (
        (typeof navigator == "object" &&
          navigator.languages &&
          navigator.languages[0]) ||
        "C"
      ).replace("-", "_") + ".UTF-8";
    var env = {
      USER: "web_user",
      LOGNAME: "web_user",
      PATH: "/",
      PWD: "/",
      HOME: "/home/web_user",
      LANG: lang,
      _: getExecutableName(),
    };
    // Apply the user-provided values, if any.
    for (var x in ENV) {
      // x is a key in ENV; if ENV[x] is undefined, that means it was
      // explicitly set to be so. We allow user code to do that to
      // force variables with default values to remain unset.
      if (ENV[x] === undefined) delete env[x];
      else env[x] = ENV[x];
    }
    var strings = [];
    for (var x in env) {
      strings.push(x + "=" + env[x]);
    }
    getEnvStrings.strings = strings;
  }
  return getEnvStrings.strings;
}
function _environ_get(__environ, environ_buf) {
  var bufSize = 0;
  getEnvStrings().forEach(function (string, i) {
    var ptr = environ_buf + bufSize;
    HEAPU32[(__environ + i * 4) >> 2] = ptr;
    writeAsciiToMemory(string, ptr);
    bufSize += string.length + 1;
  });
  return 0;
}

function _environ_sizes_get(penviron_count, penviron_buf_size) {
  var strings = getEnvStrings();
  HEAPU32[penviron_count >> 2] = strings.length;
  var bufSize = 0;
  strings.forEach(function (string) {
    bufSize += string.length + 1;
  });
  HEAPU32[penviron_buf_size >> 2] = bufSize;
  return 0;
}

function _fd_close(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.close(stream);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}

/** @param {number=} offset */
function doReadv(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = HEAPU32[iov >> 2];
    var len = HEAPU32[(iov + 4) >> 2];
    iov += 8;
    var curr = FS.read(stream, HEAP8, ptr, len, offset);
    if (curr < 0) return -1;
    ret += curr;
    if (curr < len) break; // nothing more to read
  }
  return ret;
}
function _fd_read(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = doReadv(stream, iov, iovcnt);
    HEAP32[pnum >> 2] = num;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}

function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  try {
    var offset = convertI32PairToI53Checked(offset_low, offset_high);
    if (isNaN(offset)) return 61;
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.llseek(stream, offset, whence);
    (tempI64 = [
      stream.position >>> 0,
      ((tempDouble = stream.position),
      +Math.abs(tempDouble) >= 1.0
        ? tempDouble > 0.0
          ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) |
              0) >>>
            0
          : ~~+Math.ceil(
              (tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0
            ) >>> 0
        : 0),
    ]),
      (HEAP32[newOffset >> 2] = tempI64[0]),
      (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}

/** @param {number=} offset */
function doWritev(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = HEAPU32[iov >> 2];
    var len = HEAPU32[(iov + 4) >> 2];
    iov += 8;
    var curr = FS.write(stream, HEAP8, ptr, len, offset);
    if (curr < 0) return -1;
    ret += curr;
  }
  return ret;
}
function _fd_write(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = doWritev(stream, iov, iovcnt);
    HEAPU32[pnum >> 2] = num;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}

function _setTempRet0(val) {
  setTempRet0(val);
}

var FSNode = /** @constructor */ function (parent, name, mode, rdev) {
  if (!parent) {
    parent = this; // root node sets parent to itself
  }
  this.parent = parent;
  this.mount = parent.mount;
  this.mounted = null;
  this.id = FS.nextInode++;
  this.name = name;
  this.mode = mode;
  this.node_ops = {};
  this.stream_ops = {};
  this.rdev = rdev;
};
var readMode = 292 /*292*/ | 73; /*73*/
var writeMode = 146; /*146*/
Object.defineProperties(FSNode.prototype, {
  read: {
    get: /** @this{FSNode} */ function () {
      return (this.mode & readMode) === readMode;
    },
    set: /** @this{FSNode} */ function (val) {
      val ? (this.mode |= readMode) : (this.mode &= ~readMode);
    },
  },
  write: {
    get: /** @this{FSNode} */ function () {
      return (this.mode & writeMode) === writeMode;
    },
    set: /** @this{FSNode} */ function (val) {
      val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
    },
  },
  isFolder: {
    get: /** @this{FSNode} */ function () {
      return FS.isDir(this.mode);
    },
  },
  isDevice: {
    get: /** @this{FSNode} */ function () {
      return FS.isChrdev(this.mode);
    },
  },
});
FS.FSNode = FSNode;
FS.staticInit();
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_unlink"] = FS.unlink;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createDevice"] = FS.createDevice;
Module["requestFullscreen"] = function Module_requestFullscreen(
  lockPointer,
  resizeCanvas
) {
  Browser.requestFullscreen(lockPointer, resizeCanvas);
};
Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
  Browser.requestAnimationFrame(func);
};
Module["setCanvasSize"] = function Module_setCanvasSize(
  width,
  height,
  noUpdates
) {
  Browser.setCanvasSize(width, height, noUpdates);
};
Module["pauseMainLoop"] = function Module_pauseMainLoop() {
  Browser.mainLoop.pause();
};
Module["resumeMainLoop"] = function Module_resumeMainLoop() {
  Browser.mainLoop.resume();
};
Module["getUserMedia"] = function Module_getUserMedia() {
  Browser.getUserMedia();
};
Module["createContext"] = function Module_createContext(
  canvas,
  useWebGL,
  setInModule,
  webGLContextAttributes
) {
  return Browser.createContext(
    canvas,
    useWebGL,
    setInModule,
    webGLContextAttributes
  );
};
var preloadedImages = {};
var preloadedAudios = {};
var GLctx;
var ASSERTIONS = false;

/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xff) {
      if (ASSERTIONS) {
        assert(
          false,
          "Character code " +
            chr +
            " (" +
            String.fromCharCode(chr) +
            ")  at offset " +
            i +
            " not in 0x00-0xFF."
        );
      }
      chr &= 0xff;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join("");
}

// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 =
  typeof atob == "function"
    ? atob
    : function (input) {
        var keyStr =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        do {
          enc1 = keyStr.indexOf(input.charAt(i++));
          enc2 = keyStr.indexOf(input.charAt(i++));
          enc3 = keyStr.indexOf(input.charAt(i++));
          enc4 = keyStr.indexOf(input.charAt(i++));

          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;

          output = output + String.fromCharCode(chr1);

          if (enc3 !== 64) {
            output = output + String.fromCharCode(chr2);
          }
          if (enc4 !== 64) {
            output = output + String.fromCharCode(chr3);
          }
        } while (i < input.length);
        return output;
      };

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE == "boolean" && ENVIRONMENT_IS_NODE) {
    var buf = Buffer.from(s, "base64");
    return new Uint8Array(buf["buffer"], buf["byteOffset"], buf["byteLength"]);
  }

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0; i < decoded.length; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error("Converting base64 string to bytes failed.");
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}

var asmLibraryArg = {
  SDL_Flip: _SDL_Flip,
  SDL_GetError: _SDL_GetError,
  SDL_Init: _SDL_Init,
  SDL_InitSubSystem: _SDL_InitSubSystem,
  SDL_LockAudio: _SDL_LockAudio,
  SDL_LockSurface: _SDL_LockSurface,
  SDL_OpenAudio: _SDL_OpenAudio,
  SDL_PauseAudio: _SDL_PauseAudio,
  SDL_PollEvent: _SDL_PollEvent,
  SDL_Quit: _SDL_Quit,
  SDL_SetVideoMode: _SDL_SetVideoMode,
  SDL_UnlockAudio: _SDL_UnlockAudio,
  SDL_UnlockSurface: _SDL_UnlockSurface,
  __assert_fail: ___assert_fail,
  __syscall_fcntl64: ___syscall_fcntl64,
  __syscall_ftruncate64: ___syscall_ftruncate64,
  __syscall_ioctl: ___syscall_ioctl,
  __syscall_openat: ___syscall_openat,
  _emscripten_date_now: __emscripten_date_now,
  _localtime_js: __localtime_js,
  _tzset_js: __tzset_js,
  abort: _abort,
  emscripten_asm_const_int: _emscripten_asm_const_int,
  emscripten_cancel_main_loop: _emscripten_cancel_main_loop,
  emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime,
  emscripten_memcpy_big: _emscripten_memcpy_big,
  emscripten_resize_heap: _emscripten_resize_heap,
  emscripten_set_main_loop: _emscripten_set_main_loop,
  environ_get: _environ_get,
  environ_sizes_get: _environ_sizes_get,
  exit: _exit,
  fd_close: _fd_close,
  fd_read: _fd_read,
  fd_seek: _fd_seek,
  fd_write: _fd_write,
  setTempRet0: _setTempRet0,
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = (Module["___wasm_call_ctors"] = function () {
  return (___wasm_call_ctors = Module["___wasm_call_ctors"] =
    Module["asm"]["__wasm_call_ctors"]).apply(null, arguments);
});

/** @type {function(...*):?} */
var _memcpy = (Module["_memcpy"] = function () {
  return (_memcpy = Module["_memcpy"] = Module["asm"]["memcpy"]).apply(
    null,
    arguments
  );
});

/** @type {function(...*):?} */
var _malloc = (Module["_malloc"] = function () {
  return (_malloc = Module["_malloc"] = Module["asm"]["malloc"]).apply(
    null,
    arguments
  );
});

/** @type {function(...*):?} */
var _free = (Module["_free"] = function () {
  return (_free = Module["_free"] = Module["asm"]["free"]).apply(
    null,
    arguments
  );
});

/** @type {function(...*):?} */
var _S9xReportButton = (Module["_S9xReportButton"] = function () {
  return (_S9xReportButton = Module["_S9xReportButton"] =
    Module["asm"]["S9xReportButton"]).apply(null, arguments);
});

/** @type {function(...*):?} */
var _S9xAutoSaveSRAM = (Module["_S9xAutoSaveSRAM"] = function () {
  return (_S9xAutoSaveSRAM = Module["_S9xAutoSaveSRAM"] =
    Module["asm"]["S9xAutoSaveSRAM"]).apply(null, arguments);
});

/** @type {function(...*):?} */
var ___errno_location = (Module["___errno_location"] = function () {
  return (___errno_location = Module["___errno_location"] =
    Module["asm"]["__errno_location"]).apply(null, arguments);
});

/** @type {function(...*):?} */
var _S9xFreezeGame = (Module["_S9xFreezeGame"] = function () {
  return (_S9xFreezeGame = Module["_S9xFreezeGame"] =
    Module["asm"]["S9xFreezeGame"]).apply(null, arguments);
});

/** @type {function(...*):?} */
var _S9xUnfreezeGame = (Module["_S9xUnfreezeGame"] = function () {
  return (_S9xUnfreezeGame = Module["_S9xUnfreezeGame"] =
    Module["asm"]["S9xUnfreezeGame"]).apply(null, arguments);
});

/** @type {function(...*):?} */
var _set_frameskip = (Module["_set_frameskip"] = function () {
  return (_set_frameskip = Module["_set_frameskip"] =
    Module["asm"]["set_frameskip"]).apply(null, arguments);
});

/** @type {function(...*):?} */
var _toggle_display_framerate = (Module["_toggle_display_framerate"] =
  function () {
    return (_toggle_display_framerate = Module["_toggle_display_framerate"] =
      Module["asm"]["toggle_display_framerate"]).apply(null, arguments);
  });

/** @type {function(...*):?} */
var _S9xInitInputDevices = (Module["_S9xInitInputDevices"] = function () {
  return (_S9xInitInputDevices = Module["_S9xInitInputDevices"] =
    Module["asm"]["S9xInitInputDevices"]).apply(null, arguments);
});

/** @type {function(...*):?} */
var _set_transparency = (Module["_set_transparency"] = function () {
  return (_set_transparency = Module["_set_transparency"] =
    Module["asm"]["set_transparency"]).apply(null, arguments);
});

/** @type {function(...*):?} */
var _cancel = (Module["_cancel"] = function () {
  return (_cancel = Module["_cancel"] = Module["asm"]["cancel"]).apply(
    null,
    arguments
  );
});

/** @type {function(...*):?} */
var _run = (Module["_run"] = function () {
  return (_run = Module["_run"] = Module["asm"]["run"]).apply(null, arguments);
});

/** @type {function(...*):?} */
var _main = (Module["_main"] = function () {
  return (_main = Module["_main"] = Module["asm"]["main"]).apply(
    null,
    arguments
  );
});

/** @type {function(...*):?} */
var stackSave = (Module["stackSave"] = function () {
  return (stackSave = Module["stackSave"] = Module["asm"]["stackSave"]).apply(
    null,
    arguments
  );
});

/** @type {function(...*):?} */
var stackRestore = (Module["stackRestore"] = function () {
  return (stackRestore = Module["stackRestore"] =
    Module["asm"]["stackRestore"]).apply(null, arguments);
});

/** @type {function(...*):?} */
var stackAlloc = (Module["stackAlloc"] = function () {
  return (stackAlloc = Module["stackAlloc"] =
    Module["asm"]["stackAlloc"]).apply(null, arguments);
});

/** @type {function(...*):?} */
var dynCall_jiji = (Module["dynCall_jiji"] = function () {
  return (dynCall_jiji = Module["dynCall_jiji"] =
    Module["asm"]["dynCall_jiji"]).apply(null, arguments);
});

// === Auto-generated postamble setup entry stuff ===

Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
Module["addRunDependency"] = addRunDependency;
Module["removeRunDependency"] = removeRunDependency;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createDevice"] = FS.createDevice;
Module["FS_unlink"] = FS.unlink;

var calledRun;

/**
 * @constructor
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}

var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function callMain(args) {
  var entryFunction = Module["_main"];

  args = args || [];
  args.unshift(thisProgram);

  var argc = args.length;
  var argv = stackAlloc((argc + 1) * 4);
  var argv_ptr = argv >> 2;
  args.forEach((arg) => {
    HEAP32[argv_ptr++] = allocateUTF8OnStack(arg);
  });
  HEAP32[argv_ptr] = 0;

  try {
    var ret = entryFunction(argc, argv);

    // In PROXY_TO_PTHREAD builds, we should never exit the runtime below, as
    // execution is asynchronously handed off to a pthread.
    // if we're not running an evented main loop, it's time to exit
    exit(ret, /* implicit = */ true);
    return ret;
  } catch (e) {
    return handleException(e);
  } finally {
    calledMain = true;
  }
}

/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module["calledRun"] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();

    if (shouldRunNow) callMain(args);

    postRun();
  }

  if (Module["setStatus"]) {
    Module["setStatus"]("Running...");
    setTimeout(function () {
      setTimeout(function () {
        Module["setStatus"]("");
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module["run"] = run;

/** @param {boolean|number=} implicit */
function exit(status, implicit) {
  EXITSTATUS = status;

  procExit(status);
}

function procExit(code) {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    if (Module["onExit"]) Module["onExit"](code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
}

if (Module["preInit"]) {
  if (typeof Module["preInit"] == "function")
    Module["preInit"] = [Module["preInit"]];
  while (Module["preInit"].length > 0) {
    Module["preInit"].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;

if (Module["noInitialRun"]) shouldRunNow = false;

run();
