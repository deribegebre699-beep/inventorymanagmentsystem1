-- ENABLE RLS (Row Level Security) on all critical tables
ALTER TABLE public."Companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OtpRecords" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;

-- CREATE BASELINE POLICIES (Allow All for now to ensure app works)
-- You can refine these later for better security.

-- Companies
CREATE POLICY "Enable all access for all users" ON public."Companies"
FOR ALL USING (true) WITH CHECK (true);

-- Categories
CREATE POLICY "Enable all access for all users" ON public."Categories"
FOR ALL USING (true) WITH CHECK (true);

-- Items
CREATE POLICY "Enable all access for all users" ON public."Items"
FOR ALL USING (true) WITH CHECK (true);

-- Notifications
CREATE POLICY "Enable all access for all users" ON public."Notifications"
FOR ALL USING (true) WITH CHECK (true);

-- OtpRecords
CREATE POLICY "Enable all access for all users" ON public."OtpRecords"
FOR ALL USING (true) WITH CHECK (true);

-- Users
CREATE POLICY "Enable all access for all users" ON public."Users"
FOR ALL USING (true) WITH CHECK (true);

-- Note: In the future, you should change these to:
-- FOR SELECT USING (auth.uid() = id) -- for Users
-- FOR SELECT USING (company_id = ...) -- for other tables
