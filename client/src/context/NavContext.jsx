import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const NavContext = createContext(null);

export const NavProvider = ({ children }) => {
    const [businessTypes, setBusinessTypes] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNavData = async () => {
            try {
                const [businessRes, filtersRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/business-types?status=active`),
                    axios.get(`${import.meta.env.VITE_API_URL}/properties/filters`)
                ]);

                setBusinessTypes(businessRes.data);

                if (filtersRes.data && filtersRes.data.types) {
                    // Filter out unwanted types if necessary
                    setPropertyTypes(filtersRes.data.types.filter(type => type !== "realestate_with_kamar"));
                }
            } catch (error) {
                console.error("Error fetching navigation data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNavData();
    }, []);

    return (
        <NavContext.Provider value={{ businessTypes, propertyTypes, isLoading }}>
            {children}
        </NavContext.Provider>
    );
};

export const useNav = () => {
    const context = useContext(NavContext);
    if (!context) {
        throw new Error("useNav must be used within a NavProvider");
    }
    return context;
};
