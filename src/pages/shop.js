import Layout from '../components/Layout';

export default function Shop() {
  return (
    <Layout>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold mb-6'>Islamic Shop</h1>
        
        {/* Coming Soon Banner */}
        <div className='bg-green-50 border border-green-200 rounded-lg p-8 mb-12 text-center'>
          <h2 className='text-2xl font-semibold mb-4'>Shop Coming Soon</h2>
          <p className='text-gray-600'>
            We're working on bringing you a carefully curated selection of Islamic products.
            Subscribe to our newsletter to be notified when we launch!
          </p>
          <div className='mt-6'>
            <input
              type='email'
              placeholder='Enter your email'
              className='px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500'
            />
            <button className='px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700'>
              Notify Me
            </button>
          </div>
        </div>

        {/* Future Categories Preview */}
        <h2 className='text-2xl font-semibold mb-6'>Coming Product Categories</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-xl font-semibold mb-4'>Islamic Rings</h3>
            <div className='bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4'>
              <p className='text-gray-500'>Product Image Placeholder</p>
            </div>
            <p className='text-gray-600'>
              Beautiful rings featuring Islamic motifs and calligraphy.
            </p>
          </div>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-xl font-semibold mb-4'>Books</h3>
            <div className='bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4'>
              <p className='text-gray-500'>Product Image Placeholder</p>
            </div>
            <p className='text-gray-600'>
              Curated collection of Islamic books and literature.
            </p>
          </div>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-xl font-semibold mb-4'>Prayer Essentials</h3>
            <div className='bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4'>
              <p className='text-gray-500'>Product Image Placeholder</p>
            </div>
            <p className='text-gray-600'>
              High-quality prayer mats, beads, and other essentials.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
