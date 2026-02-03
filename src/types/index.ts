export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

export interface Navigation {
  items: NavItem[];
  social: SocialLink[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  highlights: string[];
  status: 'active' | 'development' | 'experiment' | 'archived';
  type: 'personal' | 'volunteer' | 'opensource';
  links: {
    demo?: string;
    github?: string;
  };
  image: string;
  featured: boolean;
}

export interface Experience {
  id: string;
  company: string;
  client: string | null;
  role: string;
  period: {
    start: string;
    end: string | null;
  };
  location: string;
  description: string;
  highlights: string[];
  technologies: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string | null;
  category: string;
  featured: boolean;
  icon: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  period: {
    start: string;
    end: string;
  };
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface SkillCategory {
  name: string;
  icon: string;
  skills: Skill[];
}

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  canonicalURL?: string;
  type?: 'website' | 'article';
}
