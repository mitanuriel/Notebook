import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

  function handleButton(item){
    navigation.navigate('DetailPage', {message:item})
  }

  return (
    <View>
      <Text>
        Hej
      </Text>
      <FlatList
      data={myList}
      renderItem={(note) => <Button title={note.item.name} onPress={() =>handleButton(note.item)} />}
      />
    </View>
  )
}

const DetailPage = ({navigation, route}) => {
  const message = route.params?.message
  return (
    <View>
      <Text>
        Details ... {message.name}
      </Text>
    </View>
  )
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
