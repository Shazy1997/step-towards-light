import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Step Towards the Light</title>
        <meta name='description' content='Islamic motivational and guidance platform' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <header className='bg-green-700'>
        <nav className='container mx-auto px-4 py-3'>
          <ul className='flex space-x-4 text-white'>
            <li><a href='/'>Home</a></li>
            <li><a href='/about'>About</a></li>
            <li><a href='/content'>Content</a></li>
            <li><a href='/community'>Community</a></li>
            <li><a href='/events'>Events</a></li>
            <li><a href='/shop'>Shop</a></li>
          </ul>
        </nav>
      </header>
      <main className='font-inter'>{children}</main>
      <footer className='bg-gray-100 mt-8'>
        <div className='container mx-auto px-4 py-6 text-center'>
          <p>© 2025 Step Towards the Light. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
