import Layout from '../components/Layout';

export default function Content() {
  return (
    <Layout>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold mb-6'>Islamic Content</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Video Section */}
          <div className='col-span-full lg:col-span-2'>
            <h2 className='text-2xl font-semibold mb-4'>Featured Videos</h2>
            <div className='bg-gray-100 p-4 rounded-lg'>
              <div className='aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg'>
                {/* YouTube embed placeholder */}
                <p className='flex items-center justify-center h-full text-gray-500'>
                  YouTube Video Player Placeholder
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='col-span-full lg:col-span-1'>
            <h2 className='text-2xl font-semibold mb-4'>Latest Uploads</h2>
            <div className='space-y-4'>
              {[1, 2, 3].map((item) => (
                <div key={item} className='bg-white rounded-lg shadow p-4'>
                  <h3 className='font-medium'>Video Title {item}</h3>
                  <p className='text-sm text-gray-600'>Description preview...</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Written Content Section */}
        <div className='mt-12'>
          <h2 className='text-2xl font-semibold mb-4'>Written Khutbahs</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[1, 2, 3].map((item) => (
              <div key={item} className='bg-white rounded-lg shadow p-6'>
                <h3 className='font-medium mb-2'>Khutbah Title {item}</h3>
                <p className='text-gray-600 mb-4'>Preview of the khutbah content...</p>
                <button className='text-green-600 hover:text-green-700'>
                  Read More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
