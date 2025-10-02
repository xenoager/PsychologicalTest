import React from 'react'
export default function Progress({ value }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
      <div style={{ width: `${value}%` }} />
    </div>
  )
}
