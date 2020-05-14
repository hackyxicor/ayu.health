import React, { ReactChild } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { WHITE, SECONDARY_COLOR, PRIMARY_COLOR } from '../constants/color';

function Button({ children, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} style={{ backgroundColor: PRIMARY_COLOR, opacity: 0.8, flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 20 }} >
            <Text style={{ fontWeight: '500', color: WHITE, fontSize: 18 }} >
                {children}
            </Text>
        </TouchableOpacity>
    )
}

export default Button;