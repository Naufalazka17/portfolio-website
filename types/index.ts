export interface Profile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  resumeUrl: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface PortfolioData {
  profile: Profile;
  socialLinks: SocialLink[];
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
}