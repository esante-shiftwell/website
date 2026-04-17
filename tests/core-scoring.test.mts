import test from 'node:test';
import assert from 'node:assert/strict';

function makeDraft(segments) {
  return {
    participantCode: 'test-user',
    mode: 'short',
    profile: {
      professionCategory: 'nurse',
      ageBand: '25-34',
      sex: 'prefer_not_to_say',
      locale: 'en',
      timezone: 'Europe/Paris',
    },
    segments,
    longAnswers: {},
    updatedAt: '2026-04-17T00:00:00.000Z',
  };
}

function seg(id, dayIndex, start, end, kind) {
  return { id, dayIndex, start, end, kind };
}

function factor(bundle, key) {
  const found = bundle.trace.factors.find((item) => item.key === key);
  assert.ok(found, `missing factor ${key}`);
  return found;
}

test('stable sleep-only week yields perfect sleep and adaptability scores', async () => {
  const scoringModule = await import('../src/core/scoring.ts');
  const draft = makeDraft(
    Array.from({ length: 7 }, (_, dayIndex) =>
      seg(`sleep-${dayIndex}`, dayIndex, '00:00', '07:30', 'sleep'),
    ),
  );

  const bundle = scoringModule.calculateScores(draft);

  assert.equal(bundle.scoringVersion, 'shiftwell-proxy-v0.2');
  assert.equal(bundle.derived.avgSleepHours, 7.5);
  assert.equal(bundle.derived.sleepRegularityProxy, 100);
  assert.equal(bundle.sleepScore, 100);
  assert.equal(bundle.riskScore, 0);
  assert.equal(bundle.adaptabilityScore, 100);
});

test('alternating long shifts preserve workbook-aligned 24h breaks and rest days', async () => {
  const scoringModule = await import('../src/core/scoring.ts');
  const draft = makeDraft([
    seg('w0', 0, '08:00', '18:00', 'work'),
    seg('w2', 2, '08:00', '18:00', 'work'),
    seg('w4', 4, '08:00', '18:00', 'work'),
  ]);

  const bundle = scoringModule.calculateScores(draft);

  assert.equal(bundle.derived.totalWorkHours, 30);
  assert.equal(bundle.derived.longShiftCount, 3);
  assert.equal(bundle.derived.count24hBreaks, 4);
  assert.equal(bundle.derived.restDaysCount, 4);

  assert.equal(factor(bundle, 'longShifts').bucket, 2);
  assert.equal(factor(bundle, 'count24hBreaks').bucket, 0);
  assert.equal(factor(bundle, 'restDays').bucket, 0);
  assert.equal(factor(bundle, 'count24hBreaks').status, 'implemented');
  assert.equal(factor(bundle, 'restDays').status, 'implemented');
});

test('quick return plus night duty matches workbook-aligned risk buckets', async () => {
  const scoringModule = await import('../src/core/scoring.ts');
  const draft = makeDraft([
    seg('night', 0, '23:00', '07:00', 'work'),
    seg('quick-return', 1, '15:00', '23:00', 'work'),
    seg('weekend-social', 5, '10:00', '16:00', 'work'),
  ]);

  const bundle = scoringModule.calculateScores(draft);

  assert.equal(bundle.derived.shortBreaksCount, 1);
  assert.equal(bundle.derived.nightShiftCount, 1);
  assert.equal(bundle.derived.biologicalHoursLost, 8);
  assert.equal(bundle.derived.socialHoursLost, 11);

  assert.equal(factor(bundle, 'shortBreaks').bucket, 1);
  assert.equal(factor(bundle, 'nightShifts').bucket, 1);
  assert.equal(factor(bundle, 'biologicalHoursLost').bucket, 1);
  assert.equal(factor(bundle, 'socialHoursLost').bucket, 1);
  assert.equal(bundle.sliRaw, 4);
  assert.equal(bundle.riskScore, 25);
});

test('score trace exposes workbook-aligned factor keys in risk dependencies', async () => {
  const scoringModule = await import('../src/core/scoring.ts');
  const draft = makeDraft([
    seg('w0', 0, '08:00', '16:00', 'work'),
    seg('w1', 1, '08:00', '16:00', 'work'),
  ]);

  const bundle = scoringModule.calculateScores(draft);
  const riskScore = bundle.trace.scores.find((item) => item.key === 'riskScore');

  assert.ok(riskScore, 'missing riskScore trace');
  assert.ok(riskScore.dependsOn.includes('count24hBreaks'));
  assert.ok(riskScore.dependsOn.includes('restDays'));
  assert.ok(!riskScore.dependsOn.includes('longestRecovery'));
  assert.ok(!riskScore.dependsOn.includes('fullyRestedDays'));
});
