import React, { useEffect, useRef, useState } from "react";
import styles from "./addBusinessModel.module.css";
import { Button } from "@mui/material";
import { StandaloneSearchBox } from "@react-google-maps/api";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../redux/store.ts";
import {
    addRestaurant,
    AddRestaurantPayload,
} from "../../../../redux/thunks/restaurantThunk.ts";
import MapWrapper from "../mapwrapper/MapWrapper.tsx";

const DEFAULT_CENTER = {
    lat: 37.7749,
    lng: -122.4194,
};

const MAP_CONTAINER_STYLE = {
    width: "100%",
    height: "100%",
};

interface RestaurantData {
    id: string;
    restaurantName: string;
    restaurantDescription: string;
    longitude: number;
    latitude: number;
    category: string;
    workingDays: string[];
    workingHoursStart: string;
    workingHoursEnd: string;
    pickup: boolean;
    delivery: boolean;
    maxDeliveryDistance: number;
    deliveryFee: number;
    minOrderAmount: number;
    restaurantEmail: string;
    restaurantPhone: string;
    image_url: string;
}

interface BusinessModelProps {
    isEditing?: boolean;
    restaurant?: RestaurantData;
}

const AddBusinessModel: React.FC<BusinessModelProps> = ({
                                                            isEditing = false,
                                                            restaurant,
                                                        }) => {
    // Initialize form data
    const [formData, setFormData] = useState({
        restaurantName: isEditing ? restaurant?.restaurantName || "" : "",
        restaurantDescription: isEditing ? restaurant?.restaurantDescription || "" : "",
        longitude: isEditing && restaurant?.longitude ? restaurant.longitude.toString() : "",
        latitude: isEditing && restaurant?.latitude ? restaurant.latitude.toString() : "",
        category: isEditing ? restaurant?.category || "" : "",
        workingDays: isEditing ? restaurant?.workingDays || [] : [],
        workingHoursStart: isEditing ? restaurant?.workingHoursStart || "" : "",
        workingHoursEnd: isEditing ? restaurant?.workingHoursEnd || "" : "",
        restaurantEmail: isEditing ? restaurant?.restaurantEmail || "" : "",
        restaurantPhone: isEditing ? restaurant?.restaurantPhone || "" : "",
        pickup: isEditing ? restaurant?.pickup || false : false,
        delivery: isEditing ? restaurant?.delivery || false : false,
        maxDeliveryDistance:
            isEditing && restaurant?.maxDeliveryDistance
                ? restaurant.maxDeliveryDistance.toString()
                : "",
        deliveryFee:
            isEditing && restaurant?.deliveryFee ? restaurant.deliveryFee.toString() : "",
        minOrderAmount:
            isEditing && restaurant?.minOrderAmount
                ? restaurant.minOrderAmount.toString()
                : "",
    });

    const [currentStep, setCurrentStep] = useState(1);

    const [phoneModalOpen, setPhoneModalOpen] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [selectedAreaCode, setSelectedAreaCode] = useState("+90");
    const [selectedCategory, setSelectedCategory] = useState(
        isEditing ? restaurant?.category || "" : ""
    );

    const [searchingForAddress, setSearchingForAddress] = useState(false);
    const [daysModalOpen, setDaysModalOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    // For the address (StandaloneSearchBox)
    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

    // For the map
    const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral>(
        isEditing && restaurant
            ? { lat: restaurant.latitude, lng: restaurant.longitude }
            : DEFAULT_CENTER
    );
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(
        null
    );

    const [invalidFields, setInvalidFields] = useState<string[]>([]);

    const dispatch = useDispatch<AppDispatch>();
    const daysModalRef = useRef<HTMLDivElement>(null);

    /** Close days modal if clicking outside it */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                daysModalOpen &&
                daysModalRef.current &&
                !daysModalRef.current.contains(e.target as Node)
            ) {
                setDaysModalOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [daysModalOpen]);

    const areaCodes = ["+90", "+1", "+44"];
    const restaurantCategories = [
        "Baked Goods",
        "Fruits & Vegetables",
        "Meat & Seafood",
        "Dairy Products",
        "Ready Meals",
        "Snacks",
        "Beverages",
        "Pantry Items",
        "Frozen Foods",
        "Organic Products",
    ];
    const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    /** ─────────────────────────────────────────
     *   Attempt to get user location
     *  ───────────────────────────────────────── */
    const getIpLocation = async (): Promise<google.maps.LatLngLiteral | null> => {
        try {
            const response = await fetch("https://ipapi.co/json/");
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            if (data && typeof data.latitude === "number" && typeof data.longitude === "number") {
                return { lat: data.latitude, lng: data.longitude };
            }
            return null;
        } catch (error) {
            console.error("Error getting IP-based location:", error);
            return null;
        }
    };

    useEffect(() => {
        let isMounted = true;

        const fetchLocation = async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        if (isMounted) {
                            setUserLocation({
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            });
                        }
                    },
                    async () => {
                        if (isMounted) {
                            const ipLocation = await getIpLocation();
                            if (ipLocation) setUserLocation(ipLocation);
                        }
                    }
                );
            } else {
                if (isMounted) {
                    const ipLocation = await getIpLocation();
                    if (ipLocation) setUserLocation(ipLocation);
                }
            }
        };

        fetchLocation();

        return () => {
            isMounted = false;
        };
    }, []);

    /** When user types an address in the search box */
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
        }
    };

    /** Handle normal form changes (excluding time) */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        // If it's a checkbox (pickup/delivery), handle differently
        if (type === "checkbox") {
            setFormData((prev) => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked,
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        setInvalidFields((prev) => prev.filter((f) => f !== name));
    };

    /** Custom time-input logic */
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Remove non-digits
        let digits = value.replace(/\D/g, "");
        // Enforce max length of 4 digits total
        if (digits.length > 4) {
            digits = digits.slice(0, 4);
        }

        let formatted = "";
        // If 2 or fewer digits, no colon
        if (digits.length <= 2) {
            formatted = digits;
        } else {
            // Insert colon after the first 2 digits
            formatted = digits.slice(0, 2) + ":" + digits.slice(2);
        }

        setFormData((prev) => ({ ...prev, [name]: formatted }));
        setInvalidFields((prevInvalid) => prevInvalid.filter((f) => f !== name));
    };

    /** Image file changes */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const file = e.target.files[0];
            const allowedTypes = ["image/png", "image/jpeg"];
            if (!allowedTypes.includes(file.type)) {
                alert("Only PNG and JPEG images are allowed.");
                return;
            }
            setUploadedFile(file);
            setInvalidFields((prev) => prev.filter((f) => f !== "image"));
        }
    };

    /** Handle open days (multi-select) */
    const handleDaySelection = (day: string) => {
        setFormData((prev) => {
            const alreadySelected = prev.workingDays.includes(day);
            return {
                ...prev,
                workingDays: alreadySelected
                    ? prev.workingDays.filter((d) => d !== day)
                    : [...prev.workingDays, day],
            };
        });
    };

    /** Validate step 1 */
    const validateStep1 = () => {
        const requiredFields = [
            "restaurantEmail",
            "restaurantPhone",
            "restaurantName",
            "restaurantDescription",
            "category",
            "latitude",
            "longitude",
            "workingHoursStart",
            "workingHoursEnd",
        ];
        const invalids: string[] = [];

        requiredFields.forEach((field) => {
            if (!formData[field as keyof typeof formData]) {
                invalids.push(field);
            }
        });

        if (formData.workingDays.length === 0) {
            invalids.push("workingDays");
        }
        if (!uploadedFile) {
            invalids.push("image");
        }

        setInvalidFields(invalids);
        return invalids.length === 0;
    };

    /** Step 1 -> Step 2 */
    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep1()) {
            alert("Please fill in all required fields correctly before continuing.");
            return;
        }
        setCurrentStep(2);
    };

    /** Validate step 2 */
    const validateStep2 = () => {
        const invalids: string[] = [];
        if (!formData.pickup && !formData.delivery) {
            invalids.push("pickupOrDelivery");
        }
        if (formData.delivery) {
            if (!formData.maxDeliveryDistance) invalids.push("maxDeliveryDistance");
            if (!formData.deliveryFee) invalids.push("deliveryFee");
            if (!formData.minOrderAmount) invalids.push("minOrderAmount");
        }
        setInvalidFields(invalids);
        return invalids.length === 0;
    };

    /** Final submission */
    const handleComplete = async () => {
        if (!validateStep2()) {
            alert("Please fill in all required fields correctly before completing.");
            return;
        }

        const payload: AddRestaurantPayload = {
            restaurantEmail: formData.restaurantEmail,
            restaurantPhone: selectedAreaCode + formData.restaurantPhone,
            restaurantName: formData.restaurantName,
            restaurantDescription: formData.restaurantDescription,
            longitude: parseFloat(formData.longitude),
            latitude: parseFloat(formData.latitude),
            category: formData.category,
            workingHoursStart: formData.workingHoursStart, // e.g. "10:12"
            workingHoursEnd: formData.workingHoursEnd,     // e.g. "23:00"
            workingDays: formData.workingDays,
            image: uploadedFile || undefined,
            pickup: formData.pickup,
            delivery: formData.delivery,
            maxDeliveryDistance: formData.delivery
                ? parseFloat(formData.maxDeliveryDistance)
                : 0,
            deliveryFee: formData.delivery ? parseFloat(formData.deliveryFee) : 0,
            minOrderAmount: formData.delivery
                ? parseFloat(formData.minOrderAmount)
                : 0,
        };

        await dispatch(addRestaurant(payload));
        alert("Form completed successfully!");
    };

    /** For area code, category, days modals */
    const togglePhoneModal = () => setPhoneModalOpen(!phoneModalOpen);
    const toggleCategoryModal = () => setCategoryModalOpen(!categoryModalOpen);
    const toggleDaysModal = () => setDaysModalOpen(!daysModalOpen);

    /** Helper to mark invalid fields */
    const isInvalid = (fieldName: string): boolean => invalidFields.includes(fieldName);

    /** Map center priority: user location -> chosen marker -> fallback default */
    const mapCenter = userLocation || markerPosition || DEFAULT_CENTER;

    return (
        <div className={styles.fullHeightContainer}>
            {/* ------- LEFT SIDE FORM ------- */}
            <div
                className={`${styles.outerDiv} ${
                    searchingForAddress ? styles.outerDivShowMap : ""
                }`}
            >
                {currentStep === 1 && (
                    <>
                        <h2 className={styles.heading}>Are you ready to run businesses with us?</h2>
                        <form onSubmit={handleContinue} className={styles.form}>
                            <div className={styles.formColumns}>
                                {/* Column 1 */}
                                <div className={styles.inputContainer}>
                                    <span className={styles.sectionTitle}>Add your details</span>
                                    <input
                                        name="restaurantEmail"
                                        className={`${styles.defaultInput} ${
                                            isInvalid("restaurantEmail") ? styles.invalidInput : ""
                                        }`}
                                        placeholder="Business E-mail"
                                        onChange={handleChange}
                                        value={formData.restaurantEmail}
                                    />

                                    <div className={styles.phoneContainer}>
                                        <button
                                            type="button"
                                            className={`${styles.defaultInput} ${styles.areaCodeButton} ${
                                                isInvalid("restaurantPhone") ? styles.invalidInput : ""
                                            }`}
                                            onClick={togglePhoneModal}
                                        >
                                            <span>{selectedAreaCode}</span>
                                        </button>
                                        <input
                                            name="restaurantPhone"
                                            className={`${styles.defaultInput} ${styles.phoneNumberInput} ${
                                                isInvalid("restaurantPhone") ? styles.invalidInput : ""
                                            }`}
                                            placeholder="Phone Number"
                                            inputMode="numeric"
                                            onChange={handleChange}
                                            value={formData.restaurantPhone}
                                        />
                                        {phoneModalOpen && (
                                            <div className={styles.modal}>
                                                {areaCodes.map((code) => (
                                                    <button
                                                        key={code}
                                                        type="button"
                                                        className={`${styles.modalButton} ${
                                                            code === selectedAreaCode ? styles.selectedButton : ""
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedAreaCode(code);
                                                            togglePhoneModal();
                                                        }}
                                                    >
                                                        {code}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* The actual StandaloneSearchBox is here in the parent */}
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
                                            } ${isInvalid("longitude") ? styles.invalidInput : ""}`}
                                            onFocus={() => setSearchingForAddress(true)}
                                            onBlur={() => setSearchingForAddress(false)}
                                        />
                                    </StandaloneSearchBox>
                                </div>

                                {/* Column 2 */}
                                <div className={styles.inputContainer}>
                                    <span className={styles.sectionTitle}>Restaurant Details</span>
                                    <input
                                        name="restaurantName"
                                        className={`${styles.defaultInput} ${
                                            isInvalid("restaurantName") ? styles.invalidInput : ""
                                        }`}
                                        placeholder="Restaurant Name"
                                        onChange={handleChange}
                                        value={formData.restaurantName}
                                    />

                                    <input
                                        name="restaurantDescription"
                                        className={`${styles.defaultInput} ${
                                            isInvalid("restaurantDescription") ? styles.invalidInput : ""
                                        }`}
                                        placeholder="Restaurant Description"
                                        onChange={handleChange}
                                        value={formData.restaurantDescription}
                                    />

                                    <div className={styles.modalContainer}>
                                        <button
                                            type="button"
                                            className={`${styles.defaultInput} ${styles.selectButton} ${
                                                isInvalid("category") ? styles.invalidInput : ""
                                            }`}
                                            onClick={toggleCategoryModal}
                                        >
                                            {selectedCategory || "Select Category"}
                                        </button>
                                        {categoryModalOpen && (
                                            <div className={styles.modal}>
                                                {restaurantCategories.map((cat) => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        className={`${styles.modalButton} ${
                                                            cat === selectedCategory ? styles.selectedButton : ""
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedCategory(cat);
                                                            setFormData((prev) => ({ ...prev, category: cat }));
                                                            toggleCategoryModal();
                                                        }}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.inputContainer}>
                                    <span className={styles.sectionTitle}>Extra Details</span>

                                    <div className={styles.modalContainer}>
                                        <button
                                            type="button"
                                            className={`${styles.defaultInput} ${styles.selectButton} ${
                                                isInvalid("workingDays") ? styles.invalidInput : ""
                                            }`}
                                            onClick={toggleDaysModal}
                                        >
                                            {formData.workingDays.length
                                                ? formData.workingDays.join(", ")
                                                : "Select Open Days"}
                                        </button>
                                        {daysModalOpen && (
                                            <div
                                                ref={daysModalRef}
                                                className={styles.modal}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {daysOfWeek.map((day) => (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        className={`${styles.modalButton} ${
                                                            formData.workingDays.includes(day) ? styles.selectedButton : ""
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDaySelection(day);
                                                        }}
                                                    >
                                                        {day}
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    className={styles.closeModalButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleDaysModal();
                                                    }}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.timeContainer}>
                                        <input
                                            type="text"
                                            maxLength={5}
                                            name="workingHoursStart"
                                            className={`${styles.defaultInputTime} ${
                                                isInvalid("workingHoursStart") ? styles.invalidInput : ""
                                            }`}
                                            placeholder="Open HH:MM"
                                            value={formData.workingHoursStart}
                                            onChange={handleTimeChange}
                                        />
                                        <input
                                            type="text"
                                            maxLength={5}
                                            name="workingHoursEnd"
                                            className={`${styles.defaultInputTime} ${
                                                isInvalid("workingHoursEnd") ? styles.invalidInput : ""
                                            }`}
                                            placeholder="Close HH:MM"
                                            value={formData.workingHoursEnd}
                                            onChange={handleTimeChange}
                                        />
                                    </div>

                                    <div className={styles.fileUploadContainer}>
                                        <input
                                            type="file"
                                            id="fileUpload"
                                            className={styles.fileInput}
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <label
                                            htmlFor="fileUpload"
                                            className={`${styles.fileLabel} ${
                                                isInvalid("image") ? styles.invalidInput : ""
                                            }`}
                                        >
                                            {!uploadedFile ? (
                                                <span className={styles.labelText}>
                          Add your restaurant image
                        </span>
                                            ) : (
                                                <div className={styles.successMessage}>
                                                    <span className={styles.fileName}>{uploadedFile.name}</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    {!searchingForAddress && (
                                        <Button type="submit" className={styles.continueButton}>
                                            <span>Continue</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </>
                )}

                {currentStep === 2 && (
                    <div className={styles.stepTwoContainer}>
                        <h2 className={styles.heading}>Pickup/Delivery Info</h2>

                        <div className={styles.pickupDeliveryContainer}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="pickup"
                                    checked={formData.pickup}
                                    onChange={handleChange}
                                    className={`${styles.checkbox} ${
                                        isInvalid("pickupOrDelivery") ? styles.invalidCheckbox : ""
                                    }`}
                                />{" "}
                                Pickup
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    name="delivery"
                                    checked={formData.delivery}
                                    onChange={handleChange}
                                    className={`${styles.checkbox} ${
                                        isInvalid("pickupOrDelivery") ? styles.invalidCheckbox : ""
                                    }`}
                                />{" "}
                                Delivery
                            </label>
                        </div>

                        {formData.delivery && (
                            <div className={styles.deliveryDetailsContainer}>
                                <div className={styles.inputGroup}>
                                    <label>Max Delivery Distance</label>
                                    <input
                                        type="text"
                                        name="maxDeliveryDistance"
                                        placeholder="Max distance in km"
                                        onChange={handleChange}
                                        value={formData.maxDeliveryDistance}
                                        className={`${styles.defaultInput} ${
                                            isInvalid("maxDeliveryDistance") ? styles.invalidInput : ""
                                        }`}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Delivery Fee</label>
                                    <input
                                        type="text"
                                        name="deliveryFee"
                                        placeholder="Fee for delivery"
                                        onChange={handleChange}
                                        value={formData.deliveryFee}
                                        className={`${styles.defaultInput} ${
                                            isInvalid("deliveryFee") ? styles.invalidInput : ""
                                        }`}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Minimum Order Amount</label>
                                    <input
                                        type="text"
                                        name="minOrderAmount"
                                        placeholder="Min order cost"
                                        onChange={handleChange}
                                        value={formData.minOrderAmount}
                                        className={`${styles.defaultInput} ${
                                            isInvalid("minOrderAmount") ? styles.invalidInput : ""
                                        }`}
                                    />
                                </div>
                            </div>
                        )}

                        <Button onClick={handleComplete} className={styles.completeButton}>
                            Complete
                        </Button>
                    </div>
                )}
            </div>

            <div
                className={
                    !searchingForAddress ? styles.mapContainer : styles.mapContainerShowMap
                }
            >
                <MapWrapper
                    mapContainerStyle={MAP_CONTAINER_STYLE}
                    center={mapCenter}
                    zoom={12}
                    markerPosition={markerPosition}
                    userLocation={userLocation}
                />
            </div>
        </div>
    );
};

export default AddBusinessModel;
