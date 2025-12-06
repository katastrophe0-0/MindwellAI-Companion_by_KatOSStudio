
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { GroundingChunk } from '../types';
import { Search, MapPin, Globe, Loader2, AlertTriangle, Phone, BookOpen, UserSearch, Filter } from 'lucide-react';

const staticResources = {
  helplines: [
    {
      name: '988 Suicide & Crisis Lifeline',
      description: 'Free, confidential support for people in distress, 24/7.',
      phone: '988',
      url: 'https://988lifeline.org/',
    },
    {
      name: 'Crisis Text Line',
      description: 'Text with a trained crisis counselor for free, 24/7.',
      phoneText: 'Text HOME to 741741',
      url: 'https://www.crisistextline.org/',
    },
     {
      name: 'The Trevor Project',
      description: 'Support for LGBTQ young people in crisis, 24/7.',
      phone: '1-866-488-7386',
      url: 'https://www.thetrevorproject.org/',
    },
  ],
  organizations: [
    {
      name: 'National Alliance on Mental Illness (NAMI)',
      description: 'Advocacy, education, support, and public awareness.',
      url: 'https://www.nami.org/',
    },
    {
      name: 'National Institute of Mental Health (NIMH)',
      description: 'The lead federal agency for research on mental disorders.',
      url: 'https://www.nimh.nih.gov/',
    },
     {
      name: 'Mental Health America (MHA)',
      description: 'Promoting mental health as a critical part of overall wellness.',
      url: 'https://mhanational.org/',
    },
    {
      name: 'Depression and Bipolar Support Alliance (DBSA)',
      description: 'Support groups and wellness resources for depression and bipolar disorder.',
      url: 'https://www.dbsalliance.org/',
    },
    {
      name: 'International OCD Foundation (IOCDF)',
      description: 'Resources and support for those affected by OCD and related disorders.',
      url: 'https://iocdf.org/',
    },
    {
      name: 'National Education Alliance for BPD (NEABPD)',
      description: 'Education, research, and support for borderline personality disorder.',
      url: 'https://www.borderlinepersonalitydisorder.org/',
    },
  ],
  therapistFinders: [
    {
      name: 'Psychology Today Therapist Finder',
      description: 'Comprehensive directory of therapists, psychiatrists, and treatment centers.',
      url: 'https://www.psychologytoday.com/us/therapists',
    },
    {
      name: 'SAMHSA\'s National Helpline',
      description: 'Treatment referral routing service for individuals and families facing mental and/or substance use disorders.',
      phone: '1-800-662-HELP (4357)',
      url: 'https://www.samhsa.gov/find-help/national-helpline',
    },
  ],
};


const ResourceFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'articles' | 'local'>('articles');
  const [results, setResults] = useState<{ text: string; chunks: GroundingChunk[] }>({ text: '', chunks: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  
  // New state for filtering static resources
  const [staticFilter, setStaticFilter] = useState('');

  useEffect(() => {
    if (searchType === 'local' && !location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation error:', err);
          let msg = 'Could not retrieve your location.';
          if (err.code === 1) msg = 'Location access denied. Please enable location permissions in your browser to find local resources.';
          else if (err.code === 2) msg = 'Location unavailable. Please check your device settings.';
          else if (err.code === 3) msg = 'Location request timed out. Please try again.';
          
          setError(`${msg} Switching to article search.`);
          setSearchType('articles');
        }
      );
    }
  }, [searchType, location]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }
    setError('');
    setIsLoading(true);
    setResults({ text: '', chunks: [] });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const tools: any[] = [];
      const toolConfig: any = {};
      
      if (searchType === 'articles') {
          tools.push({ googleSearch: {} });
      } else {
          tools.push({ googleMaps: {} });
          if(location) {
              toolConfig.retrievalConfig = { latLng: location };
          }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          tools: tools,
          toolConfig: Object.keys(toolConfig).length > 0 ? toolConfig : undefined,
        },
      });

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const rawChunks = groundingMetadata?.groundingChunks || [];
      
      // Map raw chunks to the local GroundingChunk type, providing defaults for optional fields
      const chunks: GroundingChunk[] = rawChunks.map((chunk: any) => ({
        web: chunk.web ? {
          uri: chunk.web.uri || '',
          title: chunk.web.title || ''
        } : undefined,
        maps: chunk.maps ? {
          uri: chunk.maps.uri || '',
          title: chunk.maps.title || ''
        } : undefined
      }));
      
      setResults({ text: response.text || '', chunks: chunks });
    } catch (err) {
      console.error('Error with grounded search:', err);
      setError('We couldn\'t find resources at this time. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ResourceCard: React.FC<{icon: React.ElementType, title: string, resources: any[]}> = ({ icon: Icon, title, resources }) => (
    <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center"><Icon className="w-5 h-5 mr-2 text-indigo-500" />{title}</h3>
        <ul className="space-y-3">
            {resources.map(item => (
                <li key={item.name} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                        {item.phone && <a href={`tel:${item.phone.replace(/-/g, '')}`} className="flex items-center text-indigo-600 hover:underline"><Phone className="w-3 h-3 mr-1.5"/> Call {item.phone}</a>}
                        {item.phoneText && <span className="flex items-center text-slate-700"><Phone className="w-3 h-3 mr-1.5"/>{item.phoneText}</span>}
                        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:underline"><Globe className="w-3 h-3 mr-1.5"/>Visit Website</a>}
                    </div>
                </li>
            ))}
        </ul>
    </div>
  );

  const filterResources = (items: any[]) => {
      if (!staticFilter) return items;
      const term = staticFilter.toLowerCase();
      return items.filter(item => 
          item.name.toLowerCase().includes(term) || 
          item.description.toLowerCase().includes(term)
      );
  };

  const filteredHelplines = filterResources(staticResources.helplines);
  const filteredOrgs = filterResources(staticResources.organizations);
  const filteredTherapists = filterResources(staticResources.therapistFinders);
  const hasStaticResults = filteredHelplines.length > 0 || filteredOrgs.length > 0 || filteredTherapists.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Resources</h2>
        <p className="text-sm text-slate-500">Find up-to-date articles, local support, and trusted mental health organizations.</p>
      </div>
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-r-lg">
            <div className="flex">
                <div className="py-1"><AlertTriangle className="h-5 w-5 text-red-500 mr-3"/></div>
                <div>
                    <p className="font-bold">Not a Substitute for Professional Advice</p>
                    <p className="text-sm">This app is for informational purposes only. If you are in a crisis, please use the immediate support numbers below or contact emergency services.</p>
                </div>
            </div>
        </div>
        
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Dynamic Resource Finder</h3>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setSearchType('articles')} className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${searchType === 'articles' ? 'bg-white shadow text-indigo-600' : 'text-slate-600'}`}>
              <Globe className="w-4 h-4"/> Articles
            </button>
            <button onClick={() => setSearchType('local')} className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${searchType === 'local' ? 'bg-white shadow text-indigo-600' : 'text-slate-600'}`}>
              <MapPin className="w-4 h-4"/> Local Support
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={searchType === 'articles' ? "e.g., 'latest research on mindfulness'" : "e.g., 'therapists near me specializing in CBT'"}
              className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              disabled={isLoading}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {isLoading && (
              <div className="flex flex-col items-center justify-center p-8 text-slate-500">
                  <Loader2 className="animate-spin w-8 h-8 mb-2"/>
                  <p>Searching for resources...</p>
              </div>
          )}

          {results.text && (
              <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-slate-800 whitespace-pre-wrap">{results.text}</p>
                  </div>
                  {results.chunks.length > 0 && (
                      <div>
                          <h4 className="font-semibold text-slate-800 mb-2">Sources:</h4>
                          <ul className="space-y-2">
                            {results.chunks.map((chunk, index) => {
                                const source = chunk.web || chunk.maps;
                                if (!source || !source.uri) return null;
                                return (
                                <li key={index} className="text-sm bg-white p-3 border rounded-lg">
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline">
                                        {source.title || source.uri}
                                    </a>
                                </li>
                                )
                            })}
                          </ul>
                      </div>
                  )}
              </div>
          )}
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-slate-800">Curated Resources</h3>
            </div>
            
            {/* Static Resource Filter */}
            <div className="relative mb-6">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={staticFilter}
                    onChange={(e) => setStaticFilter(e.target.value)}
                    placeholder="Filter helplines, organizations..."
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
            </div>

            {hasStaticResults ? (
                <div className="space-y-8">
                    {filteredHelplines.length > 0 && <ResourceCard icon={Phone} title="Immediate Support & Helplines" resources={filteredHelplines} />}
                    {filteredOrgs.length > 0 && <ResourceCard icon={BookOpen} title="Organizations & Information" resources={filteredOrgs} />}
                    {filteredTherapists.length > 0 && <ResourceCard icon={UserSearch} title="Find Professional Help" resources={filteredTherapists} />}
                </div>
            ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                    <Search className="w-8 h-8 mx-auto mb-2 text-slate-300"/>
                    <p>No curated resources found matching "{staticFilter}".</p>
                    <button onClick={() => setStaticFilter('')} className="mt-2 text-indigo-600 font-medium hover:underline">Clear Filter</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResourceFinder;
