// Store the original fetch function
const originalFetch = globalThis.fetch;

// Custom fetch function to intercept and modify requests
globalThis.fetch = async function(input: string | URL | globalThis.Request, init?: RequestInit) {
  init = init || {};
  init.headers = {
    ...init.headers, // Keep the original headers
    "X-ARTEMIS-CSRF": "Dennis ist schuld",
  };

  // Call the original fetch with the modified init object
  return originalFetch(input, init);
};