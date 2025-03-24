import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Button, View, TextInput } from 'react-native';

export default function App() {

  const [text, setText] = useState('')//gotta survive the rerendering, hook as a reigniting mechanism

  function buttonHandler(){
    alert("you types:" + text)
  }
  return (
    <View style={styles.container}>
      <TextInput onChangeText={(txt) => setText(txt)}/>
      <Button title='Press me' onPress={buttonHandler}></Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
