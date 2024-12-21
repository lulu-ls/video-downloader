import path from 'path';
import { getDBPath } from '../util';

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
// Extend Low class with a new `chain` field

const userData = path.join(getDBPath(), 'db.json');
const adapter = new FileSync(userData);
const db = low(adapter);

type Data = {
  dicts: Dict[];
};

const defaultData: Data = {
  dicts: [],
};

// 设置初始数据
db.defaults(defaultData).write();

type Dict = {
  key: string;
  val: string;
};

console.log(db.getState()); // 输出当前数据库状态

export default db;
