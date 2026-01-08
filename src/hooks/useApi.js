import { useState, useCallback } from "react";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const callApi = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(...args);
      setData(result);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message || "Something went wrong");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    data,
    callApi,
    reset,
  };
};
