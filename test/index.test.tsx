import React, { useState } from "react";
import { shallow, mount } from "enzyme";
import { act } from "react-dom/test-utils";

import useStore, { createStore } from "../src/index";

//TODO: remove when react react-dom v16.9.0 is out
const mockConsoleMethod = realConsoleMethod => {
  const ignoredMessages = ["test was not wrapped in act(...)"];

  return (message, ...args) => {
    const containsIgnoredMessage = ignoredMessages.some(ignoredMessage =>
      message.includes(ignoredMessage)
    );

    if (!containsIgnoredMessage) {
      realConsoleMethod(message, ...args);
    }
  };
};

console.warn = jest.fn(mockConsoleMethod(console.warn));
console.error = jest.fn(mockConsoleMethod(console.error));

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

const simulateClicks = async (target, count) => {
  for (let i = 0; i < count; i++) {
    target.simulate("click");
    await delay(1);
  }
};

describe("useStore", () => {
  const store = createStore(
    {
      count: 0
    },
    {
      increment: ({ count }) => ({ count: count + 1 }),
      decrement: ({ count }) => ({ count: count - 1 }),
      incrementByTen: async ({ count }) => {
        await delay(3000);
        return { count: count + 10 };
      }
    }
  );

  beforeEach(() => {
    act(() => {});
  });

  it("Should be able to update state globally", async () => {
    const BtnComponent = () => {
      const {
        actions: { increment },
        state
      } = useStore(store);

      return (
        <button onClick={() => increment()}>
          This button has been clicked {state.count} times
        </button>
      );
    };

    const TextComponent = () => {
      const {
        state: { count }
      } = useStore(store);

      return <h1>This button has been clicked {count} times</h1>;
    };

    const App = () => (
      <div>
        <BtnComponent />
        <TextComponent />
      </div>
    );

    const rendered = mount(<App />);
    const button = rendered.find("button");

    await simulateClicks(button, 3);

    const expectation = "This button has been clicked 3 times";
    expect(rendered.find("h1").text()).toBe(expectation);
    expect(rendered.find("button").text()).toBe(expectation);
  });
});
