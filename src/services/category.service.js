import api from "./api";

const categoryService = {
    getAllCategories: async() => {
        try {
            const response = await api.get("/categories");
            return response.data;
        } catch (error) {
            throw error.response ?.data || { error: "Failed to fetch categories" };
        }
    },

    getCategoryBySlug: async(slug) => {
        try {
            const response = await api.get(`/categories/slug/${slug}`);
            return response.data;
        } catch (error) {
            throw error.response ?.data || { error: "Failed to fetch category" };
        }
    },

    getCategoriesSummary: async() => {
        try {
            const response = await api.get("/categories/summary");
            return response.data;
        } catch (error) {
            throw (
                error.response ?.data || { error: "Failed to fetch categories summary" }
            );
        }
    },
};

export default categoryService;