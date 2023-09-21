import { InputModeOptions } from "react-native"
import { Action, InputsReducerState } from "../hooks/inputsReducer"
import { FText } from "../FText"
import { styled } from "styled-components/native"

export const showError = (error: { error?: string } | undefined) => {
  return error?.error
  ? <FText>{error.error}</FText>
  : <></>
}

const TextInput = styled.TextInput`
  width: 80%;
  padding: 8px;
  border: 2px solid #DADBDD;
  border-radius: 8px;
`

type set = (action: Action) => void

export const renderInput = ({
  setInputs,
  inputs,
  state,
  placeholder,
  maxLength,
  secureTextEntry,
  inputMode,
  parser
}: {
  setInputs: set,
  inputs: InputsReducerState,
  state: string,
  placeholder: string,
  maxLength: number,
  secureTextEntry?: boolean,
  inputMode?: InputModeOptions,
  parser: any
}) => {
  return <TextInput
    onChangeText={(e) => setInputs({
      key: state,
      input: e,
      parser
    })}
    value={inputs[state]?.input || ""}
    placeholder={placeholder}
    maxLength={maxLength}
    secureTextEntry={secureTextEntry}
    inputMode={inputMode}
  />
}
