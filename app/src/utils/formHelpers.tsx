import { InputModeOptions } from "react-native"
import { Action, InputsReducerState } from "../hooks/inputsReducer"
import { MTitleText, SText } from "../Components/FText"
import { styled } from "styled-components/native"
import { TextInput as DefaultTextInput } from "react-native-gesture-handler"
import colors from "../Page/css/color.css";
import { Check, InputEye } from "../Page/css/auth.css"

export const showError = (error: { error?: string | null } | undefined) => {
  return error?.error
    ? <SText $color="white" $size="14px">{error.error}</SText>
    : <></>
}

export const TextInput = styled(DefaultTextInput) <{
  $width?: string,
  $height?: string,
}>`
  background: white;
  width: ${props => props.$width || "90%"};
  height: ${props => props.$height || "auto"};
  padding: 12px 0 12px 0;
  color: white;
  background-color:transparent;
  box-shadow: 0px 1px 1.41px rgba(0, 0, 0, 0.2);
`

const TextInputLabel = styled.View<{ $length: number }>`
  width: ${props => props.$length ? `${35 + props.$length * 8}px` : 'auto'};
  height: 24px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: #24252D;
  position: relative;
  z-index: 1;
`;

const Container = styled.View`
  display: flex;
`;

const InputWrapper = styled.View<{ $borderColor?: string }>`
  display: flex;
  flex-direction: row;
  border-bottom-width: 2px;
  border-bottom-color: ${props => props.$borderColor || colors.gold};
  justify-content: space-between;
  align-items: center;
`

type set = (action: Action) => void;

interface Props {
  setInputs: set,
  inputs: InputsReducerState,
  state: string,
  maxLength: number,
  secureTextEntry?: boolean,
  inputMode?: InputModeOptions,
  parser: any,
  label: string,
  type?: "mail" | "password"
}

export const renderInput = ({
  setInputs,
  inputs,
  state,
  maxLength,
  secureTextEntry,
  inputMode,
  parser,
  onFocus,
  onChangeText,
  $width,
  label,
  type,

}: Props & typeof TextInput.defaultProps) => {

  function inputDecorationRender() {
    if (type === "mail") {
      return <Check />
    } else if (type === "password") {
      return <InputEye onPress={() => (secureTextEntry)} />
    }

    return <></>
  }

  return <Container>
    <TextInputLabel $length={label.length}>
      <MTitleText $color={colors.gold} $size="18px">{label}</MTitleText>
    </TextInputLabel>
    <InputWrapper $borderColor={inputs[state]?.error ? "red" : undefined}>
      <TextInput
        onChangeText={(e) => {
          if (onChangeText) onChangeText(e)

          setInputs({
            key: state,
            input: e,
            parser
          })
        }}
        value={inputs[state]?.input || ""}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
        inputMode={inputMode}
        onFocus={onFocus}
        {...{
          $width,
        }}
      />
      {inputDecorationRender()}
    </InputWrapper>
  </Container>
}
