/**
 * Central configuration for all products on the platform.
 * Defines branding, navigation, and SEO metadata for each product slug.
 */
export interface ProductConfig {
  id: string;
  slug: string;
  name: string;
  title: string;
  description: string;
  logo: {
    first: string;
    second: string;
  };
  primaryColor: string;
  navLinks: {
    label: string;
    href: string;
    badge?: string;
  }[];
}

export const PRODUCTS: Record<string, ProductConfig> = {
  grants: {
    id: 'grants',
    slug: 'grants',
    name: 'GrantsIndia',
    title: 'GrantsIndia — Top 2026 Grants & Funding for Indian Startups',
    description: 'Discover government and private sector grants, incubation programs, accelerators, and contests for Indian founders. Updated weekly.',
    logo: {
      first: 'Grants',
      second: 'India'
    },
    primaryColor: '#B8460A',
    navLinks: [
      { label: 'Grants & Funding', href: '/' },
      { label: 'Startup School', href: '/school' },
      { label: 'Software Deals', href: '/deals', badge: 'Coming Soon' }
    ]
  },
  school: {
    id: 'school',
    slug: 'school',
    name: 'StartupSchool',
    title: 'StartupSchool — Learn to build and scale your startup',
    description: 'Interactive courses, mentorship, and resources for first-time founders in India.',
    logo: {
      first: 'Startup',
      second: 'School'
    },
    primaryColor: '#6C63FF',
    navLinks: [
      { label: 'Curriculum', href: '/school' },
    ]
  }
};

export const DEFAULT_PRODUCT = PRODUCTS.grants;
