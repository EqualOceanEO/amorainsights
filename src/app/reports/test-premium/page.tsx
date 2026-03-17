import { Metadata } from 'next';
import TestReportClient from './TestReportClient';

export const metadata: Metadata = {
  title: 'Test Premium Report | AMORA Insights',
  description: 'Test page to demonstrate premium gate and chart gating functionality.',
};

export default function TestReportPage() {
  return <TestReportClient />;
}
