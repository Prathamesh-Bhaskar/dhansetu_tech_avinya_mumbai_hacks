import React from 'react';
import { View, StyleSheet } from 'react-native';

export const StatsSkeleton: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <View style={styles.card} />
                <View style={styles.card} />
            </View>
            <View style={styles.row}>
                <View style={styles.card} />
                <View style={styles.card} />
            </View>
            <View style={styles.row}>
                <View style={styles.card} />
                <View style={styles.card} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    card: {
        flex: 1,
        height: 100,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        opacity: 0.6,
    },
});
