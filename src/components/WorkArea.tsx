import { FC, useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import { IFileData } from "../types";
import "leaflet/dist/leaflet.css";

const Layout = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  font-size: 1em;
  padding: 24px;
  height: 100%;
`;

const LayoutTitle = styled.h2`
  font-size: 18px;
`;

const MapWrapper = styled.div`
  height: 500px;
  width: 100%;
`;

interface IPolygonData {
  positions: [number, number][];
  isSelected: boolean;
}

interface IWorkAreaProps {
  fileData: IFileData;
}

const WorkArea: FC<IWorkAreaProps> = ({ fileData }) => {
  const [polygonData, setPolygonData] = useState<IPolygonData[]>([]);

  // Function to calculate the centroid of a set of polygons
  const calculateCenter = (polygonData: IPolygonData[]) => {
    let totalLat = 0;
    let totalLng = 0;
    let numPoints = 0;

    polygonData.forEach((polygon) => {
      polygon.positions.forEach((coord) => {
        totalLat += coord[0];
        totalLng += coord[1];
        numPoints++;
      });
    });

    return {
      lat: totalLat / numPoints,
      lng: totalLng / numPoints,
    };
  };

  // Memoized center to avoid recalculating on each render
  const center = useMemo(() => calculateCenter(polygonData), [polygonData]);

  // Load the polygon positions and initialize selection state from fileData
  useEffect(() => {
    const initialPolygonData = fileData.data.features.map((feature) => ({
      positions: feature.geometry.coordinates[0].map(
        (coord) => [coord[1], coord[0]] as [number, number]
      ),
      isSelected: false, // Initially, none of the polygons are selected
    }));

    setPolygonData(initialPolygonData);
  }, [fileData]);

  // Function to handle polygon click and toggle its selection
  const handlePolygonClick = (index: number) => {
    setPolygonData((prevPolygonData) =>
      prevPolygonData.map((polygon, idx) => {
        if (idx === index) {
          return { ...polygon, isSelected: !polygon.isSelected };
        }
        return polygon;
      })
    );
  };

  // Function to determine polygon styles
  const getPolygonStyle = (isSelected: boolean) => {
    return {
      color: isSelected ? "#DD2C00" : "#304FFE",
      weight: isSelected ? 5 : 2,
      fillOpacity: isSelected ? 0.6 : 0.3,
    };
  };

  return (
    <Layout>
      <LayoutTitle>Work Area</LayoutTitle>
      <MapWrapper>
        {polygonData.length > 0 && (
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {polygonData.map((polygon, index) => (
              <Polygon
                key={index}
                positions={polygon.positions}
                pathOptions={getPolygonStyle(polygon.isSelected)}
                eventHandlers={{
                  click: () => handlePolygonClick(index),
                }}
              />
            ))}
          </MapContainer>
        )}
      </MapWrapper>
    </Layout>
  );
};

export default WorkArea;
