import type { ScheduleBlock } from '../types';

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Check if a schedule block is currently active
 */
export const isBlockActive = (block: ScheduleBlock): boolean => {
  const now = new Date();
  const currentDay = now.getDay(); // 0-6
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  if (block.day_of_week !== currentDay) {
    return false;
  }

  const [startHour, startMin] = block.start_time.split(':').map(Number);
  const [endHour, endMin] = block.end_time.split(':').map(Number);

  const blockStart = startHour * 60 + startMin;
  const blockEnd = endHour * 60 + endMin;

  return currentTime >= blockStart && currentTime < blockEnd;
};

/**
 * Get the active schedule block for a user and account (if any)
 */
export const getActiveBlock = (
  blocks: ScheduleBlock[],
  accountId: string,
  recruiterId: string
): ScheduleBlock | null => {
  const activeBlocks = blocks.filter(
    (block) =>
      block.account_id === accountId &&
      block.recruiter_id === recruiterId &&
      isBlockActive(block)
  );

  return activeBlocks.length > 0 ? activeBlocks[0] : null;
};

/**
 * Check if user can access an account right now
 */
export const canAccessAccount = (
  blocks: ScheduleBlock[],
  accountId: string,
  recruiterId: string
): { canAccess: boolean; block: ScheduleBlock | null } => {
  const block = getActiveBlock(blocks, accountId, recruiterId);
  return {
    canAccess: block !== null,
    block,
  };
};

/**
 * Get all schedule blocks for a specific account
 */
export const getBlocksForAccount = (
  blocks: ScheduleBlock[],
  accountId: string
): ScheduleBlock[] => {
  return blocks.filter((block) => block.account_id === accountId);
};

/**
 * Get all schedule blocks for a specific recruiter
 */
export const getBlocksForRecruiter = (
  blocks: ScheduleBlock[],
  recruiterId: string
): ScheduleBlock[] => {
  return blocks.filter((block) => block.recruiter_id === recruiterId);
};

/**
 * Format time string for display (HH:MM:SS -> HH:MM AM/PM)
 */
export const formatTime = (timeString: string): string => {
  const [hour, minute] = timeString.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format time for database storage (HH:MM AM/PM -> HH:MM:SS)
 */
export const formatTimeForDB = (hour: number, minute: number): string => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
};

/**
 * Get blocks for a specific day
 */
export const getBlocksForDay = (
  blocks: ScheduleBlock[],
  dayOfWeek: number
): ScheduleBlock[] => {
  return blocks.filter((block) => block.day_of_week === dayOfWeek);
};

/**
 * Check if there's a schedule conflict
 */
export const hasScheduleConflict = (
  existingBlocks: ScheduleBlock[],
  newBlock: {
    account_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  },
  excludeId?: string
): boolean => {
  const [newStartHour, newStartMin] = newBlock.start_time.split(':').map(Number);
  const [newEndHour, newEndMin] = newBlock.end_time.split(':').map(Number);
  const newStart = newStartHour * 60 + newStartMin;
  const newEnd = newEndHour * 60 + newEndMin;

  return existingBlocks.some((block) => {
    if (excludeId && block.id === excludeId) {
      return false; // Skip the block being edited
    }

    if (
      block.account_id !== newBlock.account_id ||
      block.day_of_week !== newBlock.day_of_week
    ) {
      return false;
    }

    const [blockStartHour, blockStartMin] = block.start_time.split(':').map(Number);
    const [blockEndHour, blockEndMin] = block.end_time.split(':').map(Number);
    const blockStart = blockStartHour * 60 + blockStartMin;
    const blockEnd = blockEndHour * 60 + blockEndMin;

    // Check if time ranges overlap
    return (
      (newStart >= blockStart && newStart < blockEnd) ||
      (newEnd > blockStart && newEnd <= blockEnd) ||
      (newStart <= blockStart && newEnd >= blockEnd)
    );
  });
};
