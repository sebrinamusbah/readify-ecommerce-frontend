// Test if AuthContext can be imported
try {
  const { AuthProvider, useAuth } = require('./src/context/AuthContext.jsx');
  console.log('✅ AuthContext imports successfully');
  
  // Check what useAuth returns
  console.log('useAuth function:', typeof useAuth);
  console.log('AuthProvider component:', typeof AuthProvider);
  
} catch (error) {
  console.log('❌ Error importing AuthContext:', error.message);
}
