import { InputModeOptions } from "react-native"
import { Action, InputsReducerState } from "../hooks/inputsReducer"
import { FText } from "../Components/FText"
import { styled } from "styled-components/native"
import { TextInput as DefaultTextInput } from "react-native-gesture-handler"

export const showError = (error: { error?: string | null } | undefined) => {
  return error?.error
  ? <FText>{error.error}</FText>
  : <></>
}

export const TextInput = styled(DefaultTextInput)<{
  $width?: string,
  $height?: string,
  $borderColor?: string }>`
  background: white;
  width: ${props => props.$width || "100%"};
  height: ${props => props.$height || "auto"};
  padding: 12px;
  border: 1px solid ${props => props.$borderColor || "#DADBDD"};
  border-radius: 8px;
  color: black;
  box-shadow: 0px 1px 1.41px rgba(0, 0, 0, 0.2);

  ::placeholder {
    color: #DADBDD;
  }
`

type set = (action: Action) => void;

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
