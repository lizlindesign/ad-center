import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const PAGE_TO_SOLUTION = {
  'sponsored-search': 'Sponsored Search',
  'display-advertising': 'Display Advertising',
  'shop-builder': 'Shop Builder',
  'store-ads': 'Store Ads',
  'unified-reports': 'Unified Reports',
};

function getButtonLabel(currentPage) {
  const sol = PAGE_TO_SOLUTION[currentPage];
  if (sol === 'Display Advertising') return 'Store Ads';
  return sol || 'Store Ads';
}

export default function MediaSolutionsDropdown({ currentPage, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const current = PAGE_TO_SOLUTION[currentPage];

  const go = (page) => { onNavigate(page); setIsOpen(false); };

  const cardCls = (page) =>
    `flex flex-col items-center justify-center p-3 rounded border transition-colors min-h-[100px] ${
      currentPage === page
        ? 'border-[#0053E2] bg-blue-50'
        : 'border-slate-200 hover:border-[#0053E2]'
    }`;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="flex items-center gap-1 text-xs hover:bg-slate-100 px-2 py-1 rounded transition-colors text-slate-800"
      >
        <span>{getButtonLabel(currentPage)}</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-lg border border-slate-200 shadow-lg z-50">
            <div className="p-4">
              <h3 className="text-sm font-extrabold text-slate-900 mb-2">Media solutions</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">

                {/* Sponsored Search */}
                <button onClick={() => go('sponsored-search')} className={cardCls('sponsored-search')}>
                  <div className="w-12 h-12 mb-2 relative">
                    <div className="w-8 h-8 rounded bg-sky-400 absolute left-1 top-0" />
                    <div className="w-8 h-8 rounded bg-[#001E60] absolute left-0 top-1 flex items-center justify-center">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-xs text-slate-900 text-center">Sponsored Search</span>
                </button>

                {/* Display Advertising */}
                <button onClick={() => go('display-advertising')} className={cardCls('display-advertising')}>
                  <div className="w-12 h-12 mb-2">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="7" y="7" width="34" height="34" rx="3" fill="#001E60"/>
                      <path d="M12 18.9997C12 18.4474 12.4477 17.9997 13 17.9997H16V24.9997H13C12.4477 24.9997 12 24.552 12 23.9997V18.9997Z" fill="white"/>
                      <path d="M14 17.9997C14 17.4474 14.4477 16.9997 15 16.9997H21V25.9997H15C14.4477 25.9997 14 25.552 14 24.9997V17.9997Z" fill="#29B8FF"/>
                      <path d="M36.5 21.5C36.5 23.433 34.933 25 33 25C31.067 25 29.5 23.433 29.5 21.5C29.5 19.567 31.067 18 33 18C34.933 18 36.5 19.567 36.5 21.5Z" fill="#29B8FF"/>
                      <path d="M23 16.9998L33.1715 13.4621C33.8213 13.236 34.5 13.7185 34.5 14.4066V28.5936C34.5 29.2816 33.8214 29.7641 33.1716 29.5382L22.9937 25.9998L23 16.9998Z" fill="white"/>
                      <path d="M16.0001 25.9997H20.997L22.7383 32.9649C22.8697 33.4905 22.4721 33.9997 21.9303 33.9997H18.6503C18.2681 33.9997 17.935 33.7396 17.8423 33.3689L16.0001 25.9997Z" fill="white"/>
                    </svg>
                  </div>
                  <span className="text-xs text-slate-900 text-center">Display Advertising</span>
                </button>

                {/* Shop Builder */}
                <button onClick={() => go('shop-builder')} className={cardCls('shop-builder')}>
                  <div className="w-12 h-12 mb-2">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 20H38V39C38 40.6569 36.6569 42 35 42H13C11.3431 42 10 40.6569 10 39V20Z" fill="#001E60"/>
                      <path d="M23.8058 26.1225C23.8804 25.9592 24.1196 25.9592 24.1942 26.1225L25.913 29.8845C25.9438 29.952 26.0096 29.9983 26.0854 30.0059L30.3091 30.4273C30.4925 30.4456 30.5664 30.6659 30.4291 30.7852L27.2677 33.5316C27.211 33.5809 27.1859 33.6558 27.2019 33.728L28.0934 37.7504C28.1321 37.9251 27.9386 38.0613 27.7792 37.9716L24.1066 35.907C24.0407 35.87 23.9593 35.87 23.8934 35.907L20.2208 37.9716C20.0613 38.0613 19.8679 37.9251 19.9066 37.7505L20.7981 33.728C20.8141 33.6558 20.789 33.5809 20.7323 33.5316L17.5709 30.7852C17.4336 30.6659 17.5076 30.4456 17.6909 30.4273L21.9146 30.0059C21.9904 29.9983 22.0562 29.952 22.087 29.8845L23.8058 26.1225Z" fill="white"/>
                      <path d="M10 23.5C11.933 23.5 13.5 21.933 13.5 20H6.5C6.5 21.933 8.067 23.5 10 23.5Z" fill="#0053E2"/>
                      <path d="M17 23.5C18.933 23.5 20.5 21.933 20.5 20H13.5C13.5 21.933 15.067 23.5 17 23.5Z" fill="#29B8FF"/>
                      <path d="M24 23.5C25.933 23.5 27.5 21.933 27.5 20H20.5C20.5 21.933 22.067 23.5 24 23.5Z" fill="#0053E2"/>
                      <path d="M31 23.5C32.933 23.5 34.5 21.933 34.5 20H27.5C27.5 21.933 29.067 23.5 31 23.5Z" fill="#29B8FF"/>
                      <path d="M38 23.5C39.933 23.5 41.5 21.933 41.5 20H34.5C34.5 21.933 36.067 23.5 38 23.5Z" fill="#0053E2"/>
                      <path d="M10.7068 6.40864C10.9661 5.57107 11.7406 5 12.6174 5H35.3825C36.2593 5 37.0339 5.57106 37.2931 6.40863L41.5 20H6.5L10.7068 6.40864Z" fill="white"/>
                      <path d="M10.5724 6.4253C10.8262 5.57934 11.6048 5 12.4881 5H16L13.5 20H6.5L10.5724 6.4253Z" fill="#29B8FF"/>
                      <path d="M21.5 5H26.5L27.5 20H20.5L21.5 5Z" fill="#29B8FF"/>
                      <path d="M32 5H35.5119C36.3952 5 37.1738 5.57934 37.4276 6.4253L41.5 20H34.5L32 5Z" fill="#29B8FF"/>
                    </svg>
                  </div>
                  <span className="text-xs text-slate-900 text-center">Shop Builder</span>
                </button>

                {/* Store Ads */}
                <button onClick={() => go('store-ads')} className={cardCls('store-ads')}>
                  <div className="w-12 h-12 mb-2">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 15C7 13.3431 8.34315 12 10 12H13.4585C14.1331 12 14.788 11.7726 15.3174 11.3546L22.7607 5.47838C23.4873 4.90474 24.5127 4.90474 25.2393 5.47839L32.6826 11.3546C33.212 11.7726 33.8669 12 34.5415 12H38C39.6569 12 41 13.3431 41 15V38C41 39.6569 39.6569 41 38 41H10C8.34315 41 7 39.6569 7 38V15Z" fill="#001E60"/>
                      <circle cx="24" cy="26" r="9" fill="white"/>
                      <path d="M21 22.1465V30.3535C21 30.745 21.4296 30.9846 21.7627 30.7789L28.4065 26.6754C28.7228 26.48 28.7228 26.02 28.4065 25.8246L21.7627 21.7211C21.4296 21.5154 21 21.755 21 22.1465Z" fill="#29B8FF"/>
                    </svg>
                  </div>
                  <span className="text-xs text-slate-900 text-center">Store Ads</span>
                </button>

                {/* Unified Reports — full width */}
                <button onClick={() => go('unified-reports')} className={`${cardCls('unified-reports')} col-span-2`}>
                  <div className="w-12 h-12 mb-2">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="7" y="7" width="34" height="34" rx="3" fill="#001E60"/>
                      <path d="M12 24.9267V34.5C12 35.0523 12.4477 35.5 13 35.5H35C35.5523 35.5 36 35.0523 36 34.5V16.5113C36 16.1902 35.8458 15.8886 35.5855 15.7006L32.1375 13.2104C31.7634 12.9403 31.253 12.9612 30.9022 13.261L22.8004 20.1874C22.5693 20.385 22.2609 20.4667 21.9624 20.4095L17.7246 19.5972C17.4064 19.5362 17.0784 19.6332 16.8445 19.8574L12.3081 24.2047C12.1113 24.3934 12 24.6541 12 24.9267Z" fill="white"/>
                      <path d="M12 26.5936V34.5C12 35.0523 12.4477 35.5 13 35.5H35C35.5523 35.5 36 35.0523 36 34.5V20.6499C36 20.2547 35.7673 19.8966 35.4061 19.7361L32.0473 18.2432C31.7103 18.0935 31.3183 18.1413 31.0272 18.3677L22.9528 24.6478C22.6723 24.866 22.2973 24.9189 21.9674 24.787L17.937 23.1748C17.6602 23.0641 17.3485 23.0826 17.0868 23.2254L12.5211 25.7157C12.1999 25.891 12 26.2277 12 26.5936Z" fill="#4DBDF5"/>
                      <path d="M12 31.6876V35C12 35.5523 12.4477 36 13 36H35C35.5523 36 36 35.5523 36 35V29.5785C36 29.2206 35.8087 28.89 35.4985 28.7116L31.2914 26.2926C30.9773 26.1119 30.59 26.1154 30.2791 26.3016L22.8522 30.75C22.5887 30.9078 22.2673 30.9358 21.9804 30.8258L17.5753 29.1372C17.3449 29.0489 17.0899 29.0489 16.8595 29.1372L12.6421 30.7539C12.2553 30.9021 12 31.2734 12 31.6876Z" fill="#0053E2"/>
                    </svg>
                  </div>
                  <span className="text-xs text-slate-900 text-center">Unified Reports</span>
                </button>
              </div>

              <h3 className="text-sm font-extrabold text-slate-900 mb-2">Tools and help</h3>
              <div className="flex flex-col gap-2">

                {/* Billing Manager */}
                <button onClick={() => go('billing-manager')} className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:border-[#0053E2] transition-colors">
                  <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                    <svg width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="15" height="10" rx="1" fill="#E3E4E5"/>
                      <rect x="0" y="1" width="15" height="3" fill="#171819"/>
                      <rect x="1" y="6" width="4" height="3" rx="0.5" fill="#90B5F9"/>
                    </svg>
                  </div>
                  <span className="text-xs text-slate-900">Billing Manager</span>
                </button>

                {/* Associate Tools */}
                <button onClick={() => go('associate-tools')} className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:border-[#0053E2] transition-colors">
                  <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="10" fill="#C3E7EF"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M16.1229 4.928C16.3784 5.47725 16.3422 6.14398 15.9698 6.67587C15.5829 7.2284 14.9352 7.48978 14.3095 7.41013L6.73269 14.9869C6.8077 15.5146 6.64226 16.0699 6.23637 16.4758C5.55121 17.1609 4.44036 17.1609 3.7552 16.4758C3.07005 15.7906 3.07005 14.6798 3.7552 13.9946C4.16103 13.5888 4.71622 13.4233 5.24383 13.4983L12.7995 5.94265C12.7313 5.50965 12.8242 5.05068 13.0954 4.66325C13.4679 4.1313 14.0821 3.86922 14.6857 3.92151L13.814 5.1664L15.2512 6.17272L16.1229 4.928Z" fill="#909196"/>
                    </svg>
                  </div>
                  <span className="text-xs text-slate-900">Associate tools</span>
                </button>

                {/* Component Library */}
                <button onClick={() => go('component-library')} className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:border-[#0053E2] transition-colors">
                  <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="10" fill="#C3E7EF"/>
                      <path d="M6 6H8V8H6V6Z" fill="#909196"/>
                      <path d="M9 6H11V8H9V6Z" fill="#909196"/>
                      <path d="M12 6H14V8H12V6Z" fill="#909196"/>
                      <path d="M6 9H8V11H6V9Z" fill="#909196"/>
                      <path d="M9 9H11V11H9V9Z" fill="#909196"/>
                      <path d="M12 9H14V11H12V9Z" fill="#909196"/>
                      <path d="M6 12H8V14H6V12Z" fill="#909196"/>
                      <path d="M9 12H11V14H9V12Z" fill="#909196"/>
                      <path d="M12 12H14V14H12V12Z" fill="#909196"/>
                    </svg>
                  </div>
                  <span className="text-xs text-slate-900">Component Library</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
