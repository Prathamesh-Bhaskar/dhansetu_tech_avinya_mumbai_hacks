import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import * as SupabaseAPI from '../../services/SupabaseAPI';

interface DailyData {
    date: string;
    total: number;
}

export const DailySpendingChart: React.FC = () => {
    const screenWidth = Dimensions.get('window').width;
    const [dailyData, setDailyData] = useState<{ label: string; amount: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDailyData = async () => {
            try {
                setLoading(true);
                console.log('[DailyChart] Fetching last 30 days data');

                // Fetch daily spending for last 30 days
                const data = await SupabaseAPI.getDailySpending(30);

                console.log('[DailyChart] Received data:', data);

                // Transform to chart format - show every 5th day to avoid crowding
                const chartData = data.map((item, index) => {
                    const date = new Date(item.date);
                    const label = index % 5 === 0 ? `${date.getDate()}/${date.getMonth() + 1}` : '';

                    return {
                        label,
                        amount: item.total,
                    };
                });

                setDailyData(chartData);
            } catch (error) {
                console.error('[DailyChart] Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDailyData();
    }, []);

    const chartData = {
        labels: dailyData.map(d => d.label),
        datasets: [{
            data: dailyData.length > 0 ? dailyData.map(d => d.amount) : [0],
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
        propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#6200ee',
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: '#e0e0e0',
            strokeWidth: 1,
        },
    };

    // Calculate chart width for 30 days
    const chartWidth = Math.max(screenWidth - 64, 30 * 25);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Daily Spending (Last 30 Days)</Text>
                <ActivityIndicator size="large" color="#6200ee" style={{ marginVertical: 40 }} />
            </View>
        );
    }

    if (dailyData.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Daily Spending (Last 30 Days)</Text>
                <Text style={styles.emptyText}>No spending data for the last 30 days</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Daily Spending (Last 30 Days)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                    data={chartData}
                    width={chartWidth}
                    height={220}
                    yAxisLabel="₹"
                    yAxisSuffix=""
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
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
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 12,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        paddingVertical: 40,
    },
});
