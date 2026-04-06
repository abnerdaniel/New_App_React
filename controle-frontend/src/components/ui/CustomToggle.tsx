import { useId } from 'react';
import './Toggle.css';

export function CustomToggle({ active, onClick }: { active: boolean, onClick: () => void }) {
  const reactId = useId();
  const idStr = reactId.replace(/:/g, '');
  const id = `cbx-${idStr}`;
  
  return (
    <div className="checkbox-wrapper-12" onClick={(e) => e.stopPropagation()}>
      <div className="cbx">
        <input 
            type="checkbox" 
            id={id} 
            checked={active} 
            onChange={onClick} 
        />
        <label htmlFor={id}></label>
        <svg fill="none" viewBox="0 0 15 14" height="14" width="15">
          <path d="M2 8.36364L6.23077 12L13 2"></path>
        </svg>
      </div>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" className="absolute w-0 h-0">
        <defs>
          <filter id={`goo-${idStr}`}>
            <feGaussianBlur result="blur" stdDeviation="4" in="SourceGraphic"></feGaussianBlur>
            <feColorMatrix result={`goo-${idStr}`} values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7" mode="matrix" in="blur"></feColorMatrix>
            <feBlend in2={`goo-${idStr}`} in="SourceGraphic"></feBlend>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
