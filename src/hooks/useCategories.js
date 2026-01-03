import { useState, useCallback } from "react";
import { categoryService } from "../services";

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async() => {
        try {
            setLoading(true);
            setError(null);
            const result = await categoryService.getAllCategories();
            if (result.success) {
                setCategories(result.data);
            }
        } catch (err) {
            setError(err.error || "Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    }, []);

    const getCategoryBySlug = useCallback(async(slug) => {
        try {
            setLoading(true);
            setError(null);
            const result = await categoryService.getCategoryBySlug(slug);
            return result;
        } catch (err) {
            setError(err.error || "Failed to fetch category");
            return { success: false, error: err.error };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        categories,
        loading,
        error,
        fetchCategories,
        getCategoryBySlug,
    };
};