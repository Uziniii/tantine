import { InputModeOptions } from "react-native"
import { Action, InputsReducerState } from "../hooks/inputsReducer"
import { FText } from "../Components/FText"
import { styled } from "styled-components/native"

export const showError = (error: { error?: string } | undefined) => {
  return error?.error
  ? <FText>{error.error}</FText>
  : <></>
}

const TextInput = styled.TextInput<{ $width?: string, $borderColor?: string }>`
  width: ${props => props.$width || "100%"};
  padding: 8px;
  border: 2px solid ${props => props.$borderColor || "#DADBDD"};
  border-radius: 8px;
  ::placeholder {
    color: #DADBDD;
  }
`

type set = (action: Action) => void

interface Props {
  setInputs: set,
  inputs: InputsReducerState,
  state: string,
  placeholder: string,
  maxLength: number,
  secureTextEntry?: boolean,
  inputMode?: InputModeOptions,
  parser: any
}

export const renderInput = ({
  setInputs,
  inputs,
  state,
  placeholder,
  maxLength,
  secureTextEntry,
  inputMode,
  parser,
  onFocus,
  onChangeText,
  $width,
}: Props & typeof TextInput.defaultProps) => {
  return <TextInput
    onChangeText={(e) => {
      if (onChangeText) onChangeText(e)
      
      setInputs({
        key: state,
        input: e,
        parser
      })
    }}
    value={inputs[state]?.input || ""}
    placeholder={placeholder}
    maxLength={maxLength}
    secureTextEntry={secureTextEntry}
    inputMode={inputMode}
    onFocus={onFocus}
    {...{
      $width,
      $borderColor: inputs[state]?.error ? "red" : undefined
    }}
  />
}
