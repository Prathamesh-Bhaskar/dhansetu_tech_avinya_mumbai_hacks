import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  PermissionsAndroid,
  Platform,
  NativeModules,
  NativeEventEmitter,
  StatusBar,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { parseSMS, ParsedSMS } from './utils/smsParser';
import SMSParserTest from './components/SMSParserTest';
import TransactionNotification from './components/TransactionNotification';
import TransactionBottomSheet from './components/TransactionBottomSheet';
import { loadTransactions, addTransaction, updateTransaction, deleteTransaction } from './utils/storage';
import { useAuth } from './src/contexts/AuthContext';
import { useSupabaseSync } from './src/hooks/useSupabaseSync';
import { CategoryPicker } from './components/CategoryPicker';
import { useFamily } from './src/contexts/FamilyContext';
import { FamilyModal } from './components/FamilyModal';
// import NetInfo from '@react-native-community/netinfo';

const { SmsReceiverModule } = NativeModules;

interface SmsMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  parsedData?: ParsedSMS;
  savedToCloud?: boolean;
  saving?: boolean;
}

interface AppProps {
  navigation?: any;
}

function App({ navigation }: AppProps): React.JSX.Element {
  const [smsList, setSmsList] = useState<SmsMessage[]>([]);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showTestUI, setShowTestUI] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<ParsedSMS | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ParsedSMS | null>(null);
  const { signOut } = useAuth();
  const { saveToSupabase, syncing, offlineQueue } = useSupabaseSync();
  const { currentFamily } = useFamily();
  const familyId = currentFamily?.id;

  // Category picker state
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [transactionToSave, setTransactionToSave] = useState<SmsMessage | null>(null);

  // Family modal state
  const [showFamilyModal, setShowFamilyModal] = useState(false);

  // Network status
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    requestSmsPermissions();
    loadSavedTransactions();
    loadPendingSMS(); // Load SMS received when app was closed
  }, []);

  // Load saved transactions from AsyncStorage
  const loadSavedTransactions = async () => {
    const saved = await loadTransactions();
    if (saved.length > 0) {
      const smsMessages: SmsMessage[] = saved.map(parsed => ({
        id: parsed.id,
        sender: parsed.sender,
        message: parsed.rawSMS,
        timestamp: new Date(parsed.timestamp).getTime(),
        parsedData: parsed,
      }));
      setSmsList(smsMessages);
      console.log(`Loaded ${saved.length} transactions from storage`);
    }
  };

  // Load SMS that arrived when app was closed
  const loadPendingSMS = async () => {
    try {
      // Check if the native module is available
      if (!SmsReceiverModule || !SmsReceiverModule.getPendingSMS) {
        console.log('SmsReceiverModule not available - skipping pending SMS load');
        return;
      }

      const pendingSMSJson = await SmsReceiverModule.getPendingSMS();
      const pendingSMS = JSON.parse(pendingSMSJson);

      if (pendingSMS.length > 0) {
        console.log(`Loading ${pendingSMS.length} pending SMS from native storage`);

        for (const sms of pendingSMS) {
          const parsedData = parseSMS(sms.message, sms.sender, sms.timestamp);

          // Only process financial SMS
          if (parsedData.metadata.isFinancial) {
            const newSms: SmsMessage = {
              id: Date.now().toString() + Math.random(),
              sender: sms.sender,
              message: sms.message,
              timestamp: sms.timestamp,
              parsedData: parsedData,
            };

            // Add to list and save to AsyncStorage
            setSmsList(prevList => [newSms, ...prevList]);
            await addTransaction(parsedData);
          }
        }

        console.log('Pending SMS loaded and saved');
      }
    } catch (error) {
      console.error('Error loading pending SMS:', error);
    }
  };

  useEffect(() => {
    if (!permissionsGranted) return;

    // Check if the native module is available
    if (!SmsReceiverModule) {
      console.warn('SmsReceiverModule not available - SMS listening disabled');
      return;
    }

    // Set up event listener for incoming SMS
    const eventEmitter = new NativeEventEmitter(NativeModules.SmsReceiverModule);
    const subscription = eventEmitter.addListener('onSMSReceived', (sms) => {
      console.log('SMS Received:', sms);

      // Parse the SMS using regex parser
      const parsedData = parseSMS(sms.message, sms.sender, sms.timestamp);
      console.log('Parsed SMS:', parsedData);

      const newSms: SmsMessage = {
        id: Date.now().toString(),
        sender: sms.sender,
        message: sms.message,
        timestamp: sms.timestamp,
        parsedData: parsedData,
      };

      // Only add financial SMS to the list (filter out OTP, promotional, etc.)
      if (parsedData.metadata.isFinancial) {
        setSmsList(prevList => [newSms, ...prevList]);

        // Save to AsyncStorage
        addTransaction(parsedData);

        // Show notification based on confidence and missing fields
        if (parsedData.metadata.confidence >= 0.9 && !parsedData.metadata.requiresUserInput) {
          // High confidence, auto-save silently
          console.log('High confidence parse, auto-saved');
        } else {
          // Show notification for user review
          setCurrentTransaction(parsedData);
          setShowNotification(true);
        }
      } else {
        console.log('Non-financial SMS filtered out:', sms.sender, sms.message.substring(0, 50));
      }
    });

    return () => {
      subscription.remove();
    };
  }, [permissionsGranted]);

  const requestSmsPermissions = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Error', 'This app only works on Android');
      return;
    }

    try {
      if (Platform.Version >= 23) {
        // First check if permissions are already granted
        const checkReceiveSms = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
        const checkReadSms = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
        const checkReadPhone = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);

        if (checkReceiveSms && checkReadSms && checkReadPhone) {
          // Permissions already granted
          setPermissionsGranted(true);
          console.log('SMS permissions already granted');

          // Request notification permission for Android 13+ (API 33+)
          if (Platform.Version >= 33) {
            try {
              const notificationGranted = await PermissionsAndroid.request(
                'android.permission.POST_NOTIFICATIONS' as any
              );
              if (notificationGranted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Notification permission granted');
              }
            } catch (err) {
              console.warn('Notification permission error:', err);
            }
          }
          return;
        }

        // Request permissions if not already granted
        console.log('Requesting SMS permissions...');
        Alert.alert(
          'SMS Permissions Required',
          'DhanSetu needs access to read SMS messages to automatically track your financial transactions. This permission is required for the app to function.',
          [
            {
              text: 'Grant Permissions',
              onPress: async () => {
                const granted = await PermissionsAndroid.requestMultiple([
                  PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
                  PermissionsAndroid.PERMISSIONS.READ_SMS,
                  PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
                ]);

                const allGranted =
                  granted['android.permission.RECEIVE_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
                  granted['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
                  granted['android.permission.READ_PHONE_STATE'] === PermissionsAndroid.RESULTS.GRANTED;

                if (allGranted) {
                  setPermissionsGranted(true);
                  Alert.alert('Success', 'All permissions granted! The app will now receive SMS.');

                  // Request notification permission for Android 13+ (API 33+)
                  if (Platform.Version >= 33) {
                    try {
                      const notificationGranted = await PermissionsAndroid.request(
                        'android.permission.POST_NOTIFICATIONS' as any
                      );
                      if (notificationGranted === PermissionsAndroid.RESULTS.GRANTED) {
                        Alert.alert('Notifications Enabled', 'You will receive alerts for transactions even when the app is closed.');
                      }
                    } catch (err) {
                      console.warn('Notification permission error:', err);
                    }
                  }
                } else {
                  Alert.alert(
                    'Permissions Denied',
                    'SMS permissions are required for DhanSetu to work. Please grant permissions in app settings.',
                    [
                      {
                        text: 'Try Again',
                        onPress: requestSmsPermissions,
                      },
                      {
                        text: 'Exit',
                        onPress: () => {},
                        style: 'cancel',
                      },
                    ]
                  );
                }
              },
            },
            {
              text: 'Exit',
              style: 'cancel',
              onPress: () => {
                Alert.alert(
                  'App Cannot Function',
                  'DhanSetu requires SMS permissions to track your transactions. The app cannot work without these permissions.'
                );
              },
            },
          ]
        );
      } else {
        setPermissionsGranted(true);
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Handler for "Looks good" button in notification
  const handleLooksGood = () => {
    setShowNotification(false);
    setCurrentTransaction(null);
    // Transaction is already saved in smsList
  };

  // Handler for "Add details" button in notification
  const handleAddDetails = () => {
    setShowNotification(false);
    setEditingTransaction(currentTransaction);
    setShowBottomSheet(true);
  };

  // Handler for saving updated transaction from bottom sheet
  const handleSaveTransaction = (updatedTransaction: ParsedSMS) => {
    // Update the transaction in smsList
    setSmsList(prevList =>
      prevList.map(sms =>
        sms.parsedData?.id === updatedTransaction.id
          ? { ...sms, parsedData: updatedTransaction }
          : sms
      )
    );

    // Update in AsyncStorage
    updateTransaction(updatedTransaction);

    setEditingTransaction(null);
  };

  // Handler for editing transaction from SMS list
  const handleEditTransaction = (transaction: ParsedSMS) => {
    setEditingTransaction(transaction);
    setShowBottomSheet(true);
  };

  // Handler for initiating save (shows category picker)
  const handleSaveToCloud = (smsMessage: SmsMessage) => {
    setTransactionToSave(smsMessage);
    setShowCategoryPicker(true);
  };

  // Handler for confirming category and saving to cloud
  const handleCategoryConfirm = async (category: string, shareToFamily: boolean, goalId?: string | null, goalType?: 'personal' | 'family' | null) => {
    setShowCategoryPicker(false);

    if (!transactionToSave?.parsedData) return;

    // Update category and goal allocation in parsed data
    const updatedTransaction = {
      ...transactionToSave.parsedData,
      parsed: {
        ...transactionToSave.parsedData.parsed,
        userCategory: category,
      },
      allocated_goal_id: goalId || undefined,
      allocated_goal_type: goalType || undefined,
    };

    // Mark as saving
    setSmsList(prevList =>
      prevList.map(sms =>
        sms.id === transactionToSave.id ? { ...sms, saving: true } : sms
      )
    );

    try {
      const result = await saveToSupabase(updatedTransaction, shareToFamily ? familyId : undefined);

      // Remove from list regardless of success (saved locally or to cloud)
      setSmsList(prevList =>
        prevList.filter(sms => sms.id !== transactionToSave.id)
      );
      if (transactionToSave.parsedData) {
        await deleteTransaction(transactionToSave.parsedData.id);
      }

      if (result.success) {
        const message = shareToFamily
          ? 'Transaction saved and shared with family! 👥☁️'
          : 'Transaction saved to cloud! ☁️';
        Alert.alert('Success', message);
      } else if (result.offline) {
        // Saved offline - will sync when online
        Alert.alert(
          'Saved Offline ☁️',
          'No internet connection. Transaction saved locally and will sync when online.'
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to save to cloud');
      }
    } catch (error: any) {
      setSmsList(prevList =>
        prevList.filter(sms => sms.id !== transactionToSave.id)
      );
      if (transactionToSave.parsedData) {
        await deleteTransaction(transactionToSave.parsedData.id);
      }
      Alert.alert('Error', error.message || 'Failed to save to cloud');
    } finally {
      setTransactionToSave(null);
    }
  };

  // Handler for skipping transaction (removes from list)
  const handleSkipTransaction = async (smsMessage: SmsMessage) => {
    setSmsList(prevList => prevList.filter(sms => sms.id !== smsMessage.id));
    // Also remove from AsyncStorage so it doesn't reappear on app reload
    if (smsMessage.parsedData) {
      await deleteTransaction(smsMessage.parsedData.id);
    }
  };


  const renderSmsItem = ({ item }: { item: SmsMessage }) => (
    <TouchableOpacity
      style={styles.smsItem}
      onPress={() => {
        // Navigate to transaction details if navigation prop is available
        if (item.parsedData && navigation) {
          navigation.navigate('TransactionDetails', {
            transaction: {
              id: item.id,
              amount: item.parsedData.parsed.transaction.amount,
              category: item.parsedData.parsed.userCategory || 'other',
              description: item.parsedData.parsed.provider,
              date: new Date(item.timestamp).toISOString(),
              source: 'sms',
            },
          });
        }
      }}
      activeOpacity={0.7}
    >
      {item.parsedData && (
        <>
          {/* Single line transaction summary */}
          <View style={styles.transactionSummary}>
            <Text style={styles.bankName}>{item.parsedData.parsed.provider}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.amount}>
              ₹{item.parsedData.parsed.transaction.amount.toFixed(2)}
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.transactionType}>
              {item.parsedData.parsed.transaction.type}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => handleSkipTransaction(item)}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                item.savedToCloud && styles.savedButton,
                item.saving && styles.savingButton,
              ]}
              onPress={() => handleSaveToCloud(item)}
              disabled={item.saving || item.savedToCloud}>
              {item.saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {item.savedToCloud ? '✅ Saved' : 'Save to Cloud ☁️'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>DhanSetu</Text>
            <Text style={styles.headerSubtitle}>
              {permissionsGranted
                ? `${smsList.length} transactions${!isOnline ? ' • Offline' : ''}${offlineQueue.length > 0 ? ` • ${offlineQueue.length} queued` : ''}`
                : 'Waiting for permissions...'}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => setShowTestUI(!showTestUI)}>
              <Text style={styles.testButtonText}>
                {showTestUI ? '📱 Live' : '🧪 Test'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.familyButton}
              onPress={() => setShowFamilyModal(true)}>
              <Text style={styles.familyButtonText}>
                {currentFamily ? '👥' : '👥+'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                Alert.alert(
                  'Logout',
                  'Are you sure you want to logout?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Logout', onPress: signOut },
                  ]
                );
              }}>
              <Text style={styles.logoutButtonText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showTestUI ? (
        <SMSParserTest />
      ) : smsList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📱</Text>
          <Text style={styles.emptyText}>
            {permissionsGranted
              ? 'No transactions yet'
              : 'Grant permissions to start tracking transactions'}
          </Text>
          <Text style={styles.emptySubtext}>
            {permissionsGranted
              ? 'Financial SMS will appear here automatically'
              : 'Please allow SMS permissions when prompted'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={smsList}
          renderItem={renderSmsItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Transaction Notification */}
      {showNotification && currentTransaction && (
        <TransactionNotification
          transaction={currentTransaction}
          onLooksGood={handleLooksGood}
          onAddDetails={handleAddDetails}
          onDismiss={() => setShowNotification(false)}
        />
      )}

      {/* Transaction Bottom Sheet */}
      <TransactionBottomSheet
        visible={showBottomSheet}
        transaction={editingTransaction}
        onClose={() => setShowBottomSheet(false)}
        onSave={handleSaveTransaction}
      />

      {/* Category Picker Modal */}
      <CategoryPicker
        visible={showCategoryPicker}
        transaction={transactionToSave?.parsedData || null}
        onConfirm={handleCategoryConfirm}
        onCancel={() => {
          setShowCategoryPicker(false);
          setTransactionToSave(null);
        }}
        hasFamily={!!familyId}
      />

      {/* Family Modal */}
      <FamilyModal
        visible={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  listContainer: {
    padding: 16,
  },
  smsItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  transactionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6200ee',
    marginRight: 6,
  },
  separator: {
    fontSize: 14,
    color: '#9e9e9e',
    marginHorizontal: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginRight: 6,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  familyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  familyButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  savedButton: {
    backgroundColor: '#4caf50',
  },
  savingButton: {
    backgroundColor: '#9e9e9e',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default App;
