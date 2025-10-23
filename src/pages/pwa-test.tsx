import { useState } from 'react';
import Head from 'next/head';

export default function PWATest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const testInstallability = () => {
    if ('serviceWorker' in navigator) {
      addResult('✅ Service Worker support detected');
    } else {
      addResult('❌ Service Worker not supported');
    }
    
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      addResult('✅ Running in standalone mode (installed PWA)');
    } else {
      addResult('ℹ️ Running in browser mode');
    }
  };

  const testOfflineDetection = () => {
    if (navigator.onLine) {
      addResult('✅ Online - Full functionality available');
    } else {
      addResult('⚠️ Offline - Cached content only');
    }
  };

  const testShareAPI = () => {
    if (navigator.share) {
      addResult('✅ Native Share API available');
      navigator.share({
        title: 'Google Maps Mentor PWA',
        text: 'Check out this PWA travel app!',
        url: window.location.href
      }).catch(() => {
        addResult('ℹ️ Share dialog cancelled');
      });
    } else {
      addResult('ℹ️ Native Share API not available (fallback implemented)');
    }
  };

  const testManifest = () => {
    fetch('/manifest.json')
      .then(response => response.json())
      .then(manifest => {
        addResult(`✅ Manifest loaded: ${manifest.name}`);
      })
      .catch(() => {
        addResult('❌ Manifest not found (expected in development)');
      });
  };

  return (
    <>
      <Head>
        <title>PWA Features Test - Google Maps Mentor</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🚀 PWA Features Implementation Test</h1>
          
          <div className="space-y-6">
            {/* Completed Features */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Completed PWA Features</h2>
              <ul className="space-y-2 text-green-700">
                <li><strong>Manifest.json</strong> - Complete PWA manifest with icons and shortcuts</li>
                <li><strong>Service Worker</strong> - Automatic caching and offline functionality</li>
                <li><strong>InstallBanner Component</strong> - Smart installation prompts</li>
                <li><strong>OfflineNotice Component</strong> - Network status detection</li>
                <li><strong>usePWA Hook</strong> - Custom React hook for PWA lifecycle</li>
                <li><strong>MainHero Enhancement</strong> - Integrated PWA functionality with offline handling</li>
                <li><strong>Meta Tags</strong> - Complete PWA meta tags in _document.tsx</li>
                <li><strong>Caching Strategy</strong> - StaleWhileRevalidate and CacheFirst for optimal performance</li>
                <li><strong>Bilingual Support</strong> - PWA messages in Greek and English</li>
                <li><strong>Offline Geolocation</strong> - Fallback location handling when offline</li>
              </ul>
            </div>

            {/* Testing Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">🔧 PWA Testing Instructions</h2>
              <div className="space-y-4 text-blue-700">
                <div>
                  <h3 className="font-semibold">Development Testing (Current):</h3>
                  <ul className="ml-4 space-y-1">
                    <li>• PWA features are disabled in development mode for performance</li>
                    <li>• Components like InstallBanner and OfflineNotice are visible but limited</li>
                    <li>• Service worker and manifest are not active</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Production Testing (Requires Build):</h3>
                  <ul className="ml-4 space-y-1">
                    <li>• Run production build to enable full PWA functionality</li>
                    <li>• Service worker will cache resources automatically</li>
                    <li>• Install prompts will appear on supported devices</li>
                    <li>• Offline functionality will be fully active</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Tests */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🧪 Quick PWA Feature Tests</h2>
              <div className="space-x-2 mb-4">
                <button 
                  onClick={testInstallability}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Test Install Prompt Detection
                </button>
                <button 
                  onClick={testOfflineDetection}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Test Offline Detection
                </button>
                <button 
                  onClick={testShareAPI}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Test Share API
                </button>
                <button 
                  onClick={testManifest}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Test Manifest Loading
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded min-h-[100px]">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                {testResults.map((result, index) => (
                  <p key={index} className="text-sm text-gray-700">{result}</p>
                ))}
              </div>
            </div>

            {/* PWA Benefits */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">📱 PWA Benefits Implemented</h2>
              <ul className="space-y-2 text-blue-700">
                <li><strong>App-like Experience:</strong> Standalone display mode, app shortcuts</li>
                <li><strong>Offline Functionality:</strong> Cached resources, offline-aware components</li>
                <li><strong>Fast Loading:</strong> Service worker caching, preloaded resources</li>
                <li><strong>Mobile Optimized:</strong> Touch-friendly, responsive design</li>
                <li><strong>Professional UX:</strong> Installation prompts, loading states, error handling</li>
                <li><strong>Greek Travel Focus:</strong> Location shortcuts, travel-specific features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}