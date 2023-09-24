import { trpc } from '../../utils/trpc';
import { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Text, Keyboard } from 'react-native';
import { renderInput, showError } from '../../utils/formHelpers';
import { useInputsReducer } from '../../hooks/inputsReducer';
import z from "zod";
import { FText } from '../../Components/FText';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export default function Register() {
  const createUser = trpc.user.create.useMutation()

  const [inputs, setInputs] = useInputsReducer()

  const sendLoginData = () => {
    console.log('login');
  }

  return <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.form}>
      <FText style={styles.form__title}>S'enregistrer</FText>

      {renderInput({
        setInputs,
        inputs,
        parser: z.string()
          .email({ message: "L'email n'est pas correct" }),
        state: "email",
        placeholder: "Adresse email",
        inputMode: "email",
        maxLength: 200
      })}
      {showError(inputs.email)}

      {renderInput({
        setInputs,
        inputs,
        parser: z.string(),
        state: "password",
        placeholder: "Mot de passe",
        secureTextEntry: true,
        maxLength: 200,
      })}
      {showError(inputs.password)}

      <Pressable style={styles.button} onPress={() => sendLoginData()}>
        <Text>Se connecter</Text>
      </Pressable>

      <View style={styles.container__waccount}>
        <Text>Vous n'avez pas de compte ?<Pressable onPress={() => sendLoginData()}><Text style={styles.button__waccount}>S'enregistrer</Text></Pressable>  </Text>
      </View>
    </View>
  </TouchableWithoutFeedback>
}

const styles = StyleSheet.create({
  form: {
    gap: 20,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  form__title:{
    fontSize: 30,
    fontWeight: 'bold',
    position: 'absolute',
    top: 0,
    paddingTop: 50
  },

  input: {
    width: '80%',
    height: 35,
    paddingLeft: 5,
    borderWidth: 2,
    borderColor: 'black'
  },

  button: {
    width: '80%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 5,
    borderWidth: 2,
    height: 35
  },

  container__waccount: {
    backgroundColor: '#0000',
    position: 'absolute',
    bottom: 0,
    paddingBottom: 25
  },

  button__waccount: {
    color: 'red',
    paddingLeft: 5
  }

});
