import React from 'react';
import LeftStepComponent from './LeftStepComponent';
import RightStepComponent from './RightStepComponent';

export default function Footsteps() {
  const startTop = 12;
  const stepGap = 1.8;
  const maxTop = 94;
  const sideYOffset = 0.6;
  const curveAmplitude = 90;
  const curveFrequency = 0.22;
  const curvePhase = Math.PI / 2;
  const rotateAmplitude = 34;
  // Manual per-step overrides. Example:
  // 1: { rotate: 28, offsetX: -10, offsetY: 6 },
  // 2: { curve: 140, offsetX: 20 },
  const stepOverrides = {
    15: { rotate: -30, curve: -10 },
    16: { rotate: -30, curve: -10 },
    17: { rotate: -30, curve: 40 },
    18: { rotate: -30, curve: 40 },
    19: { rotate: -45, curve: 110 },
    20: { rotate: -45, curve: 110 },
    21: { rotate: -55, curve: 160 },
    22: { rotate: -50, curve: 180 },
    23: { rotate: -5, curve: 240 },
    24: { rotate: 29, curve: 200 },
    25: { rotate: 39, curve: 240 },
    26: { rotate: 39, curve: 175 },
    27: { rotate: 39, curve: 195 },
    28: { rotate: 39, curve: 145 },
    29: { rotate: 28, curve: 120 },
    30: { rotate: 18, curve: 90 },
  };
  const subSteps = 1;

  const buildStep = (index, top, sequenceIndex, allowOverride) => {
    const override = allowOverride ? stepOverrides[index] : null;
    const curveBase = Math.sin(index * curveFrequency + curvePhase) * curveAmplitude;
    const rotateBase = Math.cos(index * curveFrequency + curvePhase) * rotateAmplitude;
    const curve = override?.curve ?? curveBase;
    const rotate = override?.rotate ?? rotateBase;
    const offsetX = override?.offsetX ?? 0;
    const offsetY = override?.offsetY ?? 0;
    const side = override?.side ?? (sequenceIndex % 2 === 0 ? 'left' : 'right');
    const adjustedTop = top + (side === 'right' ? sideYOffset : 0);
    return {
      side,
      top: adjustedTop,
      curve,
      rotate,
      offsetX,
      offsetY,
      delay: sequenceIndex * 120,
    };
  };

  const baseSteps = [];
  for (let i = 0, top = startTop; top <= maxTop; i += 1, top = startTop + i * stepGap) {
    baseSteps.push({ index: i, top });
  }

  const steps = [];
  let sequenceIndex = 0;
  for (let i = 0; i < baseSteps.length; i += 1) {
    const base = baseSteps[i];
    steps.push(buildStep(base.index, base.top, sequenceIndex, true));
    sequenceIndex += 1;

    if (i === baseSteps.length - 1) continue;
    const nextTop = baseSteps[i + 1].top;
    for (let s = 1; s <= subSteps; s += 1) {
      const ratio = s / (subSteps + 1);
      const t = base.index + ratio;
      const top = base.top + (nextTop - base.top) * ratio;
      steps.push(buildStep(t, top, sequenceIndex, false));
      sequenceIndex += 1;
    }
  }

  return (
    <div className="center-steps" aria-hidden="true">
      {steps.map((step, index) => {
        const className = `center-step ${step.side === 'left' ? 'step-left' : 'step-right'}`;
        const style = {
          top: `${step.top}%`,
          '--step-curve': `${step.curve}px`,
          '--step-rotate': `${step.rotate}deg`,
          '--step-offset-x': `${step.offsetX}px`,
          '--step-offset-y': `${step.offsetY}px`,
        };
        const boxClass = `step-box ${step.side === 'left' ? 'box-left' : 'box-right'}`;
        return (
          <React.Fragment key={index}>
            <div className={boxClass} style={style} />
            {step.side === 'left' ? (
              <LeftStepComponent
                className={className}
                style={{ ...style, transitionDelay: `${step.delay}ms` }}
              />
            ) : (
              <RightStepComponent
                className={className}
                style={{ ...style, transitionDelay: `${step.delay}ms` }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
