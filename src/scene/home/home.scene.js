import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Button from '../../component/button.component';

function HomeScene({ navigation }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
            <View style={{ width: 200, height: 50, margin: 20 }} >
                <Button
                    onPress={() => {
                        navigation.navigate("Appointments")
                    }}
                >
                    Doctor Login
            </Button>
            </View>

            <View style={{ width: 200, height: 50, margin: 20 }} >
                <Button
                    onPress={() => {
                        navigation.navigate("Conference", {
                            userId: "patient"
                        })
                    }}
                >
                    Patient Login
            </Button>
            </View>
        </View>
    )
}

export default HomeScene;