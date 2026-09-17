/**
 * Storage keys and schema version.
 *
 * Two keys, deliberately:
 *  - KEY_DURABLE holds study progress. Written seconds apart.
 *  - KEY_ATTEMPT holds the single in-flight exam attempt. Written ~200x per
 *    exam, worthless once submitted, and must be independently discardable.
 *
 * Separate keys mean a corrupt in-flight attempt cannot take 38 lessons of
 * study progress down with it.
 *
 * The schema version lives INSIDE the durable blob, not in the key name: a
 * versioned key would force us to enumerate old keys on every migration and
 * would orphan data the moment we missed one.
 */
export const KEY_DURABLE = "ccarp:v1";
export const KEY_ATTEMPT = "ccarp:exam:v1";

export const CURRENT_SCHEMA_VERSION = 1;
