// Activity logging is now handled server-side by Laravel
// This function is kept for backward compatibility but does nothing
// All CRUD operations in the backend automatically create activity logs

export async function logActivity(
  action: string,
  targetType: string,
  targetTitle: string
) {
  // Logging is handled by Laravel backend automatically
  console.log(`[Activity] ${action}: ${targetType} - ${targetTitle}`);
}

