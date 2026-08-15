import mongoose from 'mongoose';
import 'dotenv/config';

import User from '../models/User.js';
import RoadmapStep from '../models/RoadmapStep.js';
import Task from '../models/Task.js';
import FocusLog from '../models/FocusLog.js';
import VaultItem from '../models/VaultItem.js';
import ChatMessage from '../models/ChatMessage.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guidex';

async function inspectDatabaseStructure() {
  console.log('════════════════════════════════════════════════════════════');
  console.log(' GUIDEX MONGODB DATABASE STRUCTURE & LIVE COLLECTION AUDIT');
  console.log('════════════════════════════════════════════════════════════\n');

  const models = [
    { name: 'User', model: User },
    { name: 'RoadmapStep', model: RoadmapStep },
    { name: 'Task', model: Task },
    { name: 'FocusLog', model: FocusLog },
    { name: 'VaultItem', model: VaultItem },
    { name: 'ChatMessage', model: ChatMessage }
  ];

  for (const m of models) {
    console.log(`📂 Collection: "${m.model.collection.name}" (Model: ${m.name})`);
    console.log('─'.repeat(55));
    
    const schemaPaths = m.model.schema.paths;
    console.log('  Fields & Data Types:');
    for (const [path, obj] of Object.entries(schemaPaths)) {
      if (path === '__v') continue;
      const isReq = obj.isRequired ? ' [REQUIRED]' : '';
      const def = obj.defaultValue !== undefined ? ` (default: ${JSON.stringify(obj.defaultValue)})` : '';
      console.log(`   • ${path.padEnd(20)} : ${obj.instance}${isReq}${def}`);
    }
    console.log('');
  }
}

inspectDatabaseStructure().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
