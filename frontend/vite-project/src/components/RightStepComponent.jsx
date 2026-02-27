import React, { forwardRef } from 'react';

const RightStepComponent = forwardRef(function RightStepComponent(
  { className = '', style = undefined },
  ref
) {
  return (
    <img
      ref={ref}
      src="/step-right-removebg-preview.png"
      alt=""
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
});

export default RightStepComponent;
