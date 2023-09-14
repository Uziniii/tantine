import { trpc } from '../../../utils/trpc';
import { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Text } from 'react-native';

export default function Register() {
  const createUser = trpc.user.create.useMutation()

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const sendLoginData = () => {
    console.log('login');
  }

  return (
    <View style={styles.form}>
      <Text style={styles.form__title}>S'enregistrer</Text>
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        inputMode='email'
        value={email}
        placeholder={'Adresse email'}
      />

      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        secureTextEntry={true}
        placeholder={'Mot de passe'}
      />

      <Pressable style={styles.button} onPress={() => sendLoginData()}>
        <Text>Se connecter</Text>
      </Pressable>

      <View style={styles.container__waccount}>
        <Text>Vous n'avez pas de compte ?<Pressable onPress={() => sendLoginData()}><Text style={styles.button__waccount}>S'enregistrer</Text></Pressable>  </Text>
      </View>
    </View>
  );
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
