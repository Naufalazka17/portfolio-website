'use client'

import Hero from '@/components/Hero'
import About from '@/components/About'
import Skills from '@/components/Skills'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import SocialLinks from '@/components/SocialLinks'
import { dummyData } from '@/data/dummyData'

export default function Home() {
  return (
    <div className="pt-16">
      <Hero data={dummyData} />
      <About data={dummyData} />
      <Skills data={dummyData} />
      <Experience data={dummyData} />
      <Projects data={dummyData} />
      <SocialLinks data={dummyData} />
    </div>
  )
}