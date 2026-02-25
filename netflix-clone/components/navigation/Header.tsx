'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { RxMagnifyingGlass, RxHamburgerMenu, RxCross2 } from 'react-icons/rx';
import SearchModal from './SearchModal';

const navLinks = [
  { title: 'Home', href: '/' },
  { title: 'Series', href: '/series' },
  { title: 'Movies', href: '/movies' },
  { title: 'New & Popular', href: '/new_and_popular' },
  { title: 'My List', href: '/my-list' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <nav className="flex flex-col">
        <div className="flex items-center justify-between p-4">
          <div className="text-red-600 font-bold text-xl">
            <Link href="/">Netflix Clone</Link>
          </div>

          <ul className="hidden md:flex items-center gap-4">
            {navLinks.map(link => (
              <li key={link.title}>
                <Link
                  href={link.href}
                  className="hover:text-red-500 transition-colors"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <RxMagnifyingGlass
              className="text-xl cursor-pointer hover:text-red-500 transition-colors"
              onClick={() => setIsSearchOpen(true)}
            />
            <button
              className="md:hidden text-xl cursor-pointer hover:text-red-500 transition-colors"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <RxCross2 /> : <RxHamburgerMenu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <ul className="md:hidden flex flex-col bg-black/90 px-4 pb-4 gap-3">
            {navLinks.map(link => (
              <li key={link.title}>
                <Link
                  href={link.href}
                  className="block py-2 border-b border-white/10 hover:text-red-500 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

export default Header;
