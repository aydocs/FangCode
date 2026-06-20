/**
 * FangCode — Usage Examples
 */
const { FangCode } = require('../src');
async function main() {
  const fc = new FangCode(); await fc.init();
  console.log('=== Agents ===');
  const agents = fc.manager.list();
  console.log(`Found ${agents.length} agents\n`);
  console.log('=== Search: "security" ===');
  fc.manager.search('security').forEach(a => console.log(`  ${a.slug} — ${a.description}`));
  console.log('\n=== Run ===');
  const config = await fc.manager.run('rust-developer', { task: 'Build CLI tool' });
  console.log(`Agent: ${config.agent}, Model: ${config.config.model}`);
  console.log('\n=== Route ===');
  const match = fc.route('help with Docker and Kubernetes');
  if (match) console.log(`Best: ${match.slug} (score: ${match.score})`);
  console.log('\n=== Multi-Agent ===');
  fc.multiagent.registerAgent('web-developer', { role: 'frontend' });
  fc.multiagent.registerAgent('backend-developer', { role: 'backend' });
  fc.multiagent.createTeam('fullstack', ['web-developer', 'backend-developer'], { strategy: 'parallel' });
  console.log(`Teams: ${fc.multiagent.listTeams().length}`);
  console.log('\n=== Status ===');
  console.log(JSON.stringify(fc.status(), null, 2));
}
main().catch(console.error);
