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
var _this = this;
import { useState, useEffect } from "react";
var deepClone = function (obj) {
    if (!(obj instanceof Object) || obj instanceof Function) {
        return obj;
    }
    if (Array.isArray(obj)) {
        var arrayObj = new Array(obj.length);
        for (var i = 0; i < obj.length; i++) {
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
    var clone = {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            clone[key] = deepClone(obj[key]);
        }
    }
    return clone;
};
function asyncState(data) {
    return {
        data: data || null,
        loading: false
    };
}
var copyState = function (state) {
    // is primitive
    if (!(state instanceof Object)) {
        return state;
    }
    // is array
    if (Array.isArray(state)) {
        return __spread(state);
    }
    // is object
    return __assign({}, state);
};
var mapActions = function (internals, reducers, stateReceiver) {
    return Object.entries(reducers).reduce(function (acc, _a) {
        var _b = __read(_a, 2), key = _b[0], reducer = _b[1];
        acc[key] = function (payload) { return __awaiter(_this, void 0, void 0, function () {
            var newState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, reducer(copyState(stateReceiver.receiver()), payload, internals.utils)];
                    case 1:
                        newState = _a.sent();
                        stateReceiver.setState(newState);
                        return [2 /*return*/, newState];
                }
            });
        }); };
        return acc;
    }, {});
};
var applySettersGetters = function (internals, state) {
    Object.entries(internals.setters).forEach(function (_a) {
        var _b = __read(_a, 2), k = _b[0], setter = _b[1];
        state.__defineSetter__(k, setter);
    });
    Object.entries(internals.getters).forEach(function (_a) {
        var _b = __read(_a, 2), k = _b[0], getter = _b[1];
        state.__defineGetter__(k, getter);
    });
};
function createStore(initialState) {
    var _this = this;
    var _a;
    var _b = __read(Array.from(arguments)), _ = _b[0], reducerArray = _b.slice(1);
    var reducers = reducerArray.reduce(function (acc, curr) {
        Object.keys(curr).forEach(function (key) {
            acc[key] = curr[key];
        });
        return acc;
    }, {});
    var internals = {
        reducers: reducers,
        initialState: deepClone(initialState),
        setStateSet: new Set(),
        setters: {},
        getters: {},
        actions: {},
        utils: {}
    };
    var setState = function (state) {
        applySettersGetters(internals, state);
        actionStore.state = state;
        internals.setStateSet.forEach(function (setStateFunction) {
            setStateFunction(state);
        });
    };
    if (initialState instanceof Object) {
        Object.keys(initialState).forEach(function (key) {
            var setter = initialState.__lookupSetter__(key);
            var getter = initialState.__lookupGetter__(key);
            if (setter) {
                internals.setters[key] = setter;
            }
            if (getter) {
                internals.getters[key] = getter;
            }
        });
    }
    var actionStore = (_a = {
            setState: setState,
            state: initialState,
            actions: {}
        },
        _a["__internal"] = internals,
        _a);
    var stateReceiver = {
        setState: setState,
        receiver: function () { return actionStore.state; },
        store: actionStore
    };
    internals.utils = {
        setState: stateReceiver.setState,
        asyncAction: function (key, promise, throwError) {
            if (throwError === void 0) { throwError = false; }
            return __awaiter(_this, void 0, void 0, function () {
                var _a, _b, state, asyncStateObj, data, error_1;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            state = stateReceiver.receiver();
                            asyncStateObj = state[key];
                            delete asyncStateObj.error;
                            asyncStateObj.loading = true;
                            stateReceiver.setState(__assign({}, state, (_a = {}, _a[key] = asyncStateObj, _a)));
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, promise];
                        case 2:
                            data = _c.sent();
                            asyncStateObj = {
                                data: data,
                                loading: false
                            };
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _c.sent();
                            asyncStateObj.loading = false;
                            asyncStateObj.error = error_1;
                            if (throwError) {
                                throw error_1;
                            }
                            return [3 /*break*/, 4];
                        case 4:
                            state = stateReceiver.receiver();
                            return [2 /*return*/, __assign({}, state, (_b = {}, _b[key] = asyncStateObj, _b))];
                    }
                });
            });
        },
        reset: function () {
            var keys = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                keys[_i] = arguments[_i];
            }
            if (keys.length === 0) {
                return deepClone(internals.initialState);
            }
            var state = stateReceiver.receiver();
            keys.forEach(function (a) {
                state[a] = internals.initialState[a];
            });
            return deepClone(state);
        }
    };
    var actions = mapActions(internals, reducers, stateReceiver);
    actionStore.actions = actions;
    internals.actions = actions;
    return actionStore;
}
var useStore = function (store) {
    var _a = __read(useState(store.state), 2), _ = _a[0], setState = _a[1];
    var internals = store["__internal"];
    var setters = internals.setStateSet;
    useEffect(function () {
        setters.add(setState);
    });
    useEffect(function () {
        return function () {
            setters.delete(setState);
        };
    }, []);
    return store;
};
var useLocalStore = function (store) {
    var internals = store["__internal"];
    var _a = __read(useState(function () {
        // tslint:disable-next-line:no-shadowed-variable
        var stateReceiver = {
            store: {},
            receiver: function () { return store.state; },
            // tslint:disable-next-line:no-empty
            setState: function (s) { }
        };
        return {
            stateReceiver: stateReceiver,
            state: store.state,
            actions: mapActions(internals, internals.reducers, stateReceiver)
        };
    }), 2), sa = _a[0], internalSetState = _a[1];
    var state = sa.state, actions = sa.actions, stateReceiver = sa.stateReceiver;
    var receiver = function () {
        return state;
    };
    stateReceiver.receiver = receiver;
    var setState = function (newState) {
        applySettersGetters(internals, newState);
        internalSetState({
            actions: actions,
            stateReceiver: stateReceiver,
            state: newState
        });
    };
    var actionStore = {
        state: state,
        setState: setState,
        actions: actions
    };
    stateReceiver.setState = setState;
    stateReceiver.store = actionStore;
    return actionStore;
};
function useStoreReset(store) {
    var keys = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        keys[_i - 1] = arguments[_i];
    }
    useEffect(function () { return function () {
        var internals = store["__internal"];
        internals.utils.reset.apply(null, keys);
    }; }, []);
}
export default useStore;
export { useLocalStore, asyncState, createStore, useStoreReset };
//# sourceMappingURL=index.js.map