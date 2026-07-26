// import { NavLink } from 'react-router-dom';

// const Spine = () => {
//   return (
//     <nav className="spine">
//       <div className="spine__mark">Marginalia</div>
//       <div className="spine__nav">
//         <NavLink
//           to="/dashboard"
//           className={({ isActive }) => `spine__link${isActive ? ' spine__link--active' : ''}`}
//         >
//           Notes
//         </NavLink>
//         <NavLink
//           to="/profile"
//           className={({ isActive }) => `spine__link${isActive ? ' spine__link--active' : ''}`}
//         >
//           Profile
//         </NavLink>
//       </div>
//     </nav>
//   );
// };

// export default Spine;


import { NavLink } from 'react-router-dom';

const linkClasses = (isActive: boolean) =>
  `w-14 h-14 stack:w-11 stack:h-11 rounded-card flex flex-col items-center justify-center gap-1 text-[11px] font-mono text-white/55 no-underline border-0 cursor-pointer bg-transparent transition-colors duration-150 hover:bg-white/[0.08] hover:text-paper ${
    isActive ? 'bg-white/[0.08] text-paper' : ''
  }`;

const Spine = () => {
  return (
    <nav className="w-[88px] stack:w-full bg-ink text-paper flex flex-col stack:flex-row items-center py-6 stack:py-3 stack:px-4 shrink-0">
      <div className="font-display text-[26px] font-bold [writing-mode:vertical-rl] rotate-180 stack:[writing-mode:horizontal-tb] stack:rotate-0 mb-10 stack:mb-0 stack:mr-auto tracking-[0.04em]">
        Marginalia
      </div>
      <div className="flex flex-col stack:flex-row gap-2 flex-1">
        <NavLink to="/dashboard" className={({ isActive }) => linkClasses(isActive)}>
          Notes
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => linkClasses(isActive)}>
          Profile
        </NavLink>
      </div>
    </nav>
  );
};

export default Spine;