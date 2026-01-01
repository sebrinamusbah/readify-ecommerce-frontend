import { useAuth } from "./AuthContext";
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

    const fetchUsers = useCallback(async() => {
        checkAdminAccess();
        return await getAllUsers();
    }, [checkAdminAccess, getAllUsers]);

    const updateUser = useCallback(
        async(userId, userData) => {
            checkAdminAccess();
            return await adminUpdateUser(userId, userData);
        }, [checkAdminAccess, adminUpdateUser]
    );

    const createBook = useCallback(
        async(bookData) => {
            checkAdminAccess();
            return await adminCreateBook(bookData);
        }, [checkAdminAccess, adminCreateBook]
    );

    const updateBook = useCallback(
        async(bookId, bookData) => {
            checkAdminAccess();
            return await adminUpdateBook(bookId, bookData);
        }, [checkAdminAccess, adminUpdateBook]
    );

    const deleteBook = useCallback(
        async(bookId) => {
            checkAdminAccess();
            return await adminDeleteBook(bookId);
        }, [checkAdminAccess, adminDeleteBook]
    );

    const fetchStats = useCallback(async() => {
        checkAdminAccess();
        return await getAdminStats();
    }, [checkAdminAccess, getAdminStats]);

    return {
        isAdmin: isAdmin(),
        checkAdminAccess,
        fetchUsers,
        updateUser,
        createBook,
        updateBook,
        deleteBook,
        fetchStats,
    };
};