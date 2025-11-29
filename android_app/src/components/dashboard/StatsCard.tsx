import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsCardProps {
    title: string;
    value: string;
    change?: number; // Percentage change
    trend?: 'up' | 'down' | 'neutral';
    subtitle?: string;
    color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    change,
    trend,
    subtitle,
    color = '#6200ee',
}) => {
    const getTrendIcon = () => {
        if (!trend) return null;
        switch (trend) {
            case 'up':
                return '↑';
            case 'down':
                return '↓';
            case 'neutral':
                return '→';
        }
    };

    const getTrendColor = () => {
        if (!trend) return '#757575';
        switch (trend) {
            case 'up':
                return '#f44336'; // Red for increased spending (bad)
            case 'down':
                return '#4caf50'; // Green for decreased spending (good)
            case 'neutral':
                return '#757575'; // Gray for no change
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {change !== undefined && (
                    <View style={[styles.changeBadge, { backgroundColor: getTrendColor() + '20' }]}>
                        <Text style={[styles.changeText, { color: getTrendColor() }]}>
                            {getTrendIcon()} {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </Text>
                    </View>
                )}
            </View>

            <Text style={[styles.value, { color }]}>{value}</Text>

            {subtitle && (
                <Text style={styles.subtitle}>{subtitle}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 13,
        color: '#757575',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    changeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    changeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#9e9e9e',
    },
});
