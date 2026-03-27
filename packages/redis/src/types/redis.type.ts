import type { Cluster, ClusterNode, ClusterOptions, Redis } from "ioredis";

/**
 * Union type representing either a standalone Redis or a Cluster client instance from `ioredis`.
 */
export type RedisClient = Redis | Cluster;

/**
 * TLS/SSL configuration for encrypted Redis connections.
 */
export type RedisTlsConfig = {
  tls?: {
    /** Certificate authority bundle for verifying the server. */
    ca?: string | Buffer | Array<string | Buffer>;
    /** Client certificate for mutual TLS. */
    cert?: string | Buffer;
    /** Client private key for mutual TLS. */
    key?: string | Buffer;
    /** Whether to reject connections with unverifiable certificates. */
    rejectUnauthorized?: boolean;
    /** Expected server hostname for TLS SNI. */
    servername?: string;
  };
};

/**
 * Configuration for a standalone (single-node) Redis connection.
 */
export type RedisStandaloneConfig = RedisTlsConfig & {
  mode: "standalone";
  /** Redis server hostname. */
  host: string;
  /** Redis server port. */
  port: number;
  /** Redis database index. */
  db?: string;
  /** Redis ACL username. */
  username?: string;
  /** Redis password. */
  password?: string;
};

/**
 * Configuration for a Redis Cluster connection.
 */
export type RedisClusterConfig = RedisTlsConfig & {
  mode: "cluster";
  /** Array of cluster seed nodes used for initial discovery. */
  nodes: ClusterNode[];
  /** Additional cluster-specific options passed to `ioredis`. */
  options?: ClusterOptions;
};

/**
 * Discriminated union of all supported Redis connection configurations.
 *
 * Use `mode: "standalone"` or `mode: "cluster"` to select the variant.
 */
export type RedisConfig = RedisStandaloneConfig | RedisClusterConfig;
