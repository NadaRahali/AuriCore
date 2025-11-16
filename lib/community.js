/**
 * Community Service
 * Handles community features: channels, posts, replies, and likes
 * Currently returns mock data - structured for future Supabase integration
 */

import { supabase } from './supabase';

/**
 * Get all active community channels
 * @returns {Promise<{data, error}>}
 */
export const getChannels = async () => {
  try {
    // TODO: Replace with Supabase query when ready
    // const { data, error } = await supabase
    //   .from('community_channels')
    //   .select('*')
    //   .eq('is_active', true)
    //   .order('is_featured', { ascending: false })
    //   .order('name', { ascending: true });

    // Mock data for now
    const mockChannels = [
      {
        id: '1',
        name: 'Daily Support',
        description: 'Share your day, get encouragement from the community',
        icon: '💬',
        topic_category: 'support',
        member_count: 234,
        post_count: 156,
        is_active: true,
        is_featured: true,
      },
      {
        id: '2',
        name: 'Trigger Discussions',
        description: 'Discuss potential migraine triggers and patterns',
        icon: '⚡',
        topic_category: 'triggers',
        member_count: 189,
        post_count: 98,
        is_active: true,
        is_featured: false,
      },
      {
        id: '3',
        name: 'Success Stories',
        description: 'Share what\'s working for you and celebrate wins',
        icon: '✨',
        topic_category: 'wellness',
        member_count: 156,
        post_count: 87,
        is_active: true,
        is_featured: false,
      },
      {
        id: '4',
        name: 'Tips & Tricks',
        description: 'Share coping strategies and helpful techniques',
        icon: '💡',
        topic_category: 'tips',
        member_count: 201,
        post_count: 124,
        is_active: true,
        is_featured: false,
      },
      {
        id: '5',
        name: 'Wellness Corner',
        description: 'General wellness discussions and lifestyle topics',
        icon: '🌱',
        topic_category: 'wellness',
        member_count: 178,
        post_count: 92,
        is_active: true,
        is_featured: false,
      },
    ];

    return { data: mockChannels, error: null };
  } catch (error) {
    console.error('Error fetching channels:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Get posts for a specific channel
 * @param {string} channelId - Channel ID
 * @param {Object} options - Pagination and filtering options
 * @returns {Promise<{data, error}>}
 */
export const getChannelPosts = async (channelId, options = {}) => {
  try {
    const { limit = 20, offset = 0 } = options;

    // TODO: Replace with Supabase query when ready
    // const { data, error } = await supabase
    //   .from('community_posts')
    //   .select(`
    //     *,
    //     user:user_id (
    //       id,
    //       email,
    //       user_metadata
    //     )
    //   `)
    //   .eq('channel_id', channelId)
    //   .eq('moderation_status', 'approved')
    //   .eq('is_deleted', false)
    //   .order('is_pinned', { ascending: false })
    //   .order('created_at', { ascending: false })
    //   .range(offset, offset + limit - 1);

    // Mock data for now
    const mockPosts = [];

    return { data: mockPosts, error: null };
  } catch (error) {
    console.error('Error fetching channel posts:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Create a new post in a channel
 * @param {string} channelId - Channel ID
 * @param {Object} postData - Post data (title, content)
 * @returns {Promise<{data, error}>}
 */
export const createPost = async (channelId, postData) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // TODO: Replace with Supabase insert when ready
    // const { data, error } = await supabase
    //   .from('community_posts')
    //   .insert({
    //     channel_id: channelId,
    //     user_id: user.id,
    //     title: postData.title,
    //     content: postData.content,
    //     moderation_status: 'pending', // Will be reviewed by AI/moderation
    //   })
    //   .select()
    //   .single();

    // Mock response for now
    const mockPost = {
      id: 'new-post-id',
      channel_id: channelId,
      user_id: user.id,
      title: postData.title,
      content: postData.content,
      moderation_status: 'pending',
      created_at: new Date().toISOString(),
    };

    return { data: mockPost, error: null };
  } catch (error) {
    console.error('Error creating post:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Get replies for a specific post
 * @param {string} postId - Post ID
 * @param {Object} options - Pagination options
 * @returns {Promise<{data, error}>}
 */
export const getPostReplies = async (postId, options = {}) => {
  try {
    const { limit = 50, offset = 0 } = options;

    // TODO: Replace with Supabase query when ready
    // const { data, error } = await supabase
    //   .from('community_replies')
    //   .select(`
    //     *,
    //     user:user_id (
    //       id,
    //       email,
    //       user_metadata
    //     )
    //   `)
    //   .eq('post_id', postId)
    //   .eq('moderation_status', 'approved')
    //   .eq('is_deleted', false)
    //   .order('created_at', { ascending: true })
    //   .range(offset, offset + limit - 1);

    // Mock data for now
    const mockReplies = [];

    return { data: mockReplies, error: null };
  } catch (error) {
    console.error('Error fetching post replies:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Create a reply to a post
 * @param {string} postId - Post ID
 * @param {Object} replyData - Reply data (content, parent_reply_id for threading)
 * @returns {Promise<{data, error}>}
 */
export const createReply = async (postId, replyData) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // TODO: Replace with Supabase insert when ready
    // const { data, error } = await supabase
    //   .from('community_replies')
    //   .insert({
    //     post_id: postId,
    //     user_id: user.id,
    //     content: replyData.content,
    //     parent_reply_id: replyData.parent_reply_id || null,
    //     moderation_status: 'pending',
    //   })
    //   .select()
    //   .single();

    // Mock response for now
    const mockReply = {
      id: 'new-reply-id',
      post_id: postId,
      user_id: user.id,
      content: replyData.content,
      parent_reply_id: replyData.parent_reply_id || null,
      moderation_status: 'pending',
      created_at: new Date().toISOString(),
    };

    return { data: mockReply, error: null };
  } catch (error) {
    console.error('Error creating reply:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Like or unlike a post
 * @param {string} postId - Post ID
 * @returns {Promise<{data, error}>}
 */
export const likePost = async (postId) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // TODO: Replace with Supabase upsert when ready
    // First check if like exists
    // const { data: existingLike } = await supabase
    //   .from('community_post_likes')
    //   .select('id')
    //   .eq('post_id', postId)
    //   .eq('user_id', user.id)
    //   .single();

    // if (existingLike) {
    //   // Unlike: delete the like
    //   const { error } = await supabase
    //     .from('community_post_likes')
    //     .delete()
    //     .eq('id', existingLike.id);
    //   return { data: { liked: false }, error };
    // } else {
    //   // Like: insert new like
    //   const { data, error } = await supabase
    //     .from('community_post_likes')
    //     .insert({
    //       post_id: postId,
    //       user_id: user.id,
    //     })
    //     .select()
    //     .single();
    //   return { data: { liked: true, like: data }, error };
    // }

    // Mock response for now
    return { data: { liked: true }, error: null };
  } catch (error) {
    console.error('Error liking post:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Like or unlike a reply
 * @param {string} replyId - Reply ID
 * @returns {Promise<{data, error}>}
 */
export const likeReply = async (replyId) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // TODO: Replace with Supabase upsert when ready (similar to likePost)

    // Mock response for now
    return { data: { liked: true }, error: null };
  } catch (error) {
    console.error('Error liking reply:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Check if user has liked a post
 * @param {string} postId - Post ID
 * @returns {Promise<{data, error}>}
 */
export const hasLikedPost = async (postId) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: false, error: null };
    }

    // TODO: Replace with Supabase query when ready
    // const { data, error } = await supabase
    //   .from('community_post_likes')
    //   .select('id')
    //   .eq('post_id', postId)
    //   .eq('user_id', user.id)
    //   .single();

    // return { data: !!data, error };

    // Mock response for now
    return { data: false, error: null };
  } catch (error) {
    console.error('Error checking post like status:', error);
    return { data: false, error: null };
  }
};

/**
 * Update a post (user can only update their own)
 * @param {string} postId - Post ID
 * @param {Object} updates - Fields to update (title, content)
 * @returns {Promise<{data, error}>}
 */
export const updatePost = async (postId, updates) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // TODO: Replace with Supabase update when ready
    // const { data, error } = await supabase
    //   .from('community_posts')
    //   .update({
    //     ...updates,
    //     updated_at: new Date().toISOString(),
    //   })
    //   .eq('id', postId)
    //   .eq('user_id', user.id) // Ensure user owns the post
    //   .select()
    //   .single();

    // Mock response for now
    return { data: { id: postId, ...updates }, error: null };
  } catch (error) {
    console.error('Error updating post:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Soft delete a post (user can only delete their own)
 * @param {string} postId - Post ID
 * @returns {Promise<{data, error}>}
 */
export const deletePost = async (postId) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // TODO: Replace with Supabase update when ready (soft delete)
    // const { data, error } = await supabase
    //   .from('community_posts')
    //   .update({
    //     is_deleted: true,
    //     deleted_at: new Date().toISOString(),
    //   })
    //   .eq('id', postId)
    //   .eq('user_id', user.id)
    //   .select()
    //   .single();

    // Mock response for now
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { data: null, error: { message: error.message } };
  }
};

