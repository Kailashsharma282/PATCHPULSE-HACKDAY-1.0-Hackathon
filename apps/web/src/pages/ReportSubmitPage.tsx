import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Mic,
  MapPin,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Radio,
  FileText,
} from 'lucide-react';
import { api } from '../lib/api';

export const ReportSubmitPage: React.FC = () => {
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [locationName, setLocationName] = useState('Block C Parking Area');
  const [latitude, setLatitude] = useState(12.9915);
  const [longitude, setLongitude] = useState(80.2337);
  const [mediaUrl, setMediaUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Suggested demo photos
  const samplePhotos = [
    {
      label: 'Broken Streetlight',
      url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800',
    },
    {
      label: 'Deep Pothole',
      url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800',
    },
    {
      label: 'Water Pipe Leak',
      url: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=800',
    },
    {
      label: 'Garbage Overflow',
      url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
    },
  ];

  // Campus location presets
  const campusLocations = [
    { name: 'Block C Parking Area', lat: 12.9915, lng: 80.2337 },
    { name: 'Hostel Gate & Walkway', lat: 12.9928, lng: 80.2312 },
    { name: 'Campus Main Gate', lat: 12.9890, lng: 80.2375 },
    { name: 'Academic Complex Quad', lat: 12.9902, lng: 80.2341 },
    { name: 'Central Library Road', lat: 12.9910, lng: 80.2355 },
    { name: 'Student Food Court & Plaza', lat: 12.9922, lng: 80.2328 },
  ];

  const handleLocationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = campusLocations.find((l) => l.name === e.target.value);
    if (found) {
      setLocationName(found.name);
      setLatitude(found.lat);
      setLongitude(found.lng);
    }
  };

  const handleToggleVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setVoiceRecorded(true);
        if (!description) {
          setDescription('Voice transcription: The light beside Block C parking area is broken, please fix it.');
        }
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.createReport({
        description,
        category: category || undefined,
        locationName,
        latitude,
        longitude,
        mediaUrl: mediaUrl || undefined,
        voiceUrl: voiceRecorded ? 'https://cdn.example.com/audio/voice-report.mp3' : undefined,
      });

      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || 'Failed to submit report.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Report Civic Signal</h1>
        <p className="text-xs text-slate-400">
          Upload photo, speak voice complaint, or type problem. AI will classify, correlate, and cluster.
        </p>
      </div>

      {result ? (
        <div className="bg-[#111726] border border-teal-500/40 rounded-2xl p-6 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Signal Successfully Processed!</h3>
            <p className="text-xs text-slate-400">
              {result.isClustered
                ? 'Your report was automatically unified into an existing active incident.'
                : 'A new Issue Fingerprint was created from your signal.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161F33] border border-[#1F2C47] text-left space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Issue:</span>
              <span className="text-teal-400 font-bold">#{result.issue.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Inferred Category:</span>
              <span className="text-white">{result.issue.canonicalCategory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Priority Score:</span>
              <span className="text-red-400 font-bold">
                {result.issue.priorityBand} ({result.issue.priorityScore}/100)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Corroborated Signals:</span>
              <span className="text-cyan-400 font-bold">{result.issue.signalCount} Signals</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(`/issues/${result.issue.id}`)}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
            >
              View Issue Fingerprint →
            </button>
            <button
              onClick={() => {
                setResult(null);
                setDescription('');
                setMediaUrl('');
                setVoiceRecorded(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#161F33] hover:bg-[#1F2C47] text-white font-medium text-xs border border-[#1F2C47] transition"
            >
              Submit Another Signal
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-200">
                Describe the Infrastructure Issue
              </label>
              <span className="text-[10px] font-mono text-slate-400">AI infers category automatically</span>
            </div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. The streetlight near the parking area is not working and the path is completely dark..."
              className="w-full bg-[#161F33] border border-[#1F2C47] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition leading-relaxed"
            />
          </div>

          {/* Voice Complaint Section */}
          <div className="p-3 bg-[#161F33] rounded-xl border border-[#1F2C47] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                  isRecording
                    ? 'bg-red-500 animate-pulse text-white'
                    : voiceRecorded
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                    : 'bg-[#090D16] text-slate-400 border border-[#1F2C47]'
                }`}
              >
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {isRecording
                    ? 'Listening... Recording voice signal'
                    : voiceRecorded
                    ? 'Voice Signal Recorded & Transcribed'
                    : 'Record Voice Report'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {voiceRecorded
                    ? 'Speech-to-text transcript added to description'
                    : 'Speak naturally in any campus dialect'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleVoice}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 border border-teal-500/30'
              }`}
            >
              {isRecording ? 'Stop' : voiceRecorded ? 'Record Again' : 'Record'}
            </button>
          </div>

          {/* Photo Upload & Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-teal-400" />
              Attach Photo Evidence
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {samplePhotos.map((photo) => (
                <button
                  type="button"
                  key={photo.label}
                  onClick={() => setMediaUrl(photo.url)}
                  className={`relative rounded-xl overflow-hidden aspect-video border transition text-left group ${
                    mediaUrl === photo.url
                      ? 'border-teal-400 ring-2 ring-teal-500/40'
                      : 'border-[#1F2C47] hover:border-slate-500'
                  }`}
                >
                  <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 flex items-end p-1.5">
                    <span className="text-[10px] text-slate-200 font-medium truncate">
                      {photo.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-1">
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Or paste custom image URL (https://...)"
                className="w-full bg-[#161F33] border border-[#1F2C47] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* Campus Location Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              Campus Location
            </label>
            <select
              value={locationName}
              onChange={handleLocationSelect}
              className="w-full bg-[#161F33] border border-[#1F2C47] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition"
            >
              {campusLocations.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} (GPS: {loc.lat}, {loc.lng})
                </option>
              ))}
            </select>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-teal-500/20 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Radio className="w-4 h-4 animate-spin" />
                Fusing Signals & Clustering...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit to PULSE-5 Engine
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
