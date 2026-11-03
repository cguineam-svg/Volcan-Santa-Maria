import { supabase } from '../../lib/supabase';
import { withOfflineCache } from '../../lib/offline-cache';
import type {
  CreateGroupVisitInput,
  GroupVisitDetails,
  GroupVisitMemberRole,
  GroupVisitParticipant,
  GroupVisitStatus,
  EarlyReturnReason,
  VisitHistoryItem,
  VisitHistoryMember,
  VisitMemberStatus,
  VisitType,
  VisitStartMode,
  VisitMinor,
} from './visit-types';

// Without signal an expired token makes supabase-js retry its refresh for about 30 seconds
// before failing, which would leave the person waiting on a button with no answer.
function rpcWhenOnline(functionName: string, args?: Record<string, unknown>) {
  if (!navigator.onLine) throw new TypeError('Failed to fetch');
  return supabase.rpc(functionName, args);
}

type ActiveVisitRow = {
  visit_id: string;
  status: GroupVisitStatus;
};

type ParticipantRow = {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_kind: 'uploaded' | 'preset' | 'initials' | null;
  avatar_path: string | null;
  avatar_preset: GroupVisitParticipant['avatarPreset'];
  member_role: GroupVisitMemberRole;
  member_status: VisitMemberStatus;
  joined_at: string;
  return_started_at: string | null;
  checked_out_at: string | null;
};

type GroupVisitDetailsRow = {
  visit_id: string;
  route_id: string;
  route_name_es: string;
  route_name_en: string;
  status: GroupVisitStatus;
  join_code: string | null;
  visit_type: VisitType;
  start_mode: VisitStartMode;
  has_local_guide: boolean;
  guide_name: string | null;
  planned_start_at: string | null;
  started_at: string | null;
  expected_return_at: string | null;
  completed_at: string | null;
  created_by: string;
  participants: ParticipantRow[];
};

type CreatedVisitRow = {
  visit_id: string;
  join_code: string;
};

type VisitHistoryRow = {
  visit_id: string;
  visit_date: string;
  visit_type: VisitType;
  visit_status: GroupVisitStatus;
  route_name_es: string;
  route_name_en: string;
  member_role: GroupVisitMemberRole;
  member_status: VisitMemberStatus;
  planned_start_at: string | null;
  started_at: string | null;
  expected_return_at: string | null;
  completed_at: string | null;
  return_started_at: string | null;
  checked_out_at: string | null;
  participant_count: number;
  creation_origin: 'tourist' | 'administrative';
  completion_method: 'normal' | 'administrative' | 'pending';
};

type VisitHistoryMemberRow = {
  first_name: string;
  last_name: string;
  member_role: GroupVisitMemberRole;
  member_status: VisitMemberStatus;
  checked_out_at: string | null;
};

function firstRow<Row>(data: unknown): Row | null {
  return Array.isArray(data) && data.length > 0 ? (data[0] as Row) : null;
}

export async function getVisitMinors(visitId: string): Promise<VisitMinor[]> {
  return withOfflineCache(`visit-minors:${visitId}`, async () => {
    const { data, error } = await rpcWhenOnline('get_visit_minors', {
      p_visit_id: visitId,
    });
    if (error) throw error;
    return (
      (data ?? []) as Array<{
        id: string;
        full_name: string;
        age: number;
        sex: 'male' | 'female';
        relationship: string;
        responsible_member_id: string;
        responsible_name: string;
        operational_status: VisitMinor['operationalStatus'];
      }>
    ).map((row) => ({
      id: row.id,
      fullName: row.full_name,
      age: row.age,
      sex: row.sex,
      relationship: row.relationship,
      responsibleMemberId: row.responsible_member_id,
      responsibleName: row.responsible_name,
      operationalStatus: row.operational_status,
    }));
  });
}
function mapParticipant(row: ParticipantRow): GroupVisitParticipant {
  return {
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarKind: row.avatar_kind,
    avatarPath: row.avatar_path,
    avatarPreset: row.avatar_preset,
    memberRole: row.member_role,
    memberStatus: row.member_status,
    joinedAt: row.joined_at,
    returnStartedAt: row.return_started_at,
    checkedOutAt: row.checked_out_at,
  };
}

function mapDetails(row: GroupVisitDetailsRow): GroupVisitDetails {
  return {
    visitId: row.visit_id,
    routeId: row.route_id,
    routeNameEs: row.route_name_es,
    routeNameEn: row.route_name_en,
    status: row.status,
    joinCode: row.join_code,
    visitType: row.visit_type,
    startMode: row.start_mode,
    hasLocalGuide: row.has_local_guide,
    guideName: row.guide_name,
    plannedStartAt: row.planned_start_at,
    startedAt: row.started_at,
    expectedReturnAt: row.expected_return_at,
    completedAt: row.completed_at,
    createdBy: row.created_by,
    participants: Array.isArray(row.participants)
      ? row.participants.map(mapParticipant)
      : [],
  };
}

export async function getMyActiveGroupVisit(): Promise<ActiveVisitRow | null> {
  return withOfflineCache('active-visit', async () => {
    const { data, error } = await rpcWhenOnline('get_my_active_group_visit');

    if (error) throw error;
    return firstRow<ActiveVisitRow>(data);
  });
}

export async function getGroupVisitDetails(
  visitId: string
): Promise<GroupVisitDetails> {
  return withOfflineCache(`visit-details:${visitId}`, async () => {
    const { data, error } = await rpcWhenOnline('get_group_visit_details', {
      p_visit_id: visitId,
    });

    if (error) throw error;

    const row = firstRow<GroupVisitDetailsRow>(data);
    if (!row) throw new Error('Group visit details were not returned');

    return mapDetails(row);
  });
}

export async function createGroupVisit(
  input: CreateGroupVisitInput
): Promise<string> {
  const { data, error } = await rpcWhenOnline('create_group_visit_with_minors', {
    p_route_id: input.routeId,
    p_visit_type: input.visitType,
    p_start_mode: input.startMode,
    p_planned_start_at: input.plannedStartAt,
    p_expected_return_at: input.expectedReturnAt,
    p_has_local_guide: input.hasLocalGuide,
    p_guide_name: input.guideName,
    p_terms_accepted: true,
    p_recommendations_accepted: input.recommendationsAccepted,
    p_responsibility_consent_accepted:
      input.minorResponsibilityConsentAccepted,
    p_minors: input.minors.map((minor) => ({
      full_name: minor.fullName,
      age: minor.age,
      sex: minor.sex,
      relationship: minor.relationship,
    })),
  });

  if (error) throw error;

  const row = firstRow<CreatedVisitRow>(data);
  if (!row) throw new Error('Created group visit was not returned');

  return row.visit_id;
}

export async function joinGroupVisit(joinCode: string): Promise<string> {
  const { data, error } = await rpcWhenOnline('join_group_visit', {
    join_code: joinCode,
    terms_accepted: true,
  });

  if (error) throw error;
  if (typeof data !== 'string')
    throw new Error('Joined group visit was not returned');

  return data;
}

async function runVisitAction(
  functionName:
    | 'start_group_visit'
    | 'complete_my_visit_participation'
    | 'cancel_group_visit',
  visitId: string
): Promise<void> {
  const { error } = await rpcWhenOnline(functionName, { visit_id: visitId });
  if (error) throw error;
}

export function startGroupVisit(visitId: string): Promise<void> {
  return runVisitAction('start_group_visit', visitId);
}

export function completeMyVisitParticipation(visitId: string): Promise<void> {
  return runVisitAction('complete_my_visit_participation', visitId);
}

export function cancelGroupVisit(visitId: string): Promise<void> {
  return runVisitAction('cancel_group_visit', visitId);
}

async function runMemberAction(
  functionName: 'withdraw_from_group' | 'confirm_my_early_checkout',
  visitId: string
): Promise<void> {
  const { error } = await rpcWhenOnline(functionName, {
    p_visit_id: visitId,
  });
  if (error) throw error;
}

export function withdrawFromGroup(visitId: string): Promise<void> {
  return runMemberAction('withdraw_from_group', visitId);
}

export function confirmMyEarlyCheckout(visitId: string): Promise<void> {
  return runMemberAction('confirm_my_early_checkout', visitId);
}

export async function removeMemberBeforeStart(
  visitId: string,
  userId: string
): Promise<void> {
  const { error } = await rpcWhenOnline('remove_member_before_start', {
    p_visit_id: visitId,
    p_user_id: userId,
  });
  if (error) throw error;
}

export async function startEarlyReturn(
  visitId: string,
  reason: EarlyReturnReason,
  notes: string | null
): Promise<void> {
  const { error } = await rpcWhenOnline('start_early_return', {
    p_visit_id: visitId,
    p_reason: reason,
    p_notes: notes,
  });
  if (error) throw error;
}

export async function markMemberReturningEarly(
  visitId: string,
  userId: string,
  reason: EarlyReturnReason,
  notes: string | null
): Promise<void> {
  const { error } = await rpcWhenOnline('mark_member_returning_early', {
    p_visit_id: visitId,
    p_user_id: userId,
    p_reason: reason,
    p_notes: notes,
  });
  if (error) throw error;
}

export async function getMyVisitHistory(
  limit: number,
  offset: number
): Promise<VisitHistoryItem[]> {
  const { data, error } = await rpcWhenOnline('get_my_visit_history', {
    p_limit: limit,
    p_offset: offset,
  });

  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return (data as VisitHistoryRow[]).map((row) => ({
    visitId: row.visit_id,
    visitDate: row.visit_date,
    visitType: row.visit_type,
    visitStatus: row.visit_status,
    routeNameEs: row.route_name_es,
    routeNameEn: row.route_name_en,
    memberRole: row.member_role,
    memberStatus: row.member_status,
    plannedStartAt: row.planned_start_at,
    startedAt: row.started_at,
    expectedReturnAt: row.expected_return_at,
    completedAt: row.completed_at,
    returnStartedAt: row.return_started_at,
    checkedOutAt: row.checked_out_at,
    participantCount: row.participant_count,
    creationOrigin: row.creation_origin,
    completionMethod: row.completion_method,
  }));
}

export async function getVisitHistoryMembers(
  visitId: string
): Promise<VisitHistoryMember[]> {
  const { data, error } = await rpcWhenOnline('get_visit_history_members', {
    p_visit_id: visitId,
  });

  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return (data as VisitHistoryMemberRow[]).map((row) => ({
    firstName: row.first_name,
    lastName: row.last_name,
    memberRole: row.member_role,
    memberStatus: row.member_status,
    checkedOutAt: row.checked_out_at,
  }));
}

export async function changeVisitRoute(visitId: string, routeId: string, returnedToStart = false): Promise<void> {
  const { error } = await rpcWhenOnline('change_visit_route', { p_visit_id: visitId, p_route_id: routeId, p_returned_to_start: returnedToStart });
  if (error) throw error;
}
export async function recordMyEarlyReturn(visitId: string, reason: EarlyReturnReason, notes: string | null): Promise<void> {
  const { error } = await rpcWhenOnline('record_my_early_return', { p_visit_id: visitId, p_reason: reason, p_notes: notes });
  if (error) throw error;
}

export async function addMyVisitMinors(visitId: string, minors: CreateGroupVisitInput['minors'], consent: boolean): Promise<void> {
  const { error } = await rpcWhenOnline('add_my_visit_minors', { p_visit_id: visitId,
    p_minors: minors.map((minor) => ({ full_name: minor.fullName, age: minor.age, sex: minor.sex, relationship: minor.relationship })),
    p_responsibility_consent_accepted: consent });
  if (error) throw error;
}
export async function removeMyVisitMinor(visitId: string, minorId: string): Promise<void> {
  const { error } = await rpcWhenOnline('remove_my_visit_minor', { p_visit_id: visitId, p_minor_id: minorId });
  if (error) throw error;
}
