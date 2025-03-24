import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet,FlatList, Button, View, TextInput, Text } from 'react-native';

export default function App() {


  const Stack = createNativeStackNavigator() // Stack navigator that lets to navigate from page to page
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Notebook'>
        <Stack.Screen
        name='Notebook'
        component={NotebookPage}
        options={{ headerShown: false }}
        />
    
      </Stack.Navigator>
    </NavigationContainer>

  );
}

const NotebookPage = ({navigation, route}) => {

  const [text, setText] = useState('')//gotta survive the rerendering, hook as a reigniting mechanism
  const [notes, setNotes] = useState([])

  function addNote() {
    if (text.trim()) { 
      setNotes([...notes, text]); 
      setText(''); 
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notebook</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type your note here..."
        style={styles.textInput}
      />

      <Button title="Add Note" onPress={addNote} />

  
      <FlatList
        style={styles.notesList}
        data={notes}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteText}>{item}</Text>
          </View>
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: 'lightblue',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  notesList: {
    marginTop: 10,
  },
  noteItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noteText: {
    fontSize: 16,
  },
});
