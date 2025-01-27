import React, { useEffect, useRef, useState } from "react";
import styles from "./addBusinessModel.module.css";
import { Button } from "@mui/material";
import {

    StandaloneSearchBox,
} from "@react-google-maps/api";
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

interface BusinessModelProps {
    isEditing?: boolean;
    restaurant?: {
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
        restaurantEmail: string
        restaurantPhone: string
        image_url: string;
    };
}

const AddBusinessModel: React.FC<BusinessModelProps> = ({
                                                         isEditing = false,
                                                         restaurant,
                                                     }) => {
    // Initialize form data with restaurant data if editing
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
        maxDeliveryDistance: isEditing && restaurant?.maxDeliveryDistance ? restaurant.maxDeliveryDistance.toString() : "",
        deliveryFee: isEditing && restaurant?.deliveryFee ? restaurant.deliveryFee.toString() : "",
        minOrderAmount: isEditing && restaurant?.minOrderAmount ? restaurant.minOrderAmount.toString() : "",
    });
    const [currentStep, setCurrentStep] = useState(1);
    const [phoneModalOpen, setPhoneModalOpen] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [selectedAreaCode, setSelectedAreaCode] = useState("+90");
    const [selectedCategory, setSelectedCategory] = useState(
        isEditing ? restaurant?.category || "" : ""
    );    const [searchingForAddress, setSearchingForAddress] = useState(false);
    const [daysModalOpen, setDaysModalOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
    const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral>(
        isEditing && restaurant
            ? { lat: restaurant.latitude, lng: restaurant.longitude }
            : DEFAULT_CENTER
    );
    const [userLocation, setUserLocation] =
        useState<google.maps.LatLngLiteral | null>(null);

    const [invalidFields, setInvalidFields] = useState<string[]>([]);

    const dispatch = useDispatch<AppDispatch>();
    const daysModalRef = useRef<HTMLDivElement>(null);

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
     *   GOOGLE MAPS - Attempting to get user location
     *  ───────────────────────────────────────── */
    const getIpLocation = async (): Promise<google.maps.LatLngLiteral | null> => {
        try {
            const response = await fetch("https://ipapi.co/json/");
            if (!response.ok) {
                return null;
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
            isMounted = false; // Cleanup to prevent state updates on unmounted component
        };
    }, []);


    /** Handling places changed from the StandaloneSearchBox */
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            setFormData((prev) => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else if (name === "workingHoursStart" || name === "workingHoursEnd") {
            // Convert time to 24-hour format
            const timeValue = value;
            let hours = parseInt(timeValue.split(':')[0]);
            const minutes = timeValue.split(':')[1];

            // If it's in 12-hour format and PM, add 12 to hours (except for 12 PM)
            if (hours < 12 && timeValue.toLowerCase().includes('pm')) {
                hours += 12;
            }
            // If it's 12 AM, convert to 00
            else if (hours === 12 && timeValue.toLowerCase().includes('am')) {
                hours = 0;
            }

            // Format hours to ensure two digits
            const formattedHours = hours.toString().padStart(2, '0');

            // Set the time in 24-hour format
            const time24 = `${formattedHours}:${minutes}`;

            setFormData((prev) => ({ ...prev, [name]: time24 }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        setInvalidFields((prevInvalid) => prevInvalid.filter((f) => f !== name));
    };

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

    /** Day selection stored in formData.workingDays */
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

    /** Validate Step 1 fields */
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
                console.log("Invalid field:", field);
                invalids.push(field);
            }
        });

        if (formData.workingDays.length === 0) {
            console.log("Invalid field: workingDays");
            invalids.push("workingDays");
        }

        // File upload is also required.
        if (!uploadedFile) {
            console.log("Invalid field: image");
            invalids.push("image");
        }

        setInvalidFields(invalids);
        return invalids.length === 0;
    };

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep1()) {
            alert("Please fill in all required fields correctly before continuing.");
            return;
        }
        setCurrentStep(2);
    };

    /** Validate Step 2 fields */
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

        // Build final FormData to send to backend
        const finalData = new FormData();
        finalData.append("restaurantName", formData.restaurantName);
        finalData.append("restaurantDescription", formData.restaurantDescription);
        finalData.append("longitude", formData.longitude);
        finalData.append("latitude", formData.latitude);
        finalData.append("category", formData.category);
        finalData.append("workingHoursStart", formData.workingHoursStart);
        finalData.append("workingHoursEnd", formData.workingHoursEnd);
        finalData.append("pickup", formData.pickup ? "true" : "false");
        finalData.append("delivery", formData.delivery ? "true" : "false");
        finalData.append("restaurantEmail", formData.restaurantEmail);
        finalData.append("restaurantPhone", formData.restaurantPhone);
        if (formData.delivery) {
            finalData.append("maxDeliveryDistance", formData.maxDeliveryDistance);
            finalData.append("deliveryFee", formData.deliveryFee);
            finalData.append("minOrderAmount", formData.minOrderAmount);
        }
        formData.workingDays.forEach((day) => finalData.append("workingDays", day));

        if (uploadedFile) {
            finalData.append("image", uploadedFile);
        }



        const payload: AddRestaurantPayload = {
            restaurantEmail: formData.restaurantEmail,
            restaurantPhone: selectedAreaCode+formData.restaurantPhone,
            restaurantName: formData.restaurantName,
            restaurantDescription: formData.restaurantDescription,
            longitude: parseFloat(formData.longitude),
            latitude: parseFloat(formData.latitude),
            category: formData.category,
            workingHoursStart: formData.workingHoursStart,
            workingHoursEnd: formData.workingHoursEnd,
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
                : 0
        };

        await dispatch(addRestaurant(payload));

        alert("Form completed successfully! Check console for finalData contents.");
    };

    const togglePhoneModal = () => setPhoneModalOpen(!phoneModalOpen);
    const toggleCategoryModal = () => setCategoryModalOpen(!categoryModalOpen);
    const toggleDaysModal = () => setDaysModalOpen(!daysModalOpen);

    const mapCenter = userLocation || markerPosition || DEFAULT_CENTER;

    const isInvalid = (fieldName: string): boolean =>
        invalidFields.includes(fieldName);

    return (
        <div className={styles.fullHeightContainer}>
            <div
                className={`${styles.outerDiv} ${
                    searchingForAddress ? styles.outerDivShowMap : ""
                }`}
            >
                {currentStep === 1 && (
                    <>
                        <h2 className={styles.heading}>
                            Are you ready to run businesses with us?
                        </h2>
                        <form onSubmit={handleContinue} className={styles.form}>
                            <div className={styles.formColumns}>
                                <div className={styles.inputContainer}>
                                    <span className={styles.sectionTitle}>
                                        Add your details
                                    </span>
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
                                                            code === selectedAreaCode
                                                                ? styles.selectedButton
                                                                : ""
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

                                    {/* StandaloneSearchBox */}
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
                                            } ${
                                                isInvalid("longitude") ? styles.invalidInput : ""
                                            }`}
                                            onFocus={() => setSearchingForAddress(true)}
                                            onBlur={() => setSearchingForAddress(false)}
                                        />
                                    </StandaloneSearchBox>
                                </div>

                                <div className={styles.inputContainer}>
                                    <span className={styles.sectionTitle}>
                                        Restaurant Details
                                    </span>
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
                                                {restaurantCategories.map((category) => (
                                                    <button
                                                        key={category}
                                                        type="button"
                                                        className={`${styles.modalButton} ${
                                                            category === selectedCategory
                                                                ? styles.selectedButton
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedCategory(category);
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                category,
                                                            }));
                                                            toggleCategoryModal();
                                                        }}
                                                    >
                                                        {category}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>



                                {/* ------- COLUMN 3: EXTRA BUSINESS INFO ------- */}
                                <div className={styles.inputContainer}>
                                    <span className={styles.sectionTitle}>
                                        Extra Details
                                    </span>

                                    <div className={styles.modalContainer}>
                                        <button
                                            type="button"
                                            className={`${styles.defaultInput} ${styles.selectButton} ${
                                                isInvalid("workingDays") ? styles.invalidInput : ""
                                            }`}
                                            onClick={toggleDaysModal}
                                        >
                                            {formData.workingDays.length
                                                ? `${formData.workingDays.join(", ")}`
                                                : "Select Open Days"}
                                        </button>
                                        {daysModalOpen && (
                                            <div className={styles.modal}>
                                                <div
                                                    ref={daysModalRef}
                                                    className={styles.modal}
                                                    onClick={(e) => e.stopPropagation()} // prevent form submission when clicking inside
                                                >
                                                    {daysOfWeek.map((day) => (
                                                        <button
                                                            key={day}
                                                            type="button"
                                                            className={`${styles.modalButton} ${
                                                                formData.workingDays.includes(day)
                                                                    ? styles.selectedButton
                                                                    : ""
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
                                            </div>
                                        )}
                                    </div>


                                    <div className={styles.timeContainer}>
                                        <input
                                            type="time"
                                            name="workingHoursStart"
                                            className={`${styles.defaultInputTime} ${
                                                isInvalid("workingHoursStart") ? styles.invalidInput : ""
                                            }`}
                                            placeholder="Open Time"
                                            value={formData.workingHoursStart}
                                            onChange={handleChange}
                                        />
                                        <input
                                            type="time"
                                            name="workingHoursEnd"
                                            className={`${styles.defaultInputTime} ${
                                                isInvalid("workingHoursEnd") ? styles.invalidInput : ""
                                            }`}
                                            placeholder="Close Time"
                                            value={formData.workingHoursEnd}
                                            onChange={handleChange}
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
                                                    <span className={styles.fileName}>
                                                        {uploadedFile.name}
                                                    </span>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    {!searchingForAddress && (
                                        <Button
                                            type="submit"
                                            className={styles.continueButton}
                                        >
                                            <span>Continue</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </>
                )}

                {/* STEP 2: Show only if currentStep === 2 */}
                {currentStep === 2 && (
                    <div className={styles.stepTwoContainer}>
                        <h2 className={styles.heading}>Pickup/Delivery Info</h2>

                        {/* Section to select pickup or delivery */}
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

                        {/* If delivery is selected, ask for more fields */}
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

                        <Button
                            onClick={handleComplete}
                            className={styles.completeButton}
                        >
                            Complete
                        </Button>
                    </div>
                )}
            </div>

            {/* Map Section (always rendered separate from the form) */}
            <div
                className={
                    !searchingForAddress
                        ? styles.mapContainer
                        : styles.mapContainerShowMap
                }
            >
                <MapWrapper
                    mapContainerStyle={MAP_CONTAINER_STYLE}
                    center={mapCenter}
                    zoom={12}
                    markerPosition={markerPosition}
                    userLocation={userLocation}
                    onPlacesChanged={onPlacesChanged}
                    searchBoxRef={searchBoxRef}
                    searchingForAddress={searchingForAddress}
                    setSearchingForAddress={setSearchingForAddress} // Add this line
                    isEditing={isEditing}
                    restaurant={restaurant}
                />
            </div>
        </div>
    );
};

export default AddBusinessModel;