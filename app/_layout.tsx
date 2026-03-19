import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack 
  screenOptions={{
    headerStyle: {backgroundColor: '#126900'},
    headerTitleStyle: {fontWeight:'bold', color: '#fff'},
  }}>
    <Stack.Screen name="(tabs)" options={{headerShown: false}} />
  </Stack>;
}
