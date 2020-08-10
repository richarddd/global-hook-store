var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { useState, useCallback } from "react";
var INITIAL_STATE = {
    data: undefined,
    error: undefined,
    loading: false,
};
export var usePromise = function (asyncFunction) {
    var _a = __read(useState(INITIAL_STATE), 2), state = _a[0], setState = _a[1];
    var reset = useCallback(function () {
        setState(INITIAL_STATE);
    }, [setState]);
    var call = useCallback(function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            setState({ loading: true });
            var mounted = true;
            asyncFunction.apply(void 0, __spread(args)).then(function (data) {
                if (mounted) {
                    setState({ data: data, loading: false });
                    resolve(data);
                }
            })
                .catch(function (error) {
                if (mounted) {
                    setState({ error: error, loading: false, data: undefined });
                    reject(error);
                }
            });
            return function () {
                mounted = false;
            };
        });
    }, [asyncFunction, setState]);
    return [state, call, reset];
};
export default usePromise;
//# sourceMappingURL=usePromise.js.map