// MapWrapper.tsx
import React from 'react';
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import styles from "../addBusinessModel/addBusinessModel.module.css"; // Add this import

interface MapWrapperProps {
    mapContainerStyle: {
        width: string;
        height: string;
    };
    center: google.maps.LatLngLiteral;
    zoom: number;
    markerPosition: google.maps.LatLngLiteral;
    userLocation: google.maps.LatLngLiteral | null;
    onPlacesChanged: () => void;
    searchBoxRef: React.MutableRefObject<google.maps.places.SearchBox | null>;
    searchingForAddress: boolean;
    setSearchingForAddress: (value: boolean) => void; // Add this line
    isEditing?: boolean;
    restaurant?: {
        latitude: number;
        longitude: number;
    };
}

const MapWrapper: React.FC<MapWrapperProps> = ({
                                                   mapContainerStyle,
                                                   center,
                                                   zoom,
                                                   markerPosition,
                                                   userLocation,
                                                   onPlacesChanged,
                                                   searchBoxRef,
                                                   searchingForAddress,
                                                   setSearchingForAddress, // Add this line
                                                   isEditing,
                                                   restaurant
                                               }) => {
    return (
        <>
            <StandaloneSearchBox
                onLoad={(ref) => (searchBoxRef.current = ref)}
                onPlacesChanged={onPlacesChanged}
            >
                <input
                    type="text"
                    placeholder={
                        isEditing && restaurant
                            ? `Coordinates: ${restaurant.latitude}, ${restaurant.longitude}`
                            : "Search for an address"
                    }
                    className={`${styles.defaultInput} ${
                        searchingForAddress ? styles.defaultInputShowMap : ""
                    }`}
                    onFocus={() => setSearchingForAddress(true)}
                    onBlur={() => setSearchingForAddress(false)}
                />
            </StandaloneSearchBox>

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
        </>
    );
};

export default MapWrapper;