import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
    icon: string;
    title: string;
    insight: string;
    color?: string;
}

export const SpendingPatternCard: React.FC<Props> = ({
    icon,
    title,
    insight,
    color = '#6200ee',
}) => {
    return (
        <View style={[styles.card, { borderLeftColor: color }]}>
            <Text style={styles.icon}>{icon}</Text>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.insight}>{insight}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderLeftWidth: 4,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    icon: {
        fontSize: 32,
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    insight: {
        fontSize: 13,
        color: '#757575',
    },
});
