import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold mb-6'>Welcome to Step Towards the Light</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold mb-4'>Featured Content</h2>
            <p>Discover inspiring Islamic content curated just for you.</p>
          </div>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold mb-4'>Latest Videos</h2>
            <p>Watch the latest scholarly discussions and lectures.</p>
          </div>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold mb-4'>Community</h2>
            <p>Join our growing community of seekers of knowledge.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
