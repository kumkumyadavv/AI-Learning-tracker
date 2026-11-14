import { Link } from 'react-router-dom';

const heatmapWeeks = [
  '0132102', '1233210', '2231201', '1323201', '0233321', '2333332',
  '3332132', '3210321', '2323321', '3213332', '1333321', '2333332',
  '3232132', '1323331', '1233232', '3223321', '2333322', '3212332',
  '0333321', '1333222', '2333333', '3223332', '0233321', '1333312',
  '2333321', '3233321',
];

const weeklyHours = [
  { day: 'M', hours: 1.5 },
  { day: 'T', hours: 0.75 },
  { day: 'W', hours: 2 },
  { day: 'T', hours: 2.5 },
  { day: 'F', hours: 0 },
  { day: 'S', hours: 1.25 },
  { day: 'S', hours: 0 },
];

const recentSessions = [
  { day: 'THU', title: 'Graph traversal', duration: '2h 30m' },
  { day: 'WED', title: 'Load balancers', duration: '2h 00m' },
  { day: 'TUE', title: 'Caching basics', duration: '45m' },
];

function StudyHeatmap() {
  return (
    <div
      className="landing-heatmap"
      role="img"
      aria-label="Sample study activity heatmap across 26 weeks"
    >
      {heatmapWeeks.flatMap((week, weekIndex) =>
        [...week].map((level, dayIndex) => {
          const intensity = Number(level);
          const isToday = weekIndex === 25 && dayIndex === 2;
          const className = [
            'landing-heat-cell',
            intensity > 0 && !isToday ? 'landing-heat-cell--filled' : '',
            isToday ? 'landing-heat-cell--today' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <span
              key={`${weekIndex}-${dayIndex}`}
              className={className}
              style={{
                '--heat-opacity': intensity === 1 ? 0.34 : intensity === 2 ? 0.62 : 0.96,
              }}
              aria-hidden="true"
            />
          );
        })
      )}
    </div>
  );
}

function WeeklyHours() {
  return (
    <div
      className="landing-hours-chart"
      role="img"
      aria-label="Hours this week: Monday 1.5, Tuesday 0.75, Wednesday 2, Thursday 2.5, Friday 0, Saturday 1.25, Sunday 0"
    >
      {weeklyHours.map(({ day, hours }, index) => (
        <div className="landing-hour-column" key={`${day}-${index}`}>
          <div className="landing-hour-track">
            <span
              className={`landing-hour-bar${index === 3 ? ' landing-hour-bar--today' : ''}`}
              style={{ height: `${Math.max(2, (hours / 2.5) * 70)}px` }}
            />
          </div>
          <span className="landing-hour-day">{day}</span>
        </div>
      ))}
    </div>
  );
}

function TrackerPreview() {
  return (
    <section
      className="landing-tracker"
      id="tracker-preview"
      aria-label="Sample learning tracker preview"
    >
      <p className="landing-eyebrow">SAMPLE DATA · 26 WEEKS</p>
      <StudyHeatmap />

      <dl className="landing-stats">
        <div className="landing-stat">
          <dt className="landing-stat-label">DAY STREAK</dt>
          <dd className="landing-stat-value landing-stat-value--streak">14</dd>
        </div>
        <div className="landing-stat">
          <dt className="landing-stat-label">THIS WEEK</dt>
          <dd className="landing-stat-value">6h 40m</dd>
        </div>
        <div className="landing-stat">
          <dt className="landing-stat-label">ROADMAP DONE</dt>
          <dd className="landing-stat-value landing-stat-value--cobalt">38%</dd>
        </div>
      </dl>

      <div className="landing-detail-grid">
        <section className="landing-detail-section" aria-labelledby="landing-hours-title">
          <h2 className="landing-eyebrow" id="landing-hours-title">HOURS THIS WEEK</h2>
          <WeeklyHours />
        </section>

        <section className="landing-detail-section" aria-labelledby="landing-sessions-title">
          <h2 className="landing-eyebrow" id="landing-sessions-title">RECENT SESSIONS</h2>
          <ul className="landing-session-list">
            {recentSessions.map((session) => (
              <li className="landing-session" key={session.day}>
                <span className="landing-session-day">{session.day}</span>
                <span className="landing-session-title">{session.title}</span>
                <span className="landing-session-duration">{session.duration}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="landing-page">
      <header className="landing-navbar">
        <Link className="landing-wordmark" to="/" aria-label="AI Learning Tracker home">
          ai-learning-tracker
        </Link>
        <nav className="landing-nav-links" aria-label="Main navigation">
          <a className="landing-nav-link" href="#tracker-preview">How it works</a>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-copy">
            <h1 className="landing-title" id="landing-title">
              Finish what<br />you plan.
            </h1>
            <p className="landing-description">
              Set a goal and get a phased roadmap. Log every session and watch your streak build.
            </p>
            <div className="landing-actions">
              <Link className="landing-button landing-button--primary landing-action-primary" to="/register">
                Create account
              </Link>
              <Link className="landing-button landing-button--outline" to="/login">
                Sign in
              </Link>
            </div>
          </div>

          <TrackerPreview />
        </section>
      </main>
    </div>
  );
}
