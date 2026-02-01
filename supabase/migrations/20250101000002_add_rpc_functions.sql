-- Increment download count function
CREATE OR REPLACE FUNCTION increment_download_count(p_skill_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.skills
  SET download_count = download_count + 1
  WHERE id = p_skill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's purchased skills
CREATE OR REPLACE FUNCTION get_user_purchased_skills(p_user_id UUID)
RETURNS TABLE (
  skill_id UUID,
  skill_slug TEXT,
  skill_md_content TEXT,
  license_type license_type,
  purchased_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.slug,
    s.skill_md_content,
    p.license_type,
    p.created_at
  FROM public.purchases p
  JOIN public.skills s ON s.id = p.skill_id
  WHERE p.buyer_id = p_user_id
  AND p.status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has purchased a skill
CREATE OR REPLACE FUNCTION has_purchased_skill(p_user_id UUID, p_skill_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.purchases
    WHERE buyer_id = p_user_id
    AND skill_id = p_skill_id
    AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
