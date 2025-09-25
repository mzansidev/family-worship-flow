-- Add foreign key constraints for leader_id and assistant_id to reference family_members
ALTER TABLE daily_worship_entries 
ADD CONSTRAINT fk_daily_worship_entries_leader 
FOREIGN KEY (leader_id) REFERENCES family_members(id) ON DELETE SET NULL;

ALTER TABLE daily_worship_entries 
ADD CONSTRAINT fk_daily_worship_entries_assistant 
FOREIGN KEY (assistant_id) REFERENCES family_members(id) ON DELETE SET NULL;