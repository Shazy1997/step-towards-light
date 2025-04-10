import Layout from '../components/Layout';

export default function Community() {
  return (
    <Layout>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold mb-6'>Our Community</h1>
        
        {/* Discord Integration */}
        <div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Join Our Discord</h2>
          <div className='bg-gray-100 rounded-lg p-4 h-96 flex items-center justify-center'>
            {/* Discord widget placeholder */}
            <p className='text-gray-500'>Discord Widget Placeholder</p>
          </div>
        </div>

        {/* Community Features */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-xl font-semibold mb-4'>Live Discussions</h3>
            <p className='text-gray-600'>
              Join our weekly live discussions on various Islamic topics with scholars and community members.
            </p>
          </div>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-xl font-semibold mb-4'>Study Circles</h3>
            <p className='text-gray-600'>
              Participate in regular study circles focused on Quran, Hadith, and Islamic history.
            </p>
          </div>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-xl font-semibold mb-4'>Q&A Sessions</h3>
            <p className='text-gray-600'>
              Get your questions answered by knowledgeable community members and verified scholars.
            </p>
          </div>
        </div>

        {/* Community Guidelines */}
        <div className='mt-12 bg-white rounded-lg shadow-lg p-6'>
          <h2 className='text-2xl font-semibold mb-4'>Community Guidelines</h2>
          <div className='prose max-w-none'>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Maintain respect and adab in all interactions</li>
              <li>Verify information before sharing</li>
              <li>Follow the guidance of moderators</li>
              <li>Support and encourage fellow community members</li>
              <li>Keep discussions focused on beneficial knowledge</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
