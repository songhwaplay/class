export type RankableRaceParticipant = {
  name: string;
  submitted_at: number | null;
  correct_count: number | null;
  total_count: number | null;
  mistake_count: number;
};

export function rankArrivedParticipants<T extends RankableRaceParticipant>(rows: readonly T[]) {
  return rows
    .filter((row) => row.submitted_at !== null && row.total_count !== null && row.correct_count === row.total_count)
    .sort((a, b) =>
      (Number(a.mistake_count) || 0) - (Number(b.mistake_count) || 0)
      || (Number(a.submitted_at) || Infinity) - (Number(b.submitted_at) || Infinity)
      || a.name.localeCompare(b.name, "ko"),
    );
}
