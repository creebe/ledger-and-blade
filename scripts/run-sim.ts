import { runSim } from './sim';
const games = Number(process.argv[2] ?? 100);
const weeks = Number(process.argv[3] ?? 48);
for (const mc of [0.35, 0.5, 0.65]) console.log(`minChance ${mc}`, JSON.stringify(runSim(games, weeks, mc)));
