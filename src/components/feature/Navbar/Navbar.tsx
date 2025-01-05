import React, { useState } from "react";
import styles from "./navbar.module.css";
import AccountMenu from "./AccountMenu/AccountMenu";
// import { useUser } from "../../../context/UserContext";

const Navbar: React.FC = () => {
    // const { role } = useUser();
    const [restaurantsOpen, setRestaurantsOpen] = useState(true);

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarLogo}>
                <span className={styles.navbarBrand}>Freshdeal</span>
            </div>

            <div className={styles.navbarLinks}>
                <span
                    className={styles.navbarLink}
                    onClick={() => setRestaurantsOpen(!restaurantsOpen)}
                >
                    Restaurants
                </span>
                <span className={styles.navbarLink}>Listings</span>

            </div>

            <div className={styles.navbarRight}>
                <AccountMenu />
            </div>
        </nav>
    );
};

export default Navbar;
