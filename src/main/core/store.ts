import { DictKeys } from './common';
import DB from './db';

async function initDict() {
  await DB.read();

  try {
    if (!DB.get('dicts').find({ key: DictKeys.DefaultDir }).value()) {
      DB.get('dicts').push({ key: DictKeys.DefaultDir, val: '' }).write();
    }

    console.info('db init success!');
  } catch (err) {
    // error handling
    console.error(err);
  }
}

// 初始化表结构
(async function () {
  await initDict();
})();

// 获取用户信息
const GetDict = async (key: string): Promise<string> => {
  await DB.read();
  const res = DB.get('dicts').find({ key }).value();
  if (res) {
    return res.val;
  }
  return '';
};

// 设置用户信息
const SetDict = async (key: string, val: string) => {
  // await knexInstance('dict').where('key', key).update({ val });
  DB.get('dicts').find({ key }).assign({ val }).write();
};

export { GetDict, SetDict };
