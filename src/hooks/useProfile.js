import { useAuth } from "../context/AuthContext";
import { useState, useCallback } from "react";

export const useProfile = () => {
    const { user, getProfile, updateProfile, changePassword, updateUser } =
    useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProfile = useCallback(async() => {
        if (!user) {
            setProfile(null);
            return null;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await getProfile();
            setProfile(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user, getProfile]);

    const updateUserProfile = useCallback(
        async(userData) => {
            setLoading(true);
            setError(null);
            try {
                const data = await updateProfile(userData);
                setProfile(data);
                return data;
            } catch (err) {
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        }, [updateProfile]
    );

    const updatePassword = useCallback(
        async(currentPassword, newPassword) => {
            setLoading(true);
            setError(null);
            try {
                const data = await changePassword(currentPassword, newPassword);
                return data;
            } catch (err) {
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        }, [changePassword]
    );

    const updateLocalProfile = useCallback(
        (updatedData) => {
            if (profile) {
                const updatedProfile = {...profile, ...updatedData };
                setProfile(updatedProfile);
                updateUser(updatedData); // Also update in AuthContext
            }
        }, [profile, updateUser]
    );

    return {
        profile: profile || user,
        loading,
        error,
        fetchProfile,
        updateUserProfile,
        updatePassword,
        updateLocalProfile,
        refreshProfile: fetchProfile,
    };
};