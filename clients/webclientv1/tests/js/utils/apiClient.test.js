// Test file for: ../../src/js/services/apiClient.js
//import ApiClient from 'src/js/utils/apiClient.js';
console.log('Current directory:', process.cwd());
//const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
//const ApiClient = require(process.cwd() + '/webclientv1/src/js/utils/apiClient.js');
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { ApiClient } = loadModules('ApiClient');

//const modules = loadModules();
//const { ApiClient, AuthService, Router } = modules;

describe('apiClient', () => {
  let apiClient;

  beforeEach(() => {
    apiClient = new ApiClient({ proxyURL: './proxy.php', timeout: 5000 });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should be defined', () => {
    expect(apiClient).toBeDefined();
  });

  test('should make a GET request successfully', async () => {
    const mockResponse = { success: true, data: 'test' };
    global.fetch.mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await apiClient.get('/api/users');

    expect(global.fetch).toHaveBeenCalledWith(
      './proxy.php?path=%2Fapi%2Fusers',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual(mockResponse);
  });

  // Add these to app.test.js or header.test.js to create failures

  // Test 1: Simple assertion failure
  test('should fail intentionally - null check', () => {
    expect(apiClient).toBeNull();
  });

  // Test 2: Equality failure
  test('should fail intentionally - wrong value', () => {
    expect(1 + 1).toBe(3);
  });

  // Test 3: String mismatch
  test('should fail intentionally - string mismatch', () => {
    expect('hello').toBe('world');
  });

  // Test 4: Array length failure
  test('should fail intentionally - array length', () => {
    expect([1, 2, 3]).toHaveLength(5);
  });

  // Test 5: Object property failure
  test('should fail intentionally - missing property', () => {
    expect({ name: 'John' }).toHaveProperty('age');
  });

//  test('should fail intentionally', () => {
//    expect(apiClient).toBeNull();
//  });
});
