import React from 'react'
import Image from 'next/image';

const NotFoundPage = () => {
  return (
    <div className='not-found-page'>
      <Image
        src={'/icons/not-found.svg'}
        alt='notfound'
        className='cursor-pointer'
        width={64}
        height={64}
      />
      <h2>404!</h2>
      <p>Oops! this page is not found! the link might be corrupted</p>
    </div>
  )
}

export default NotFoundPage
