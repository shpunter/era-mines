import { BehaviorSubject, Subject } from "rxjs";

// Shared communication bus between the host app and the federated `mines`
// remote. Host and remote each bundle their own copy of this module, so the
// Subjects are pinned on `globalThis` (both run in the same window) to guarantee
// a single shared instance — there is only ever one bus. `rxjs` is also shared
// as a singleton in vite.config.ts so operators work across the boundary.
//
// To use it from the remote: copy this file into the remote and import from it.
// Keep this module framework-agnostic (no React/DOM imports) so any remote,
// regardless of framework, can import and use it.

const initialState: MinesState = {
  down: { historyIDX: 0 },
  up: { history: [] },
};

const g = globalThis as BusGlobal;

if (!g.__minesEvents$) g.__minesEvents$ = new Subject<MinesEvent>();
if (!g.__minesState$) {
  g.__minesState$ = new BehaviorSubject<MinesState>(initialState);
}

/** Event stream — use for transient signals (clicks, intents, notifications). */
export const events$: Subject<MinesEvent> = g.__minesEvents$;

/** State stream — use for current values that new subscribers should replay. */
export const state$: BehaviorSubject<MinesState> = g.__minesState$;

/** Publish an event onto the bus. */
export const emit = (event: MinesEvent): void => events$.next(event);

/**
 * Push state DOWN: host → remote. Merges into the `down` slice, leaving
 * `up` and any untouched `down` fields intact.
 */
export const patchDown = (patch: Partial<MinesState["down"]>): void => {
  const prev = state$.getValue();
  state$.next({ ...prev, down: { ...prev.down, ...patch } });
};

/**
 * Push state UP: remote → host. Merges into the `up` slice, leaving
 * `down` and any untouched `up` fields intact.
 */
export const patchUp = (patch: Partial<MinesState["up"]>): void => {
  const prev = state$.getValue();
  state$.next({ ...prev, up: { ...prev.up, ...patch } });
};

/** Fire-and-forget events. Extend this union as the contract grows. */
export type MinesEvent =
  | { type: "mines:reset-all" }
  | { type: "mines:ready" }
  | { type: "mines:add"; payload: { mine: Mine; historyIDX: number } };

/** Shared, replayable state. Late subscribers immediately get the latest value. */
export type MinesState = {
  down: {
    historyIDX: number;
  };
  up: {
    /** Mines placed per timeline day (index = historyIDX). */
    history: Mine[][];
  };
};

export type Mine = "ore" | "wood" | "crystals" | "gem" | "mercury" | "gold";

// Pin the streams on globalThis so host and remote share one instance even
// though each bundles its own copy of this module.
type BusGlobal = typeof globalThis & {
  __minesEvents$?: Subject<MinesEvent>;
  __minesState$?: BehaviorSubject<MinesState>;
};
