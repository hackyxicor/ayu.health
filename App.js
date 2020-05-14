import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import 'react-native-gesture-handler';
import Navigation from './src/index.navigation';

export default function App() {
    return (
        <SafeAreaView style={styles.container}>
            <Navigation />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});