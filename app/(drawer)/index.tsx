import { StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { View } from 'react-native';

export default function DrawerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drawer Screen</Text>
      <Text style={styles.text}>This is a drawer screen example</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});
