import React, { useEffect, useRef, useState } from "react";
import styles from "./addBusinessModel.module.css";
import { Button } from "@mui/material";
import {
    GoogleMap,
    LoadScript,
    Marker,
    StandaloneSearchBox,
} from "@react-google-maps/api";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store.ts";
import {
    addRestaurant,
    AddRestaurantPayload,
} from "../../redux/thunks/restaurantThunk.ts";

const DEFAULT_CENTER = {
    lat: 37.7749,
    lng: -122.4194,
};

const MAP_CONTAINER_STYLE = {
    width: "100%",
    height: "100%",
};

const AddBusinessModel = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [phoneModalOpen, setPhoneModalOpen] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [selectedAreaCode, setSelectedAreaCode] = useState("+90");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchingForAddress, setSearchingForAddress] = useState(false);
    const [daysModalOpen, setDaysModalOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
    const [markerPosition, setMarkerPosition] =
        useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);
    const [userLocation, setUserLocation] =
        useState<google.maps.LatLngLiteral | null>(null);


    const [invalidFields, setInvalidFields] = useState<string[]>([]);

    const dispatch = useDispatch<AppDispatch>();

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


    const [formData, setFormData] = useState({
        restaurantName: "",
        restaurantDescription: "",
        longitude: "",
        latitude: "",
        category: "",
        workingDays: [] as string[],
        workingHoursStart: "",
        workingHoursEnd: "",
        // Additional fields:
        ownerEmail: "",
        phoneNumber: "",
        // Pickup/Delivery fields:
        pickup: false,
        delivery: false,
        maxDeliveryDistance: "",
        deliveryFee: "",
        minOrderAmount: "",
    });

    /** ─────────────────────────────────────────
     *   GOOGLE MAPS - Attempting to get user location
     *  ───────────────────────────────────────── */
    const getIpLocation = async (): Promise<google.maps.LatLngLiteral | null> => {
        try {
            const response = await fetch("https://ipapi.co/json/");
            if (!response.ok) {
                console.log("Failed to fetch IP-based location");
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

    /** Reverse geocoding */
    const reverseGeocode = async (lat: number, lng: number) => {
        const geocoder = new google.maps.Geocoder();
        const location = { lat, lng };

        await geocoder.geocode({location}, (results, status) => {
            if (status === "OK" && results && results.length > 0) {
                const address = results[0].formatted_address;
                // If you want to store the address into form data:
                // (not strictly required if user already provided an address)
                console.log("Detected address from marker:", address);
            } else {
                console.error("Reverse geocoding failed:", status);
            }
        });
    };

    /** Single click on the map to set marker */
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

            // If you want to automatically fill an address from reverse geocode:
            reverseGeocode(latitude, longitude).then(r => console.log(r));
        }
    };

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
        // If it's a checkbox, handle differently.
        if (type === "checkbox") {
            setFormData((prev) => ({ ...prev, [name]: (e.target) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        setInvalidFields((prevInvalid) => prevInvalid.filter((f) => f !== name));
    };

    /** File input changes */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            setUploadedFile(e.target.files[0]);
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
            "ownerEmail",
            "phoneNumber",
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

        // Also file upload is required
        if (!uploadedFile) {
            invalids.push("image");
        }

        setInvalidFields(invalids);
        return invalids.length === 0;
    };

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep1()) {
            setCurrentStep(2);
        }
    };

    /** Validate Step 2 fields */
    const validateStep2 = () => {
        // pickup or delivery must be selected
        const invalids: string[] = [];
        if (!formData.pickup && !formData.delivery) {
            // We'll artificially create a field name here, e.g. "pickupOrDelivery"
            invalids.push("pickupOrDelivery");
        }
        // If delivery is selected, these three fields are required
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
        if (!validateStep2()) return;

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
        if (formData.delivery) {
            finalData.append("maxDeliveryDistance", formData.maxDeliveryDistance);
            finalData.append("deliveryFee", formData.deliveryFee);
            finalData.append("minOrderAmount", formData.minOrderAmount);
        }
        // The backend does not mention "workingDays" in your snippet,
        // but if you DO want to send it, you'd either append each day
        // individually or combine them into a single string. Example:
        formData.workingDays.forEach((day) => finalData.append("workingDays", day));

        // If there's an image
        if (uploadedFile) {
            finalData.append("image", uploadedFile);
        }

        // Debug
        for (const [key, value] of finalData.entries()) {
            console.log(`${key}: ${value}`);
        }

        // Dispatch to your thunk or do a fetch to your backend:
        // Using the typed AddRestaurantPayload => you might adapt it:
        const payload: AddRestaurantPayload = {
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
            maxDeliveryDistance: formData.delivery ? parseFloat(formData.maxDeliveryDistance) : 0,
            deliveryFee: formData.delivery ? parseFloat(formData.deliveryFee) : 0,
            minOrderAmount: formData.delivery ? parseFloat(formData.minOrderAmount) : 0,

        };

        const result = await dispatch(addRestaurant(payload));
        if (addRestaurant.fulfilled.match(result)) {
            console.log("Restaurant added successfully!");
        } else {
            console.error("Failed to add restaurant:", result.error);
        }

        alert("Form completed successfully! Check console for finalData contents.");
    };

    /**  Toggle methods for modals */
    const togglePhoneModal = () => setPhoneModalOpen(!phoneModalOpen);
    const toggleCategoryModal = () => setCategoryModalOpen(!categoryModalOpen);
    const toggleDaysModal = () => setDaysModalOpen(!daysModalOpen);

    /** Choose which center to display on the map */
    const mapCenter = userLocation || markerPosition || DEFAULT_CENTER;

    /** Helper: does field appear in invalidFields? */
    const isInvalid = (fieldName: string): boolean =>
        invalidFields.includes(fieldName);

    return (
        <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY!}

            libraries={["places" ]}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                }}
            >
                {/* outerDiv is reused for step 1 or step 2 */}
                <div
                    className={`${styles.outerDiv} ${
                        searchingForAddress ? styles.outerDivShowMap : ""
                    }`}
                >
                    {/* STEP 1 */}
                    {currentStep === 1 && (
                        <>
                            <h2 style={{ fontWeight: 320 }}>
                                Are you ready to run businesses with us?
                            </h2>
                            <form onSubmit={handleContinue} style={{ width: "100%" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "flex-start",
                                        gap: "50px",
                                    }}
                                >
                                    {/* ------- COLUMN 1: OWNER INFO ------- */}
                                    <div className={styles.inputContainer}>
                                        <span style={{ marginBottom: "10px" }}>Add your details</span>
                                        <input
                                            name="ownerEmail"
                                            className={styles.defaultInput}
                                            placeholder="Business Owner's E-mail"
                                            onChange={handleChange}
                                            value={formData.ownerEmail}
                                            style={{
                                                borderColor: isInvalid("ownerEmail") ? "darkred" : "",
                                            }}
                                        />
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                marginTop: "0px",
                                                gap: "15px",
                                            }}
                                        >
                                            <button
                                                type="button"
                                                style={{
                                                    width: "20%",
                                                    marginTop: "0px",
                                                    borderColor: isInvalid("phoneNumber") ? "darkred" : "",
                                                }}
                                                className={styles.defaultInput}
                                                onClick={togglePhoneModal}
                                            >
                                                <span>{selectedAreaCode}</span>
                                            </button>
                                            <input
                                                name="phoneNumber"
                                                style={{
                                                    width: "80%",
                                                    marginTop: "0px",
                                                    borderColor: isInvalid("phoneNumber") ? "darkred" : "",
                                                }}
                                                className={styles.defaultInput}
                                                placeholder="Phone Number"
                                                inputMode="numeric"
                                                onChange={handleChange}
                                                value={formData.phoneNumber}
                                            />
                                            {phoneModalOpen && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        width: "5vw",
                                                        top: "55%",
                                                        backgroundColor: "#f0f0f0",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "5px",
                                                        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                                                        borderRadius: "5px",
                                                        overflow: "hidden",
                                                        animation: "fadeIn 0.3s ease",
                                                        zIndex: 999,
                                                    }}
                                                >
                                                    {areaCodes.map((code) => (
                                                        <button
                                                            key={code}
                                                            style={{
                                                                backgroundColor:
                                                                    code === selectedAreaCode ? "#b0f484" : "#f0f0f0",
                                                                border: "none",
                                                                padding: "10px 20px",
                                                                textAlign: "left",
                                                                cursor: "pointer",
                                                                transition: "background-color 0.3s ease",
                                                                fontWeight: 300,
                                                                fontSize: "20px",
                                                            }}
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
                                                placeholder="Search for an address"
                                                className={`${styles.defaultInput} ${
                                                    searchingForAddress ? styles.defaultInputShowMap : ""
                                                }`}
                                                style={{
                                                    marginTop: "0px",
                                                    borderColor: isInvalid("longitude") ? "darkred" : "",
                                                }}
                                                onFocus={() => setSearchingForAddress(true)}
                                                onBlur={() => setSearchingForAddress(false)}
                                            />
                                        </StandaloneSearchBox>
                                    </div>

                                    {/* ------- COLUMN 2: RESTAURANT INFO ------- */}
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px",
                                        }}
                                    >
                    <span style={{ marginBottom: "10px" }}>
                      Restaurant Details
                    </span>
                                        <input
                                            name="restaurantName"
                                            className={styles.defaultInput}
                                            placeholder="Restaurant Name"
                                            onChange={handleChange}
                                            value={formData.restaurantName}
                                            style={{
                                                borderColor: isInvalid("restaurantName") ? "darkred" : "",
                                            }}
                                        />
                                        <input
                                            name="restaurantDescription"
                                            className={styles.defaultInput}
                                            placeholder="Restaurant Description"
                                            onChange={handleChange}
                                            value={formData.restaurantDescription}
                                            style={{
                                                borderColor: isInvalid("restaurantDescription")
                                                    ? "darkred"
                                                    : "",
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className={styles.defaultInput}
                                            style={{
                                                cursor: "pointer",
                                                textAlign: "center",
                                                borderColor: isInvalid("category") ? "darkred" : "",
                                            }}
                                            onClick={toggleCategoryModal}
                                        >
                                            {selectedCategory || "Select Category"}
                                        </button>
                                        {categoryModalOpen && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    width: "20vw",
                                                    top: "40%",
                                                    left: "35%",
                                                    backgroundColor: "#f0f0f0",
                                                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                                                    borderRadius: "10px",
                                                    padding: "10px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "10px",
                                                    zIndex: 999,
                                                }}
                                            >
                                                {restaurantCategories.map((category) => (
                                                    <button
                                                        key={category}
                                                        style={{
                                                            backgroundColor:
                                                                category === selectedCategory
                                                                    ? "#b0f484"
                                                                    : "#f0f0f0",
                                                            border: "none",
                                                            padding: "10px 20px",
                                                            textAlign: "left",
                                                            cursor: "pointer",
                                                            transition: "background-color 0.3s ease",
                                                            fontWeight: 300,
                                                            fontSize: "20px",
                                                        }}
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

                                    {/* ------- COLUMN 3: EXTRA BUSINESS INFO ------- */}
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px",
                                        }}
                                    >
                                        <span style={{ marginBottom: "10px" }}>Extra Details</span>

                                        {/* NEW FIELD: OPEN DAYS (Multi-select) */}
                                        <button
                                            type="button"
                                            className={styles.defaultInput}
                                            style={{
                                                cursor: "pointer",
                                                textAlign: "center",
                                                borderColor: isInvalid("workingDays") ? "darkred" : "",
                                            }}
                                            onClick={toggleDaysModal}
                                        >
                                            {formData.workingDays.length
                                                ? `${formData.workingDays.join(", ")}`
                                                : "Select Open Days"}
                                        </button>
                                        {daysModalOpen && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    width: "20vw",
                                                    top: "60%",
                                                    left: "35%",
                                                    backgroundColor: "#f0f0f0",
                                                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                                                    borderRadius: "10px",
                                                    padding: "10px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "10px",
                                                    zIndex: 999,
                                                }}
                                            >
                                                {daysOfWeek.map((day) => (
                                                    <button
                                                        key={day}
                                                        style={{
                                                            backgroundColor: formData.workingDays.includes(day)
                                                                ? "#b0f484"
                                                                : "#f0f0f0",
                                                            border: "none",
                                                            padding: "10px 20px",
                                                            textAlign: "left",
                                                            cursor: "pointer",
                                                            transition: "background-color 0.3s ease",
                                                            fontWeight: 300,
                                                            fontSize: "20px",
                                                        }}
                                                        onClick={() => handleDaySelection(day)}
                                                    >
                                                        {day}
                                                    </button>
                                                ))}
                                                <button
                                                    style={{
                                                        marginTop: "10px",
                                                        padding: "10px 20px",
                                                        border: "none",
                                                        backgroundColor: "#d0d0d0",
                                                        cursor: "pointer",
                                                        fontWeight: 300,
                                                        fontSize: "18px",
                                                        alignSelf: "flex-end",
                                                    }}
                                                    onClick={toggleDaysModal}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        )}

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyItems: "center",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: "10px",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <input
                                                type="time"
                                                name="workingHoursStart"
                                                className={styles.defaultInput}
                                                style={{
                                                    width: "48%",
                                                    margin: "0px",
                                                    borderColor: isInvalid("workingHoursStart")
                                                        ? "darkred"
                                                        : "",
                                                }}
                                                placeholder="Open Time"
                                                value={formData.workingHoursStart}
                                                onChange={handleChange}
                                            />
                                            <input
                                                type="time"
                                                name="workingHoursEnd"
                                                className={styles.defaultInput}
                                                style={{
                                                    width: "48%",
                                                    margin: "0px",
                                                    borderColor: isInvalid("workingHoursEnd")
                                                        ? "darkred"
                                                        : "",
                                                }}
                                                placeholder="Close Time"
                                                value={formData.workingHoursEnd}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* If you want an image upload */}
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
                                                className={styles.fileLabel}
                                                style={{
                                                    borderColor: isInvalid("image") ? "darkred" : "",
                                                }}
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
                                                style={{
                                                    backgroundColor: "#b0f484",
                                                    color: "white",
                                                    fontWeight: 300,
                                                    width: "60%",
                                                    fontSize: "20px",
                                                    padding: "10px 20px",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    alignSelf: "flex-end",
                                                    borderRadius: "10px",
                                                    textDecoration: "none",
                                                    fontStyle: "normal",
                                                    textTransform: "none",
                                                    marginTop: "0.5vw",
                                                }}
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
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <h2 style={{ fontWeight: 320 }}>Pickup/Delivery Info</h2>

                            {/* Section to select pickup or delivery */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: "30px",
                                    alignItems: "center",
                                }}
                            >
                                <label>
                                    <input
                                        type="checkbox"
                                        name="pickup"
                                        checked={formData.pickup}
                                        onChange={handleChange}
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                            borderColor: isInvalid("pickupOrDelivery")
                                                ? "darkred"
                                                : "",
                                        }}
                                    />{" "}
                                    Pickup
                                </label>

                                <label>
                                    <input
                                        type="checkbox"
                                        name="delivery"
                                        checked={formData.delivery}
                                        onChange={handleChange}
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                            borderColor: isInvalid("pickupOrDelivery")
                                                ? "darkred"
                                                : "",
                                        }}
                                    />{" "}
                                    Delivery
                                </label>
                            </div>

                            {/* If delivery is selected, ask for more fields */}
                            {formData.delivery && (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        gap: "30px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <label>Max Delivery Distance</label>
                                        <input
                                            type="text"
                                            name="maxDeliveryDistance"
                                            placeholder="Max distance in km"
                                            onChange={handleChange}
                                            value={formData.maxDeliveryDistance}
                                            style={{
                                                borderColor: isInvalid("maxDeliveryDistance")
                                                    ? "darkred"
                                                    : "",
                                            }}
                                            className={styles.defaultInput}
                                        />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <label>Delivery Fee</label>
                                        <input
                                            type="text"
                                            name="deliveryFee"
                                            placeholder="Fee for delivery"
                                            onChange={handleChange}
                                            value={formData.deliveryFee}
                                            style={{
                                                borderColor: isInvalid("deliveryFee") ? "darkred" : "",
                                            }}
                                            className={styles.defaultInput}
                                        />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <label>Minimum Order Amount</label>
                                        <input
                                            type="text"
                                            name="minOrderAmount"
                                            placeholder="Min order cost"
                                            onChange={handleChange}
                                            value={formData.minOrderAmount}
                                            style={{
                                                borderColor: isInvalid("minOrderAmount")
                                                    ? "darkred"
                                                    : "",
                                            }}
                                            className={styles.defaultInput}
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleComplete}
                                style={{
                                    backgroundColor: "#b0f484",
                                    color: "white",
                                    fontWeight: 300,
                                    width: "20%",
                                    fontSize: "20px",
                                    padding: "10px 20px",
                                    border: "none",
                                    cursor: "pointer",
                                    borderRadius: "10px",
                                    textDecoration: "none",
                                    fontStyle: "normal",
                                    textTransform: "none",
                                }}
                            >
                                Complete
                            </Button>
                        </div>
                    )}
                </div>

                {/* Map Section (we always render the map, separate from the form) */}
                <div
                    className={
                        !searchingForAddress ? styles.mapContainer : styles.mapContainerShowMap
                    }
                >
                    <GoogleMap
                        mapContainerStyle={MAP_CONTAINER_STYLE}
                        center={mapCenter}
                        zoom={12}
                        onClick={onMapClick}
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
                </div>
            </div>
        </LoadScript>
    );
};

export default AddBusinessModel;
