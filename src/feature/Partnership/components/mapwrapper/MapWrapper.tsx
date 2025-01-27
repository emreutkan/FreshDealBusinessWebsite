import React from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

interface MapWrapperProps {
    mapContainerStyle: {
        width: string;
        height: string;
    };
    center: google.maps.LatLngLiteral;
    zoom: number;
    markerPosition: google.maps.LatLngLiteral;
    userLocation: google.maps.LatLngLiteral | null;
}

/**
 * Renders ONLY the map and markers.
 * We do NOT include StandaloneSearchBox here
 * because the parent (AddBusinessModel) already uses it.
 */
const MapWrapper: React.FC<MapWrapperProps> = ({
                                                   mapContainerStyle,
                                                   center,
                                                   zoom,
                                                   markerPosition,
                                                   userLocation,
                                               }) => {
    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
        >
            <Marker position={markerPosition} />

            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    }}
                />
            )}
        </GoogleMap>
    );
};

export default MapWrapper;
