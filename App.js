import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, FlatList, Button, View, TextInput, Text, Pressable } from 'react-native';

import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

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
        <Stack.Screen name="MapScreen" component={MapScreen} options={{ title: 'Map' }} />
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

  async function storeData(updatedList) {
    try {
      const jsonValue = JSON.stringify(updatedList);
      await AsyncStorage.setItem('myList', jsonValue);
    } catch (e) {
      console.log("Error saving data: ", e);
    }
  }

  function addNote() {
    if (text.trim()) {
      const newNote = {
        key: Date.now().toString(),
        name: text,
      };
      const updatedList = [...notes, newNote];
      setNotes(updatedList);
      storeData(updatedList);
      setText('');
    }
  }

  function truncate(noteText) {
    return noteText.length > 25 ? noteText.substring(0, 25) + '...' : noteText;
  }

  function goToDetailPage(noteItem) {
    navigation.navigate('DetailPage', { note: noteItem });
  }

  return (
    <View style={styles.stylishContainer}>
      <Text style={styles.stylishHeading}>Notebook</Text>

      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type your note here..."
          placeholderTextColor="#ccc"
          style={styles.stylishTextInput}
        />
        <Button title="Add Note" onPress={addNote} color="#4CAF50" />
      </View>

      <FlatList
        style={styles.notesList}
        data={notes}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <Pressable onPress={() => goToDetailPage(item)}>
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                {truncate(item.name)}
              </Text>
            </View>
          </Pressable>
        )}
      />

      <Button title="Show Map" onPress={() => navigation.navigate('MapScreen')} />
      <StatusBar style="auto" />
    </View>
  );
};

const DetailPage = ({ navigation, route }) => {
  const { note } = route.params;
  const [detailText, setDetailText] = useState(note.name);

  async function saveNote() {
    try {
      const jsonValue = await AsyncStorage.getItem('myList');
      const notesArray = jsonValue ? JSON.parse(jsonValue) : [];
      const index = notesArray.findIndex((item) => item.key === note.key);
      if (index !== -1) {
        notesArray[index].name = detailText;
      }
      await AsyncStorage.setItem('myList', JSON.stringify(notesArray));
      navigation.goBack();
    } catch (e) {
      console.log("Error saving note: ", e);
    }
  }

  async function deleteNote() {
    try {
      const jsonValue = await AsyncStorage.getItem('myList');
      let notesArray = jsonValue ? JSON.parse(jsonValue) : [];

     
      notesArray = notesArray.filter((item) => item.key !== note.key);

     
      await AsyncStorage.setItem('myList', JSON.stringify(notesArray));

      
      navigation.goBack();
    } catch (error) {
      console.log("Error deleting note:", error);
    }
  }

  return (
    <View style={styles.detailContainer}>
      <Text style={styles.detailHeading}>Edit Note</Text>

     
      <TextInput
        style={styles.detailTextInput}
        value={detailText}
        onChangeText={setDetailText}
        multiline
        placeholder="Edit your note..."
        placeholderTextColor="#ccc"
      />

      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <View style={{ marginRight: 10 }}>
          <Button title="SAVE" onPress={saveNote} />
        </View>
        <Button title="DELETE" onPress={deleteNote} color="red" />
      </View>
    </View>
  );
};

const MapScreen = () => {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    (async () => {
     
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
      } else {
        let location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }

      
      const querySnapshot = await getDocs(collection(db, "markers"));
      let loadedMarkers = [];
      querySnapshot.forEach((doc) => {
        loadedMarkers.push({
          id: doc.id,
          coordinate: {
            latitude: doc.data().coordinate.latitude,
            longitude: doc.data().coordinate.longitude,
          },
          title: doc.data().title,
        });
      });
      setMarkers(loadedMarkers);
    })();
  }, []);

  const handleLongPress = async (event) => {
    const coordinate = event.nativeEvent.coordinate;
    const newMarker = {
      coordinate,
      title: "Cool Place",
    };

  
    try {
      const docRef = await addDoc(collection(db, "markers"), {
        coordinate,
        title: "Cool Place",
        createdAt: new Date(),
      });
      console.log("Marker saved with ID: ", docRef.id);

     
      setMarkers([...markers, { ...newMarker, id: docRef.id }]);
    } catch (e) {
      console.error("Error adding marker: ", e);
    }
  };

  return (
    <MapView
      style={styles.map}
      region={region}
      onLongPress={handleLongPress}
    >
      
      <Marker
        coordinate={{ latitude: region.latitude, longitude: region.longitude }}
        title="You are here"
      />
     
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          title={marker.title}
        />
      ))}
    </MapView>
  );
};

// UPDATED STYLES
const styles = StyleSheet.create({
  stylishContainer: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 20,
  },
  stylishHeading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stylishTextInput: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#555',
    marginRight: 10,
  },
  notesList: {
    marginTop: 10,
  },
  noteCard: {
    backgroundColor: '#333',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  noteText: {
    fontSize: 18,
    color: '#fff',
  },

 
  detailContainer: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 20,
    alignItems: 'center', 
    justifyContent: 'flex-start',
  },
  detailHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  detailTextInput: {
    width: '100%',
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#555',
    padding: 10,
    textAlignVertical: 'top', 
  },

  
  map: {
    flex: 1,
    width: '100%',
  },
});
