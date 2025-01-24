import AddBusinessModel from "../components/addBusinessModel/addBusinessModel.tsx";
import Header from "../../Header/Header.tsx";
import {useState} from "react";

const PartnershipPage = () => {

    const [activePage, setActivePage] = useState('Partnership');

    return (


        <>
            <Header
                activePage={activePage}
                setActivePage={setActivePage}
            />
            <div style={{
                backgroundColor: "#b2f7a5",
                height: "48vh",
                display: "flex",
                justifyContent: "center",
            }}>

                <AddBusinessModel/>

            </div>

        </>

    );
};

export default PartnershipPage;
