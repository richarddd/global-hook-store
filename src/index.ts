import { useState, useEffect, SetStateAction, Dispatch, useMemo } from "react";
import usePromise from "./usePromise";

export type SetStateFunction<S = any> = Dispatch<SetStateAction<S>>;

const deepClone = (obj: any): any => {
  if (!(obj instanceof Object) || obj instanceof Function) {
    return obj;
  }
  if (Array.isArray(obj)) {
    const arrayObj = new Array(obj.length);
    for (let i = 0; i < obj.length; i++) {
      arrayObj[i] = deepClone(obj[i]);
    }
    return arrayObj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj.source);
  }
  const clone: any = {};
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
};

type StoreInternal = {
  initialState: any;
  setStateSet: Set<SetStateFunction>;
  setters: Record<string, any>;
  getters: Record<string, any>;
  reducers: ReducerFunctions<any>;
  actions: any;
  utils: ReducerUtils<any>;
};

export type AsyncState<T> = {
  loading: boolean;
  error?: Record<string, unknown> | string;
  data: T;
};

export type AsyncAction<S> = <T extends keyof S, B>(
  key: T,
  promise: Promise<B>,
  throwError?: boolean
) => S[T] extends
  | AsyncState<B>
  | AsyncState<B | null>
  | AsyncState<B | undefined>
  ? Promise<S>
  : never;

type ReducerUtils<S> = {
  setState: SetStateFunction<S>;
  asyncAction: AsyncAction<S>;
  reset: (...keys: (keyof S)[]) => S | Promise<S>;
  receiveState: () => S;
};

export type Store<S, A> = {
  state: S;
  actions: A;
  setState: SetStateFunction<S>;
};

type StateReceiver<S, A> = {
  store: Store<S, A>;
  receiveState: () => S;
  setState: SetStateFunction<S>;
};

function asyncState<T>(): AsyncState<T | null>;
function asyncState<T>(data: T): AsyncState<T>;
function asyncState<T>(data?: T): AsyncState<T> | AsyncState<T | null> {
  return {
    data: data || null,
    loading: false,
  };
}

const copyState: <S>(state: S) => any = (state) => {
  // is primitive
  if (!(state instanceof Object)) {
    return state;
  }
  // is array
  if (Array.isArray(state)) {
    return [...state];
  }

  // is object
  return {
    ...state,
  };
};

type StoreActions<S> = Record<string, (payload?: any) => Promise<S>>;

const mapActions: <S, R extends ReducerFunctions<S>>(
  internals: StoreInternal,
  reducers: R,
  stateReceiver: StateReceiver<S, R>
) => StoreActions<S> = (internals, reducers, stateReceiver) => {
  return Object.entries(reducers).reduce<StoreActions<any>>(
    (acc, [key, reducer]) => {
      acc[key] = async (payload: any) => {
        const currentState = copyState(stateReceiver.receiveState());
        if (window["GLOBAL_HOOK_DEBUG" as any]) {
          // tslint:disable-next-line:no-console
          console.log(`Invoking action: ${key}\n- State before:`, currentState);
        }
        const newState = await reducer(currentState, payload, internals.utils);
        stateReceiver.setState(newState);
        if (window["GLOBAL_HOOK_DEBUG" as any]) {
          // tslint:disable-next-line:no-console
          console.log(`Done invoking action: ${key}\n- State after:`, newState);
        }
        return newState;
      };
      return acc;
    },
    {}
  );
};

const applySettersGetters = (internals: StoreInternal, state: any) => {
  Object.entries(internals.setters).forEach(([k, setter]) => {
    state.__defineSetter__(k, setter);
  });
  Object.entries(internals.getters).forEach(([k, getter]) => {
    state.__defineGetter__(k, getter);
  });
};

export type ReducerFunctions<S> = {
  [key: string]: (
    state: S,
    payload: any,
    utils: ReducerUtils<S>
  ) => Promise<S> | S;
};

export type EmptyReducerFunction<S> = () => Promise<S> | S;

export type StateReducerFunction<S> = (state: S) => Promise<S> | S;

type ExtractPayload<S, T> = T extends (
  state: S,
  payload: infer P
) => S | Promise<S>
  ? P
  : T extends (
      state: S,
      payload: infer P,
      utils: ReducerUtils<S>
    ) => S | Promise<S>
  ? P
  : never;

function createStore<S, R>(
  initialState: S,
  reducers: R & ReducerFunctions<S>
): Store<
  S,
  {
    [T in keyof R]: ExtractPayload<S, R[T]> extends undefined | null
      ? () => Promise<S>
      : R[T] extends StateReducerFunction<S>
      ? () => Promise<S>
      : R[T] extends EmptyReducerFunction<S>
      ? () => Promise<S>
      : (payload: ExtractPayload<S, R[T]>) => Promise<S>;
  }
>;
function createStore<S>(
  initialState: S,
  ...reducerArray: any[]
): Store<S, any> {
  const reducers = reducerArray.reduce<ReducerFunctions<any>>((acc, curr) => {
    Object.keys(curr).forEach((key) => {
      acc[key] = curr[key];
    });
    return acc;
  }, {});

  const internals: StoreInternal = {
    reducers,
    initialState: deepClone(initialState),
    setStateSet: new Set(),
    setters: {},
    getters: {},
    actions: {},
    utils: {} as any,
  };
  const setState = (state: any) => {
    applySettersGetters(internals, state);
    actionStore.state = state;
    internals.setStateSet.forEach((setStateFunction) => {
      setStateFunction(state);
    });
  };

  if (initialState instanceof Object) {
    Object.keys(initialState).forEach((key) => {
      const setter = (initialState as any).__lookupSetter__(key);
      const getter = (initialState as any).__lookupGetter__(key);
      if (setter) {
        internals.setters[key] = setter;
      }
      if (getter) {
        internals.getters[key] = getter;
      }
    });
  }

  const actionStore = {
    setState,
    state: initialState,
    actions: {},
    ["__internal"]: internals,
  };

  const stateReceiver = {
    setState,
    receiveState: () => actionStore.state,
    store: actionStore,
  };

  internals.utils = {
    setState: stateReceiver.setState,
    asyncAction: async (
      key: string | number | symbol,
      promise: Promise<any>,
      throwError = false
    ) => {
      if (window["GLOBAL_HOOK_DEBUG" as any]) {
        console.log("- Async action start:", key);
      }
      let state = stateReceiver.receiveState() as any;
      let asyncStateObj = state[key] as AsyncState<any>;
      delete asyncStateObj.error;
      asyncStateObj.loading = true;
      stateReceiver.setState({ ...state, [key]: asyncStateObj });
      try {
        const data = await promise;
        asyncStateObj = {
          data,
          loading: false,
        };
        if (window["GLOBAL_HOOK_DEBUG" as any]) {
          console.log("- Async action complete:", key);
        }
      } catch (error) {
        asyncStateObj.loading = false;
        asyncStateObj.error = error;
        if (window["GLOBAL_HOOK_DEBUG" as any]) {
          console.error("- Async action error:", key);
        }
        if (throwError) {
          throw error;
        }
      }

      state = stateReceiver.receiveState() as any;
      return { ...state, [key]: asyncStateObj };
    },
    reset: (...keys) => {
      if (window["GLOBAL_HOOK_DEBUG" as any]) {
        console.log("Calling store reset for:", keys);
      }
      if (keys.length === 0) {
        return deepClone(internals.initialState);
      }
      const state = stateReceiver.receiveState() as any;
      const resetedState: any = {};
      keys.forEach((a) => {
        resetedState[a] = internals.initialState[a];
      });
      return { ...state, ...deepClone(resetedState) };
    },
    receiveState: stateReceiver.receiveState,
  };

  const actions = mapActions(internals, reducers, stateReceiver);

  actionStore.actions = actions;
  internals.actions = actions;

  return actionStore;
}

const useStore: <S, A>(store: Store<S, A>) => Store<S, A> = (store) => {
  const [_, setState] = useState(store.state);

  const internals = (store as any)["__internal"] as StoreInternal;
  const setters = internals.setStateSet;

  useEffect(() => {
    setters.add(setState);
  }, [setters]);

  useEffect(
    () => () => {
      setters.delete(setState);
    },
    [setters]
  );

  return store;
};

const useLocalStore: <S, A>(store: Store<S, A>) => Store<S, A> = (store) => {
  const internals = (store as any)["__internal"] as StoreInternal;
  const [sa, internalSetState] = useState(() => {
    // tslint:disable-next-line:no-shadowed-variable
    const stateReceiver = {
      store: {} as Store<any, any>,
      receiveState: () => store.state,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      setState: (s: any) => {},
    };
    return {
      stateReceiver,
      state: store.state,
      actions: mapActions(internals, internals.reducers, stateReceiver) as any,
    };
  });

  useEffect(
    () => () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      sa.stateReceiver.setState = (s: any) => {};
    },
    [sa.stateReceiver]
  );

  const { state, actions, stateReceiver } = sa;

  const receiver = () => {
    return state;
  };

  stateReceiver.receiveState = receiver;

  const setState = (newState: any) => {
    applySettersGetters(internals, newState);
    internalSetState({
      actions,
      stateReceiver,
      state: newState,
    });
  };

  const actionStore = {
    state,
    setState,
    actions,
  };

  stateReceiver.setState = setState;
  stateReceiver.store = actionStore;

  return actionStore;
};

function useStoreReset<S, A>(
  store: Store<S, A>,
  ...keys: Array<keyof S>
): void {
  const keyHash = keys.join("|||");
  useEffect(
    () => () => {
      const internals = (store as any)["__internal"] as StoreInternal;
      internals.utils.setState(
        internals.utils.reset.apply(null, keyHash.split("|||"))
      );
    },
    [store, keyHash]
  );
}

export default useStore;
export { useLocalStore, asyncState, createStore, useStoreReset, usePromise };
