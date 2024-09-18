import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className='flex-col flex mt-60'>
      <h2 className='text-6xl font-loves font-bold text-center'>404</h2>
      <p className='text-4xl font-loves font-bold text-center'>Page Not Found</p>
      <p className='text-2xl font-loves font-bold text-center'>So Sorry About That...</p>
      <Link href="/timeline" className='text-2xl text-links hover:underline text-center font-loves font-bold active:text-black'>Return to Timeline</Link>
    </div>
  )
}