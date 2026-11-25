import { runSim } from './sim';
const games = Number(process.argv[2] ?? 100);
const weeks = Number(process.argv[3] ?? 48);
const show = (r: ReturnType<typeof runSim>) => {
  const { byStart, ...rest } = r;
  void byStart;
  return JSON.stringify(rest);
};
for (const mc of [0.35, 0.5, 0.65]) console.log(`caution ${mc}, good prep`, show(runSim(games, weeks, mc, 'good')));
console.log('caution 0.5, poor prep', show(runSim(games, weeks, 0.5, 'poor')));
