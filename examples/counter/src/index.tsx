import * as React from "react";
import { render } from "react-dom";

import createStoreContext from "react-concise-state";

// 1️⃣ create a store context providing initial state and an actions
const [context, Provider] = createStoreContext(
  {
    counter: 0
  },
  {
    // 👇 actions modify state using provided `setState`
    incrementBy: ({ state, setState }, increment: number) => {
      const newValue = state.counter + increment;
      setState({ counter: newValue });
    },
    reset: ({ setState }) => setState({ counter: 0 })
  }
);

// 2️⃣ wrap component in created provider
const App = props => {
  return (
    <Provider>
      <CounterComponent />
    </Provider>
  );
};

// 3️⃣ hook context in consumer to use generated store
const CounterComponent: React.FC = props => {
  const store = React.useContext(context);
  // 👇 generated store contains both the state and actions to call
  const onIncrement = () => store.incrementBy(1);
  const onDecrement = () => store.incrementBy(-1);
  return (
    <div>
      <h2>Counter: {store.counter}</h2>
      <hr />
      <button onClick={onIncrement}>Increment</button>
      <button onClick={onDecrement}>Decrement</button>

      <button onClick={store.reset}>Reset</button>
    </div>
  );
};

render(<App />, document.getElementById("root"));
