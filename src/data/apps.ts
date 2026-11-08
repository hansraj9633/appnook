export interface AppItem {
  id: string
  name: string
  slug: string
  description: string
  category: string
  version: string
  size: string
  updated: string
  icon: string
  screenshots: string[]
  features: string[]
  downloads: number
  featured: boolean
}

export const apps: AppItem[] = [
  {
    id: '1',
    name: 'Smart Practice',
    slug: 'smart-practice',
    description: 'A smarter way to practice questions and improve your preparation.',
    category: 'Education',
    version: '1.0.0',
    size: '18 MB',
    updated: 'Recently updated',
    icon: 'SP',
    screenshots: [],
    features: ['MCQ practice', 'Topic-wise tests', 'Progress tracking'],
    downloads: 1250,
    featured: true,
  },
  {
    id: '2',
    name: 'FlipLess',
    slug: 'flipless',
    description: 'Practice questions without repeatedly flipping through your books.',
    category: 'Education',
    version: '1.0.0',
    size: '15 MB',
    updated: 'Recently updated',
    icon: 'FL',
    screenshots: [],
    features: ['Practice sessions', 'Answer evaluation', 'Offline support'],
    downloads: 890,
    featured: true,
  },
  {
    id: '3',
    name: 'Campus Notes',
    slug: 'campus-notes',
    description: 'Keep your study materials organised in one convenient place.',
    category: 'Productivity',
    version: '1.2.0',
    size: '12 MB',
    updated: 'Recently updated',
    icon: 'CN',
    screenshots: [],
    features: ['Organised notes', 'Quick access', 'Simple interface'],
    downloads: 640,
    featured: true,
  },
  {
    id: '4',
    name: 'Daily Tools',
    slug: 'daily-tools',
    description: 'Useful everyday utilities packed into one lightweight app.',
    category: 'Utilities',
    version: '2.0.0',
    size: '9 MB',
    updated: 'Recently updated',
    icon: 'DT',
    screenshots: [],
    features: ['Useful utilities', 'Lightweight', 'Easy navigation'],
    downloads: 420,
    featured: false,
  },
  {
    id: '5',
    name: 'Code Pocket',
    slug: 'code-pocket',
    description: 'A convenient companion for keeping programming references.',
    category: 'Developer Tools',
    version: '1.1.0',
    size: '20 MB',
    updated: 'Recently updated',
    icon: 'CP',
    screenshots: [],
    features: ['Code snippets', 'Quick references', 'Organised content'],
    downloads: 310,
    featured: false,
  },
]

export const categories = [
  'Education',
  'Productivity',
  'Utilities',
  'Developer Tools',
  'Lifestyle',
  'Entertainment',
]