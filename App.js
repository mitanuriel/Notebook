import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet,FlatList, Button, View, TextInput, Text } from 'react-native';

export default function App() {


  const Stack = createNativeStackNavigator() // Stack navigator that lets to navigate from page to page
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='ListPage'>
        <Stack.Screen
        name='ListPage'
        component={ListPage}
        />
         <Stack.Screen
        name='DetailPage'
        component={DetailPage}
        />
      </Stack.Navigator>
    </NavigationContainer>

  );
}

const ListPage = ({navigation, route}) => {
  const myList = [{key: 1, name: "Anna"}, {key:2, name: "Harriet"}]

  const [text, setText] = useState('')//gotta survive the rerendering, hook as a reigniting mechanism
  const [notes, setNotes] = useState([])

  function addNote() {
    if (text.trim()) { 
      setNotes([...notes, text]); 
      setText(''); 
    }
  }


  function handleButton(item){
    navigation.navigate('DetailPage', {message: note})
  }
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Enter a note:</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Enter a note"
        style={styles.textInput}
      />
      <Button title="Add Note" onPress={addNote} />
      {/* Display each note and add a Details button */}
      {notes.map((note, index) => (
        <View key={index} style={{ marginVertical: 5 }}>
          <Text>{note}</Text>
          <Button title="Details" onPress={() => handleButton(note)} />
        </View>
      ))}
    </View>
  );
};

const DetailPage = ({navigation, route}) => {
  const message = route.params?.message
  return (
    <View style={styles.container}>
      {/* Updated to display the note directly */}
      <Text style={{ fontSize: 20 }}>Details ... {message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
  },
  textInput:{
    backgroundColor: 'lightblue',
    minWidth: 200,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  }
});
