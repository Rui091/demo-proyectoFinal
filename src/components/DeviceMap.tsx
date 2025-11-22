import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Device } from '../hooks/useDevices';

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface DeviceMapProps {
  devices: Device[];
}

export default function DeviceMap({ devices }: DeviceMapProps) {
  // Default center (Pontificia Universidad Javeriana Cali)
  const defaultCenter: [number, number] = [3.3487, -76.5316];
  
  // Filter devices that have location data
  const devicesWithLocation = devices.filter(d => d.location_lat && d.location_lng);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {devicesWithLocation.map((device) => (
          <Marker
            key={device.id}
            position={[device.location_lat!, device.location_lng!]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm mb-1">{device.model}</h3>
                <p className="text-xs text-slate-600 capitalize mb-1">
                  {device.type} • {device.status}
                </p>
                <p className="text-xs text-slate-500">
                  {device.address || `${device.location_lat}, ${device.location_lng}`}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
