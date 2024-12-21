import bilibili from './bilibili';
import douyin from './douyin';
import kuaishou from './kuaishou';
import xiaohongshu from './xiaohongshu';
export * from './common';

interface All {
  [key: string]: Writer;
}

const all: All = {
  bilibili,
  douyin,
  kuaishou,
  xiaohongshu,
};

export default all;
