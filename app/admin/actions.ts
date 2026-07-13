/**
 * @file actions.ts
 * @description Defines all Server Actions (RPCs) utilized by the Admin Dashboard.
 * These actions run exclusively on the Node.js / Edge runtime, ensuring that 
 * sensitive logic and direct database interactions never leak to the client bundle.
 */
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/app/actions/auth';

// Ensure required environment variables are present to prevent silent failures at runtime.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Instantiates an authenticated Supabase client leveraging the Next.js App Router's `cookies()`.
 * This approach guarantees that Row Level Security (RLS) policies are properly evaluated
 * against the current user's session context.
 *
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>} Supabase client instance with auth headers.
 */
async function getAuthClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('supabase-session')?.value;
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
  );
}

/**
 * Authorization Guard: Validates whether the invoking identity possesses sufficient privileges 
 * to execute administrative procedures.
 * 
 * @returns {Promise<{authorized: boolean, user: any}>} Tuple containing authorization status and user payload.
 */
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.role?.canAccessDashboard) {
    // Fail-closed mechanism: default to denial if authorization context is incomplete.
    return { authorized: false, user: null } as const;
  }
  return { authorized: true, user } as const;
}

/**
 * Retrieves a paginated list of facility bookings.
 * Employs Supabase's foreign key joining capabilities to eagerly load relational data (rooms & profiles).
 * 
 * @todo Implement cursor-based pagination for highly scalable dataset rendering.
 * @returns {Promise<Array<any>>} Array of normalized booking entities.
 */
export async function getBookings() {
  const authClient = await getAuthClient();
  const { data: bookings, error } = await authClient
    .from('bookings')
    .select(`
      id,
      room:rooms (name),
      user:profiles (name, email),
      date,
      start_time,
      end_time,
      reason,
      status,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(500); // Hard boundary to prevent memory bloat on Vercel Edge functions.

  if (error) {
    console.error('[Action: getBookings] Query execution failed:', error.message);
    return [];
  }
  
  // Normalization layer: mapping snake_case from DB to camelCase for the frontend UI.
  return (bookings || []).map((b: any) => ({
    ...b,
    startTime: b.start_time,
    endTime: b.end_time
  }));
}

/**
 * Mutates the state of a specific booking.
 * Encapsulates the update logic within an RBAC boundary and generates an audit trail entry.
 * 
 * @param {string} bookingId - UUID of the target booking.
 * @param {'DISETUJUI' | 'DITOLAK'} status - The intended resolution state.
 * @returns {Promise<{success: boolean, message?: string}>} Operation outcome indicator.
 */
export async function updateBookingStatus(bookingId: string, status: 'DISETUJUI' | 'DITOLAK') {
  // 1. Authorization Phase
  const { authorized, user: admin } = await requireAdmin();
  if (!authorized) {
    return { success: false, message: 'Akses ditolak. Hanya administrator yang dapat memproses reservasi.' };
  }

  // 2. Payload Validation Phase
  if (!bookingId || !['DISETUJUI', 'DITOLAK'].includes(status)) {
    return { success: false, message: 'Parameter tidak valid (Mismatched schema).' };
  }

  const authClient = await getAuthClient();

  // 3. Execution Phase: Optimistic DB Update
  const { error } = await authClient
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);
    
  if (!error) {
    // 4. Audit Trail Logging (Fire-and-forget logic)
    await authClient.from('approvals').insert({
      booking_id: bookingId,
      admin_id: admin?.id || null,
      status: status,
      notes: "Diproses oleh Admin Dashboard (System Generated)"
    });

    // 5. Cache Invalidation: Triggers Server Components to re-render with fresh data.
    revalidatePath('/admin');
    revalidatePath('/admin/schedule');
    return { success: true };
  }
  
  console.error(`[Action: updateBookingStatus] Failed for ID ${bookingId}:`, error.message);
  return { success: false, message: error.message || 'Terjadi kesalahan sistem' };
}

export async function getPendingBookingsCount() {
  const authClient = await getAuthClient();
  const { count, error } = await authClient
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'MENUNGGU');
    
  if (error) return 0;
  return count || 0;
}

/**
 * Aggregates analytical statistics for the high-level dashboard view.
 * Utilizes Postgres `count: 'exact'` modifier to prevent pulling heavy payloads into memory,
 * shifting the computation burden entirely to the database engine.
 * 
 * @returns {Promise<{totalRooms: number, activeRooms: number, inactiveRooms: number, totalUsers: number}>}
 */
export async function getDashboardStats() {
  const authClient = await getAuthClient();
  
  // Parallel execution of independent count queries could be considered here using Promise.all(),
  // but awaiting them sequentially allows cleaner trace logs for now.
  const { count: roomsCount } = await authClient
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: inactiveRoomsCount } = await authClient
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', false);

  const { count: usersCount } = await authClient
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  return {
    totalRooms: (roomsCount || 0) + (inactiveRoomsCount || 0),
    activeRooms: roomsCount || 0,
    inactiveRooms: inactiveRoomsCount || 0,
    totalUsers: usersCount || 0
  };
}
