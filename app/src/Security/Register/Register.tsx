import { trpc } from '../../../utils/trpc';
import { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import z from "zod"

export default function Register() {
  const createUser = trpc.user.create.useMutation({
    async onSuccess(data) {
      console.log(data);

      await AsyncStorage.setItem("token", data)
    }
  })

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    passwordConfirm: "",
    passwordDontMatch: "",
  })

  const sendRegisterData = async () => {
    let errors: [string, z.SafeParseReturnType<string, string>][] = []

    errors.push([
      "name",
      z.string({})
      .min(2, { message: "Le nom doit faire minimum 2 caractère" })
      .safeParse(name)
    ])

    errors.push([
      "surname",
      z.string()
      .min(2, { message: "Le prénom doit faire minimum 2 caractère" })
      .safeParse(surname)
    ])

    errors.push([
      "password",
      z.string()
      .min(8, { message: "Le mot de passe doit faire minimum 8 caractère" })
      .safeParse(password)
    ])

    errors.push([
      "passwordConfirm",
      z.string()
      .min(8, { message: "Le mot de passe doit faire minimum 8 caractère" })
      .safeParse(passwordConfirm)
    ])

    errors.push([
      "passwordDontMatch",
      z.string()
      .refine((arg) => arg[0] === arg[1], { message: "Les mots de passe ne correspondent pas" })
      .safeParse([password, passwordConfirm])
    ])

    errors.push([
      "email",
      z.string()
      .email({ message: "L'email n'est pas correct" })
      .safeParse(email)
    ])
console.log(errors);

    if (!errors.every((x) => x[1].success)) {
      setErrorMessage(() => ({
        name: "",
        surname: "",
        email: "",
        password: "",
        passwordConfirm: "",
        passwordDontMatch: "",
      }))

      for (const error of errors) {
        if (error[1]?.success) continue

        setErrorMessage((val) => {
          return {
            ...val,
            [error[0]]: (error[1] as any).error.issues[0].message,
          }
        })
      }
      
      return
    }

    createUser.mutate({
      email,
      name,
      password,
      surname
    })
  }

  return (
    <View style={styles.form}>
      <Text style={styles.form__title}>S'enregistrer</Text>
      <TextInput
        style={styles.input}
        onChangeText={setName}
        value={name}
        placeholder={'Nom'}
        maxLength={18}
      />

      <Text>{errorMessage.name}</Text>

      <TextInput
        style={styles.input}
        onChangeText={setSurname}
        value={surname}
        placeholder={'Prénom'}
        maxLength={64}
      />

      <Text>{errorMessage.surname}</Text>

      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        inputMode='email'
        value={email}
        placeholder={'Adresse email'}
      />

      <Text>{errorMessage.email}</Text>

      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        secureTextEntry={true}
        placeholder={'Mot de passe'}
        maxLength={64}
      />

      <Text>{errorMessage.password}</Text>

      <TextInput
        style={styles.input}
        onChangeText={setPasswordConfirm}
        value={passwordConfirm}
        secureTextEntry={true}
        placeholder={'Confirmer votre mot de passe'}
      />

      <Text>{errorMessage.passwordConfirm}</Text>

      <Pressable style={styles.button} onPress={() => sendRegisterData()}>
        <Text>S'enregistrer</Text>
      </Pressable>

      <View style={styles.container__waccount}>
        <Text>Vous avez déja un compte ?<Pressable onPress={() => sendRegisterData()}><Text style={styles.button__waccount}>Se connecter</Text></Pressable>  </Text>
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

  form__title: {
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
