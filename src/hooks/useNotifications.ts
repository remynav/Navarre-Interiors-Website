import { supabase } from '@/integrations/supabase/client';

interface SendNotificationParams {
  userId: string;
  type: 'message' | 'rendering' | 'document' | 'milestone' | 'inspiration';
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
}

export async function sendNotification({
  userId,
  type,
  title,
  message,
  referenceId,
  referenceType
}: SendNotificationParams) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      reference_id: referenceId,
      reference_type: referenceType
    });

  if (error) {
    console.error('Failed to send notification:', error);
  }
}

export async function notifyAdmins(
  type: SendNotificationParams['type'],
  title: string,
  message: string,
  referenceId?: string,
  referenceType?: string
) {
  // Get all admin user IDs
  const { data: adminRoles } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');

  if (!adminRoles || adminRoles.length === 0) return;

  // Send notification to each admin
  const notifications = adminRoles.map(role => ({
    user_id: role.user_id,
    type,
    title,
    message,
    reference_id: referenceId,
    reference_type: referenceType
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    console.error('Failed to notify admins:', error);
  }
}
