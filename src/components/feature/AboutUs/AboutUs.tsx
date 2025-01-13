import React from "react";
import Frame from "../../../../public/Frame.svg";
import OurVisionLogo from "../../../../public/vision.svg";
import OurValuesLogo from "../../../../public/values.svg";
import OurMissionLogo from "../../../../public/mission.svg";

const AboutUs: React.FC = () => {
    return (
        <>
            <img src={Frame} alt="Frame"
                 style={{
                     width: "100%",
                 }}
            />
            <div style={{
                paddingTop: "2vh",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "2vw",

            }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "2vh",
                        padding: "2vh",
                    }}
                >

                    <h1 style={{
                        fontSize: "2.5em",
                        color: "black",
                        alignItems: "center",
                        justifyContent: "center",

                    }}>Our Mission</h1>

                    <text style={
                        {
                            fontSize: "1.5em",
                            color: "black",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            wordWrap: "break-word",
                            width: "25vw",
                        }
                    }>
                        At Fresh Deal, we prevent premium food waste and offer everyone unbeatable prices on
                        high-quality meals and groceries.
                    </text>
                    <img src={OurMissionLogo} alt="Our Mission Logo"
                         style={{
                             // width: "25vw",
                         }}/>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "2vh",
                        padding: "2vh",
                    }}
                >

                    <h1 style={{
                        fontSize: "2.5em",
                        color: "black",
                        alignItems: "center",
                        justifyContent: "center",

                    }}>Our Vision</h1>

                    <text style={
                        {
                            fontSize: "1.5em",
                            color: "black",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            wordWrap: "break-word",
                            width: "25vw",
                        }
                    }>
                        By combining sustainability with affordability, we ensure no premium product goes unused, letting everyone enjoy the best at a better price.
                    </text>
                    <img src={OurVisionLogo} alt="Our Vision Logo"
                         style={{
                             // width: "25vw",
                         }}/>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "2vh",
                        padding: "2vh",
                    }}
                >

                    <h1 style={{
                        fontSize: "2.5em",
                        color: "black",
                        alignItems: "center",
                        justifyContent: "center",

                    }}>Our Values</h1>

                    <text style={
                        {
                            fontSize: "1.5em",
                            color: "black",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            wordWrap: "break-word",
                            width: "25vw",
                        }
                    }>
                        We preserve premium quality, make it affordable, and reduce waste, creating value for users, businesses, and the planet.
                    </text>
                    <img src={OurValuesLogo} alt="Our Values Logo"
                         style={{
                             // width: "25vw",
                         }}/>
                </div>


            </div>
        </>

    );
};

export default AboutUs;