/**
 * Lua script for acquiring a distributed lock.
 *
 * Atomically checks that none of the provided keys exist, then sets each key
 * with the lock value and TTL. Returns 0 if any key already exists (lock held),
 * otherwise returns the number of keys locked.
 *
 * KEYS: resource keys to lock
 * ARGV[1]: unique lock value
 * ARGV[2]: TTL in milliseconds
 */
export const ACQUIRE_SCRIPT = `
  -- Return 0 if an entry already exists.
  for i, key in ipairs(KEYS) do
    if redis.call("exists", key) == 1 then
      return 0
    end
  end

  -- Create an entry for each provided key.
  for i, key in ipairs(KEYS) do
    redis.call("set", key, ARGV[1], "PX", ARGV[2])
  end

  -- Return the number of entries added.
  return #KEYS
`;

/**
 * Lua script for extending an existing lock's TTL.
 *
 * Verifies that all keys hold the expected lock value, then updates the TTL.
 * Returns 0 if any key holds a different value (someone else's lock).
 *
 * KEYS: resource keys to extend
 * ARGV[1]: expected lock value
 * ARGV[2]: new TTL in milliseconds
 */
export const EXTEND_SCRIPT = `
  -- Return 0 if an entry exists with a *different* lock value.
  for i, key in ipairs(KEYS) do
    if redis.call("get", key) ~= ARGV[1] then
      return 0
    end
  end

  -- Update the entry for each provided key.
  for i, key in ipairs(KEYS) do
    redis.call("set", key, ARGV[1], "PX", ARGV[2])
  end

  -- Return the number of entries updated.
  return #KEYS
`;

/**
 * Lua script for releasing a distributed lock.
 *
 * Only deletes keys that hold the expected lock value (prevents releasing
 * another client's lock). Returns the number of keys actually released.
 *
 * KEYS: resource keys to release
 * ARGV[1]: expected lock value
 */
export const RELEASE_SCRIPT = `
  local count = 0
  for i, key in ipairs(KEYS) do
    -- Only remove entries for *this* lock value.
    if redis.call("get", key) == ARGV[1] then
      redis.pcall("del", key)
      count = count + 1
    end
  end

  -- Return the number of entries removed.
  return count
`;
