import Layout from '../components/Layout';

export default function Events() {
  return (
    <Layout>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold mb-6'>Events Calendar</h1>
        
        {/* Upcoming Events */}
        <div className='mb-12'>
          <h2 className='text-2xl font-semibold mb-4'>Upcoming Events</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[1, 2, 3].map((item) => (
              <div key={item} className='bg-white rounded-lg shadow-md p-6'>
                <div className='text-green-600 font-semibold mb-2'>April {item + 14}, 2025</div>
                <h3 className='text-xl font-semibold mb-2'>Event Title {item}</h3>
                <p className='text-gray-600 mb-4'>Brief description of the event...</p>
                <div className='flex items-center text-sm text-gray-500'>
                  <span>7:00 PM EST</span>
                  <span className='mx-2'>•</span>
                  <span>Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar View Placeholder */}
        <div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Calendar</h2>
          <div className='bg-gray-100 rounded-lg p-4 h-96 flex items-center justify-center'>
            <p className='text-gray-500'>Calendar Integration Coming Soon</p>
          </div>
        </div>

        {/* Event Categories */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='bg-white rounded-lg shadow-md p-4'>
            <h3 className='font-semibold mb-2'>Lectures</h3>
            <p className='text-sm text-gray-600'>Weekly scholarly lectures</p>
          </div>
          <div className='bg-white rounded-lg shadow-md p-4'>
            <h3 className='font-semibold mb-2'>Workshops</h3>
            <p className='text-sm text-gray-600'>Interactive learning sessions</p>
          </div>
          <div className='bg-white rounded-lg shadow-md p-4'>
            <h3 className='font-semibold mb-2'>Q&A Sessions</h3>
            <p className='text-sm text-gray-600'>Open discussions with scholars</p>
          </div>
          <div className='bg-white rounded-lg shadow-md p-4'>
            <h3 className='font-semibold mb-2'>Community Meetups</h3>
            <p className='text-sm text-gray-600'>Local gathering events</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
