// components/WorkloadBar.jsx: one member's row on the Workload card (name, hours, bar, %, word).
import Avatar from './Avatar.jsx';

const TRACK_MAX = 150;
const WORDS = { under: 'Under', near: 'Near', over: 'Over' };

export default function WorkloadBar({ member }) {
  const { name, weeklyHours, assignedHours, percent, level } = member;
  const noHours = percent === null;
  const word = noHours ? 'No hours' : WORDS[level];
  const width = noHours ? 0 : (Math.min(percent, TRACK_MAX) / TRACK_MAX) * 100;
  const summary = noHours
    ? `No hours · ${assignedHours} h assigned`
    : `${percent}% · ${assignedHours} / ${weeklyHours} h · ${word}`;

  return (
    <div className="workload-row">
      <span className="workload-name"><Avatar name={name} /></span>
      <span className="workload-hours num">{assignedHours} / {weeklyHours} h</span>
      <div className="workload-bar">
        <div
          className={noHours ? 'workload-track workload-track-none' : 'workload-track'}
          role="meter"
          aria-label={`${name} workload`}
          aria-valuemin={0}
          aria-valuemax={TRACK_MAX}
          aria-valuenow={noHours ? 0 : Math.min(percent, TRACK_MAX)}
          aria-valuetext={summary}
        >
          {!noHours && <div className={`workload-fill fill-${level}`} style={{ width: `${width}%` }} />}
        </div>
      </div>
      <span className="workload-percent num" aria-hidden="true">{noHours ? '—' : `${percent}%`}</span>
      <span className={`workload-word word-${noHours ? 'none' : level}`} aria-hidden="true">{word}</span>
    </div>
  );
}
