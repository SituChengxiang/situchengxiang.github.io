export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  layout: string;
  content: string;
  excerpt: string;
  stickie?: boolean;
  author?: string;
}

export interface FriendLink {
  name: string;
  url: string;
  image: string;
  describe: string;
}

export interface Page {
  title: string;
  tagline: string;
  permalink: string;
  content: string;
  sitetime?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  posts: Post[];
}
