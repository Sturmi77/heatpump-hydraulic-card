// Keeps the traffic numbers of the repository beyond the 14 days that GitHub shows.
//
// GitHub deletes daily views and clones after 14 days and shows referrers and popular pages for the last 14 days only.
// This script reads them and merges them into a JSON file: one entry per day (views, clones) and one snapshot per run
// (stars, forks, referrers, popular pages, download counts of the release assets). The weekly workflow
// .github/workflows/traffic.yml keeps the file on the branch "traffic-stats".
//
//   node scripts/traffic-snapshot.mjs <file>            merge today's numbers into <file> (created if missing)
//   node scripts/traffic-snapshot.mjs <file> --dry-run  print the numbers, change nothing
//   node scripts/traffic-snapshot.mjs <file> --report   print a short summary of <file>
//
// The traffic endpoints need a token with read access to the repository administration (a fine-grained token with
// "Administration: read"); the automatic GITHUB_TOKEN of a workflow cannot read them. The token is TRAFFIC_TOKEN.
import { readFile, writeFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const flag = (name) => args.includes(name);
const repo = process.env.GITHUB_REPOSITORY || 'Sturmi77/heatpump-hydraulic-card';
const token = process.env.TRAFFIC_TOKEN || process.env.GITHUB_TOKEN;
const KEEP_SNAPSHOTS = 520; // about ten years of weekly runs

if (!file) {
  console.error('Usage: node scripts/traffic-snapshot.mjs <file> [--dry-run | --report]');
  process.exit(2);
}

const load = async () => {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return { repo, days: {}, snapshots: [] };
    throw error;
  }
};

if (flag('--report')) {
  const data = await load();
  const days = Object.entries(data.days).sort(([a], [b]) => a.localeCompare(b));
  const sum = (key) => days.reduce((total, [, day]) => total + (day[key] || 0), 0);
  const last = data.snapshots.at(-1);
  console.log(`${days.length} days from ${days[0]?.[0] ?? '-'} to ${days.at(-1)?.[0] ?? '-'}`);
  console.log(`views ${sum('views')} (unique per day summed ${sum('view_uniques')}), clones ${sum('clones')} (${sum('clone_uniques')})`);
  if (last) {
    const assets = Object.entries(last.downloads || {}).map(([tag, n]) => `${tag} ${n}`).join(', ');
    console.log(`last snapshot ${last.date}: ${last.stars} stars, ${last.forks} forks; downloads ${assets || '-'}`);
  }
  process.exit(0);
}

if (!token) {
  console.error('TRAFFIC_TOKEN is not set: a token with "Administration: read" on the repository is needed for the traffic numbers.');
  process.exit(1);
}

const get = async (path) => {
  const response = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  });
  if (!response.ok) throw new Error(`GET ${path}: ${response.status} ${(await response.text()).slice(0, 200)}`);
  return response.json();
};

const [info, views, clones, referrers, paths, releases] = await Promise.all([
  get(''), get('/traffic/views'), get('/traffic/clones'), get('/traffic/popular/referrers'), get('/traffic/popular/paths'),
  get('/releases?per_page=100'),
]);

const data = await load();
const today = new Date().toISOString().slice(0, 10);
// Every run replaces the days it sees (the newest day is only partial until the next run); older days stay.
for (const v of views.views) data.days[v.timestamp.slice(0, 10)] = { ...data.days[v.timestamp.slice(0, 10)], views: v.count, view_uniques: v.uniques };
for (const c of clones.clones) data.days[c.timestamp.slice(0, 10)] = { ...data.days[c.timestamp.slice(0, 10)], clones: c.count, clone_uniques: c.uniques };

const downloads = {};
for (const release of releases) {
  for (const asset of release.assets) downloads[release.tag_name] = (downloads[release.tag_name] || 0) + asset.download_count;
}
const snapshot = {
  date: today,
  stars: info.stargazers_count,
  forks: info.forks_count,
  watchers: info.subscribers_count,
  open_issues: info.open_issues_count,
  views_14d: { count: views.count, uniques: views.uniques },
  clones_14d: { count: clones.count, uniques: clones.uniques },
  referrers: referrers.map((r) => ({ referrer: r.referrer, count: r.count, uniques: r.uniques })),
  paths: paths.map((p) => ({ path: p.path, count: p.count, uniques: p.uniques })),
  downloads,
};
// One snapshot per day: a second run on the same day replaces the first.
data.snapshots = [...data.snapshots.filter((s) => s.date !== today), snapshot].slice(-KEEP_SNAPSHOTS);
data.days = Object.fromEntries(Object.entries(data.days).sort(([a], [b]) => a.localeCompare(b)));

if (flag('--dry-run')) {
  console.log(JSON.stringify(snapshot, null, 2));
  console.log(`${Object.keys(data.days).length} days would be kept.`);
} else {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${file}: ${Object.keys(data.days).length} days, ${data.snapshots.length} snapshot(s), ${snapshot.stars} stars.`);
}
