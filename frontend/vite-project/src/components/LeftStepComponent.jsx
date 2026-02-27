import React, { forwardRef } from 'react';

const LeftStepComponent = forwardRef(function LeftStepComponent(
  { className = '', style = undefined },
  ref
) {
  return (
    <img
      ref={ref}
      src="/step-left-removebg-preview.png"
      alt=""
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
});

export default LeftStepComponent;
