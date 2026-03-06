import React, { useEffect, useRef, useState } from 'react';
import LeftStepComponent from './LeftStepComponent';
import RightStepComponent from './RightStepComponent';

export default function Footsteps() {
  const startTop = 12;
  const stepGap = 4.2;
  const maxTop = 93;
  const sideYOffset = 0.6;
  const curveAmplitude = 0;
  const [layoutScale, setLayoutScale] = useState(1);
  const baseCurve = 260 * layoutScale;
  const curveFrequency = 0.22;
  const curvePhase = Math.PI / 2;
  const leftBaseRotate = 0;
  const rightBaseRotate = 0;
  const curveAngleMultiplier = 0;
  const angleSample = 0.45;
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [timeProgressMs, setTimeProgressMs] = useState(0);
  // Manual per-step overrides. Example:
  // 1: { rotate: 10, offsetX: -10, offsetY: 6 }, // rotate is an offset
  // 2: { curve: 140, offsetX: 20 }, // curve is an offset from baseCurve
  const stepOverrides = {
    16: { curve: -120, rotate: 50, offsetX: -70, offsetY: -50 },
    17: { curve: -120, rotate: 50, offsetX: -110, offsetY: -100 },
    18: { curve: -120, rotate: -10, offsetX: -290, offsetY: 320 },
19:{curve: -120, rotate: -10, offsetX: -290, offsetY: 280 },
20:{curve: -120, rotate: -10, offsetX: -290, offsetY: 420 },

};
  const subSteps = 0;

  const getOverride = (index) => {
    if (Number.isInteger(index)) {
      return stepOverrides[index] ?? null;
    }
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    if (lowerIndex === upperIndex) return null;
    const lower = stepOverrides[lowerIndex];
    const upper = stepOverrides[upperIndex];
    if (!lower || !upper) return null;
    const t = index - lowerIndex;
    return {
      curve: lower.curve + (upper.curve - lower.curve) * t,
      rotate: lower.rotate + (upper.rotate - lower.rotate) * t,
    };
  };

  const getCurveValue = (index) => {
    const override = getOverride(index);
    if (override && typeof override.curve === 'number') {
      return baseCurve + override.curve * layoutScale;
    }
    return Math.sin(index * curveFrequency + curvePhase) * curveAmplitude;
  };

  const getCurveAngle = (index) => {
    const prev = getCurveValue(index - angleSample);
    const next = getCurveValue(index + angleSample);
    const dx = next - prev;
    const dy =
      ((angleSample * 2 * stepGap) / 100) *
      (containerHeight || containerRef.current?.getBoundingClientRect().height || 1);
    return (Math.atan2(dx, dy) * 180) / Math.PI;
  };

  const buildStep = (index, top, sequenceIndex) => {
    const override = getOverride(index);
    const curve = baseCurve + (override?.curve ?? 0) * layoutScale;
    const offsetX = (override?.offsetX ?? 0) * layoutScale;
    const offsetY = (override?.offsetY ?? 0) * layoutScale;
    const side = override?.side ?? (sequenceIndex % 2 === 0 ? 'left' : 'right');
    const baseRotate = side === 'left' ? leftBaseRotate : rightBaseRotate;
    const rotate =
      baseRotate + (override?.rotate ?? 0) + getCurveAngle(index) * curveAngleMultiplier;
    const adjustedTop = top + (side === 'right' ? sideYOffset : 0);
    return {
      id: sequenceIndex,
      side,
      top: adjustedTop,
      curve,
      rotate,
      offsetX,
      offsetY,
      delay: sequenceIndex * 120,
      showLabel: false,
      label: 0,
    };
  };

  const steps = [];
  const stepCount = Math.floor((maxTop - startTop) / stepGap) + 1;
  for (let i = 0; i < stepCount; i += 1) {
    const stepNumber = i + 1;
    const top = startTop + i * stepGap;
    steps.push(buildStep(stepNumber, top, i));

    if (subSteps === 0 || i === stepCount - 1) continue;
    const nextTop = startTop + (i + 1) * stepGap;
    for (let s = 1; s <= subSteps; s += 1) {
      const ratio = s / (subSteps + 1);
      const t = stepNumber + ratio;
      const topSub = top + (nextTop - top) * ratio;
      steps.push(buildStep(t, topSub, steps.length));
    }
  }

  const orderById = new Map();
  [...steps]
    .sort((a, b) => a.top - b.top || a.id - b.id)
    .forEach((step, orderIndex) => {
      orderById.set(step.id, orderIndex);
    });

  useEffect(() => {
    let rafId = null;
    const updateHeight = () => {
      if (!containerRef.current) return;
      setContainerHeight(containerRef.current.getBoundingClientRect().height);
    };
    const updateScale = () => {
      const width = window.innerWidth || 1200;
      if (width <= 600) {
        setLayoutScale(0.35);
      } else if (width <= 900) {
        setLayoutScale(0.6);
      } else {
        setLayoutScale(1);
      }
    };
    updateHeight();
    updateScale();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  useEffect(() => {
    let rafId = null;
    const start = performance.now();
    const totalSteps = steps.length || 1;
    const perStepDelay = 140;
    const fadeInDuration = 420;
    const visibleDuration = 1800;
    const fadeOutDuration = 520;
    const loopDuration =
      totalSteps * perStepDelay + fadeInDuration + visibleDuration + fadeOutDuration + 800;

    const tick = (now) => {
      const elapsed = now - start;
      setTimeProgressMs(elapsed % loopDuration);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="center-steps" aria-hidden="true" ref={containerRef}>
      {steps.map((step, index) => {
        const className = `center-step ${step.side === 'left' ? 'step-left' : 'step-right'}`;
        const perStepDelay = 220;
        const fadeInDuration = 700;
        const visibleDuration = 2400;
        const fadeOutDuration = 800;
        const stepStart = index * perStepDelay;
        const stepEnd = stepStart + fadeInDuration + visibleDuration + fadeOutDuration;
        let stepOpacity = 0;
        if (timeProgressMs <= stepStart) {
          stepOpacity = 0;
        } else if (timeProgressMs <= stepStart + fadeInDuration) {
          stepOpacity = (timeProgressMs - stepStart) / fadeInDuration;
        } else if (timeProgressMs <= stepStart + fadeInDuration + visibleDuration) {
          stepOpacity = 1;
        } else if (timeProgressMs <= stepEnd) {
          stepOpacity = 1 - (timeProgressMs - (stepStart + fadeInDuration + visibleDuration)) / fadeOutDuration;
        } else {
          stepOpacity = 0;
        }
        const style = {
          top: `${step.top}%`,
          '--step-curve': `${step.curve}px`,
          '--step-rotate': `${step.rotate}deg`,
          '--step-offset-x': `${step.offsetX}px`,
          '--step-offset-y': `${step.offsetY}px`,
          opacity: stepOpacity,
          transition: 'opacity 300ms ease',
        };
        const boxClass = `step-box ${step.side === 'left' ? 'box-left' : 'box-right'}`;
        const labelClass = `step-label ${step.side === 'left' ? 'step-label-left' : 'step-label-right'}`;
        return (
          <React.Fragment key={index}>
            <div className={boxClass} style={style} />
            {step.showLabel ? (
              <span className={labelClass} style={style}>
                {(orderById.get(step.id) ?? 0) + 1}
              </span>
            ) : null}
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
