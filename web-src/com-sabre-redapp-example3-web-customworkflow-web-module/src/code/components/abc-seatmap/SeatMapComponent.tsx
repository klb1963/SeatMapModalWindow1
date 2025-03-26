import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { getFlightFromSabreData } from '../abc-seatmap/getFlightFromSabreData';

interface SeatMapProps {
  config: any;
  data: any; // вместо flight теперь получаем весь data
}

const SeatMapComponent: React.FC<SeatMapProps> = ({ config, data }) => {
  const [segmentIndex, setSegmentIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const flight = getFlightFromSabreData(data, segmentIndex); // это рейс с сегментом
  const flightSegments = data.flightSegments || [];

  const seatMapData = {
    config,
    flight,
    layout: {
      decks: [
        {
          id: 'main-deck',
          name: 'Deck 1',
          width: 600,
          height: 400,
          rows: [
            { label: '1', seats: [{ label: 'A', x: 50, y: 50 }, { label: 'B', x: 100, y: 50 }] },
            { label: '2', seats: [{ label: 'A', x: 50, y: 100 }] }
          ]
        }
      ]
    },
    availability: [
      { label: '1A', price: 50, currency: 'USD', color: 'green', onlyForPassengerType: ['ADT'] },
      { label: '1B', price: 45, currency: 'USD', color: 'yellow', onlyForPassengerType: ['ADT'] },
      { label: '2A', price: 30, currency: 'USD', color: 'lightblue' }
    ],
    passengers: [{ id: 'PAX1', name: 'Иванов И.И.', type: 'ADT' }]
  };

  const sendToIframe = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) {
      console.warn('⚠️ iframe or contentWindow not available');
      return;
    }

    const message = {
      type: 'seatMaps',
      config: JSON.stringify(seatMapData.config),
      flight: JSON.stringify(seatMapData.flight),
      layout: JSON.stringify(seatMapData.layout),

      // не отправляем, пока не полчили эти данные
      // availability: JSON.stringify(seatMapData.availability),
      // passengers: JSON.stringify(seatMapData.passengers)

    };

    console.log('📤 postMessage payload:', message);
    iframe.contentWindow.postMessage(message, '*');
  };

  useEffect(() => {
    sendToIframe(); // ⬅️ отправка при изменении сегмента
  }, [segmentIndex]);

  return (
    <div style={{ padding: '1rem' }}>

      {/* окно с данными о рейсе
       <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#333' }}>
        <strong>🛫 Flight debug:</strong>
        <pre>{JSON.stringify(flight, null, 2)}</pre>
      </div> */}

      <div style = {{marginBottom: '1rem'}}>
        <label htmlFor="segmentSelect">Выберите сегмент: </label>
        <select
          id="segmentSelect"
          value={segmentIndex}
          onChange={(e) => setSegmentIndex(Number(e.target.value))}>
          {flightSegments.map((segment: any, index: number) => (
            <option key={index} value={index}>
              {segment.MarketingAirline?.EncodeDecodeElement?.Code || 'XX'} {segment.FlightNumber || '000'}
              &nbsp;→&nbsp;
              {segment.OriginLocation?.EncodeDecodeElement?.Code || '???'} –
              {segment.DestinationLocation?.EncodeDecodeElement?.Code || '???'}
            </option>
          ))}
        </select>
      </div>

      {/* <button onClick={sendToIframe} style={{ margin: '1rem 0' }}>
        🔁 Отправить данные вручную
      </button> */}

      <iframe
        ref={iframeRef}
        src="https://quicket.io/react-proxy-app/"
        width="100%"
        height="800"
        style={{ border: '1px solid #ccc' }}
        title="SeatMapIframe"
        onLoad={() => {
          console.log('✅ iframe loaded, sending data...');
          sendToIframe();
        }}
      />
    </div>
  );
};

export default SeatMapComponent;