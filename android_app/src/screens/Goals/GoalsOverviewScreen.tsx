import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { PersonalGoalsScreen } from './PersonalGoalsScreen';
import { FamilyGoalsScreen } from './FamilyGoalsScreen';

interface Props {
    navigation: any;
}

export const GoalsOverviewScreen: React.FC<Props> = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState<'personal' | 'family'>('personal');

    return (
        <View style={styles.container}>
            {/* Tab Selector */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'personal' && styles.tabActive]}
                    onPress={() => setActiveTab('personal')}
                >
                    <Text style={[styles.tabText, activeTab === 'personal' && styles.tabTextActive]}>
                        🎯 Personal
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'family' && styles.tabActive]}
                    onPress={() => setActiveTab('family')}
                >
                    <Text style={[styles.tabText, activeTab === 'family' && styles.tabTextActive]}>
                        👨‍👩‍👧‍👦 Family
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {activeTab === 'personal' ? (
                    <PersonalGoalsScreen navigation={navigation} />
                ) : (
                    <FamilyGoalsScreen navigation={navigation} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#6200ee',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#757575',
    },
    tabTextActive: {
        color: '#6200ee',
    },
    content: {
        flex: 1,
    },
});
