import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { Download, Search, FileText, Loader2, ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import JSZip from 'jszip';

interface Announcement {
  NEWSID: string;
  NEWSSUB: string;
  NEWS_DT: string;
  ATTACHMENTNAME: string;
  HEADLINE: string;
  CATEGORYNAME: string;
}

export default function App() {
  const [scripCode, setScripCode] = useState('512527');
  const [fromDate, setFromDate] = useState(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');

  const fetchAnnouncements = async (pageNo = 1) => {
    setLoading(true);
    setError('');
    setDownloadUrl(null);
    setDownloadProgress('');
    try {
      const formattedFrom = fromDate.replace(/-/g, '');
      const formattedTo = toDate.replace(/-/g, '');
      
      const res = await fetch(`/api/announcements?scripCode=${scripCode}&fromDate=${formattedFrom}&toDate=${formattedTo}&pageno=${pageNo}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      
      const data = await res.json();
      const newAnnouncements = data.Table || [];
      
      if (pageNo === 1) {
        setAnnouncements(newAnnouncements);
      } else {
        setAnnouncements(prev => [...prev, ...newAnnouncements]);
      }
      
      setHasMore(newAnnouncements.length === 50);
      setPage(pageNo);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnnouncements(1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchAnnouncements(page + 1);
    }
  };

  const handleDownloadAll = async () => {
    if (announcements.length === 0) return;
    
    setDownloadingZip(true);
    setDownloadUrl(null);
    setDownloadProgress('Fetching all announcement pages...');
    try {
      // We need to fetch all pages if there are more
      let allAnnouncements = [...announcements];
      let currentPage = page;
      let moreAvailable = hasMore;
      
      while (moreAvailable) {
        currentPage++;
        const formattedFrom = fromDate.replace(/-/g, '');
        const formattedTo = toDate.replace(/-/g, '');
        const res = await fetch(`/api/announcements?scripCode=${scripCode}&fromDate=${formattedFrom}&toDate=${formattedTo}&pageno=${currentPage}`);
        if (!res.ok) break;
        const data = await res.json();
        const newAnnouncements = data.Table || [];
        allAnnouncements = [...allAnnouncements, ...newAnnouncements];
        moreAvailable = newAnnouncements.length === 50;
      }
      
      // Update state with all fetched announcements
      setAnnouncements(allAnnouncements);
      setPage(currentPage);
      setHasMore(false);

      const pdfs = allAnnouncements
        .filter(a => a.ATTACHMENTNAME)
        .map(a => ({
          filename: a.ATTACHMENTNAME,
          url: `/api/pdf/${a.ATTACHMENTNAME}`
        }));

      if (pdfs.length === 0) {
        alert('No PDFs found to download.');
        setDownloadingZip(false);
        setDownloadProgress('');
        return;
      }

      setDownloadProgress(`Downloading 0 of ${pdfs.length} PDFs...`);
      
      const zip = new JSZip();
      let downloadedCount = 0;
      
      // Download in chunks of 5 to avoid overwhelming the browser/server
      const chunkSize = 5;
      for (let i = 0; i < pdfs.length; i += chunkSize) {
        const chunk = pdfs.slice(i, i + chunkSize);
        await Promise.all(chunk.map(async (pdf) => {
          try {
            const res = await fetch(pdf.url);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const blob = await res.blob();
            zip.file(pdf.filename, blob);
          } catch (err: any) {
            console.error(`Failed to fetch ${pdf.filename}:`, err);
            zip.file(`${pdf.filename}.error.txt`, `Failed to download: ${err.message}`);
          } finally {
            downloadedCount++;
            setDownloadProgress(`Downloading ${downloadedCount} of ${pdfs.length} PDFs...`);
          }
        }));
      }

      setDownloadProgress('Generating ZIP file...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const filename = `announcements_${scripCode}.zip`;
      
      setDownloadUrl(url);
      setDownloadFilename(filename);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadProgress('');
    } catch (err: any) {
      alert('Error downloading zip: ' + err.message);
      setDownloadProgress('');
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="text-blue-600" />
            BSE Corporate Announcements Scraper
          </h1>
          
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scrip Code</label>
              <input
                type="text"
                value={scripCode}
                onChange={(e) => setScripCode(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. 512527"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {loading && page === 1 ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </form>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {announcements.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-800">
                Results ({announcements.length}{hasMore ? '+' : ''})
              </h2>
              <div className="flex items-center gap-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={downloadFilename}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                  >
                    Click here if download didn't start
                  </a>
                )}
                <button
                  onClick={handleDownloadAll}
                  disabled={downloadingZip}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
                >
                  {downloadingZip ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                  {downloadingZip ? (downloadProgress || 'Generating Zip...') : 'Download All PDFs'}
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Headline</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {announcements.map((item, idx) => (
                    <tr key={`${item.NEWSID}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(item.NEWS_DT).toLocaleString()}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {item.CATEGORYNAME || 'General'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-900 max-w-md">
                        <p className="font-medium mb-1">{item.HEADLINE}</p>
                        <p className="text-gray-500 text-xs line-clamp-2">{item.NEWSSUB}</p>
                      </td>
                      <td className="p-4 text-right">
                        {item.ATTACHMENTNAME ? (
                          <a
                            href={`/api/pdf/${item.ATTACHMENTNAME}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">No PDF</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {hasMore && (
              <div className="p-4 border-t border-gray-100 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="text-blue-600 font-medium text-sm flex items-center gap-2 hover:text-blue-800 transition-colors disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
        
        {!loading && announcements.length === 0 && !error && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No announcements found for the selected criteria.</p>
            <p className="text-sm mt-1">Try adjusting the date range or scrip code.</p>
          </div>
        )}
      </div>
    </div>
  );
}
