import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { parseSMS, TEST_SMS_SAMPLES, ParsedSMS } from '../utils/smsParser';

const SMSParserTest: React.FC = () => {
    const [inputSMS, setInputSMS] = useState('');
    const [inputSender, setInputSender] = useState('HDFCBK');
    const [parsedResult, setParsedResult] = useState<ParsedSMS | null>(null);

    const handleParse = () => {
        if (!inputSMS.trim()) {
            return;
        }

        const result = parseSMS(inputSMS, inputSender, Date.now());
        setParsedResult(result);
    };

    const loadTestCase = (sms: string, sender: string) => {
        setInputSMS(sms);
        setInputSender(sender);
        setParsedResult(null);
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return '#4CAF50'; // Green
        if (confidence >= 0.6) return '#FF9800'; // Orange
        return '#F44336'; // Red
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🧪 SMS Parser Testing</Text>
                <Text style={styles.headerSubtitle}>
                    Test regex patterns and validate JSON output
                </Text>
            </View>

            {/* Input Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Input SMS</Text>

                <Text style={styles.label}>Sender ID:</Text>
                <TextInput
                    style={styles.input}
                    value={inputSender}
                    onChangeText={setInputSender}
                    placeholder="e.g., HDFCBK, SBIINB"
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>SMS Message:</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={inputSMS}
                    onChangeText={setInputSMS}
                    placeholder="Paste SMS message here..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity style={styles.parseButton} onPress={handleParse}>
                    <Text style={styles.parseButtonText}>🔍 Parse SMS</Text>
                </TouchableOpacity>
            </View>

            {/* Test Cases Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Test Cases</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {TEST_SMS_SAMPLES.map((sample, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.testCaseButton}
                            onPress={() => loadTestCase(sample.sms, sample.sender)}>
                            <Text style={styles.testCaseButtonText}>{sample.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Results Section */}
            {parsedResult && (
                <View style={styles.section}>
                    <View style={styles.resultHeader}>
                        <Text style={styles.sectionTitle}>Parsed Result</Text>
                        <View
                            style={[
                                styles.confidenceBadge,
                                {
                                    backgroundColor: getConfidenceColor(
                                        parsedResult.metadata.confidence,
                                    ),
                                },
                            ]}>
                            <Text style={styles.confidenceText}>
                                {Math.round(parsedResult.metadata.confidence * 100)}% confidence
                            </Text>
                        </View>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: parsedResult.metadata.parseSuccess
                                    ? '#E8F5E9'
                                    : '#FFEBEE',
                            },
                        ]}>
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color: parsedResult.metadata.parseSuccess
                                        ? '#4CAF50'
                                        : '#F44336',
                                },
                            ]}>
                            {parsedResult.metadata.parseSuccess
                                ? '✅ Parse Successful'
                                : '❌ Parse Failed'}
                        </Text>
                        {parsedResult.metadata.needsReview && (
                            <Text style={styles.reviewText}>⚠️ Needs Manual Review</Text>
                        )}
                    </View>

                    {/* JSON Output */}
                    <View style={styles.jsonContainer}>
                        <Text style={styles.jsonLabel}>JSON Output:</Text>
                        <ScrollView style={styles.jsonScroll}>
                            <Text style={styles.jsonText}>
                                {JSON.stringify(parsedResult, null, 2)}
                            </Text>
                        </ScrollView>
                    </View>

                    {/* Quick Summary */}
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryTitle}>Quick Summary:</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Category:</Text>
                            <Text style={styles.summaryValue}>
                                {parsedResult.parsed.category}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Provider:</Text>
                            <Text style={styles.summaryValue}>
                                {parsedResult.parsed.provider}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Type:</Text>
                            <Text style={styles.summaryValue}>
                                {parsedResult.parsed.transaction.type}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Amount:</Text>
                            <Text style={[styles.summaryValue, styles.amountText]}>
                                ₹{parsedResult.parsed.transaction.amount.toFixed(2)}
                            </Text>
                        </View>
                        {parsedResult.parsed.accountNumber && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Account:</Text>
                                <Text style={styles.summaryValue}>
                                    XX{parsedResult.parsed.accountNumber}
                                </Text>
                            </View>
                        )}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Date:</Text>
                            <Text style={styles.summaryValue}>
                                {parsedResult.parsed.transaction.date}
                            </Text>
                        </View>
                        {parsedResult.parsed.balance && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Balance:</Text>
                                <Text style={styles.summaryValue}>
                                    ₹{parsedResult.parsed.balance.available.toFixed(2)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#6200ee',
        padding: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#e0e0e0',
    },
    section: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#424242',
        marginBottom: 6,
        marginTop: 8,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#212121',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    parseButton: {
        backgroundColor: '#6200ee',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    parseButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    testCaseButton: {
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        padding: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#2196F3',
    },
    testCaseButtonText: {
        color: '#1976D2',
        fontSize: 13,
        fontWeight: '500',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    confidenceBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    confidenceText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadge: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    reviewText: {
        fontSize: 13,
        color: '#FF9800',
        marginTop: 4,
    },
    jsonContainer: {
        marginTop: 8,
    },
    jsonLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#424242',
        marginBottom: 8,
    },
    jsonScroll: {
        backgroundColor: '#263238',
        borderRadius: 8,
        padding: 12,
        maxHeight: 300,
    },
    jsonText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#4CAF50',
        lineHeight: 18,
    },
    summaryContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#757575',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 14,
        color: '#212121',
        fontWeight: '600',
    },
    amountText: {
        color: '#6200ee',
        fontSize: 16,
    },
});

export default SMSParserTest;
