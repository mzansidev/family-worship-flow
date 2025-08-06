
-- Create function to get user principle reads
CREATE OR REPLACE FUNCTION get_user_principle_reads(p_user_id UUID)
RETURNS TABLE(principle_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT upr.principle_id
  FROM user_principle_reads upr
  WHERE upr.user_id = p_user_id;
END;
$$;

-- Create function to mark principle as read
CREATE OR REPLACE FUNCTION mark_principle_as_read(p_user_id UUID, p_principle_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_principle_reads (user_id, principle_id)
  VALUES (p_user_id, p_principle_id)
  ON CONFLICT (user_id, principle_id) DO NOTHING;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_principle_reads(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_principle_as_read(UUID, UUID) TO authenticated;
