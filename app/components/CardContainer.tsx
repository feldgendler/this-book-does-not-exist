import React from 'react'

const CardContainer = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="card card-bordered border-4 border-black w-1/2 aspect-w-2 aspect-h-3 flex flex-col justify-start items-center bg-white">
      {children}
    </div>
  )
}

export default CardContainer