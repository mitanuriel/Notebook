import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
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
        key: Date.now().toString(), // unique key
        name: text,                // the text itself
      };
      const updatedList = [...notes, newNote];
      setNotes(updatedList);
      storeData(updatedList); // persist to AsyncStorage
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
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <Pressable onPress={() => goToDetailPage(item)}>
            <View style={styles.noteItem}>
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
      // Request permission for location access
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      console.log('Location fetched:', location.coords); 
      
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const handleLongPress = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    const newMarker = {
      id: Date.now().toString(), // unique ID
      coordinate,
      title: "Cool Place",
    };
    setMarkers([...markers, newMarker]);
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
  
  map: {
    flex: 1,
    width: '100%',
  },
});
