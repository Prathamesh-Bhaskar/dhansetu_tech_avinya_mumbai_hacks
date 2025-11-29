import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { TRANSACTION_CATEGORIES } from '../../../utils/categories';

export type DatePreset = 'thisMonth' | 'lastMonth' | 'last3Months' | 'all';

interface FilterBarProps {
    selectedPreset: DatePreset;
    onPresetChange: (preset: DatePreset) => void;
    selectedCategory?: string;
    onCategoryChange: (category: string) => void;
}

// Build categories list from actual category data
const CATEGORIES = [
    { id: 'all', name: 'All', icon: '📊' },
    ...TRANSACTION_CATEGORIES.map(cat => ({ id: cat.id, name: cat.name, icon: cat.icon }))
];

export const FilterBar: React.FC<FilterBarProps> = ({
    selectedPreset,
    onPresetChange,
    selectedCategory = 'all',
    onCategoryChange,
}) => {
    const [showCategories, setShowCategories] = useState(false);

    const presets: { key: DatePreset; label: string }[] = [
        { key: 'thisMonth', label: 'This Month' },
        { key: 'lastMonth', label: 'Last Month' },
        { key: 'last3Months', label: 'Last 3M' },
        { key: 'all', label: 'All Time' },
    ];

    const selectedCategoryData = CATEGORIES.find(cat => cat.id === selectedCategory);

    return (
        <View style={styles.container}>
            {/* Date Presets */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
                {presets.map((preset) => (
                    <TouchableOpacity
                        key={preset.key}
                        style={[
                            styles.presetButton,
                            selectedPreset === preset.key && styles.presetButtonActive,
                        ]}
                        onPress={() => onPresetChange(preset.key)}
                    >
                        <Text
                            style={[
                                styles.presetText,
                                selectedPreset === preset.key && styles.presetTextActive,
                            ]}
                        >
                            {preset.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Category Filter */}
            <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setShowCategories(!showCategories)}
            >
                <Text style={styles.categoryButtonText}>
                    {selectedCategoryData?.icon} {selectedCategoryData?.name}
                </Text>
            </TouchableOpacity>

            {/* Category Dropdown */}
            {showCategories && (
                <View style={styles.categoryDropdown}>
                    {CATEGORIES.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryItem,
                                selectedCategory === category.id && styles.categoryItemActive,
                            ]}
                            onPress={() => {
                                onCategoryChange(category.id);
                                setShowCategories(false);
                            }}
                        >
                            <Text
                                style={[
                                    styles.categoryItemText,
                                    selectedCategory === category.id && styles.categoryItemTextActive,
                                ]}
                            >
                                {category.icon} {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    presetsScroll: {
        marginBottom: 8,
    },
    presetButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    presetButtonActive: {
        backgroundColor: '#6200ee',
        borderColor: '#6200ee',
    },
    presetText: {
        fontSize: 14,
        color: '#757575',
        fontWeight: '500',
    },
    presetTextActive: {
        color: '#ffffff',
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    categoryButtonText: {
        fontSize: 14,
        color: '#212121',
        fontWeight: '500',
    },
    categoryDropdown: {
        position: 'absolute',
        top: 90,
        left: 16,
        right: 16,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 1000,
    },
    categoryItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    categoryItemActive: {
        backgroundColor: '#f3e5f5',
    },
    categoryItemText: {
        fontSize: 14,
        color: '#212121',
    },
    categoryItemTextActive: {
        color: '#6200ee',
        fontWeight: 'bold',
    },
});
