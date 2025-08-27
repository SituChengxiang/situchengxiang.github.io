import { format } from 'date-fns';
import type { Post, PaginationInfo } from '../types/blog';
import { blogConfig } from '../config/blog';

// 模拟博客文章数据（之后可以从文件系统或API获取）
const samplePosts = [
  {
    slug: '2025-7-26-endof2024',
    title: '2024-2025学年末',
    date: '2025-07-26',
    tags: ['campus', 'life'],
    layout: 'post',
    content: `**注意：前方两篇文章合起来共计接近2万7千字，预计阅读时间不短于20分钟。**

# 2024-2025学年末

这是一篇关于学年末总结的文章...`,
    excerpt: '这是一篇关于学年末总结的文章...',
    stickie: false
  },
  {
    slug: '2025-1-1-happynew-year',
    title: '2025 新年快乐',
    date: '2025-01-01',
    tags: ['life'],
    layout: 'post',
    content: `新年快乐呀！  
blog还在施工中，~~大部分文章还在 [Paragraph](https://paragraph.xyz/@chengxiang)源站上没同步过来~~（2025/2/11更新：最重要的几篇已经同步过来了）；寒假感觉是没啥空了。  
今年预计要写好多好多东西呢…… 还有好多好多事情要做，好多好多功课要搞  
先不瞎立新年flag了，慢慢走吧！`,
    excerpt: '新年快乐呀！blog还在施工中...',
    stickie: false
  },
  {
    slug: '2024-10-23-hi',
    title: 'Hi',
    date: '2024-10-23',
    tags: ['Hydrogen'],
    layout: 'post',
    content: `Welcome to Hydrogen!  
If you saw this post, your blog has been successfully deployed.So enjoy the fun of writing now!  
以前在 [Paragraph](https://paragraph.xyz/@chengxiang) 上写的最重要的几篇文章已经全部搬过来了。接下来，本站和 [Paragraph](https://paragraph.xyz/@chengxiang) 同步更新，RSS订阅仍然走的 Paragraph。  
这里还保留了很多这个主题作者写的测试页面，我认为可以不用删掉，所以，有几篇文章比本站还要老`,
    excerpt: 'Welcome to Hydrogen! If you saw this post, your blog has been successfully deployed.',
    stickie: true
  }
];

export const getAllPosts = (): Post[] => {
  return samplePosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getPostBySlug = (slug: string): Post | undefined => {
  return samplePosts.find(post => post.slug === slug);
};

export const getPostsByTag = (tag: string): Post[] => {
  return samplePosts.filter(post => post.tags.includes(tag));
};

export const getAllTags = (): { [key: string]: number } => {
  const tagCounts: { [key: string]: number } = {};
  samplePosts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  return tagCounts;
};

export const getPaginatedPosts = (page: number = 1): PaginationInfo => {
  const allPosts = getAllPosts();
  const startIndex = (page - 1) * blogConfig.paginate;
  const endIndex = startIndex + blogConfig.paginate;
  const posts = allPosts.slice(startIndex, endIndex);
  
  return {
    currentPage: page,
    totalPages: Math.ceil(allPosts.length / blogConfig.paginate),
    hasNext: endIndex < allPosts.length,
    hasPrev: page > 1,
    posts
  };
};

export const getStickyPosts = (): Post[] => {
  return samplePosts.filter(post => post.stickie === true);
};

export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), blogConfig.dateFormat);
  } catch {
    return dateString;
  }
};

export const truncateContent = (content: string, words: number = 30): string => {
  const plainText = content.replace(/[#*`\[\]()]/g, '').replace(/\n/g, ' ');
  const wordsArray = plainText.split(/\s+/);
  if (wordsArray.length <= words) return plainText;
  return wordsArray.slice(0, words).join(' ') + '...';
};
