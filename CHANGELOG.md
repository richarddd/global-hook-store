# Changelog

## 1.0.3

Fix issue with endless rendering in `useStoreReset`

## 1.0.1-1.0.2

Upgrade some deps and fixing a minor issue. react and react-dom are now peer dependencies as they should have been from [the beginning](https://www.youtube.com/watch?v=JqHaJkIvz0Q)

## 1.0.0

I have been running global-hook-store for over a year now in various production projects and I think its finally ready for a 1.0 release 🎉

- Added `usePromise` hook to the lib
- Added `stateReceiver` to utils. Calling this will return the current state (handly in async actions)
- Updated dependencies
- Added more testing
- Adding a CHANGELOG.md
- Added debugging flag

### usePromise

`usePromise` hook will allow you to invoke promises and return a handy "loading, error, data" state for your component:

```javascript
//async function:
const fetchUsers = async () => await api.users.getAll();

//component
const usersComponent = () => {
  const [fetchUsersState, call: getAllUsers, reset] = usePromise(fetchUsers);
  const { loading, error, data: users } = fetchUsersState;

  const onFetchClicked = () => {
    getAllUsers(); //is also async and will return result of promise if awating
  };

  return (
    <div>
      {loading && "loading users...")}
      {error && "something went wrong..."}
      {users && <Users users={users} />}
    </div>
  );
};
```

### State receiver

Use a "state receiver" in your async actions to recive the current version of the state as the state could be modified while your async action is running:

```javascript
const store = createStore(
  {
    count: 0,
  },
  {
    increment: ({ count }) => ({ count: count + 1 }),

    incrementByTen: async ({ count }) => {
      await delay(1000);
      return { count: count + 10 };
    },

    incrementByTenReceived: async (_state, _payload, { receiveState }) => {
      await delay(1000);
      return { count: receiveState().count + 10 };
    },
  }
);
```

If you're not using this util and call `incrementByTenReceived` multiple time and not awaiting the action you would receive the state the action had when called.

```javascript
incrementByTen();
incrementByTen();
incrementByTen();

//state.count = 10
```

```javascript
incrementByTenReceived();
incrementByTenReceived();
incrementByTenReceived();

//state.count = 30
```

OR

```javascript
await incrementByTen();
await incrementByTen();
await incrementByTen();

//state.count = 30
```

### Debugging

Set `window.GLOBAL_HOOK_DEBUG = true` in console. Global-hook-store will now output usefull debugging info to the console.

## < 1.0.0

Please refer to https://github.com/richarddd/global-hook-store/releases
