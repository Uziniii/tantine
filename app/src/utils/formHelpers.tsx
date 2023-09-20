import { InputModeOptions, StyleSheet, Text, TextInput } from "react-native"
import { Action, InputsReducerState } from "../hooks/inputsReducer"

export const showError = (error: { error?: string } | undefined) => {
  return error?.error
  ? <Text>{error.error}</Text>
  : <></>
}

const styles = StyleSheet.create({
  input: {
    width: '80%',
    height: 35,
    paddingLeft: 5,
    borderWidth: 2,
    borderColor: 'black'
  }
})

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
    style={styles.input}
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
