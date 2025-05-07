'use strict';

exports.memoize = (fn) => {
  const ttl = 5 * 60 * 1000;
  const cache = new Map();

  const deleteFromCache = (...args) => {
    const key = args.map((arg) => String(arg)).join('|');
    cache.delete(key);
  };

  const memoized = async (...args) => {
    const now = Date.now();
    const key = args.map((arg) => String(arg)).join('|');
    const cached = cache.get(key);
    if (cached && cached.timestamp > now) {
      console.log('Hello from cache');
      console.log(cache);
      return cached.value;
    }

    const val = await fn(...args);
    cache.set(key, {
      value: val,
      timestamp: now + ttl,
    });
    for (const [key, { timestamp }] of cache) {
      if (timestamp < now) {
        cache.delete(key);
      }
    }
    return val;
  };
  memoized.deleteFromCache = deleteFromCache;
  return memoized;
};
