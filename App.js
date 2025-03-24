import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet,FlatList, Button, View, TextInput, Text } from 'react-native';

export default function App() {

  const [text, setText] = useState('')//gotta survive the rerendering, hook as a reigniting mechanism
  const [notes, setNotes] = useState([])

  function buttonHandler(){
    alert("you types:" + text)
    setNotes(
      [...notes, {key: notes.length, name: text}] // spread operator usage
    )
  }
  return (
    <View style={styles.container}>
      <TextInput style={styles.textInput} onChangeText={(txt) => setText(txt)}/>
      <Button title='Press me' onPress={buttonHandler}></Button>
      <FlatList
        data={notes}
        renderItem={(note) => <Text>{note.item.name}</Text>}
      />
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
    marginTop:200
  },
  textInput:{
    backgroundColor: 'lightblue',
    minWidth:200
  }
});
