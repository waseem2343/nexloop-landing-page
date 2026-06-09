/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StrategicPillar, MethodologyStep } from './types';

export const IMAGES = {
  logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIRKMCUpoY6WdPttABZl3K4welW_sgwumbKc-Da22tw3h0CP4G1HGPiKaVd89OqQwu637z2li9fCSsMNzm3kQg89iexzNurzkQbst7YEkSzI491tr0K3M9Q-DyTgHv-0K2MAPIU3LgoFvht1gZq38ywoG6EgSjTo9poTd4f-XuTX31zWsSbC89h40BWFjc09RMxTKXMHUXeJLbYANZzXCnb1uR4hIDQRcYCf5zO6exl-ebHyY7Hl_AuzEDCcfYQ7mTMd8zxYmMMq0',
  heroBg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj03EFcwZ2_jw-ucCrvygbvMkC_YvO6lxIFJRtXpKL_n4V8THztUVlv4Xof6wZSioOiJXy3QJkewSrPd4Ks6DSTYIAT4EwrzGsTK-uKkKQtbBeuMR4iPnHpBwZ_dLgLUBkqo16O3n2I29JPM6aElqlJeYb9LwoxMARvjHlXbhAZE9yBcbxsio6h3IZi1cBm8ueI5eAjMBnM6qMnqCRsOYpnRSlRm9IWuOz6pI5NCl53qBN4y-BS-BEoVJ9Tys5sgSeWwFwedtdX1c',
  amazonPillar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt8kZqHQghjU9u6oTZuahaWaNLkDTdyhPhwOHNLvsipA3oT27TU3eXEGWoS9t22lxj0cn3fMM0oJwZLH5g6ErZV3xdy_iByuYDqUKGYcbmcGFS-x_TG32mtgnp5G_Aen0MUD9EK41E2sU146kv_lyQqwIga6sOZqHZJXFbkKfjvF5ozo24SP9K5vYSAFV5n6KSJ1cr6Ks63O4abMB-0vubUHzHUNO2e8AMb7jzeSMNtNiQ-KuiRCf8TLnyuC7Zma0CCMpNOaPSwZI',
  iconSprites: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBo7Fnp5rjlGx8RW0PUt0qZhZsBhL4hmKM-TWAgNFeb3nWwDLcNuRl2DRiT_-fq2BaegC4AynGAt8hudhsp_D_6SR89GBMuVHufKg0XeMXw-F-XIj1G14Gd44e0OOAWpsYrfv0oBXZ_4RURKytsalC_ec0keAZiR0m5h-Fb50p6RrgIXMrvZMY6cHIaU6LyQjJkmRCxuyBzINZOLgrJ1FGSkhF8UKRfioORpsxttJYUdEb_7CrdkPw3wJqYeY3kgpRdajlQ0m_YJDo',
  uaePillar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdgdmRaTyUGB3rdG7254w3WKzbqk5F8dRSf7Ap_Rg85OdsZagbHGeYkUaqZito05_bUZSqD-LLrssntMHe3gj2jH0D6hzyoC-qvN7lBGrpesqFcFiaYslpzbCq7THc9JrUhGBjG97ZNvjAJcHNKW5yZNzq6PF0D8aqkCEdHqNi44cv7Vi8E3BxWhy8DSkWBBQDuVA3yuN9RixJVJAeoByUx0Nj7LUzlGcd46-AZlfpuIY2kgea-v-AtfwlqzKZUIM3TLu-D-QzoQk',
  labMethodology: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDschMTSOxtOfMwCjUdAS9cV1zp446Tue9PlF6jFOZaEcm0_qR_AZ5Dv404hLCflUNhHfBpb-NDGDzvaNaDV0W8JHLjOMc0yzC36xxT5Do2v_mki-2G1klKumOqie0l3cWe4jxF3a6qIoDb1FudKy32B4xYHUqWC0L6WznnNvCK3qejD4rBXhy6NHb5tWptsL0rc2UC9dDTyI94dq5caw6HXVsb8Z2EjrjzaEgSqAjzz_jRyljTYWbeQhoyUb7KjULmG5yHyVI8UL8',
  adsPillar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
  graphicPillar: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800',
};

export const PILLARS: StrategicPillar[] = [
  {
    id: 'amazon-noon',
    title: 'Amazon & Noon A-to-Z Support',
    description: "Mastering the Middle East's biggest marketplaces with end-to-end logistics, listing optimization, and performance scaling.",
    iconType: 'ecommerce',
    imageUrl: IMAGES.amazonPillar,
    color: 'from-blue-500/10 to-indigo-500/10',
    span: 'md:col-span-8'
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    description: 'Hyper-targeted campaigns driven by analytics and creative storytelling that converts visitors into advocates.',
    iconType: 'marketing',
    tags: ['Performance', 'Retention'],
    color: 'from-cyan-500/10 to-teal-500/10',
    span: 'md:col-span-4'
  },
  {
    id: 'web-design-dev',
    title: 'Web Design & Dev',
    description: 'Bespoke digital architecture using the latest stacks (Next.js, Tailwind, GSAP) to build immersive, lighting-fast interfaces.',
    iconType: 'webdev',
    tags: ['FULL-STACK', 'HEADLESS'],
    color: 'from-blue-600/10 to-cyan-500/10',
    span: 'md:col-span-4'
  },
  {
    id: 'uae-corporate',
    title: 'UAE Corporate Services',
    description: 'Navigating the complexities of the UAE business ecosystem. From trade licenses to PRO services, we establish your legacy.',
    iconType: 'corporate',
    imageUrl: IMAGES.uaePillar,
    features: ['Business Setup', 'Visa Solutions', 'Office Space', 'PRO Services'],
    color: 'from-amber-500/10 to-rose-500/10',
    span: 'md:col-span-8'
  },
  {
    id: 'mobile-app-dev',
    title: 'Mobile App Development',
    description: 'High-performance, feature-rich native and cross-platform iOS and Android apps engineered using React Native, Flutter, and Swift.',
    iconType: 'mobile',
    tags: ['iOS & ANDROID', 'CROSS-PLATFORM'],
    color: 'from-purple-500/10 to-indigo-500/10',
    span: 'md:col-span-4'
  },
  {
    id: 'pos-dev',
    title: 'POS Development',
    description: 'Custom cloud-native point of sale solutions with offline-first local database support and robust payment terminal integrations.',
    iconType: 'pos',
    tags: ['OFFLINE-FIRST', 'HARDWARE INTEGRATION'],
    color: 'from-indigo-600/10 to-blue-500/10',
    span: 'md:col-span-4'
  },
  {
    id: 'shopify-dev',
    title: 'Shopify Development',
    description: 'Bespoke high-performance Shopify stores customized with Headless Hydrogen or Liquid templating optimized for ultra-high conversion.',
    iconType: 'shopify',
    tags: ['SHOPIFY PLUS', 'HYDROGEN HEADLESS'],
    color: 'from-emerald-500/10 to-teal-500/10',
    span: 'md:col-span-4'
  },
  {
    id: 'graphic-designing',
    title: 'Graphic Designing & Corporate Branding',
    description: 'Bespoke corporate identity design, stunning high-end layouts, packaging and custom vector graphics for luxury brands.',
    iconType: 'graphic',
    features: ['Logo Creation', 'Brand Assets Guidelines', 'Creative Asset Bundles', 'UX UI Polishing'],
    color: 'from-rose-500/10 to-pink-500/10',
    span: 'md:col-span-8'
  },
  {
    id: 'ads-management',
    title: 'Meta, Google, Snapchat & TikTok Ads Management',
    description: 'ROAS-driven ad engine combining hyper-targeted audience modeling, precise pixel attribution, and creative variation sprints.',
    iconType: 'ads',
    features: ['Strategic Audits', 'A/B Creative Sprints', 'Dynamic Retargeting', 'Attribution Diagnostics'],
    color: 'from-amber-500/10 to-orange-500/10',
    span: 'md:col-span-4'
  },
  {
    id: 'ai-automation',
    title: 'AI Based Automation Systems',
    description: 'Bespoke AI-powered agents, deep LLM orchestrations, automated workflows, and custom cognitive integration matrices to hyper-optimize business operations.',
    iconType: 'ai',
    features: ['Workflow Automation', 'AI Agent Orchestration', 'Cognitive Routing', 'Fulfillment Automation'],
    color: 'from-violet-600/10 to-indigo-500/10',
    span: 'md:col-span-8'
  }
];

export const METHODOLOGY_STEPS: MethodologyStep[] = [
  {
    phase: '01',
    title: 'Discovery & Deep Dive',
    description: 'Analyzing market gaps, competitor weaknesses, and your unique brand DNA.',
    details: [
      'Competitive landscape gap analysis',
      'Audience persona synthesis',
      'Value proposition mapping',
      'Growth potential diagnostic'
    ]
  },
  {
    phase: '02',
    title: 'Architectural Blueprinting',
    description: 'Defining user journeys and technical specifications before the first pixel is placed.',
    details: [
      'Interactive wireframes and path mapping',
      'Core technology stack orchestration',
      'Database schema & endpoint planning',
      'Performance budgets and accessibility setup'
    ]
  },
  {
    phase: '03',
    title: 'Agile Construction',
    description: 'Rapid prototyping and iterative development in a high-transparency environment.',
    details: [
      'Sprint-based modular implementation',
      'Bespoke micro-interaction modeling',
      'Continuous deployment feedback loops',
      'Rigorous edge-case and latency optimization'
    ]
  }
];
