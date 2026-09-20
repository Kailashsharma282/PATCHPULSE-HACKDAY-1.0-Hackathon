import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { getPriorityColor } from '../lib/utils';

export interface MapIssue {
  id: string;
  canonicalSummary: string;
  canonicalCategory: string;
  latitude: number;
  longitude: number;
  locationName: string;
  priorityScore: number;
  priorityBand: string;
  status: string;
  affectedRadius?: number;
}

interface InteractiveMapProps {
  issues: MapIssue[];
  selectedIssueId?: string;
  onSelectIssue?: (issue: MapIssue) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  height = '480px',
  center = [12.9915, 80.2337],
  zoom = 16,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      // CartoDB Dark Matter tiles for stunning command center aesthetics
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when issues change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markersRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();

    issues.forEach((issue) => {
      const isCritical = issue.priorityBand === 'CRITICAL';
      const isHigh = issue.priorityBand === 'HIGH';
      const colorHex = isCritical
        ? '#EF4444'
        : isHigh
        ? '#F97316'
        : issue.priorityBand === 'MEDIUM'
        ? '#EAB308'
        : '#10B981';

      // Custom pulse HTML marker
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background-color: ${colorHex}; opacity: 0.3;" class="pulse-marker-ring"></div>
            <div style="width: 14px; height: 14px; border-radius: 9999px; background-color: ${colorHex}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${colorHex};"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon });

      // Affected radius circle
      const radiusCircle = L.circle([issue.latitude, issue.longitude], {
        radius: issue.affectedRadius || 60,
        color: colorHex,
        fillColor: colorHex,
        fillOpacity: 0.12,
        weight: 1,
        dashArray: '4, 4',
      });

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="padding: 4px; min-width: 200px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #2DD4BF;">#${issue.id}</span>
            <span style="font-size: 10px; font-family: monospace; font-weight: bold; color: ${colorHex}; border: 1px solid ${colorHex}55; padding: 2px 6px; border-radius: 9999px;">
              ${issue.priorityBand} (${issue.priorityScore})
            </span>
          </div>
          <p style="font-weight: 600; font-size: 12px; margin-bottom: 4px; color: #F1F5F9; line-height: 1.3;">
            ${issue.canonicalSummary}
          </p>
          <p style="font-size: 11px; color: #94A3B8; margin-bottom: 8px;">
            📍 ${issue.locationName}
          </p>
          <button id="view-issue-${issue.id}" style="width: 100%; padding: 6px 10px; background-color: #2DD4BF; color: #090D16; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
            View Intelligence Page →
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-issue-${issue.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectIssue) onSelectIssue(issue);
            navigate(`/issues/${issue.id}`);
          };
        }
      });

      markerGroup.addLayer(radiusCircle);
      markerGroup.addLayer(marker);
    });

    // If issues exist, center on the first or selected
    if (selectedIssueId) {
      const selected = issues.find((i) => i.id === selectedIssueId);
      if (selected) {
        map.setView([selected.latitude, selected.longitude], 17);
      }
    }
  }, [issues, selectedIssueId]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="rounded-2xl overflow-hidden border border-[#1F2C47] shadow-xl relative z-10"
    />
  );
};
