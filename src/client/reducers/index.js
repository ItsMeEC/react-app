const initialState = {
  bars: null,
  user: null,
  fetching: false,
};

const idxFinder = (state, id) => {
  for (let i = 0; i < state.bars.length; i += 1) {
    if (state.bars[i].id === id) {
      return i;
    }
  }
  return null;
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCHING': {
      const updatedState = Object.assign({}, state);
      updatedState.fetching = true;
      return updatedState;
    }
    case 'GET_BARS': {
      const updatedState = Object.assign({}, state);
      updatedState.bars = action.payload;
      updatedState.fetching = false;
      return updatedState;
    }
    case 'ADD_AUTH': {
      const updatedState = Object.assign({}, state);
      updatedState.user = action.payload;
      return updatedState;
    }
    case 'ADD_GOING': {
      const idx = idxFinder(state, action.payload.id);
      const updatedState = Object.assign([], state.bars);
      updatedState[idx].going = action.payload.going;
      return {
        bars: updatedState,
        user: state.user,
      };
    }
    default: return state;
  }
};

export default reducer;
