import React, { useEffect, useRef, useState } from "react";
import styles from "./addBusinessModel.module.css";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../../redux/store";
import {
    addRestaurant,
    AddRestaurantPayload, updateRestaurant,
} from "../../../../redux/thunks/restaurantThunk";

declare global {
    interface Window {
        google: typeof google;
    }
}

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
    const [daysModalOpen, setDaysModalOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const autocompleteRef = useRef<HTMLInputElement>(null);
    const [addressInput, setAddressInput] = useState("");
    const [placeAutocompleteLoaded, setPlaceAutocompleteLoaded] = useState(false);
    const [invalidFields, setInvalidFields] = useState<string[]>([]);
    const daysModalRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (
            window.google?.maps?.places &&
            autocompleteRef.current &&
            !placeAutocompleteLoaded
        ) {
            const ac = new window.google.maps.places.Autocomplete(
                autocompleteRef.current,
                {
                    types: ["address"],
                    componentRestrictions: { country: ["us", "tr", "gb"] },
                }
            );
            ac.setFields(["geometry", "formatted_address"]);
            ac.addListener("place_changed", () => {
                const place = ac.getPlace();
                if (place.geometry?.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    setFormData((f) => ({
                        ...f,
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                    }));
                    setAddressInput(place.formatted_address || "");
                    setInvalidFields((f) =>
                        f.filter((x) => x !== "latitude" && x !== "longitude")
                    );
                }
            });
            setPlaceAutocompleteLoaded(true);
        }
    }, [placeAutocompleteLoaded]);

    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const weekends = ["Saturday", "Sunday"];

    const formatWorkingDays = (days: string[]): string => {
        const selectedWeekdays = weekdays.filter(day => days.includes(day));
        const selectedWeekends = weekends.filter(day => days.includes(day));

        if (days.length === 7) return "All week";

        if (selectedWeekdays.length === 5 && selectedWeekends.length === 0) {
            return "Weekdays";
        }

        if (selectedWeekdays.length === 0 && selectedWeekends.length === 2) {
            return "Weekends";
        }

        if (selectedWeekdays.length === 5) {
            return `Weekdays + ${selectedWeekends.join(", ")}`;
        }

        return days.join(", ");
    };

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (
                daysModalOpen &&
                daysModalRef.current &&
                !daysModalRef.current.contains(e.target as Node)
            ) {
                setDaysModalOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [daysModalOpen]);

    const validateTimeFormat = (time: string): boolean => {
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setFormData((f) => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData((f) => ({ ...f, [name]: value }));
        }
        setInvalidFields((f) => f.filter((x) => x !== name));
        setError(null);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let d = value.replace(/\D/g, "").slice(0, 4);
        let formatted = d.length <= 2 ? d : d.slice(0, 2) + ":" + d.slice(2);

        if (d.length === 4) {
            const hours = parseInt(d.slice(0, 2));
            const minutes = parseInt(d.slice(2, 4));

            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                setError(null);
            } else {
                setError("Invalid time format. Hours must be 00-23 and minutes must be 00-59");
                return;
            }
        }

        setFormData((f) => ({ ...f, [name]: formatted }));
        setInvalidFields((f) => f.filter((x) => x !== name));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const ok = ["image/png", "image/jpeg"].includes(file.type);
            if (!ok) {
                setError("Only PNG and JPEG files are allowed");
                return;
            }
            setUploadedFile(file);
            setInvalidFields((f) => f.filter((x) => x !== "image"));
            setError(null);
        }
    };

    const handleDaySelection = (day: string) => {
        setFormData((f) => {
            const has = f.workingDays.includes(day);
            return {
                ...f,
                workingDays: has
                    ? f.workingDays.filter((d) => d !== day)
                    : [...f.workingDays, day],
            };
        });
        setError(null);
    };

    const validateStep1 = () => {
        const req = [
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
        const invalid: string[] = [];
        req.forEach((k) => {
            if (!(formData as any)[k]) invalid.push(k);
        });

        if (!formData.workingDays.length) invalid.push("workingDays");
        if (!uploadedFile) invalid.push("image");

        if (formData.workingHoursStart && !validateTimeFormat(formData.workingHoursStart)) {
            invalid.push("workingHoursStart");
            setError("Invalid opening time format. Use HH:MM (24-hour format)");
            return false;
        }

        if (formData.workingHoursEnd && !validateTimeFormat(formData.workingHoursEnd)) {
            invalid.push("workingHoursEnd");
            setError("Invalid closing time format. Use HH:MM (24-hour format)");
            return false;
        }

        setInvalidFields(invalid);
        return !invalid.length;
    };

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep1()) {
            setCurrentStep(2);
            setError(null);
        } else if (!error) {
            setError("Please fill in all required fields");
        }
    };

    const validateStep2 = () => {
        const invalid: string[] = [];
        if (!formData.pickup && !formData.delivery) invalid.push("pickupOrDelivery");
        if (formData.delivery) {
            if (!formData.maxDeliveryDistance) invalid.push("maxDeliveryDistance");
            if (!formData.deliveryFee) invalid.push("deliveryFee");
            if (!formData.minOrderAmount) invalid.push("minOrderAmount");
        }
        setInvalidFields(invalid);
        return !invalid.length;
    };
    const handleComplete = async () => {
        if (!validateStep2()) {
            setError("Please fill in all required fields");
            return;
        }

        try {
            const payload: AddRestaurantPayload = {
                restaurantEmail: formData.restaurantEmail,
                restaurantPhone: selectedAreaCode + formData.restaurantPhone,
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
                    : 0,
            };

            let response;
            if (isEditing && restaurant?.id) {
                response = await dispatch(updateRestaurant({
                    ...payload,
                    restaurantId: restaurant.id
                })).unwrap();
            } else {
                response = await dispatch(addRestaurant(payload)).unwrap();
            }

            if ('error' in response) {
                throw new Error(response.error);
            }
            if ('message' in response && !response.success) {
                throw new Error(response.message);
            }
            navigate("/");
        } catch (err: any) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError(`An unexpected error occurred while ${isEditing ? 'updating' : 'adding'} the restaurant`);
            }
        }
    };
    return (
        <div className={styles.fullHeightContainer}>
            <div className={styles.outerDiv}>
                {error && <div className={styles.errorMessage}>{error}</div>}
                {currentStep === 1 && (
                    <>
                        <h2 className={styles.heading}>
                            Are you ready to run businesses with us?
                        </h2>
                        <form onSubmit={handleContinue} className={styles.form}>
                            <div className={styles.formColumns}>
                                <div className={styles.inputContainer}>
                                    <span className={styles.sectionTitle}>Add your details</span>
                                    <input
                                        name="restaurantEmail"
                                        className={`${styles.defaultInput} ${
                                            invalidFields.includes("restaurantEmail")
                                                ? styles.invalidInput
                                                : ""
                                        }`}
                                        placeholder="Business E-mail"
                                        onChange={handleChange}
                                        value={formData.restaurantEmail}
                                    />
                                    <div className={styles.phoneContainer}>
                                        <button
                                            type="button"
                                            className={`${styles.defaultInput} ${styles.areaCodeButton} ${
                                                invalidFields.includes("restaurantPhone")
                                                    ? styles.invalidInput
                                                    : ""
                                            }`}
                                            onClick={() => setPhoneModalOpen((o) => !o)}
                                        >
                                            {selectedAreaCode}
                                        </button>
                                        <input
                                            name="restaurantPhone"
                                            className={`${styles.defaultInput} ${styles.phoneNumberInput} ${
                                                invalidFields.includes("restaurantPhone")
                                                    ? styles.invalidInput
                                                    : ""
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
                                                            setPhoneModalOpen(false);
                                                        }}
                                                    >
                                                        {code}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={autocompleteRef}
                                        name="addressInput"
                                        value={addressInput}
                                        onChange={(e) => setAddressInput(e.target.value)}
                                        placeholder="Search address"
                                        className={`${styles.defaultInput} ${
                                            invalidFields.includes("longitude") ||
                                            invalidFields.includes("latitude")
                                                ? styles.invalidInput
                                                : ""
                                        }`}
                                        style={{ minHeight: 40, padding: "0 8px" }}
                                    />
                                    {formData.latitude && formData.longitude && (
                                        <div className={styles.coordinatesDisplay}>
                                            <small>
                                                Selected location: Lat:{" "}
                                                {formData.latitude.substring(0, 8)}, Lng:{" "}
                                                {formData.longitude.substring(0, 8)}
                                            </small>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.inputContainer}>
                                    <span className={styles.sectionTitle}>
                                        Restaurant Details
                                    </span>
                                    <input
                                        name="restaurantName"
                                        className={`${styles.defaultInput} ${
                                            invalidFields.includes("restaurantName")
                                                ? styles.invalidInput
                                                : ""
                                        }`}
                                        placeholder="Restaurant Name"
                                        onChange={handleChange}
                                        value={formData.restaurantName}
                                    />
                                    <input
                                        name="restaurantDescription"
                                        className={`${styles.defaultInput} ${
                                            invalidFields.includes("restaurantDescription")
                                                ? styles.invalidInput
                                                : ""
                                        }`}
                                        placeholder="Restaurant Description"
                                        onChange={handleChange}
                                        value={formData.restaurantDescription}
                                    />
                                    <div className={styles.modalContainer}>
                                        <button
                                            type="button"
                                            className={`${styles.defaultInput} ${styles.selectButton} ${
                                                invalidFields.includes("category")
                                                    ? styles.invalidInput
                                                    : ""
                                            }`}
                                            onClick={() => setCategoryModalOpen((o) => !o)}
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
                                                            cat === selectedCategory
                                                                ? styles.selectedButton
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedCategory(cat);
                                                            setFormData((f) => ({ ...f, category: cat }));
                                                            setCategoryModalOpen(false);
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
                                                invalidFields.includes("workingDays")
                                                    ? styles.invalidInput
                                                    : ""
                                            }`}
                                            onClick={() => setDaysModalOpen((o) => !o)}
                                        >
                                            {formData.workingDays.length
                                                ? formatWorkingDays(formData.workingDays)
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
                                                        setDaysModalOpen(false);
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
                                                invalidFields.includes("workingHoursStart")
                                                    ? styles.invalidInput
                                                    : ""
                                            }`}
                                            placeholder="Open 08:00"
                                            value={formData.workingHoursStart}
                                            onChange={handleTimeChange}
                                        />
                                        <input
                                            type="text"
                                            maxLength={5}
                                            name="workingHoursEnd"
                                            className={`${styles.defaultInputTime} ${
                                                invalidFields.includes("workingHoursEnd")
                                                    ? styles.invalidInput
                                                    : ""
                                            }`}
                                            placeholder="Close 22:00"
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
                                                invalidFields.includes("image")
                                                    ? styles.invalidInput
                                                    : ""
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
                                    <Button type="submit" className={styles.continueButton}>
                                        <span>Continue</span>
                                    </Button>
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
                                        invalidFields.includes("pickupOrDelivery")
                                            ? styles.invalidCheckbox
                                            : ""
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
                                        invalidFields.includes("pickupOrDelivery")
                                            ? styles.invalidCheckbox
                                            : ""
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
                                            invalidFields.includes("maxDeliveryDistance")
                                                ? styles.invalidInput
                                                : ""
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
                                            invalidFields.includes("deliveryFee")
                                                ? styles.invalidInput
                                                : ""
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
                                            invalidFields.includes("minOrderAmount")
                                                ? styles.invalidInput
                                                : ""
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
        </div>
    );
};

export default AddBusinessModel;