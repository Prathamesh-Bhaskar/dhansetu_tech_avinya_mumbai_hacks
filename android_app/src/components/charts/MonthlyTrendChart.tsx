import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import * as SupabaseAPI from '../../services/SupabaseAPI';

interface MonthlyData {
    month: string;
    total: number;
}

interface Props {
    data?: MonthlyData[]; // Optional, not used anymore
}

export const MonthlyTrendChart: React.FC<Props> = () => {
    const screenWidth = Dimensions.get('window').width;
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [yearData, setYearData] = useState<{ label: string; amount: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);

    // Month names for labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Fetch data for selected year
    useEffect(() => {
        const fetchYearData = async () => {
            try {
                setLoading(true);
                console.log('[MonthlyChart] Fetching data for year:', selectedYear);

                // Fetch all 12 months for the selected year
                const data = await SupabaseAPI.getMonthlyTrend(selectedYear);

                console.log('[MonthlyChart] Received data:', data);

                // Transform to chart format
                const chartData = monthNames.map((name, index) => {
                    const monthKey = `${selectedYear}-${(index + 1).toString().padStart(2, '0')}`;
                    const monthData = data.find(d => d.month === monthKey);
                    const amount = monthData?.total || 0;

                    console.log(`[MonthlyChart] ${name} (${monthKey}): ₹${amount}`);

                    return {
                        label: name,
                        amount,
                    };
                });

                setYearData(chartData);

                // Extract available years from data
                const years = new Set(data.filter(d => d.total > 0).map(d => parseInt(d.month.substring(0, 4))));
                if (years.size > 0) {
                    setAvailableYears(Array.from(years).sort((a, b) => b - a));
                } else {
                    // If no data for any year, ensure current year is an option
                    setAvailableYears([currentYear]);
                }
            } catch (error) {
                console.error('[MonthlyChart] Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchYearData();
    }, [selectedYear]); // Only re-fetch when year changes

    const chartData = {
        labels: yearData.map(m => m.label),
        datasets: [{
            data: yearData.length > 0 ? yearData.map(m => m.amount) : [0],
        }],
    };

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(117, 117, 117, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: '#e0e0e0',
            strokeWidth: 1,
        },
    };

    // Calculate chart width for 12 months
    const chartWidth = Math.max(screenWidth - 64, 12 * 60);

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Monthly Spending Trend</Text>
                </View>
                <ActivityIndicator size="large" color="#6200ee" style={{ marginVertical: 40 }} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Monthly Spending Trend</Text>

                {/* Year Selector */}
                <View style={styles.yearSelector}>
                    {availableYears.map(year => (
                        <TouchableOpacity
                            key={year}
                            style={[
                                styles.yearButton,
                                selectedYear === year && styles.yearButtonActive
                            ]}
                            onPress={() => setSelectedYear(year)}
                        >
                            <Text style={[
                                styles.yearButtonText,
                                selectedYear === year && styles.yearButtonTextActive
                            ]}>
                                {year}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                    data={chartData}
                    width={chartWidth}
                    height={220}
                    yAxisLabel="₹"
                    yAxisSuffix=""
                    chartConfig={chartConfig}
                    style={styles.chart}
                    showValuesOnTopOfBars
                    fromZero
                />
            </ScrollView>
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
    header: {
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 8,
    },
    yearSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    yearButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    yearButtonActive: {
        backgroundColor: '#6200ee',
        borderColor: '#6200ee',
    },
    yearButtonText: {
        fontSize: 14,
        color: '#757575',
        fontWeight: '500',
    },
    yearButtonTextActive: {
        color: '#ffffff',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
});
