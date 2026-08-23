import { PortfolioData } from '@/types';

export const dummyData: PortfolioData = {
  profile: {
    name: "Naufal Azka",
    title: "Full Stack Developer",
    email: "naufalazkapu@email.com",
    phone: "+62 812-3456-7890",
    location: "Jakarta, Indonesia",
    bio: "Passionate Full Stack Developer dengan pengalaman 5+ tahun dalam membangun aplikasi web modern. Spesialisasi dalam React, Node.js, dan cloud services.",
    avatar: "/images/avatar.svg",
    resumeUrl: "/resume.pdf"
  },
  socialLinks: [
    {
      id: "1",
      platform: "LinkedIn",
      url: "https://linkedin.com/in/ahmadfauzi",
      icon: "FaLinkedin"
    },
    {
      id: "2",
      platform: "GitHub",
      url: "https://github.com/ahmadfauzi",
      icon: "FaGithub"
    },
    {
      id: "3",
      platform: "Twitter",
      url: "https://twitter.com/ahmadfauzi",
      icon: "FaTwitter"
    },
    {
      id: "4",
      platform: "Instagram",
      url: "https://instagram.com/ahmadfauzi",
      icon: "FaInstagram"
    }
  ],
  skills: [
    { id: "1", name: "React.js", level: 90, category: "Frontend" },
    { id: "2", name: "Next.js", level: 85, category: "Frontend" },
    { id: "3", name: "TypeScript", level: 88, category: "Language" },
    { id: "4", name: "Node.js", level: 92, category: "Backend" },
    { id: "5", name: "PostgreSQL", level: 85, category: "Database" },
    { id: "6", name: "Docker", level: 75, category: "DevOps" },
    { id: "7", name: "AWS", level: 70, category: "Cloud" },
    { id: "8", name: "Tailwind CSS", level: 90, category: "Frontend" }
  ],
  experiences: [
    {
      id: "1",
      company: "Tech Corp Indonesia",
      position: "Senior Full Stack Developer",
      startDate: "2022-01",
      endDate: "Present",
      description: "Memimpin tim development untuk membangun platform e-commerce dengan 1 juta+ pengguna aktif.",
      achievements: [
        "Meningkatkan performa aplikasi sebesar 40%",
        "Memimpin tim 5 developer",
        "Implementasi microservices architecture"
      ]
    },
    {
      id: "2",
      company: "Startup Digital",
      position: "Full Stack Developer",
      startDate: "2020-03",
      endDate: "2021-12",
      description: "Mengembangkan aplikasi fintech untuk pembayaran digital.",
      achievements: [
        "Membangun sistem pembayaran yang memproses 10M+ transaksi",
        "Integrasi dengan 3 payment gateway",
        "Mengurangi bug production sebesar 60%"
      ]
    }
  ],
  projects: [
    {
      id: "1",
      title: "E-Commerce Platform",
      description: "Platform e-commerce full-featured dengan payment gateway, inventory management, dan real-time analytics.",
      image: "/images/project1.jpg",
      technologies: ["Next.js", "Node.js", "PostgreSQL", "Redis"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/ahmadfauzi/ecommerce"
    },
    {
      id: "2",
      title: "Task Management App",
      description: "Aplikasi manajemen tugas kolaboratif dengan real-time updates dan notification system.",
      image: "/images/project2.jpg",
      technologies: ["React", "Express", "MongoDB", "Socket.io"],
      liveUrl: "https://taskapp.example.com",
      githubUrl: "https://github.com/ahmadfauzi/taskapp"
    }
  ]
};