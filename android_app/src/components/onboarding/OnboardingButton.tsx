import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
} from 'react-native';

interface Props {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
}

export const OnboardingButton: React.FC<Props> = ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style,
}) => {
    const buttonStyle = [
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,
        (disabled || loading) && styles.disabledButton,
        style,
    ];

    const textStyle = [
        styles.text,
        variant === 'primary' && styles.primaryText,
        variant === 'secondary' && styles.secondaryText,
        variant === 'outline' && styles.outlineText,
        (disabled || loading) && styles.disabledText,
    ];

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? '#6200ee' : '#ffffff'} />
            ) : (
                <Text style={textStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    primaryButton: {
        backgroundColor: '#ffffff',
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    disabledButton: {
        opacity: 0.5,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryText: {
        color: '#6200ee',
    },
    secondaryText: {
        color: '#ffffff',
    },
    outlineText: {
        color: '#ffffff',
    },
    disabledText: {
        opacity: 0.7,
    },
});
