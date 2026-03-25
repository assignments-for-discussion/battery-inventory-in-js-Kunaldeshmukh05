'use strict'; // strict mode for better error handling

const assert = require('assert');

const RATED_CAPACITY_AH = 120;

const SOH_THRESHOLDS = {
  healthy: 83,
  failed: 63,
};

//pure function -> compute SoH percentage from present capacity
function computeSoH(presentCapacity) {
  return (presentCapacity / RATED_CAPACITY_AH) * 100;
}

// Classification based on SoH percentage thresholds
function classifyBattery(soh) {
  if (soh > SOH_THRESHOLDS.healthy) return 'healthy';
  if (soh >= SOH_THRESHOLDS.failed) return 'exchange';
  return 'failed';
}

// Main function to count batteries by health status
function countBatteriesByHealth(presentCapacities) {
  const counts = { healthy: 0, exchange: 0, failed: 0 };

  for (const capacity of presentCapacities) {
    const soh = computeSoH(capacity);
    const classification = classifyBattery(soh);
    counts[classification]++;
  }

  return counts;
}

// --- Tests ---

function testBucketingByHealth() {
  console.log('Counting batteries by SoH...');
  const presentCapacities = [113, 116, 80, 95, 92, 70];
  const counts = countBatteriesByHealth(presentCapacities);
  assert(counts['healthy'] === 2);
  assert(counts['exchange'] === 3);
  assert(counts['failed'] == 1);
  console.log('Done counting :)');
}

function testBoundaryConditions() {
  console.log('Testing boundary conditions...');

  // 83% of 120 = 99.6 Ah — exactly at healthy boundary → exchange (boundary is exclusive)
  let counts = countBatteriesByHealth([99.6]);
  assert(counts['exchange'] == 1, 'SoH exactly at 83% should be exchange, not healthy');

  // Just above 83% → healthy
  counts = countBatteriesByHealth([99.61]);
  assert(counts['healthy'] == 1, 'SoH just above 83% should be healthy');

  // 63% of 120 = 75.6 Ah — exactly at failed boundary → exchange (boundary is exclusive)
  counts = countBatteriesByHealth([75.6]);
  assert(counts['exchange'] == 1, 'SoH exactly at 63% should be exchange, not failed');

  // Just below 63% → failed
  counts = countBatteriesByHealth([75.59]);
  assert(counts['failed'] == 1, 'SoH just below 63% should be failed');

  // Full rated capacity (100% SoH) → healthy
  counts = countBatteriesByHealth([120]);
  assert(counts['healthy'] == 1, 'Full rated capacity should be healthy');

  // Empty input → all zeros, no crash
  counts = countBatteriesByHealth([]);
  assert(
    counts['healthy'] == 0 && counts['exchange'] == 0 && counts['failed'] == 0,
    'Empty input should return all zeros without crashing'
  );

  console.log('Boundary conditions passed :');
}

testBucketingByHealth();
testBoundaryConditions();