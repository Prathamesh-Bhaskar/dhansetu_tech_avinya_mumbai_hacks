import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { ParsedSMS } from '../utils/smsParser';

interface TransactionNotificationProps {
    transaction: ParsedSMS;
    onLooksGood: () => void;
    onAddDetails: () => void;
    onDismiss: () => void;
}

const TransactionNotification: React.FC<TransactionNotificationProps> = ({
    transaction,
    onLooksGood,
    onAddDetails,
    onDismiss,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        // Slide in and fade in
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 65,
                friction: 11,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto-dismiss after 5 seconds
        const timer = setTimeout(() => {
            handleDismiss();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss();
        });
    };

    const { parsed, metadata } = transaction;
    const requiresInput = metadata.requiresUserInput;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.icon}>💰</Text>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>New Transaction</Text>
                        <Text style={styles.subtitle}>
                            ₹{parsed.transaction.amount.toFixed(2)} {parsed.transaction.type} • {parsed.provider}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
                        <Text style={styles.closeIcon}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    {requiresInput ? (
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={onAddDetails}>
                            <Text style={styles.primaryButtonText}>✏️ Add details</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton]}
                                onPress={onAddDetails}>
                                <Text style={styles.secondaryButtonText}>✏️ Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.primaryButton]}
                                onPress={onLooksGood}>
                                <Text style={styles.primaryButtonText}>✓ Looks good</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        zIndex: 1000,
    },
    content: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#6200ee',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        fontSize: 32,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        color: '#757575',
    },
    closeButton: {
        padding: 4,
    },
    closeIcon: {
        fontSize: 18,
        color: '#9e9e9e',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#6200ee',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    secondaryButtonText: {
        color: '#424242',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default TransactionNotification;
