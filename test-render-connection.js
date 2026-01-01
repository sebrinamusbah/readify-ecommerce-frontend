const RENDER_URL = 'https://readify-ecommerce-backend-1.onrender.com';

async function testConnection() {
  console.log('Testing connection to Render backend...');
  console.log('URL:', RENDER_URL);
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthRes = await fetch(`${RENDER_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log('‚úÖ Health:', healthData);
    
    // Test 2: Books endpoint
    console.log('\n2. Testing books endpoint...');
    const booksRes = await fetch(`${RENDER_URL}/api/books`);
    const booksData = await booksRes.json();
    console.log('‚úÖ Books:', booksData.books?.length || 0, 'books found');
    
    // Test 3: Categories endpoint
    console.log('\n3. Testing categories endpoint...');
    const catsRes = await fetch(`${RENDER_URL}/api/categories`);
    const catsData = await catsRes.json();
    console.log('‚úÖ Categories:', catsData.categories?.length || 0, 'categories found');
    
    console.log('\nÌæâ All tests passed! Backend is working on Render!');
    
  } catch (error) {
    console.log('\n‚ùå Error connecting to Render:', error.message);
    console.log('Possible issues:');
    console.log('1. Backend not running on Render');
    console.log('2. CORS not configured');
    console.log('3. Network issue');
  }
}

testConnection();
