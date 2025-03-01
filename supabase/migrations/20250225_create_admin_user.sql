-- Create an admin user if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@example.com',
      crypt('admin123', gen_salt('bf')), -- Change this password in production
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"username": "admin", "full_name": "Admin User", "role": "admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- The trigger will automatically create the profile
  END IF;
END
$$;
