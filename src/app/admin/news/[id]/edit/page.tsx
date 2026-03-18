'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SiteNav from '@/components/SiteNav';

interface NewsItem {
  id: number;
  title: string;
  summary: string | null;
  content: string | null;
  industry_slug: string;
  industry_level2?: string | null;
  source_name: string | null;
  source_url: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  is_premium: boolean;
  is_featured: boolean;
  published_at: string;
  company_id?: number | null;
  company_name?: string | null;
}

interface Company {
  id: number;
  name: string;
}

const INDUSTRY_OPTIONS = [
  { id: 'ai', label: 'AI', level2: ['Large Language Models', 'Computer Vision', 'NLP', 'Robotics'] },
  { id: 'ai-semiconductors', label: 'AI Semiconductors', level2: ['GPU', 'TPU', 'AI Chip Design', 'Memory'] },
  { id: 'semiconductors-materials', label: 'Semiconductors', level2: ['Foundry', 'Design', 'Materials', 'Equipment'] },
  { id: 'autonomous-vehicles', label: 'Autonomous Vehicles', level2: ['Passenger', 'Logistics', 'Sensors', 'Software'] },
  { id: 'green-tech', label: 'Green Tech', level2: ['Solar', 'Wind', 'Battery', 'Carbon Capture'] },
  { id: 'life-sciences', label: 'Life Sciences', level2: ['Biotech', 'Pharma', 'Medical Devices', 'Diagnostics'] },
  { id: 'new-space', label: 'New Space', level2: ['Launch Services', 'Satellites', 'Ground Infra', 'Space Tourism'] },
  { id: 'advanced-materials', label: 'Advanced Materials', level2: ['Composites', 'Graphene', 'Ceramics', 'Polymers'] },
  { id: 'humanoid-robots', label: 'Humanoid Robots', level2: ['Hardware', 'Software', 'AI', 'Manufacturing'] },
  { id: 'ai-agents', label: 'AI Agents', level2: ['Autonomous Agents', 'Multi-Agent Systems', 'Agent Frameworks'] },
  { id: 'launch-vehicles', label: 'Launch Vehicles', level2: ['Reusable', 'Small Lift', 'Heavy Lift'] },
  { id: 'gene-editing', label: 'Gene Editing', level2: ['CRISPR', 'Base Editing', 'Prime Editing'] },
  { id: 'ev-batteries', label: 'EV Batteries', level2: ['Lithium', 'Solid-State', 'Alternative Chemistry'] },
  { id: 'energy-storage', label: 'Energy Storage', level2: ['Battery', 'Thermal', 'Mechanical'] },
];

export default function NewsEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<NewsItem>>({
    title: '',
    summary: '',
    content: '',
    industry_slug: 'ai',
    industry_level2: '',
    source_name: '',
    source_url: '',
    cover_image_url: '',
    tags: [],
    is_premium: false,
    is_featured: false,
    published_at: new Date().toISOString(),
    company_id: null,
    company_name: '',
  });

  // Company search
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load existing news item
  useEffect(() => {
    if (!params?.id) return;
    
    fetch(`/api/news/${params.id}/edit`)
      .then(r => r.json())
      .then(data => {
        setItem(data);
        setFormData(data);
        setCompanySearch(data.company_name || '');
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load news item');
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  // Load companies for autocomplete
  useEffect(() => {
    fetch('/api/companies?limit=1000')
      .then(r => r.json())
      .then(data => setCompanies(data.data || []))
      .catch(console.error);
  }, []);

  // Filter companies on search
  useEffect(() => {
    if (companySearch.length > 0) {
      const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(companySearch.toLowerCase())
      );
      setFilteredCompanies(filtered.slice(0, 8)); // Limit to 8 results
    } else {
      setFilteredCompanies([]);
    }
  }, [companySearch, companies]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    setFormData(prev => ({
      ...prev,
      tags: tags.length > 0 ? tags : null,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await res.json();
      handleChange('cover_image_url', url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSelectCompany = (company: Company) => {
    setFormData(prev => ({
      ...prev,
      company_id: company.id,
      company_name: company.name,
    }));
    setCompanySearch(company.name);
    setShowCompanyDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/news/${params?.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      router.push(`/news/${item?.id}`);
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const selectedIndustry = INDUSTRY_OPTIONS.find(ind => ind.id === formData.industry_slug);
  const level2Options = selectedIndustry?.level2 || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <SiteNav />
        <div className="max-w-2xl mx-auto px-5 py-16">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />
      
      <div className="max-w-2xl mx-auto px-5 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit News</h1>
          <p className="text-gray-400">Update the news article details and content</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Cover Image
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-700 rounded-lg bg-gray-900/50 hover:border-blue-500 hover:bg-gray-900 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className="text-sm text-gray-400">
                      {uploadingImage ? 'Uploading...' : 'Click to upload or drag image'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Recommended: 1200x630px (16:9), max 5MB
                    </div>
                  </div>
                </label>
              </div>
            </div>
            {formData.cover_image_url && (
              <div className="mt-3">
                <img
                  src={formData.cover_image_url}
                  alt="Preview"
                  className="h-32 rounded-lg object-cover"
                />
                <p className="text-xs text-gray-500 mt-2 truncate">{formData.cover_image_url}</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Summary
            </label>
            <textarea
              value={formData.summary || ''}
              onChange={(e) => handleChange('summary', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Brief summary of the news..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Full Content
            </label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={8}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
              placeholder="Full article content. Use double line breaks for paragraphs."
            />
          </div>

          {/* Industry & Level 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Industry <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.industry_slug || 'ai'}
                onChange={(e) => {
                  handleChange('industry_slug', e.target.value);
                  handleChange('industry_level2', ''); // Reset level2
                }}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {INDUSTRY_OPTIONS.map(ind => (
                  <option key={ind.id} value={ind.id}>{ind.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Sub-category
              </label>
              <select
                value={formData.industry_level2 || ''}
                onChange={(e) => handleChange('industry_level2', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select sub-category</option>
                {level2Options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Company Association */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Related Company
            </label>
            <div className="relative">
              <input
                type="text"
                value={companySearch}
                onChange={(e) => {
                  setCompanySearch(e.target.value);
                  setShowCompanyDropdown(true);
                }}
                onFocus={() => setShowCompanyDropdown(true)}
                placeholder="Search company by name..."
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
              {showCompanyDropdown && filteredCompanies.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10">
                  {filteredCompanies.map(company => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => handleSelectCompany(company)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 transition text-gray-300 hover:text-white"
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {formData.company_id && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300">
                {formData.company_name}
                <button
                  type="button"
                  onClick={() => {
                    handleChange('company_id', null);
                    handleChange('company_name', '');
                    setCompanySearch('');
                  }}
                  className="ml-1 hover:text-blue-100"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Source Name
              </label>
              <input
                type="text"
                value={formData.source_name || ''}
                onChange={(e) => handleChange('source_name', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Source URL
              </label>
              <input
                type="url"
                value={formData.source_url || ''}
                onChange={(e) => handleChange('source_url', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              defaultValue={(formData.tags || []).join(', ')}
              onChange={handleTagsChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="e.g., AI, Tech, News"
            />
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_premium || false}
                onChange={(e) => handleChange('is_premium', e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-300">Premium</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured || false}
                onChange={(e) => handleChange('is_featured', e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-300">Featured</span>
            </label>
          </div>

          {/* Published date */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Published Date
            </label>
            <input
              type="datetime-local"
              value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleChange('published_at', new Date(e.target.value).toISOString())}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold rounded-lg transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
