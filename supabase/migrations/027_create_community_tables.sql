-- ============================================
-- COMMUNITY TABLES
-- ============================================
-- Creates tables for community support features:
-- - Channels for topic-based discussions
-- - Posts for user contributions
-- - Replies for threaded conversations
-- - Moderation support for AI/community safety

-- ============================================
-- COMMUNITY CHANNELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Channel Information
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10), -- Emoji or icon identifier
  topic_category VARCHAR(50), -- e.g., 'support', 'triggers', 'tips', 'wellness'
  
  -- Statistics (updated via triggers or application logic)
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  
  -- Channel Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- COMMUNITY POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.community_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Post Content
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  
  -- Engagement Metrics
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Post Status
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false, -- Locked posts prevent new replies
  
  -- Moderation
  moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'rejected', 'deleted')),
  moderation_notes TEXT, -- Notes from moderators/AI
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID REFERENCES auth.users(id), -- Admin/moderator user_id
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- COMMUNITY REPLIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Reply Content
  content TEXT NOT NULL,
  
  -- Threading Support
  parent_reply_id UUID REFERENCES public.community_replies(id) ON DELETE CASCADE, -- For nested replies
  
  -- Engagement Metrics
  likes_count INTEGER DEFAULT 0,
  
  -- Moderation
  moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'rejected', 'deleted')),
  moderation_notes TEXT,
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID REFERENCES auth.users(id),
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- POST LIKES TABLE (for tracking who liked what)
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure one like per user per post
  UNIQUE(post_id, user_id)
);

-- ============================================
-- REPLY LIKES TABLE (for tracking who liked what)
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_reply_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID REFERENCES public.community_replies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure one like per user per reply
  UNIQUE(reply_id, user_id)
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Channel indexes
CREATE INDEX IF NOT EXISTS idx_community_channels_active 
  ON public.community_channels(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_community_channels_category 
  ON public.community_channels(topic_category);

-- Post indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_channel 
  ON public.community_posts(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user 
  ON public.community_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_moderation 
  ON public.community_posts(moderation_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned 
  ON public.community_posts(channel_id, is_pinned) WHERE is_pinned = true;

-- Reply indexes
CREATE INDEX IF NOT EXISTS idx_community_replies_post 
  ON public.community_replies(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_community_replies_user 
  ON public.community_replies(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_replies_parent 
  ON public.community_replies(parent_reply_id) WHERE parent_reply_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_replies_moderation 
  ON public.community_replies(moderation_status, created_at DESC);

-- Like indexes
CREATE INDEX IF NOT EXISTS idx_community_post_likes_post 
  ON public.community_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_user 
  ON public.community_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_reply_likes_reply 
  ON public.community_reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_community_reply_likes_user 
  ON public.community_reply_likes(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Channels: Public read, admin write
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active channels" ON public.community_channels
  FOR SELECT USING (is_active = true);

-- Posts: Users can read approved posts, create their own, update/delete their own
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read approved posts" ON public.community_posts
  FOR SELECT USING (moderation_status = 'approved' AND is_deleted = false);

CREATE POLICY "Users can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id); -- Soft delete via is_deleted flag

-- Replies: Users can read approved replies, create their own, update/delete their own
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read approved replies" ON public.community_replies
  FOR SELECT USING (moderation_status = 'approved' AND is_deleted = false);

CREATE POLICY "Users can create replies" ON public.community_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies" ON public.community_replies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies" ON public.community_replies
  FOR UPDATE USING (auth.uid() = user_id); -- Soft delete via is_deleted flag

-- Post Likes: Users can read all, manage their own
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read post likes" ON public.community_post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own post likes" ON public.community_post_likes
  FOR ALL USING (auth.uid() = user_id);

-- Reply Likes: Users can read all, manage their own
ALTER TABLE public.community_reply_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read reply likes" ON public.community_reply_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own reply likes" ON public.community_reply_likes
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS for Auto-updating Statistics
-- ============================================

-- Function to update post_count on channels
CREATE OR REPLACE FUNCTION update_channel_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_channels
    SET post_count = post_count + 1
    WHERE id = NEW.channel_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_channels
    SET post_count = GREATEST(0, post_count - 1)
    WHERE id = OLD.channel_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for post_count
CREATE TRIGGER trigger_update_channel_post_count
  AFTER INSERT OR DELETE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_post_count();

-- Function to update replies_count on posts
CREATE OR REPLACE FUNCTION update_post_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET replies_count = replies_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET replies_count = GREATEST(0, replies_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for replies_count
CREATE TRIGGER trigger_update_post_replies_count
  AFTER INSERT OR DELETE ON public.community_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_post_replies_count();

-- Function to update likes_count on posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for post likes_count
CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON public.community_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Function to update likes_count on replies
CREATE OR REPLACE FUNCTION update_reply_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_replies
    SET likes_count = likes_count + 1
    WHERE id = NEW.reply_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_replies
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.reply_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reply likes_count
CREATE TRIGGER trigger_update_reply_likes_count
  AFTER INSERT OR DELETE ON public.community_reply_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_reply_likes_count();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.community_channels IS 'Topic-based channels for community discussions';
COMMENT ON TABLE public.community_posts IS 'User posts within community channels';
COMMENT ON TABLE public.community_replies IS 'Replies to posts, supports threading via parent_reply_id';
COMMENT ON TABLE public.community_post_likes IS 'Tracks which users liked which posts';
COMMENT ON TABLE public.community_reply_likes IS 'Tracks which users liked which replies';
COMMENT ON COLUMN public.community_posts.moderation_status IS 'Post moderation status: pending (awaiting review), approved (visible), flagged (needs review), rejected (not approved), deleted (soft deleted)';
COMMENT ON COLUMN public.community_replies.moderation_status IS 'Reply moderation status: pending (awaiting review), approved (visible), flagged (needs review), rejected (not approved), deleted (soft deleted)';

