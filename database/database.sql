-- ============================================================
-- Daniel Social — PostgreSQL Database Schema
-- Phiên bản: 1.0.0
-- Ngày tạo: 2026-02-27
-- ============================================================

-- Bật extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Hỗ trợ full-text search

-- ============================================================
-- 1. USERS — Thông tin người dùng
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT,                                -- NULL nếu dùng OAuth
    name            TEXT NOT NULL,
    username        TEXT UNIQUE NOT NULL,
    avatar_url      TEXT DEFAULT '/images/default-avatar.jpg',
    cover_url       TEXT DEFAULT '/images/default-cover.jpg',
    bio             TEXT DEFAULT '',
    location        TEXT DEFAULT '',
    website         TEXT DEFAULT '',
    is_online       BOOLEAN DEFAULT FALSE,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count     INTEGER DEFAULT 0,
    last_seen_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_name_trgm ON users USING gin (name gin_trgm_ops);
CREATE INDEX idx_users_username_trgm ON users USING gin (username gin_trgm_ops);

-- ============================================================
-- 2. ACCOUNTS — NextAuth OAuth (Google, GitHub, ...)
-- ============================================================
CREATE TABLE accounts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider            TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    access_token        TEXT,
    refresh_token       TEXT,
    token_type          TEXT,
    scope               TEXT,
    id_token            TEXT,
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_accounts_user_id ON accounts (user_id);

-- ============================================================
-- 3. SESSIONS — Quản lý phiên đăng nhập
-- ============================================================
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token   TEXT UNIQUE NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_token ON sessions (session_token);

-- ============================================================
-- 4. POSTS — Bài đăng
-- ============================================================
CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    likes_count     INTEGER DEFAULT 0,
    comments_count  INTEGER DEFAULT 0,
    shares_count    INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ                          -- Soft delete
);

CREATE INDEX idx_posts_author_id ON posts (author_id);
CREATE INDEX idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX idx_posts_active ON posts (created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_content_trgm ON posts USING gin (content gin_trgm_ops);

-- ============================================================
-- 5. POST_MEDIA — Ảnh/video đính kèm (1 post → nhiều media)
-- ============================================================
CREATE TABLE post_media (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    media_type  TEXT NOT NULL DEFAULT 'image',            -- 'image' | 'video'
    position    INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_media_post_id ON post_media (post_id);

-- ============================================================
-- 6. LIKES — Lượt thích bài viết
-- ============================================================
CREATE TABLE likes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, post_id)
);

CREATE INDEX idx_likes_post_id ON likes (post_id);
CREATE INDEX idx_likes_user_id ON likes (user_id);

-- ============================================================
-- 7. BOOKMARKS — Lưu bài viết
-- ============================================================
CREATE TABLE bookmarks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, post_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks (user_id, created_at DESC);
CREATE INDEX idx_bookmarks_post_id ON bookmarks (post_id);

-- ============================================================
-- 8. COMMENTS — Bình luận (hỗ trợ reply lồng nhau)
-- ============================================================
CREATE TABLE comments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id   UUID REFERENCES comments(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_comments_post_id ON comments (post_id, created_at);
CREATE INDEX idx_comments_user_id ON comments (user_id);
CREATE INDEX idx_comments_parent_id ON comments (parent_id);

-- ============================================================
-- 9. FOLLOWS — Quan hệ follow
-- ============================================================
CREATE TABLE follows (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower_id ON follows (follower_id);
CREATE INDEX idx_follows_following_id ON follows (following_id);

-- ============================================================
-- 10. CONVERSATIONS — Cuộc hội thoại (1-1 hoặc nhóm)
-- ============================================================
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_group        BOOLEAN DEFAULT FALSE,
    name            TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_last_message ON conversations (last_message_at DESC);

-- ============================================================
-- 11. CONVERSATION_PARTICIPANTS — Thành viên hội thoại
-- ============================================================
CREATE TABLE conversation_participants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_read_at    TIMESTAMPTZ DEFAULT NOW(),
    joined_at       TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conv_participants_user ON conversation_participants (user_id);
CREATE INDEX idx_conv_participants_conv ON conversation_participants (conversation_id);

-- ============================================================
-- 12. MESSAGES — Tin nhắn
-- ============================================================
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    media_url       TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);
CREATE INDEX idx_messages_sender ON messages (sender_id);

-- ============================================================
-- 13. NOTIFICATIONS — Thông báo
-- ============================================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'message')),
    reference_id    UUID,
    reference_type  TEXT CHECK (reference_type IN ('post', 'comment', 'story', NULL)),
    content         TEXT,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_actor ON notifications (actor_id);

-- ============================================================
-- 14. STORIES — Stories 24h
-- ============================================================
CREATE TABLE stories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_url   TEXT NOT NULL,
    media_type  TEXT DEFAULT 'image',
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stories_user_id ON stories (user_id);
CREATE INDEX idx_stories_expires ON stories (expires_at DESC);
CREATE INDEX idx_stories_active ON stories (user_id, expires_at DESC, created_at DESC);

-- ============================================================
-- 15. HASHTAGS — Hashtags & trending
-- ============================================================
CREATE TABLE hashtags (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hashtags_name ON hashtags (name);
CREATE INDEX idx_hashtags_trending ON hashtags (usage_count DESC);

-- ============================================================
-- 16. POST_HASHTAGS — Liên kết post ↔ hashtag
-- ============================================================
CREATE TABLE post_hashtags (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id  UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,

    UNIQUE(post_id, hashtag_id)
);

CREATE INDEX idx_post_hashtags_post ON post_hashtags (post_id);
CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags (hashtag_id);


-- ============================================================
-- TRIGGERS — Tự động cập nhật counters
-- ============================================================

-- Likes counter trên posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Comments counter trên posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Followers / Following counters trên users
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
        UPDATE users SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_follow_counts
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Posts counter trên users
CREATE OR REPLACE FUNCTION update_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET posts_count = posts_count + 1 WHERE id = NEW.author_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = OLD.author_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_posts_count
AFTER INSERT OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION update_user_posts_count();

-- Hashtag usage counter
CREATE OR REPLACE FUNCTION update_hashtag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE hashtags SET usage_count = usage_count + 1 WHERE id = NEW.hashtag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE hashtags SET usage_count = GREATEST(usage_count - 1, 0) WHERE id = OLD.hashtag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hashtag_usage_count
AFTER INSERT OR DELETE ON post_hashtags
FOR EACH ROW EXECUTE FUNCTION update_hashtag_usage_count();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Conversation last_message_at tự động cập nhật
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_conversation_last_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();


-- ============================================================
-- VIEWS
-- ============================================================

-- Feed — bài viết kèm thông tin author
CREATE VIEW v_feed AS
SELECT 
    p.id,
    p.content,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.created_at,
    u.id AS author_id,
    u.name AS author_name,
    u.username AS author_username,
    u.avatar_url AS author_avatar,
    (SELECT url FROM post_media pm WHERE pm.post_id = p.id ORDER BY position LIMIT 1) AS image_url
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.deleted_at IS NULL
ORDER BY p.created_at DESC;

-- Trending hashtags
CREATE VIEW v_trending_hashtags AS
SELECT 
    h.id,
    h.name AS tag,
    h.usage_count,
    h.usage_count || ' posts' AS posts_label
FROM hashtags h
ORDER BY h.usage_count DESC
LIMIT 20;

-- Unread messages per user per conversation
CREATE VIEW v_unread_messages AS
SELECT 
    cp.user_id,
    cp.conversation_id,
    COUNT(m.id) AS unread_count
FROM conversation_participants cp
JOIN messages m ON m.conversation_id = cp.conversation_id
    AND m.created_at > cp.last_read_at
    AND m.sender_id != cp.user_id
GROUP BY cp.user_id, cp.conversation_id;


-- ============================================================
-- SEED DATA — Dữ liệu mẫu
-- ============================================================

-- Users
INSERT INTO users (id, email, password_hash, name, username, avatar_url, bio, location, website, is_online, followers_count, following_count) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'minhtran@example.com', '$2b$10$placeholder_hash', 'Minh Tran', 'minhtran', '/images/avatar-1.jpg', 'Full-stack developer | Photography enthusiast | Coffee addict', 'Ho Chi Minh City', 'minhtran.dev', TRUE, 1248, 532),
    ('a0000000-0000-0000-0000-000000000002', 'linhnguyen@example.com', NULL, 'Linh Nguyen', 'linhnguyen', '/images/avatar-2.jpg', 'Graphic Designer | Dreamer', '', '', TRUE, 3420, 189),
    ('a0000000-0000-0000-0000-000000000003', 'ducpham@example.com', NULL, 'Duc Pham', 'ducpham', '/images/avatar-3.jpg', 'Travel blogger | 30 countries and counting', '', '', FALSE, 12500, 423),
    ('a0000000-0000-0000-0000-000000000004', 'hoale@example.com', NULL, 'Hoa Le', 'hoale', '/images/avatar-4.jpg', 'Foodie | Startup founder', '', '', TRUE, 8900, 312),
    ('a0000000-0000-0000-0000-000000000005', 'khanhvu@example.com', NULL, 'Khanh Vu', 'khanhvu', '/images/avatar-1.jpg', 'Music producer | Night owl', '', '', FALSE, 5600, 278),
    ('a0000000-0000-0000-0000-000000000006', 'maitran@example.com', NULL, 'Mai Tran', 'maitran', '/images/avatar-2.jpg', 'Yoga instructor | Wellness advocate', '', '', TRUE, 9200, 645);

-- Follows
INSERT INTO follows (follower_id, following_id) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
    ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004'),
    ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006'),
    ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001'),
    ('a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001');

-- Posts
INSERT INTO posts (id, author_id, content, likes_count, comments_count, shares_count, created_at) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Just captured this amazing sunset at the beach today. Nature never fails to inspire me.', 284, 42, 18, NOW() - INTERVAL '2 hours'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'Found the perfect coffee spot for remote working. The latte art here is on another level!', 156, 23, 7, NOW() - INTERVAL '4 hours'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Weekend hiking with the crew. Nothing beats getting lost in nature with good company. The view from the top was absolutely breathtaking.', 432, 67, 29, NOW() - INTERVAL '6 hours'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'Just finished my latest track after 3 weeks of production. Can''t wait to share it with everyone. Music is the universal language that connects us all.', 89, 15, 4, NOW() - INTERVAL '8 hours'),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006', 'Morning yoga session by the river. Starting the day with gratitude and mindfulness. Remember to take a moment for yourself today.', 312, 34, 21, NOW() - INTERVAL '12 hours');

-- Post Media
INSERT INTO post_media (post_id, url, media_type, position) VALUES
    ('b0000000-0000-0000-0000-000000000001', '/images/post-1.jpg', 'image', 0),
    ('b0000000-0000-0000-0000-000000000002', '/images/post-2.jpg', 'image', 0),
    ('b0000000-0000-0000-0000-000000000003', '/images/post-3.jpg', 'image', 0);

-- Likes
INSERT INTO likes (user_id, post_id) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004');

-- Bookmarks
INSERT INTO bookmarks (user_id, post_id) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005');

-- Hashtags
INSERT INTO hashtags (id, name, usage_count) VALUES
    ('c0000000-0000-0000-0000-000000000001', '#Photography', 12500),
    ('c0000000-0000-0000-0000-000000000002', '#TravelVietnam', 8300),
    ('c0000000-0000-0000-0000-000000000003', '#CoffeeLovers', 6700),
    ('c0000000-0000-0000-0000-000000000004', '#TechStartup', 5100),
    ('c0000000-0000-0000-0000-000000000005', '#FoodieLife', 4900);

-- Post Hashtags
INSERT INTO post_hashtags (post_id, hashtag_id) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
    ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003'),
    ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005'),
    ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002');

-- Conversations
INSERT INTO conversations (id, is_group, last_message_at) VALUES
    ('d0000000-0000-0000-0000-000000000001', FALSE, NOW() - INTERVAL '5 minutes'),
    ('d0000000-0000-0000-0000-000000000002', FALSE, NOW() - INTERVAL '30 minutes'),
    ('d0000000-0000-0000-0000-000000000003', FALSE, NOW() - INTERVAL '2 hours'),
    ('d0000000-0000-0000-0000-000000000004', FALSE, NOW() - INTERVAL '4 hours'),
    ('d0000000-0000-0000-0000-000000000005', FALSE, NOW() - INTERVAL '1 day');

-- Conversation Participants
INSERT INTO conversation_participants (conversation_id, user_id) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004'),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003'),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005'),
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006');

-- Messages
INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Hey! Are you coming to the event tonight?', NOW() - INTERVAL '6 minutes'),
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Yes! I''ll be there around 7. Can''t wait!', NOW() - INTERVAL '5 minutes 30 seconds'),
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Perfect! I''ll save you a seat. It''s going to be amazing.', NOW() - INTERVAL '5 minutes'),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'Check out this new restaurant I found!', NOW() - INTERVAL '30 minutes'),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'The hiking photos turned out amazing', NOW() - INTERVAL '2 hours'),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'Let me know what you think of the track', NOW() - INTERVAL '4 hours'),
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006', 'See you at the yoga class tomorrow!', NOW() - INTERVAL '1 day');

-- Notifications
INSERT INTO notifications (user_id, actor_id, type, reference_id, reference_type, content, is_read, created_at) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'like', 'b0000000-0000-0000-0000-000000000001', 'post', 'liked your post', FALSE, NOW() - INTERVAL '2 minutes'),
    ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'follow', NULL, NULL, 'started following you', FALSE, NOW() - INTERVAL '15 minutes'),
    ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'comment', 'b0000000-0000-0000-0000-000000000002', 'post', 'commented on your post: "This is incredible!"', TRUE, NOW() - INTERVAL '1 hour'),
    ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'mention', NULL, NULL, 'mentioned you in a comment', TRUE, NOW() - INTERVAL '3 hours'),
    ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'like', 'b0000000-0000-0000-0000-000000000003', 'post', 'liked your photo', TRUE, NOW() - INTERVAL '5 hours'),
    ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'follow', NULL, NULL, 'started following you', TRUE, NOW() - INTERVAL '1 day');

-- Stories
INSERT INTO stories (user_id, media_url, media_type, expires_at) VALUES
    ('a0000000-0000-0000-0000-000000000002', '/images/story-1.jpg', 'image', NOW() + INTERVAL '20 hours'),
    ('a0000000-0000-0000-0000-000000000003', '/images/story-2.jpg', 'image', NOW() + INTERVAL '18 hours'),
    ('a0000000-0000-0000-0000-000000000004', '/images/story-3.jpg', 'image', NOW() + INTERVAL '12 hours'),
    ('a0000000-0000-0000-0000-000000000006', '/images/story-4.jpg', 'image', NOW() + INTERVAL '6 hours');


-- ============================================================
-- HOÀN TẤT — 16 bảng | 7 triggers | 3 views
-- ============================================================
