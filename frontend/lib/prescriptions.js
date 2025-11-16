/**
 * Prescriptions Service
 * Handles prescription management and refill requests
 * Currently returns dummy data
 */

import { supabase } from './supabase';

/**
 * Get user's prescriptions
 * @param {string} userId - User ID (null for current user)
 * @returns {Promise<{data: Array, error?: string}>}
 */
export const getPrescriptions = async (userId = null) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    // TODO: Replace with actual database query
    // const { data, error } = await supabase
    //   .from('prescriptions')
    //   .select('*')
    //   .eq('user_id', targetUserId)
    //   .order('start_date', { ascending: false });

    // Mock data
    const mockPrescriptions = [
      {
        id: '1',
        medication_name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'As needed',
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: null,
        refill_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        doctor_id: 'doctor-1',
      },
      {
        id: '2',
        medication_name: 'Sumatriptan',
        dosage: '50mg',
        frequency: 'As needed for migraines',
        start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: null,
        refill_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'needs_refill',
        doctor_id: 'doctor-1',
      },
    ];

    return { data: mockPrescriptions, error: null };
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Create a prescription refill request
 * @param {string} prescriptionId - Prescription ID
 * @param {Object} requestData - Request data (urgency, notes)
 * @returns {Promise<{data: Object, error?: string}>}
 */
export const createPrescriptionRequest = async (prescriptionId, requestData) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // TODO: Replace with actual database insert
    // const { data, error } = await supabase
    //   .from('prescription_requests')
    //   .insert({
    //     user_id: user.id,
    //     prescription_id: prescriptionId,
    //     urgency: requestData.urgency,
    //     notes: requestData.notes,
    //     status: 'pending',
    //   })
    //   .select()
    //   .single();

    // Mock response
    const mockRequest = {
      id: 'new-request-id',
      user_id: user.id,
      prescription_id: prescriptionId,
      urgency: requestData.urgency,
      notes: requestData.notes,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    return { data: mockRequest, error: null };
  } catch (error) {
    console.error('Error creating prescription request:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Get prescription request history
 * @param {string} userId - User ID (null for current user)
 * @returns {Promise<{data: Array, error?: string}>}
 */
export const getPrescriptionRequests = async (userId = null) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    // TODO: Replace with actual database query
    // const { data, error } = await supabase
    //   .from('prescription_requests')
    //   .select(`
    //     *,
    //     prescription:prescription_id (
    //       medication_name
    //     )
    //   `)
    //   .eq('user_id', targetUserId)
    //   .order('created_at', { ascending: false });

    // Mock data
    const mockRequests = [
      {
        id: '1',
        prescription_id: '2',
        medication_name: 'Sumatriptan',
        urgency: 'urgent',
        notes: 'Running low, need refill soon',
        status: 'approved',
        doctor_response: 'Your prescription has been approved. You can pick it up at your pharmacy.',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return { data: mockRequests, error: null };
  } catch (error) {
    console.error('Error fetching prescription requests:', error);
    return { data: null, error: error.message };
  }
};

