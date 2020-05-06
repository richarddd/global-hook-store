declare type State<T> = {
    data?: T;
    error?: any;
    loading: boolean;
};
declare type PromiseReturnType<T> = T extends (...args: any) => Promise<infer R> ? R : never;
declare type PromiseCall<T> = T extends (...args: infer A) => Promise<infer R> ? (...args: A) => Promise<R> : never;
export declare const usePromise: <T extends (...args: any) => Promise<any>>(asyncFunction: T) => [State<PromiseReturnType<T>>, PromiseCall<T>, () => void];
export default usePromise;
