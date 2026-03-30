import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A1A',
          borderTopColor: 'rgba(42, 42, 80, 0.5)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#00F0FF',
        tabBarInactiveTintColor: '#555577',
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: 'bold' as const,
          letterSpacing: 1,
        },
      }}
    >
      <Tabs.Screen
        name="ranking"
        options={{
          title: 'RANKING',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && (
                <View style={{
                  position: 'absolute', top: -8, width: 32, height: 2,
                  backgroundColor: '#00F0FF', borderRadius: 1,
                  shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6, shadowRadius: 4, elevation: 4,
                }} />
              )}
              <Text style={{ fontSize: 20, color }}>🏆</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && (
                <View style={{
                  position: 'absolute', top: -8, width: 32, height: 2,
                  backgroundColor: '#00F0FF', borderRadius: 1,
                  shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6, shadowRadius: 4, elevation: 4,
                }} />
              )}
              <Text style={{ fontSize: 20, color }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'HISTORY',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && (
                <View style={{
                  position: 'absolute', top: -8, width: 32, height: 2,
                  backgroundColor: '#00F0FF', borderRadius: 1,
                  shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6, shadowRadius: 4, elevation: 4,
                }} />
              )}
              <Text style={{ fontSize: 20, color }}>📊</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  )
}
