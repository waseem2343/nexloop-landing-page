/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StrategicPillar {
  id: string;
  title: string;
  description: string;
  iconType: 'ecommerce' | 'marketing' | 'webdev' | 'corporate' | 'mobile' | 'pos' | 'graphic' | 'shopify' | 'ads' | 'ai';
  imageUrl?: string;
  tags?: string[];
  features?: string[];
  color: string;
  span: string; // Tailwind grid span format e.g. md:col-span-8
}

export interface MethodologyStep {
  phase: string;
  title: string;
  description: string;
  details: string[];
}
