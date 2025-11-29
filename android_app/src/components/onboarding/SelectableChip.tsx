import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
    label: string;
    selected: boolean;
    onPress: () => void;
    icon?: string;
}

export const SelectableChip: React.FC<Props> = ({
    label,
    selected,
    onPress,
    icon,
}) => {
    return (
        <TouchableOpacity
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={[styles.label, selected && styles.labelSelected]}>
                {label}
            </Text>
            {selected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    chipSelected: {
        backgroundColor: '#ffffff',
        borderColor: '#ffffff',
    },
    icon: {
        fontSize: 18,
        marginRight: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#ffffff',
    },
    labelSelected: {
        color: '#6200ee',
    },
    checkmark: {
        fontSize: 16,
        color: '#6200ee',
        marginLeft: 6,
        fontWeight: 'bold',
    },
});
