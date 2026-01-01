import { useAuth } from "../context/AuthContext";
import { useCallback } from "react";

export const useAdmin = () => {
    const {
        user,
        isAdmin,
        getAllUsers,
        adminUpdateUser,
        adminCreateBook,
        adminUpdateBook,
        adminDeleteBook,
        getAdminStats,
    } = useAuth();

    const checkAdminAccess = useCallback(() => {
        if (!user || !isAdmin()) {
            throw new Error("Access denied. Admin privileges required.");
        }
        return true;
    }, [user, isAdmin]);

    const fetchAllUsers = useCallback(async() => {
        checkAdminAccess();
        try {
            return await getAllUsers();
        } catch (error) {
            console.error("Failed to fetch users:", error);
            throw error;
        }
    }, [checkAdminAccess, getAllUsers]);

    const updateUser = useCallback(
        async(userId, userData) => {
            checkAdminAccess();
            try {
                return await adminUpdateUser(userId, userData);
            } catch (error) {
                console.error("Failed to update user:", error);
                throw error;
            }
        }, [checkAdminAccess, adminUpdateUser]
    );

    const createBook = useCallback(
        async(bookData) => {
            checkAdminAccess();
            try {
                return await adminCreateBook(bookData);
            } catch (error) {
                console.error("Failed to create book:", error);
                throw error;
            }
        }, [checkAdminAccess, adminCreateBook]
    );

    const updateBook = useCallback(
        async(bookId, bookData) => {
            checkAdminAccess();
            try {
                return await adminUpdateBook(bookId, bookData);
            } catch (error) {
                console.error("Failed to update book:", error);
                throw error;
            }
        }, [checkAdminAccess, adminUpdateBook]
    );

    const deleteBook = useCallback(
        async(bookId) => {
            checkAdminAccess();
            try {
                return await adminDeleteBook(bookId);
            } catch (error) {
                console.error("Failed to delete book:", error);
                throw error;
            }
        }, [checkAdminAccess, adminDeleteBook]
    );

    const fetchStats = useCallback(async() => {
        checkAdminAccess();
        try {
            return await getAdminStats();
        } catch (error) {
            console.error("Failed to fetch admin stats:", error);
            throw error;
        }
    }, [checkAdminAccess, getAdminStats]);

    return {
        isAdmin: isAdmin(),
        checkAdminAccess,
        fetchAllUsers,
        updateUser,
        createBook,
        updateBook,
        deleteBook,
        fetchStats,
    };
};