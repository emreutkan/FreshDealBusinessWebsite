import './HomePage.css';
import Navbar from "../components/feature/Navbar/Navbar.tsx";
import React, {useEffect} from "react";
import AboutUs from "../components/feature/AboutUs/AboutUs.tsx";
import PartnershipPage from "./partnershipPage.tsx";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../redux/store.ts";
import RestaurantsPage from "./RestaurantsPage.tsx";
import {getUserData} from "../redux/thunks/userThunks.ts";
import {fetchOwnedRestaurants} from "../redux/thunks/restaurantThunk.ts";

const HomePage: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);
    const token= useSelector((state: RootState) => state.user.token);

    //
    const ownedRestaurants = useSelector((state: RootState) => state.restaurant.ownedRestaurants);
    let initialPage = '';
    if (ownedRestaurants) {
        initialPage = 'Restaurants';
    } else {
        initialPage = 'AboutUs';
    }



    useEffect(() => {
        const storedToken = localStorage.getItem('userToken'); // Consistent key
        console.log('storedToken', storedToken);
        if (storedToken) {
            dispatch(getUserData({ token: storedToken }));
            dispatch(fetchOwnedRestaurants());
        }
    }, [dispatch, token]);



    useEffect(() => {
        if (user.role === 'owner') {
            if (ownedRestaurants && ownedRestaurants.length > 0) {
                setActivePage('Restaurants');
            } else {
                setActivePage('Partnership');
            }
        }
        else {
            console.log('user.role', user.role);
            setActivePage('AboutUs');
        }
    }, [ownedRestaurants, user.role]);

    const [activePage, setActivePage] = React.useState(initialPage);

    return (
        <>
            <Navbar
                activePage={activePage}
                setActivePage={setActivePage}
            />
            { activePage === 'AboutUs' && <AboutUs/> }
            {activePage === 'Partnership' && <PartnershipPage></PartnershipPage>}
            {activePage === 'Restaurants' && <RestaurantsPage/>}

        </>


)
    ;
}

export default HomePage;
