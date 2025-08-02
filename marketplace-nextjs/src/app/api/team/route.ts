
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch team members
export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // First, get the team ID for the current user
  const { data: teamData, error: teamError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', session.user.id)
    .single();

  if (teamError || !teamData) {
    return NextResponse.json({ error: 'You are not part of any team.' }, { status: 404 });
  }

  // Now, fetch all members of that team
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select(`
      id,
      role,
      profiles (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('team_id', teamData.team_id);

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  return NextResponse.json(members);
}

// POST - Invite a new member
export async function POST(req: NextRequest) {
  const { email, role } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!email || !role) {
    return NextResponse.json({ error: 'Email and role are required.' }, { status: 400 });
  }

  // In a real application, you would add logic here to:
  // 1. Verify the current user has 'Admin' or 'Owner' permissions to invite.
  // 2. Look up the team ID of the current user.
  // 3. Check if the invited user already exists in the system.
  // 4. Create an invitation record in a separate 'invitations' table.
  // 5. Send an email to the invited user.
  
  // For this implementation, we'll return a success message.
  console.log(`User ${session.user.email} invited ${email} with role ${role}`);
  
  return NextResponse.json({ message: 'Invitation sent successfully.' });
}
