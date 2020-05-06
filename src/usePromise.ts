import { useState, useCallback } from "react";

type State<T> = {
  data?: T;
  error?: any;
  loading: boolean;
};

type PromiseReturnType<T> = T extends (...args: any) => Promise<infer R>
  ? R
  : never;

type PromiseCall<T> = T extends (...args: infer A) => Promise<infer R>
  ? (...args: A) => Promise<R>
  : never;

const INITIAL_STATE = {
  data: undefined,
  error: undefined,
  loading: false
};

export const usePromise: <T extends (...args: any) => Promise<any>>(
  asyncFunction: T
) => [
  State<PromiseReturnType<T>>,
  PromiseCall<T>,
  () => void
] = asyncFunction => {
  const [state, setState] = useState<State<any>>(INITIAL_STATE);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, [setState]);

  const call = useCallback(
    (...args: any) =>
      new Promise((resolve, reject) => {
        setState({ loading: true });
        let mounted = true;
        (asyncFunction as any)(...args)
          .then((data: any) => {
            if (mounted) {
              setState({ data, loading: false });
              resolve(data);
            }
          })
          .catch((error: any) => {
            if (mounted) {
              setState({ error, loading: false, data: undefined });
              reject(error);
            }
          });
        return () => {
          mounted = false;
        };
      }),
    [asyncFunction, setState]
  );

  return [state, call as any, reset];
};

export default usePromise;
