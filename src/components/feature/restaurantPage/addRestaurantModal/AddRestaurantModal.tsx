import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from "../../../../redux/store.ts";
import { addRestaurant } from "../../../../redux/thunks/restaurantThunk.ts";
import { AddRestaurantPayload } from "../../../../redux/thunks/restaurantThunk.ts";
import { GoogleMap, Marker, LoadScript, Autocomplete } from "@react-google-maps/api";
import styles from './addRestaurantModal.module.css';

interface AddRestaurantModalProps {
    onClose: () => void;
}

const MAP_CONTAINER_STYLE = {
    width: "100%", // Full width of the right column
    height: "400px",
};

const DEFAULT_CENTER = {
    lat: 37.7749, // Default latitude (San Francisco)
    lng: -122.4194, // Default longitude (San Francisco)
};

const AddRestaurantModal: React.FC<AddRestaurantModalProps> = ({ onClose }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [formData, setFormData] = useState({
        restaurantName: '',
        restaurantDescription: '',
        longitude: '',
        latitude: '',
        category: '',
        workingDays: '',
        workingHoursStart: '',
        workingHoursEnd: '',
        listings: '',
        image: null as File | null,
    });

    const [markerPosition, setMarkerPosition] = useState(DEFAULT_CENTER);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
        }
    };

    const onLoadAutocomplete = (autocompleteInstance: google.maps.places.Autocomplete) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const latitude = place.geometry.location?.lat();
                const longitude = place.geometry.location?.lng();
                setMarkerPosition({ lat: latitude!, lng: longitude! });
                setFormData((prev) => ({
                    ...prev,
                    latitude: latitude!.toString(),
                    longitude: longitude!.toString(),
                }));
            }
        }
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
            workingDays: formData.workingDays.split(','),
            workingHoursStart: formData.workingHoursStart || undefined,
            workingHoursEnd: formData.workingHoursEnd || undefined,
            listings: parseInt(formData.listings),
            image: formData.image || undefined,
        };

        await dispatch(addRestaurant(payload));
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>Add New Restaurant</h2>
                <div className={styles.content}>
                    {/* Left Column: Form */}
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
                        <input
                            type="time"
                            name="workingHoursStart"
                            placeholder="Start Hours"
                            value={formData.workingHoursStart}
                            onChange={handleChange}
                        />
                        <input
                            type="time"
                            name="workingHoursEnd"
                            placeholder="End Hours"
                            value={formData.workingHoursEnd}
                            onChange={handleChange}
                        />
                        <input
                            type="number"
                            name="listings"
                            placeholder="Number of Listings"
                            value={formData.listings}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <button type="submit" className={styles.submitButton}>
                            Add Restaurant
                        </button>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>
                            Cancel
                        </button>
                    </form>

                    <div className={styles.mapContainer}>
                        <LoadScript
                            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!}
                            libraries={['places']}
                        >
                            <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                                <input
                                    type="text"
                                    placeholder="Search Address"
                                    className={styles.autocompleteInput}
                                />
                            </Autocomplete>
                            <GoogleMap
                                mapContainerStyle={MAP_CONTAINER_STYLE}
                                center={markerPosition}
                                zoom={12}
                                onClick={onMapClick}
                            >
                                <Marker position={markerPosition} />
                            </GoogleMap>
                        </LoadScript>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddRestaurantModal;
