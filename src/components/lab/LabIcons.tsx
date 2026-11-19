// Ícones de traço do Lab (mesmo estilo de src/components/Icons.tsx).
type P = { className?: string; size?: number };
const svg = (d: React.ReactNode) =>
  function Icon({ className, size = 20 }: P) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
        {d}
      </svg>
    );
  };

export const IHome = svg(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>);
export const ICalc = svg(<><rect x="5" y="2.5" width="14" height="19" rx="2.5" /><path d="M8.5 7h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" /></>);
export const IBox = svg(<><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8M12 13v8" /></>);
export const ISale = svg(<><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" /><circle cx="10" cy="20.5" r="1" /><circle cx="17" cy="20.5" r="1" /></>);
export const IReceipt = svg(<><path d="M5 2.5h14v19l-3-2-2 2-2-2-2 2-2-2-3 2Z" /><path d="M9 8h6M9 12h6" /></>);
export const IChart = svg(<><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></>);
export const IWrench = svg(<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 1-5-5L13 2.4a4 4 0 0 0-5.6 5.6L3 12.5 5.5 15" />);
export const IPlay = svg(<><circle cx="12" cy="12" r="9.5" /><path d="m10 8.5 5 3.5-5 3.5Z" /></>);
export const IUser = svg(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>);
export const IMenu = svg(<path d="M4 6h16M4 12h16M4 18h16" />);
export const ISun = svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>);
export const IMoon = svg(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />);
export const IX = svg(<path d="M6 6l12 12M18 6 6 18" />);
export const IPlus = svg(<path d="M12 5v14M5 12h14" />);
export const ITrash = svg(<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />);
export const ICopy = svg(<><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>);
export const IEdit = svg(<path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4" />);
export const IWhats = svg(<path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3 3l-4.5 1.5ZM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a5 5 0 0 1-2.3-2.3l.8-1-1-2Z" />);
export const IPrinter = svg(<><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v7H7z" /></>);
export const IDoc = svg(<><path d="M6 2.5h8l4 4v15H6Z" /><path d="M14 2.5v4h4M9 12h6M9 16h6" /></>);
export const ILink = svg(<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />);
export const IBag = svg(<><path d="M5 8h14l-1 13H6Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>);
