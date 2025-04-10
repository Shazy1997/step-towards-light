import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold mb-6'>About Us</h1>
        <div className='prose lg:prose-xl'>
          <p className='mb-4'>
            Step Towards the Light is a community-driven platform dedicated to sharing authentic Islamic knowledge 
            and inspiration. Our mission is to provide accessible, reliable, and engaging content that helps 
            Muslims strengthen their faith and understanding.
          </p>
          <h2 className='text-2xl font-semibold mt-8 mb-4'>Our Mission</h2>
          <p className='mb-4'>
            We strive to create a welcoming space where seekers of knowledge can find guidance, support, and 
            inspiration through carefully curated content from qualified scholars and engaging community 
            interactions.
          </p>
          <h2 className='text-2xl font-semibold mt-8 mb-4'>Our Team</h2>
          <p className='mb-4'>
            We are a group of young Muslims passionate about sharing authentic knowledge and creating 
            meaningful connections within our community. Our team works diligently to ensure that all 
            content meets high standards of authenticity and relevance.
          </p>
        </div>
      </div>
    </Layout>
  );
}
