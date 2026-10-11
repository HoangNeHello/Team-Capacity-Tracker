// load.js: turns weekly hours and assigned hours into { percent, level }
// Pure function (no DB, no Express) so it's easy to unit test.
// under < 80% ≤ near ≤ 100% < over. 0 weekly hours → percent null (no divide by 0): over if they have work, else none.
export function getLoad(weeklyHours, assignedHours) {
    if (weeklyHours === 0) return { percent: null, level: assignedHours > 0 ? 'over' : 'none' };
    const percent = Math.round((assignedHours / weeklyHours) * 100);
    let level;
    if (percent > 100) {
        level = 'over';
    } else if (percent >= 80) {
        level = 'near';
    } else {
        level = 'under';
    }
    return { percent, level };
}
