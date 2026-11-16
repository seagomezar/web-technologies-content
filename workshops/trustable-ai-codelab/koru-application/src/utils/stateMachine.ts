import { useEffect, useState, useSyncExternalStore } from 'react';

// ── Public Snapshot & Registry Types (AX + DevTools) ────────

export interface KoruMachineSnapshot<
  S extends string = string,
  E extends string = string,
  ContextSnapshot = unknown,
> {
  readonly id: string;
  readonly state: S;
  readonly allowedEvents: readonly E[];
  readonly context: ContextSnapshot;
}

export interface InspectableMachine<
  S extends string = string,
  E extends string = string,
  ContextSnapshot = unknown,
> {
  readonly id: string;
  getSnapshot: () => KoruMachineSnapshot<S, E, ContextSnapshot>;
}

export interface KoruMachineRegistry {
  readonly getSnapshots: () => readonly KoruMachineSnapshot[];
  readonly getSnapshot: (id: string) => KoruMachineSnapshot | undefined;
  readonly ids: () => readonly string[];
  readonly snapshots: readonly KoruMachineSnapshot[];
}

declare global {
  interface Window {
    __KORU_MACHINES__?: KoruMachineRegistry;
  }
}

// ── Declarative Transition Table Types (DX) ─────────────────

export interface TransitionStep<
  S extends string,
  C,
  Payload,
> {
  readonly target: S | ((context: Readonly<C>, payload: Payload) => S);
  readonly enabled?: (context: Readonly<C>) => boolean;
  readonly guard?: (context: Readonly<C>, payload: Payload) => boolean;
  readonly assign?: (context: Readonly<C>, payload: Payload) => C;
}

export type TransitionDefinition<
  S extends string,
  C,
  Payload,
> = S | TransitionStep<S, C, Payload> | readonly TransitionStep<S, C, Payload>[];

export interface StateNodeConfig<
  S extends string,
  C,
  Events extends Record<string, unknown>,
> {
  readonly on?: {
    readonly [K in keyof Events & string]?: TransitionDefinition<S, C, Events[K]>;
  };
}

export interface TransitionInfo<
  S extends string,
  C,
  E extends string,
> {
  readonly id: string;
  readonly from: S;
  readonly to: S;
  readonly event: E;
  readonly context: Readonly<C>;
}

export interface MachineConfig<
  S extends string,
  C,
  Events extends Record<string, unknown>,
> {
  readonly id: string;
  readonly initial: S;
  readonly context: C;
  readonly states: {
    readonly [State in S]: StateNodeConfig<S, C, Events>;
  };
  readonly onTransition?: (info: TransitionInfo<S, C, keyof Events & string>) => void;
}

export type MachineSend<Events extends Record<string, unknown>> = <
  K extends keyof Events & string,
>(
  ...args: undefined extends Events[K]
    ? [event: K, payload?: Events[K]]
    : [event: K, payload: Events[K]]
) => boolean;

export interface StateMachine<
  S extends string,
  C,
  Events extends Record<string, unknown>,
> extends InspectableMachine<S, keyof Events & string, Readonly<C>> {
  readonly id: string;
  readonly getState: () => S;
  readonly getContext: () => Readonly<C>;
  readonly getAllowedEvents: () => readonly (keyof Events & string)[];
  readonly can: <K extends keyof Events & string>(
    ...args: undefined extends Events[K]
      ? [event: K, payload?: Events[K]]
      : [event: K, payload: Events[K]]
  ) => boolean;
  readonly send: MachineSend<Events>;
  readonly getSnapshot: () => KoruMachineSnapshot<S, keyof Events & string, Readonly<C>>;
  readonly subscribe: (listener: () => void) => () => void;
}

// ── Core Deterministic Machine Factory ──────────────────────

function normalizeSteps<S extends string, C, Payload>(
  definition: TransitionDefinition<S, C, Payload> | undefined,
): readonly TransitionStep<S, C, Payload>[] {
  if (!definition) return [];
  if (typeof definition === 'string') {
    return [{ target: definition }];
  }
  if (Array.isArray(definition)) {
    return definition;
  }
  return [definition as TransitionStep<S, C, Payload>];
}

export function createMachine<
  S extends string,
  C,
  Events extends Record<string, unknown>,
>(config: MachineConfig<S, C, Events>): StateMachine<S, C, Events> {
  type E = keyof Events & string;

  let currentState: S = config.initial;
  let currentContext: C = config.context;
  const listeners = new Set<() => void>();

  const computeAllowedEvents = (state: S, ctx: Readonly<C>): readonly E[] => {
    const stateNode = config.states[state];
    const handlers = stateNode?.on;
    if (!handlers) return Object.freeze([] as E[]);

    const allowed: E[] = [];
    for (const key of Object.keys(handlers) as E[]) {
      const steps = normalizeSteps<S, C, Events[E]>(handlers[key] as TransitionDefinition<S, C, Events[E]> | undefined);
      if (steps.length === 0) continue;
      const anyEnabled = steps.some(step => (step.enabled ? step.enabled(ctx) : true));
      if (anyEnabled) {
        allowed.push(key);
      }
    }
    return Object.freeze(allowed);
  };

  const buildSnapshot = (
    state: S,
    ctx: C,
  ): KoruMachineSnapshot<S, E, Readonly<C>> =>
    Object.freeze({
      id: config.id,
      state,
      allowedEvents: computeAllowedEvents(state, ctx),
      context: ctx,
    });

  let cachedSnapshot = buildSnapshot(currentState, currentContext);

  const can = <K extends E>(
    ...args: undefined extends Events[K]
      ? [event: K, payload?: Events[K]]
      : [event: K, payload: Events[K]]
  ): boolean => {
    const [event, payload] = args;
    const steps = normalizeSteps<S, C, Events[K]>(config.states[currentState]?.on?.[event]);
    if (steps.length === 0) return false;

    const hasPayload = args.length >= 2;
    return steps.some(step => {
      if (step.enabled && !step.enabled(currentContext)) return false;
      if (step.guard && hasPayload) {
        return step.guard(currentContext, payload as Events[K]);
      }
      return true;
    });
  };

  const send: MachineSend<Events> = <K extends E>(
    ...args: undefined extends Events[K]
      ? [event: K, payload?: Events[K]]
      : [event: K, payload: Events[K]]
  ): boolean => {
    const [event, rawPayload] = args;
    const payload = rawPayload as Events[K];
    const steps = normalizeSteps<S, C, Events[K]>(config.states[currentState]?.on?.[event]);
    if (steps.length === 0) return false;

    for (const step of steps) {
      if (step.enabled && !step.enabled(currentContext)) continue;
      if (step.guard && !step.guard(currentContext, payload)) continue;

      const prevState = currentState;
      const nextTarget =
        typeof step.target === 'function'
          ? step.target(currentContext, payload)
          : step.target;
      const nextContext = step.assign
        ? step.assign(currentContext, payload)
        : currentContext;

      currentState = nextTarget;
      currentContext = nextContext;
      cachedSnapshot = buildSnapshot(currentState, currentContext);

      config.onTransition?.({
        id: config.id,
        from: prevState,
        to: currentState,
        event,
        context: currentContext,
      });

      listeners.forEach(listener => listener());
      return true;
    }

    return false;
  };

  return {
    id: config.id,
    getState: () => currentState,
    getContext: () => currentContext,
    getAllowedEvents: () => cachedSnapshot.allowedEvents,
    can,
    send,
    getSnapshot: () => cachedSnapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

// ── Read-Only AX Registry (`window.__KORU_MACHINES__`) ──────

interface RegistryEntry {
  readonly baseId: string;
  readonly getSnapshot: () => KoruMachineSnapshot;
}

const activeEntries = new Map<symbol, RegistryEntry>();

function buildPublicSnapshots(): readonly KoruMachineSnapshot[] {
  const counts = new Map<string, number>();
  const seen = new Map<string, number>();

  for (const entry of activeEntries.values()) {
    counts.set(entry.baseId, (counts.get(entry.baseId) ?? 0) + 1);
  }

  const list: KoruMachineSnapshot[] = [];
  for (const entry of activeEntries.values()) {
    const raw = entry.getSnapshot();
    const total = counts.get(entry.baseId) ?? 1;
    const idx = (seen.get(entry.baseId) ?? 0) + 1;
    seen.set(entry.baseId, idx);

    const resolvedId = total > 1 && idx > 1 ? `${entry.baseId}#${idx}` : entry.baseId;
    list.push(
      Object.freeze({
        id: resolvedId,
        state: raw.state,
        allowedEvents: Object.freeze([...raw.allowedEvents]),
        context: raw.context,
      }),
    );
  }

  return Object.freeze(list);
}

const koruRegistry: KoruMachineRegistry = Object.freeze({
  getSnapshots: () => buildPublicSnapshots(),
  getSnapshot: (id: string) => buildPublicSnapshots().find(snap => snap.id === id),
  ids: () => Object.freeze(buildPublicSnapshots().map(snap => snap.id)),
  get snapshots() {
    return buildPublicSnapshots();
  },
});

export function ensureKoruMachineRegistry(): KoruMachineRegistry {
  if (typeof window !== 'undefined' && window.__KORU_MACHINES__ !== koruRegistry) {
    window.__KORU_MACHINES__ = koruRegistry;
  }
  return koruRegistry;
}

export interface RegisterMachineOptions<C, PublicContext = unknown> {
  readonly id?: string;
  readonly formatContext?: (context: C) => PublicContext;
}

export function registerKoruMachine<
  S extends string,
  E extends string,
  C,
  PublicContext = C,
>(
  machine: InspectableMachine<S, E, C>,
  options?: RegisterMachineOptions<C, PublicContext>,
): () => void {
  ensureKoruMachineRegistry();
  const token = Symbol(options?.id ?? machine.id);
  const baseId = options?.id ?? machine.id;
  const formatContext = options?.formatContext;

  activeEntries.set(token, {
    baseId,
    getSnapshot: () => {
      const snap = machine.getSnapshot();
      return {
        id: baseId,
        state: snap.state,
        allowedEvents: snap.allowedEvents,
        context: formatContext ? formatContext(snap.context) : snap.context,
      };
    },
  });

  return () => {
    activeEntries.delete(token);
  };
}

// ── React 19 `useMachine` Hook ──────────────────────────────

export interface UseMachineOptions<C, PublicContext = C> {
  readonly id?: string;
  readonly expose?: boolean;
  readonly formatContext?: (context: Readonly<C>) => PublicContext;
}

export interface UseMachineResult<
  S extends string,
  C,
  Events extends Record<string, unknown>,
> {
  readonly state: S;
  readonly context: Readonly<C>;
  readonly allowedEvents: readonly (keyof Events & string)[];
  readonly snapshot: KoruMachineSnapshot<S, keyof Events & string, Readonly<C>>;
  readonly send: MachineSend<Events>;
  readonly can: StateMachine<S, C, Events>['can'];
  readonly machine: StateMachine<S, C, Events>;
}

export function useMachine<
  S extends string,
  C,
  Events extends Record<string, unknown>,
  PublicContext = Readonly<C>,
>(
  initConfig: MachineConfig<S, C, Events> | (() => MachineConfig<S, C, Events>),
  options?: UseMachineOptions<C, PublicContext>,
): UseMachineResult<S, C, Events> {
  const [machine] = useState<StateMachine<S, C, Events>>(() =>
    createMachine(typeof initConfig === 'function' ? initConfig() : initConfig),
  );

  const snapshot = useSyncExternalStore(
    machine.subscribe,
    machine.getSnapshot,
    machine.getSnapshot,
  );

  const expose = options?.expose ?? true;
  const registryId = options?.id;
  const formatContext = options?.formatContext;

  useEffect(() => {
    if (!expose) return undefined;
    return registerKoruMachine(machine, {
      id: registryId,
      formatContext,
    });
  }, [machine, expose, registryId, formatContext]);

  return {
    state: snapshot.state,
    context: snapshot.context,
    allowedEvents: snapshot.allowedEvents,
    snapshot,
    send: machine.send,
    can: machine.can,
    machine,
  };
}

ensureKoruMachineRegistry();
