import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, gradients } from '../config/theme';
import { checkPremiumStatus } from '../lib/premium';
import { getPrescriptions, createPrescriptionRequest, getPrescriptionRequests } from '../lib/prescriptions';

export default function PrescriptionScreen({ navigation }) {
  const [isPremium, setIsPremium] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [urgency, setUrgency] = useState('normal');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      checkPremium(),
      loadPrescriptions(),
      loadRequests(),
    ]);
  };

  const checkPremium = async () => {
    try {
      const result = await checkPremiumStatus(null);
      setIsPremium(result.isPremium || false);
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const result = await getPrescriptions(null);
      if (result.data) {
        setPrescriptions(result.data);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const result = await getPrescriptionRequests(null);
      if (result.data) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleRequestRefill = (prescription) => {
    setSelectedPrescription(prescription);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedPrescription) return;

    try {
      const result = await createPrescriptionRequest(selectedPrescription.id, {
        urgency,
        notes,
      });

      if (result.data) {
        Alert.alert('Success', 'Your refill request has been submitted. Your doctor will review it shortly.');
        setShowRequestModal(false);
        setNotes('');
        setUrgency('normal');
        loadRequests();
      } else {
        Alert.alert('Error', result.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'expired':
        return colors.error;
      case 'needs_refill':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  const getRequestStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'denied':
        return colors.error;
      case 'pending':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={gradients.primary.colors}
          locations={gradients.primary.locations}
          start={gradients.primary.start}
          end={gradients.primary.end}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Prescription Management</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.premiumLockContainer}>
            <Ionicons name="lock-closed" size={64} color={colors.primary} />
            <Text style={styles.premiumLockTitle}>Premium Feature</Text>
            <Text style={styles.premiumLockText}>
              Upgrade to Premium to access prescription management and communicate with your doctor.
            </Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={gradients.primary.colors}
        locations={gradients.primary.locations}
        start={gradients.primary.start}
        end={gradients.primary.end}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prescription Management</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Prescriptions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Prescriptions</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : prescriptions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="medical-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No prescriptions found</Text>
              </View>
            ) : (
              prescriptions.map((prescription) => (
                <View key={prescription.id} style={styles.prescriptionCard}>
                  <View style={styles.prescriptionHeader}>
                    <View style={styles.prescriptionInfo}>
                      <Text style={styles.prescriptionName}>{prescription.medication_name}</Text>
                      <Text style={styles.prescriptionDosage}>
                        {prescription.dosage} • {prescription.frequency}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(prescription.status) + '30' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(prescription.status) }]}>
                        {prescription.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.prescriptionDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                      <Text style={styles.detailText}>
                        Started: {new Date(prescription.start_date).toLocaleDateString()}
                      </Text>
                    </View>
                    {prescription.refill_date && (
                      <View style={styles.detailItem}>
                        <Ionicons name="refresh-outline" size={16} color={colors.textMuted} />
                        <Text style={styles.detailText}>
                          Refill: {new Date(prescription.refill_date).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                  {prescription.status === 'needs_refill' || prescription.status === 'active' ? (
                    <TouchableOpacity
                      style={styles.requestButton}
                      onPress={() => handleRequestRefill(prescription)}
                    >
                      <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                      <Text style={styles.requestButtonText}>Request Refill</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))
            )}
          </View>

          {/* Recent Requests */}
          {requests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Requests</Text>
              {requests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestMedication}>{request.medication_name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getRequestStatusColor(request.status) + '30' }]}>
                      <Text style={[styles.statusText, { color: getRequestStatusColor(request.status) }]}>
                        {request.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.requestDate}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                  {request.doctor_response && (
                    <View style={styles.responseContainer}>
                      <Text style={styles.responseLabel}>Doctor Response:</Text>
                      <Text style={styles.responseText}>{request.doctor_response}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* In-App Messaging (Dummy) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Messages with Doctor</Text>
            <View style={styles.messageCard}>
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>
                  Your prescription refill request for Ibuprofen has been approved. You can pick it up at your pharmacy.
                </Text>
                <Text style={styles.messageTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.messageCard}>
              <View style={[styles.messageBubble, styles.messageBubbleUser]}>
                <Text style={styles.messageText}>
                  Thank you! When will the prescription be ready?
                </Text>
                <Text style={styles.messageTime}>1 hour ago</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Request Modal */}
        <Modal
          visible={showRequestModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowRequestModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Request Refill</Text>
                <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                  <Ionicons name="close" size={24} color={colors.textWhite} />
                </TouchableOpacity>
              </View>

              {selectedPrescription && (
                <View style={styles.modalBody}>
                  <Text style={styles.modalLabel}>Medication</Text>
                  <Text style={styles.modalValue}>{selectedPrescription.medication_name}</Text>

                  <Text style={styles.modalLabel}>Urgency Level</Text>
                  <View style={styles.urgencyButtons}>
                    <TouchableOpacity
                      style={[styles.urgencyButton, urgency === 'normal' && styles.urgencyButtonActive]}
                      onPress={() => setUrgency('normal')}
                    >
                      <Text style={[styles.urgencyButtonText, urgency === 'normal' && styles.urgencyButtonTextActive]}>
                        Normal
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.urgencyButton, urgency === 'urgent' && styles.urgencyButtonActive]}
                      onPress={() => setUrgency('urgent')}
                    >
                      <Text style={[styles.urgencyButtonText, urgency === 'urgent' && styles.urgencyButtonTextActive]}>
                        Urgent
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalLabel}>Additional Notes</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Any additional information for your doctor..."
                    placeholderTextColor={colors.textMuted}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                  />

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitRequest}
                  >
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl + 20,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  prescriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  prescriptionInfo: {
    flex: 1,
  },
  prescriptionName: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  prescriptionDosage: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  statusText: {
    fontSize: fontSizes.tiny,
    fontFamily: fonts.bold,
  },
  prescriptionDetails: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  requestButtonText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  requestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  requestMedication: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  requestDate: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  responseContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  responseLabel: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  responseText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  messageCard: {
    marginBottom: spacing.md,
  },
  messageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    maxWidth: '80%',
  },
  messageBubbleUser: {
    backgroundColor: colors.primary + '40',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  messageTime: {
    fontSize: fontSizes.tiny,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  premiumLockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  premiumLockTitle: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  premiumLockText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  upgradeButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.gradientEnd,
    borderTopLeftRadius: borderRadius.xlarge,
    borderTopRightRadius: borderRadius.xlarge,
    paddingTop: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalLabel: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  modalValue: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  urgencyButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  urgencyButtonActive: {
    backgroundColor: colors.primary,
  },
  urgencyButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textWhite,
  },
  urgencyButtonTextActive: {
    fontFamily: fonts.bold,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
});

