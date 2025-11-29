import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
    currentStep: number;
    totalSteps: number;
}

export const ProgressBar: React.FC<Props> = ({ currentStep, totalSteps }) => {
    const progress = ((currentStep + 1) / totalSteps) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.dots}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index <= currentStep && styles.dotActive,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 32,
    },
    track: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 12,
    },
    fill: {
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 2,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    dotActive: {
        backgroundColor: '#ffffff',
    },
});
