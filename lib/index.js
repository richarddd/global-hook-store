var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
import { useState, useEffect } from "react";
export var createStore = function (initialState, reducers) { return ({
    state: initialState,
    reducers: __assign({}, reducers)
}); };
var isObject = function (test) { return test === Object(test); };
var copyState = function (state) {
    var stateIsObject = isObject(state);
    // is primitive
    if (!stateIsObject) {
        return state;
    }
    if (Array.isArray(state)) {
        return state.slice();
    }
    var cloned = __assign({}, state);
    var originalState = state;
    var clonedState = cloned;
    Object.keys(state).forEach(function (key) {
        var setter = originalState.__lookupSetter__(key);
        var getter = originalState.__lookupGetter__(key);
        if (setter) {
            delete clonedState[key];
            clonedState.__defineSetter__(key, setter);
        }
        if (getter) {
            delete clonedState[key];
            clonedState.__defineGetter__(key, getter);
        }
    });
    console.log("cloned state", clonedState);
    return clonedState;
};
var globalStore = (function () {
    var map = new WeakMap();
    return function (object) {
        if (!map.has(object)) {
            var state = object.state;
            var setters_1 = new Set();
            var global_1 = {
                state: state,
                actions: Object.entries(object.reducers).reduce(function (acc, _a) {
                    var key = _a[0], reducer = _a[1];
                    acc[key] = function (payload) { return __awaiter(_this, void 0, void 0, function () {
                        var newState, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = copyState;
                                    return [4 /*yield*/, reducer(global_1.state, payload)];
                                case 1:
                                    newState = _a.apply(void 0, [_b.sent()]);
                                    setters_1.forEach(function (s) {
                                        s(newState);
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    return acc;
                }, {})
            };
            map.set(object, {
                global: global_1,
                setters: setters_1
            });
        }
        return map.get(object);
    };
})();
// const useStore: <S, R extends StoreReducers<S>>(
//   store: Store<S, R>
// ) => ActionStore<S, keyof R> = store => {
//   const [state, setState] = useState(store.state);
//   return state as any;
// };
var useGlobalStore = function (store) {
    var _a = useState(store.state), state = _a[0], setState = _a[1];
    var _b = globalStore(store), global = _b.global, setters = _b.setters;
    global.state = state;
    useEffect(function () {
        setters.add(setState);
    });
    useEffect(function () {
        return function () {
            setters.delete(setState);
        };
    }, []);
    return global;
};
export default useGlobalStore;
// export { useStore };
//# sourceMappingURL=index.js.map