import React, { useRef } from "react";
import useStore, { useLocalStore } from "global-hook-store";
import {
  counterStore,
  nameAndCounterStore,
  primitiveStore,
  arrayStore,
  todoStore,
  githubStore
} from "./stores";

const Counter = () => {
  const { actions, state } = useStore(counterStore);

  return (
    <>
      <h4>Count: {state.count}</h4>
      <button onClick={() => actions.decrement()}>-</button>
      <button onClick={() => actions.increment()}>+</button>
    </>
  );
};

const Payload = () => {
  const {
    state: { name, length },
    actions: { updateName }
  } = useStore(nameAndCounterStore);
  const {
    state: { count }
  } = useStore(counterStore);

  return (
    <>
      <h4>Name: {name}</h4>
      <h4>Count from counter example: {count}</h4>
      <input value={name} onChange={e => updateName(e.target.value)} />
      <span>
        <small>Char length: {length}</small>
      </span>
    </>
  );
};

const LocalStore = () => {
  const {
    state: { count },
    actions
  } = useLocalStore(counterStore);

  return (
    <>
      <h4>Local count: {count}</h4>
      <button onClick={() => actions.decrement()}>-</button>
      <button onClick={() => actions.increment()}>+</button>
    </>
  );
};

const Primitive = () => {
  const { state: name, actions } = useStore(primitiveStore);

  return (
    <>
      <h4>Name: {name}</h4>
      <button onClick={() => actions.kalle()}>Kålle</button>
      <button onClick={() => actions.ada()}>Ada</button>
    </>
  );
};

const ArrayComponent = () => {
  const { state, actions } = useStore(arrayStore);

  return (
    <>
      <div>
        {state.map((a, i) => (
          <span key={i}>{a} </span>
        ))}
      </div>
      <button onClick={() => actions.push(`Value #${state.length}`)}>
        PUSH
      </button>
    </>
  );
};

const TodoList = () => {
  const { state, actions } = useStore(todoStore);
  const ref = useRef(null);

  return (
    <>
      {Object.entries(state).map(([todo, done], i) => (
        <div onClick={() => actions.toggleTodo(todo)} key={i + todo}>
          {todo}
          {done ? " ✔" : " ⏲"}
        </div>
      ))}
      <input ref={ref} />
      <button onClick={() => actions.addTodo(ref.current!)}>Add todo</button>
    </>
  );
};

const AsyncComponent = () => {
  const {
    actions,
    state: { count }
  } = useStore(counterStore);

  return (
    <>
      <h4>Counter store count: {count}</h4>
      <button onClick={() => actions.incrementByTen()}>
        3s Delayed increment by 10
      </button>
    </>
  );
};

const Github = () => {
  const {
    state: { repos, userId },
    actions: { getUserRepos, setRepoId, reset }
  } = useStore(githubStore);

  return (
    <>
      <div>
        {(repos.loading && "Loading...") ||
          (repos.error && repos.error.toString()) ||
          repos.data.map((repo, i) => <p key={i}>{repo.name}</p>)}
      </div>
      <input
        placeholder="Github username"
        value={userId}
        onChange={e => setRepoId(e.target.value)}
      />
      <button onClick={getUserRepos}>Fetch repos</button>
      <button onClick={reset}>Reset</button>
    </>
  );
};

const repeat = (n: number, component: () => JSX.Element) =>
  Array(n)
    .fill(component)
    .reduce((acc, current, index) => {
      acc[`${component.name} component ${index + 1}`] = current;
      return acc;
    }, {}) as Record<string, () => JSX.Element>;

export default Object.entries({
  Counters: repeat(4, Counter),
  Payload: { Payload, "Payload in other component": Payload },
  "Local store": repeat(4, LocalStore),
  "Primitive & Array": {
    ...repeat(2, Primitive),
    ...repeat(4, ArrayComponent)
  },
  "Todo list": repeat(2, TodoList),

  Async: {
    ...repeat(2, AsyncComponent),
    ...repeat(2, Github)
  }
});
