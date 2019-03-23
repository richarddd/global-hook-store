import { useState, useEffect, SetStateAction, Dispatch } from "react";

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
  error?: object | string;
  data: T;
};

type AsyncAction<S> = <T extends keyof S, B>(
  key: T,
  promise: Promise<B>,
  throwError?: boolean
) => S[T] extends
  | AsyncState<B>
  | AsyncState<B | null>
  | AsyncState<B | undefined>
  ? Promise<S>
  : void;

type ReducerUtils<S> = {
  setState: SetStateFunction<S>;
  asyncAction: AsyncAction<S>;
  reset: (...keys: Array<keyof S>) => S | Promise<S>;
};

export type Store<S, A> = {
  state: S;
  actions: A;
  setState: SetStateFunction<S>;
};

type StateReceiver<S, A> = {
  store: Store<S, A>;
  receiver: () => S;
  setState: SetStateFunction<S>;
};

function asyncState<T>(): AsyncState<T | null>;
function asyncState<T>(data: T): AsyncState<T>;
function asyncState<T>(data?: T): AsyncState<T> | AsyncState<T | null> {
  return {
    data: data || null,
    loading: false
  };
}

const copyState: <S>(state: S) => any = state => {
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
    ...state
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
        const newState = await reducer(
          copyState(stateReceiver.receiver()),
          payload,
          internals.utils
        );
        stateReceiver.setState(newState);
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
      : (payload: ExtractPayload<S, R[T]>) => Promise<S>
  }
>;
function createStore<S>(initialState: S): Store<S, any> {
  const [_, ...reducerArray] = Array.from(arguments);

  const reducers = reducerArray.reduce<ReducerFunctions<any>>((acc, curr) => {
    Object.keys(curr).forEach(key => {
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
    utils: {} as any
  };
  const setState = (state: any) => {
    applySettersGetters(internals, state);
    actionStore.state = state;
    internals.setStateSet.forEach(setStateFunction => {
      setStateFunction(state);
    });
  };

  if (initialState instanceof Object) {
    Object.keys(initialState).forEach(key => {
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
    ["__internal"]: internals
  };

  const stateReceiver = {
    setState,
    receiver: () => actionStore.state,
    store: actionStore
  };

  internals.utils = {
    setState: stateReceiver.setState,
    asyncAction: async (
      key: string | number | symbol,
      promise: Promise<any>,
      throwError: boolean = false
    ) => {
      let state = stateReceiver.receiver() as any;
      let asyncStateObj = state[key] as AsyncState<any>;
      delete asyncStateObj.error;
      asyncStateObj.loading = true;
      stateReceiver.setState({ ...state, [key]: asyncStateObj });
      try {
        const data = await promise;
        asyncStateObj = {
          data,
          loading: false
        };
      } catch (error) {
        asyncStateObj.loading = false;
        asyncStateObj.error = error;
        if (throwError) {
          throw error;
        }
      }

      state = stateReceiver.receiver() as any;
      return { ...state, [key]: asyncStateObj };
    },
    reset: (...keys) => {
      if (keys.length === 0) {
        return deepClone(internals.initialState);
      }
      const state = stateReceiver.receiver() as any;
      keys.forEach(a => {
        state[a] = internals.initialState[a];
      });
      return deepClone(state);
    }
  };

  const actions = mapActions(internals, reducers, stateReceiver);

  actionStore.actions = actions;
  internals.actions = actions;

  return actionStore;
}

const useStore: <S, A>(store: Store<S, A>) => Store<S, A> = store => {
  const [_, setState] = useState(store.state);

  const internals = (store as any)["__internal"] as StoreInternal;
  const setters = internals.setStateSet;

  useEffect(() => {
    setters.add(setState);
  });

  useEffect(() => {
    return () => {
      setters.delete(setState);
    };
  }, []);

  return store;
};

const useLocalStore: <S, A>(store: Store<S, A>) => Store<S, A> = store => {
  const internals = (store as any)["__internal"] as StoreInternal;
  const [sa, internalSetState] = useState(() => {
    // tslint:disable-next-line:no-shadowed-variable
    const stateReceiver = {
      store: {} as Store<any, any>,
      receiver: () => store.state,
      // tslint:disable-next-line:no-empty
      setState: (s: any) => {}
    };
    return {
      stateReceiver,
      state: store.state,
      actions: mapActions(internals, internals.reducers, stateReceiver) as any
    };
  });

  const { state, actions, stateReceiver } = sa;

  const receiver = () => {
    return state;
  };

  stateReceiver.receiver = receiver;

  const setState = (newState: any) => {
    applySettersGetters(internals, newState);
    internalSetState({
      actions,
      stateReceiver,
      state: newState
    });
  };

  const actionStore = {
    state,
    setState,
    actions
  };

  stateReceiver.setState = setState;
  stateReceiver.store = actionStore;

  return actionStore;
};

function useStoreReset<S, A>(
  store: Store<S, A>,
  ...keys: Array<keyof S>
): void {
  useEffect(
    () => () => {
      const internals = (store as any)["__internal"] as StoreInternal;
      internals.utils.reset.apply(null, keys);
    },
    []
  );
}

export default useStore;
export { useLocalStore, asyncState, createStore, useStoreReset };
