-- ============================================
-- 執行這些 SQL 在 Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================

-- 1. 使用者個人資料表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 頻道表
CREATE TABLE channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 訊息表
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT, -- 允許 content 為空（例如只上傳圖片）
  file_url TEXT, -- 檔案或圖片的公開網址
  file_type TEXT, -- 檔案類型 (例如 image/png, application/pdf)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 注意：上傳檔案限制設為 5MB

-- 4. 預設頻道
INSERT INTO channels (name, description) VALUES
  ('一般討論', '日常溝通頻道'),
  ('工程', '技術討論'),
  ('設計', '設計相關話題'),
  ('隨便聊', '輕鬆話題');

-- ============================================
-- Row Level Security (RLS) 設定
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles: 所有登入使用者可讀，只能編輯自己
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Channels: 所有登入使用者可讀
CREATE POLICY "channels_select" ON channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "channels_insert" ON channels FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "channels_delete" ON channels FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Messages: 所有登入使用者可讀寫，只能刪自己的
CREATE POLICY "messages_select" ON messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "messages_delete" ON messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 新使用者自動建立 profile 的 Trigger
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 啟用 Realtime
-- ============================================
-- 在 Supabase Dashboard > Database > Replication
-- 將 messages, profiles 和 channels 表加入 realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE channels;

-- ============================================
-- 5. Storage 設定 (請在 Supabase Dashboard 建立 'chat-files' Bucket)
-- ============================================

-- 允許所有已登入使用者將檔案上傳到 chat-files bucket
-- 並限制大小在 5MB 以內 (5242880 bytes)
-- 注意：Bucket 必須先手動建立
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', true);

CREATE POLICY "Allow Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-files' AND
  (storage.extension(name) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'zip', 'docx'])) AND
  (octet_length(content) <= 5242880)
);

CREATE POLICY "Allow Public Select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-files');
