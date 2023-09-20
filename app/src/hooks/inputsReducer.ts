import { useReducer } from 'react';
import { z } from "zod"

export type InputsReducerState = {
  [key: string]: {
    input: string;
    error: string | undefined;
  };
};

const parseInput = (error: z.SafeParseReturnType<string, string>) => {
  if (error.success) return undefined;
  
  return error.error.issues[0].message;
};

export type Action = {
  key: string;
  input: string;
  parser: z.ZodString;
};

const inputsReducer = (state: InputsReducerState, action: Action) => {
  return {
    ...state,
    [action.key]: {
      input: action.input,
      error: parseInput(action.parser.safeParse(action.input)),
    },
  };
};

type reducerReturn = [
  {
    [x: string]: {
        input: string;
        error: string | undefined;
    }
  },
  React.Dispatch<Action>
]

export const useInputsReducer = (): reducerReturn => {
  const [state, dispatcher] = useReducer(
    inputsReducer,
    {} satisfies InputsReducerState
  );

  return [state, dispatcher];
};
