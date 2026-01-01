import { useAuth } from "./AuthContext";
import { useState, useEffect, useCallback } from "react";

export const useBooks = () => {
    const { getBooks, getBookById } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBooks = useCallback(
        async(params = {}) => {
            setLoading(true);
            setError(null);
            try {
                const data = await getBooks();
                setBooks(data);
                return data;
            } catch (err) {
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        }, [getBooks]
    );

    const fetchBookById = useCallback(
        async(id) => {
            setLoading(true);
            setError(null);
            try {
                const data = await getBookById(id);
                return data;
            } catch (err) {
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        }, [getBookById]
    );

    // Fetch books on mount (optional)
    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    return {
        books,
        loading,
        error,
        fetchBooks,
        fetchBookById,
        refetchBooks: fetchBooks,
    };
};