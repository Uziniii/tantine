import { trpc } from '../../utils/trpc';
import { StyleSheet, View, TextInput, Pressable, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import z from "zod"
import { renderInput, showError } from "../../utils/formHelpers"
import { useInputsReducer } from '../../hooks/inputsReducer';
import { FText } from '../../FText';

export default function Register() {
  const createUser = trpc.user.create.useMutation({
    async onSuccess(data) {
      console.log(data);

      await AsyncStorage.setItem("token", data)
    }
  })

  const [inputs, setInputs] = useInputsReducer()

  const sendRegisterData = async () => {

    // createUser.mutate({
    //   email,
    //   name,
    //   password,
    //   surname
    // })
  }

  return (
    <View style={styles.form}>
      {renderInput({
        setInputs,
        inputs,
        parser: 
          z.string({})
          .min(2, { message: "Le nom doit faire minimum 2 caractère" }),
        state: "name",
        placeholder: "Nom",
        maxLength: 18
      })}
      {showError(inputs.name)}

      {renderInput({
        setInputs,
        inputs,
        parser: z.string()
          .min(2, { message: "Le prénom doit faire minimum 2 caractère" }),
        state: "surname",
        placeholder: "Prénom",
        maxLength: 64
      })}
      {showError(inputs.surname)}

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
        parser: z.string()
          .min(8, { message: "Le mot de passe doit faire minimum 8 caractère" }),
        state: "password",
        placeholder: "Mot de passe",
        maxLength: 64,
        secureTextEntry: true,
      })}
      {showError(inputs.password)}

      {renderInput({
        setInputs,
        inputs,
        parser: z.string()
          .refine((val) => val === inputs.password.input, { message: "Les mots de passe ne correspondent pas" }),
        state: "passwordConfirm",
        placeholder: "Confirmer votre mot de passe",
        maxLength: 64,
        secureTextEntry: true,
      })}
      {showError(inputs.passwordConfirm)}

      <Pressable style={styles.button} onPress={() => sendRegisterData()}>
        <FText $color='white' $size={16}>S'enregistrer</FText>
      </Pressable>

      <View style={styles.container__waccount}>
        <Text>
          Vous avez déja un compte ?
          <Pressable onPress={() => sendRegisterData()}>
            <Text style={styles.button__waccount}>Se connecter</Text>
          </Pressable>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 15,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '80%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    backgroundColor: "#575BFD",
    borderRadius: 8,
  },
  container__waccount: {
    backgroundColor: '#F0F0F5',
    position: 'absolute',
    bottom: 0,
    paddingBottom: 25
  },
  button__waccount: {
    color: 'red',
    paddingLeft: 5
  }
});
