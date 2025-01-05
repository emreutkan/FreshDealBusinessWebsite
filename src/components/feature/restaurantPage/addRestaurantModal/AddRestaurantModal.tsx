import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../redux/store";
import { addRestaurant, AddRestaurantPayload } from "../../../../redux/thunks/restaurantThunk";
import {
    GoogleMap,
    Marker,
    LoadScript,
    StandaloneSearchBox,
} from "@react-google-maps/api";
import styles from "./addRestaurantModal.module.css";

interface AddRestaurantModalProps {
    onClose: () => void;
}

const MAP_CONTAINER_STYLE = {
    width: "100%",
    height: "100%",
};

const DEFAULT_CENTER = {
    lat: 37.7749,
    lng: -122.4194,
};

const AddRestaurantModal: React.FC<AddRestaurantModalProps> = ({ onClose }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [formData, setFormData] = useState({
        restaurantName: "",
        restaurantDescription: "",
        longitude: "",
        latitude: "",
        category: "",
        workingDays: "",
        workingHoursStart: "",
        workingHoursEnd: "",
        listings: "",
        image: null as File | null,
        restaurantAddress: "",
    });

    const [markerPosition, setMarkerPosition] = useState(DEFAULT_CENTER);
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(
        null
    );

    const searchBoxRef = useRef<StandaloneSearchBox | null>(null);

    const getIpLocation = async (): Promise<google.maps.LatLngLiteral | null> => {
        try {
            const response = await fetch("https://ipapi.co/json/");
            if (!response.ok) {
                throw new Error("Failed to fetch IP-based location");
            }
            const data = await response.json();
            if (
                data &&
                typeof data.latitude === "number" &&
                typeof data.longitude === "number"
            ) {
                return { lat: data.latitude, lng: data.longitude };
            }
            return null;
        } catch (error) {
            console.error("Error getting IP-based location:", error);
            return null;
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                },
                async (error) => {
                    console.error("Error getting current position:", error);

                    const ipLocation = await getIpLocation();
                    if (ipLocation) {
                        setUserLocation(ipLocation);
                    }
                }
            );
        } else {
            (async () => {
                const ipLocation = await getIpLocation();
                if (ipLocation) {
                    setUserLocation(ipLocation);
                }
            })();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
        }
    };

    const reverseGeocode = async (lat: number, lng: number) => {
        const geocoder = new google.maps.Geocoder();
        const location = { lat, lng };

        geocoder.geocode({ location }, (results, status) => {
            if (status === "OK" && results && results.length > 0) {
                const address = results[0].formatted_address;
                setFormData((prev) => ({
                    ...prev,
                    restaurantAddress: address,
                }));
            } else {
                console.error("Reverse geocoding failed:", status);
            }
        });
    };

    const onMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const latitude = e.latLng.lat();
            const longitude = e.latLng.lng();
            setMarkerPosition({ lat: latitude, lng: longitude });
            setFormData((prev) => ({
                ...prev,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
            }));

            reverseGeocode(latitude, longitude);
        }
    };

    const onPlacesChanged = () => {
        const places = searchBoxRef.current?.getPlaces();

        if (places && places.length > 0) {
            const place = places[0];
            if (!place.geometry || !place.geometry.location) return;

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            setMarkerPosition({ lat, lng });
            setFormData((prev) => ({
                ...prev,
                latitude: lat.toString(),
                longitude: lng.toString(),
            }));

            const address =
                place.formatted_address || place.name || "Unknown place";
            setFormData((prev) => ({
                ...prev,
                restaurantAddress: address,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: AddRestaurantPayload = {
            restaurantName: formData.restaurantName,
            restaurantDescription: formData.restaurantDescription || undefined,
            longitude: parseFloat(formData.longitude),
            latitude: parseFloat(formData.latitude),
            category: formData.category,
            workingDays: formData.workingDays.split(",").map(day => day.trim()),
            workingHoursStart: formData.workingHoursStart || undefined,
            workingHoursEnd: formData.workingHoursEnd || undefined,
            listings: parseInt(formData.listings, 10),
            image: formData.image || undefined,
        };

        await dispatch(addRestaurant(payload));
        onClose();
    };

    const mapCenter = userLocation || markerPosition || DEFAULT_CENTER;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>Add New Restaurant</h2>

                <div className={styles.content}>
                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <input
                            type="text"
                            name="restaurantName"
                            placeholder="Restaurant Name"
                            value={formData.restaurantName}
                            onChange={handleChange}
                            required
                        />
                        <textarea
                            name="restaurantDescription"
                            placeholder="Description"
                            value={formData.restaurantDescription}
                            onChange={handleChange}
                            rows={4}
                        />
                        <input
                            type="text"
                            name="category"
                            placeholder="Category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="workingDays"
                            placeholder="Working Days (e.g., Mon-Fri)"
                            value={formData.workingDays}
                            onChange={handleChange}
                        />
                        <label htmlFor="restaurantName">Working Hours Start</label>

                        <div className={styles.timeInputs}>
                            <input
                                type="time"
                                name="workingHoursStart"
                                placeholder="Start Time"
                                value={formData.workingHoursStart}
                                onChange={handleChange}
                            />
                            <input
                                type="time"
                                name="workingHoursEnd"
                                placeholder="End Time"
                                value={formData.workingHoursEnd}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className={styles.imageInputContainer}>
                            <label className={styles.imageInputLabel}>Upload Image:</label>
                            <label className={styles.imageInput}>
                                {formData.image ? formData.image.name : "Choose an image"}
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    hidden
                                />
                            </label>
                        </div>

                        {/* Read-only latitude and longitude */}
                        <input
                            type="text"
                            name="latitude"
                            placeholder="Latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            readOnly
                        />
                        <input
                            type="text"
                            name="longitude"
                            placeholder="Longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            readOnly
                        />

                        {/* Read-only address */}
                        <input
                            type="text"
                            name="restaurantAddress"
                            placeholder="Address"
                            value={formData.restaurantAddress}
                            onChange={handleChange}
                            readOnly
                        />

                        {/* Buttons */}
                        <div className={styles.buttonContainer}>
                            <button type="submit" className={styles.submitButton}>
                                Add Restaurant
                            </button>
                            <button type="button" className={styles.cancelButton} onClick={onClose}>
                                Cancel
                            </button>
                        </div>
                    </form>

                    {/* Map Section */}
                    <div className={styles.mapContainer}>
                        <LoadScript
                            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY!}
                            libraries={["places"]}
                        >
                            {/* Search Box */}
                            <StandaloneSearchBox
                                onLoad={(ref) => (searchBoxRef.current = ref)}
                                onPlacesChanged={onPlacesChanged}
                            >
                                <input
                                    type="text"
                                    placeholder="Search for an address"
                                    className={styles.searchBoxInput}
                                />
                            </StandaloneSearchBox>

                            <GoogleMap
                                mapContainerStyle={MAP_CONTAINER_STYLE}
                                center={mapCenter}
                                zoom={12}
                                onClick={onMapClick}
                            >
                                {/* Marker for new restaurant */}
                                <Marker position={markerPosition} />

                                {/* Marker for user's location */}
                                {userLocation && (
                                    <Marker
                                        position={userLocation}
                                        icon={{
                                            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                                        }}
                                    />
                                )}
                            </GoogleMap>
                        </LoadScript>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddRestaurantModal;
