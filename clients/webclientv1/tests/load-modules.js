// tests/js/load-modules.js
const fs = require('fs');
const path = require('path');

// Read scripts.json
const scriptsConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd() + '/webclientv1/src/config/scripts.json'), 'utf8')
);

// Create a mapping of file paths to module names
const moduleMap = {};
const filePathMap = {}; // Maps file paths to their actual exports
scriptsConfig.scripts.forEach((scriptPath) => {
  const fileName = path.basename(scriptPath, '.js');
  const moduleName = fileName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  moduleMap[moduleName] = scriptPath;
  filePathMap[scriptPath] = moduleName;
});

/**
 * Extract class names from file content using regex (no execution)
 * @param {string} fileContent - The file content to search
 * @returns {string[]} Array of class names found
 */
function extractClassNamesFromContent(fileContent) {
  const classNames = new Set();
  
  // Match: export class ClassName
  const exportClassRegex = /export\s+(?:default\s+)?class\s+(\w+)/g;
  let match;
  while ((match = exportClassRegex.exec(fileContent)) !== null) {
    classNames.add(match[1]);
  }
  
  // Match: module.exports = class ClassName or module.exports.ClassName
  const moduleExportsRegex = /module\.exports(?:\.\w+)?\s*=\s*(?:class\s+)?(\w+)/g;
  while ((match = moduleExportsRegex.exec(fileContent)) !== null) {
    classNames.add(match[1]);
  }
  
  // Match: export default ClassName (when it's a class instantiation or reference)
  const exportDefaultRegex = /export\s+default\s+(\w+)/;
  match = exportDefaultRegex.exec(fileContent);
  if (match) {
    classNames.add(match[1]);
  }
  
  // Match: const ClassName = class { ... } or function ClassName() { ... }
  const constClassRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:class|function)/g;
  while ((match = constClassRegex.exec(fileContent)) !== null) {
    classNames.add(match[1]);
  }
  
  return Array.from(classNames);
}

/**
 * Search for a class name across all files (without executing them)
 * @param {string} className - The class name to search for
 * @returns {string|null} The script path if found, null otherwise
 */
function findClassInFiles(className) {
  for (const scriptPath of scriptsConfig.scripts) {
    const fullPath = path.join(process.cwd() + '/webclientv1/src', scriptPath);
    
    try {
      // Read file content without executing it
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      
      // Extract class names using regex
      const classNames = extractClassNamesFromContent(fileContent);
      
      // Check if our target class is in the file
      if (classNames.includes(className)) {
        return scriptPath;
      }
    } catch (error) {
      // Only log if it's a real file system error, not a parsing error
      if (error.code === 'ENOENT') {
        console.warn(`Warning: File not found: ${scriptPath}`);
      }
      // Silently skip parsing errors - the file might not be a class file
    }
  }
  
  return null;
}

/**
 * Load modules from scripts.json
 * @param {string|string[]|undefined} moduleNames - Module name(s) to load, or undefined to load all
 * @returns {object} Object containing requested modules
 * 
 * Examples:
 *   loadModules()                    // Load all modules
 *   loadModules('ApiClient')         // Load single module
 *   loadModules(['ApiClient', 'AuthService']) // Load multiple modules
 */
function loadModules(moduleNames = undefined) {
  const modules = {};
  
  // If no specific modules requested, load all
  if (moduleNames === undefined) {
    Object.keys(moduleMap).forEach((moduleName) => {
      modules[moduleName] = loadSingleModule(moduleName);
    });
    return modules;
  }
  
  // Convert single string to array
  const namesToLoad = Array.isArray(moduleNames) ? moduleNames : [moduleNames];
  
  // Load requested modules
  namesToLoad.forEach((moduleName) => {
    modules[moduleName] = loadSingleModuleWithFallback(moduleName);
  });
  
  return modules;
}

/**
 * Load a single module by name with fallback search
 * @param {string} moduleName - The module name or class name
 * @returns {any} The loaded module
 * @throws {Error} If module cannot be found
 */
function loadSingleModuleWithFallback(moduleName) {
  // First, try to find exact match in moduleMap
  if (moduleMap[moduleName]) {
    return loadSingleModule(moduleName);
  }
  
  // Fallback: search for class name in all files (using static analysis)
  const foundScriptPath = findClassInFiles(moduleName);
  
  if (foundScriptPath) {
    const fullPath = path.join(process.cwd() + '/webclientv1/src', foundScriptPath);
    
    // Clear from require cache to ensure fresh load
    delete require.cache[require.resolve(fullPath)];
    
    return require(fullPath);
  }
  
  // Not found anywhere
  throw new Error(
    `Module or class "${moduleName}" not found in scripts.json or in any script files. ` +
    `Available modules: ${Object.keys(moduleMap).join(', ')}`
  );
}

/**
 * Load a single module by name (exact match only)
 * @param {string} moduleName - The module name
 * @returns {any} The loaded module
 */
function loadSingleModule(moduleName) {
  const scriptPath = moduleMap[moduleName];
  const fullPath = path.join(process.cwd() + '/webclientv1/src', scriptPath);
  
  // Clear from require cache to ensure fresh load
  delete require.cache[require.resolve(fullPath)];
  
  return require(fullPath);
}

/**
 * Get available module names (useful for debugging)
 * @returns {string[]} Array of available module names
 */
function getAvailableModules() {
  return Object.keys(moduleMap);
}

module.exports = loadModules;
module.exports.loadModules = loadModules;
module.exports.getAvailableModules = getAvailableModules;
