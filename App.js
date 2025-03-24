import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, FlatList, Button, View, TextInput, Text, Pressable } from 'react-native';

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Notebook'>
        <Stack.Screen
          name='Notebook'
          component={NotebookPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="DetailPage" component={DetailPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const NotebookPage = ({ navigation, route }) => {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // 1. Load from AsyncStorage
  async function loadData() {
    try {
      const jsonValue = await AsyncStorage.getItem('myList');
      if (jsonValue != null) {
        setNotes(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.log("Error loading data: ", e);
    }
  }

  // 2. Save to AsyncStorage
  async function storeData(updatedList) {
    try {
      const jsonValue = JSON.stringify(updatedList);
      await AsyncStorage.setItem('myList', jsonValue);
    } catch (e) {
      console.log("Error saving data: ", e);
    }
  }

  // 3. Add a note as an object
  function addNote() {
    if (text.trim()) {
      const newNote = {
        key: Date.now().toString(), // unique key
        name: text,                // the text itself
      };
      const updatedList = [...notes, newNote];
      setNotes(updatedList);
      storeData(updatedList); // persist to AsyncStorage
      setText('');
    }
  }

  // (Optional) If you want to show only the first 25 chars
  function truncate(noteText) {
    return noteText.length > 25 ? noteText.substring(0, 25) + '...' : noteText;
  }

  // Go to detail page with the full note object
  function goToDetailPage(noteItem) {
    navigation.navigate('DetailPage', { note: noteItem });
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
        // Use item.key as the unique key
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          // 4. Render only item.name in Text, not the entire item object
          <Pressable onPress={() => goToDetailPage(item)}>
            <View style={styles.noteItem}>
              <Text style={styles.noteText}>
                {truncate(item.name)}
              </Text>
            </View>
          </Pressable>
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
};

// Example DetailPage that shows full note text, lets you edit, and saves back
const DetailPage = ({ navigation, route }) => {
  const { note } = route.params;
  const [detailText, setDetailText] = useState(note.name);

  async function saveNote() {
    try {
      // Load current notes
      const jsonValue = await AsyncStorage.getItem('myList');
      const notesArray = jsonValue ? JSON.parse(jsonValue) : [];
      // Find and update the note
      const index = notesArray.findIndex((item) => item.key === note.key);
      if (index !== -1) {
        notesArray[index].name = detailText;
      }
      // Save back
      await AsyncStorage.setItem('myList', JSON.stringify(notesArray));
      navigation.goBack();
    } catch (e) {
      console.log("Error saving note: ", e);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Note</Text>
      <TextInput
        style={[styles.textInput, { height: 100 }]}
        value={detailText}
        onChangeText={setDetailText}
        multiline
      />
      <Button title="GEM" onPress={saveNote} />
    </View>
  );
};

// Keep your existing styles, or tweak as needed
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
    minWidth: 200,
  },
  notesList: {
    marginTop: 10,
    width: '100%',
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
