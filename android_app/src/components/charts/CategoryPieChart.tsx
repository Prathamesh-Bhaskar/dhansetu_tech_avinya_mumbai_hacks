import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

interface CategoryData {
    category: string;
    total: number;
    percentage: number;
}

interface Props {
    data: CategoryData[];
}

const CATEGORY_COLORS = [
    '#FF6384', // Food
    '#36A2EB', // Transport
    '#FFCE56', // Shopping
    '#4BC0C0', // Bills
    '#9966FF', // Entertainment
    '#FF9F40', // Health
    '#E7E9ED', // Education
    '#C9CBCF', // Other
];

export const CategoryPieChart: React.FC<Props> = ({ data }) => {
    const screenWidth = Dimensions.get('window').width;

    if (data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No category data available</Text>
            </View>
        );
    }

    // Transform data for pie chart
    const chartData = data.map((item, index) => ({
        name: item.category,
        population: item.total,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        legendFontColor: '#757575',
        legendFontSize: 12,
    }));

    const chartConfig = {
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Spending by Category</Text>
            <PieChart
                data={chartData}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 8,
    },
    emptyContainer: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#757575',
    },
});
